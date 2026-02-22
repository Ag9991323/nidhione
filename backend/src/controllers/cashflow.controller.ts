import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../config/database';
import { z } from 'zod';

const createCashflowSchema = z.object({
  amount: z.number().positive(),
  category: z.enum(['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'education', 'shopping', 'bills', 'investment', 'salary', 'rent', 'parents', 'other']),
  type: z.enum(['income', 'spend', 'investment']),
  description: z.string().optional(),
  date: z.string(),
  // ...existing code...
});

const updateCashflowSchema = z.object({
  amount: z.number().positive().optional(),
  category: z.enum(['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'education', 'shopping', 'bills', 'investment', 'salary', 'rent', 'parents', 'other']).optional(),
  type: z.enum(['income', 'spend', 'investment']).optional(),
  description: z.string().optional().nullable(),
  date: z.string().optional(),
  // ...existing code...
});

export async function getAllCashflows(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { month, year, type, category } = request.query as any;
    
    let whereClause: any = { userId };
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    
    // Filter by type
    if (type) {
      whereClause.type = type;
    }
    
    // Filter by category
    if (category) {
      whereClause.category = category;
    }
    
    const cashflows = await prisma.cashflow.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
    
    return reply.send({ cashflows });
  } catch (error) {
    console.error('Get cashflows error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getCashflowSummary(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { month, year } = request.query as any;
    
    let whereClause: any = { userId };
    
    // Default to current month if not provided
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    whereClause.date = {
      gte: startDate,
      lte: endDate,
    };
    
    const cashflows = await prisma.cashflow.findMany({
      where: whereClause,
    });
    
    // Calculate totals by category
    const categoryTotals: Record<string, number> = {};
    let totalSpend = 0;
    let totalIncome = 0;
    let totalInvestment = 0;
    
    cashflows.forEach((cashflow: typeof prisma.cashflow) => {
      if (cashflow.type === 'spend') {
        totalSpend += cashflow.amount;
        categoryTotals[cashflow.category] = (categoryTotals[cashflow.category] || 0) + cashflow.amount;
      } else if (cashflow.type === 'income') {
        totalIncome += cashflow.amount;
      } else if (cashflow.type === 'investment') {
        totalInvestment += cashflow.amount;
      }
    });
    
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
    
    return reply.send({
      month: targetMonth,
      year: targetYear,
      totalIncome,
      totalSpend,
      totalInvestment,
      balance: totalIncome - totalSpend - totalInvestment,
      categoryBreakdown,
      transactionCount: cashflows.length,
    });
  } catch (error) {
    console.error('Get cashflow summary error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function getMonthlyTrend(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { year } = request.query as any;
    
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const monthlyData = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = new Date(targetYear, month - 1, 1);
      const endDate = new Date(targetYear, month, 0, 23, 59, 59);
      
      const cashflows = await prisma.cashflow.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      let totalSpend = 0;
      let totalIncome = 0;
      let totalInvestment = 0;
      
      cashflows.forEach((cashflow: typeof prisma.cashflow) => {
        if (cashflow.type === 'spend') {
          totalSpend += cashflow.amount;
        } else if (cashflow.type === 'income') {
          totalIncome += cashflow.amount;
        } else if (cashflow.type === 'investment') {
          totalInvestment += cashflow.amount;
        }
      });
      
      monthlyData.push({
        month,
        monthName: new Date(targetYear, month - 1).toLocaleString('default', { month: 'short' }),
        income: totalIncome,
        spend: totalSpend,
        investment: totalInvestment,
        balance: totalIncome - totalSpend - totalInvestment,
      });
    }
    
    return reply.send({ year: targetYear, monthlyData });
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function createCashflow(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const data = createCashflowSchema.parse(request.body);

    // Only create one-time cashflow
    const cashflow = await prisma.cashflow.create({
      data: {
        userId,
        amount: data.amount,
        category: data.category,
        type: data.type,
        description: data.description,
        date: new Date(data.date),
      },
    });
    return reply.code(201).send({ cashflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Create cashflow error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function updateCashflow(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    const data = updateCashflowSchema.parse(request.body);
    
    // Verify cashflow exists and belongs to user
    const existingCashflow = await prisma.cashflow.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingCashflow) {
      return reply.code(404).send({ error: 'Cashflow not found' });
    }
    
    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    const cashflow = await prisma.cashflow.update({
      where: { id },
      data: updateData,
    });
    
    return reply.send({ cashflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.code(400).send({ error: error.errors });
    }
    console.error('Update cashflow error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}

export async function deleteCashflow(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (request.user as any).userId;
    const { id } = request.params as { id: string };
    
    // Verify cashflow exists and belongs to user
    const existingCashflow = await prisma.cashflow.findFirst({
      where: {
        id,
        userId,
      },
    });
    
    if (!existingCashflow) {
      return reply.code(404).send({ error: 'Cashflow not found' });
    }
    
    await prisma.cashflow.delete({
      where: { id },
    });
    
    return reply.send({ message: 'Cashflow deleted successfully' });
  } catch (error) {
    console.error('Delete cashflow error:', error);
    return reply.code(500).send({ error: 'Internal server error' });
  }
}
