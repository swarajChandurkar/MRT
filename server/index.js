import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import authRouter from './routes/auth.js';
import affiliateRouter from './routes/affiliate.js';
import testimonialsRouter from './routes/testimonials.js';
import wishlistRouter from './routes/wishlist.js';
import comparisonRouter from './routes/comparison.js';
import newsletterRouter from './routes/newsletter.js';
import reviewsRouter from './routes/reviews.js';
import mediaRouter from './routes/media.js';
import adminRouter from './routes/admin.js';
import prisma from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure upload directory
const uploadDir = path.join(__dirname, '../public/assets/uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ENHANCED: Prevent API Caching ONLY for specific data routes to save server load
app.use('/api', (req, res, next) => {
  // Only aggressively prevent caching on dynamic data routes, let static assets/media cache normally
  if (req.method === 'GET' && !req.url.includes('/media')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});
// Debug Logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/comparison', comparisonRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/media', mediaRouter);
app.use('/api/admin', adminRouter);

// ENHANCED: Resilient legacy compatibility route WITH Missing Category Alerts
app.get('/api/legacy/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { slug: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(products.map(p => {
      // Missing Category Alert System
      if (!p.category) {
        console.warn(`[CMS ALERT] Product missing category link: ID [${p.id}] - "${p.name}". Falling back to 'uncategorized'.`);
      }

      let keyBenefits = [];
      try { keyBenefits = JSON.parse(p.keyBenefits || '[]'); } catch(e) { keyBenefits = p.keyBenefits || []; }

      return {
        ...p,
        name: p.name,
        shortBenefit: p.shortBenefit,
        price: p.price,
        ratingValue: p.ratingValue,
        badge: p.badge,
        image: p.image,
        category: p.category ? p.category.slug : 'uncategorized',
        keyBenefits: keyBenefits,
        tags: JSON.parse(p.tags || '[]'),
      };
    }));
  } catch (err) {
    console.error('Legacy Products Fetch Error:', err);
    res.status(500).json([]);
  }
});

// Single Product Fetch (For Quick View) - DEFINED DIRECTLY HERE for priority
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    let keyBenefits = [];
    try { keyBenefits = JSON.parse(product.keyBenefits || '[]'); } catch(e) { keyBenefits = product.keyBenefits || []; }

    res.json({
      ...product,
      keyBenefits: keyBenefits,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
    });
  } catch (err) {
    console.error('API Product Fetch Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Legacy: Themes as object keyed by slug
app.get('/api/legacy/themes', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { theme: true } });
    const themes = {};
    categories.forEach(c => {
      if (c.theme) {
        themes[c.slug] = {
          primary: c.theme.primary,
          secondary: c.theme.secondary,
          title: c.theme.title,
          subtitle: c.theme.subtitle,
          seoTitle: c.theme.seoTitle,
          seoIntro: c.theme.seoIntro,
          image: c.image,
        };
      }
    });
    res.json(themes);
  } catch (err) {
    res.status(500).json({});
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MRT International Server is healthy' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[server] MRT International backend running on http://localhost:${PORT}`);
});
