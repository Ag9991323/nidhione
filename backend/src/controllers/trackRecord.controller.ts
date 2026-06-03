import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { syncCurrentMonthSnapshot } from '../services/snapshotService';

export async function getTrackRecords(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request.user as any).userId;
  try {
    await syncCurrentMonthSnapshot(userId);
    const records = await prisma.trackRecord.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'asc' },
    });
    return reply.send(records);
  } catch (err: any) {
    return reply.status(500).send({ error: 'Failed to fetch track records', details: err.message });
  }
}
