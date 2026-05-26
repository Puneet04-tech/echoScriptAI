# 🚀 EchoScriptAI - Deployment Checklist

## Current Deployment URLs

✅ **Frontend**: https://echo-script-ai-t556.vercel.app/
✅ **Backend**: https://echoscriptai.onrender.com
✅ **Database**: MongoDB Atlas (Connected)

---

## ✅ Checklist - Complete These Steps

### Phase 1: Backend Configuration (Render) ⚙️

**CRITICAL: Update these in Render Dashboard**

1. ⚠️ **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Select: "echoscriptai" service
   - Tab: "Environment"

2. ⚠️ **Set CORS_ORIGIN** (MOST IMPORTANT)
   - Key: `CORS_ORIGIN`
   - Value: `https://echo-script-ai-t556.vercel.app`
   - No trailing slash, no http://, must be https://

3. ✅ **Verify All Variables Exist**
   - `PORT` = `10000`
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your secret key
   - `OPENAI_API_KEY` = Your OpenAI key
   - `DEEPGRAM_API_KEY` = Your Deepgram key
   - `DEFAULT_STT_PROVIDER` = `whisper`
   - `NODE_VERSION` = `18`

4. ✅ **Click "Save Changes"**
   - Backend will redeploy (2-5 minutes)
   - Wait for green checkmark in Deployments

5. ✅ **Test Backend Health**
   - Open: https://echoscriptai.onrender.com/
   - Should see: `{"message":"EchoScriptAI Backend Server is running!"}`

### Phase 2: Frontend Configuration (Vercel) ⚙️

**CRITICAL: Update these in Vercel Dashboard**

1. ⚠️ **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Select: "echo-script-ai" project
   - Tab: "Settings" → "Environment Variables"

2. ⚠️ **Set API URL** (ONLY ONE VARIABLE)
   - Key: `REACT_APP_API_URL`
   - Value: `https://echoscriptai.onrender.com/api`
   - Select all environments: Production, Preview, Development

3. ✅ **Click "Save"**

4. ✅ **Redeploy Frontend**
   - Go to: Deployments tab
   - Find latest deployment
   - Click: Redeploy button
   - Wait for build to complete (2-5 minutes)

5. ✅ **Test Frontend**
   - Open: https://echo-script-ai-t556.vercel.app/
   - Should see: Landing page with "Login" and "Get Started"

### Phase 3: Verify Full Stack 🔗

**Test the complete flow:**

1. **Register New Account**
   - Go to: https://echo-script-ai-t556.vercel.app/
   - Click: "Get Started"
   - Enter: Email, password, confirm password
   - Click: "Create Account"
   - Expected: Redirects to dashboard

2. **Check Backend Connection**
   - Open DevTools: F12
   - Go to: Network tab
   - Should see: POST to `/api/auth/register` with 200 status
   - No CORS errors!

3. **Upload Audio File**
   - On dashboard, click: "Select Audio File"
   - Choose any audio file (mp3, wav, m4a, etc.)
   - Click: "Upload & Transcribe"
   - Wait: 30 seconds to 2 minutes
   - Expected: Transcription appears in list

4. **Verify Data Isolation**
   - Click: "🚪 Logout"
   - Expected: Redirects to landing page
   - Register: Different email/password
   - Expected: Can't see previous user's transcriptions

---

## 🔍 Troubleshooting Guide

### ❌ Problem: CORS Error
**Error Message**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution:**
1. Go to Render dashboard
2. Select "echoscriptai" service
3. Environment tab
4. Check `CORS_ORIGIN` = `https://echo-script-ai-t556.vercel.app`
5. No trailing slash!
6. Click Save
7. Wait 2-5 minutes for redeploy

### ❌ Problem: Cannot Connect to Backend
**Error Message**: "Cannot connect to backend. Please ensure the server is running."

**Solution:**
1. Check backend is running: https://echoscriptai.onrender.com/
2. Should return: `{"message":"EchoScriptAI Backend Server is running!"}`
3. If not, check Render logs for errors
4. Free tier may sleep - first request takes 30-60 seconds

### ❌ Problem: 401 Unauthorized
**Error Message**: "Invalid or expired token"

**Solution:**
1. Check JWT_SECRET is set in Render backend
2. Try logging out and logging back in
3. Check localStorage has token: F12 → Application → Local Storage → echoscriptai_token

### ❌ Problem: Audio Upload Fails
**Error Message**: "Error transcribing file"

