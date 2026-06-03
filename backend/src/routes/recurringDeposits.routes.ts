import { FastifyInstance } from 'fastify';
import {
  getAllRecurringDeposits,
  createRecurringDeposit,
  updateRecurringDeposit,
  deleteRecurringDeposit,
} from '../controllers/recurringDeposits.controller';

export async function recurringDepositsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllRecurringDeposits);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createRecurringDeposit);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateRecurringDeposit);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteRecurringDeposit);
}
