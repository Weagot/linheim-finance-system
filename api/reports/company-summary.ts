import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';
import { verifyToken, corsHeaders } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all companies
    const { data: companies, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('*');

    if (companyError) throw companyError;

    // Get all transactions
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('company_id, type, amount');

    if (txError) throw txError;

    const summary = (companies || []).map((company) => {
      const companyTransactions = (transactions || []).filter(
        (t) => t.company_id === company.id
      );

      const income = companyTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = companyTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        id: company.id,
        name: company.name,
        code: company.code,
        currency: company.currency,
        income,
        expenses,
        profit: income - expenses,
        initialBalance: Number(company.initial_balance) || 0,
      };
    });

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Get company-summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch company-summary' });
  }
}
