# 🚀 Railway Deployment Guide - Free Tier

Deploy your NidhiOne app to Railway's free tier ($5/month credit) in ~20 minutes!

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Railway account (sign up at [railway.app](https://railway.app))
- ✅ Your code pushed to GitHub repository

---

## 🎯 Free Tier Limitations

Railway Free Tier:
- **$5 credit/month** (automatically applied)
- **512 MB RAM** per service
- **Shared CPU**
- **1 GB disk space**
- **100 GB network egress**

**Perfect for**: Development, demos, low-traffic apps (50-200 users)

---

## 📦 Step-by-Step Deployment

### **Step 1: Push Code to GitHub**

```bash
cd /Users/creachdev/Desktop/NidhiOne

# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create new GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/nidhione.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Create Railway Project**

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `nidhione` repository
5. Railway will detect your monorepo

---

### **Step 3: Add PostgreSQL Database**

1. In your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates the database
4. Note: The `DATABASE_URL` is auto-generated

---

### **Step 4: Deploy Backend**

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Railway will ask which service - name it **"backend"**

#### **Configure Backend Service:**

Click on the **backend** service, then go to **"Settings"**:

**Root Directory:**
```
backend
```

**Environment Variables** (click "Variables" tab):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=3000
JWT_SECRET=<GENERATE_STRONG_SECRET>
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
PRICE_UPDATE_CRON=0 */6 * * *
SIP_EXECUTION_CRON=0 9 * * *
```

**To generate JWT_SECRET:**
```bash
# Run this in your terminal
openssl rand -base64 32
```

**Important:** The `${{Postgres.DATABASE_URL}}` automatically links to your PostgreSQL database. Replace `frontend.RAILWAY_PUBLIC_DOMAIN` with the actual frontend URL after Step 5.

#### **Deploy Configuration:**
Railway will automatically:
- Use the `Dockerfile` we created
- Build the Docker image
- Run migrations via the CMD in Dockerfile
- Start the server

Click **"Deploy"** and wait 2-3 minutes.

---

### **Step 5: Deploy Frontend**

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. Name it **"frontend"**

#### **Configure Frontend Service:**

Click on the **frontend** service, then go to **"Settings"**:

**Root Directory:**
```
frontend
```

**Environment Variables** (click "Variables" tab):
```
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

**Generate Domain** (under Settings):
- Click **"Generate Domain"** to get a public URL
- Copy this URL (e.g., `https://nidhione-frontend.up.railway.app`)

Click **"Deploy"** and wait 2-3 minutes.

---

### **Step 6: Update Backend FRONTEND_URL**

1. Go back to **backend** service
2. Click **"Variables"** tab
3. Update `FRONTEND_URL` with your frontend's Railway domain:
```
FRONTEND_URL=https://nidhione-frontend.up.railway.app
```
4. Save - Railway will redeploy automatically

---

### **Step 7: Verify Deployment**

1. **Check Backend Health:**
   - Go to backend service → **"Deployments"** → View Logs
   - Look for: `Server listening on port 3000`
   - Check: `Migrations completed`

2. **Check Frontend:**
   - Click on frontend domain URL
   - You should see the login/register page

3. **Test the App:**
   - Register a new user
   - Login
   - Add a stock
   - Check dashboard

---

## 🔧 Troubleshooting

### **Backend won't start:**
```bash
# Check logs in Railway dashboard
# Common issues:
- DATABASE_URL not connected → Link Postgres database
- Migration failed → Check schema.prisma syntax
- Build failed → Check Dockerfile
```

### **Frontend can't connect to backend:**
```bash
# Check VITE_API_URL points to correct backend URL
# Check CORS settings in backend
# Verify both services are running
```

### **Database migrations fail:**
```bash
# Railway automatically runs: npx prisma migrate deploy
# If it fails, check:
- DATABASE_URL is correct
- Migrations in prisma/migrations/ are valid
```

---

## 💰 Free Tier Tips to Save Credits

### **1. Optimize Build Times**
Use Docker layer caching (already configured in Dockerfile)

### **2. Single Database**
Use one PostgreSQL database for all environments

### **3. Monitor Usage**
- Go to Railway dashboard → **"Usage"**
- Track monthly credit consumption
- Estimates: ~$3-5/month for hobby projects

### **4. Sleep Inactive Services** (Optional)
Railway doesn't auto-sleep, but you can manually stop services when not in use

---

## 📊 Railway Dashboard URLs

After deployment, you'll have:

- **Frontend**: `https://nidhione-frontend.up.railway.app`
- **Backend**: `https://nidhione-backend.up.railway.app`
- **Database**: Private URL (accessed via backend only)

---

## 🚀 Deploy Updates

Railway auto-deploys on git push:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically redeploys! 🎉
```

---

## 🔐 Security Checklist

- [x] JWT_SECRET is strong and unique
- [x] NODE_ENV=production
- [x] CORS restricted to frontend domain
- [x] .env files not in git (.gitignore configured)
- [x] Database URL is private
- [x] HTTPS enabled (Railway default)

---

## 📈 Monitoring

**View Logs:**
1. Click on service (backend/frontend)
2. Go to **"Deployments"** tab
3. Click **"View Logs"**

**Monitor Metrics:**
1. Click on service
2. Go to **"Metrics"** tab
3. View CPU, Memory, Network usage

---

## 🎯 Next Steps

Once deployed:
1. ✅ Test all features thoroughly
2. ✅ Share the URL with users
3. ✅ Monitor usage and logs
4. ✅ Set up custom domain (optional, $0 on Railway)
5. ✅ Add monitoring (Sentry, LogRocket)

---

## 💡 Upgrade Path

When you exceed free tier (~$5/month):
- Railway charges $0.000231 per GB-hour usage
- Typically $10-20/month for small production apps
- No action needed - Railway bills automatically

---

## 🆘 Need Help?

**Railway Docs**: https://docs.railway.app
**Railway Discord**: https://discord.gg/railway
**GitHub Issues**: Create an issue in your repo

---

**Estimated Deployment Time**: 15-25 minutes ⏱️

**Free Tier Capacity**: 50-200 concurrent users 👥

**Monthly Cost**: $0-5 (free tier) 💰

---

🎉 **Your NidhiOne app is now live!** 

Share your deployment URL and start tracking wealth! 📈
