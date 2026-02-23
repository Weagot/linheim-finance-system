import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsHeaders } from '../../lib/auth';

// This endpoint just lists available report types
export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    reports: [
      { name: 'profit-loss', url: '/api/reports/profit-loss' },
      { name: 'cash-flow', url: '/api/reports/cash-flow' },
      { name: 'company-summary', url: '/api/reports/company-summary' },
    ],
  });
}
