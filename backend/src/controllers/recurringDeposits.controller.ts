import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createRDSchema = z.object({
  bankName: z.string(),
  monthlyAmount: z.number().positive(),
  interestRate: z.number().positive(),
  startDate: z.string(),
  maturityDate: z.string(),
  tenure: z.number().positive(),
  goalId: z.string().optional(),
});

const updateRDSchema = z.object({
  bankName: z.string().optional(),
  monthlyAmount: z.number().positive().optional(),
  interestRate: z.number().positive().optional(),
  startDate: z.string().optional(),
  maturityDate: z.string().optional(),
  tenure: z.number().positive().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllRecurringDeposits(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const recurringDeposits = await prisma.recurringDeposit.findMany({
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
    
    return reply.send({ recurringDeposits });
  } catch (error) {
    console.error('Get recurring deposits error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createRecurringDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createRDSchema.parse(request.body);
    
    const startDate = new Date(data.startDate);
    const maturityDate = new Date(data.maturityDate);
    
    // Calculate maturity amount using RD formula
    // M = P * n * (n + 1) * r / (2 * 12 * 100) + P * n
    // Where: M = Maturity Amount, P = Monthly Installment, n = Number of quarters (tenure/3)
    // Simplified: For monthly compounding
    const n = data.tenure; // number of months
    const r = data.interestRate;
    const P = data.monthlyAmount;
    
    // RD Maturity = P * [((1 + r/400)^(4n/12) - 1) / (1 - (1 + r/400)^(-1/3))]
    // Simplified formula: M = P * n + P * n * (n + 1) * r / (2 * 12 * 100)
    const maturityAmount = P * n + (P * n * (n + 1) * r) / (2 * 12 * 100);
    
    const recurringDeposit = await prisma.recurringDeposit.create({
      data: {
        userId,
        bankName: data.bankName,
        monthlyAmount: data.monthlyAmount,
        interestRate: data.interestRate,
        startDate,
        maturityDate,
        tenure: data.tenure,
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
    
    return reply.code(201).send({ recurringDeposit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create recurring deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateRecurringDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateRDSchema.parse(request.body);
    
    const existingRD = await prisma.recurringDeposit.findFirst({
      where: { id, userId },
    });
    
    if (!existingRD) {
      return reply.code(404).send({ error: 'Recurring deposit not found' });
    }
    
    const monthlyAmount = data.monthlyAmount ?? existingRD.monthlyAmount;
    const interestRate = data.interestRate ?? existingRD.interestRate;
    const tenure = data.tenure ?? existingRD.tenure;
    const startDate = data.startDate ? new Date(data.startDate) : existingRD.startDate;
    const maturityDate = data.maturityDate ? new Date(data.maturityDate) : existingRD.maturityDate;
    
    // Recalculate maturity amount
    const n = tenure;
    const r = interestRate;
    const P = monthlyAmount;
    const maturityAmount = P * n + (P * n * (n + 1) * r) / (2 * 12 * 100);
    
    const recurringDeposit = await prisma.recurringDeposit.update({
      where: { id },
      data: {
        bankName: data.bankName,
        monthlyAmount,
        interestRate,
        startDate,
        maturityDate,
        tenure,
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
    
    return reply.send({ recurringDeposit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update recurring deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteRecurringDeposit(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    const existingRD = await prisma.recurringDeposit.findFirst({
      where: { id, userId },
    });
    
    if (!existingRD) {
      return reply.code(404).send({ error: 'Recurring deposit not found' });
    }
    
    await prisma.recurringDeposit.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Recurring deposit deleted successfully' });
  } catch (error) {
    console.error('Delete recurring deposit error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
