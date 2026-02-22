import { FastifyInstance } from 'fastify';
import { getAllCrypto, createCrypto, updateCrypto, deleteCrypto } from '../controllers/crypto.controller';
import { authenticate } from '../middleware/auth';

export async function cryptoRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);
  
  fastify.get('/', getAllCrypto);
  fastify.post('/', createCrypto);
  fastify.put('/:id', updateCrypto);
  fastify.delete('/:id', deleteCrypto);
}
