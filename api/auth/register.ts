import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const config = {
  runtime: 'nodejs',
};

// Helper to get request body
async function getBody(req: NextRequest) {
  return req.json();
}

// POST /api/auth/register
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'VIEWER' } = await getBody(req);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyAccess: JSON.stringify([]),
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
