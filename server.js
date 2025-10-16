const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables first
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Log environment variables
console.log('Environment check:');
console.log('GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('GROQ_API_KEY length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
console.log('PORT:', process.env.PORT);
console.log('ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD);

// Ensure environment variables are loaded
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY environment variable is missing!');
  console.error('Please check your .env file and ensure it contains:');
  console.error('GROQ_API_KEY=your_api_key_here');
  console.error('Current working directory:', process.cwd());
  console.error('Looking for .env file in:', path.join(process.cwd(), '.env'));
  process.exit(1);
}

const chatRoutes = require('./routes/chat');
const dataRoutes = require('./routes/data');
const adminRoutes = require('./routes/admin');
const { initializeKnowledgeBase } = require('./services/knowledgeBase');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('chat-message', async (data) => {
    try {
      const { message, sessionId } = data;
      
      // Process message through Alfred
      const response = await require('./services/alfred').processMessage(message, sessionId);
      
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
      console.log(`🚀 Alfred Portfolio Bot running on port ${PORT}`);
      console.log(`📱 Open http://localhost:${PORT} to chat with Alfred`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
