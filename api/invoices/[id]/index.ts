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
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  // GET /api/invoices/[id]
  if (req.method === 'GET') {
    try {
      const { data: invoice, error } = await supabaseAdmin
        .from('invoices')
        .select(`
          *,
          issuerCompany:companies!invoices_issuer_company_id_fkey(*),
          receiverCompany:companies!invoices_receiver_company_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error || !invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      return res.status(200).json({ invoice });
    } catch (error) {
      console.error('Get invoice error:', error);
      return res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  }

  // PUT /api/invoices/[id]
  if (req.method === 'PUT') {
    try {
      const {
        invoiceDate, invoice_date,
        dueDate, due_date,
        amount,
        currency,
        receiverCompanyId, receiver_company_id,
        receiverName, receiver_name,
        status,
      } = req.body;

      const updateData: Record<string, unknown> = {};
      const finalInvoiceDate = invoiceDate || invoice_date;
      const finalDueDate = dueDate || due_date;
      const finalReceiverCompanyId = receiverCompanyId || receiver_company_id;
      const finalReceiverName = receiverName || receiver_name;

      if (finalInvoiceDate !== undefined) updateData.invoice_date = new Date(finalInvoiceDate).toISOString();
      if (finalDueDate !== undefined) updateData.due_date = finalDueDate ? new Date(finalDueDate).toISOString() : null;
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (currency !== undefined) updateData.currency = currency;
      if (finalReceiverCompanyId !== undefined) updateData.receiver_company_id = finalReceiverCompanyId;
      if (finalReceiverName !== undefined) updateData.receiver_name = finalReceiverName;
      if (status !== undefined) updateData.status = status;

      const { data: invoice, error } = await supabaseAdmin
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ invoice });
    } catch (error) {
      console.error('Update invoice error:', error);
      return res.status(500).json({ error: 'Failed to update invoice' });
    }
  }

  // DELETE /api/invoices/[id]
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabaseAdmin
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Invoice deleted' });
    } catch (error) {
      console.error('Delete invoice error:', error);
      return res.status(500).json({ error: 'Failed to delete invoice' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
