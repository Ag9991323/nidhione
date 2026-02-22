import { FastifyInstance } from 'fastify';
import { getDashboard, getAssetAllocation, getPerformance } from '../controllers/dashboard.controller';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getDashboard);
  fastify.get('/allocation', { onRequest: [fastify.authenticate] }, getAssetAllocation);
  fastify.get('/performance', { onRequest: [fastify.authenticate] }, getPerformance);
}
