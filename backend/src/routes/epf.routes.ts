import { FastifyInstance } from 'fastify';
import { getAllEPFs, createEPF, updateEPF, deleteEPF } from '../controllers/epf.controller';

export async function epfRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllEPFs);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createEPF);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateEPF);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteEPF);
}
