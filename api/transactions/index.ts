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

  // GET /api/transactions
  if (req.method === 'GET') {
    try {
      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select(`
          *,
          company:companies!transactions_company_id_fkey(*)
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ transactions });
    } catch (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  // POST /api/transactions
  if (req.method === 'POST') {
    try {
      const {
        companyId,
        company_id,
        type,
        amount,
        currency,
        category,
        description,
        date,
        relatedCompanyId,
        related_company_id,
        relatedTransactionId,
        related_transaction_id,
        invoiceId,
        invoice_id,
        projectId,
        project_id,
      } = req.body;

      const finalCompanyId = companyId || company_id;
      if (!finalCompanyId || !amount || !date) {
        return res.status(400).json({ error: 'companyId, amount, and date are required' });
      }

      const { data: transaction, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          company_id: finalCompanyId,
          type: type || 'INCOME',
          amount: parseFloat(amount),
          currency: currency || 'EUR',
          category,
          description,
          date: new Date(date).toISOString(),
          related_company_id: relatedCompanyId || related_company_id || null,
          related_transaction_id: relatedTransactionId || related_transaction_id || null,
          invoice_id: invoiceId || invoice_id || null,
          project_id: projectId || project_id || null,
          created_by: decoded.id,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ transaction });
    } catch (error) {
      console.error('Create transaction error:', error);
      return res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
