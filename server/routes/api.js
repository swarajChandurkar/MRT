import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// --- Auth ---
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// --- Categories ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', authenticateAdmin, async (req, res) => {
  try {
    const { name, slug, icon, image, sortOrder } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, icon, image, sortOrder: parseInt(sortOrder) || 0 }
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, slug, icon, image, sortOrder } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, slug, icon, image, sortOrder: parseInt(sortOrder) || 0 }
    });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// --- Products ---
router.get('/products', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const where = {};
    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;

    const products = await prisma.product.findMany({
      where,
      include: { category: true, reviews: true },
      orderBy: { sortOrder: 'asc' }
    });

    // Format for frontend (compatible with old structure if needed)
    const formatted = products.map(p => ({
      ...p,
      category: p.category.slug,
      categoryName: p.category.name,
      keyBenefits: p.keyBenefits ? JSON.parse(p.keyBenefits) : []
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, badge, shortBenefit, keyBenefits, rating, price, image, affiliateLink, isFeatured, sortOrder } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        badge,
        shortBenefit,
        keyBenefits: JSON.stringify(keyBenefits),
        rating,
        price: parseFloat(price),
        image,
        affiliateLink,
        isFeatured: Boolean(isFeatured),
        sortOrder: parseInt(sortOrder) || 0
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, categoryId, badge, shortBenefit, keyBenefits, rating, price, image, affiliateLink, isFeatured, sortOrder } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        categoryId,
        badge,
        shortBenefit,
        keyBenefits: JSON.stringify(keyBenefits),
        rating,
        price: parseFloat(price),
        image,
        affiliateLink,
        isFeatured: Boolean(isFeatured),
        sortOrder: parseInt(sortOrder) || 0
      }
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// --- Testimonials ---
router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.post('/testimonials', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.create({ data: req.body });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.put('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, location, quote, text, region } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { name, location, quote, text, region }
    });
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// --- Themes (Category Meta) ---
// For simplicity in this boutique setup, we return a mapping. 
// In a full CMS this would be its own model or fields on Category.
router.get('/themes', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    const themes = {};
    categories.forEach(cat => {
      themes[cat.slug] = {
        primary: '#914d00', // Default or from Category model
        secondary: '#f28c28',
        title: cat.name,
        image: cat.image || '/assets/categories/placeholder.png',
        seoTitle: `Top 10 Best ${cat.name} Products (2026)`,
        seoIntro: `Discover the most useful, trending, and top-rated ${cat.name} products carefully selected for quality and value.`
      };
    });
    res.json(themes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

export default router;
