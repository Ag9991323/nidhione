import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createEPFSchema = z.object({
  balance: z.number().positive(),
  goalId: z.string().optional(),
});

const updateEPFSchema = z.object({
  balance: z.number().positive().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllEPFs(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const epfAccounts = await prisma.ePF.findMany({
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
    
    return reply.send({ epfAccounts });
  } catch (error) {
    console.error('Get EPF accounts error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createEPF(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createEPFSchema.parse(request.body);
    
    const epfAccount = await prisma.ePF.create({
      data: {
        userId,
        balance: data.balance,
        goalId: data.goalId,
        lastUpdated: new Date(),
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
    
    return reply.code(201).send({ epfAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create EPF account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateEPF(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateEPFSchema.parse(request.body);
    
    const existingEPF = await prisma.ePF.findFirst({
      where: { id, userId },
    });
    
    if (!existingEPF) {
      return reply.code(404).send({ error: 'EPF account not found' });
    }
    
    const epfAccount = await prisma.ePF.update({
      where: { id },
      data: {
        balance: data.balance,
        goalId: data.goalId,
        lastUpdated: new Date(),
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
    
    return reply.send({ epfAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update EPF account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteEPF(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    const existingEPF = await prisma.ePF.findFirst({
      where: { id, userId },
    });
    
    if (!existingEPF) {
      return reply.code(404).send({ error: 'EPF account not found' });
    }
    
    await prisma.ePF.delete({
      where: { id },
    });
    
    return reply.send({ message: 'EPF account deleted successfully' });
  } catch (error) {
    console.error('Delete EPF account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
