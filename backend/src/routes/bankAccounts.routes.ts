import { FastifyInstance } from 'fastify';
import {
  getAllBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from '../controllers/bankAccounts.controller';

export async function bankAccountsRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllBankAccounts);
  fastify.post('/', { onRequest: [fastify.authenticate] }, createBankAccount);
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateBankAccount);
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteBankAccount);
}
