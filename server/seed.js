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
    { slug: 'home-kitchen', primary: '#914d00', secondary: '#f28c28', title: 'Modern Kitchen', subtitle: 'Culinary brilliance and lifestyle essentials', seoTitle: 'Best Home & Kitchen Essentials 2026', seoIntro: 'Curated selection of premium kitchenware and smart home essentials for the modern lifestyle.' },
    { slug: 'health-wellness', primary: '#006a6a', secondary: '#00cfcf', title: 'Personal Vitality', subtitle: 'Advanced recovery and wellness curations', seoTitle: 'Top Health & Wellness Products 2026', seoIntro: 'Advanced recovery tools and wellness essentials trusted by professionals worldwide.' },
    { slug: 'beauty-personal-care', primary: '#701b2f', secondary: '#ffb2bd', title: 'Artisanal Beauty', subtitle: 'Pristine formulas for radiant maintenance', seoTitle: 'Premium Beauty & Personal Care 2026', seoIntro: 'Discover professional-grade skincare and beauty tools for your daily ritual.' },
    { slug: 'pet-supplies', primary: '#3a6a00', secondary: '#8ce33a', title: 'Pet Curations', subtitle: 'Sophisticated gear for beloved companions', seoTitle: 'Best Pet Supplies & Accessories 2026', seoIntro: 'Precision grooming gear and smart accessories for your beloved companions.' },
    { slug: 'baby-kids-essentials', primary: '#004a77', secondary: '#7fbaff', title: 'Baby Essentials', subtitle: 'Nordic design for modern parents', seoTitle: 'Safe & Trusted Baby Essentials 2026', seoIntro: 'Ergonomic and safety-first designs for modern parents who demand quality.' },
    { slug: 'electronics-accessories', primary: '#1f1b17', secondary: '#bf8f00', title: 'Tech Companions', subtitle: 'Performance-driven digital gear', seoTitle: 'Elite Tech Accessories 2026', seoIntro: 'High-performance digital accessories and charging solutions for the modern professional.' },
    { slug: 'sports-fitness', primary: '#006e2a', secondary: '#55f985', title: 'Peak Performance', subtitle: 'Minimalist gear for elite training', seoTitle: 'Professional Sports & Fitness Gear 2026', seoIntro: 'Minimalist training equipment and heavy-duty support gear for peak performance.' },
  ];

  for (const theme of themes) {
    const { slug, ...themeData } = theme;
    await prisma.categoryTheme.create({ data: { ...themeData, categoryId: catMap[slug] } });
  }

  // 3. Products catalog
  const finalProducts = [
    // HOME & KITCHEN
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Vegetable Chopper', url: 'https://amzn.to/4mgjKOK', desc: 'One-press vegetable chopper with interchangeable blades for perfectly uniform cuts every time.', benefits: ['7 Interchangeable Blades', 'BPA-Free Container', 'Dishwasher Safe'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Electric Spin Scrubber', url: 'https://amzn.to/4vayOS5', desc: 'Rechargeable electric scrubber with rotating head for effortless deep cleaning of any surface.', benefits: ['360° Spinning Head', 'Waterproof Design', '90-Minute Runtime'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Vacuum Storage Bags', url: 'https://amzn.to/3NQUaDg', desc: 'Premium vacuum-seal bags that compress clothing and bedding to save up to 80% of storage space.', benefits: ['80% Space Saving', 'Airtight Seal', 'Travel Friendly'] },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Air Fryer Accessories Set', url: 'https://amzn.to/47J01RH', desc: 'Universal air fryer accessory kit with silicone pads, baking pan, and multi-purpose grill rack.', benefits: ['Universal Fit', 'Food-Grade Silicone', 'Full Kit Included'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Oil Spray Bottle', url: 'https://amzn.to/3OmAkQo', desc: 'Fine-mist oil sprayer designed for air fryers, pans, and salads to minimize oil usage.', benefits: ['Fine Even Mist', 'No Aerosol Chemicals', 'Leak-Proof Cap'] },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Smart Plug', url: 'https://amzn.to/3PU7kzZ', desc: 'Wi-Fi enabled smart plug with voice control, timer scheduling, and real-time energy monitoring.', benefits: ['Voice Control Ready', 'Energy Monitoring', 'Timer Scheduling'] },
    { cat: 'Home & Kitchen', badge: "Editor's Choice", name: 'Digital Kitchen Scale', url: 'https://amzn.to/3PSpaDq', desc: 'Precision digital scale with 0.1g accuracy, ideal for baking, cooking, and portion control.', benefits: ['0.1g Precision', 'Tare Function', 'Compact & Slim'] },
    { cat: 'Home & Kitchen', badge: 'Top Pick', name: 'Under Sink Organizer', url: 'https://amzn.to/3NQUTEu', desc: 'Adjustable two-tier under-sink organizer rack for maximum storage efficiency under kitchen sinks.', benefits: ['Adjustable Shelves', 'Rust-Resistant', 'Easy Assembly'] },

    // BEAUTY & PERSONAL CARE
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Ice Face Roller', url: 'https://amzn.to/4sj2ytg', desc: 'Stainless steel ice face roller that reduces puffiness, closes pores, and boosts circulation.', benefits: ['Reduces Puffiness', 'Tightens Pores', 'Improves Circulation'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Facial Cleansing Brush', url: 'https://amzn.to/4dwEOOH', desc: 'Sonic facial cleansing brush with 3 speed settings for a professional-grade deep cleanse at home.', benefits: ['Sonic Vibration', '3 Speed Modes', 'Waterproof Head'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Hair Straightener Brush', url: 'https://amzn.to/48jgyvP', desc: 'Ceramic-coated straightener brush that styles and straightens hair simultaneously in one pass.', benefits: ['Ceramic Coating', 'Anti-Scald Tips', '30s Heat-Up'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'LED Makeup Mirror', url: 'https://amzn.to/4vfzipZ', desc: '10x magnifying makeup mirror with flicker-free LED lighting, 3 light modes, and USB charging.', benefits: ['10x Magnification', '3 Light Modes', 'USB Rechargeable'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Heatless Hair Curlers', url: 'https://amzn.to/4migCSr', desc: 'No-heat hair curlers that create beautiful curls overnight without damaging your hair.', benefits: ['Zero Heat Damage', 'Overnight Results', 'All Hair Types'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Electric Eyebrow Trimmer', url: 'https://amzn.to/4seAiYR', desc: 'Precision micro-trimmer for eyebrows and facial hair with built-in LED light and safety guard.', benefits: ['Precision Blade', 'Built-in LED', 'Safety Guard'] },
    { cat: 'Beauty & Personal Care', badge: 'Top Pick', name: 'Makeup Brush Set', url: 'https://amzn.to/4sW28dh', desc: 'Professional 16-piece vegan makeup brush set with synthetic bristles and bamboo handles.', benefits: ['16-Piece Full Set', 'Vegan Bristles', 'Bamboo Handles'] },
    { cat: 'Beauty & Personal Care', badge: "Editor's Choice", name: 'Cosmetic Organizer', url: 'https://amzn.to/4tytGFH', desc: 'Clear acrylic cosmetic organizer with rotating base for a 360° view of all your beauty products.', benefits: ['360° Rotation', 'Crystal Clear Acrylic', 'Modular Design'] },

    // HEALTH & WELLNESS
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Neck & Shoulder Massager', url: 'https://amzn.to/4bUeFbj', desc: 'Deep-tissue kneading neck massager with heat therapy and adjustable intensity for full relief.', benefits: ['Deep Kneading Nodes', 'Heat Therapy', '3 Intensity Levels'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Posture Corrector', url: 'https://amzn.to/4mfhIhB', desc: 'Ergonomic posture corrector that trains your spine into perfect alignment, reducing back pain.', benefits: ['Spinal Alignment', 'Breathable Material', 'Adjustable Straps'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Massage Gun', url: 'https://amzn.to/41iIMTD', desc: 'Professional-grade percussion massage gun with 6 attachments and whisper-quiet motor technology.', benefits: ['6 Attachments', 'Whisper-Quiet Motor', '3200 RPM'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Memory Foam Pillow', url: 'https://amzn.to/4sP2liu', desc: 'Orthopedic memory foam pillow with ergonomic cervical support for a deep, restorative sleep.', benefits: ['Cervical Support', 'CertiPUR-US Foam', 'Cooling Cover'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Aromatherapy Diffuser', url: 'https://amzn.to/47JWi6m', desc: 'Ultrasonic aromatherapy diffuser with 7 ambient colors, whisper-quiet operation, and 8h runtime.', benefits: ['7 LED Colors', 'Whisper Quiet', '8-Hour Runtime'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'Eye Massager', url: 'https://amzn.to/4sjeTgW', desc: 'Heated smart eye massager alleviating strain, fatigue, and dark circles with Bluetooth music.', benefits: ['Heat Compression', 'Bluetooth Music', 'Foldable Design'] },
    { cat: 'Health & Wellness', badge: "Editor's Choice", name: 'White Noise Machine', url: 'https://amzn.to/3PWkxbo', desc: 'Compact white noise machine with 20 soothing sounds to improve sleep quality and focus.', benefits: ['20 Sound Modes', 'Auto-Off Timer', 'Night Light Option'] },
    { cat: 'Health & Wellness', badge: 'Top Pick', name: 'Lumbar Support Cushion', url: 'https://amzn.to/4vdRQXB', desc: 'Ergonomic memory foam lumbar support cushion for office chairs, car seats, and wheelchairs.', benefits: ['Memory Foam Core', 'Dual Strap System', 'Machine Washable'] },

    // PET SUPPLIES
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Pet Hair Remover Roller', url: 'https://amzn.to/4sCm3NL', desc: 'Self-cleaning pet hair roller that removes stubborn fur from furniture and clothing in seconds.', benefits: ['Self-Cleaning Base', 'No Adhesives Needed', 'Works on All Fabrics'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Self-Cleaning Grooming Brush', url: 'https://amzn.to/4mfdKWt', desc: 'One-click retractable pet brush that makes grooming effortless and cleanup instant.', benefits: ['One-Click Retract', 'Ergonomic Handle', 'All Coat Types'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Automatic Pet Feeder', url: 'https://amzn.to/41iJvEl', desc: 'Smart Wi-Fi automatic pet feeder with programmable meal scheduling and portion control.', benefits: ['Wi-Fi + App Control', 'Programmable Schedule', 'Portion Control'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Water Fountain', url: 'https://amzn.to/3PSASxU', desc: 'Ultra-quiet 2.4L stainless steel pet water fountain with triple filtration to keep water fresh.', benefits: ['Triple Filtration', 'Ultra-Quiet Pump', '2.4L Capacity'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Interactive Dog Toy', url: 'https://amzn.to/4mfmbAR', desc: 'IQ-stimulating interactive puzzle dog toy that challenges and rewards pets for hours.', benefits: ['Mental Stimulation', 'Multiple Difficulty Levels', 'Food-Safe Materials'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Slow Feeder Bowl', url: 'https://amzn.to/4mbNWue', desc: 'Maze-design slow feeder bowl that extends meal time, improves digestion, and reduces bloating.', benefits: ['Extends Meal Time', 'Reduces Bloating', 'Non-Slip Base'] },
    { cat: 'Pet Supplies', badge: "Editor's Choice", name: 'Pet Nail Clipper', url: 'https://amzn.to/4sRqXHj', desc: 'Professional stainless steel pet nail clipper with a safety guard and built-in nail file.', benefits: ['Safety Guard', 'Built-in Nail File', 'Stainless Steel Blades'] },
    { cat: 'Pet Supplies', badge: 'Top Pick', name: 'Pet Bed', url: 'https://amzn.to/4soPJh3', desc: 'Calming donut pet bed in ultra-soft plush material providing orthopedic joint support.', benefits: ['Orthopedic Support', 'Machine Washable', 'Anti-Anxiety Design'] },

    // BABY & KIDS
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Baby Nail Trimmer', url: 'https://amzn.to/4sgYlpK', desc: 'Electric baby nail trimmer with soft filing pads and LED light for safe, tearless nail care.', benefits: ['LED Safety Light', 'Ultra-Soft Filing', 'No-Scratch Guarantee'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Silicone Feeding Set', url: 'https://amzn.to/48z3NNN', desc: 'Complete silicone baby feeding set with suction base bowl, spoon, and fork designed for self-feeding.', benefits: ['Suction Base Bowl', 'Self-Feeding Design', 'BPA & BPS Free'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Baby Diaper Bag', url: 'https://amzn.to/3OkGAIp', desc: 'Large-capacity diaper bag backpack with insulated pockets and stroller straps for hands-free use.', benefits: ['Large Capacity', 'Insulated Bottle Pockets', 'Stroller Compatible'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Portable Changing Mat', url: 'https://amzn.to/4c8AHWJ', desc: 'Waterproof portable changing mat with side pads that folds to a compact clutch for on-the-go care.', benefits: ['Waterproof Surface', 'Compact Fold', 'Side Safety Pads'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Cabinet Safety Locks', url: 'https://amzn.to/4t1fyF2', desc: 'Magnetic child safety cabinet locks — invisible, tool-free installation with a secure magnetic key.', benefits: ['No Drilling Required', 'Invisible on Cabinets', 'Magnetic Key System'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Bottle Warmer', url: 'https://amzn.to/4sP3vdQ', desc: 'Fast, precise bottle warmer that heats milk evenly in minutes without hot spots — safe for every feed.', benefits: ['Even Heating', 'Auto-Shutoff', 'Fits All Bottle Sizes'] },
    { cat: 'Baby & Kids Essentials', badge: "Editor's Choice", name: 'Baby Grooming Kit', url: 'https://amzn.to/4cbFKFG', desc: 'Complete 18-piece baby health and grooming kit in a travel case with nasal aspirator, thermometer, and more.', benefits: ['18-Piece Kit', 'Travel Case Included', 'Pediatrician Recommended'] },
    { cat: 'Baby & Kids Essentials', badge: 'Top Pick', name: 'Baby Toy Set', url: 'https://amzn.to/3PTsPkm', desc: 'Montessori-inspired sensory baby toy set to boost cognitive development and fine motor skills.', benefits: ['Montessori-Inspired', 'Sensory Development', 'BPA-Free Materials'] },

    // ELECTRONICS
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Wireless Earbuds', url: 'https://amzn.to/4ccwbqa', desc: 'True wireless earbuds with active noise cancellation, 40-hour battery life, and premium sound.', benefits: ['Active Noise Cancellation', '40-Hour Total Battery', 'IPX5 Waterproof'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Fast Wireless Charger', url: 'https://amzn.to/4dQO28H', desc: '15W Qi-certified fast wireless charger compatible with all Qi devices and with LED indicator.', benefits: ['15W Max Output', 'Qi Certified', 'Universal Compatibility'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Power Bank', url: 'https://amzn.to/4tCD5w5', desc: '20,000mAh slim power bank with 65W USB-C PD fast charging for laptops, tablets, and phones.', benefits: ['20,000mAh Capacity', '65W Fast Charging', 'Laptop Compatible'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Bluetooth Speaker', url: 'https://amzn.to/4mbyWMO', desc: '360° portable Bluetooth speaker with 24h playtime, waterproof body, and rich bass output.', benefits: ['360° Sound Field', '24-Hour Playtime', 'IPX7 Waterproof'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Smart LED Strip Lights', url: 'https://amzn.to/41hOMvW', desc: 'App-controlled 16 million color LED strip lights with music sync mode and voice assistant support.', benefits: ['16 Million Colors', 'Music Sync Mode', 'Voice Control Ready'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Mini Projector', url: 'https://amzn.to/4sgFueI', desc: '1080p mini projector with built-in speaker, Wi-Fi, and 150-inch projection for home cinema.', benefits: ['1080p Native', '150" Max Screen', 'Built-in Wi-Fi'] },
    { cat: 'Electronics & Accessories', badge: "Editor's Choice", name: 'Laptop Stand', url: 'https://amzn.to/41PFXcP', desc: 'Adjustable aluminum laptop stand with 7 height settings for ergonomic eye-level positioning.', benefits: ['7 Height Settings', 'Portable & Foldable', 'Universal Fit'] },
    { cat: 'Electronics & Accessories', badge: 'Top Pick', name: 'Charging Hub', url: 'https://amzn.to/4mkil9Y', desc: '6-in-1 USB charging hub with individual power switches and surge protection for your entire setup.', benefits: ['6-Port Hub', 'Individual Switches', 'Surge Protection'] },

    // SPORTS & FITNESS
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Resistance Bands', url: 'https://amzn.to/4csnjxL', desc: 'Set of 5 premium resistance bands in varying tensions for full-body strength and mobility training.', benefits: ['5-Resistance Set', 'Anti-Snap Material', 'Carry Bag Included'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Yoga Mat', url: 'https://amzn.to/47KcdSc', desc: 'Non-slip 6mm TPE yoga mat with natural materials, carrying strap, and alignment markings.', benefits: ['6mm Thick', 'Non-Slip Surface', 'Eco-Friendly TPE'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Adjustable Dumbbells', url: 'https://amzn.to/4vggOWa', desc: 'Space-saving adjustable dumbbells from 5 to 50 lbs with quick-dial weight selection.', benefits: ['5-50 lbs Range', 'Quick-Dial Adjustment', 'Compact Storage'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Ab Roller', url: 'https://amzn.to/3OpiNHd', desc: 'Ergonomic ab roller wheel kit with thick knee mat for intense, low-impact core strengthening.', benefits: ['Extra-Wide Wheel', 'Knee Mat Included', 'Anti-Slip Handles'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Jump Rope', url: 'https://amzn.to/4bUqYV0', desc: 'Speed jump rope with ball-bearing handles for frictionless jumping at any intensity level.', benefits: ['Ball-Bearing Handles', 'Adjustable Length', 'Tangle-Free Cable'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Push-Up Board', url: 'https://amzn.to/4trnFKQ', desc: 'Color-coded 12-position push-up board targeting chest, shoulders, back, and triceps.', benefits: ['12 Grip Positions', 'Color-Coded Zones', 'Non-Slip Feet'] },
    { cat: 'Sports & Fitness', badge: "Editor's Choice", name: 'Gym Gloves', url: 'https://amzn.to/4cbGYAM', desc: 'Full-palm padded gym gloves with wrist support for heavy lifting, pullups, and machine training.', benefits: ['Full-Palm Padding', 'Wrist Support Wrap', 'Anti-Slip Grip'] },
    { cat: 'Sports & Fitness', badge: 'Top Pick', name: 'Water Bottle', url: 'https://amzn.to/41MUm9M', desc: 'Triple-insulated stainless steel water bottle that keeps drinks cold 24h and hot 12h.', benefits: ['24h Cold / 12h Hot', 'Triple Insulation', 'Leak-Proof Lid'] },
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
