import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.post('/', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const { name, code, currency, country, type } = req.body;

    const company = await prisma.company.create({
      data: { name, code, currency, country, type },
    });

    res.status(201).json({ company });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const company = await prisma.company.findUnique({
      where: { id: req.params.id },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

router.put('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    const { name, code, currency, country, type } = req.body;

    const company = await prisma.company.update({
      where: { id: req.params.id },
      data: { name, code, currency, country, type },
    });

    res.json({ company });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../index');
    await prisma.company.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

export default router;
