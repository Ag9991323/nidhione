# 🎯 Render Step-by-Step Deployment (UI Guide)

Complete walkthrough using Render's web interface.

---

## 📋 Prerequisites

- [ ] Code pushed to GitHub
- [ ] Render account created ([render.com](https://render.com))
- [ ] JWT secret generated: `openssl rand -base64 32`

---

## 🗄️ Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Navigate to [dashboard.render.com](https://dashboard.render.com)

2. **Click "New"** button (top-right)
   - Select **"PostgreSQL"**

3. **Configure Database**
   - **Name:** `nidhione-db`
   - **Database:** `nidhione`
   - **User:** `nidhione`
   - **Password:** Auto-generated (save it!)
   - **Region:** Select your closest region (e.g., Oregon)
   - **PostgreSQL Version:** 15 (latest stable)
   - **Plan:** Free (only option)

4. **Click "Create Database"**
   - Wait ~1 minute for creation

5. **Copy Connection String**
   - In the database details page, find "Connections"
   - Copy the **External Database URL**
   - Format: `postgresql://user:password@host:port/database`
   - **Keep this safe - you'll need it for the backend**

---

## 🔧 Step 2: Deploy Backend Web Service

1. **From Dashboard, click "New"** → **"Web Service"**

2. **Connect GitHub**
   - Click "Connect GitHub Account" (if not already done)
   - Select `nidhione` repository
   - Click "Connect"

3. **Configure Web Service**
   ```
   Name:              nidhione-backend
   Root Directory:    backend
   Runtime:           Node
   ```

4. **Build Command**
   ```
   npm install && npm run build && npx prisma migrate deploy
   ```
   *(Installs deps, builds TypeScript, and runs database migrations)*

5. **Start Command**
   ```
   npm start
   ```

6. **Click "Create Web Service"**

7. **Add Environment Variables**
   - Wait for the service to appear in dashboard
   - Click on `nidhione-backend` service
   - Go to **"Environment"** tab
   - Click **"Add Environment Variable"** for each:

   | Key | Value |
   |----|-------|
   | `DATABASE_URL` | `postgresql://nidhione:PASSWORD@HOST:5432/nidhione` *(paste your connection string)* |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | *(paste your generated secret from openssl command)* |
   | `FRONTEND_URL` | *(leave blank for now - update after step 4)* |
   | `PRICE_UPDATE_CRON` | `0 */6 * * *` |
   | `SIP_EXECUTION_CRON` | `0 9 * * *` |
   | `RECURRING_CASHFLOW_CRON` | `0 1 * * *` |

8. **Click "Save"** - backend will redeploy automatically

9. **Wait for deployment to finish**
   - Check the **"Logs"** tab for success message
   - Look for: `🚀 Server running on http://localhost:3000`
   - If there are errors, check the logs carefully

10. **Copy Backend URL**
    - At the top of the service page, find the public URL
    - Format: `https://nidhione-backend.onrender.com`
    - **Save this - you'll need it for the frontend**

---

## 🎨 Step 3: Deploy Frontend Static Site

1. **From Dashboard, click "New"** → **"Static Site"**

2. **Connect GitHub (same process)**
   - Select `nidhione` repository

3. **Configure Static Site**
   ```
   Name:              nidhione-frontend
   Root Directory:    frontend
   ```

4. **Build Command**
   ```
   npm install && npm run build
   ```

5. **Publish Directory**
   ```
   dist
   ```

6. **Click "Create Static Site"**

7. **Add Environment Variables**
   - Go to **"Environment"** tab
   - Add:

   | Key | Value |
   |----|-------|
   | `VITE_API_URL` | `https://nidhione-backend.onrender.com/api` *(use your actual backend URL)* |

8. **Click "Save"** - frontend will deploy and build

9. **Wait for deployment**
   - Check **"Logs"** tab
   - Look for success message

10. **Copy Frontend URL**
    - Format: `https://nidhione-frontend.onrender.com`

---

## ✏️ Step 4: Update Backend FRONTEND_URL

Now that frontend is deployed, update the backend:

1. **Click on `nidhione-backend` service**
2. Go to **"Environment"** tab
3. Find `FRONTEND_URL` variable
4. Update the value to your frontend URL: `https://nidhione-frontend.onrender.com`
5. Click **"Save"**
6. Backend will redeploy automatically

---

## ✅ Verify Everything Works

### 1. **Test Frontend**
```
Visit: https://nidhione-frontend.onrender.com
You should see the login page ✅
```

### 2. **Test Backend API**
```
curl https://nidhione-backend.onrender.com/api/health

Expected response:
{"status":"ok","timestamp":"2025-05-28T..."}
```

### 3. **Test Full Flow**
- Go to frontend URL
- Click "Sign Up"
- Create a test account
- You should be logged in and see the dashboard
- No CORS errors in browser console
- Dashboard loads data from API

---

## 🐛 Troubleshooting

### Frontend shows "Cannot GET /"
**Problem:** Build didn't complete or publish directory is wrong
**Solution:**
- Check "Logs" tab for build errors
- Verify publish directory is `dist`
- Clear browser cache (Cmd+Shift+Delete)
- Rebuild: Click service → "Manual Deploy"

### Backend gives 502 Bad Gateway
**Problem:** Service is crashing
**Solution:**
- Check logs for errors
- Most common: DATABASE_URL is incorrect
- Verify DATABASE_URL format and credentials
- Check if PostgreSQL service is running

### CORS errors in console
**Problem:** Backend doesn't recognize frontend origin
**Solution:**
- Update `FRONTEND_URL` in backend environment
- Use exact URL: `https://nidhione-frontend.onrender.com`
- Redeploy backend after updating

### Can't login / Auth fails
**Problem:** JWT_SECRET mismatch or missing
**Solution:**
- Verify `JWT_SECRET` is set in backend
- Must be the same secret as when you generated it
- Regenerate if unsure: `openssl rand -base64 32`

### Database migrations fail
**Problem:** Schema issues or migration errors
**Solution:**
- Check logs for specific error
- Verify DATABASE_URL is correct and active
- Check if PostgreSQL is accessible
- Run: `npx prisma db push` locally to test

---

## 📊 Monitoring

### View Logs
- Each service → **"Logs"** tab
- Real-time streaming of errors and info

### View Metrics
- Each service → **"Metrics"** tab
- CPU, memory, and network usage

### Check Status
- Each service → Overview shows deployment status
- Green = healthy, Yellow = deploying, Red = failed

---

## 💡 Pro Tips

1. **Keep Backend Active**
   - Free tier spins down after 15 min of inactivity
   - Set up uptime monitoring to keep it active
   - Consider Hobby plan ($7/month) for continuous operation

2. **Database Backup**
   - Render deletes free DB data after 7 days of inactivity
   - Regularly export data if important

3. **Custom Domain**
   - In service settings, you can add a custom domain
   - Requires DNS configuration

4. **Environment Secrets**
   - Use environment variables for all secrets
   - Never commit secrets to GitHub

---

## 🎉 Success Checklist

- [ ] PostgreSQL database created and accessible
- [ ] Backend deployed and running (check /health endpoint)
- [ ] Frontend deployed and loads
- [ ] Can create account through UI
- [ ] Can login successfully
- [ ] Dashboard shows data from API
- [ ] No console errors or CORS issues

**You're all set!** Your NidhiOne app is live on Render! 🚀

---

## Next Steps

- Set up a custom domain for professional URL
- Configure automated backups
- Monitor uptime with external monitoring service
- Consider upgrading to paid tier for production use
