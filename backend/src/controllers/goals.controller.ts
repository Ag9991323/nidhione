import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';
import type { Stock, MutualFund, BankAccount, FixedDeposit, Goal } from '@prisma/client';

const createGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  targetDate: z.string().datetime(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().datetime().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export async function getAllGoals(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        stocks: true,
        mutualFunds: true,
        bankAccounts: true,
        fixedDeposits: true,
      },
      orderBy: { targetDate: 'asc' },
    });
    
    // Calculate current amount for each goal
    type GoalWithRelations = Goal & {
      stocks: Stock[];
      mutualFunds: MutualFund[];
      bankAccounts: BankAccount[];
      fixedDeposits: FixedDeposit[];
    };
    
    const goalsWithProgress = goals.map((goal: GoalWithRelations) => {
      const stocksValue = goal.stocks.reduce((sum: number, s: Stock) => sum + (s.currentValue || s.investedAmount), 0);
      const mfValue = goal.mutualFunds.reduce((sum: number, m: MutualFund) => sum + (m.currentValue || m.investedAmount), 0);
      const bankValue = goal.bankAccounts.reduce((sum: number, b: BankAccount) => sum + b.balance, 0);
      const fdValue = goal.fixedDeposits.reduce((sum: number, f: FixedDeposit) => sum + f.amount, 0);
      
      const currentAmount = stocksValue + mfValue + bankValue + fdValue;
      const progress = (currentAmount / goal.targetAmount) * 100;
      
      return {
        ...goal,
        currentAmount,
        progress: Math.min(progress, 100),
      };
    });
    
    return reply.send({ goals: goalsWithProgress });
  } catch (error) {
    console.error('Get goals error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createGoal(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createGoalSchema.parse(request.body);
    
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: new Date(data.targetDate),
        category: data.category,
        description: data.description,
      },
    });
    
    return reply.code(201).send({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create goal error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateGoal(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateGoalSchema.parse(request.body);
    
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });
    
    if (!existingGoal) {
      return reply.code(404).send({ error: 'Goal not found' });
    }
    
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        name: data.name,
        targetAmount: data.targetAmount,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        category: data.category,
        description: data.description,
      },
    });
    
    return reply.send({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update goal error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteGoal(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });
    
    if (!existingGoal) {
      return reply.code(404).send({ error: 'Goal not found' });
    }
    
    await prisma.goal.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
