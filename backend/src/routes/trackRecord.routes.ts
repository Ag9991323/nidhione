import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { getTrackRecords } from '../controllers/trackRecord.controller';

export default async function trackRecordRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', {}, getTrackRecords);
}
