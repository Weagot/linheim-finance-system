import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

import prisma from '../../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const config = {
  runtime: 'nodejs',
};

// Middleware to verify JWT
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// GET /api/reports/profit-loss
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany();

    const income = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return NextResponse.json({
      income,
      expenses,
      profit: income - expenses,
    });
  } catch (error) {
    console.error('Get profit-loss error:', error);
    return NextResponse.json({ error: 'Failed to fetch profit-loss' }, { status: 500 });
  }
}

// GET /api/reports/cash-flow
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany();

    const inflow = transactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const outflow = transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return NextResponse.json({
      inflow,
      outflow,
      net: inflow - outflow,
    });
  } catch (error) {
    console.error('Get cash-flow error:', error);
    return NextResponse.json({ error: 'Failed to fetch cash-flow' }, { status: 500 });
  }
}

// GET /api/reports/company-summary
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        initialBalance: 0, // Will add later
      };
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Get company-summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch company-summary' }, { status: 500 });
  }
}
