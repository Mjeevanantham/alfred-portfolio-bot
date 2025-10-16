# 🤖 Alfred - AI Portfolio Assistant

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version">
  <img src="https://img.shields.io/badge/Groq-API-blue.svg" alt="Groq API">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg" alt="Status">
</div>

<div align="center">
  <h3>Meet Alfred - Your Personal AI Assistant for Portfolio Showcase</h3>
  <p>A sophisticated AI chatbot powered by Groq's lightning-fast language models that helps visitors learn about your work, skills, and experience.</p>
</div>

---

## ✨ Features

### 🎯 **Core Capabilities**
- **Intelligent Chat Interface**: Modern, responsive chat UI with real-time messaging
- **Voice Integration**: Speech-to-text input and text-to-speech responses
- **Resume Analysis**: Automatic PDF resume parsing and knowledge extraction
- **Portfolio Scraping**: Intelligent web scraping of your portfolio website
- **Context-Aware Responses**: Remembers conversation history and provides relevant answers
- **Admin Panel**: Secure configuration interface for portfolio owners

### 🎨 **User Experience**
- **Sticky Layout**: Header and input field stay fixed, only messages scroll
- **Real-time Communication**: Socket.io for instant messaging
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Voice Controls**: Optional voice features that can be enabled/disabled
- **Professional UI**: Modern design with smooth animations

### 🔒 **Security & Admin**
- **Admin-only Configuration**: Only portfolio owners can modify settings
- **Password Protection**: Secure admin authentication
- **Separate Interfaces**: Clean separation between user chat and admin controls
- **Environment Security**: API keys stored securely in environment variables

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Groq API key ([Get one here](https://console.groq.com/))
- Your resume in PDF format

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/alfred-portfolio-bot.git
   cd alfred-portfolio-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Groq API key
   ```

4. **Add your resume**
   ```bash
   # Place your resume PDF in the data folder
   cp /path/to/your/resume.pdf data/resume.pdf
   ```

5. **Start Alfred**
   ```bash
   npm start
   ```

6. **Access Alfred**
   - **Main Chat**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin.html

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
ADMIN_PASSWORD=your_secure_password

# Optional
PORT=3000
NODE_ENV=development
PORTFOLIO_URL=https://your-portfolio-website.com
RESUME_PATH=./data/resume.pdf
```

### Admin Panel Setup

1. **Access Admin Panel**: Navigate to `/admin.html`
2. **Login**: Use your admin password
3. **Upload Resume**: Add your PDF resume
4. **Set Portfolio URL**: Configure your website for scraping
5. **Adjust Settings**: Customize Alfred's personality and voice features

---

## 🎯 Usage Examples

### For Visitors
- "What are Jeeva's main skills?"
- "Tell me about Jeeva's recent projects"
- "What technologies does Jeeva work with?"
- "How can I contact Jeeva?"

### For Portfolio Owners
- Upload and update resume
- Configure portfolio website scraping
- Adjust Alfred's personality and responses
- Monitor knowledge base status

---

## 🏗️ Architecture

```
alfred-portfolio-bot/
├── 📁 routes/           # API endpoints
│   ├── chat.js         # Chat functionality
│   └── admin.js        # Admin configuration
├── 📁 services/         # Core business logic
│   ├── alfred.js       # AI assistant logic
│   └── knowledgeBase.js # Data processing
├── 📁 public/          # Frontend assets
│   ├── index.html      # Main chat interface
│   ├── admin.html      # Admin panel
│   ├── css/           # Stylesheets
│   └── js/            # Frontend JavaScript
├── 📁 data/           # Data storage
│   └── resume.pdf     # Your resume (not in git)
├── server.js          # Main server file
└── package.json       # Dependencies
```

### Technology Stack
- **Backend**: Node.js, Express.js, Socket.io
- **AI**: Groq API with Llama 3.3 70B model
- **Frontend**: Vanilla JavaScript, Custom CSS
- **Data Processing**: PDF parsing, Web scraping
- **Voice**: Web Speech API

---

## 🔧 API Endpoints

### Chat Endpoints
- `POST /api/chat/message` - Send message to Alfred
- `POST /api/chat/clear` - Clear conversation history

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/upload-resume` - Upload resume PDF
- `POST /api/admin/set-portfolio-url` - Set portfolio URL
- `GET /api/admin/status` - Get knowledge base status
- `POST /api/admin/reinitialize` - Reinitialize knowledge base
- `POST /api/admin/update-settings` - Update Alfred's settings

---

## 🎨 Customization

### Alfred's Personality
Modify Alfred's personality in `services/alfred.js`:

```javascript
buildSystemPrompt(context) {
  return `You are Alfred, Jeeva's personal AI assistant...
  // Customize Alfred's personality here
  `;
}
```

### Knowledge Extraction
Enhance data processing in `services/knowledgeBase.js`:
- Add skill detection patterns
- Improve project extraction logic
- Customize experience parsing

### UI Customization
- Modify `public/css/styles.css` for styling
- Update `public/index.html` for layout changes
- Customize `public/js/app.js` for functionality

---

## 🚀 Deployment

### Environment Setup
```env
GROQ_API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
ADMIN_PASSWORD=your_secure_production_password
PORTFOLIO_URL=https://your-production-portfolio.com
```

### Production Considerations
- Use a reverse proxy (nginx)
- Enable HTTPS
- Set up proper logging
- Monitor API usage and costs
- Implement rate limiting

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build CSS
npm run build:css
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Groq](https://groq.com/)** for providing fast AI inference
- **[Socket.io](https://socket.io/)** for real-time communication
- **[Express.js](https://expressjs.com/)** for the server framework
- **[Font Awesome](https://fontawesome.com/)** for beautiful icons

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/alfred-portfolio-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/alfred-portfolio-bot/discussions)
- **Email**: your.email@example.com

---

<div align="center">
  <p><strong>Alfred is ready to serve! 🎩</strong></p>
  <p>Start chatting with your AI assistant and let Alfred showcase your portfolio to visitors.</p>
</div>