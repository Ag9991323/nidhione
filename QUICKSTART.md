# 🚀 Quick Start Guide - NidhiOne

## Prerequisites Check
- ✅ Node.js v18+ installed
- ✅ PostgreSQL v14+ installed and running
- ✅ npm or yarn package manager

## Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
cd /Users/creachdev/Desktop/NidhiOne
./setup.sh
```

This will:
- Install all backend dependencies
- Install all frontend dependencies
- Create .env files
- Run Prisma migrations

## Option 2: Manual Setup

### Step 1: Setup PostgreSQL Database

Create a new database:
```bash
psql postgres
CREATE DATABASE nidhione;
\q
```

### Step 2: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and update:
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/nidhione?schema=public"
JWT_SECRET="your-super-secret-key-change-this"
```

Run migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

Start backend:
```bash
npm run dev
```

Backend runs on: **http://localhost:3000**

### Step 3: Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on: **http://localhost:5173**

## 🎯 First Time Usage

1. Open **http://localhost:5173** in your browser
2. Click **Register** to create a new account
3. Fill in your details and register
4. You'll be automatically logged in to the dashboard

## 📊 Adding Your First Stock

1. Navigate to **Stocks** from the sidebar
2. Click **Add Stock** button
3. Enter stock details:
   - Symbol: `RELIANCE.NS` (for NSE) or `500325.BO` (for BSE)
   - Company Name: Reliance Industries
   - Exchange: NSE or BSE
   - Quantity: 10
   - Average Price: 2500
4. Click **Add**
5. The system will automatically fetch the current price from Yahoo Finance

## 🎯 Creating Your First Goal

1. Navigate to **Goals** from the sidebar
2. Click **Add Goal**
3. Enter goal details:
   - Goal Name: Retirement
   - Target Amount: 10000000 (1 Crore)
   - Target Date: 2050-12-31
   - Category: Retirement
4. Click **Add**
5. Link your stocks/MFs to this goal for progress tracking

## 🔄 Automatic Features

### Price Updates
- Runs every 6 hours automatically
- Updates stock prices from Yahoo Finance
- Updates mutual fund NAVs from AMFI

### SIP Execution
- Runs daily at 9 AM
- Automatically executes pending SIPs
- Updates mutual fund holdings

## 🛠️ Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio  # Open Prisma Studio (Database GUI)
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🐛 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `brew services start postgresql`
- Check database credentials in `backend/.env`
- Create database: `createdb nidhione`

### Port Already in Use
- Backend (3000): `lsof -ti:3000 | xargs kill -9`
- Frontend (5173): `lsof -ti:5173 | xargs kill -9`

### Prisma Migration Issues
```bash
cd backend
npx prisma migrate reset  # Reset database (WARNING: Deletes all data)
npx prisma migrate dev    # Create new migration
npx prisma generate       # Regenerate Prisma Client
```

## 📝 Default Cron Schedules

You can modify these in `backend/.env`:

```env
PRICE_UPDATE_CRON="0 */6 * * *"  # Every 6 hours
SIP_EXECUTION_CRON="0 9 * * *"   # Daily at 9 AM
```

## 🎉 You're All Set!

Start managing your wealth like a pro! 📈

For detailed documentation, check the main README.md
