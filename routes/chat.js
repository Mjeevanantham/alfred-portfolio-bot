const express = require('express');
const { body, validationResult } = require('express-validator');
const Alfred = require('../services/alfred');

const router = express.Router();

// POST /api/chat/message - Send a message to Alfred
router.post(
  '/message',
  [
    body('message').isString().trim().isLength({ min: 1, max: 1000 }),
    body('sessionId').isString().trim().isLength({ min: 10, max: 128 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }

      const { message, sessionId } = req.body;
      const response = await Alfred.processMessage(message, sessionId);
      res.json(response);
      
    } catch (error) {
      console.error('Chat route error:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        message: 'Sorry, I encountered an error. Please try again.'
      });
    }
  }
);

// POST /api/chat/clear - Clear conversation history
router.post(
  '/clear',
  [body('sessionId').isString().trim().isLength({ min: 10, max: 128 })],
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }

      const { sessionId } = req.body;
      Alfred.clearHistory(sessionId);
      res.json({ message: 'Conversation history cleared' });
      
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({ 
        error: 'Failed to clear history' 
      });
    }
  }
);

module.exports = router;
