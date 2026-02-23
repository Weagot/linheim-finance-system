import express, { Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all companies (公开接口)
router.get('/', async (req: any, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data: companies, error } = await client
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json({ companies: companies || [] });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to get companies' });
  }
});

// Get company by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { data: company, error } = await client
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to get company' });
  }
});

// Create company
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { name, legal_name, tax_id, currency, address, contact_info, type } = req.body;

    const { data: company, error } = await client
      .from('companies')
      .insert({
        name,
        legal_name,
        tax_id,
        currency: currency || 'CNY',
        address,
        contact_info,
        type: type || 'DOMESTIC',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ company });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { name, legal_name, tax_id, currency, address, contact_info, type } = req.body;

    const { data: company, error } = await client
      .from('companies')
      .update({
        name,
        legal_name,
        tax_id,
        currency,
        address,
        contact_info,
        type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ company });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

// Delete company (soft delete)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('companies')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;
