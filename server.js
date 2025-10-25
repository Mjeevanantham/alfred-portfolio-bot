const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Log environment variables (disabled in production)
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment check:');
  console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
  console.log('GROQ_API_KEY length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
  console.log('PORT:', process.env.PORT);
  console.log('ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD);
}

// Ensure environment variables are loaded (run in degraded mode if missing)
if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️  GROQ_API_KEY is missing. Running in fallback mode without LLM.');
  process.env.ALFRED_FALLBACK_MODE = 'true';
}

const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');
const dataRoutes = require('./routes/data');
const { initializeKnowledgeBase } = require('./services/knowledgeBase');
const Alfred = require('./services/alfred');

const app = express();
const server = http.createServer(app);

// Configure allowed CORS origins (comma-separated list) or '*' by default
const allowedOrigins = (process.env.CORS_ORIGINS && process.env.CORS_ORIGINS.trim() !== '')
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : '*';

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Security & middleware
app.disable('x-powered-by');
app.set('trust proxy', 1); // for proper rate limiting behind proxies
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
if (allowedOrigins === '*') {
  app.use(cors());
} else {
  app.use(cors({ origin: allowedOrigins }));
}

// Body parsing with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.static('public'));

// Rate limiters
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);
app.use('/api/data', adminLimiter, dataRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    groqApiKey: process.env.GROQ_API_KEY ? 'set' : 'missing',
    port: process.env.PORT || 3000
  });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('chat-message', async (data) => {
    try {
      if (!data || typeof data.message !== 'string' || typeof data.sessionId !== 'string') {
        socket.emit('alfred-error', {
          message: 'Invalid payload',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const message = data.message.trim();
      const sessionId = data.sessionId.trim();

      if (!message || message.length > 1000 || !sessionId || sessionId.length > 128) {
        socket.emit('alfred-error', {
          message: 'Invalid message or session id',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Process message through Alfred
      const response = await Alfred.processMessage(message, sessionId);
      
      // Send response back to client
      socket.emit('alfred-response', {
        message: response.content,
        timestamp: new Date().toISOString(),
        sessionId: sessionId
      });
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('alfred-error', {
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize knowledge base on startup
async function startServer() {
  try {
    await initializeKnowledgeBase();
    console.log('Knowledge base initialized successfully');
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 JIA Portfolio Bot running on port ${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} to chat with JIA`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
