import { FastifyInstance } from 'fastify';
import { importHoldings } from '../controllers/import.controller';

export async function importRoutes(fastify: FastifyInstance) {
  fastify.post('/holdings', { onRequest: [fastify.authenticate] }, importHoldings);
}
