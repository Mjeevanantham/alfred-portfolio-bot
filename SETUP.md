# Alfred Portfolio Bot - Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Groq API key (get one at https://console.groq.com/)

## Installation Steps

### 1. Clone and Install

```bash
# Navigate to your project directory
cd JeevaBot

# Install dependencies
npm install
```

### 2. Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your API key
# Replace 'your_groq_api_key_here' with your actual key
```

Your `.env` file should look like:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
PORT=3000
NODE_ENV=development
PORTFOLIO_URL=https://your-portfolio-website.com
RESUME_PATH=./data/resume.pdf
```

### 4. Add Your Resume (Optional)

Place your resume PDF in the `data/` folder:
```bash
# Create data directory if it doesn't exist
mkdir -p data

# Copy your resume
cp /path/to/your/resume.pdf data/resume.pdf
```

### 5. Start Alfred

```bash
# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

### 6. Open Alfred

Open your browser and go to: `http://localhost:3000`

## First-Time Setup

1. **Upload Resume**: Use the settings panel (gear icon) to upload your resume PDF
2. **Set Portfolio URL**: Enter your portfolio website URL in settings
3. **Test Alfred**: Try asking "What are Jeeva's skills?" or "Tell me about Jeeva's projects"

## Troubleshooting

### Common Issues

**"Failed to process message"**
- Check your Groq API key is correct
- Ensure you have internet connection
- Verify the API key has proper permissions

**"Knowledge base not initialized"**
- Check if resume file exists in `data/resume.pdf`
- Verify portfolio URL is accessible
- Try reinitializing through settings

**Voice features not working**
- Ensure you're using HTTPS (required for microphone access)
- Check browser permissions for microphone
- Try refreshing the page

### Getting Help

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Ensure all dependencies are installed properly

## Next Steps

- Customize Alfred's personality in `services/alfred.js`
- Add more knowledge extraction patterns
- Deploy to your preferred hosting platform
- Set up custom domain and SSL certificate

Happy chatting with Alfred! 🎩
