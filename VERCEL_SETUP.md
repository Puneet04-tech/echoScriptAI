# Vercel Frontend Configuration Guide

## Current Deployment Status

- **Frontend URL**: https://echo-script-ai-t556.vercel.app/
- **Project Name**: echo-script-ai
- **Framework**: Vite + React

## Required Environment Variables in Vercel Dashboard

Go to: https://vercel.com/dashboard → Select "echo-script-ai" project → Settings → Environment Variables

### Environment Variable Required

```
REACT_APP_API_URL=https://echoscriptai.onrender.com/api
```

That's it! Just one environment variable needed for frontend.

## Step-by-Step Setup in Vercel

### 1. Go to Vercel Dashboard
- URL: https://vercel.com/dashboard
- Login with your GitHub account
- Find project: "echo-script-ai"

### 2. Click on "echo-script-ai" Project

### 3. Go to "Settings" Tab
- On top menu, click "Settings"

### 4. Go to "Environment Variables" Section
- On left sidebar, click "Environment Variables"

### 5. Add Environment Variable

1. Click "Add" button
2. **Name**: `REACT_APP_API_URL`
3. **Value**: `https://echoscriptai.onrender.com/api`
4. **Environments**: Select "Production", "Preview", and "Development"
5. Click "Save"

### 6. Redeploy Project
- Go to "Deployments" tab
- Find the latest deployment
- Click "Redeploy" button on right
- Or wait for next git push to trigger deploy

### 7. Verify Frontend is Working
- Open https://echo-script-ai-t556.vercel.app/
- Should see landing page with "Login" and "Get Started" buttons

## Frontend-Backend Connection

### How It Works

```
User visits: https://echo-script-ai-t556.vercel.app/
    ↓
Frontend loads with REACT_APP_API_URL set
    ↓
User clicks "Login"
    ↓
Frontend sends POST to: https://echoscriptai.onrender.com/api/auth/login
    ↓
Backend checks CORS_ORIGIN matches frontend URL
    ↓
Backend responds with JWT token
    ↓
Frontend stores token in localStorage
    ↓
Frontend redirects to dashboard
```

## Environment Variable Location in Code

**File**: [src/services/api.js](../src/services/api.js#L5)

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://echoscriptai.onrender.com/api';
```

- If `REACT_APP_API_URL` is set: Uses that value ✅
- If not set: Falls back to production backend URL ✅
- No localhost - safe for production ✅

## Testing Frontend

### 1. Register Account
1. Go to https://echo-script-ai-t556.vercel.app/
2. Click "Get Started"
3. Fill in email, password, confirm password
4. Click "Create Account"
5. Should redirect to dashboard (no error)

### 2. Upload Audio
1. Click "Select Audio File"
2. Choose any audio file (mp3, wav, etc.)
3. Click "Upload & Transcribe"
4. Wait for transcription to complete
5. Should appear in "Transcriptions" list

### 3. Real-Time Transcription
1. Click "🎤 Real-Time" button
2. Click "Start Listening"
3. Speak into microphone
4. Words should appear in real-time
5. Click "Stop Listening"
6. Should add transcription to list

### 4. Verify Data Isolation
1. Logout (click "🚪 Logout" in header)
2. Register different account
3. Upload different transcription
4. Verify different transcriptions between accounts

## Troubleshooting Frontend

### Page shows blank/won't load
- Open browser console (F12)
- Check "Console" tab for JavaScript errors
- Check "Network" tab for failed requests
- Check Vercel deployment status

### "Cannot connect to backend" error
- Check `REACT_APP_API_URL` is set in Vercel environment
- Verify backend URL is correct: `https://echoscriptai.onrender.com/api`
- Check backend is running: https://echoscriptai.onrender.com/
- Wait 30-60 seconds if backend just woke up

### 401 or 403 errors
- Check JWT token is stored in localStorage
- Open browser DevTools → Application → Local Storage
- Should see: `echoscriptai_token` with value
- If missing, login again

### CORS errors
- Check backend `CORS_ORIGIN` in Render dashboard
- Must be: `https://echo-script-ai-t556.vercel.app`
- No trailing slash!
- Wait 2-5 minutes after backend update

### Audio upload fails
- Check file size (max 50MB)
- Try different audio format
- Check browser console for error details
- Check backend logs in Render dashboard

## Deployment Status

### Check Deployment
1. Go to Vercel dashboard
2. Select "echo-script-ai" project
3. Go to "Deployments" tab
4. Latest deployment should have green checkmark ✅

### Redeploy After Environment Changes
1. Go to "Deployments" tab
2. Find latest deployment
3. Click "..." menu on right
4. Click "Redeploy"
5. Wait for new deployment (2-5 minutes)

### View Logs
1. Go to "Deployments" tab
2. Click on deployment
3. Click "Logs" button
4. View build logs and runtime logs

## Auto-Deploy on Git Push

Vercel is configured to auto-deploy on GitHub push:
1. Push changes to main branch
2. Vercel detects changes
3. Runs build: `npm run build`
4. Deploys dist files (1-5 minutes)
5. Available at frontend URL

## Environment Variables Sync

### Frontend (Vercel)
```
REACT_APP_API_URL=https://echoscriptai.onrender.com/api
```

### Backend (Render)
```
CORS_ORIGIN=https://echo-script-ai-t556.vercel.app
```

Both must be set for frontend-backend communication to work!

## Build Configuration

**Build Command**: `npm run build`
- Runs Vite build process
- Creates optimized `dist` folder
- Takes 1-2 minutes

**Output Directory**: `dist`
- Contains built HTML, CSS, JavaScript
- Served by Vercel CDN

**Install Command**: `npm install`
- Installs all dependencies from package.json
- Happens automatically on deploy

## API Endpoints Used

Frontend makes requests to these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Login to account |
| `/api/upload/transcribe` | POST | Upload and transcribe audio |
| `/api/upload/transcriptions` | GET | Get user's transcriptions |
| `/api/upload/transcription/:id` | GET | Get single transcription |
| `/api/upload/transcription/:id` | PUT | Update transcription |
| `/api/upload/transcription/:id` | DELETE | Delete transcription |

All requests include:
```
Authorization: Bearer {jwt_token}
```

## Performance

### Frontend Performance
- CDN distributed globally
- Auto-optimized builds
- Fast cache invalidation

### Recommended: Use Vercel Edge Middleware
For even faster responses, consider adding middleware to:
- Cache API responses
- Compress transfers
- Validate requests

## Important Notes

- ⚠️ Environment variables are case-sensitive
- ⚠️ Must prefix with `REACT_APP_` to be available in frontend
- ⚠️ Changes to env vars require redeploy
- ⚠️ Vercel free tier has sufficient limits for development
- ✅ No credit card required for free tier

## Next Steps

1. **Verify Environment Variable**
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Confirm `REACT_APP_API_URL` is set

2. **Redeploy Frontend**
   - Go to Deployments tab
   - Click Redeploy on latest deployment
   - Wait for build to complete

3. **Test Registration**
   - Go to https://echo-script-ai-t556.vercel.app/
   - Register new account
   - Should work without errors

4. **Test Transcription**
   - Upload audio file
   - Wait for transcription
   - Verify appears in list

5. **Monitor Logs**
   - Check Vercel deployment logs
   - Check browser console (F12)
   - Report any errors
