import { FastifyInstance } from 'fastify';
import { getAllStocks, createStock, updateStock, deleteStock, searchStock } from '../controllers/stocks.controller';

export async function stocksRoutes(fastify: FastifyInstance) {
  fastify.get('/search', { onRequest: [fastify.authenticate] }, searchStock);
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllStocks);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createStock);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateStock);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteStock);
}
