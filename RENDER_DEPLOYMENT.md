# 🚀 Render Deployment Guide (Free Tier)

Deploy NidhiOne to Render on the free tier.

## ⚠️ Render Free Tier Considerations

**Frontend (React + Vite):** ✅ **Completely FREE**
- Static site hosting on Render
- Automatic builds from GitHub

**Database (PostgreSQL):** ✅ **FREE (with limitations)**
- 256 MB storage
- Data retention: 7 days of inactivity = data deletion
- Good for dev/demo, not production

**Backend (Fastify API):** ⚠️ **Limited FREE Options**
- Free tier Web Service: Spins down after 15 min of inactivity
- Recommended: Upgrade to Hobby tier (~$7/month USD)
- OR: Deploy to another free service (Railway, Fly.io)

---

## 📋 Prerequisites

- ✅ GitHub account with your code pushed
- ✅ Render account (sign up at [render.com](https://render.com))
- ✅ PostgreSQL database service

---

## 🎯 Deployment Steps

### **Step 1: Push Code to GitHub**

Ensure your code is on GitHub:

```bash
cd /Users/ashutosh/nidhione

# If not initialized
git init
git add .
git commit -m "Deploy to Render"
git branch -M main
git push -u origin main
```

---

### **Step 2: Create Render PostgreSQL Database**

1. Go to [render.com](https://render.com)
2. Click **"New"** → **"PostgreSQL"**
3. Fill in:
   - **Name:** `nidhione-db`
   - **Database:** `nidhione`
   - **User:** `nidhione`
   - **Region:** Choose closest to your location
   - **PostgreSQL Version:** Latest stable
4. Click **"Create Database"**
5. **Copy the connection string** - you'll need it for the backend

---

### **Step 3: Deploy Backend Web Service**

1. From your Render dashboard, click **"New"** → **"Web Service"**
2. Select **"Deploy from a Git repository"**
3. Connect your GitHub account and select `nidhione`
4. Fill in:
   - **Name:** `nidhione-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`
   - **Plan:** Choose based on your needs (free has limitations)

#### **Add Environment Variables:**

Click the **"Environment"** tab and add:

```env
DATABASE_URL=<PASTE_YOUR_DB_CONNECTION_STRING>
NODE_ENV=production
JWT_SECRET=<GENERATE_NEW_SECRET_BELOW>
FRONTEND_URL=<WILL_UPDATE_AFTER_STEP_5>
PRICE_UPDATE_CRON=0 */6 * * *
SIP_EXECUTION_CRON=0 9 * * *
RECURRING_CASHFLOW_CRON=0 1 * * *
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

5. Click **"Create Web Service"**
6. **Wait for deployment** - check logs for any errors

---

### **Step 4: Deploy Frontend Static Site**

1. Click **"New"** → **"Static Site"**
2. Select your GitHub repository
3. Fill in:
   - **Name:** `nidhione-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

#### **Add Environment Variables:**

```env
VITE_API_URL=https://<your-backend-url>/api
```

(Get the backend URL from the backend service details)

4. Click **"Create Static Site"**

---

### **Step 5: Update Backend Environment Variables**

Once frontend is deployed:

1. Go to **Backend Service** → **Settings** → **Environment**
2. Update `FRONTEND_URL`:
   ```env
   FRONTEND_URL=https://<your-frontend-url>
   ```
3. Redeploy the backend

---

## ✅ Testing Your Deployment

1. Visit your frontend: `https://nidhione-frontend.onrender.com`
2. Test API endpoint: `https://nidhione-backend.onrender.com/api/health`
3. Try creating an account and logging in

---

## 🔧 Troubleshooting

### Backend won't start
- Check database connection string format
- View logs: Backend Service → Logs tab
- Ensure migrations ran successfully

### Frontend shows "Cannot GET /"
- Verify build command ran successfully
- Check publish directory is `dist`
- Clear browser cache and rebuild

### CORS errors
- Update `FRONTEND_URL` in backend environment
- Ensure CORS middleware is configured correctly

### Database connection issues
- Test connection string locally first
- Verify PostgreSQL is running and accessible
- Check firewall/network settings

---

## 💰 Estimated Costs (Monthly)

| Service | Free Tier | Hobby ($7) |
|---------|-----------|-----------|
| Frontend (Static) | ✅ FREE | N/A |
| Backend (Web) | Limited | $7 |
| Database | ✅ FREE* | $15 |
| **Total** | **~$0** (limited) | **~$22** |

*Database is free but with 7-day inactivity deletion

---

## 🚀 Next Steps

- Set up monitoring/alerts
- Configure custom domain
- Implement backup strategy for database
- Consider upgrading to paid tier for reliability

---

## 📖 Useful Links

- [Render Documentation](https://render.com/docs)
- [PostgreSQL Connection Guide](https://render.com/docs/connect-to-postgres)
- [Environment Variables](https://render.com/docs/environment-variables)
