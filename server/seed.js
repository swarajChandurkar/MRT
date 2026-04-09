import prisma from './db.js';
import bcrypt from 'bcryptjs';

const REVIEWS_POOL = [
  { userName: 'Sarah M.', rating: 5, comment: 'Absolutely love this! Exceeded my expectations in every way. Highly recommend to anyone looking for quality.', isVerified: true },
  { userName: 'James T.', rating: 5, comment: 'Top-notch build quality. This is the real deal — worth every penny.', isVerified: true },
  { userName: 'Aisha K.', rating: 4, comment: 'Really impressed by the quality. Fast shipping too. A solid purchase.', isVerified: false },
  { userName: 'Michael R.', rating: 5, comment: 'Game changer! I use it every single day now. MRT International never disappoints.', isVerified: true },
  { userName: 'Priya S.', rating: 4, comment: 'Great product, sturdy and well-made. Does exactly what it promises.', isVerified: false },
  { userName: 'Carlos V.', rating: 5, comment: 'Premium quality, great design. This is my second order and I\'ll keep coming back.', isVerified: true },
  { userName: 'Emma L.', rating: 4, comment: 'Very happy with my purchase. Packaging was excellent and it arrived in perfect condition.', isVerified: false },
  { userName: 'David P.', rating: 5, comment: 'Incredible value for money. I compared this with similar products and this one wins hands down.', isVerified: true },
];

