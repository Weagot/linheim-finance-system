import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'linheim-finance-2026-secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Auth routes
    if (req.url?.includes('/api/auth/login') && req.method === 'POST') {
      return await handleLogin(req, res);
    }
    if (req.url?.includes('/api/auth/register') && req.method === 'POST') {
      return await handleRegister(req, res);
    }
    if (req.url?.includes('/api/auth/me') && req.method === 'GET') {
      return await handleGetCurrentUser(req, res);
    }

    // Companies routes
    if (req.url?.includes('/api/companies') && req.method === 'GET' && !req.url.match(/\/companies\/[^/]+$/)) {
      return await handleGetCompanies(req, res);
    }
    if (req.url?.includes('/api/companies') && req.method === 'POST') {
      return await handleCreateCompany(req, res);
    }
    if (req.url?.match(/\/api\/companies\/[^/]+$/) && req.method === 'GET') {
      return await handleGetCompany(req, res);
    }
    if (req.url?.match(/\/api\/companies\/[^/]+$/) && req.method === 'PUT') {
      return await handleUpdateCompany(req, res);
    }
    if (req.url?.match(/\/api\/companies\/[^/]+$/) && req.method === 'DELETE') {
      return await handleDeleteCompany(req, res);
    }

    // Transactions routes
    if (req.url?.includes('/api/transactions') && req.method === 'GET' && !req.url.match(/\/transactions\/[^/]+$/)) {
      return await handleGetTransactions(req, res);
    }
    if (req.url?.includes('/api/transactions') && req.method === 'POST') {
      return await handleCreateTransaction(req, res);
    }
    if (req.url?.match(/\/api\/transactions\/[^/]+$/) && req.method === 'GET') {
      return await handleGetTransaction(req, res);
    }
    if (req.url?.match(/\/api\/transactions\/[^/]+$/) && req.method === 'PUT') {
      return await handleUpdateTransaction(req, res);
    }
    if (req.url?.match(/\/api\/transactions\/[^/]+$/) && req.method === 'DELETE') {
      return await handleDeleteTransaction(req, res);
    }

    // Invoices routes
    if (req.url?.includes('/api/invoices') && req.method === 'GET' && !req.url.match(/\/invoices\/[^/]+$/)) {
      return await handleGetInvoices(req, res);
    }
    if (req.url?.includes('/api/invoices') && req.method === 'POST') {
      return await handleCreateInvoice(req, res);
    }
    if (req.url?.match(/\/api\/invoices\/[^/]+$/) && req.method === 'GET') {
      return await handleGetInvoice(req, res);
    }
    if (req.url?.match(/\/api\/invoices\/[^/]+$/) && req.method === 'PUT') {
      return await handleUpdateInvoice(req, res);
    }
    if (req.url?.match(/\/api\/invoices\/[^/]+$/) && req.method === 'DELETE') {
      return await handleDeleteInvoice(req, res);
    }

    // Reports routes
    if (req.url?.includes('/api/reports/profit-loss') && req.method === 'GET') {
      return await handleGetProfitLoss(req, res);
    }
    if (req.url?.includes('/api/reports/cash-flow') && req.method === 'GET') {
      return await handleGetCashFlow(req, res);
    }
    if (req.url?.includes('/api/reports/company-summary') && req.method === 'GET') {
      return await handleGetCompanySummary(req, res);
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}

// Auth functions
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'VIEWER',
        company_access: '[]',
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    throw error;
  }
}

async function handleGetCurrentUser(req: VercelRequest, res: VercelResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Company handlers
async function handleGetCompanies(req: VercelRequest, res: VercelResponse) {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json({ companies });
}

async function handleCreateCompany(req: VercelRequest, res: VercelResponse) {
  const { name, code, currency, country, type, initialBalance } = req.body;
  const company = await prisma.company.create({
    data: { name, code, currency, country, type, initialBalance: initialBalance || 0 },
  });
  res.status(201).json({ company });
}

async function handleGetCompany(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/companies/')[1];
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  res.json({ company });
}

async function handleUpdateCompany(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/companies/')[1];
  const { name, code, currency, country, type, initialBalance } = req.body;
  const company = await prisma.company.update({
    where: { id },
    data: { name, code, currency, country, type, initialBalance },
  });
  res.json({ company });
}

async function handleDeleteCompany(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/companies/')[1];
  await prisma.company.delete({ where: { id } });
  res.json({ message: 'Company deleted' });
}

// Transaction handlers
async function handleGetTransactions(req: VercelRequest, res: VercelResponse) {
  const { companyId } = req.query;
  const where = companyId ? { companyId: companyId as string } : {};

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { company: true },
  });
  res.json({ transactions });
}

