import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createFDSchema = z.object({
  bankName: z.string(),
  amount: z.number().positive(),
  interestRate: z.number().positive(),
  startDate: z.string(),
  maturityDate: z.string(),
  goalId: z.string().optional(),
});

const updateFDSchema = z.object({
  bankName: z.string().optional(),
  amount: z.number().positive().optional(),
  interestRate: z.number().positive().optional(),
  startDate: z.string().optional(),
  maturityDate: z.string().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllFixedDeposits(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const fixedDeposits = await prisma.fixedDeposit.findMany({
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
    
    return reply.send({ fixedDeposits });
  } catch (error) {
    console.error('Get fixed deposits error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createFixedDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createFDSchema.parse(request.body);
    
    const startDate = new Date(data.startDate);
    const maturityDate = new Date(data.maturityDate);
    
    // Calculate maturity amount: A = P(1 + r/n)^(nt)
    // For simple calculation: A = P * (1 + r * t)
    const years = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const maturityAmount = data.amount * (1 + (data.interestRate / 100) * years);
    
    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId,
        bankName: data.bankName,
        amount: data.amount,
        interestRate: data.interestRate,
        startDate,
        maturityDate,
        maturityAmount,
        goalId: data.goalId,
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
    
    return reply.code(201).send({ fixedDeposit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create fixed deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateFixedDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateFDSchema.parse(request.body);
    
    const existingFD = await prisma.fixedDeposit.findFirst({
      where: { id, userId },
    });
    
    if (!existingFD) {
      return reply.code(404).send({ error: 'Fixed deposit not found' });
    }
    
    const amount = data.amount ?? existingFD.amount;
    const interestRate = data.interestRate ?? existingFD.interestRate;
    const startDate = data.startDate ? new Date(data.startDate) : existingFD.startDate;
    const maturityDate = data.maturityDate ? new Date(data.maturityDate) : existingFD.maturityDate;
    
    // Recalculate maturity amount
    const years = (maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    const maturityAmount = amount * (1 + (interestRate / 100) * years);
    
    const fixedDeposit = await prisma.fixedDeposit.update({
      where: { id },
      data: {
        bankName: data.bankName,
        amount,
        interestRate,
        startDate,
        maturityDate,
        maturityAmount,
        goalId: data.goalId,
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
    
    return reply.send({ fixedDeposit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update fixed deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteFixedDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    const existingFD = await prisma.fixedDeposit.findFirst({
      where: { id, userId },
    });
    
    if (!existingFD) {
      return reply.code(404).send({ error: 'Fixed deposit not found' });
    }
    
    await prisma.fixedDeposit.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Fixed deposit deleted successfully' });
  } catch (error) {
    console.error('Delete fixed deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
