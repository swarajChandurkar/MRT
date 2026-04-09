import express from 'express';
import prisma from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Router-level Debug
router.use((req, res, next) => {
  console.log(`[PRODUCTS ROUTER] ${req.method} ${req.url}`);
  next();
});

// Public: Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(parseJsonFields(product));
  } catch (err) {
    console.error(`[API ERROR] GET /products/:id:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

function parseJsonFields(product) {
  const tryParse = (val) => {
    if (!val) return [];
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch (e) {
      return [];
    }
  };

  return {
    ...product,
    images: tryParse(product.images),
    tags: tryParse(product.tags),
    keyBenefits: tryParse(product.keyBenefits),
    pros: tryParse(product.pros),
    cons: tryParse(product.cons),
  };
}

// Public: List products with filters, sorting, pagination
router.get('/', async (req, res) => {
  try {
    const { category, badge, search, sort, order, page = 1, limit = 50, featured } = req.query;
    const where = { isActive: true };
    if (category) where.category = { slug: category };
    if (badge) where.badge = badge;
    if (featured === 'true') where.isFeatured = true;
    if (search) where.name = { contains: search };

    const orderBy = {};
    if (sort === 'price') orderBy.price = order === 'desc' ? 'desc' : 'asc';
    else if (sort === 'rating') orderBy.ratingValue = 'desc';
    else if (sort === 'newest') orderBy.createdAt = 'desc';
    else orderBy.sortOrder = 'asc';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit),
        include: { category: { select: { slug: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map(parseJsonFields),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Products list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: Get product by slug
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(parseJsonFields(product));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
      take: 6,
      orderBy: { ratingValue: 'desc' },
    });
    res.json(related.map(parseJsonFields));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create product
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = req.body;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        shortBenefit: data.shortBenefit || '',
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
        image: data.image || '',
        images: JSON.stringify(data.images || []),
        badge: data.badge || '',
        rating: data.rating || '',
        ratingValue: parseFloat(data.ratingValue) || 0,
        reviewCount: parseInt(data.reviewCount) || 0,
        categoryId: data.categoryId,
        tags: JSON.stringify(data.tags || []),
        keyBenefits: JSON.stringify(data.keyBenefits || []),
        pros: JSON.stringify(data.pros || []),
        cons: JSON.stringify(data.cons || []),
        affiliateUrl: data.affiliateUrl || '',
        affiliateSource: data.affiliateSource || '',
        isActive: data.isActive !== false,
        isFeatured: data.isFeatured || false,
        sortOrder: parseInt(data.sortOrder) || 0,
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
      },
    });
    invalidateCache('products');
    res.status(201).json(parseJsonFields(product));
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update product
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const data = req.body;
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.shortBenefit !== undefined) updateData.shortBenefit = data.shortBenefit;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice ? parseFloat(data.compareAtPrice) : null;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.ratingValue !== undefined) updateData.ratingValue = parseFloat(data.ratingValue);
    if (data.reviewCount !== undefined) updateData.reviewCount = parseInt(data.reviewCount);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
    if (data.keyBenefits !== undefined) updateData.keyBenefits = JSON.stringify(data.keyBenefits);
    if (data.pros !== undefined) updateData.pros = JSON.stringify(data.pros);
    if (data.cons !== undefined) updateData.cons = JSON.stringify(data.cons);
    if (data.affiliateUrl !== undefined) updateData.affiliateUrl = data.affiliateUrl;
    if (data.affiliateSource !== undefined) updateData.affiliateSource = data.affiliateSource;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.sortOrder !== undefined) updateData.sortOrder = parseInt(data.sortOrder);
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;

    const product = await prisma.product.update({ where: { id: req.params.id }, data: updateData });
    invalidateCache('products');
    res.json(parseJsonFields(product));
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete product
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    invalidateCache('products');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Bulk create/update
router.post('/bulk', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { products } = req.body;
    const results = [];
    for (const data of products) {
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const product = await prisma.product.upsert({
        where: { slug },
        update: { name: data.name, price: parseFloat(data.price) || 0, image: data.image || '', badge: data.badge || '' },
        create: {
          name: data.name, slug, price: parseFloat(data.price) || 0, image: data.image || '',
          badge: data.badge || '', categoryId: data.categoryId,
          keyBenefits: JSON.stringify(data.keyBenefits || []),
          shortBenefit: data.shortBenefit || '', rating: data.rating || '',
        },
      });
      results.push(product);
    }
    invalidateCache('products');
    res.json({ imported: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
