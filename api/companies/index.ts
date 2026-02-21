import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
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

// GET /api/companies
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

// POST /api/companies
export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, code, currency, country, type } = await req.json();

    const company = await prisma.company.create({
      data: { name, code, currency, country, type },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Create company error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
