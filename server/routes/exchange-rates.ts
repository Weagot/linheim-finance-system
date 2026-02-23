import express, { Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { syncRatesToDatabase, getRateForDate, fetchBocRates } from '../services/exchange-rate-crawler';

const router = express.Router();

// 支持的货币列表
const SUPPORTED_CURRENCIES = [
  { code: 'CNY', name: '人民币', symbol: '¥' },
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'CHF', name: '瑞士法郎', symbol: 'CHF' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$' },
  { code: 'NZD', name: '新西兰元', symbol: 'NZ$' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'THB', name: '泰国铢', symbol: '฿' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM' },
];

// Get supported currencies (公开接口，无需认证)
router.get('/currencies', async (req: any, res: Response) => {
  res.json({ currencies: SUPPORTED_CURRENCIES });
});

// Get all exchange rates (公开接口，无需认证)
router.get('/', async (req: any, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { from_currency, to_currency, date, start_date, end_date } = req.query;

    let query = client
      .from('exchange_rates')
      .select('*')
      .order('rate_date', { ascending: false });

    if (from_currency) query = query.eq('from_currency', from_currency);
    if (to_currency) query = query.eq('to_currency', to_currency);
    if (date) query = query.eq('rate_date', date);
    if (start_date) query = query.gte('rate_date', start_date);
    if (end_date) query = query.lte('rate_date', end_date);

    const { data: rates, error } = await query;

    if (error) throw error;
    res.json({ rates: rates || [] });
  } catch (error) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ error: 'Failed to get exchange rates' });
  }
});

// Get latest rate (公开接口，无需认证)
router.get('/latest', async (req: any, res: Response) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to currencies are required' });
    }

    const rate = await getRateForDate(from as string, to as string, date as string);

    res.json({ rate, from_currency: from, to_currency: to });
  } catch (error) {
    console.error('Get latest rate error:', error);
    res.status(500).json({ error: 'Failed to get latest rate' });
  }
});

// Sync rates from Bank of China (Admin only)
router.post('/sync', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await syncRatesToDatabase();

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        count: result.count,
        rates: result.rates.map(r => ({
          currency: r.currency,
          currencyName: r.currencyName,
          sellingRate: r.sellingRate, // 现汇卖出价
          date: r.date,
        })),
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error('Sync rates error:', error);
    res.status(500).json({ error: 'Failed to sync exchange rates' });
  }
});

// Preview BOC rates (without saving)
router.get('/preview', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const rates = await fetchBocRates();

    res.json({
      success: true,
      source: 'Bank of China (中国银行)',
      date: rates[0]?.date || new Date().toISOString().split('T')[0],
      rates: rates.map(r => ({
        currency: r.currency,
        currencyName: r.currencyName,
        buyingRate: r.buyingRate,       // 现汇买入价
        sellingRate: r.sellingRate,     // 现汇卖出价 ⭐ 用于结算
        cashBuyingRate: r.cashBuyingRate,
        cashSellingRate: r.cashSellingRate,
        middleRate: r.middleRate,
      })),
    });
  } catch (error) {
    console.error('Preview rates error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates from BOC' });
  }
});

// Create or update exchange rate (manual entry)
router.post('/', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { from_currency, to_currency, rate, rate_date, source } = req.body;

    // Check if rate already exists for this date
    const { data: existing } = await client
      .from('exchange_rates')
      .select('id')
      .eq('from_currency', from_currency)
      .eq('to_currency', to_currency)
      .eq('rate_date', rate_date)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await client
        .from('exchange_rates')
        .update({
          rate,
          source,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      result = { data, error };
    } else {
      // Create new
      const { data, error } = await client
        .from('exchange_rates')
        .insert({
          from_currency,
          to_currency,
          rate,
          rate_date,
          source: source || 'MANUAL',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) throw result.error;
    res.json({ rate: result.data });
  } catch (error) {
    console.error('Save exchange rate error:', error);
    res.status(500).json({ error: 'Failed to save exchange rate' });
  }
});

// Batch create exchange rates
router.post('/batch', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { rates } = req.body;

    const ratesWithTimestamps = rates.map((r: any) => ({
      ...r,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await client
      .from('exchange_rates')
      .upsert(ratesWithTimestamps, {
        onConflict: 'from_currency,to_currency,rate_date',
      })
      .select();

    if (error) throw error;
    res.json({ rates: data });
  } catch (error) {
    console.error('Batch save exchange rates error:', error);
    res.status(500).json({ error: 'Failed to save exchange rates' });
  }
});

// Delete exchange rate
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from('exchange_rates')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Exchange rate deleted successfully' });
  } catch (error) {
    console.error('Delete exchange rate error:', error);
    res.status(500).json({ error: 'Failed to delete exchange rate' });
  }
});

export default router;