**Solution:**
1. Check file size (max 50MB)
2. Try different audio format (mp3, wav, etc.)
3. Check OPENAI_API_KEY is set and valid
4. Check Render logs for detailed error

### ❌ Problem: Frontend Shows Blank Page
**Solution:**
1. Open DevTools: F12
2. Console tab: Check for JavaScript errors
3. Network tab: Check for failed requests
4. Check Vercel deployment status (green checkmark?)
5. Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 📊 Verification Checklist

### Backend (Render)

- [ ] All environment variables set
- [ ] CORS_ORIGIN = `https://echo-script-ai-t556.vercel.app`
- [ ] Backend health check succeeds
- [ ] Deployment has green checkmark
- [ ] Logs show no errors

### Frontend (Vercel)

- [ ] REACT_APP_API_URL environment variable set
- [ ] Deployment has green checkmark
- [ ] Landing page loads
- [ ] No console errors (F12)

### Integration

- [ ] Can register account (no CORS error)
- [ ] JWT token stored in localStorage
- [ ] Can upload audio file
- [ ] Transcription appears in dashboard
- [ ] Data isolation works (different users see different data)
- [ ] Logout clears token

---

## 🔧 Configuration Summary

### Frontend (Vercel)
```
REACT_APP_API_URL=https://echoscriptai.onrender.com/api
```

### Backend (Render)
```
PORT=10000
MONGODB_URI=mongodb+srv://YOUR_MONGODB_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?appName=YOUR_APP
CORS_ORIGIN=https://echo-script-ai-t556.vercel.app
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=sk-proj-your-openai-key-here
DEEPGRAM_API_KEY=your_deepgram_key_here
DEFAULT_STT_PROVIDER=whisper
NODE_VERSION=18
```

---

## 📱 Testing API from Browser Console

```javascript
// Test backend health
fetch('https://echoscriptai.onrender.com/')
  .then(r => r.json())
  .then(d => console.log(d))

// Test provider status
fetch('https://echoscriptai.onrender.com/api/upload/provider-status')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 🚨 Important Notes

- ⚠️ **CORS_ORIGIN must match frontend URL exactly**
  - Correct: `https://echo-script-ai-t556.vercel.app`
  - Wrong: `https://echo-script-ai-t556.vercel.app/`
  - Wrong: `http://echo-script-ai-t556.vercel.app`

- ⚠️ **REACT_APP_ prefix is required for frontend env vars**
  - Required: `REACT_APP_API_URL`
  - Won't work: `API_URL`

- ⚠️ **Free tier services may sleep**
  - Render sleeps after 15 min inactivity
  - First request after sleep: 30-60 seconds
  - MongoDB free tier: 512MB storage limit

- ⚠️ **Never commit .env files**
  - Always set variables in dashboard
  - Use .env.example for documentation

---

## 📞 Need Help?

### Check Logs

**Render Logs:**
1. Go to Render dashboard
2. Select "echoscriptai"
3. Click "Logs" tab
4. Watch for error messages

**Vercel Logs:**
1. Go to Vercel dashboard
2. Select "echo-script-ai"
3. Click on deployment
4. View build logs

**Browser Console:**
1. Open DevTools: F12
2. Go to "Console" tab
3. Look for JavaScript errors
4. Check "Network" tab for API failures

### Documentation

- [RENDER_SETUP.md](./RENDER_SETUP.md) - Detailed Render configuration
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Detailed Vercel configuration
- [DEPLOYED_CONFIG.md](./DEPLOYED_CONFIG.md) - Overall deployment status

---

## ✅ Success Criteria

When everything is configured correctly, you should be able to:

1. ✅ Open https://echo-script-ai-t556.vercel.app/
2. ✅ Register a new account
3. ✅ Login successfully
4. ✅ See dashboard with upload area
5. ✅ Upload audio file
6. ✅ Transcription appears in list
7. ✅ Switch between file upload/real-time mode
8. ✅ Logout and login as different user
9. ✅ See only your own transcriptions
10. ✅ No console errors (F12)

---

## 🎯 Next Step

1. Go to Render Dashboard
2. Update `CORS_ORIGIN` to `https://echo-script-ai-t556.vercel.app`
3. Click Save (2-5 min redeploy)
4. Go to https://echo-script-ai-t556.vercel.app/
5. Register and test!

**Question or Issue?** Check [RENDER_SETUP.md](./RENDER_SETUP.md) or [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed guides.
