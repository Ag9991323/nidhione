import { FastifyRequest, FastifyReply } from 'fastify';

import prisma from '../config/database';

export async function createTrackRecord(request: FastifyRequest, reply: FastifyReply) {
  // ...validation is handled in the route
  const { userId, snapshotDate, netWorth, totalAssets, totalLiabilities } = request.body as any;
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
}

export async function getTrackRecords(request: FastifyRequest, reply: FastifyReply) {
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
}
