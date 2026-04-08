import prisma from './db.js';

async function main() {
  console.log('🚀 Enriching MRT International with Premium Studio Visuals and Social Proof...');

  await prisma.review.deleteMany();
  await prisma.product.deleteMany();

  // 1. Categories with accurate slugs
  const categories = [
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: 'home', sortOrder: 1 },
    { name: 'Health & Wellness', slug: 'health-wellness', icon: 'health_and_safety', sortOrder: 2 },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: 'face', sortOrder: 3 },
    { name: 'Pet Supplies', slug: 'pet-supplies', icon: 'pets', sortOrder: 4 },
    { name: 'Baby & Kids Essentials', slug: 'baby-kids-essentials', icon: 'child_care', sortOrder: 5 },
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
  }

  // 2. High-Fidelity Product Catalog (Studio Style) - All Categories Covered
  const products = [
    {
      name: 'Premium Magnetic Whisk',
      slug: 'premium-magnetic-whisk',
      description: 'Professional grade kitchen whisk with magnetic stabilizing technology.',
      price: 24.99,
      image: '/assets/products/premium-whisk.png',
      badge: 'Best Seller',
      shortBenefit: 'Effortless mixing with magnetic balance.',
      isActive: true,
      sortOrder: 1,
      ratingValue: 4.9,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "premium", "magnetic"]),
      keyBenefits: JSON.stringify(["Magnetic Balance", "High Grade Steel", "Ergonomic Grip"])
    },
    {
      name: 'Orthopedic Back Support Belt',
      slug: 'orthopedic-back-support-belt',
      description: 'Advanced orthopedic support for lower back health and posture correction.',
      price: 49.99,
      image: '/assets/products/back-support.png',
      badge: 'Expert Choice',
      shortBenefit: 'Medical-grade posture alignment.',
      isActive: true,
      sortOrder: 2,
      ratingValue: 4.8,
      categorySlug: 'health-wellness',
      tags: JSON.stringify(["health", "posture", "orthopedic"]),
      keyBenefits: JSON.stringify(["Posture Correction", "Breathable Mesh", "Adjustable Tension"])
    },
    {
      name: 'Ultra-Precision Digital Scale',
      slug: 'ultra-precision-digital-scale',
      description: 'High-precision digital scale with laboratory grade sensors.',
      price: 34.99,
      image: '/assets/products/digital-scale.png',
      badge: 'Top Rated',
      shortBenefit: 'Accuracy down to 0.01g.',
      isActive: true,
      sortOrder: 3,
      ratingValue: 4.8,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "precision", "digital"]),
      keyBenefits: JSON.stringify(["0.01g Precision", "Backlit LCD", "Tempered Glass"])
    },
    {
      name: 'Luxe Radiance Facial Serum',
      slug: 'luxe-radiance-facial-serum',
      description: 'Premium hyaluronic acid and vitamin C complex for youthful skin.',
      price: 89.99,
      image: '/assets/products/facial-serum.png',
      badge: 'Elite Beauty',
      shortBenefit: 'Instant hydration and glow.',
      isActive: true,
      sortOrder: 4,
      ratingValue: 4.9,
      categorySlug: 'beauty-personal-care',
      tags: JSON.stringify(["beauty", "skincare", "luxury"]),
      keyBenefits: JSON.stringify(["Hyaluronic Complex", "Glow Boost", "Non-Greasy"])
    },
    {
      name: 'Sonic Pulse Electric Toothbrush',
      slug: 'sonic-pulse-electric-toothbrush',
      description: 'High-frequency vibration toothbrush for professional dental cleaning.',
      price: 129.99,
      image: '/assets/products/electric-toothbrush.png',
      badge: 'Award Winner',
      shortBenefit: '40,000 pulses per minute.',
      isActive: true,
      sortOrder: 5,
      ratingValue: 4.8,
      categorySlug: 'beauty-personal-care',
      tags: JSON.stringify(["health", "tech", "personal-care"]),
      keyBenefits: JSON.stringify(["Sonic Tech", "UV Sanitizer", "30-Day Battery"])
    },
    {
      name: 'Smart Ergonomic Office Chair',
      slug: 'smart-ergonomic-office-chair',
      description: 'Dynamic lumbar support and responsive mesh for all-day comfort.',
      price: 399.99,
      image: '/assets/products/office-chair.png',
      badge: 'Pro Setup',
      shortBenefit: 'Ultimate lumbar support system.',
      isActive: true,
      sortOrder: 6,
      ratingValue: 4.7,
      categorySlug: 'electronics-accessories',
      tags: JSON.stringify(["office", "furniture", "ergonomic"]),
      keyBenefits: JSON.stringify(["Dynamic Lumbar", "4D Armrests", "High Breathability"])
    },
    {
      name: 'Crystal Clear Glass Kettle',
      slug: 'crystal-clear-glass-kettle',
      description: 'Borosilicate glass electric kettle with beautiful LED illumination.',
      price: 59.99,
      image: '/assets/products/glass-kettle.png',
      badge: 'Modern Kitchen',
      shortBenefit: 'Rapid boil with LED glow.',
      isActive: true,
      sortOrder: 7,
      ratingValue: 4.8,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "modern", "electric"]),
      keyBenefits: JSON.stringify(["Borosilicate Glass", "Rapid Boil", "Auto Shut-off"])
    },
    {
      name: 'Nano-Filtration Air Purifier',
      slug: 'nano-filtration-air-purifier',
      description: 'Medical-grade H13 HEPA filtration for pure, clean air.',
      price: 249.99,
      image: '/assets/products/air-purifier.png',
      badge: 'Fresh Air',
      shortBenefit: 'Eliminates 99.9% of particles.',
      isActive: true,
      sortOrder: 8,
      ratingValue: 4.9,
      categorySlug: 'health-wellness',
      tags: JSON.stringify(["health", "home", "purity"]),
      keyBenefits: JSON.stringify(["H13 HEPA", "Whisper Quiet", "Smart Monitoring"])
    },
    {
      name: 'Deep Tissue Muscle Massager',
      slug: 'deep-tissue-muscle-massager',
      description: 'Professional percussive therapy device for rapid recovery.',
      price: 199.99,
      image: '/assets/products/muscle-massager.png',
      badge: 'Elite Athlete',
      shortBenefit: 'Accelerates muscle recovery.',
      isActive: true,
      sortOrder: 9,
      ratingValue: 4.8,
      categorySlug: 'sports-fitness',
      tags: JSON.stringify(["fitness", "recovery", "pro"]),
      keyBenefits: JSON.stringify(["3000 PPM", "Quiet Glide", "8 Attachments"])
    },
    {
      name: 'Artisan Copper Cookware Set',
      slug: 'artisan-copper-cookware-set',
      description: 'Hand-crafted copper pots and pans for superior heat distribution.',
      price: 599.99,
      image: '/assets/products/cookware-set.png',
      badge: 'Chef Grade',
      shortBenefit: 'Superior heating, timeless design.',
      isActive: true,
      sortOrder: 10,
      ratingValue: 4.9,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "artisan", "copper"]),
      keyBenefits: JSON.stringify(["Pure Copper", "Steel Handles", "Lifetime Durability"])
    },
    {
      name: 'Smart Induction Milk Frother',
      slug: 'smart-induction-milk-frother',
      description: 'Induction heating frother for coffee-shop quality foam at home.',
      price: 79.99,
      image: '/assets/products/milk-frother.png',
      badge: 'Barista Choice',
      shortBenefit: 'Perfect foam in 60 seconds.',
      isActive: true,
      sortOrder: 11,
      ratingValue: 4.8,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "coffee", "luxury"]),
      keyBenefits: JSON.stringify(["Induction Heat", "Dishwasher Safe", "3 Foam Modes"])
    },
    {
      name: 'Professional Grade Yoga Mat',
      slug: 'professional-grade-yoga-mat',
      description: 'High-density material and non-slip surface for advanced practice.',
      price: 89.99,
      image: '/assets/products/yoga-mat.png',
      badge: 'Eco-Friendly',
      shortBenefit: 'Superior grip and cushioning.',
      isActive: true,
      sortOrder: 12,
      ratingValue: 4.9,
      categorySlug: 'sports-fitness',
      tags: JSON.stringify(["fitness", "yoga", "wellness"]),
      keyBenefits: JSON.stringify(["Non-Slip Grip", "6mm Cushion", "Toxic-Free"])
    },
    {
      name: 'Adjustable Weighted Vest',
      slug: 'adjustable-weighted-vest',
      description: 'Ergonomic fitness vest with adjustable weights for strength training.',
      price: 149.99,
      image: '/assets/products/weighted-vest.png',
      badge: 'Pro Training',
      shortBenefit: 'Maximize workout intensity.',
      isActive: true,
      sortOrder: 13,
      ratingValue: 4.7,
      categorySlug: 'sports-fitness',
      tags: JSON.stringify(["fitness", "strength", "gear"]),
      keyBenefits: JSON.stringify(["Breathable Gear", "Even Weight Dist", "Adjustable Fit"])
    },
    {
      name: 'Portable Espresso Machine',
      slug: 'portable-espresso-machine',
      description: 'Compact manual espresso maker for premium coffee anywhere.',
      price: 119.99,
      image: '/assets/products/espresso-machine.png',
      badge: 'Travel Gear',
      shortBenefit: 'Espresso anywhere, any time.',
      isActive: true,
      sortOrder: 14,
      ratingValue: 4.8,
      categorySlug: 'home-kitchen',
      tags: JSON.stringify(["kitchen", "travel", "coffee"]),
      keyBenefits: JSON.stringify(["18 Bar Pressure", "Lightweight", "Manual Tech"])
    },
    {
      name: 'High-Fidelity Noise Cancelling Headphones',
      slug: 'high-fidelity-noise-cancelling-headphones',
      description: 'Ultimate audio experience with advanced active noise cancellation.',
      price: 349.99,
      image: '/assets/products/noise-cancelling-headphones.png',
      badge: 'Premium Audio',
      shortBenefit: 'Total immersion, zero noise.',
      isActive: true,
      sortOrder: 15,
      ratingValue: 4.9,
      categorySlug: 'electronics-accessories',
      tags: JSON.stringify(["tech", "audio", "premium"]),
      keyBenefits: JSON.stringify(["Adaptive ANC", "40H Battery", "Studio Sound"])
    },
    {
      name: 'Organic Bamboo Baby Swaddle',
      slug: 'organic-bamboo-baby-swaddle',
      description: 'Ultra-soft, breathable bamboo fiber swaddle for delicate skin.',
      price: 32.99,
      image: '/assets/products/baby-swaddle.png',
      badge: 'Pure Choice',
      shortBenefit: 'Cloud-soft comfort for babies.',
      isActive: true,
      sortOrder: 16,
      ratingValue: 5.0,
      categorySlug: 'baby-kids-essentials',
      tags: JSON.stringify(["baby", "organic", "bamboo"]),
      keyBenefits: JSON.stringify(["100% Organic", "Breathable", "Extra Large"])
    },
    {
      name: 'Smart GPS Pet Tracker',
      slug: 'smart-gps-pet-tracker',
      description: 'Real-time location tracking and activity monitor for your pets.',
      price: 129.99,
      image: '/assets/products/pet-tracker.png',
      badge: 'Safe Pet',
      shortBenefit: 'Always know where they are.',
      isActive: true,
      sortOrder: 17,
      ratingValue: 4.9,
      categorySlug: 'pet-supplies',
      tags: JSON.stringify(["pets", "tech", "gps"]),
      keyBenefits: JSON.stringify(["Real-time GPS", "Waterproof", "Activity Log"])
    }
  ];

  const reviewTemplates = [
    { userName: 'Sarah J.', rating: 5, comment: 'Absolutely game changing! The quality exceeds the price point significantly.' },
    { userName: 'Michael R.', rating: 4, comment: 'Solid build and performs exactly as described. Highly recommended for daily use.' },
    { userName: 'Elena V.', rating: 5, comment: 'Beautiful aesthetic and functional excellence. MRT hit it out of the park with this one.' },
    { userName: 'David K.', rating: 5, comment: 'If you are on the fence, just buy it. The attention to detail is premium level.' },
    { userName: 'Amina L.', rating: 4, comment: 'Very happy with the purchase. Packaged perfectly and shipping was fast.' }
  ];

  for (const prod of products) {
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: { 
        ...prod, 
        categoryId: catMap[prod.categorySlug], 
        categorySlug: undefined 
      },
      create: { 
        ...prod, 
        categoryId: catMap[prod.categorySlug], 
        categorySlug: undefined 
      },
    });

    console.log(`✨ Synced: ${prod.name}`);

    // Create 3 random reviews for each product
    const shuffled = [...reviewTemplates].sort(() => 0.5 - Math.random());
    const selectedReviews = shuffled.slice(0, 3);

    for (const rev of selectedReviews) {
      await prisma.review.create({
        data: {
          ...rev,
          productId: createdProduct.id,
          isVerified: true
        }
      });
    }
    console.log(`   └─ Added 3 Premium Reviews`);
  }

  console.log('🌟 Seeding Complete. Store populated with 100% Category Coverage and Studio Visuals.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
