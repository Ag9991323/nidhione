import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller';

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getProfile);
  fastify.put('/', { onRequest: [fastify.authenticate] }, updateProfile);
  fastify.post('/change-password', { onRequest: [fastify.authenticate] }, changePassword);
}
