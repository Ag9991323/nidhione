import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';
import { getNAVBySchemeCode, searchMutualFund } from '../utils/amfiAPI';
import { getDailyMutualFundNav } from '../utils/mutualFundNavCache';
import { calculateSimpleReturns } from '../utils/xirr';

const createMFSchema = z.object({
  schemeCode: z.string(),
  schemeName: z.string(),
  amcName: z.string().optional(),
  units: z.number().positive(),
  averageNav: z.number().positive(),
  goalId: z.string().optional(),
});

const updateMFSchema = z.object({
  units: z.number().positive().optional(),
  averageNav: z.number().positive().optional(),
  goalId: z.string().optional().nullable(),
});

export async function getAllMutualFunds(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const mutualFunds = await prisma.mutualFund.findMany({
      where: { userId },
      include: {
        goal: {
          select: {
            id: true,
            name: true,
          },
        },
        sips: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch daily NAV for each mutual fund (in parallel)
    const mutualFundsWithCurrent = await Promise.all(
      mutualFunds.map(async mf => {
        const currentNav = await getDailyMutualFundNav(mf.schemeCode);
        const currentValue = currentNav ? mf.units * currentNav : mf.investedAmount;
        return {
          ...mf,
          currentNav,
          currentValue,
        };
      }),
    );

    return reply.send({ mutualFunds: mutualFundsWithCurrent });
  } catch (error) {
    console.error('Get mutual funds error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createMutualFund(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createMFSchema.parse(request.body);

    const investedAmount = data.units * data.averageNav;

    // Fetch current NAV
    const currentNav = await getNAVBySchemeCode(data.schemeCode);
    const currentValue = currentNav ? data.units * currentNav : investedAmount;

    const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);

    const mutualFund = await prisma.mutualFund.create({
      data: {
        userId,
        schemeCode: data.schemeCode,
        schemeName: data.schemeName,
        amcName: data.amcName,
        units: data.units,
        averageNav: data.averageNav,
        currentNav,
        investedAmount,
        currentValue,
        returns,
        returnsPercentage,
        goalId: data.goalId,
        lastUpdated: currentNav ? new Date() : null,
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

    return reply.code(201).send({ mutualFund });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create mutual fund error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateMutualFund(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateMFSchema.parse(request.body);

    const existingMF = await prisma.mutualFund.findFirst({
      where: { id, userId },
    });

    if (!existingMF) {
      return reply.code(404).send({ error: 'Mutual fund not found' });
    }

    const units = data.units ?? existingMF.units;
    const averageNav = data.averageNav ?? existingMF.averageNav;
    const investedAmount = units * averageNav;

    const currentNav = await getNAVBySchemeCode(existingMF.schemeCode);
    const currentValue = currentNav ? units * currentNav : investedAmount;
    const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);

    const mutualFund = await prisma.mutualFund.update({
      where: { id },
      data: {
        units,
        averageNav,
        investedAmount,
        currentNav,
        currentValue,
        returns,
        returnsPercentage,
        goalId: data.goalId,
        lastUpdated: currentNav ? new Date() : existingMF.lastUpdated,
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

    return reply.send({ mutualFund });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update mutual fund error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteMutualFund(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };

    const existingMF = await prisma.mutualFund.findFirst({
      where: { id, userId },
    });

    if (!existingMF) {
      return reply.code(404).send({ error: 'Mutual fund not found' });
    }

    await prisma.mutualFund.delete({
      where: { id },
    });

    return reply.send({ message: 'Mutual fund deleted successfully' });
  } catch (error) {
    console.error('Delete mutual fund error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function searchMF(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { query } = request.query as { query: string };

    if (!query || query.length < 3) {
      return reply.code(400).send({ error: 'Query must be at least 3 characters' });
    }

    const results = await searchMutualFund(query);
    return reply.send({ results });
  } catch (error) {
    console.error('Search mutual fund error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
