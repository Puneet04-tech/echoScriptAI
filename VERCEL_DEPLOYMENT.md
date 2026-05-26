# Vercel Frontend Deployment Guide

This guide explains how to deploy the EchoScriptAI frontend to Vercel.

## Prerequisites

- A Vercel account (free tier available)
- Backend deployed on Render (see DEPLOYMENT.md)
- GitHub repository with the code

## Quick Deployment

### Option 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project root:
```bash
vercel
```

4. Follow the prompts:
   - **Set up and deploy?** Y
   - **Which scope?** Select your account
   - **Link to existing project?** N (create new)
   - **Project name**: echoscriptai-frontend
   - **Directory**: . (current directory)
   - **Override settings?** N (use vercel.json)

5. Add environment variable:
```bash
vercel env add REACT_APP_API_URL production
```
Enter your backend URL: `https://echoscriptai-backend.onrender.com/api/upload`

6. Redeploy:
```bash
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Project Name**: echoscriptai-frontend
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - Click "Environment Variables"
   - Add `REACT_APP_API_URL` = `https://echoscriptai-backend.onrender.com/api/upload`
6. Click "Deploy"

## Environment Variables

Required environment variable for Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://echoscriptai-backend.onrender.com/api/upload` |

## vercel.json Configuration

The `vercel.json` file includes:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Security Headers**: XSS protection, frame options, etc.
- **Rewrites**: SPA routing support

## Custom Domain (Optional)

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CORS_ORIGIN` in backend to match new domain

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify build command is `npm run build`
- Check Vercel build logs for errors

### API Requests Fail

- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running and accessible
- Verify CORS is configured on backend
- Check browser console for CORS errors

### Environment Variables Not Working

- Variables must start with `REACT_APP_` to be available in React
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

### White Screen After Deployment

- Check build output directory is `dist` (not `build`)
- Verify `vercel.json` has correct output directory
- Check browser console for JavaScript errors
- Ensure all imports are relative paths

## Performance Optimization

Vercel automatically optimizes:
- Static asset caching
- Image optimization
- CDN distribution
- Edge caching

Additional optimizations:
- Code splitting (automatic in Vite)
- Lazy loading components
- Minification (automatic in Vite)

## Monitoring

Vercel provides:
- Real-time logs
- Analytics dashboard
- Performance metrics
- Error tracking

Access from project dashboard.

## Scaling

Free tier includes:
- Unlimited deployments
- 100GB bandwidth per month
- Automatic SSL
- Fast global CDN

Upgrade to Pro for:
- More bandwidth
- Analytics
- Team collaboration
- Priority support

## Continuous Deployment

Vercel automatically deploys on:
- Git push to master branch
- Pull request previews
- Custom webhook triggers

## Rollback

To rollback to a previous deployment:

1. Go to project dashboard
2. Click "Deployments"
3. Find the deployment to rollback to
4. Click "..." → "Rollback"

## Local Testing

Test production build locally:

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to test production build.

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store in Vercel environment variables
3. **HTTPS**: Automatic on Vercel
4. **Headers**: Security headers configured in vercel.json
5. **Dependencies**: Regularly update with `npm audit fix`

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)
- [Vite Deployment Guide](https://vitejs.dev/guide/deployment.html)
