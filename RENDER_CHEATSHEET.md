# 🚀 Render Deployment - Quick Reference

## Option A: One-Click Infrastructure as Code (Recommended)

### 1. Push to GitHub
```bash
git add render.yaml
git commit -m "Add render.yaml config"
git push
```

### 2. Deploy on Render
1. Go to [render.com/github](https://render.com/github)
2. Click **"New"** → **"Infrastructure as Code"**
3. Select your `nidhione` repo
4. Render deploys everything automatically! 🎉

---

## Option B: Manual Deployment (UI)

### Step 1: Create PostgreSQL Database
```
Dashboard → New → PostgreSQL
- Name: nidhione-db
- Database: nidhione
- User: nidhione
- Region: oregon (closest to you)
Copy connection string ✅
```

### Step 2: Deploy Backend
```
Dashboard → New → Web Service
- Name: nidhione-backend
- Root Directory: backend
- Build: npm install && npm run build && npx prisma migrate deploy
- Start: npm start
```

**Environment Variables:**
```env
DATABASE_URL=<PASTE_CONNECTION_STRING>
NODE_ENV=production
JWT_SECRET=<RUN: openssl rand -base64 32>
FRONTEND_URL=<UPDATE_AFTER_STEP_3>
PRICE_UPDATE_CRON=0 */6 * * *
SIP_EXECUTION_CRON=0 9 * * *
```

### Step 3: Deploy Frontend
```
Dashboard → New → Static Site
- Name: nidhione-frontend
- Root Directory: frontend
- Build: npm install && npm run build
- Publish: dist
```

**Environment Variable:**
```env
VITE_API_URL=https://<backend-url>/api
```

### Step 4: Update Backend FRONTEND_URL
```
Backend Service → Settings → Environment
FRONTEND_URL=https://<frontend-url>
Redeploy ✅
```

---

## ✅ Verification Checklist

- [ ] Frontend loads at `https://nidhione-frontend.onrender.com`
- [ ] Backend responds: `https://nidhione-backend.onrender.com/api/health`
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads with API data
- [ ] No CORS errors in browser console

---

## ⚠️ Free Tier Notes

| Component | Free Status | Notes |
|-----------|------------|-------|
| Frontend | ✅ FREE | Unlimited bandwidth |
| Backend | ⚠️ LIMITED | Spins down after 15 min inactive |
| Database | ✅ FREE | 256 MB, 7-day retention |

**Tip:** Keep backend active with uptime monitoring to prevent spin-down.

---

## 🔗 Useful Commands

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Test Backend
```bash
curl https://nidhione-backend.onrender.com/api/health
```

### View Logs
- Render Dashboard → Service → Logs tab

---

## 💡 Troubleshooting

**Build fails?**
- Check logs for specific errors
- Ensure all dependencies are in package.json
- Verify build command is correct

**Frontend blank page?**
- Clear cache: Cmd+Shift+Delete
- Check VITE_API_URL environment variable
- Verify `dist` folder is being published

**API not responding?**
- Backend may have spun down (free tier)
- Check backend logs
- Verify DATABASE_URL is correct

---

See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for full guide!
