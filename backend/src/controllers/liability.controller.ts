import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createLiabilitySchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'home_loan',
    'car_loan',
    'personal_loan',
    'credit_card',
    'education_loan',
    'other',
  ]),
  principalAmount: z.number().positive(),
  currentBalance: z.number().min(0),
  interestRate: z.number().min(0),
  emiAmount: z.number().positive().optional(),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  endDate: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), {
      message: 'Invalid date format',
    })
    .optional(),
  lender: z.string().optional(),
});

const updateLiabilitySchema = createLiabilitySchema.partial();

export async function getAllLiabilities(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const liabilities = await prisma.liability.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(liabilities);
  } catch (error) {
    console.error('Get liabilities error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createLiability(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createLiabilitySchema.parse(request.body);

    const liability = await prisma.liability.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        principalAmount: data.principalAmount,
        currentBalance: data.currentBalance,
        interestRate: data.interestRate,
        emiAmount: data.emiAmount,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        lender: data.lender,
      },
    });

    return reply.code(201).send(liability);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create liability error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateLiability(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;
    const data = updateLiabilitySchema.parse(request.body);

    // Check ownership
    const existing = await prisma.liability.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'Liability not found' });
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.type) updateData.type = data.type;
    if (data.principalAmount !== undefined) updateData.principalAmount = data.principalAmount;
    if (data.currentBalance !== undefined) updateData.currentBalance = data.currentBalance;
    if (data.interestRate !== undefined) updateData.interestRate = data.interestRate;
    if (data.emiAmount !== undefined) updateData.emiAmount = data.emiAmount;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.lender !== undefined) updateData.lender = data.lender;

    const liability = await prisma.liability.update({
      where: { id },
      data: updateData,
    });

    return reply.send(liability);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update liability error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteLiability(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;

    // Check ownership
    const existing = await prisma.liability.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.code(404).send({ error: 'Liability not found' });
    }

    await prisma.liability.delete({
      where: { id },
    });

    return reply.send({ message: 'Liability deleted successfully' });
  } catch (error) {
    console.error('Delete liability error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
