import { FastifyInstance } from 'fastify';
import {
  getAllMutualFunds,
  createMutualFund,
  updateMutualFund,
  deleteMutualFund,
  searchMF,
} from '../controllers/mutualFunds.controller';

export async function mutualFundsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllMutualFunds);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createMutualFund);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateMutualFund);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteMutualFund);
  fastify.get('/search', { onRequest: [fastify.authenticate] }, searchMF);
}
