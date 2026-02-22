import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createLICSchema = z.object({
  policyNumber: z.string().min(1),
  policyName: z.string().min(1),
  sumAssured: z.number().positive(),
  premiumAmount: z.number().positive(),
  maturityDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  currentValue: z.number().optional(),
  goalId: z.string().optional(),
});

const updateLICSchema = createLICSchema.partial();

export async function getAllLIC(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const licPolicies = await prisma.lIC.findMany({
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
    
    return reply.send(licPolicies);
  } catch (error) {
    console.error('Get LIC error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createLIC(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createLICSchema.parse(request.body);
    
    const lic = await prisma.lIC.create({
      data: {
        userId,
        policyNumber: data.policyNumber,
        policyName: data.policyName,
        sumAssured: data.sumAssured,
        premiumAmount: data.premiumAmount,
        maturityDate: new Date(data.maturityDate),
        currentValue: data.currentValue || data.sumAssured,
        ...(data.goalId && { goalId: data.goalId }),
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
    
    return reply.code(201).send(lic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create LIC error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateLIC(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;
    const data = updateLICSchema.parse(request.body);
    
    // Check ownership
    const existing = await prisma.lIC.findFirst({
      where: { id, userId },
    });
    
    if (!existing) {
      return reply.code(404).send({ error: 'LIC policy not found' });
    }
    
    const updateData: any = {};
    if (data.policyNumber) updateData.policyNumber = data.policyNumber;
    if (data.policyName) updateData.policyName = data.policyName;
    if (data.sumAssured !== undefined) updateData.sumAssured = data.sumAssured;
    if (data.premiumAmount !== undefined) updateData.premiumAmount = data.premiumAmount;
    if (data.maturityDate) updateData.maturityDate = new Date(data.maturityDate);
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
    if (data.goalId !== undefined) updateData.goalId = data.goalId;
    
    const lic = await prisma.lIC.update({
      where: { id },
      data: updateData,
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    return reply.send(lic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update LIC error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteLIC(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { id } = request.params as { id: string };
    const userId = (request.user as any).userId;
    
    // Check ownership
    const existing = await prisma.lIC.findFirst({
      where: { id, userId },
    });
    
    if (!existing) {
      return reply.code(404).send({ error: 'LIC policy not found' });
    }
    
    await prisma.lIC.delete({
      where: { id },
    });
    
    return reply.send({ message: 'LIC policy deleted successfully' });
  } catch (error) {
    console.error('Delete LIC error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