async function handleCreateTransaction(req: VercelRequest, res: VercelResponse) {
  const {
    companyId, type, amount, currency, category, description, date,
    relatedCompanyId, relatedTransactionId, invoiceId, projectId,
  } = req.body;

  const transaction = await prisma.transaction.create({
    data: {
      companyId,
      type,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date: new Date(date),
      relatedCompanyId,
      relatedTransactionId,
      invoiceId,
      projectId,
      createdBy: 'admin',
    },
  });
  res.status(201).json({ transaction });
}

async function handleGetTransaction(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/transactions/')[1];
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json({ transaction });
}

async function handleUpdateTransaction(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/transactions/')[1];
  const {
    companyId, type, amount, currency, category, description, date,
    relatedCompanyId, relatedTransactionId, invoiceId, projectId,
  } = req.body;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      companyId,
      type,
      amount: parseFloat(amount),
      currency,
      category,
      description,
      date: new Date(date),
      relatedCompanyId,
      relatedTransactionId,
      invoiceId,
      projectId,
    },
  });
  res.json({ transaction });
}

async function handleDeleteTransaction(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/transactions/')[1];
  await prisma.transaction.delete({ where: { id } });
  res.json({ message: 'Transaction deleted' });
}

// Invoice handlers
async function handleGetInvoices(req: VercelRequest, res: VercelResponse) {
  const { companyId } = req.query;
  const where = companyId ? { issuerCompanyId: companyId as string } : {};

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { invoiceDate: 'desc' },
    include: { issuerCompany: true, receiverCompany: true },
  });
  res.json({ invoices });
}

async function handleCreateInvoice(req: VercelRequest, res: VercelResponse) {
  const {
    invoiceNumber, invoiceDate, dueDate, amount, currency,
    issuerCompanyId, receiverCompanyId, receiverName, status, fileUrl,
  } = req.body;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      amount: parseFloat(amount),
      currency,
      issuerCompanyId,
      receiverCompanyId,
      receiverName,
      status: status || 'DRAFT',
      fileUrl,
      createdBy: 'admin',
    },
  });
  res.status(201).json({ invoice });
}

async function handleGetInvoice(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/invoices/')[1];
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { issuerCompany: true, receiverCompany: true },
  });
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }
  res.json({ invoice });
}

async function handleUpdateInvoice(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/invoices/')[1];
  const {
    invoiceNumber, invoiceDate, dueDate, amount, currency,
    issuerCompanyId, receiverCompanyId, receiverName, status, fileUrl,
  } = req.body;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber,
      invoiceDate: new Date(invoiceDate),
      dueDate: dueDate ? new Date(dueDate) : null,
      amount: parseFloat(amount),
      currency,
      issuerCompanyId,
      receiverCompanyId,
      receiverName,
      status,
      fileUrl,
    },
  });
  res.json({ invoice });
}

async function handleDeleteInvoice(req: VercelRequest, res: VercelResponse) {
  const id = req.url?.split('/invoices/')[1];
  await prisma.invoice.delete({ where: { id } });
  res.json({ message: 'Invoice deleted' });
}

// Reports handlers
async function handleGetProfitLoss(req: VercelRequest, res: VercelResponse) {
  const transactions = await prisma.transaction.findMany();

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = income - expenses;

  res.json({
    totalIncome: income,
    totalExpenses: expenses,
    profit,
    margin: income > 0 ? (profit / income) * 100 : 0,
  });
}

async function handleGetCashFlow(req: VercelRequest, res: VercelResponse) {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: 100,
  });

  const cashFlow = transactions.map((t) => ({
    date: t.date,
    amount: t.type === 'INCOME' ? t.amount : -t.amount,
    type: t.type,
    category: t.category,
    description: t.description,
  }));

  res.json({ cashFlow });
}

async function handleGetCompanySummary(req: VercelRequest, res: VercelResponse) {
  const companies = await prisma.company.findMany({
    include: {
      transactions: true,
      issuedInvoices: true,
      receivedInvoices: true,
    },
  });

  const summary = companies.map((company) => {
    const transactions = company.transactions;
    const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

    return {
      id: company.id,
      name: company.name,
      code: company.code,
      currency: company.currency,
      balance: company.initialBalance + income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
      transactionCount: transactions.length,
      invoiceCount: company.issuedInvoices.length + company.receivedInvoices.length,
    };
  });

  res.json({ summary });
}
