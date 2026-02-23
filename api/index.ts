import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsHeaders } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.status(200).json({
    name: 'Linheim Finance API',
    version: '2.1.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
      },
      companies: {
        list: 'GET /api/companies',
        create: 'POST /api/companies',
        get: 'GET /api/companies/:id',
        update: 'PUT /api/companies/:id',
        delete: 'DELETE /api/companies/:id',
      },
      transactions: {
        list: 'GET /api/transactions',
        create: 'POST /api/transactions',
        get: 'GET /api/transactions/:id',
        update: 'PUT /api/transactions/:id',
        delete: 'DELETE /api/transactions/:id',
      },
      invoices: {
        list: 'GET /api/invoices',
        create: 'POST /api/invoices',
        get: 'GET /api/invoices/:id',
        update: 'PUT /api/invoices/:id',
        delete: 'DELETE /api/invoices/:id',
      },
      reports: {
        profitLoss: 'GET /api/reports/profit-loss',
        cashFlow: 'GET /api/reports/cash-flow',
        companySummary: 'GET /api/reports/company-summary',
      },
    },
  });
}
