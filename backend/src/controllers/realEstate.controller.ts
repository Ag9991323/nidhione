import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import prisma from '../config/database';

const createRealEstateSchema = z.object({
  propertyType: z.string(),
  location: z.string(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().datetime(),
  currentValue: z.number().positive().optional(),
  liabilityId: z.string().optional(), // Link to home loan
});

const updateRealEstateSchema = z.object({
  propertyType: z.string().optional(),
  location: z.string().optional(),
  purchasePrice: z.number().positive().optional(),
  purchaseDate: z.string().datetime().optional(),
  currentValue: z.number().positive().optional(),
  liabilityId: z.string().nullable().optional(), // Allow null to remove link
});

export async function getAllRealEstate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    
    const realEstates = await prisma.realEstate.findMany({
      where: { userId },
      include: {
        liability: true, // Include linked home loan if any
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return reply.send(realEstates);
  } catch (error) {
    console.error('Get real estate error:', error);
    return reply.status(500).send({ error: 'Failed to fetch real estate records' });
  }
}

export async function createRealEstate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const validatedData = createRealEstateSchema.parse(request.body);

    // If liabilityId is provided, verify it exists and is a home loan
    if (validatedData.liabilityId) {
      const liability = await prisma.liability.findFirst({
        where: { 
          id: validatedData.liabilityId, 
          userId,
          type: 'home_loan'
        },
      });

      if (!liability) {
        return reply.status(400).send({ error: 'Invalid home loan reference' });
      }
    }

    const realEstate = await prisma.realEstate.create({
      data: {
        userId,
        propertyType: validatedData.propertyType,
        location: validatedData.location,
        purchasePrice: validatedData.purchasePrice,
        purchaseDate: new Date(validatedData.purchaseDate),
        currentValue: validatedData.currentValue,
        liabilityId: validatedData.liabilityId,
      },
      include: {
        liability: true,
      },
    });

    return reply.status(201).send(realEstate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Create real estate error:', error);
    return reply.status(500).send({ error: 'Failed to create real estate record' });
  }
}

export async function updateRealEstate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const validatedData = updateRealEstateSchema.parse(request.body);

    // Check if record exists and belongs to user
    const existing = await prisma.realEstate.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Real estate record not found' });
    }

    // If liabilityId is provided, verify it exists and is a home loan
    if (validatedData.liabilityId !== undefined && validatedData.liabilityId !== null) {
      const liability = await prisma.liability.findFirst({
        where: { 
          id: validatedData.liabilityId, 
          userId,
          type: 'home_loan'
        },
      });

      if (!liability) {
        return reply.status(400).send({ error: 'Invalid home loan reference' });
      }
    }

    const updateData: any = {};
    if (validatedData.propertyType !== undefined) updateData.propertyType = validatedData.propertyType;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.purchasePrice !== undefined) updateData.purchasePrice = validatedData.purchasePrice;
    if (validatedData.purchaseDate !== undefined) updateData.purchaseDate = new Date(validatedData.purchaseDate);
    if (validatedData.currentValue !== undefined) updateData.currentValue = validatedData.currentValue;
    if (validatedData.liabilityId !== undefined) {
      updateData.liabilityId = validatedData.liabilityId;
    }

    const realEstate = await prisma.realEstate.update({
      where: { id },
      data: updateData,
      include: {
        liability: true,
      },
    });

    return reply.send(realEstate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: 'Invalid data', details: error.errors });
    }
    console.error('Update real estate error:', error);
    return reply.status(500).send({ error: 'Failed to update real estate record' });
  }
}

export async function deleteRealEstate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    // Check if record exists and belongs to user
    const existing = await prisma.realEstate.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Real estate record not found' });
    }

    await prisma.realEstate.delete({
      where: { id },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error('Delete real estate error:', error);
    return reply.status(500).send({ error: 'Failed to delete real estate record' });
  }
}
