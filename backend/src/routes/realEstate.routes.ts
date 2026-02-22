import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import {
  getAllRealEstate,
  createRealEstate,
  updateRealEstate,
  deleteRealEstate,
} from '../controllers/realEstate.controller';

export default async function realEstateRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', getAllRealEstate);
  fastify.post('/', createRealEstate);
  fastify.put('/:id', updateRealEstate);
  fastify.delete('/:id', deleteRealEstate);
}
