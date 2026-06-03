import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';
import { getLiveGoldPrice, getGoldPriceByPurity } from '../utils/goldAPI';
import { getStockPrice } from '../utils/yahooFinance';
import { calculateSimpleReturns } from '../utils/xirr';

const createGoldSchema = z.object({
  type: z.enum(['physical', 'digital', 'etf']),
  name: z.string().optional(),

  // For physical & digital
  quantityGrams: z.number().positive().optional(),
  purity: z.enum(['24K', '22K', '18K', '14K']).optional(),
  averagePricePerGram: z.number().positive().optional(),
  makingCharges: z.number().optional(),
  storageLocation: z.string().optional(),

  // For ETF
  schemeName: z.string().optional(),
  schemeCode: z.string().optional(),
  units: z.number().positive().optional(),
  averageNav: z.number().positive().optional(),

  investedAmount: z.number().positive(),
  goalId: z.string().optional(),
});

const updateGoldSchema = z.object({
  name: z.string().optional(),
  quantityGrams: z.number().positive().optional(),
  purity: z.enum(['24K', '22K', '18K', '14K']).optional(),
  averagePricePerGram: z.number().positive().optional(),
  makingCharges: z.number().optional(),
  storageLocation: z.string().optional(),
  units: z.number().positive().optional(),
  averageNav: z.number().positive().optional(),
  investedAmount: z.number().positive().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllGold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;

    const goldAssets = await prisma.gold.findMany({
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

    return reply.send({ goldAssets });
  } catch (error) {
    console.error('Get gold error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createGold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createGoldSchema.parse(request.body);

    let currentValue = data.investedAmount;
    let currentPricePerGram;
    let currentNav;
    let returns = 0;
    let returnsPercentage = 0;

    // Calculate current value based on type
    if (data.type === 'physical' || data.type === 'digital') {
      if (data.quantityGrams && data.purity) {
        currentPricePerGram = await getGoldPriceByPurity(data.purity);
        currentValue = data.quantityGrams * currentPricePerGram;

        // Add making charges for physical gold
        if (data.type === 'physical' && data.makingCharges) {
          // Making charges are added to invested amount but not current value
        }

        const result = calculateSimpleReturns(data.investedAmount, currentValue);
        returns = result.returns;
        returnsPercentage = result.returnsPercentage;
      }
    } else if (data.type === 'etf') {
      // For ETF, fetch current NAV from Yahoo Finance
      if (data.schemeCode && data.units) {
        currentNav = await getStockPrice(data.schemeCode);
        if (currentNav) {
          currentValue = data.units * currentNav;
          const result = calculateSimpleReturns(data.investedAmount, currentValue);
          returns = result.returns;
          returnsPercentage = result.returnsPercentage;
        }
      }
    }

    const gold = await prisma.gold.create({
      data: {
        userId,
        type: data.type,
        quantityGrams: data.quantityGrams ?? undefined,
        purity: data.purity,
        averagePricePerGram: data.averagePricePerGram ?? undefined,
        currentPricePerGram,
        makingCharges: data.makingCharges,
        storageLocation: data.storageLocation,
        schemeName: data.schemeName,
        schemeCode: data.schemeCode,
        units: data.units,
        averageNav: data.averageNav,
        currentNav,
        investedAmount: data.investedAmount,
        currentValue,
        returns,
        returnsPercentage,
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

    return reply.code(201).send({ gold });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create gold error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateGold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateGoldSchema.parse(request.body);

    // Verify gold asset exists and belongs to user
    const existingGold = await prisma.gold.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGold) {
      return reply.code(404).send({ error: 'Gold asset not found' });
    }

    // Prepare update data
    const updateData: any = { ...data };
    const existingData = existingGold as any;

    // Recalculate current value if relevant fields changed
    if (existingGold.type === 'physical' || existingGold.type === 'digital') {
      const grams = data.quantityGrams ?? existingGold.quantityGrams;
      const purity = data.purity ?? existingData.purity;

      if (grams && purity) {
        updateData.currentPricePerGram = await getGoldPriceByPurity(purity);
        updateData.currentValue = grams * updateData.currentPricePerGram;

        const invested = data.investedAmount ?? existingData.investedAmount;
        const result = calculateSimpleReturns(invested, updateData.currentValue);
        updateData.returns = result.returns;
        updateData.returnsPercentage = result.returnsPercentage;
      }
    } else if (existingGold.type === 'etf' && existingData.schemeCode) {
      const units = data.units ?? existingData.units;
      if (units) {
        const currentNav = await getStockPrice(existingData.schemeCode);
        if (currentNav) {
          updateData.currentNav = currentNav;
          updateData.currentValue = units * currentNav;

          const invested = data.investedAmount ?? existingData.investedAmount;
          const result = calculateSimpleReturns(invested, updateData.currentValue);
          updateData.returns = result.returns;
          updateData.returnsPercentage = result.returnsPercentage;
        }
      }
    }

    updateData.lastUpdated = new Date();

    const gold = await prisma.gold.update({
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

    return reply.send({ gold });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update gold error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteGold(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    // Verify gold asset exists and belongs to user
    const existingGold = await prisma.gold.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGold) {
      return reply.code(404).send({ error: 'Gold asset not found' });
    }

    await prisma.gold.delete({
      where: { id },
    });

    return reply.send({ message: 'Gold asset deleted successfully' });
  } catch (error) {
    console.error('Delete gold error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getCurrentGoldPrice(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const goldPrices = await getLiveGoldPrice();
    return reply.send(goldPrices);
  } catch (error) {
    console.error('Get gold price error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
