import { FastifyInstance } from 'fastify';
import { register, login, getProfile, googleLogin } from '../controllers/auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.post('/google', googleLogin);
  fastify.get('/profile', { onRequest: [fastify.authenticate] }, getProfile);
}
