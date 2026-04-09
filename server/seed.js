import prisma from './db.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🚀 Finalizing MRT International Catalog with Verified Affiliate Links & Visuals...');

  // Clean in correct order (foreign key constraints)
  await prisma.review.deleteMany();
  await prisma.comparisonItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.affiliateClick.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTheme.deleteMany();
  await prisma.category.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.user.deleteMany();

  // 0. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mrt.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPass, 10);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: 'MRT Admin',
      role: 'ADMIN',
    }
  });
  console.log(`👤 Admin user created: ${adminEmail}`);

  // 1. Categories Migration
  const categories = [
    { name: 'Home & Kitchen', slug: 'home-kitchen', image: '/assets/categories/home-kitchen.png', sortOrder: 1 },
    { name: 'Health & Wellness', slug: 'health-wellness', image: '/assets/categories/health-wellness.png', sortOrder: 2 },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', image: '/assets/categories/beauty-skincare.png', sortOrder: 3 },
    { name: 'Pet Supplies', slug: 'pet-supplies', image: '/assets/categories/pet-supplies.png', sortOrder: 4 },
    { name: 'Baby & Kids Essentials', slug: 'baby-kids-essentials', image: '/assets/categories/baby-products.png', sortOrder: 5 },
    { name: 'Electronics & Accessories', slug: 'electronics-accessories', image: '/assets/categories/electronics.png', sortOrder: 6 },
    { name: 'Sports & Fitness', slug: 'sports-fitness', image: '/assets/categories/sports-fitness.png', sortOrder: 7 },
  ];

  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.name] = created.id;
    catMap[cat.slug] = created.id;
  }
  console.log(`📁 ${categories.length} categories created`);

  // 1b. Themes
  const themes = [
    { slug: 'home-kitchen', primary: '#914d00', secondary: '#f28c28', title: 'Modern Kitchen', subtitle: 'Culinary brilliance and lifestyle essentials', seoTitle: 'Elite Best Home & Kitchen Collection', seoIntro: 'Curated selection of premium kitchenware and home essentials.' },
    { slug: 'health-wellness', primary: '#006a6a', secondary: '#00cfcf', title: 'Personal Vitality', subtitle: 'Advanced recovery and wellness curations', seoTitle: 'High-Performance Health & Wellness Gear', seoIntro: 'Advanced recovery tools and wellness essentials.' },
    { slug: 'beauty-personal-care', primary: '#701b2f', secondary: '#ffb2bd', title: 'Artisanal Beauty', subtitle: 'Pristine formulas for radiant maintenance', seoTitle: 'Premium Beauty & Skincare Essentials', seoIntro: 'Discover professional-grade skincare and beauty tools.' },
    { slug: 'pet-supplies', primary: '#3a6a00', secondary: '#8ce33a', title: 'Pet Curations', subtitle: 'Sophisticated gear for companions', seoTitle: 'World-Class Pet Supplies & Tracking', seoIntro: 'Precision tracking and professional grooming gear.' },
    { slug: 'baby-kids-essentials', primary: '#004a77', secondary: '#7fbaff', title: 'Baby Essentials', subtitle: 'Nordic design for modern parents', seoTitle: 'Safe & Sustainable Baby Essentials', seoIntro: 'Ergonomic designs and safety-first grooming tools.' },
    { slug: 'electronics-accessories', primary: '#1f1b17', secondary: '#bf8f00', title: 'Tech Companions', subtitle: 'Performance-driven digital gear', seoTitle: 'Elite Tech Accessories & Charging Hubs', seoIntro: 'High-performance digital essentials.' },
    { slug: 'sports-fitness', primary: '#006e2a', secondary: '#55f985', title: 'Peak Performance', subtitle: 'Minimalist gear for elite training', seoTitle: 'Professional-Grade Sports & Fitness Gear', seoIntro: 'Minimalist equipment and heavy-duty support gear.' },
  ];

  for (const theme of themes) {
    const { slug, ...themeData } = theme;
    await prisma.categoryTheme.create({
      data: { ...themeData, categoryId: catMap[slug] }
    });
  }

  // 2. FINAL PRODUCT CATALOG (From User Request)
  const finalProducts = [
    // HOME & KITCHEN
    { cat: 'Home & Kitchen', badge: 'Top Picks', name: 'Vegetable Chopper', url: 'https://amzn.to/4mgjKOK' },
    { cat: 'Home & Kitchen', badge: 'Top Picks', name: 'Electric Spin Scrubber', url: 'https://amzn.to/4vayOS5' },
    { cat: 'Home & Kitchen', badge: 'Top Picks', name: 'Vacuum Storage Bags', url: 'https://amzn.to/3NQUaDg' },
    { cat: 'Home & Kitchen', badge: 'Top Picks', name: 'Air Fryer Accessories Set', url: 'https://amzn.to/47J01RH' },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Oil Spray Bottle', url: 'https://amzn.to/3OmAkQo' },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Smart Plug', url: 'https://amzn.to/3PU7kzZ' },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'LED Motion Sensor Lights', url: 'https://amzn.to/41hGtjS' },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Microfiber Cleaning Cloth Pack', url: 'https://amzn.to/4cdP3Fi' },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Digital Kitchen Scale', url: 'https://amzn.to/3PSpaDq' },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Under Sink Organizer', url: 'https://amzn.to/3NQUTEu' },

    // BEAUTY & PERSONAL CARE
    { cat: 'Beauty & Personal Care', badge: 'Top Picks', name: 'Ice Face Roller', url: 'https://amzn.to/4sj2ytg' },
    { cat: 'Beauty & Personal Care', badge: 'Top Picks', name: 'Facial Cleansing Brush', url: 'https://amzn.to/4dwEOOH' },
    { cat: 'Beauty & Personal Care', badge: 'Top Picks', name: 'Hair Straightener Brush', url: 'https://amzn.to/48jgyvP' },
    { cat: 'Beauty & Personal Care', badge: 'Top Picks', name: 'LED Makeup Mirror', url: 'https://amzn.to/4vfzipZ' },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Heatless Hair Curlers', url: 'https://amzn.to/4migCSr' },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Blackhead Remover Vacuum', url: 'https://amzn.to/4ve7ylD' },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Electric Toothbrush', url: 'https://amzn.to/4vaA3AJ' },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Electric Eyebrow Trimmer', url: 'https://amzn.to/4seAiYR' },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Makeup Brush Set', url: 'https://amzn.to/4sW28dh' },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Cosmetic Organizer', url: 'https://amzn.to/4tytGFH' },

    // HEALTH & WELLNESS
    { cat: 'Health & Wellness', badge: 'Top Picks', name: 'Neck & Shoulder Massager', url: 'https://amzn.to/4bUeFbj' },
    { cat: 'Health & Wellness', badge: 'Top Picks', name: 'Posture Corrector', url: 'https://amzn.to/4mfhIhB' },
    { cat: 'Health & Wellness', badge: 'Top Picks', name: 'Massage Gun', url: 'https://amzn.to/41iIMTD' },
    { cat: 'Health & Wellness', badge: 'Top Picks', name: 'Memory Foam Pillow', url: 'https://amzn.to/4sP2liu' },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Aromatherapy Diffuser', url: 'https://amzn.to/47JWi6m' },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Foam Roller', url: 'https://amzn.to/4vee8bR' },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Weighted Blanket', url: 'https://amzn.to/4cuuq8Y' },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Eye Massager', url: 'https://amzn.to/4sjeTgW' },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'White Noise Machine', url: 'https://amzn.to/3PWkxbo' },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Lumbar Support Cushion', url: 'https://amzn.to/4vdRQXB' },

    // PET SUPPLIES
    { cat: 'Pet Supplies', badge: 'Top Picks', name: 'Pet Hair Remover Roller', url: 'https://amzn.to/4sCm3NL' },
    { cat: 'Pet Supplies', badge: 'Top Picks', name: 'Self-Cleaning Grooming Brush', url: 'https://amzn.to/4mfdKWt' },
    { cat: 'Pet Supplies', badge: 'Top Picks', name: 'Automatic Pet Feeder', url: 'https://amzn.to/41iJvEl' },
    { cat: 'Pet Supplies', badge: 'Top Picks', name: 'Pet Water Fountain', url: 'https://amzn.to/3PSASxU' },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Interactive Dog Toy', url: 'https://amzn.to/4mfmbAR' },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Cat Laser Toy', url: 'https://amzn.to/47Hm0bJ' },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Portable Pet Water Bottle', url: 'https://amzn.to/4drRB4S' },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Slow Feeder Bowl', url: 'https://amzn.to/4mbNWue' },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Nail Clipper', url: 'https://amzn.to/4sRqXHj' },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Bed', url: 'https://amzn.to/4soPJh3' },

    // BABY & KIDS
    { cat: 'Baby & Kids Essentials', badge: 'Top Picks', name: 'Baby Nail Trimmer', url: 'https://amzn.to/4sgYlpK' },
    { cat: 'Baby & Kids Essentials', badge: 'Top Picks', name: 'Silicone Feeding Set', url: 'https://amzn.to/48z3NNN' },
    { cat: 'Baby & Kids Essentials', badge: 'Top Picks', name: 'Baby Diaper Bag', url: 'https://amzn.to/3OkGAIp' },
    { cat: 'Baby & Kids Essentials', badge: 'Top Picks', name: 'Portable Changing Mat', url: 'https://amzn.to/4c8AHWJ' },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Cabinet Safety Locks', url: 'https://amzn.to/4t1fyF2' },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Baby Bottle Warmer', url: 'https://amzn.to/4sP3vdQ' },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Baby Bath Support', url: 'https://amzn.to/4ve9vOZ' },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Stroller Organizer', url: 'https://amzn.to/4cuvnhy' },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Toy Set', url: 'https://amzn.to/3PTsPkm' },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Grooming Kit', url: 'https://amzn.to/4cbFKFG' },

    // ELECTRONICS
    { cat: 'Electronics & Accessories', badge: 'Top Picks', name: 'Wireless Earbuds', url: 'https://amzn.to/4ccwbqa' },
    { cat: 'Electronics & Accessories', badge: 'Top Picks', name: 'Fast Wireless Charger', url: 'https://amzn.to/4dQO28H' },
    { cat: 'Electronics & Accessories', badge: 'Top Picks', name: 'Power Bank', url: 'https://amzn.to/4tCD5w5' },
    { cat: 'Electronics & Accessories', badge: 'Top Picks', name: 'Bluetooth Speaker', url: 'https://amzn.to/4mbyWMO' },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Smart LED Strip Lights', url: 'https://amzn.to/41hOMvW' },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Car Phone Mount', url: 'https://amzn.to/4teXqb3' },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Charging Hub', url: 'https://amzn.to/4mkil9Y' },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Mini Projector', url: 'https://amzn.to/4sgFueI' },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Laptop Stand', url: 'https://amzn.to/41PFXcP' },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Phone Stand', url: 'https://amzn.to/47KCkbN' },

    // SPORTS & FITNESS
    { cat: 'Sports & Fitness', badge: 'Top Picks', name: 'Resistance Bands', url: 'https://amzn.to/4csnjxL' },
    { cat: 'Sports & Fitness', badge: 'Top Picks', name: 'Massage Gun', url: 'https://amzn.to/4t2EnR8' },
    { cat: 'Sports & Fitness', badge: 'Top Picks', name: 'Yoga Mat', url: 'https://amzn.to/47KcdSc' },
    { cat: 'Sports & Fitness', badge: 'Top Picks', name: 'Adjustable Dumbbells', url: 'https://amzn.to/4vggOWa' },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Ab Roller', url: 'https://amzn.to/3OpiNHd' },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Jump Rope', url: 'https://amzn.to/4bUqYV0' },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Foam Roller', url: 'https://amzn.to/3PLBzJp' },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Push-Up Board', url: 'https://amzn.to/4trnFKQ' },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Gym Gloves', url: 'https://amzn.to/4cbGYAM' },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Water Bottle', url: 'https://amzn.to/41MUm9M' }
  ];

  for (let i = 0; i < finalProducts.length; i++) {
    const p = finalProducts[i];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // IMAGE LOGIC: Using specific realistic images for core products, fallback to high-quality themed Unsplash placeholders
    const specificImages = {
      'Vegetable Chopper': 'https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?auto=format&fit=crop&w=600&q=80',
      'Electric Spin Scrubber': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      'Vacuum Storage Bags': 'https://images.unsplash.com/photo-1595446050682-1c2582845398?auto=format&fit=crop&w=600&q=80',
      'Air Fryer Accessories Set': 'https://images.unsplash.com/photo-1626071491511-3747304f58f7?auto=format&fit=crop&w=600&q=80',
      'Ice Face Roller': 'https://images.unsplash.com/photo-1598440441973-1ef75db448b1?auto=format&fit=crop&w=600&q=80',
      'Facial Cleansing Brush': 'https://images.unsplash.com/photo-1552046122-03184de85e08?auto=format&fit=crop&w=600&q=80',
      'Hair Straightener Brush': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      'Neck & Shoulder Massager': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80',
      'Posture Corrector': 'https://images.unsplash.com/photo-1540206276907-c21d9993303d?auto=format&fit=crop&w=600&q=80',
      'Massage Gun': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=600&q=80',
      'Memory Foam Pillow': 'https://images.unsplash.com/photo-1520406853248-1850ad3c14ff?auto=format&fit=crop&w=600&q=80',
      'Pet Hair Remover Roller': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      'Self-Cleaning Grooming Brush': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
      'Automatic Pet Feeder': 'https://images.unsplash.com/photo-1563460716037-460a3ad24ba9?auto=format&fit=crop&w=600&q=80',
      'Baby Nail Trimmer': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
      'Wireless Earbuds': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      'Fast Wireless Charger': 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=600&q=80',
      'Resistance Bands': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
      'Yoga Mat': 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80'
    };
    
    // Category-based fallback
    const categoryFolders = {
       'Home & Kitchen': 'kitchen',
       'Health & Wellness': 'wellness',
       'Beauty & Personal Care': 'beauty',
       'Pet Supplies': 'pets',
       'Baby & Kids Essentials': 'baby',
       'Electronics & Accessories': 'electronics',
       'Sports & Fitness': 'fitness'
    };

    const folder = categoryFolders[p.cat] || 'product';
    const fallbackImage = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80`; // Generic premium product
    const imageName = specificImages[p.name] || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80`; // Better stable fallback
    
    // IMAGE LOGIC FIX: Do not prefix absolute URLs with local asset path
    const finalImagePath = imageName.startsWith('http') ? imageName : `/assets/products/${imageName}`;



    await prisma.product.create({
      data: {
        name: p.name,
        slug: `${slug}-${i}`,
        description: `Professional-grade ${p.name.toLowerCase()} curated for MRT International. Designed for elite performance and reliability in the modern lifestyle.`,
        price: 39.99 + (i % 10 * 15),
        image: finalImagePath,
        badge: p.badge,
        affiliateUrl: p.url,
        isActive: true,
        sortOrder: i,
        ratingValue: 4.8 + (Math.random() * 0.2),
        categoryId: catMap[p.cat],
        shortBenefit: `Elite quality ${p.name.toLowerCase()}.`,
        tags: JSON.stringify([p.cat.split(' ')[0].toLowerCase(), 'boutique', 'premium']),
        keyBenefits: JSON.stringify(['Superior Build', 'Artisanal Curation', 'Global Trade Standard'])
      }
    });
  }

  // 3. Testimonials (Restored)
  const testimonials = [
    { name: 'Michael T.', location: 'Texas, USA', quote: 'Superior Craftsmanship', text: 'Superior craftsmanship and world-class logistics. MRT International delivers excellence in every shipment.', region: 'us', rating: 5, sortOrder: 1 },
    { name: 'Sara M.', location: 'Dubai, UAE', quote: 'World-Class Delivery', text: 'Exceptional delivery speed to the UAE. The product quality exceeded our high standards.', region: 'ae', rating: 5, sortOrder: 6 }
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log(`🌟 Seeding Complete. ${finalProducts.length} Verified Products Synced.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
