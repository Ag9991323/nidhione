# NidhiOne Backend API

Wealth Management Platform for Indian Ecosystem

## Tech Stack

- Node.js + TypeScript
- Fastify (Web Framework)
- Prisma (ORM)
- PostgreSQL (Database)
- JWT Authentication
- node-cron (Scheduled Jobs)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup PostgreSQL database and create `.env` file:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run Prisma migrations:
```bash
npm run prisma:migrate
npm run prisma:generate
```

4. Start development server:
```bash
npm run dev
```

Server will run on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Dashboard
- `GET /api/dashboard` - Portfolio overview
- `GET /api/dashboard/allocation` - Asset allocation
- `GET /api/dashboard/performance` - Performance metrics

### Stocks
- `GET /api/stocks` - Get all user stocks
- `POST /api/stocks` - Add new stock
- `PUT /api/stocks/:id` - Update stock
- `DELETE /api/stocks/:id` - Delete stock

### Mutual Funds
- `GET /api/mutual-funds` - Get all MFs
- `POST /api/mutual-funds` - Add new MF
- `PUT /api/mutual-funds/:id` - Update MF
- `DELETE /api/mutual-funds/:id` - Delete MF

### SIPs
- `GET /api/sips` - Get all SIPs
- `POST /api/sips` - Create SIP
- `PUT /api/sips/:id` - Update SIP
- `DELETE /api/sips/:id` - Delete SIP

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
