# NidhiOne - Wealth Management Platform

A comprehensive wealth management software designed for the Indian ecosystem. Track your investments across stocks, mutual funds, goals, and various asset classes with real-time price updates and beautiful dashboards.

## 🌟 Features

### Current Features (v1.0)
- ✅ **Authentication** - Secure JWT-based authentication
- ✅ **Dashboard** - Portfolio overview with charts and analytics
- ✅ **Stocks Management** - Track NSE/BSE stocks with real-time prices via Yahoo Finance API
- ✅ **Mutual Funds** - Track mutual funds with real-time NAV via AMFI API
- ✅ **SIP Automation** - Automated SIP execution with cron jobs
- ✅ **Goals Tracking** - Set and track financial goals
- ✅ **Asset Allocation** - Visual representation of portfolio distribution
- ✅ **Performance Comparison** - Compare returns across asset classes
- ✅ **XIRR Calculation** - Accurate time-weighted returns

### Supported Asset Classes
- 💹 Stocks (NSE/BSE)
- 🏦 Mutual Funds (with SIP support)
- 💰 Bank Accounts
- 📊 Fixed Deposits
- 📈 Bonds
- 🛡️ LIC Policies
- 💎 PPF
- 🎯 NPS
- 🥇 Gold (Physical/Digital/ETF)
- 🏘️ Real Estate
- 👔 EPF
- ₿ Cryptocurrency

## 🛠️ Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Fastify** - Fast and low overhead web framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **node-cron** - Scheduled jobs for price updates and SIP execution
- **Axios** - HTTP client for external APIs
- **Zod** - Schema validation
- **bcryptjs** - Password hashing

### Frontend
- **React 18** + **TypeScript**
- **Material UI (MUI v5)** - UI component library
- **Redux Toolkit** - State management
- **RTK Query** - Data fetching and caching
- **React Router v6** - Routing
- **Recharts** - Charts and visualizations
- **Vite** - Build tool

## 📁 Project Structure

```
NidhiOne/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Auth middleware
│   │   ├── routes/                # API routes
│   │   ├── jobs/                  # Cron jobs
│   │   ├── utils/                 # Utility functions (APIs, XIRR)
│   │   └── server.ts              # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/                   # Redux store
    │   ├── features/              # Feature modules
    │   │   ├── auth/              # Authentication
    │   │   ├── dashboard/         # Dashboard
    │   │   ├── stocks/            # Stocks management
    │   │   ├── mutualFunds/       # Mutual funds management
    │   │   └── goals/             # Goals tracking
    │   ├── layouts/               # Layout components
    │   ├── routes/                # Routing
    │   ├── theme/                 # MUI theme
    │   ├── utils/                 # Utility functions
    │   └── main.tsx               # Entry point
    ├── package.json
    └── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nidhione?schema=public"
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
```

5. Run Prisma migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

6. Start development server:
```bash
npm run dev
```

Backend will run on **http://localhost:3000**

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Dashboard
- `GET /api/dashboard` - Get portfolio overview
- `GET /api/dashboard/allocation` - Get asset allocation
- `GET /api/dashboard/performance` - Get performance metrics

### Stocks
- `GET /api/stocks` - Get all stocks
- `POST /api/stocks` - Add new stock
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

### Mutual Funds
- `GET /api/mutual-funds` - Get all mutual funds
- `POST /api/mutual-funds` - Add new mutual fund
- `PUT /api/mutual-funds/:id` - Update mutual fund
- `DELETE /api/mutual-funds/:id` - Delete mutual fund
- `GET /api/mutual-funds/search?query=` - Search mutual funds

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## 🔄 Cron Jobs

### Price Update Job
- **Schedule**: Every 6 hours (configurable)
- **Function**: Updates stock prices from Yahoo Finance and mutual fund NAVs from AMFI

### SIP Execution Job
- **Schedule**: Daily at 9 AM (configurable)
- **Function**: Executes pending SIPs and updates mutual fund holdings

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- CORS enabled
- Environment variables for sensitive data

## 📊 External APIs

### Yahoo Finance API
- **Usage**: Real-time stock prices for NSE/BSE
- **Cost**: Free
- **Rate Limit**: No API key required

### AMFI India NAV API
- **Usage**: Daily NAV for mutual funds
- **Cost**: Free
- **Endpoint**: https://www.amfiindia.com/spages/NAVAll.txt

## 🚀 Deployment

Ready to deploy? We support Railway (recommended for free tier):

**Quick Deploy to Railway:**
- See [DEPLOY_CHEATSHEET.md](DEPLOY_CHEATSHEET.md) for quick reference
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step guide

**Free Tier:** Railway offers $5/month free credit (perfect for hobby projects)  
**Deployment Time:** 15-25 minutes  
**Capacity:** Handles 50-200 concurrent users on free tier

## 🎯 Future Enhancements

- [ ] Family account support (multi-user)
- [ ] Tax harvesting insights (LTCG/STCG)
- [ ] Dividend tracking
- [ ] Corporate actions (bonus, split)
- [ ] Portfolio rebalancing suggestions
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced charting
- [ ] Export to Excel/PDF
- [ ] Integration with Account Aggregator framework
- [ ] Complete mutual funds UI with SIP management
- [ ] Additional asset classes UI (Bank, FD, Bonds, etc.)

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

MIT License

## 👨‍💻 Developer

Built with ❤️ for the Indian investment community

---

**Happy Investing! 📈**
