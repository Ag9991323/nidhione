import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import prisma from '../config/database';

// Zod schema for creating a track record
const createTrackRecordSchema = z.object({
  userId: z.string(),
  snapshotDate: z.string(), // ISO date string
  netWorth: z.number(),
  totalAssets: z.number(),
  totalLiabilities: z.number(),
});

export default async function trackRecordRoutes(fastify: FastifyInstance) {
  // Create a new track record (monthly snapshot)
  fastify.post('/', async (request, reply) => {
    const result = createTrackRecordSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: 'Invalid data', details: result.error.errors });
    }
    const { userId, snapshotDate, netWorth, totalAssets, totalLiabilities } = result.data;
    try {
      const record = await prisma.trackRecord.create({
        data: {
          userId,
          snapshotDate: new Date(snapshotDate),
          netWorth,
          totalAssets,
          totalLiabilities,
        },
      });
      return reply.send(record);
    } catch (err: any) {
      if (err.code === 'P2002') {
        return reply.status(409).send({ error: 'Snapshot for this month already exists.' });
      }
      return reply.status(500).send({ error: 'Failed to create track record', details: err.message });
    }
  });

  // Get all track records for a user
  fastify.get('/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    try {
      const records = await prisma.trackRecord.findMany({
        where: { userId },
        orderBy: { snapshotDate: 'asc' },
      });
      return reply.send(records);
    } catch (err: any) {
      return reply.status(500).send({ error: 'Failed to fetch track records', details: err.message });
    }
  });
}
