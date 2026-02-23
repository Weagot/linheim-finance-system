import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/profit-loss', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const transactions = await prisma.transaction.findMany();

    const income = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    res.json({
      income,
      expenses,
      profit: income - expenses,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profit-loss' });
  }
});

router.get('/cash-flow', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const transactions = await prisma.transaction.findMany();

    const inflow = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const outflow = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    res.json({
      inflow,
      outflow,
      net: inflow - outflow,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cash-flow' });
  }
});

router.get('/company-summary', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const companies = await prisma.company.findMany({
      include: {
        transactions: true,
      },
    });

    const summary = companies.map((company: any) => {
      const income = company.transactions
        .filter((t: any) => t.type === 'INCOME')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      const expenses = company.transactions
        .filter((t: any) => t.type === 'EXPENSE')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

      return {
        id: company.id,
        name: company.name,
        code: company.code,
        currency: company.currency,
        income,
        expenses,
        profit: income - expenses,
      };
    });

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company-summary' });
  }
});

export default router;
