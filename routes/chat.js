const express = require('express');
const Alfred = require('../services/alfred');

const router = express.Router();

// POST /api/chat/message - Send a message to Alfred
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({ 
        error: 'Message and sessionId are required' 
      });
    }
    
    const response = await Alfred.processMessage(message, sessionId);
    res.json(response);
    
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
});

// POST /api/chat/clear - Clear conversation history
router.post('/clear', (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ 
        error: 'SessionId is required' 
      });
    }
    
    Alfred.clearHistory(sessionId);
    res.json({ message: 'Conversation history cleared' });
    
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ 
      error: 'Failed to clear history' 
    });
  }
});

module.exports = router;
