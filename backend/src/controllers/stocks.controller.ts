import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';
import { getStockPrice, searchStocks } from '../utils/yahooFinance';
import { getDailyStockPrice } from '../utils/stockPriceCache';
import { calculateSimpleReturns } from '../utils/xirr';

const createStockSchema = z.object({
  symbol: z.string(),
  companyName: z.string(),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.number().positive(),
  averagePrice: z.number().positive(),
  goalId: z.string().optional(),
});

const updateStockSchema = z.object({
  quantity: z.number().positive().optional(),
  averagePrice: z.number().positive().optional(),
  goalId: z.string().optional().nullable(),
});


export async function getAllStocks(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const stocks = await prisma.stock.findMany({
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

    // Fetch daily price for each stock symbol (in parallel)
    const stocksWithCurrent = await Promise.all(
      stocks.map(async (stock: typeof prisma.stock) => {
        const currentPrice = await getDailyStockPrice(stock.symbol);
        const currentValue = currentPrice ? stock.quantity * currentPrice : stock.investedAmount;
        return {
          ...stock,
          currentPrice,
          currentValue,
        };
      })
    );

    return reply.send({ stocks: stocksWithCurrent });
  } catch (error) {
    console.error('Get stocks error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createStock(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createStockSchema.parse(request.body);
    
    const investedAmount = data.quantity * data.averagePrice;
    
    // Fetch current price
    const currentPrice = await getStockPrice(data.symbol);
    const currentValue = currentPrice ? data.quantity * currentPrice : investedAmount;
    
    const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);
    
    const stock = await prisma.stock.create({
      data: {
        userId,
        symbol: data.symbol,
        companyName: data.companyName,
        exchange: data.exchange,
        quantity: data.quantity,
        averagePrice: data.averagePrice,
        currentPrice,
        investedAmount,
        currentValue,
        returns,
        returnsPercentage,
        goalId: data.goalId,
        lastUpdated: currentPrice ? new Date() : null,
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
    
    return reply.code(201).send({ stock });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create stock error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateStock(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateStockSchema.parse(request.body);
    
    // Check if stock belongs to user
    const existingStock = await prisma.stock.findFirst({
      where: { id, userId },
    });
    
    if (!existingStock) {
      return reply.code(404).send({ error: 'Stock not found' });
    }
    
    // Recalculate values if quantity or average price changed
    const quantity = data.quantity ?? existingStock.quantity;
    const averagePrice = data.averagePrice ?? existingStock.averagePrice;
    const investedAmount = quantity * averagePrice;
    
    const currentPrice = await getStockPrice(existingStock.symbol);
    const currentValue = currentPrice ? quantity * currentPrice : investedAmount;
    const { returns, returnsPercentage } = calculateSimpleReturns(investedAmount, currentValue);
    
    const stock = await prisma.stock.update({
      where: { id },
      data: {
        quantity,
        averagePrice,
        investedAmount,
        currentPrice,
        currentValue,
        returns,
        returnsPercentage,
        goalId: data.goalId,
        lastUpdated: currentPrice ? new Date() : existingStock.lastUpdated,
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
    
    return reply.send({ stock });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update stock error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteStock(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    // Check if stock belongs to user
    const existingStock = await prisma.stock.findFirst({
      where: { id, userId },
    });
    
    if (!existingStock) {
      return reply.code(404).send({ error: 'Stock not found' });
    }
    
    await prisma.stock.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Delete stock error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function searchStock(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { query } = request.query as { query: string };
    
    if (!query || query.length < 2) {
      return reply.code(400).send({ error: 'Query must be at least 2 characters' });
    }
    
    const results = await searchStocks(query);
    return reply.send({ results });
  } catch (error) {
    console.error('Search stock error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
