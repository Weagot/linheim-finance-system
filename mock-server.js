// Mock API Server for Development
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  { id: '1', name: 'Admin', email: 'admin@linheim.com', role: 'ADMIN' },
];

const mockCompanies = [
  { id: '1', name: 'Deyou international GmbH', code: 'DEYOU', currency: 'EUR', country: 'Germany', type: 'warehouse', initialBalance: 100000, createdAt: new Date().toISOString() },
  { id: '2', name: 'Wanling GmbH', code: 'WANLING', currency: 'EUR', country: 'Germany', type: 'hr', initialBalance: 50000, createdAt: new Date().toISOString() },
  { id: '3', name: '江苏程辉商贸有限公司', code: 'JSCHENG', currency: 'CNY', country: 'China', type: 'billing', initialBalance: 200000, createdAt: new Date().toISOString() },
];

const mockTransactions = [
  { id: '1', companyId: '1', type: 'INCOME', amount: 2500, currency: 'EUR', category: '仓储费', description: '客户A - 仓储费', date: '2026-02-21', createdBy: '1' },
  { id: '2', companyId: '1', type: 'EXPENSE', amount: 1850, currency: 'EUR', category: '运输费', description: '支付给供应商B - 运输费', date: '2026-02-21', createdBy: '1' },
  { id: '3', companyId: '1', type: 'TRANSFER', amount: 3200, currency: 'EUR', category: '人力资源', description: '人力资源费结算', date: '2026-02-20', relatedCompanyId: '2', createdBy: '1' },
];

const mockInvoices = [
  { id: '1', invoiceNumber: 'INV-2026-001', invoiceDate: '2026-02-20', amount: 5000, currency: 'EUR', issuerCompanyId: '1', receiverName: '客户A', status: 'ISSUED', createdBy: '1' },
];

const mockExchangeRates = [
  { id: '1', date: '2026-02-23', fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.82, source: '中国银行' },
  { id: '2', date: '2026-02-23', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.08, source: '中国银行' },
  { id: '3', date: '2026-02-23', fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.24, source: '中国银行' },
  { id: '4', date: '2026-02-23', fromCurrency: 'GBP', toCurrency: 'CNY', rate: 9.12, source: '中国银行' },
  { id: '5', date: '2026-02-23', fromCurrency: 'GBP', toCurrency: 'EUR', rate: 1.17, source: '中国银行' },
  { id: '6', date: '2026-02-23', fromCurrency: 'HKD', toCurrency: 'CNY', rate: 0.93, source: '中国银行' },
];

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({ 
    user: mockUsers[0], 
    token: 'mock-jwt-token-12345' 
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ 
    user: { id: '2', ...req.body, role: 'VIEWER' }, 
    token: 'mock-jwt-token-67890' 
  });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  res.json({ user: mockUsers[0] });
});

// Companies routes
app.get('/api/companies', (req, res) => {
  res.json({ companies: mockCompanies });
});

app.post('/api/companies', (req, res) => {
  const newCompany = { id: Date.now().toString(), ...req.body, createdAt: new Date().toISOString() };
  mockCompanies.push(newCompany);
  res.status(201).json({ company: newCompany });
});

app.get('/api/companies/:id', (req, res) => {
  const company = mockCompanies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Not found' });
  res.json({ company });
});

app.put('/api/companies/:id', (req, res) => {
  const index = mockCompanies.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockCompanies[index] = { ...mockCompanies[index], ...req.body };
  res.json({ company: mockCompanies[index] });
});

app.delete('/api/companies/:id', (req, res) => {
  const index = mockCompanies.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockCompanies.splice(index, 1);
  res.json({ success: true });
});

// Transactions routes
app.get('/api/transactions', (req, res) => {
  res.json({ transactions: mockTransactions });
});

app.post('/api/transactions', (req, res) => {
  const newTransaction = { id: Date.now().toString(), ...req.body };
  mockTransactions.push(newTransaction);
  res.status(201).json({ transaction: newTransaction });
});

app.get('/api/transactions/:id', (req, res) => {
  const transaction = mockTransactions.find(t => t.id === req.params.id);
  if (!transaction) return res.status(404).json({ error: 'Not found' });
  res.json({ transaction });
});

app.put('/api/transactions/:id', (req, res) => {
  const index = mockTransactions.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockTransactions[index] = { ...mockTransactions[index], ...req.body };
  res.json({ transaction: mockTransactions[index] });
});

