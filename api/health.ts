import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  // Health check
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Linheim Finance API is running',
  });
}
