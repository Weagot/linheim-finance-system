import express, { Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all transactions with filters (公开接口)
router.get('/', async (req: any, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, start_date, end_date, type, status } = req.query;

    let query = client
      .from('transactions')
      .select(`
        *,
        company:companies(id, name, currency),
        project:projects(id, name)
      `)
      .order('transaction_date', { ascending: false });

    if (company_id) query = query.eq('company_id', company_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (start_date) query = query.gte('transaction_date', start_date);
    if (end_date) query = query.lte('transaction_date', end_date);

    const { data: transactions, error } = await query;

    if (error) throw error;
    res.json({ transactions: transactions || [] });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data: transaction, error } = await client
      .from('transactions')
      .select(`
        *,
        company:companies(id, name, currency),
        project:projects(id, name)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const {
      company_id,
      type,
      amount,
      currency,
      description,
      transaction_date,
      category,
      vendor,
      invoice_id,
      project_id,
      exchange_rate,
    } = req.body;

    const { data: transaction, error } = await client
      .from('transactions')
      .insert({
        company_id,
        type,
        amount,
        currency: currency || 'CNY',
        description,
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
        category,
        vendor,
        invoice_id,
        project_id,
        exchange_rate,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const {
      type,
      amount,
      currency,
      description,
      transaction_date,
      category,
      vendor,
      invoice_id,
      project_id,
      exchange_rate,
      status,
    } = req.body;

    const { data: transaction, error } = await client
      .from('transactions')
      .update({
        type,
        amount,
        currency,
        description,
        transaction_date,
        category,
        vendor,
        invoice_id,
        project_id,
        exchange_rate,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('transactions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
