import express from 'express';
import prisma from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Valid email required' });
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, source: source || 'website' },
      create: { email, source: source || 'website' },
    });
    res.status(201).json({ success: true, id: sub.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subscribers', authMiddleware, adminOnly, async (req, res) => {
  try {
    const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