app.delete('/api/transactions/:id', (req, res) => {
  const index = mockTransactions.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockTransactions.splice(index, 1);
  res.json({ success: true });
});

// Invoices routes
app.get('/api/invoices', (req, res) => {
  res.json({ invoices: mockInvoices });
});

app.post('/api/invoices', (req, res) => {
  const newInvoice = { id: Date.now().toString(), ...req.body };
  mockInvoices.push(newInvoice);
  res.status(201).json({ invoice: newInvoice });
});

app.get('/api/invoices/:id', (req, res) => {
  const invoice = mockInvoices.find(i => i.id === req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });
  res.json({ invoice });
});

app.put('/api/invoices/:id', (req, res) => {
  const index = mockInvoices.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockInvoices[index] = { ...mockInvoices[index], ...req.body };
  res.json({ invoice: mockInvoices[index] });
});

app.delete('/api/invoices/:id', (req, res) => {
  const index = mockInvoices.findIndex(i => i.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  mockInvoices.splice(index, 1);
  res.json({ success: true });
});

// Reports routes
app.get('/api/reports/profit-loss', (req, res) => {
  res.json({
    totalIncome: 125430,
    totalExpense: 87210,
    profit: 38220,
    byCompany: mockCompanies.map(c => ({
      companyId: c.id,
      companyName: c.name,
      income: Math.floor(Math.random() * 50000) + 10000,
      expense: Math.floor(Math.random() * 30000) + 5000,
    }))
  });
});

app.get('/api/reports/cash-flow', (req, res) => {
  res.json({
    openingBalance: 350000,
    totalInflow: 125430,
    totalOutflow: 87210,
    closingBalance: 388220,
  });
});

app.get('/api/reports/company-summary', (req, res) => {
  res.json({
    summary: mockCompanies.map(c => ({
      ...c,
      income: Math.floor(Math.random() * 50000) + 10000,
      expense: Math.floor(Math.random() * 30000) + 5000,
      profit: Math.floor(Math.random() * 20000) + 5000,
    }))
  });
});

// Exchange Rates routes
app.get('/api/exchange-rates', (req, res) => {
  res.json({ rates: mockExchangeRates });
});

app.get('/api/exchange-rates/latest', (req, res) => {
  res.json({ 
    rates: mockExchangeRates,
    lastUpdate: new Date().toISOString(),
    source: '中国银行'
  });
});

app.get('/api/exchange-rates/history', (req, res) => {
  const { from, to, days = 7 } = req.query;
  
  // Generate mock history data
  const history = [];
  const baseRates = {
    'EUR-CNY': 7.82,
    'EUR-USD': 1.08,
    'USD-CNY': 7.24,
    'GBP-CNY': 9.12,
    'GBP-EUR': 1.17,
    'HKD-CNY': 0.93,
  };
  
  for (let i = 0; i < Number(days); i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    Object.entries(baseRates).forEach(([pair, baseRate]) => {
      if (!from && !to || 
          (from && to && pair === `${from}-${to}`) ||
          (from && pair.startsWith(from)) ||
          (to && pair.endsWith(to))) {
        history.push({
          id: `${pair}-${date.toISOString().split('T')[0]}`,
          date: date.toISOString().split('T')[0],
          fromCurrency: pair.split('-')[0],
          toCurrency: pair.split('-')[1],
          rate: Number((baseRate + (Math.random() - 0.5) * 0.1).toFixed(4)),
          source: '中国银行'
        });
      }
    });
  }
  
  res.json({ history });
});

app.post('/api/exchange-rates/fetch', (req, res) => {
  // Simulate fetching latest rates from external API
  const updatedRates = mockExchangeRates.map(rate => ({
    ...rate,
    rate: Number((rate.rate + (Math.random() - 0.5) * 0.05).toFixed(4)),
    date: new Date().toISOString().split('T')[0]
  }));
  
  res.json({ 
    success: true, 
    rates: updatedRates,
    message: '汇率已更新',
    lastUpdate: new Date().toISOString()
  });
});

app.post('/api/exchange-rates', (req, res) => {
  const newRate = { 
    id: Date.now().toString(), 
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };
  mockExchangeRates.push(newRate);
  res.status(201).json({ rate: newRate });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
});
