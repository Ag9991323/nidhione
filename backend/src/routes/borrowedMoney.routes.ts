import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import {
  getAllBorrowedMoney,
  createBorrowedMoney,
  updateBorrowedMoney,
  deleteBorrowedMoney,
} from '../controllers/borrowedMoney.controller';

export default async function borrowedMoneyRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', getAllBorrowedMoney);
  fastify.post('/', createBorrowedMoney);
  fastify.put('/:id', updateBorrowedMoney);
  fastify.delete('/:id', deleteBorrowedMoney);
}
