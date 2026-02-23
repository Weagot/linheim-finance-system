import express, { Response } from 'express';
import { getSupabaseClient } from '../storage/database/supabase-client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Dashboard summary
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, start_date, end_date } = req.query;

    // Get transactions summary
    let txQuery = client
      .from('transactions')
      .select('type, amount, currency')
      .eq('status', 'COMPLETED');

    if (company_id) txQuery = txQuery.eq('company_id', company_id);
    if (start_date) txQuery = txQuery.gte('transaction_date', start_date);
    if (end_date) txQuery = txQuery.lte('transaction_date', end_date);

    const { data: transactions } = await txQuery;

    // Calculate totals
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      transactionCount: transactions?.length || 0,
      byCurrency: {} as Record<string, { income: number; expense: number }>,
    };

    transactions?.forEach((tx) => {
      const curr = tx.currency || 'CNY';
      if (!summary.byCurrency[curr]) {
        summary.byCurrency[curr] = { income: 0, expense: 0 };
      }

      if (tx.type === 'INCOME') {
        summary.totalIncome += Number(tx.amount);
        summary.byCurrency[curr].income += Number(tx.amount);
      } else if (tx.type === 'EXPENSE') {
        summary.totalExpense += Number(tx.amount);
        summary.byCurrency[curr].expense += Number(tx.amount);
      }
    });

    // Get invoice summary
    let invQuery = client
      .from('invoices')
      .select('status, total_amount, currency');

    if (company_id) invQuery = invQuery.eq('company_id', company_id);

    const { data: invoices } = await invQuery;

    const invoiceSummary = {
      totalIssued: 0,
      totalPaid: 0,
      totalPending: 0,
      byCurrency: {} as Record<string, { issued: number; paid: number; pending: number }>,
    };

    invoices?.forEach((inv) => {
      const curr = inv.currency || 'CNY';
      if (!invoiceSummary.byCurrency[curr]) {
        invoiceSummary.byCurrency[curr] = { issued: 0, paid: 0, pending: 0 };
      }

      if (inv.status === 'ISSUED') {
        invoiceSummary.totalIssued += Number(inv.total_amount);
        invoiceSummary.byCurrency[curr].issued += Number(inv.total_amount);
      } else if (inv.status === 'PAID') {
        invoiceSummary.totalPaid += Number(inv.total_amount);
        invoiceSummary.byCurrency[curr].paid += Number(inv.total_amount);
      } else if (inv.status === 'OVERDUE') {
        invoiceSummary.totalPending += Number(inv.total_amount);
        invoiceSummary.byCurrency[curr].pending += Number(inv.total_amount);
      }
    });

    // Get companies count
    const { count: companiesCount } = await client
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    res.json({
      summary: {
        ...summary,
        netIncome: summary.totalIncome - summary.totalExpense,
      },
      invoiceSummary,
      companiesCount: companiesCount || 0,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Income statement report
router.get('/income-statement', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    let query = client
      .from('transactions')
      .select('type, amount, currency, category, description, transaction_date')
      .eq('status', 'COMPLETED')
      .gte('transaction_date', start_date)
      .lte('transaction_date', end_date);

    if (company_id) query = query.eq('company_id', company_id);

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Group by category
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    transactions?.forEach((tx) => {
      const category = tx.category || 'Other';
      const amount = Number(tx.amount);

      if (tx.type === 'INCOME') {
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount;
      } else if (tx.type === 'EXPENSE') {
        expenseByCategory[category] = (expenseByCategory[category] || 0) + amount;
      }
    });

    const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);

    res.json({
      period: { start_date, end_date },
      income: {
        byCategory: incomeByCategory,
        total: totalIncome,
      },
      expenses: {
        byCategory: expenseByCategory,
        total: totalExpense,
      },
      netIncome: totalIncome - totalExpense,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Get income statement error:', error);
    res.status(500).json({ error: 'Failed to get income statement' });
  }
});

// Cash flow report
router.get('/cash-flow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date are required' });
    }

    let query = client
      .from('transactions')
      .select('type, amount, currency, category, description, transaction_date')
      .eq('status', 'COMPLETED')
      .gte('transaction_date', start_date)
      .lte('transaction_date', end_date);

    if (company_id) query = query.eq('company_id', company_id);

    const { data: transactions, error } = await query;

    if (error) throw error;

    // Group by month
    const monthlyData: Record<string, { income: number; expense: number; net: number }> = {};

    transactions?.forEach((tx) => {
      const month = tx.transaction_date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0, net: 0 };
      }

      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') {
        monthlyData[month].income += amount;
      } else if (tx.type === 'EXPENSE') {
        monthlyData[month].expense += amount;
      }
      monthlyData[month].net = monthlyData[month].income - monthlyData[month].expense;
    });

    res.json({
      period: { start_date, end_date },
      monthly: monthlyData,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Get cash flow error:', error);
    res.status(500).json({ error: 'Failed to get cash flow report' });
  }
});

// Export transactions report
router.get('/export', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const client = getSupabaseClient();
    const { company_id, start_date, end_date, format = 'json' } = req.query;

    let query = client
      .from('transactions')
      .select(`
        *,
        company:companies(id, name, currency)
      `)
      .order('transaction_date', { ascending: false });

    if (company_id) query = query.eq('company_id', company_id);
    if (start_date) query = query.gte('transaction_date', start_date);
    if (end_date) query = query.lte('transaction_date', end_date);

    const { data: transactions, error } = await query;

    if (error) throw error;

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Company'];
      const rows = transactions?.map((tx) => [
        tx.transaction_date,
        tx.type,
        tx.category || '',
        tx.amount,
        tx.currency,
        tx.description || '',
        tx.company?.name || '',
      ]);

      const csv = [
        headers.join(','),
        ...(rows?.map((r) => r.join(',')) || []),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csv);
    } else {
      res.json({ transactions: transactions || [] });
    }
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

export default router;
