import { FastifyInstance } from 'fastify';
import {
  getAllGold,
  createGold,
  updateGold,
  deleteGold,
  getCurrentGoldPrice,
} from '../controllers/gold.controller';

export async function goldRoutes(fastify: FastifyInstance) {
  // Get current gold prices
  fastify.get('/prices', getCurrentGoldPrice);
  
  // Get all gold assets
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllGold);
  
  // Create gold asset
  fastify.post('/', { onRequest: [fastify.authenticate] }, createGold);
  
  // Update gold asset
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateGold);
  
  // Delete gold asset
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteGold);
}
