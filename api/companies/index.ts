import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../lib/supabase';
import { verifyToken, corsHeaders } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET /api/companies
  if (req.method === 'GET') {
    try {
      const { data: companies, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ companies });
    } catch (error) {
      console.error('Get companies error:', error);
      return res.status(500).json({ error: 'Failed to fetch companies' });
    }
  }

  // POST /api/companies
  if (req.method === 'POST') {
    try {
      const { name, code, currency, country, type, initial_balance } = req.body;

      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code are required' });
      }

      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .insert({
          name,
          code,
          currency: currency || 'EUR',
          country,
          type,
          initial_balance: initial_balance || 0,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ company });
    } catch (error) {
      console.error('Create company error:', error);
      return res.status(500).json({ error: 'Failed to create company' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
