import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import {
  getAllLendMoney,
  createLendMoney,
  updateLendMoney,
  deleteLendMoney,
} from '../controllers/lendMoney.controller';

export default async function lendMoneyRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', getAllLendMoney);
  fastify.post('/', createLendMoney);
  fastify.put('/:id', updateLendMoney);
  fastify.delete('/:id', deleteLendMoney);
}
