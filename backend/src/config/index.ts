import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  databaseUrl: process.env.DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cron: {
    priceUpdate: process.env.PRICE_UPDATE_CRON || '0 */6 * * *',
    sipExecution: process.env.SIP_EXECUTION_CRON || '0 9 * * *',
    recurringCashflow: process.env.RECURRING_CASHFLOW_CRON || '0 1 * * *',
  },
};
