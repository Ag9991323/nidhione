import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';
import { calculateCurrentRDValue, calculateMaturityAmount } from '../utils/rdCalculations';

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
    
    // Calculate current value for each RD
    const rdsWithCurrentValue = recurringDeposits.map((rd) => ({
      ...rd,
      currentValue: calculateCurrentRDValue(
        rd.startDate,
        rd.monthlyAmount,
        rd.interestRate,
        rd.tenure
      ),
    }));
    
    return reply.send({ recurringDeposits: rdsWithCurrentValue });
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
    
    // Calculate maturity amount using utility function
    const maturityAmount = calculateMaturityAmount(
      data.monthlyAmount,
      data.interestRate,
      data.tenure
    );
    
    // Calculate current value
    const currentValue = calculateCurrentRDValue(
      startDate,
      data.monthlyAmount,
      data.interestRate,
      data.tenure
    );
    
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
    
    // Return with current value
    return reply.code(201).send({ 
      recurringDeposit: {
        ...recurringDeposit,
        currentValue,
      }
    });
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
    const maturityAmount = calculateMaturityAmount(monthlyAmount, interestRate, tenure);
    
    // Calculate current value
    const currentValue = calculateCurrentRDValue(startDate, monthlyAmount, interestRate, tenure);
    
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
    
    // Return with current value
    return reply.send({
      recurringDeposit: {
        ...recurringDeposit,
        currentValue,
      }
    });
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
