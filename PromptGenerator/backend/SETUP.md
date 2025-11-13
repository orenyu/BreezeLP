# Backend Setup Guide

Complete guide to set up and run the Breeze Prompt Generator backend server.

---

## Prerequisites

- Node.js 18+ installed
- Google Gemini API key (free tier available)
- Terminal/Command Prompt access

---

## Step 1: Get Gemini API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (keep it secure!)

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for development and testing

---

## Step 2: Install Dependencies

Open terminal in the `backend/` directory and run:

```bash
cd d:\_QuickShares\VS\BreezeLP\PromptGenerator\backend
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `@google/generative-ai` - Google Gemini SDK
- `express-rate-limit` - API rate limiting

---

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   FRONTEND_URL=http://127.0.0.1:3001
   PORT=3000
   NODE_ENV=development
   ```

3. Save the file

---

## Step 4: Start the Server

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

You should see:
```
🚀 Breeze Prompt Generator Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running on: http://localhost:3000
🌐 Environment: development
🔧 Gemini API: ✅ Connected
🔒 CORS enabled for: http://127.0.0.1:3001
```

---

## Step 5: Test the Backend

### Test Health Endpoint
Open browser or use curl:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "geminiStatus": "connected",
  "uptime": 12.345
}
```

### Test Gemini Connection
```bash
curl http://localhost:3000/api/test-gemini
```

Expected response:
```json
{
  "success": true,
  "message": "Gemini API connection successful",
  "response": "Hello! How can I help you today?"
}
```

---

## Step 6: Test with Frontend

1. Make sure frontend server is running on port 3001
2. Open: http://127.0.0.1:3001/PromptGenerator/index.html
3. Fill out the form
4. Click "Generate Prompt"
5. Wait for the AI-generated prompt to appear

---

## API Endpoints

### `GET /api/health`
Health check endpoint
- Returns server status and uptime

### `GET /api/test-gemini`
Test Gemini API connection
- Returns connection status and test response

### `POST /api/generate-prompt`
Generate a product brief prompt
- **Request body:** Form data (JSON)
- **Response:** Generated prompt text

### `GET /api/stats`
View service statistics (development only)
- Returns request counts and rate limit info

---

## Troubleshooting

### "Gemini API key is required"
- Check that `.env` file exists in the `backend/` directory
- Verify `GEMINI_API_KEY` is set in `.env`
- Make sure there are no extra spaces around the key

### "Port 3000 already in use"
- Change `PORT` in `.env` to a different port (e.g., 3002)
- Or stop the other process using port 3000

### "CORS Error" in browser
- Check that `FRONTEND_URL` in `.env` matches your frontend URL
- Default is `http://127.0.0.1:3001`

### "Rate limit exceeded"
- Free tier: 60 requests/minute, 1500/day
- Wait a moment before trying again
- Server will automatically reset counter after 1 minute

### "Module not found"
- Make sure you ran `npm install` in the backend directory
- Check that `node_modules/` folder exists

---

## Fallback Mode

If Gemini API is unavailable or fails, the server automatically uses template-based generation:
- ⚠️  "Gemini service not initialized" → Server runs in fallback mode
- ✅ Still generates prompts using the template in `promptBuilder.js`
- 📝 Less sophisticated but still functional

---

## Production Deployment

### Deploy to Render (Recommended)

1. Push code to GitHub repository

2. Go to: https://render.com

3. Create new "Web Service"

4. Connect your GitHub repo

5. Configure:
   - **Build Command:** `cd PromptGenerator/backend && npm install`
   - **Start Command:** `cd PromptGenerator/backend && npm start`
   - **Environment Variables:**
     - `GEMINI_API_KEY`: your_api_key
     - `FRONTEND_URL`: your_frontend_url
     - `NODE_ENV`: production

6. Deploy!

### Deploy to Railway

1. Visit: https://railway.app

2. Create new project

3. Add GitHub repo

4. Railway auto-detects Node.js

5. Add environment variables in dashboard

6. Deploy

---

## File Structure

```
backend/
├── server.js              # Express server & routes
├── geminiService.js       # Gemini API integration
├── promptBuilder.js       # Prompt template logic
├── package.json           # Dependencies
├── .env.example           # Environment template
├── .env                   # Your config (DO NOT COMMIT!)
├── .gitignore            # Git ignore rules
└── SETUP.md              # This file
```

---

## Security Notes

🔒 **NEVER commit `.env` file to Git!**
- Contains sensitive API keys
- Already in `.gitignore`
- Use `.env.example` as template

🔒 **Rate Limiting:**
- Server limits each IP to 30 requests per 15 minutes
- Prevents abuse and protects your Gemini quota

🔒 **CORS:**
- Only allows requests from configured frontend URL
- Blocks unauthorized cross-origin requests

---

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test each endpoint individually
4. Check Gemini API quota at: https://aistudio.google.com

---

**Created:** 2025-10-28
**Version:** 1.0.0
