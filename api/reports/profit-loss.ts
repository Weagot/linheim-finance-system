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
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('type, amount');

    if (error) throw error;

    const income = (transactions || [])
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = (transactions || [])
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return res.status(200).json({
      income,
      expenses,
      profit: income - expenses,
    });
  } catch (error) {
    console.error('Get profit-loss error:', error);
    return res.status(500).json({ error: 'Failed to fetch profit-loss' });
  }
}
