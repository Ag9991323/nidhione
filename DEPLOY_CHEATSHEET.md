# 🚀 Quick Deploy to Railway - Cheat Sheet

## Before You Start
```bash
# Generate JWT Secret
openssl rand -base64 32
# Save this - you'll need it!
```

## Railway Setup Order

### 1️⃣ Create Railway Project
- Go to railway.app
- New Project → Deploy from GitHub

### 2️⃣ Add PostgreSQL
- Click "+ New" → Database → PostgreSQL
- No configuration needed!

### 3️⃣ Deploy Backend
**Root Directory:** `backend`

**Environment Variables:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=3000
JWT_SECRET=<YOUR_GENERATED_SECRET>
FRONTEND_URL=<WILL_UPDATE_AFTER_STEP_4>
PRICE_UPDATE_CRON=0 */6 * * *
SIP_EXECUTION_CRON=0 9 * * *
```

### 4️⃣ Deploy Frontend
**Root Directory:** `frontend`

**Environment Variables:**
```env
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

**Generate Domain** in Settings!

### 5️⃣ Update Backend FRONTEND_URL
Go back to backend → Variables:
```env
FRONTEND_URL=https://your-frontend-domain.up.railway.app
```

## ✅ You're Done!

**Frontend URL:** https://your-frontend.up.railway.app
**Backend URL:** https://your-backend.up.railway.app

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check DATABASE_URL is linked |
| Frontend 404s | Check VITE_API_URL has /api suffix |
| CORS errors | Verify FRONTEND_URL in backend |
| Migrations fail | Check Railway logs for DB errors |

---

## 📊 Free Tier Limits
- $5/month credit (free!)
- 512MB RAM per service
- Good for 50-200 users

---

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide!
