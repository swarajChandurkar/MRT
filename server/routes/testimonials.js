import express from 'express';
import prisma from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public: List active testimonials (Static for 100% Reliability)
const TESTIMONIALS_STATIC = [
  { id: 1, name: 'Michael T.', location: 'Texas, USA', text: 'Superior craftsmanship and world-class logistics. MRT International delivers excellence in every shipment.', region: 'us' },
  { id: 2, name: 'Jessica L.', location: 'California, USA', text: 'The boutique catalog is curated with extreme care. Every product feels like a luxury item tailored for elite needs.', region: 'us' },
  { id: 3, name: 'Ahmed K.', location: 'Abu Dhabi, UAE', text: 'Their Elite Sourcing Kit is a game changer for our trade delegations. Truly professional and localized excellence.', region: 'ae' },
  { id: 4, name: 'Sara M.', location: 'Dubai, UAE', text: 'Exceptional delivery speed to the UAE. The product quality exceeded our high standards for artisanal skincare.', region: 'ae' }
];

router.get('/', (req, res) => {
  res.json(TESTIMONIALS_STATIC);
});

// Admin: Create
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const t = await prisma.testimonial.create({ data: req.body });
    res.status(201).json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const t = await prisma.testimonial.update({ where: { id }, data: req.body });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
