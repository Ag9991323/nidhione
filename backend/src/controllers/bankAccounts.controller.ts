import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createBankAccountSchema = z.object({
  bankName: z.string(),
  accountType: z.string(),
  balance: z.number(),
  goalId: z.string().optional(),
});

const updateBankAccountSchema = z.object({
  bankName: z.string().optional(),
  accountType: z.string().optional(),
  balance: z.number().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllBankAccounts(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const bankAccounts = await prisma.bankAccount.findMany({
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
    
    return reply.send({ bankAccounts });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createBankAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createBankAccountSchema.parse(request.body);
    
    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId,
        bankName: data.bankName,
        accountType: data.accountType,
        balance: data.balance,
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
    
    return reply.code(201).send({ bankAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create bank account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateBankAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateBankAccountSchema.parse(request.body);
    
    const existingAccount = await prisma.bankAccount.findFirst({
      where: { id, userId },
    });
    
    if (!existingAccount) {
      return reply.code(404).send({ error: 'Bank account not found' });
    }
    
    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        bankName: data.bankName,
        accountType: data.accountType,
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
    
    return reply.send({ bankAccount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update bank account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteBankAccount(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    const existingAccount = await prisma.bankAccount.findFirst({
      where: { id, userId },
    });
    
    if (!existingAccount) {
      return reply.code(404).send({ error: 'Bank account not found' });
    }
    
    await prisma.bankAccount.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Delete bank account error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
