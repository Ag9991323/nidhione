import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import prisma from './config/database';
import { authenticate } from './middleware/auth';

// Routes
import { authRoutes } from './routes/auth.routes';
import { stocksRoutes } from './routes/stocks.routes';
import { mutualFundsRoutes } from './routes/mutualFunds.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { goalsRoutes } from './routes/goals.routes';
import { fixedDepositsRoutes } from './routes/fixedDeposits.routes';
import { bankAccountsRoutes } from './routes/bankAccounts.routes';
import { recurringDepositsRoutes } from './routes/recurringDeposits.routes';
import { epfRoutes } from './routes/epf.routes';
import { cryptoRoutes } from './routes/crypto.routes';
import { licRoutes } from './routes/lic.routes';
import { liabilityRoutes } from './routes/liability.routes';
import lendMoneyRoutes from './routes/lendMoney.routes';
import borrowedMoneyRoutes from './routes/borrowedMoney.routes';
import realEstateRoutes from './routes/realEstate.routes';
import { profileRoutes } from './routes/profile.routes';
import sipRoutes from './routes/sip.routes';
import cashflowRoutes from './routes/cashflow.routes';
import { goldRoutes } from './routes/gold.routes';

// Cron jobs
import { startPriceUpdateCron } from './jobs/priceUpdateCron';
import { startSIPExecutionCron } from './jobs/sipExecutionCron';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'info' : 'error',
  },
});

// Declare authenticate decorator
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: config.nodeEnv === 'production' 
        ? [config.frontendUrl] 
        : true, // Allow all origins in development
      credentials: true,
    });

    await fastify.register(jwt, {
      secret: config.jwtSecret,
    });

    // Add authenticate decorator
    fastify.decorate('authenticate', authenticate);

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(stocksRoutes, { prefix: '/api/stocks' });
    await fastify.register(mutualFundsRoutes, { prefix: '/api/mutual-funds' });
    await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });
    await fastify.register(goalsRoutes, { prefix: '/api/goals' });
    await fastify.register(fixedDepositsRoutes, { prefix: '/api/fixed-deposits' });
    await fastify.register(bankAccountsRoutes, { prefix: '/api/bank-accounts' });
    await fastify.register(recurringDepositsRoutes, { prefix: '/api/recurring-deposits' });
    await fastify.register(epfRoutes, { prefix: '/api/epf' });
    await fastify.register(cryptoRoutes, { prefix: '/api/crypto' });
    await fastify.register(licRoutes, { prefix: '/api/lic' });
    await fastify.register(liabilityRoutes, { prefix: '/api/liabilities' });
    await fastify.register(lendMoneyRoutes, { prefix: '/api/lend-money' });
    await fastify.register(borrowedMoneyRoutes, { prefix: '/api/borrowed-money' });
    await fastify.register(realEstateRoutes, { prefix: '/api/real-estate' });
    await fastify.register(profileRoutes, { prefix: '/api/profile' });
    await fastify.register(sipRoutes, { prefix: '/api/sips' });
    await fastify.register(cashflowRoutes, { prefix: '/api/cashflows' });
    await fastify.register(goldRoutes, { prefix: '/api/gold' });
    // Track Record monthly snapshot routes
    const trackRecordRoutes = (await import('./routes/trackRecord.routes')).default;
    await fastify.register(trackRecordRoutes, { prefix: '/api/track-records' });
    

    // Start cron jobs
    startPriceUpdateCron();
    startSIPExecutionCron();

    // Start server
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📊 Environment: ${config.nodeEnv}`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
