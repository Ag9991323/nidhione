import { FastifyInstance } from 'fastify';
import {
  getAllCashflows,
  getCashflowSummary,
  getMonthlyTrend,
  createCashflow,
  updateCashflow,
  deleteCashflow,
} from '../controllers/cashflow.controller';

export default async function cashflowRoutes(fastify: FastifyInstance) {
  // Get all cashflows with optional filters
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllCashflows);

  // Get cashflow summary for a month
  fastify.get('/summary', { onRequest: [fastify.authenticate] }, getCashflowSummary);

  // Get monthly trend data
  fastify.get('/trend', { onRequest: [fastify.authenticate] }, getMonthlyTrend);

  // Create a new cashflow
  fastify.post('/', { onRequest: [fastify.authenticate] }, createCashflow);

  // Update a cashflow
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateCashflow);

  // Delete a cashflow
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteCashflow);
}
