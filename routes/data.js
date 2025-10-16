const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { knowledgeBase } = require('../services/knowledgeBase');

const router = express.Router();

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

// POST /api/data/upload-resume - Upload resume PDF
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
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

// POST /api/data/set-portfolio-url - Set portfolio website URL
router.post('/set-portfolio-url', async (req, res) => {
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

// GET /api/data/status - Get knowledge base status
router.get('/status', (req, res) => {
  try {
    res.json({
      initialized: knowledgeBase.initialized,
      hasResume: knowledgeBase.data.resume.length > 0,
      hasPortfolio: knowledgeBase.data.portfolio.length > 0,
      skillsCount: knowledgeBase.data.skills.length,
      projectsCount: knowledgeBase.data.projects.length,
      experienceCount: knowledgeBase.data.experience.length
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ 
      error: 'Failed to get status' 
    });
  }
});

// POST /api/data/reinitialize - Reinitialize knowledge base
router.post('/reinitialize', async (req, res) => {
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

module.exports = router;
