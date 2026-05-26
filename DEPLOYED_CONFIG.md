# Deployed Configuration - EchoScriptAI

## Live URLs
- **Frontend**: https://echo-script-ai-t556.vercel.app/
- **Backend**: https://echoscriptai.onrender.com
- **API Endpoint**: https://echoscriptai.onrender.com/api

## Configuration Status

### ✅ Frontend (Vercel)

**Environment Variables Set:**
- `REACT_APP_API_URL`: `https://echoscriptai.onrender.com/api` ✅
- Default fallback in code: `https://echoscriptai.onrender.com/api` ✅

**API Service Configuration:**
- File: [src/services/api.js](src/services/api.js#L5)
- Default URL: `https://echoscriptai.onrender.com/api` (deployed URL)
- No localhost - uses production backend ✅

### ✅ Backend (Render)

**Required Environment Variables to Set:**

```
PORT=10000
MONGODB_URI=mongodb+srv://YOUR_MONGODB_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?appName=YOUR_APP
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=sk-proj-your-openai-key-here
DEEPGRAM_API_KEY=your_deepgram_key_here
DEFAULT_STT_PROVIDER=whisper
CORS_ORIGIN=https://echo-script-ai-t556.vercel.app
```

**Critical: CORS Configuration**
- `CORS_ORIGIN`: Must be set to `https://echo-script-ai-t556.vercel.app` (no trailing slash)
- This allows frontend to access backend APIs
- Update in Render Dashboard → Environment tab ✅

## How It Works

### Request Flow (Production)

```
User at https://echo-script-ai-t556.vercel.app/
    ↓
Clicks "Login" or "Sign Up"
    ↓
Frontend sends request to: https://echoscriptai.onrender.com/api/auth/login
    ↓
Browser sends Authorization header with JWT token
    ↓
Backend receives request from origin: https://echo-script-ai-t556.vercel.app
    ↓
Backend checks CORS_ORIGIN matches
    ↓
If match: ✅ Request proceeds
If no match: ❌ CORS error
```

## Checklist - Verify Deployment

### Frontend Verification

- [ ] Go to https://echo-script-ai-t556.vercel.app/
- [ ] See landing page with "Login" and "Get Started" buttons
- [ ] Click "Get Started"
- [ ] Fill email and password
- [ ] Click "Create Account"
- [ ] Should redirect to dashboard (not error)

### Backend Verification

- [ ] Check backend is running: https://echoscriptai.onrender.com/
- [ ] Should see: `{"message":"EchoScriptAI Backend Server is running!"}`
- [ ] Check provider status: https://echoscriptai.onrender.com/api/upload/provider-status
- [ ] Should return provider configuration

### Authentication Verification

- [ ] Register new account at frontend
- [ ] Email stored in MongoDB
- [ ] Password hashed with bcrypt
- [ ] JWT token generated
- [ ] Token stored in localStorage
- [ ] Can view dashboard with your data

### Data Isolation Verification

- [ ] Register User A
- [ ] Upload transcription as User A
- [ ] Logout
- [ ] Register User B
- [ ] Verify User B cannot see User A's transcriptions
- [ ] Upload transcription as User B
- [ ] Logout and login as User A
- [ ] Verify only User A's transcriptions visible

## If You See CORS Errors

1. Check backend `CORS_ORIGIN` variable in Render Dashboard
2. Verify it exactly matches: `https://echo-script-ai-t556.vercel.app`
3. No trailing slash!
4. Click "Save" and wait for backend to redeploy
5. Try request again

## If You See 401 Errors

1. Check JWT_SECRET is set in backend environment
2. Verify MongoDB is connected
3. Check token is being sent in Authorization header
4. View Render logs for detailed error messages

## If You See 403 Errors

1. Verify you're logged in (token exists)
2. Verify you own the resource
3. Check userId matches in database
4. View Render logs for detailed error messages

## Environment Variable Locations

### Frontend (Vercel Dashboard)
1. Go to vercel.com
2. Select "echo-script-ai" project
3. Go to Settings → Environment Variables
4. Verify `REACT_APP_API_URL` is set

### Backend (Render Dashboard)
1. Go to render.com
2. Select "echoscriptai" service
3. Go to Environment tab
4. Verify all variables are set:
   - CORS_ORIGIN
   - JWT_SECRET
   - MONGODB_URI
   - OPENAI_API_KEY
   - DEEPGRAM_API_KEY
   - DEFAULT_STT_PROVIDER

## Testing API Endpoints

### From Terminal/Postman

**Health Check:**
```bash
curl https://echoscriptai.onrender.com/
```

**Provider Status:**
```bash
curl https://echoscriptai.onrender.com/api/upload/provider-status
```

**Register:**
```bash
curl -X POST https://echoscriptai.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST https://echoscriptai.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Deployment Summary

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | https://echo-script-ai-t556.vercel.app/ | ✅ Deployed |
| Backend | https://echoscriptai.onrender.com | ✅ Deployed |
| Database | MongoDB Atlas | ✅ Connected |
| Auth | JWT + Bcrypt | ✅ Configured |
| CORS | Frontend ↔ Backend | ⚠️ Verify in Render |

## Next Steps

1. **Verify Backend CORS_ORIGIN**
   - Go to Render Dashboard
   - Find "echoscriptai" service
   - Check Environment tab
   - Ensure `CORS_ORIGIN=https://echo-script-ai-t556.vercel.app`

2. **Test Full Flow**
   - Register account
   - Upload audio file
   - Check it appears in dashboard
   - Logout and login as different user
   - Verify data isolation

3. **Monitor Logs**
   - Render Dashboard → Logs (check for errors)
   - Browser Console (F12) → Network tab (check API requests)
   - Vercel Deployments (check build status)

## Important Notes

- ⚠️ Never commit `.env` files to Git
- ⚠️ Keep JWT_SECRET secret and secure
- ⚠️ Use strong passwords
- ⚠️ MongoDB should only accept connections from Render IP
- ⚠️ Test in private/incognito window to verify localStorage works
