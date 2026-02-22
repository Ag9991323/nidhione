import { FastifyInstance } from 'fastify';
import { getAllFixedDeposits, createFixedDeposit, updateFixedDeposit, deleteFixedDeposit } from '../controllers/fixedDeposits.controller';

export async function fixedDepositsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllFixedDeposits);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createFixedDeposit);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateFixedDeposit);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteFixedDeposit);
}
