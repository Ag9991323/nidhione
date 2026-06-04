import { FastifyInstance } from 'fastify';
import { getAllLIC, createLIC, updateLIC, deleteLIC } from '../controllers/lic.controller';
import { authenticate } from '../middleware/auth';

export async function licRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', getAllLIC);
  fastify.post('/', createLIC);
  fastify.put('/:id', updateLIC);
  fastify.delete('/:id', deleteLIC);
}
