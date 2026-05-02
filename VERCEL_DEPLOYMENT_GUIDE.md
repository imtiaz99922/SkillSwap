# SkillSwap - Full-Stack Vercel Deployment Guide

## 🚀 Deployment Overview

Your SkillSwap project is now configured for full-stack deployment on Vercel:

- **Frontend (React)**: Deployed as static site in `/client`
- **Backend (Express)**: Deployed as serverless functions in `/api`

---

## 📋 Prerequisites

1. **Vercel Account**: [https://vercel.com/new?teamSlug=imtiaz99922s-projects](https://vercel.com/new?teamSlug=imtiaz99922s-projects)
2. **GitHub Repository**: Connected to your Git account
3. **MongoDB Atlas**: Database connection string (free tier available)
4. **Environment Variables**: Configure in Vercel dashboard

---

## 🔧 Step 1: Set Up Environment Variables on Vercel

After connecting your repository, add these environment variables in Vercel Project Settings → Environment Variables:

### Backend Environment Variables

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
BASE_URL=https://your-project.vercel.app
CLIENT_ORIGIN=https://your-project.vercel.app
```

### Optional Variables

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Payment Gateway (SSLCommerz)
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty

# Firebase (if used)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

---

## 📦 Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/new?teamSlug=imtiaz99922s-projects](https://vercel.com/new?teamSlug=imtiaz99922s-projects)
2. Click "Import Project"
3. Select "GitHub" and search for `imtiaz99922/SkillSwap`
4. Configure project:
   - **Framework Preset**: Other (since it's full-stack)
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables from Step 1
6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd d:\CSE 471 Project

# Deploy
vercel --prod

# Follow the prompts and add environment variables when asked
```

---

## 🔗 Project Structure

After deployment, your URLs will be:

```
Production Frontend:  https://your-project.vercel.app
Production Backend:   https://your-project.vercel.app/api
Health Check:         https://your-project.vercel.app/api/health
```

---

## ✅ Verify Deployment

1. **Frontend**: Visit `https://your-project.vercel.app`
2. **Backend Health**: Visit `https://your-project.vercel.app/api/health`
3. **API Endpoints**: Test routes like `/api/auth/me`, `/api/users`, etc.

---

## 🐛 Troubleshooting

### Issue: API calls fail with 404

**Solution**: Ensure `VITE_API_BASE=/api` is set in production environment. The frontend uses `/api` as the base URL on Vercel.

### Issue: MongoDB connection fails

**Solution**:

- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes Vercel IPs (or allow all)
- Use connection pool with `retryWrites=true`

### Issue: CORS errors

**Solution**: Backend already configured to allow all origins. If issues persist, check:

- `CLIENT_ORIGIN` matches your Vercel domain
- `BASE_URL` is correctly set

### Issue: Email not sending

**Solution**: Gmail requires "App Password" (2FA must be enabled):

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password for Gmail
4. Use generated password as `EMAIL_PASSWORD`

---

## 📝 Important Notes

### Environment Variable Management

- **Never commit `.env` files to Git**
- Use Vercel dashboard to manage secrets
- Each environment (production, preview, development) can have different variables

### Cost Considerations

- **Vercel Free Tier**: Up to 100GB bandwidth/month
- **MongoDB Atlas Free Tier**: 512MB storage (enough for testing)
- No deployment costs for reasonable usage

### Performance Tips

1. Use MongoDB connection pooling
2. Cache API responses client-side where possible
3. Optimize database queries with indexes
4. Monitor Vercel Analytics in dashboard

---

## 🔄 Deployment Workflow

### For Future Updates

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically rebuilds and deploys
# Check deployment status in Vercel dashboard
```

### Preview Deployments

- Every PR automatically gets a preview deployment
- Production deploys when merging to main branch

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Express.js**: https://expressjs.com/
- **React Vite**: https://vitejs.dev/

---

## ✨ Next Steps

1. Deploy to Vercel using steps above
2. Test all API endpoints
3. Set up custom domain (optional)
4. Enable automatic SSL/HTTPS
5. Configure monitoring and alerts

Happy deploying! 🚀
