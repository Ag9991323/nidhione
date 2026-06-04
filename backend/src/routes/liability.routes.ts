import { FastifyInstance } from 'fastify';
import {
  getAllLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
} from '../controllers/liability.controller';
import { authenticate } from '../middleware/auth';

export async function liabilityRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', getAllLiabilities);
  fastify.post('/', createLiability);
  fastify.put('/:id', updateLiability);
  fastify.delete('/:id', deleteLiability);
}
