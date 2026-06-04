import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';

const createBorrowedMoneySchema = z.object({
  lenderName: z.string(),
  amount: z.number().positive(),
  interestRate: z.number().min(0).optional(),
  borrowDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'partially_returned', 'fully_returned']).optional(),
  amountReturned: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateBorrowedMoneySchema = z.object({
  lenderName: z.string().optional(),
  amount: z.number().positive().optional(),
  interestRate: z.number().min(0).optional(),
  borrowDate: z.string().datetime().optional(),
  returnDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'partially_returned', 'fully_returned']).optional(),
  amountReturned: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function getAllBorrowedMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const borrowedMoney = await prisma.borrowedMoney.findMany({
      where: { userId },
      orderBy: { borrowDate: 'desc' },
    });

    return reply.send(borrowedMoney);
  } catch (error) {
    console.error('Get borrowed money error:', error);
    return reply.status(500).send({ error: 'Failed to fetch borrowed money records' });
  }
}

export async function createBorrowedMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const validatedData = createBorrowedMoneySchema.parse(request.body);

    const borrowedMoney = await prisma.borrowedMoney.create({
      data: {
        userId,
        lenderName: validatedData.lenderName,
        amount: validatedData.amount,
        interestRate: validatedData.interestRate,
        borrowDate: new Date(validatedData.borrowDate),
        returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : null,
        status: validatedData.status || 'pending',
        amountReturned: validatedData.amountReturned || 0,
        notes: validatedData.notes,
      },
    });

    return reply.status(201).send(borrowedMoney);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Create borrowed money error:', error);
    return reply.status(500).send({ error: 'Failed to create borrowed money record' });
  }
}

export async function updateBorrowedMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const validatedData = updateBorrowedMoneySchema.parse(request.body);

    // Check if record exists and belongs to user
    const existing = await prisma.borrowedMoney.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Borrowed money record not found' });
    }

    const updateData: any = {};
    if (validatedData.lenderName !== undefined) updateData.lenderName = validatedData.lenderName;
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount;
    if (validatedData.interestRate !== undefined)
      updateData.interestRate = validatedData.interestRate;
    if (validatedData.borrowDate !== undefined)
      updateData.borrowDate = new Date(validatedData.borrowDate);
    if (validatedData.returnDate !== undefined)
      updateData.returnDate = validatedData.returnDate ? new Date(validatedData.returnDate) : null;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.amountReturned !== undefined)
      updateData.amountReturned = validatedData.amountReturned;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;

    const borrowedMoney = await prisma.borrowedMoney.update({
      where: { id },
      data: updateData,
    });

    return reply.send(borrowedMoney);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Update borrowed money error:', error);
    return reply.status(500).send({ error: 'Failed to update borrowed money record' });
  }
}

export async function deleteBorrowedMoney(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    // Check if record exists and belongs to user
    const existing = await prisma.borrowedMoney.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Borrowed money record not found' });
    }

    await prisma.borrowedMoney.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete borrowed money error:', error);
    return reply.status(500).send({ error: 'Failed to delete borrowed money record' });
  }
}
