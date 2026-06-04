import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createCryptoSchema = z.object({
  coinName: z.string().min(1),
  symbol: z.string().min(1),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  currentPrice: z.number().optional(),
  currentValue: z.number().optional(),
  goalId: z.string().optional(),
});

const updateCryptoSchema = createCryptoSchema.partial();

export async function getAllCrypto(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const cryptoAssets = await prisma.crypto.findMany({
      where: { userId },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(cryptoAssets);
  } catch (error) {
    console.error('Get crypto error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createCrypto(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createCryptoSchema.parse(request.body);

    const crypto = await prisma.crypto.create({
      data: {
        userId,
        coinName: data.coinName,
        symbol: data.symbol,
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        currentPrice: data.currentPrice,
        currentValue: data.currentValue || data.quantity * data.averagePrice,
        ...(data.goalId && { goalId: data.goalId }),
      },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reply.code(201).send(crypto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create crypto error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateCrypto(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;
    const data = updateCryptoSchema.parse(request.body);

    // Check ownership
    const existing = await prisma.crypto.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'Crypto asset not found' });
    }

    const updateData: any = {};
    if (data.coinName) updateData.coinName = data.coinName;
    if (data.symbol) updateData.symbol = data.symbol;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.averagePrice !== undefined) updateData.averagePrice = data.averagePrice;
    if (data.currentPrice !== undefined) updateData.currentPrice = data.currentPrice;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
    if (data.goalId !== undefined) updateData.goalId = data.goalId;

    const crypto = await prisma.crypto.update({
      where: { id },
      data: updateData,
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return reply.send(crypto);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update crypto error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteCrypto(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;

    // Check ownership
    const existing = await prisma.crypto.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'Crypto asset not found' });
    }

    await prisma.crypto.delete({
      where: { id },
    });

    return reply.send({ message: 'Crypto asset deleted successfully' });
  } catch (error) {
    console.error('Delete crypto error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
