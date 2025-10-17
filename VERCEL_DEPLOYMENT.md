# 🚀 Vercel Deployment Guide for Alfred Portfolio Bot

## Prerequisites

1. **Groq API Key** - Get from [Groq Console](https://console.groq.com/)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository** - Push your code to GitHub

## Step 1: Prepare Your Code

✅ **Build the project:**
```bash
npm run build
```

✅ **Verify files are ready:**
- `public/css/styles.css` - Built CSS
- `public/alfred-widget.js` - Widget script
- `vercel.json` - Vercel configuration

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: alfred-portfolio-bot
# - Framework: Other
# - Root directory: ./
# - Build command: npm run build
# - Output directory: public
```

### Option B: GitHub Integration
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure settings (see below)

## Step 3: Environment Variables

Set these in your Vercel dashboard under **Settings > Environment Variables**:

### Required Variables:
```
GROQ_API_KEY = your_groq_api_key_here
JWT_SECRET = your_random_secret_string
NODE_ENV = production
```

### Optional Variables:
```
PORT = 3000
CORS_ORIGINS = *
RATE_LIMIT_WINDOW = 900000
RATE_LIMIT_MAX = 100
ADMIN_PASSWORD = your_admin_password
```

## Step 4: Vercel Configuration

The `vercel.json` file is already configured with:
- Node.js server build
- Static file serving
- Proper routing
- Environment variables

## Step 5: Update Widget Script

After deployment, your widget will be available at:
```
https://your-app-name.vercel.app/alfred-widget.js
```

Update your portfolio to use:
```html
<script 
    data-tenant-id="your-unique-id" 
    data-server-url="https://your-app-name.vercel.app"
    src="https://your-app-name.vercel.app/alfred-widget.js">
</script>
```

## Step 6: Test Deployment

1. **Visit your Vercel URL**
2. **Test the chat interface**
3. **Test the widget on your portfolio**
4. **Check console for errors**

## Troubleshooting

### Common Issues:

**❌ Environment Variables Not Set**
- Check Vercel dashboard > Settings > Environment Variables
- Ensure all required variables are set

**❌ Build Fails**
- Check `npm run build` works locally
- Verify all dependencies are in `package.json`

**❌ Widget Not Loading**
- Check widget URL is accessible
- Verify CORS settings
- Check browser console for errors

**❌ Socket.IO Connection Failed**
- Verify server is running
- Check CORS origins configuration
- Ensure Socket.IO is properly configured

### Debug Commands:
```bash
# Test locally
npm start

# Check build
npm run build

# Test widget
curl https://your-app.vercel.app/alfred-widget.js
```

## Production URLs

After successful deployment:
- **Main App**: `https://your-app-name.vercel.app`
- **Widget Script**: `https://your-app-name.vercel.app/alfred-widget.js`
- **Admin Panel**: `https://your-app-name.vercel.app/admin.html`

## Next Steps

1. **Custom Domain** (Optional) - Add your custom domain in Vercel
2. **Analytics** - Enable Vercel Analytics
3. **Monitoring** - Set up error monitoring
4. **Backup** - Regular database backups if using external DB

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check browser console for errors

---

🎉 **Your Alfred bot is now live and ready to help visitors learn about your work!**
