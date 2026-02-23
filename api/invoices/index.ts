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

  // GET /api/invoices
  if (req.method === 'GET') {
    try {
      const { data: invoices, error } = await supabaseAdmin
        .from('invoices')
        .select(`
          *,
          issuerCompany:companies!invoices_issuer_company_id_fkey(*),
          receiverCompany:companies!invoices_receiver_company_id_fkey(*)
        `)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ invoices });
    } catch (error) {
      console.error('Get invoices error:', error);
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  }

  // POST /api/invoices
  if (req.method === 'POST') {
    try {
      const {
        invoiceNumber,
        invoice_number,
        invoiceDate,
        invoice_date,
        dueDate,
        due_date,
        amount,
        currency,
        issuerCompanyId,
        issuer_company_id,
        receiverCompanyId,
        receiver_company_id,
        receiverName,
        receiver_name,
        status,
      } = req.body;

      const finalInvoiceNumber = invoiceNumber || invoice_number;
      const finalInvoiceDate = invoiceDate || invoice_date;
      const finalIssuerCompanyId = issuerCompanyId || issuer_company_id;

      if (!finalInvoiceNumber || !finalInvoiceDate || !amount || !finalIssuerCompanyId) {
        return res.status(400).json({ error: 'invoiceNumber, invoiceDate, amount, and issuerCompanyId are required' });
      }

      const finalDueDate = dueDate || due_date;
      const { data: invoice, error } = await supabaseAdmin
        .from('invoices')
        .insert({
          invoice_number: finalInvoiceNumber,
          invoice_date: new Date(finalInvoiceDate).toISOString(),
          due_date: finalDueDate ? new Date(finalDueDate).toISOString() : null,
          amount: parseFloat(amount),
          currency: currency || 'EUR',
          issuer_company_id: finalIssuerCompanyId,
          receiver_company_id: receiverCompanyId || receiver_company_id || null,
          receiver_name: receiverName || receiver_name || null,
          status: status || 'DRAFT',
          created_by: decoded.id,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ invoice });
    } catch (error) {
      console.error('Create invoice error:', error);
      return res.status(500).json({ error: 'Failed to create invoice' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
