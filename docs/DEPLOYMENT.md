# 🚀 Deployment Guide - Learning Platform

Deploy to Railway (Backend) + Vercel (Frontend)

## 🎯 Overview

| Component | Platform | Why |
|-----------|----------|-----|
| **Backend** | Railway | Easy Node.js + MySQL + Redis |
| **Frontend** | Vercel | Best for Nuxt SSR/SSG |
| **Database** | Railway MySQL | Managed database |
| **Cache** | Railway Redis or Upstash | Managed Redis |

## 🏗️ Backend Deployment (Railway)

### 1. Prerequisites

- GitHub account
- Railway account (free $5/month credit)
- Repository pushed to GitHub

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select `backend` folder (if monorepo)

### 3. Add MySQL Database

1. In Railway project, click "New"
2. Select "Database" → "MySQL"
3. Note the connection string

### 4. Add Redis

1. Click "New" again
2. Select "Database" → "Redis"
3. Note the connection string

**Alternative: Use Upstash Redis**
- Free tier: 10k requests/day
- Create at [upstash.com](https://upstash.com)

### 5. Configure Environment Variables

In Railway project settings, add:

```bash
# Node
NODE_ENV=production
PORT=3001

# Database (auto-provided by Railway MySQL)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# Redis (auto-provided by Railway Redis)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Or if using Upstash:
# REDIS_HOST=your-redis.upstash.io
# REDIS_PORT=6379
# REDIS_PASSWORD=your-password

# JWT
JWT_SECRET=your-super-secret-production-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-production-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=30d

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# CORS
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### 6. Configure Build & Start Commands

Railway auto-detects `package.json` scripts:

**Build Command:**
```json
"build": "tsc && prisma generate && prisma migrate deploy"
```

**Start Command:**
```json
"start": "node dist/server.js"
```

### 7. Deploy

Railway auto-deploys on push to main branch!

**Check deployment:**
- Logs tab: View real-time logs
- Metrics tab: Monitor CPU/RAM
- Settings → Domains: Get public URL

## 🎨 Frontend Deployment (Vercel)

### 1. Prerequisites

- Vercel account (free tier)
- GitHub repository

### 2. Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import from GitHub
4. Select `frontend` folder

### 3. Configure Project

**Framework Preset:** Nuxt.js

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.output/public`
- Install Command: `npm install`

**Root Directory:** `frontend` (if monorepo)

### 4. Environment Variables

Add in Vercel project settings:

```bash
NUXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api
```

### 5. Deploy

- Vercel auto-deploys on push to main
- Preview deployments for PRs
- Production at: `your-app.vercel.app`

## 🔗 Connect Backend & Frontend

### 1. Update Backend CORS

In Railway environment variables:

```bash
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

### 2. Update Frontend API URL

In Vercel environment variables:

```bash
NUXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api
```

### 3. Test Connection

```bash
# From browser console on Vercel app
fetch('https://your-backend.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## ⚙️ Post-Deployment Setup

### 1. Run Migrations

Railway runs migrations automatically via build command.

**Manual migration (if needed):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migration
railway run npm run migrate:prod
```

### 2. Seed Database (Optional)

```bash
railway run npm run seed
```

### 3. Verify Services

**Backend Health Check:**
```
https://your-backend.railway.app/api/health
```

**Frontend:**
```
https://your-app.vercel.app
```

**Database:**
- Railway Dashboard → MySQL → Connect
- Use Prisma Studio locally with production DB

## 📊 Monitoring

### Railway Monitoring

- **Logs**: Real-time application logs
- **Metrics**: CPU, RAM, Network
- **Deployments**: View deployment history
- **Restart**: Manual restart if needed

### Vercel Monitoring

- **Analytics**: Page views, performance
- **Logs**: Function logs
- **Deployments**: Deployment history
- **Speed Insights**: Core Web Vitals

### Uptime Monitoring (Optional)

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Ping endpoints:
- Backend: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-app.vercel.app`

## 🔐 Security Checklist

- [ ] Strong JWT secrets (32+ chars)
- [ ] CORS configured correctly
- [ ] Database credentials secure
- [ ] API rate limiting enabled
- [ ] HTTPS everywhere (automatic)
- [ ] Environment variables not in code
- [ ] Prisma query logging disabled in production

## 💰 Cost Estimate

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| **Railway** | $5 credit/month | ~$5-10/month |
| **Vercel** | 100GB bandwidth | $0 (sufficient) |
| **Upstash Redis** | 10k requests/day | $0-5/month |
| **Total** | | **~$5-15/month** |

## 🚨 Troubleshooting

### Issue: Database connection timeout

**Solution:**
```bash
# Increase connection pool
# In prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

### Issue: CORS errors

**Solution:**
- Verify FRONTEND_URL in Railway
- Check ALLOWED_ORIGINS includes Vercel preview URLs
- Use `sameSite: 'none'` for cookies

### Issue: Build fails on Railway

**Solution:**
```bash
# Check logs
# Ensure all dependencies in package.json
# Verify TypeScript compiles locally
npm run build
```

### Issue: Vercel build fails

**Solution:**
```bash
# Clear cache and redeploy
# Or set Node version in package.json
"engines": {
  "node": ">=20.0.0"
}
```

## 🔄 CI/CD Workflow

Both Railway and Vercel auto-deploy on git push:

```
git push origin main
   ↓
GitHub triggers webhooks
   ↓
├─ Railway builds & deploys backend
└─ Vercel builds & deploys frontend
```

**Manual deploy:**
- Railway: Trigger from dashboard
- Vercel: Trigger from dashboard or CLI

## 📝 Deployment Checklist

**Before deploying:**
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] CORS configured
- [ ] Error handling in place
- [ ] Logging enabled

**After deploying:**
- [ ] Health check passing
- [ ] Database accessible
- [ ] Redis working
- [ ] Frontend loads
- [ ] API calls working
- [ ] Verify with test account

## 🎯 Custom Domain (Optional)

### Railway Custom Domain

1. Railway Dashboard → Settings → Domains
2. Add custom domain
3. Update DNS records

### Vercel Custom Domain

1. Vercel Dashboard → Domains
2. Add custom domain
3. Update DNS records
4. HTTPS automatic

---

**Happy Deploying! 🚀**

For issues: Check Railway/Vercel logs first!
