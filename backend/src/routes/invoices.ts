import express from 'express';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const invoices = await prisma.invoice.findMany({
      include: {
        issuerCompany: true,
        receiverCompany: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      amount,
      currency,
      issuerCompanyId,
      receiverCompanyId,
      receiverName,
      status,
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
        status,
        createdBy: req.userId,
      },
    });

    res.status(201).json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        issuerCompany: true,
        receiverCompany: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const {
      invoiceDate,
      dueDate,
      amount,
      currency,
      receiverCompanyId,
      receiverName,
      status,
    } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        amount: parseFloat(amount),
        currency,
        receiverCompanyId,
        receiverName,
        status,
      },
    });

    res.json({ invoice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    await prisma.invoice.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

export default router;