const IMAGE_MAP = {
  // Home & Kitchen
  'Vegetable Chopper': '/assets/products/vegetable-chopper.png',
  'Electric Spin Scrubber': '/assets/products/electric-spin-scrubber.png',
  'Vacuum Storage Bags': '/assets/products/vacuum-storage-bags.png',
  'Air Fryer Accessories Set': '/assets/products/air-fryer-accessories.png',
  'Oil Spray Bottle': '/assets/products/oil-spray-bottle.png',
  'Smart Plug': '/assets/products/smart-plug.png',
  'LED Motion Sensor Lights': '/assets/products/led-motion-lights.png',
  'Microfiber Cleaning Cloth Pack': '/assets/products/microfiber-cloth.png',
  'Digital Kitchen Scale': '/assets/products/kitchen-scale.png',
  'Under Sink Organizer': '/assets/products/under-sink-organizer.png',
  // Beauty & Personal Care
  'Ice Face Roller': '/assets/products/ice-face-roller.png',
  'Facial Cleansing Brush': '/assets/products/facial-cleansing-brush.png',
  'Hair Straightener Brush': '/assets/products/hair-straightener-brush.png',
  'LED Makeup Mirror': '/assets/products/led-makeup-mirror.png',
  'Heatless Hair Curlers': '/assets/products/heatless-hair-curlers.png',
  'Blackhead Remover Vacuum': '/assets/products/blackhead-remover.png',
  'Electric Toothbrush': '/assets/products/electric-toothbrush.png',
  'Electric Eyebrow Trimmer': '/assets/products/eyebrow-trimmer.png',
  'Makeup Brush Set': '/assets/products/makeup-brush-set.png',
  'Cosmetic Organizer': '/assets/products/cosmetic-organizer.png',
  // Health & Wellness
  'Neck & Shoulder Massager': '/assets/products/neck-shoulder-massager.png',
  'Posture Corrector': '/assets/products/posture-corrector.png',
  'Massage Gun': '/assets/products/massage-gun.png',
  'Memory Foam Pillow': '/assets/products/memory-foam-pillow.png',
  'Aromatherapy Diffuser': '/assets/products/aromatherapy-diffuser.png',
  'Foam Roller': '/assets/products/foam-roller.png',
  'Weighted Blanket': '/assets/products/weighted-blanket.png',
  'Eye Massager': '/assets/products/eye-massager.png',
  'White Noise Machine': '/assets/products/white-noise-machine.png',
  'Lumbar Support Cushion': '/assets/products/lumbar-support.png',
  // Pet Supplies
  'Pet Hair Remover Roller': '/assets/products/pet-hair-roller.png',
  'Self-Cleaning Grooming Brush': '/assets/products/grooming-brush.png',
  'Automatic Pet Feeder': '/assets/products/automatic-pet-feeder.png',
  'Pet Water Fountain': '/assets/products/pet-water-fountain.png',
  'Interactive Dog Toy': '/assets/products/dog-toy.png',
  'Cat Laser Toy': '/assets/products/cat-laser-toy.png',
  'Portable Pet Water Bottle': '/assets/products/pet-water-bottle.png',
  'Slow Feeder Bowl': '/assets/products/slow-feeder-bowl.png',
  'Pet Nail Clipper': '/assets/products/pet-nail-clipper.png',
  'Pet Bed': '/assets/products/pet-bed.png',
  // Baby & Kids
  'Baby Nail Trimmer': '/assets/products/baby-nail-trimmer.png',
  'Silicone Feeding Set': '/assets/products/silicone-feeding-set.png',
  'Baby Diaper Bag': '/assets/products/baby-diaper-bag.png',
  'Portable Changing Mat': '/assets/products/changing-mat.png',
  'Cabinet Safety Locks': '/assets/products/cabinet-safety-locks.png',
  'Baby Bottle Warmer': '/assets/products/bottle-warmer.png',
  'Baby Bath Support': '/assets/products/baby-bath-support.png',
  'Stroller Organizer': '/assets/products/stroller-organizer.png',
  'Baby Toy Set': '/assets/products/baby-toy-set.png',
  'Baby Grooming Kit': '/assets/products/baby-grooming-kit.png',
  // Electronics
  'Wireless Earbuds': '/assets/products/wireless-earbuds.png',
  'Fast Wireless Charger': '/assets/products/wireless-charger.png',
  'Power Bank': '/assets/products/power-bank.png',
  'Bluetooth Speaker': '/assets/products/bluetooth-speaker.png',
  'Smart LED Strip Lights': '/assets/products/led-strip-lights.png',
  'Car Phone Mount': '/assets/products/car-phone-mount.png',
  'Charging Hub': '/assets/products/charging-hub.png',
  'Mini Projector': '/assets/products/mini-projector.png',
  'Laptop Stand': '/assets/products/laptop-stand.png',
  'Phone Stand': '/assets/products/phone-stand.png',
  // Sports & Fitness
  'Resistance Bands': '/assets/products/resistance-bands.png',
  'Yoga Mat': '/assets/products/yoga-mat.png',
  'Adjustable Dumbbells': '/assets/products/adjustable-dumbbells.png',
  'Ab Roller': '/assets/products/ab-roller.png',
  'Jump Rope': '/assets/products/jump-rope.png',
  'Push-Up Board': '/assets/products/push-up-board.png',
  'Gym Gloves': '/assets/products/gym-gloves.png',
  'Water Bottle': '/assets/products/water-bottle.png',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

async function main() {
  console.log('🚀 MRT International — Pro Max Seed Starting...');

  // Clean in correct dependency order
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
    data: { email: adminEmail, passwordHash, name: 'MRT Admin', role: 'ADMIN' }
  });
  console.log(`👤 Admin user created: ${adminEmail}`);

  // 1. Categories
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

  // 2. Category Themes with full SEO metadata
  const themes = [
    { slug: 'home-kitchen', primary: '#914d00', secondary: '#f28c28', title: 'Home & Kitchen', subtitle: 'Culinary brilliance and lifestyle essentials', seoTitle: 'Top 10 Best Home & Kitchen (2026)', seoIntro: 'Curated selection of premium kitchenware and smart home essentials for the modern lifestyle.' },
    { slug: 'beauty-personal-care', primary: '#701b2f', secondary: '#ffb2bd', title: 'Beauty & Personal Care', subtitle: 'Pristine formulas for radiant maintenance', seoTitle: 'Top 10 Best Beauty & Personal Care (2026)', seoIntro: 'Discover professional-grade skincare and beauty tools for your daily ritual.' },
    { slug: 'health-wellness', primary: '#006a6a', secondary: '#00cfcf', title: 'Health & Wellness', subtitle: 'Advanced recovery and wellness curations', seoTitle: 'Top 10 Best Health & Wellness (2026)', seoIntro: 'Advanced recovery tools and wellness essentials trusted by professionals worldwide.' },
    { slug: 'pet-supplies', primary: '#3a6a00', secondary: '#8ce33a', title: 'Pet Supplies', subtitle: 'Sophisticated gear for beloved companions', seoTitle: 'Top 10 Best Pet Supplies (2026)', seoIntro: 'Precision grooming gear and smart accessories for your beloved companions.' },
    { slug: 'baby-kids-essentials', primary: '#004a77', secondary: '#7fbaff', title: 'Baby & Kids Essentials', subtitle: 'Nordic design for modern parents', seoTitle: 'Top 10 Best Baby & Kids Essentials (2026)', seoIntro: 'Ergonomic and safety-first designs for modern parents who demand quality.' },
    { slug: 'electronics-accessories', primary: '#1f1b17', secondary: '#bf8f00', title: 'Electronics & Accessories', subtitle: 'Performance-driven digital gear', seoTitle: 'Top 10 Best Electronics & Accessories (2026)', seoIntro: 'High-performance digital accessories and charging solutions for the modern professional.' },
    { slug: 'sports-fitness', primary: '#006e2a', secondary: '#55f985', title: 'Sports & Fitness', subtitle: 'Minimalist gear for elite training', seoTitle: 'Top 10 Best Sports & Fitness Gear (2026)', seoIntro: 'Minimalist training equipment and heavy-duty support gear for peak performance.' },
  ];

  for (const theme of themes) {
    const { slug, ...themeData } = theme;
    await prisma.categoryTheme.create({ data: { ...themeData, categoryId: catMap[slug] } });
  }

  // 3. Products catalog
  const finalProducts = [
    // HOME & KITCHEN
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Vegetable Chopper', url: 'https://amzn.to/4mgjKOK', desc: 'Precision one-press chopper for uniform cuts in seconds.', benefits: ['7 Pro Blades', 'BPA-Free', 'Dishwasher Safe'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Electric Spin Scrubber', url: 'https://amzn.to/4vayOS5', desc: 'Effortless deep cleaning of any surface with high-torque rotation.', benefits: ['360° Scrubbing', 'Waterproof', '90m Battery'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Vacuum Storage Bags', url: 'https://amzn.to/3NQUaDg', desc: 'Maximize your space by compressing laundry and clothing.', benefits: ['80% More Space', 'Airtight Seal', 'Reusable'] },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Oil Spray Bottle', url: 'https://amzn.to/3OmAkQo', desc: 'Uniform fine mist for healthier cooking and air frying.', benefits: ['Even Mist', 'Aerosol Free', 'Leak Proof'] },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Smart Plug', url: 'https://amzn.to/3PU7kzZ', desc: 'Voice-controlled power management for your modern home.', benefits: ['Alexa/Google Ready', 'Energy Tracking', 'No Hub Req'] },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'LED Motion Sensor Lights', url: 'https://amzn.to/3NQUTEu', desc: 'Automatic illumination for closets, stairs, and dark corners.', benefits: ['Instant On', 'Magnetic Mount', 'USB Charge'] },
    { cat: 'Home & Kitchen', badge: 'Trending Now', name: 'Microfiber Cleaning Cloth Pack', url: 'https://amzn.to/3PSpaDq', desc: 'Scratch-free, lint-free cleaning for high-end surfaces.', benefits: ['Ultra Absorbent', 'Reusable 100x', 'Multi-Surface'] },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Digital Kitchen Scale', url: 'https://amzn.to/3PSpaDq', desc: 'Sleek precision scale for perfect portions and baking.', benefits: ['0.1g Accuracy', 'Tare Function', 'Ultra Slim'] },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Under Sink Organizer', url: 'https://amzn.to/3NQUTEu', desc: 'Tiered storage to maximize vertical space under your sink.', benefits: ['Adjustable Height', 'Rust-Proof', 'Easy Install'] },

    // BEAUTY & PERSONAL CARE
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Ice Face Roller', url: 'https://amzn.to/4sj2ytg', desc: 'Revitalize skin, reduce puffiness, and tighten pores instantly.', benefits: ['Morning Refresh', 'Skin Tightening', 'Soothing'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Facial Cleansing Brush', url: 'https://amzn.to/4dwEOOH', desc: 'Sonic vibration for a deeper, more professional facial cleanse.', benefits: ['Sonic Tech', 'Waterproof', 'Replaceable Heads'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Hair Straightener Brush', url: 'https://amzn.to/48jgyvP', desc: 'Salon-straight hair in minutes with anti-scald technology.', benefits: ['Quick Heat', 'Ionic Care', 'Anti-Scald'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'LED Makeup Mirror', url: 'https://amzn.to/4vfzipZ', desc: 'Professional studio lighting for flawless makeup application.', benefits: ['Natural LED', '3 Modes', '10x Zoom'] },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Heatless Hair Curlers', url: 'https://amzn.to/4migCSr', desc: 'Perfect overnight curls without any heat damage.', benefits: ['Zero Heat', 'Soft Satin', 'Set & Sleep'] },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Blackhead Remover Vacuum', url: 'https://amzn.to/3OmAkQo', desc: 'Safe exfoliation and pore cleaning with adjustable suction.', benefits: ['Deep Cleanse', '5 Suction Levels', 'LED Display'] },
    { cat: 'Beauty & Personal Care', badge: 'Trending Now', name: 'Electric Toothbrush', url: 'https://amzn.to/3PSpaDq', desc: 'Superior plaque removal with intelligent vibration cycles.', benefits: ['Whiter Teeth', 'Pressure Sensor', 'Long Life'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Electric Eyebrow Trimmer', url: 'https://amzn.to/4seAiYR', desc: 'Pain-free precision grooming for brows and facial hair.', benefits: ['Micro-Blade', 'Gentle Skin', 'Built-in Light'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Makeup Brush Set', url: 'https://amzn.to/4sW28dh', desc: 'Elite vegan brushes for professional-level blending.', benefits: ['16 Full Brushes', 'Vegan Fibers', 'Luxury Feel'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Cosmetic Organizer', url: 'https://amzn.to/4tytGFH', desc: 'Crystal clear 360° rotating display for your beauty essentials.', benefits: ['360° View', 'Space Saving', 'Acrylic Build'] },

    // HEALTH & WELLNESS
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Neck & Shoulder Massager', url: 'https://amzn.to/4bUeFbj', desc: 'Deep-tissue kneading to melt away stress and muscle tension.', benefits: ['Heat Therapy', 'Shiatsu Nodes', 'Portable'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Posture Corrector', url: 'https://amzn.to/4mfhIhB', desc: 'Invisible alignment support for a healthier spine.', benefits: ['Breathable', 'Self-Closing', 'Comfort Fit'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Massage Gun', url: 'https://amzn.to/41iIMTD', desc: 'Professional percussion therapy for rapid muscle recovery.', benefits: ['3200 RPM', 'Quiet Brushless', '6 Pro Heads'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Memory Foam Pillow', url: 'https://amzn.to/4sP2liu', desc: 'Contoured neck support for the deepest possible sleep.', benefits: ['Cervical Arc', 'Cooling Gel', 'Zero Pressure'] },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Aromatherapy Diffuser', url: 'https://amzn.to/47JWi6m', desc: 'Purify your air and mood with ultra-quiet ultrasonic mist.', benefits: ['7 Color LEDs', 'Waterless Off', 'Large Tank'] },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Foam Roller', url: 'https://amzn.to/3OmAkQo', desc: 'Professional-grade recovery for tight muscles and fascia.', benefits: ['High Density', 'Muscle Flush', 'Spine Safe'] },
    { cat: 'Health & Wellness', badge: 'Trending Now', name: 'Weighted Blanket', url: 'https://amzn.to/3PSpaDq', desc: 'Deep pressure therapy for reduced anxiety and better rest.', benefits: ['15lbs Glass Beads', 'Cotton Shell', 'Calming'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Eye Massager', url: 'https://amzn.to/4sjeTgW', desc: 'Rechargeable heat and air pressure for tired office eyes.', benefits: ['Heat Compress', 'Bluetooth', 'Foldable'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'White Noise Machine', url: 'https://amzn.to/3PWkxbo', desc: 'Create a sanctuary of focus and sleep in any environment.', benefits: ['20 Sounds', 'Timer Set', 'Night Light'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Lumbar Support Cushion', url: 'https://amzn.to/4vdRQXB', desc: 'Full-day back support for office chairs and car seats.', benefits: ['Memory Foam', 'Strap System', 'Mesh Cover'] },

    // PET SUPPLIES
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Pet Hair Remover Roller', url: 'https://amzn.to/4sCm3NL', desc: 'The absolute fastest way to remove fur from furniture.', benefits: ['Eco-Friendly', 'No Refills', 'Self-Clean'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Self-Cleaning Grooming Brush', url: 'https://amzn.to/4mfdKWt', desc: 'Gentle deshedding with a one-click hair release button.', benefits: ['Deep Undercoat', 'One Click Clear', 'Soft Tips'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Automatic Pet Feeder', url: 'https://amzn.to/41iJvEl', desc: 'Schedule perfect portions for your pet from your phone.', benefits: ['Timed Meals', 'Voice Record', 'Clog-Free'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Pet Water Fountain', url: 'https://amzn.to/3PSASxU', desc: 'Filtered, flowing water that encourages hydration.', benefits: ['Filtration Sys', 'Silent Pump', 'Stainless Top'] },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Interactive Dog Toy', url: 'https://amzn.to/4mfmbAR', desc: 'Keep your dog mentally sharp with a puzzle hide-and-seek.', benefits: ['Mental Stimulation', 'Squeak Points', 'Durable'] },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Cat Laser Toy', url: 'https://amzn.to/3OmAkQo', desc: 'Automatic rotating laser patterns for endless cat exercise.', benefits: ['Auto Timer', 'Adjust Speed', 'Safe Laser'] },
    { cat: 'Pet Supplies', badge: 'Trending Now', name: 'Portable Pet Water Bottle', url: 'https://amzn.to/3PSpaDq', desc: 'Leak-proof hydration for long walks and travel.', benefits: ['One Button Fill', 'BPA Free', 'Food Grade'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Slow Feeder Bowl', url: 'https://amzn.to/4mbNWue', desc: 'Prevents choking and bloating by slowing down fast eaters.', benefits: ['Anti-Gulping', 'Eco-Silicon', 'Anti-Slip'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Nail Clipper', url: 'https://amzn.to/4sRqXHj', desc: 'Professional salon-style trimming at home.', benefits: ['Safety Stop', 'Sharp Steel', 'Comfort Grip'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Bed', url: 'https://amzn.to/4soPJh3', desc: 'Plush orthopedic donut bed for deep anti-anxiety rest.', benefits: ['Joint Support', 'Machine Washable', 'Luxury Soft'] },

    // BABY & KIDS ESSENTIALS
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Baby Nail Trimmer', url: 'https://amzn.to/4sgYlpK', desc: 'Electric whisper-quiet trimmer for safe, tear-free nail care.', benefits: ['LED Light', 'Variable Speeds', 'Safe Guard'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Silicone Feeding Set', url: 'https://amzn.to/48z3NNN', desc: 'Strong suction base and soft silicone for easy self-feeding.', benefits: ['BPA Free', 'Microwave Safe', 'Suction Base'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Baby Diaper Bag', url: 'https://amzn.to/3OkGAIp', desc: 'High-capacity backpack with insulated bottle pockets.', benefits: ['Multifunctional', 'Waterproof', 'Utility Hooks'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Portable Changing Mat', url: 'https://amzn.to/4c8AHWJ', desc: 'Compact on-the-go diaper changes with extra padding.', benefits: ['Waterproof', 'Folds to Clutch', 'Extra Pockets'] },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Cabinet Safety Locks', url: 'https://amzn.to/4t1fyF2', desc: 'Invisible childproofing with magnetic locking technology.', benefits: ['No Drill', 'Invisible', 'Powerful Magnetic'] },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Baby Bottle Warmer', url: 'https://amzn.to/4sP3vdQ', desc: 'Fast, precise warming that preserves milk nutrients.', benefits: ['Quick Warm', 'Night Light', 'Universal Fit'] },
    { cat: 'Baby & Kids Essentials', badge: 'Trending Now', name: 'Baby Bath Support', url: 'https://amzn.to/3OmAkQo', desc: 'Ergonomic mesh support for safe, comfortable bath time.', benefits: ['Quick Dry', 'Soft Sensation', 'No-Slip'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Stroller Organizer', url: 'https://amzn.to/4cbFKFG', desc: 'Universal fit bag to keep all your essentials within reach.', benefits: ['Extra Large', 'Insulated Cup', 'Universal Strap'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Toy Set', url: 'https://amzn.to/3PTsPkm', desc: 'Sensory and motor skill development through play.', benefits: ['Non-Toxic', 'Textured Surface', 'Educational'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Grooming Kit', url: 'https://amzn.to/4cbFKFG', desc: 'Essential 18-piece kit for health and hygiene.', benefits: ['Comprehensive', 'Travel Case', 'Precision Tools'] },

    // ELECTRONICS & ACCESSORIES
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Wireless Earbuds', url: 'https://amzn.to/4ccwbqa', desc: 'Premium noise-canceling sound for work and play.', benefits: ['Active Noise', '40h Battery', 'Deep Bass'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Fast Wireless Charger', url: 'https://amzn.to/4dQO28H', desc: 'Efficient 15W Qi-certified charging for all smartphones.', benefits: ['15W Output', 'Universal Qi', 'LED Status'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Power Bank', url: 'https://amzn.to/4tCD5w5', desc: 'Massive capacity to keep your devices charged for days.', benefits: ['20Ah Capacity', 'PD Fast Charging', 'Dual Port'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Bluetooth Speaker', url: 'https://amzn.to/4mbyWMO', desc: 'Waterproof portable sound with powerful volume.', benefits: ['IPX7 Rating', '360° Sound', '24h Runtime'] },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Smart LED Strip Lights', url: 'https://amzn.to/41hOMvW', desc: 'Immersive ambiance controlled via app and voice.', benefits: ['Music Sync', '16M Colors', 'Alexa Ready'] },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Car Phone Mount', url: 'https://amzn.to/3OmAkQo', desc: 'Rock-solid hold for safe navigation on any road.', benefits: ['One-Hand Use', 'Strong Suction', '360 Rotate'] },
    { cat: 'Electronics & Accessories', badge: 'Trending Now', name: 'Charging Hub', url: 'https://amzn.to/3PSpaDq', desc: 'One central hub to charge all your digital ecosystem.', benefits: ['High Wattage', 'Individual Switch', 'Surge Protect'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Mini Projector', url: 'https://amzn.to/4sgFueI', desc: 'Full HD cinema experience from a palm-sized device.', benefits: ['1080p Support', 'Wireless Screen', 'Built-in Audio'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Laptop Stand', url: 'https://amzn.to/41PFXcP', desc: 'Foldable aluminum stand for ergonomic comfort.', benefits: ['Ventilated', '7 Heights', 'Ultra Portable'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Phone Stand', url: 'https://amzn.to/41PFXcP', desc: 'Sturdy, adjustable stand for effortless hands-free viewing.', benefits: ['Dual Pivot', 'Non-Slip', 'Solid Metal'] },

    // SPORTS & FITNESS
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Resistance Bands', url: 'https://amzn.to/4csnjxL', desc: 'Full-body workout kit for strength and mobility.', benefits: ['5 Levels', 'Unbreakable', 'Portable Gym'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Massage Gun', url: 'https://amzn.to/41iIMTD', desc: 'Intense percussion therapy for elite recovery.', benefits: ['Deep Tissue', 'Brushless Motor', '6 Heads'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Yoga Mat', url: 'https://amzn.to/47KcdSc', desc: 'Eco-friendly TPE mat with perfect grip and cushion.', benefits: ['6mm Thick', 'Non-Slip', 'Alignment Marks'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Adjustable Dumbbells', url: 'https://amzn.to/4vggOWa', desc: 'Replace a whole rack with a single pair of dumbbells.', benefits: ['5 to 50 lbs', 'Dial Weight', 'Cast Iron'] },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Ab Roller', url: 'https://amzn.to/3OpiNHd', desc: 'Core-shredding wheel with specialized stability grip.', benefits: ['Extra Wide', 'Steel Core', 'Knee Pad'] },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Jump Rope', url: 'https://amzn.to/4bUqYV0', desc: 'Professional speed rope for high-intensity cardio.', benefits: ['Adjustable', 'Steel Bearing', 'Anti-Tangle'] },
    { cat: 'Sports & Fitness', badge: 'Trending Now', name: 'Foam Roller', url: 'https://amzn.to/3OmAkQo', desc: 'High-density trigger point therapy for muscle flush.', benefits: ['Grid Pattern', 'Waterproof', 'Heavy Duty'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Push-Up Board', url: 'https://amzn.to/4trnFKQ', desc: 'Targeted muscle development with color-coded grips.', benefits: ['12 Multi-Pos', 'Foldable', 'Anti-Slip'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Gym Gloves', url: 'https://amzn.to/4cbGYAM', desc: 'Protect your hands and boost your grip during heavy lifts.', benefits: ['Wrist Support', 'Breathable', 'Micro-Padding'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Water Bottle', url: 'https://amzn.to/41MUm9M', desc: 'Insulated gallon-style bottle to keep you hydrated.', benefits: ['Motivational Marks', 'Leak Proof', 'BPA Free'] },
  ];

  const createdProducts = [];
  for (let i = 0; i < finalProducts.length; i++) {
    const p = finalProducts[i];
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = IMAGE_MAP[p.name] || FALLBACK_IMAGE;

    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: `${slug}-${i}`,
        description: p.desc,
        price: parseFloat((29.99 + (i % 12) * 10).toFixed(2)),
        image,
        badge: p.badge,
        affiliateUrl: p.url,
        isActive: true,
        sortOrder: i,
        ratingValue: parseFloat((4.6 + Math.random() * 0.4).toFixed(1)),
        categoryId: catMap[p.cat],
        shortBenefit: p.desc.split('.')[0] + '.',
        tags: JSON.stringify([p.cat.split(' ')[0].toLowerCase(), 'premium', 'curated']),
        keyBenefits: JSON.stringify(p.benefits),
      }
    });
    createdProducts.push(created);
  }
  console.log(`📦 ${createdProducts.length} products created`);

  // 4. Seed 2 Reviews per product
  let reviewCount = 0;
  for (let i = 0; i < createdProducts.length; i++) {
    const product = createdProducts[i];
    const r1 = REVIEWS_POOL[i % REVIEWS_POOL.length];
    const r2 = REVIEWS_POOL[(i + 3) % REVIEWS_POOL.length];

    await prisma.review.createMany({
      data: [
        { productId: product.id, userName: r1.userName, rating: r1.rating, comment: r1.comment, isVerified: r1.isVerified },
        { productId: product.id, userName: r2.userName, rating: r2.rating, comment: r2.comment, isVerified: r2.isVerified },
      ]
    });
    reviewCount += 2;
  }
  console.log(`⭐ ${reviewCount} reviews seeded`);

  // 5. Global Homepage Testimonials
  const testimonials = [
    { name: 'Michael T.', location: 'Texas, USA', quote: 'Superior Craftsmanship', text: 'Superior craftsmanship and world-class logistics. MRT International delivers excellence in every shipment.', region: 'us', rating: 5, sortOrder: 1 },
    { name: 'Sara M.', location: 'Dubai, UAE', quote: 'World-Class Delivery', text: 'Exceptional delivery speed to the UAE. The product quality exceeded our high standards.', region: 'ae', rating: 5, sortOrder: 2 },
    { name: 'Carlos R.', location: 'Miami, USA', quote: 'Reliable & Premium', text: 'I have sourced products from many platforms. MRT International stands out for its curation quality.', region: 'us', rating: 5, sortOrder: 3 },
    { name: 'Fatima A.', location: 'Abu Dhabi, UAE', quote: 'An Elite Experience', text: 'From discovery to delivery — the entire MRT experience feels premium and thoughtfully designed.', region: 'ae', rating: 5, sortOrder: 4 },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`💬 ${testimonials.length} testimonials created`);
  console.log(`✅ Pro Max Seed Complete. ${createdProducts.length} Products + ${reviewCount} Reviews + ${testimonials.length} Testimonials.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
