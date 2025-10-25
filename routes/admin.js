const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult } = require('express-validator');
const { knowledgeBase } = require('../services/knowledgeBase');

const router = express.Router();

// Simple admin authentication (in production, use proper auth)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'alfred2024';

// Middleware to check admin authentication
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  const token = authHeader.substring(7);
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF files for resume
    if (file.fieldname === 'resume' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for resume upload'));
    }
  }
});

// POST /api/admin/login - Admin login
router.post(
  '/login',
  [body('password').isString().isLength({ min: 8, max: 128 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }

      const { password } = req.body;
      
      if (password === ADMIN_PASSWORD) {
        res.json({ 
          success: true,
          message: 'Admin authentication successful',
          token: ADMIN_PASSWORD
        });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
      
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// POST /api/admin/upload-resume - Upload resume PDF (Admin only)
router.post('/upload-resume', authenticateAdmin, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Rename file to resume.pdf
    const oldPath = req.file.path;
    const newPath = path.join('data', 'resume.pdf');
    
    try {
      await fs.rename(oldPath, newPath);
    } catch (error) {
      // File might already exist, try to overwrite
      await fs.unlink(newPath);
      await fs.rename(oldPath, newPath);
    }
    
    // Reinitialize knowledge base with new resume
    await knowledgeBase.initialize();
    
    res.json({ 
      message: 'Resume uploaded successfully',
      filename: req.file.originalname
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload resume',
      message: error.message 
    });
  }
});

// POST /api/admin/set-portfolio-url - Set portfolio website URL (Admin only)
router.post('/set-portfolio-url', authenticateAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Update environment variable (in production, you'd want to persist this)
    process.env.PORTFOLIO_URL = url;
    
    // Reinitialize knowledge base with new URL
    await knowledgeBase.initialize();
    
    res.json({ 
      message: 'Portfolio URL set successfully',
      url: url
    });
    
  } catch (error) {
    console.error('Set URL error:', error);
    res.status(500).json({ 
      error: 'Failed to set portfolio URL',
      message: error.message 
    });
  }
});

// GET /api/admin/status - Get knowledge base status (Admin only)
router.get('/status', authenticateAdmin, (req, res) => {
  try {
    res.json({
      initialized: knowledgeBase.initialized,
      hasResume: knowledgeBase.data.resume.length > 0,
      hasPortfolio: knowledgeBase.data.portfolio.length > 0,
      skillsCount: knowledgeBase.data.skills.length,
      projectsCount: knowledgeBase.data.projects.length,
      experienceCount: knowledgeBase.data.experience.length,
      portfolioUrl: process.env.PORTFOLIO_URL || 'Not set'
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ 
      error: 'Failed to get status' 
    });
  }
});

// POST /api/admin/reinitialize - Reinitialize knowledge base (Admin only)
router.post('/reinitialize', authenticateAdmin, async (req, res) => {
  try {
    await knowledgeBase.initialize();
    res.json({ 
      message: 'Knowledge base reinitialized successfully' 
    });
  } catch (error) {
    console.error('Reinitialize error:', error);
    res.status(500).json({ 
      error: 'Failed to reinitialize knowledge base',
      message: error.message 
    });
  }
});

// POST /api/admin/update-settings - Update JIA's settings (Admin only)
router.post('/update-settings', authenticateAdmin, async (req, res) => {
  try {
    const { voiceEnabled, personality, welcomeMessage } = req.body;
    
    // Update settings (in production, store in database)
    const settings = {
      voiceEnabled: voiceEnabled !== undefined ? voiceEnabled : true,
      personality: personality || 'professional',
      welcomeMessage: welcomeMessage || 'Good day! I\'m JIA, Jeeva\'s personal AI assistant. How may I assist you today?'
    };
    
    // Save settings to file or database
    await fs.writeFile('data/settings.json', JSON.stringify(settings, null, 2));
    
    res.json({ 
      message: 'Settings updated successfully',
      settings: settings
    });
    
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      message: error.message 
    });
  }
});

// GET /api/admin/settings - Get current settings (Admin only)
router.get('/settings', authenticateAdmin, async (req, res) => {
  try {
    let settings = {
      voiceEnabled: true,
      personality: 'professional',
      welcomeMessage: 'Good day! I\'m JIA, Jeeva\'s personal AI assistant. How may I assist you today?'
    };
    
    try {
      const settingsData = await fs.readFile('data/settings.json', 'utf8');
      settings = { ...settings, ...JSON.parse(settingsData) };
    } catch (error) {
      // Settings file doesn't exist, use defaults
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      error: 'Failed to get settings' 
    });
  }
});

module.exports = router;
