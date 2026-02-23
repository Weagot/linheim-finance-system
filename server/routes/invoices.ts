import express, { Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { getRateForDate } from '../services/exchange-rate-crawler';

const router = express.Router();

// Generate invoice number
function generateInvoiceNumber(prefix: string = 'INV'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Get all invoices with filters (公开接口)
router.get('/', async (req: any, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, status, start_date, end_date } = req.query;

    let query = client
      .from('invoices')
      .select('*')
      .order('issue_date', { ascending: false });

    if (company_id) query = query.eq('company_id', company_id);
    if (status) query = query.eq('status', status);
    if (start_date) query = query.gte('issue_date', start_date);
    if (end_date) query = query.lte('issue_date', end_date);

    const { data: invoices, error } = await query;

    if (error) throw error;
    res.json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to get invoices' });
  }
});

// Get invoice by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data: invoice, error } = await client
      .from('invoices')
      .select(`
        *,
        company:companies(id, name, currency, address, tax_id),
        transactions(id, type, amount, description, transaction_date)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to get invoice' });
  }
});

// Create invoice
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const {
      company_id,
      client_name,
      client_tax_id,
      items,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      issue_date,
      due_date,
      notes,
      // 可选：手动指定汇率
      exchange_rate: manual_exchange_rate,
    } = req.body;

    const invoice_number = generateInvoiceNumber();
    const issueDate = issue_date || new Date().toISOString().split('T')[0];
    const invoiceCurrency = currency || 'EUR';
    const baseCurrency = 'CNY';

    // 自动获取汇率（使用中国银行现汇卖出价）
    let exchangeRate = manual_exchange_rate;
    let exchangeRateDate = issueDate;
    let exchangeRateSource = 'MANUAL';
    let amountCny = total_amount;

    if (invoiceCurrency !== baseCurrency && !manual_exchange_rate) {
      // 自动获取开票日期的汇率
      const rate = await getRateForDate(invoiceCurrency, baseCurrency, issueDate);
      
      if (rate) {
        exchangeRate = rate;
        exchangeRateSource = 'BANK_OF_CHINA';
        amountCny = total_amount * rate;
        console.log(`Auto-fetched exchange rate: 1 ${invoiceCurrency} = ${rate} ${baseCurrency}`);
      } else {
        // 如果找不到当天的，尝试获取最新汇率
        const latestRate = await getRateForDate(invoiceCurrency, baseCurrency);
        if (latestRate) {
          exchangeRate = latestRate;
          exchangeRateSource = 'BANK_OF_CHINA_FALLBACK';
          amountCny = total_amount * latestRate;
          console.log(`Using fallback exchange rate: 1 ${invoiceCurrency} = ${latestRate} ${baseCurrency}`);
        }
      }
    } else if (manual_exchange_rate) {
      amountCny = total_amount * manual_exchange_rate;
    } else if (invoiceCurrency === baseCurrency) {
      exchangeRate = 1;
      exchangeRateSource = 'SAME_CURRENCY';
    }

    const { data: invoice, error } = await client
      .from('invoices')
      .insert({
        invoice_number,
        company_id,
        client_name,
        client_tax_id,
        items,
        subtotal,
        tax_amount,
        total_amount,
        currency: invoiceCurrency,
        issue_date: issueDate,
        due_date,
        status: 'DRAFT',
        notes,
        // 汇率信息
        exchange_rate: exchangeRate,
        exchange_rate_date: exchangeRateDate,
        exchange_rate_source: exchangeRateSource,
        base_currency: baseCurrency,
        amount_cny: amountCny,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const {
      client_name,
      client_tax_id,
      items,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      issue_date,
      due_date,
      status,
      notes,
      paid_date,
      // 可选：更新汇率
      exchange_rate: manual_exchange_rate,
    } = req.body;

    // 获取现有发票信息
    const { data: existingInvoice } = await client
      .from('invoices')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    let updateData: any = {
      client_name,
      client_tax_id,
      items,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      issue_date,
      due_date,
      status,
      notes,
      paid_date,
      updated_at: new Date().toISOString(),
    };

    // 如果金额或货币变化，重新计算人民币金额
    const newCurrency = currency || existingInvoice.currency;
    const newTotal = total_amount || existingInvoice.total_amount;
    const newIssueDate = issue_date || existingInvoice.issue_date;

    if (manual_exchange_rate) {
      // 手动指定汇率
      updateData.exchange_rate = manual_exchange_rate;
      updateData.exchange_rate_date = newIssueDate;
      updateData.exchange_rate_source = 'MANUAL';
      updateData.amount_cny = newTotal * manual_exchange_rate;
    } else if (newCurrency !== 'CNY') {
      // 自动获取汇率
      const rate = await getRateForDate(newCurrency, 'CNY', newIssueDate);
      if (rate) {
        updateData.exchange_rate = rate;
        updateData.exchange_rate_date = newIssueDate;
        updateData.exchange_rate_source = 'BANK_OF_CHINA';
        updateData.amount_cny = newTotal * rate;
      }
    } else {
      updateData.exchange_rate = 1;
      updateData.amount_cny = newTotal;
    }

    const { data: invoice, error } = await client
      .from('invoices')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ invoice });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Issue invoice (change status to ISSUED)
router.post('/:id/issue', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data: invoice, error } = await client
      .from('invoices')
      .update({
        status: 'ISSUED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ invoice });
  } catch (error) {
    console.error('Issue invoice error:', error);
    res.status(500).json({ error: 'Failed to issue invoice' });
  }
});

// Mark as paid
router.post('/:id/pay', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { transaction_id } = req.body;

    const { data: invoice, error } = await client
      .from('invoices')
      .update({
        status: 'PAID',
        paid_date: new Date().toISOString().split('T')[0],
        transaction_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ invoice });
  } catch (error) {
    console.error('Pay invoice error:', error);
    res.status(500).json({ error: 'Failed to mark invoice as paid' });
  }
});

// Delete invoice
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('invoices')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
