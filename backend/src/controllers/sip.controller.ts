import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createSIPSchema = z.object({
  mfId: z.string(),
  amount: z.number().positive(),
  startDate: z.string(),
  frequency: z.enum(['monthly', 'quarterly']).default('monthly'),
  goalId: z.string().optional(),
});

const updateSIPSchema = z.object({
  amount: z.number().positive().optional(),
  frequency: z.enum(['monthly', 'quarterly']).optional(),
  status: z.enum(['active', 'paused', 'stopped']).optional(),
  goalId: z.string().optional().nullable(),
});

// Helper function to calculate next execution date
function calculateNextExecutionDate(startDate: Date, frequency: string): Date {
  const next = new Date(startDate);
  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === 'quarterly') {
    next.setMonth(next.getMonth() + 3);
  }
  return next;
}

export async function getAllSIPs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const sips = await prisma.sIP.findMany({
      where: { userId },
      include: {
        mutualFund: {
          select: {
            id: true,
            schemeName: true,
            schemeCode: true,
          },
        },
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return reply.send({ sips });
  } catch (error) {
    console.error('Get SIPs error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getSIPsByMutualFund(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { mfId } = request.params as { mfId: string };
    
    const sips = await prisma.sIP.findMany({
      where: { 
        userId,
        mfId,
      },
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
    
    return reply.send({ sips });
  } catch (error) {
    console.error('Get SIPs by MF error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createSIP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createSIPSchema.parse(request.body);
    
    // Verify mutual fund exists and belongs to user
    const mutualFund = await prisma.mutualFund.findFirst({
      where: {
        id: data.mfId,
        userId,
      },
    });
    
    if (!mutualFund) {
      return reply.code(404).send({ error: 'Mutual fund not found' });
    }
    
    const startDate = new Date(data.startDate);
    const nextExecutionDate = calculateNextExecutionDate(startDate, data.frequency);
    
    const sip = await prisma.sIP.create({
      data: {
        userId,
        mfId: data.mfId,
        amount: data.amount,
        startDate,
        frequency: data.frequency,
        nextExecutionDate,
        status: 'active',
        goalId: data.goalId,
      },
      include: {
        mutualFund: {
          select: {
            id: true,
            schemeName: true,
            schemeCode: true,
          },
        },
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return reply.code(201).send({ sip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create SIP error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateSIP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateSIPSchema.parse(request.body);
    
    // Verify SIP exists and belongs to user
    const existingSIP = await prisma.sIP.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingSIP) {
      return reply.code(404).send({ error: 'SIP not found' });
    }
    
    const sip = await prisma.sIP.update({
      where: { id },
      data,
      include: {
        mutualFund: {
          select: {
            id: true,
            schemeName: true,
            schemeCode: true,
          },
        },
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return reply.send({ sip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update SIP error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteSIP(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    // Verify SIP exists and belongs to user
    const existingSIP = await prisma.sIP.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingSIP) {
      return reply.code(404).send({ error: 'SIP not found' });
    }
    
    await prisma.sIP.delete({
      where: { id },
    });
    
    return reply.send({ message: 'SIP deleted successfully' });
  } catch (error) {
    console.error('Delete SIP error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
