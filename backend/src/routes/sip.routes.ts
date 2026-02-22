import { FastifyInstance } from 'fastify';
import { getAllSIPs, getSIPsByMutualFund, createSIP, updateSIP, deleteSIP } from '../controllers/sip.controller';

export default async function sipRoutes(fastify: FastifyInstance) {
  // Get all SIPs for the user
  fastify.get('/', { onRequest: [fastify.authenticate] }, getAllSIPs);
  
  // Get SIPs for a specific mutual fund
  fastify.get('/mutual-fund/:mfId', { onRequest: [fastify.authenticate] }, getSIPsByMutualFund);
  
  // Create a new SIP
  fastify.post('/', { onRequest: [fastify.authenticate] }, createSIP);
  
  // Update a SIP
  fastify.put('/:id', { onRequest: [fastify.authenticate] }, updateSIP);
  
  // Delete a SIP
  fastify.delete('/:id', { onRequest: [fastify.authenticate] }, deleteSIP);
}
