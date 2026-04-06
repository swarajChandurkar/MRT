import prisma from './db.js';

async function main() {
  console.log('Seeding MRT International...');

  // 1. Categories
  const categories = [
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: 'home', sortOrder: 1 },
    { name: 'Health & Personal Care', slug: 'health-personal-care', icon: 'vaccines', sortOrder: 2 },
    { name: 'Beauty & Skincare', slug: 'beauty-skincare', icon: 'face', sortOrder: 3 },
    { name: 'Pet Supplies', slug: 'pet-supplies', icon: 'pets', sortOrder: 4 },
    { name: 'Baby & Kids Essentials', slug: 'baby-products', icon: 'child_care', sortOrder: 5 },
    { name: 'Electronics & Accessories', slug: 'electronics-accessories', icon: 'devices', sortOrder: 6 },
    { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'fitness_center', sortOrder: 7 },
  ];

  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    catMap[cat.slug] = created.id;
    console.log(`- Category: ${cat.name}`);
  }

  // 2. Products (Sample from original hardcoded list)
  const products = [
    { name: 'Premium Magnetic Hand Whisk', categorySlug: 'home-kitchen', badge: 'Top Pick', shortBenefit: 'An elegantly balanced whisk for effortless mixing and aerating.', keyBenefits: JSON.stringify(['Balanced weight for comfort', 'Polished food-grade steel', 'Magnetic handle for easy storage']), rating: '4.9/5 Recommended', image: '/assets/products/whisk-1.jpg', price: 29.99, isFeatured: true },
    { name: 'Professional Rotating Whisk', categorySlug: 'home-kitchen', badge: 'Top Pick', shortBenefit: 'Achieve perfect consistency with semi-automatic rotation technology.', keyBenefits: JSON.stringify(['Pressure-driven rotation', 'No batteries or cords required', 'Durable stainless construction']), rating: '4.8/5 Recommended', image: '/assets/products/whisk-2.jpg', price: 34.99, isFeatured: true },
    { name: 'Ice Face Roller', categorySlug: 'beauty-skincare', badge: 'Top Pick', shortBenefit: 'Reduce puffiness and stimulate collagen production with cooling therapy.', keyBenefits: JSON.stringify(['Calms inflammation and redness', 'Shrinks pore appearance', 'Ergonomic silicone grip']), rating: '4.7/5 Recommended', image: '/assets/products/placeholder.png', price: 14.99, isFeatured: true },
    { name: 'Neck & Shoulder Massager', categorySlug: 'health-personal-care', badge: 'Top Pick', shortBenefit: 'Relieve deep tissue tension with heated shiatsu kneading.', keyBenefits: JSON.stringify(['Soothing heat therapy', 'Ergonomic U-shape design', 'Adjustable speed and direction']), rating: '4.8/5 Recommended', image: '/assets/products/placeholder.png', price: 49.99, isFeatured: true },
    { name: 'Pet Hair Remover Roller', categorySlug: 'pet-supplies', badge: 'Top Pick', shortBenefit: 'Quickly trap and remove pet hair from furniture instantly.', keyBenefits: JSON.stringify(['No sticky adhesive tape required', 'Self-cleaning lint chamber', 'Reusable and eco-friendly']), rating: '4.8/5 Recommended', image: '/assets/products/placeholder.png', price: 18.99, isFeatured: true },
    { name: 'Baby Nail Trimmer', categorySlug: 'baby-products', badge: 'Top Pick', shortBenefit: 'Safely file tiny nails without risk of clipping the skin.', keyBenefits: JSON.stringify(['Whisper-quiet motor', 'Built-in LED front light', 'Multiple filing pad strengths']), rating: '4.8/5 Recommended', image: '/assets/products/placeholder.png', price: 18.99, isFeatured: true },
    { name: 'Wireless Earbuds', categorySlug: 'electronics-accessories', badge: 'Top Pick', shortBenefit: 'Immersive sound quality with deep bass and active noise cancellation.', keyBenefits: JSON.stringify(['Bluetooth 5.3 connection', '30-hour playback with case', 'IPX7 waterproof rating']), rating: '4.8/5 Recommended', image: '/assets/products/placeholder.png', price: 49.99, isFeatured: true },
    { name: 'Resistance Bands', categorySlug: 'sports-fitness', badge: 'Top Pick', shortBenefit: 'A complete portable gym for full-body strength training anywhere.', keyBenefits: JSON.stringify(['Stackable tension levels', 'Includes handles and door anchor', 'Snap-resistant natural latex']), rating: '4.8/5 Recommended', image: '/assets/products/placeholder.png', price: 29.99, isFeatured: true },
  ];

  for (const prod of products) {
    const { categorySlug, ...prodData } = prod;
    await prisma.product.create({
      data: {
        ...prodData,
        categoryId: catMap[categorySlug],
      }
    });
  }
  console.log(`- Seeded ${products.length} sample products.`);

  // 3. Testimonials
  const testimonials = [
    { name: 'Michael T.', location: 'Texas, USA', quote: 'Impressed with the Quality', text: 'I wasn\'t expecting this level of quality at this price point. Everything arrived in perfect condition. Will definitely order again.', region: 'us' },
    { name: 'Ahmed K.', location: 'Abu Dhabi', quote: 'Very Professional Service', text: 'The team was very responsive, and the entire process was handled professionally. Great experience.', region: 'ae' },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`- Seeded ${testimonials.length} testimonials.`);

  console.log('Seeding Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
