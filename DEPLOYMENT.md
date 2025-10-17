# Alfred Portfolio Bot - Vercel Deployment

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables:
- `GROQ_API_KEY` - Your Groq API key
- `JWT_SECRET` - A random secret for JWT tokens
- `NODE_ENV` - Set to "production"

### Optional Variables:
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_WINDOW` - Rate limit window in ms
- `RATE_LIMIT_MAX` - Max requests per window

## Build Configuration

The project uses:
- Node.js server with Express
- Socket.IO for real-time chat
- Tailwind CSS for styling
- Static files served from `/public`

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Widget Integration

After deployment, update the widget script URL:

```html
<script 
    data-tenant-id="your-unique-id" 
    data-server-url="https://your-app.vercel.app"
    src="https://your-app.vercel.app/alfred-widget.js">
</script>
```
