import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken, corsHeaders } from '../../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  Object.entries(corsHeaders()).forEach(([key, value]) => res.setHeader(key, value));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid company ID' });
  }

  // GET /api/companies/[id]
  if (req.method === 'GET') {
    try {
      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      return res.status(200).json({ company });
    } catch (error) {
      console.error('Get company error:', error);
      return res.status(500).json({ error: 'Failed to fetch company' });
    }
  }

  // PUT /api/companies/[id]
  if (req.method === 'PUT') {
    try {
      const { name, code, currency, country, type, initial_balance } = req.body;

      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .update({
          name,
          code,
          currency,
          country,
          type,
          initial_balance,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ company });
    } catch (error) {
      console.error('Update company error:', error);
      return res.status(500).json({ error: 'Failed to update company' });
    }
  }

  // DELETE /api/companies/[id]
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Company deleted' });
    } catch (error) {
      console.error('Delete company error:', error);
      return res.status(500).json({ error: 'Failed to delete company' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
