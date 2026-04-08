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

// Legacy compatibility: Return products as flat array for existing frontend
app.get('/api/legacy/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: { select: { slug: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(products.map(p => ({
      ...p,
      category: p.category.slug,
      keyBenefits: JSON.parse(p.keyBenefits || '[]'),
      tags: JSON.parse(p.tags || '[]'),
    })));
  } catch (err) {
    res.status(500).json([]);
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
