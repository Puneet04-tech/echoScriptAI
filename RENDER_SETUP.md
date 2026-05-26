# Render Backend Configuration Guide

## Current Deployment Status

- **Backend URL**: https://echoscriptai.onrender.com
- **Service Name**: echoscriptai
- **Runtime**: Node.js

## Required Environment Variables in Render Dashboard

Go to: https://dashboard.render.com → Select "echoscriptai" service → Environment tab

### Copy-Paste These Exact Values

```
PORT=10000

MONGODB_URI=mongodb+srv://chaturvedipuneet200_db_user:BGVKxNItxl9y7HwH@meter-flow-cluster.37xjisu.mongodb.net/?appName=meter-flow-cluster

CORS_ORIGIN=https://echo-script-ai-t556.vercel.app

JWT_SECRET=your_jwt_secret_key_here

OPENAI_API_KEY=sk-proj-your-openai-key-here

DEEPGRAM_API_KEY=your_deepgram_key_here

DEFAULT_STT_PROVIDER=whisper

NODE_VERSION=18
```

## Step-by-Step Setup in Render

### 1. Go to Render Dashboard
- URL: https://dashboard.render.com/
- Login with your account
- Find service: "echoscriptai"

### 2. Click on "echoscriptai" Service

### 3. Go to "Environment" Tab
- On the left sidebar, click "Environment"

### 4. Add/Update Environment Variables

For each variable above:
1. Click "Add Environment Variable"
2. Enter Key (e.g., `PORT`)
3. Enter Value (e.g., `10000`)
4. Click ✓

**Important Variables:**

| Key | Value | Status |
|-----|-------|--------|
| PORT | 10000 | ✅ Required |
| MONGODB_URI | `mongodb+srv://...` | ✅ Required |
| CORS_ORIGIN | `https://echo-script-ai-t556.vercel.app` | ⚠️ **CRITICAL** |
| JWT_SECRET | Your secret key | ✅ Required |
| OPENAI_API_KEY | Your OpenAI key | ✅ Required |
| DEEPGRAM_API_KEY | Your Deepgram key | ✅ Required |
| DEFAULT_STT_PROVIDER | whisper | ✅ Required |
| NODE_VERSION | 18 | ✅ Required |

### 5. Click "Save Changes"
- Render will automatically redeploy with new environment variables
- This takes about 2-5 minutes

### 6. Wait for Deployment
- Check "Deployments" tab
- Wait for new deployment to complete (green checkmark)

### 7. Verify Backend is Working
```bash
# Test in terminal or browser
curl https://echoscriptai.onrender.com/
# Should return: {"message":"EchoScriptAI Backend Server is running!"}
```

## Testing CORS Configuration

### In Browser Console (F12)

```javascript
// This should work (no CORS error)
fetch('https://echoscriptai.onrender.com/api/upload/provider-status')
  .then(r => r.json())
  .then(d => console.log(d))
```

### If CORS Error Appears

1. Check `CORS_ORIGIN` value in Render dashboard
2. Must be exactly: `https://echo-script-ai-t556.vercel.app`
3. No trailing slash!
4. No `http://` (must be `https://`)
5. Click "Save Changes" again
6. Wait for redeploy (2-5 minutes)
7. Try again

## Verify Each Variable is Set

### 1. PORT
- Used by Render to expose the service
- Must be `10000` for Render

### 2. MONGODB_URI
- Connection string to MongoDB Atlas
- Verify it works:
```bash
# In backend terminal (after deployment)
# Should connect without error
node -e "const m=require('mongoose'); m.connect(process.env.MONGODB_URI);"
```

### 3. CORS_ORIGIN
- **MOST CRITICAL** for frontend-backend communication
- Must match frontend URL exactly
- Current: `https://echo-script-ai-t556.vercel.app`
- Test by making request from frontend to backend

### 4. JWT_SECRET
- Used to sign/verify JWT tokens
- Keep it secret!
- Can regenerate with: `openssl rand -base64 32`

### 5. OPENAI_API_KEY
- For speech-to-text transcription with Whisper
- Get from: https://platform.openai.com/api-keys

### 6. DEEPGRAM_API_KEY
- Fallback for speech-to-text (optional)
- Get from: https://console.deepgram.com/

### 7. DEFAULT_STT_PROVIDER
- Options: `whisper` or `deepgram`
- Set to: `whisper`

## Troubleshooting

### Backend won't start
- Check "Logs" tab in Render dashboard
- Look for error messages
- Common issues:
  - Invalid MONGODB_URI
  - Missing required environment variables
  - Node version mismatch

### CORS errors when frontend calls backend
- Check CORS_ORIGIN is set correctly
- Must be: `https://echo-script-ai-t556.vercel.app`
- No http:// (must be https://)
- No trailing slash
- Wait 2-5 minutes after save for redeploy

### 401 Unauthorized errors
- JWT_SECRET must be set
- Must match between frontend/backend
- Check token is being sent in Authorization header
- View logs for details

### Transcription fails
- Check OPENAI_API_KEY is valid
- Check DEEPGRAM_API_KEY is valid
- View backend logs for error details
- Try provider status endpoint

## Monitoring Backend

### View Logs
1. Go to Render dashboard
2. Select "echoscriptai" service
3. Click "Logs" tab
4. Watch for errors in real-time

### View Deployments
1. Go to Render dashboard
2. Select "echoscriptai" service
3. Click "Deployments" tab
4. See history of all deployments

### Check Service Status
- Green indicator = Running ✅
- Yellow indicator = Deploying ⏳
- Red indicator = Error ❌

## Auto-Deploy on Git Push

Render is configured to automatically redeploy when you push to GitHub:
1. Push changes to main branch
2. Render detects changes
3. Runs build command: `cd backend && npm install`
4. Runs start command: `cd backend && npm start`
5. Deploys new version (5-10 minutes)

## Important Notes

- ⚠️ Render free tier sleeps after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds
- ⚠️ Consider upgrading to Starter ($7/month) for better performance
- ⚠️ MongoDB free tier has storage limits (512MB)
- ⚠️ Keep API keys private and secure

## Next Steps

1. **Update Environment Variables in Render**
   - Go to dashboard
   - Set CORS_ORIGIN to your frontend URL
   - Set all other required variables
   - Click Save

2. **Test Backend**
   - Open https://echoscriptai.onrender.com/ in browser
   - Should see: `{"message":"EchoScriptAI Backend Server is running!"}`

3. **Test Frontend-Backend Communication**
   - Go to https://echo-script-ai-t556.vercel.app/
   - Register new account
   - Should connect without CORS errors

4. **Monitor Logs**
   - Watch Render logs for errors
   - Watch browser console for issues
   - Check MongoDB connection is working
