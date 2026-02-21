import express from 'express';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const transactions = await prisma.transaction.findMany({
      include: {
        company: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const {
      companyId,
      type,
      amount,
      currency,
      category,
      description,
      date,
      relatedCompanyId,
      relatedTransactionId,
      invoiceId,
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
        createdBy: req.userId,
      },
    });

    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const {
      type,
      amount,
      currency,
      category,
      description,
      date,
    } = req.body;

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        type,
        amount: parseFloat(amount),
        currency,
        category,
        description,
        date: new Date(date),
      },
    });

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    await prisma.transaction.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;
