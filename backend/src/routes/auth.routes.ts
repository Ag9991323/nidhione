import { FastifyInstance } from 'fastify';
import { register, login, getProfile } from '../controllers/auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.get('/profile', { onRequest: [fastify.authenticate] }, getProfile);
}
