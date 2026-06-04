import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';

const createLendMoneySchema = z.object({
  borrowerName: z.string(),
  amount: z.number().positive(),
  interestRate: z.number().min(0).optional(),
  lendDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'partially_returned', 'fully_returned']).optional(),
  amountReturned: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateLendMoneySchema = z.object({
  borrowerName: z.string().optional(),
  amount: z.number().positive().optional(),
  interestRate: z.number().min(0).optional(),
  lendDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'partially_returned', 'fully_returned']).optional(),
  amountReturned: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function getAllLendMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const lendMoney = await prisma.lendMoney.findMany({
      where: { userId },
      orderBy: { lendDate: 'desc' },
    });

    return reply.send(lendMoney);
  } catch (error) {
    console.error('Get lend money error:', error);
    return reply.status(500).send({ error: 'Failed to fetch lend money records' });
  }
}

export async function createLendMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const validatedData = createLendMoneySchema.parse(request.body);

    const lendMoney = await prisma.lendMoney.create({
      data: {
        userId,
        borrowerName: validatedData.borrowerName,
        amount: validatedData.amount,
        interestRate: validatedData.interestRate,
        lendDate: new Date(validatedData.lendDate),
        returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : null,
        status: validatedData.status || 'pending',
        amountReturned: validatedData.amountReturned || 0,
        notes: validatedData.notes,
      },
    });

    return reply.status(201).send(lendMoney);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Create lend money error:', error);
    return reply.status(500).send({ error: 'Failed to create lend money record' });
  }
}

export async function updateLendMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const validatedData = updateLendMoneySchema.parse(request.body);

    // Check if record exists and belongs to user
    const existing = await prisma.lendMoney.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Lend money record not found' });
    }

    const updateData: any = {};
    if (validatedData.borrowerName !== undefined)
      updateData.borrowerName = validatedData.borrowerName;
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
    if (validatedData.interestRate !== undefined)
      updateData.interestRate = validatedData.interestRate;
    if (validatedData.lendDate !== undefined)
      updateData.lendDate = new Date(validatedData.lendDate);
    if (validatedData.returnDate !== undefined)
      updateData.returnDate = validatedData.returnDate ? new Date(validatedData.returnDate) : null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.amountReturned !== undefined)
      updateData.amountReturned = validatedData.amountReturned;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const lendMoney = await prisma.lendMoney.update({
      where: { id },
      data: updateData,
    });

    return reply.send(lendMoney);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Update lend money error:', error);
    return reply.status(500).send({ error: 'Failed to update lend money record' });
  }
}

export async function deleteLendMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    // Check if record exists and belongs to user
    const existing = await prisma.lendMoney.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Lend money record not found' });
    }

    await prisma.lendMoney.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete lend money error:', error);
    return reply.status(500).send({ error: 'Failed to delete lend money record' });
  }
}
