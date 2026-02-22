import { FastifyInstance } from 'fastify';
import { getAllGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goals.controller';

export async function goalsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllGoals);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createGoal);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateGoal);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteGoal);
}
