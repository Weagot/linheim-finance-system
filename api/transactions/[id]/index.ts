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
    return res.status(400).json({ error: 'Invalid transaction ID' });
  }

  // GET /api/transactions/[id]
  if (req.method === 'GET') {
    try {
      const { data: transaction, error } = await supabaseAdmin
        .from('transactions')
        .select(`
          *,
          company:companies!transactions_company_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error || !transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      return res.status(200).json({ transaction });
    } catch (error) {
      console.error('Get transaction error:', error);
      return res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  }

  // PUT /api/transactions/[id]
  if (req.method === 'PUT') {
    try {
      const { type, amount, currency, category, description, date } = req.body;

      const updateData: Record<string, unknown> = {};
      if (type !== undefined) updateData.type = type;
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (currency !== undefined) updateData.currency = currency;
      if (category !== undefined) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date).toISOString();

      const { data: transaction, error } = await supabaseAdmin
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ transaction });
    } catch (error) {
      console.error('Update transaction error:', error);
      return res.status(500).json({ error: 'Failed to update transaction' });
    }
  }

  // DELETE /api/transactions/[id]
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      return res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
