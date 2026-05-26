# Deployment Guide - EchoScriptAI

This guide explains how to deploy EchoScriptAI to Render.

## Prerequisites

- A Render account (free tier available)
- MongoDB Atlas account (free tier available)
- OpenAI API key
- Deepgram API key (optional)

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user with read/write permissions
5. Whitelist all IP addresses (0.0.0.0/0) for Render deployment
6. Get your connection string from the "Connect" button
7. Replace `<password>` with your user password

## Step 2: Deploy Backend on Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Select the `render.yaml` file
6. Review and click "Apply"

### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: echoscriptai-backend
   - **Region**: Oregon (or closest to you)
   - **Branch**: master
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Add Environment Variables:
   - `NODE_VERSION`: 18
   - `PORT`: 10000
   - `MONGODB_URI`: Your MongoDB connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DEEPGRAM_API_KEY`: Your Deepgram API key
   - `JWT_SECRET`: Generate a random string (use: `openssl rand -base64 32`)
   - `DEFAULT_STT_PROVIDER`: whisper
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://echoscriptai-frontend.onrender.com)
6. Click "Deploy Web Service"

## Step 3: Deploy Frontend on Vercel

For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

Quick Start:
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `REACT_APP_API_URL`: Your backend URL (e.g., https://echoscriptai-backend.onrender.com/api/upload)
6. Click "Deploy"

## Step 4: Ensure Frontend and Backend Work Seamlessly Together

### CORS Configuration

1. After frontend deployment, get your Vercel URL (e.g., https://echoscriptai-frontend.vercel.app)
2. Go to your backend service on Render
3. Navigate to "Environment"
4. Update `CORS_ORIGIN` to your frontend URL
5. Click "Save Changes"
6. Render will automatically redeploy

### Verify Connection

1. Open your frontend URL in browser
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to load transcriptions
5. Check that API requests succeed (status 200)
6. If you see CORS errors, verify:
   - `CORS_ORIGIN` matches frontend URL exactly
   - Backend is running
   - No typos in URLs

### Environment Variables Sync

Ensure these variables match:

**Frontend (Vercel):**
- `REACT_APP_API_URL` = Backend URL + `/api/upload`

**Backend (Render):**
- `CORS_ORIGIN` = Frontend URL (without path)

Example:
- Frontend: `https://echoscriptai.vercel.app`
- Backend: `https://echoscriptai-backend.onrender.com`
- Frontend REACT_APP_API_URL: `https://echoscriptai-backend.onrender.com/api/upload`
- Backend CORS_ORIGIN: `https://echoscriptai.vercel.app`

### Test Full Flow

1. **Authentication**
   - Click "Login" on frontend
   - Register a new account
   - Verify token is stored in localStorage
   - Check that "Logout" button appears

2. **File Upload**
   - Upload an audio file
   - Verify upload progress shows
   - Check that transcription appears in list
   - Verify provider badge shows (whisper/deepgram/browser)

3. **Real-Time Transcription**
   - Click "Real-Time" button
   - Click "Start Listening"
   - Speak into microphone
   - Verify words appear in real-time
   - Click "Stop Listening"
   - Verify transcription is saved to list

4. **Error Handling**
   - Disconnect backend temporarily
   - Try to upload file
   - Verify browser fallback appears
   - Verify error messages are clear

### Debugging Tips

**Check Backend Health:**
```bash
curl https://echoscriptai-backend.onrender.com/
```
Should return: `{"message":"EchoScriptAI Backend Server is running!"}`

**Check Provider Status:**
```bash
curl https://echoscriptai-backend.onrender.com/api/upload/provider-status
```

**Check Frontend Build:**
- Go to Vercel dashboard
- Click on your project
- Check "Deployments" tab
- Verify latest deployment succeeded

**View Logs:**
- Backend: Render Dashboard → Logs
- Frontend: Vercel Dashboard → Logs

### Common Issues

**CORS Errors:**
- Ensure `CORS_ORIGIN` includes exact frontend URL
- Check for trailing slashes
- Verify backend is not sleeping (Render free tier)

**API Timeouts:**
- Render free tier sleeps after 15min inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to avoid sleep

**Authentication Fails:**
- Verify `JWT_SECRET` is set in backend
- Check MongoDB connection
- Ensure User collection exists

**File Upload Fails:**
- Check file size (max 50MB)
- Verify multer configuration
- Check backend logs for errors

## Step 5: Test the Deployment

1. Visit your frontend URL
2. Click "Login" and register a new account
3. Try uploading an audio file
4. Test real-time transcription

## Environment Variables Reference

### Backend (Render)
- `NODE_VERSION`: Node.js version (18)
- `PORT`: Server port (10000 for Render)
- `MONGODB_URI`: MongoDB Atlas connection string
- `OPENAI_API_KEY`: OpenAI API key
- `DEEPGRAM_API_KEY`: Deepgram API key
- `JWT_SECRET`: Secret for JWT token generation
- `DEFAULT_STT_PROVIDER`: Default STT provider (whisper)
- `CORS_ORIGIN`: Frontend URL for CORS

### Frontend (Vercel)
- `REACT_APP_API_URL`: Backend API URL

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Ensure all environment variables are set
- Verify MongoDB connection string is correct

### CORS errors
- Ensure `CORS_ORIGIN` matches your frontend URL exactly
- Check that the backend is running
- Verify the frontend API URL is correct

### Authentication fails
- Ensure `JWT_SECRET` is set in backend
- Check that MongoDB is accessible
- Verify the User collection exists in MongoDB

### File upload fails
- Ensure backend is running
- Check file size limits (default 50MB)
- Verify multer configuration

## Cost Estimate

- **Render (Free Tier)**: $0/month
  - 512MB RAM
  - 0.1 CPU
  - Sleeps after 15 minutes of inactivity
  - Takes ~30 seconds to wake up

- **MongoDB Atlas (Free Tier)**: $0/month
  - 512MB storage
  - Shared RAM
  - Good for development/testing

- **Vercel (Free Tier)**: $0/month
  - Unlimited bandwidth
  - Automatic SSL
  - Fast deployments

## Production Upgrade

For production use, consider upgrading to:

- **Render Starter ($7/month)**: No sleep, better performance
- **MongoDB Atlas M10 ($57/month)**: Dedicated resources, better performance
- **Vercel Pro ($20/month)**: More bandwidth, analytics

## Security Notes

- Never commit `.env` files to Git
- Use strong, random `JWT_SECRET`
- Enable MongoDB IP whitelisting
- Use environment-specific API keys
- Enable rate limiting in production
- Implement request validation
