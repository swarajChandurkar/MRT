import './style.css';

const SVG_LOGO = `
  <svg viewBox="0 0 240 60" class="h-10 md:h-12 w-auto logo-glow" aria-label="MRT International">
    <text x="0" y="45" font-family="Manrope, sans-serif" font-weight="800" font-size="40" fill="#003366" letter-spacing="-1.5">MR</text>
    <text x="68" y="45" font-family="Manrope, sans-serif" font-weight="800" font-size="40" fill="#ff8c00" letter-spacing="-1.5">T</text>
    <path d="M98 15L112 5L126 15" fill="none" stroke="#ff8c00" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M112 5V22" fill="none" stroke="#ff8c00" stroke-width="5" stroke-linecap="round"/>
    <text x="0" y="58" font-family="Manrope, sans-serif" font-weight="600" font-size="10" fill="#003366" opacity="0.6" letter-spacing="4">INTERNATIONAL</text>
  </svg>
`;

class ShoppingCart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('mrt_cart')) || [];
    this.init();
  }
  init() { this.bindEvents(); }
  bindEvents() {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        const product = JSON.parse(addBtn.dataset.product);
        this.addItem(product);
      }
    });
  }
  addItem(product) { this.items.push(product); localStorage.setItem('mrt_cart', JSON.stringify(this.items)); }
}

const ID_MAP = {
  '1': 'home-kitchen',
  '2': 'beauty-personal-care',
  '3': 'health-wellness',
  '4': 'pet-supplies',
  '5': 'baby-kids-essentials',
  '6': 'electronics-accessories',
  '7': 'sports-fitness'
};

const API_BASE = ''; // Use relative paths for Vite proxy

const SECTION_IDS = [
  'home-kitchen-carousel', 'health-wellness-carousel', 'beauty-personal-care-carousel',
  'pet-carousel', 'baby-kids-essentials-carousel', 'electronics-carousel', 'sports-carousel'
];

class MRTApp {
  constructor() {
    // 1. CRITICAL: Force visibility before anything else
    document.body.classList.add('loaded');
    document.body.style.opacity = '1';

    // 2. Library Guards
    if (typeof Lenis !== 'undefined') {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || urlParams.get('c');
    const id = urlParams.get('id');
    this.currentCategory = category || ID_MAP[id] || 'home-kitchen';
    
    this.isBoutique = window.location.pathname.includes('category.html');

    this.injectLogos();
    this.init();
    
    this.cart = new ShoppingCart();
  }

  async init() {
    try {
      this.initHeaderScroll();
      if (this.lenis) this.initLenis();

      // Add "Shop Now" scroll listener - Made robust to avoid invalid selector errors
      const allButtons = Array.from(document.querySelectorAll('button'));
      const shopBtn = allButtons.find(el => {
        const txt = el.textContent || '';
        return txt.includes('Explore') || txt.includes('Collections');
      }) || document.querySelector('.hero-btn') || document.querySelector('.bg-primary.text-on-primary');

      if (shopBtn) {
        shopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const target = document.getElementById('categories') || document.querySelector('.peek-container') || document.getElementById('category-carousels-container');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      }

      if (this.isBoutique) {
        await this.initBoutique();
      } else {
        await this.renderFeaturedSegments();
        await this.renderHomepageTestimonials();
      }

      this.initScrollReveal();
      this.animateReveals();
      this.bindEvents();
      this.initSmoothScroll();
    } catch (err) {
      console.error('MRTApp Initialization Error:', err);
    }
  }

  injectLogos() {
    document.querySelectorAll('[data-logo]').forEach(el => {
      el.innerHTML = SVG_LOGO;
    });
  }

  async initBoutique() {
    const container = document.getElementById('category-products-container');
    if (!container) return;

    try {
      const [productsRes, themesRes] = await Promise.all([
        fetch('/api/legacy/products'),
        fetch('/api/legacy/themes')
      ]);

      if (!productsRes.ok || !themesRes.ok) throw new Error('API error');

      const products = await productsRes.json();
      const themes = await themesRes.json();
      const theme = themes[this.currentCategory];

      if (theme) {
        this.applyTheme(theme);
        this.renderBoutiqueProducts(products, this.currentCategory, container);
      } else {
        container.innerHTML = `<p class="col-span-full text-center serif italic opacity-50 py-20 animate-pulse text-on-surface">Synchronizing Collection for "${this.currentCategory}"...</p>`;
      }
    } catch (err) {
      console.error('Boutique sync failed:', err);
      container.innerHTML = `<p class="col-span-full text-center serif italic opacity-50 py-20 text-on-surface">Data sync failed. Ensure server is active at 127.0.0.1:3001.</p>`;
    } finally {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
  }

  applyTheme(theme) {
    const root = document.documentElement;
    const primary = theme.primary || '#914d00';
    const secondary = theme.secondary || '#f28c28';
    
    root.style.setProperty('--category-primary', primary);
    root.style.setProperty('--category-secondary', secondary);
    
    // Create a theme-aware semi-transparent glow for the premium cards
    const glowColor = primary.startsWith('#') 
      ? `rgba(${parseInt(primary.slice(1,3), 16)}, ${parseInt(primary.slice(3,5), 16)}, ${parseInt(primary.slice(5,7), 16)}, 0.15)`
      : primary;
    root.style.setProperty('--category-primary-glow', glowColor);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('seo-title', theme.seoTitle || `Top 10 Best ${theme.title} Products (2026)`);
    set('seo-intro', theme.seoIntro || `Discover the most useful, trending, and top-rated ${theme.title.toLowerCase()} products carefully selected for quality and value.`);
    document.title = `${theme.title} | MRT International`;
  }

  createProductCard(product, options = {}) {
    const variant = options.variant || 'boutique';
    const name = product.name || 'Product';
    const badge = product.badge || 'Top Pick';
    const shortDesc = product.shortBenefit || 'Premium quality product selected for elite needs.';
    const benefits = (product.keyBenefits ? (typeof product.keyBenefits === 'string' ? JSON.parse(product.keyBenefits) : product.keyBenefits) : ['High Quality', 'Durable', 'Effective']).slice(0, 3);
    const ratingStr = product.rating || '4.8/5 Recommended';
    const image = product.image || '';
    const affiliateUrl = product.affiliateUrl || '#';
    
    const ratingDisplay = `⭐ [${product.ratingValue || 4.8}/5 Recommended]`;
    
    const cardClasses = variant === 'homepage'
      ? 'product-card-premium product-card-compact group flex-shrink-0 w-[300px] md:w-[380px] snap-start'
      : 'product-card-premium group snap-start block w-full border border-outline-variant/20 hover:border-transparent transition-all duration-300';

    return `
      <article class="${cardClasses}" data-premium-card>
        <div class="premium-glow"></div>
        <div class="image-glass-container mb-4">
          <div class="absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl" style="background-color: var(--category-primary, #914d00); color: white;">
            ${badge}
          </div>
          ${image
            ? `<img src="${image}" alt="${name}" class="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-105" loading="lazy">`
            : `<div class="w-full h-full flex items-center justify-center opacity-20 text-on-surface"><span class="material-symbols-outlined text-6xl">image</span></div>`
          }
        </div>
        <div class="flex flex-col flex-grow text-left">
          <h3 class="text-xl md:text-2xl font-bold font-headline italic text-on-surface mb-2 leading-tight">${name}</h3>
          <p class="text-sm text-on-surface-variant font-body mb-4 line-clamp-1 opacity-90">${shortDesc}</p>
          
          <ul class="mb-5 space-y-2 flex-grow">
            ${benefits.map(b => `
              <li class="flex items-start text-[13px] text-on-surface-variant font-body leading-snug">
                <span class="mr-2 opacity-60 mt-0.5">•</span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>
          
          <div class="mb-5 flex flex-col gap-1">
            <p class="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">${ratingDisplay}</p>
          </div>
          
          <div class="mt-auto flex flex-col gap-3 relative z-20">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a href="${affiliateUrl}" target="_blank" class="rounded-xl py-3 px-2 text-center text-[10px] font-bold uppercase tracking-wider shadow-md transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2" style="background-color: #FF9900; color: #111;">
                <span class="material-symbols-outlined text-sm">shopping_cart</span>
                Check Price on Amazon
              </a>
              <a href="${affiliateUrl}" target="_blank" class="rounded-xl py-3 px-2 text-center text-[10px] font-bold uppercase tracking-wider border border-on-surface/20 hover:bg-on-surface/5 transition-all active:scale-95 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">visibility</span>
                View Deal on Temu
              </a>
            </div>
            <p class="text-[9px] text-center text-on-surface-variant opacity-40 mt-1 italic leading-tight">Price and availability may vary on the partner website.</p>
          </div>
        </div>
      </article>
    `;
  }

  renderBoutiqueProducts(products, category, container) {
    const filtered = products.filter(p => p.category === category);
    if (filtered.length === 0) {
      container.innerHTML = `<p class="col-span-full text-center serif italic opacity-50 py-20 text-on-surface">No products in "${category}" yet.</p>`;
      return;
    }

    const sections = [
      { badge: 'Top Pick', title: '⭐ Top Picks' },
      { badge: 'Trending Now', title: '🔥 Trending Now' },
      { badge: "Editor's Choice", title: "💡 Editor's Choice" }
    ];

    const unassigned = filtered.filter(p => !sections.some(s => s.badge === p.badge));

    container.innerHTML = sections.map(sec => {
      const secProducts = filtered.filter(p => p.badge === sec.badge);
      if (secProducts.length === 0) return '';
      return `
        <div class="category-section mb-32">
          <div class="flex flex-col mb-16">
             <h2 class="text-6xl md:text-8xl font-headline italic text-on-surface mb-4">${sec.title}</h2>
             <div class="h-1 w-40 bg-primary/20" style="background-color: var(--category-primary, #914d0055);"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            ${secProducts.map(p => this.createProductCard(p)).join('')}
          </div>
        </div>
      `;
    }).join('') + (unassigned.length > 0 ? `
        <div class="category-section mb-32">
          <div class="flex flex-col mb-16">
             <h2 class="text-6xl md:text-8xl font-headline italic text-on-surface mb-4">Elite Collection</h2>
             <div class="h-1 w-40 opacity-20" style="background-color: var(--category-primary, #914d00);"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            ${unassigned.map(p => this.createProductCard(p)).join('')}
          </div>
        </div>
    ` : '');
    
    this.initCardInteractions('category-products-container');
  }

  initCardInteractions(targetId = null) {
    const selector = targetId ? `#${targetId} [data-premium-card]` : '[data-premium-card]';
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);

        // Subtle 3D Tilt - Refined for Professional feel
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = (x - xc) / (rect.width / 2);
        const dy = (y - yc) / (rect.height / 2);

        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotateY: dx * 4,
            rotateX: -dy * 4,
            duration: 0.5,
            ease: 'power1.out'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--x', `50%`);
        card.style.setProperty('--y', `50%`);
        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.7)'
          });
        }
      });
    });

    // High-performance Reveal Animations - Professional & Robust
    const animSections = targetId ? [targetId] : [...(SECTION_IDS || []), 'category-products-container'];

    animSections.forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      const sectionCards = container.querySelectorAll('.product-card-premium');
      
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && sectionCards.length > 0) {
        // Ensure they are visible if GSAP fails or trigger doesn't hit
        gsap.set(sectionCards, { opacity: 0, y: 30 });

        gsap.to(sectionCards, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: 'top 95%',
            toggleActions: 'play none none none'
          }
        });
      }
    });

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  initLenis() {
    const raf = (t) => { this.lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (currentPath.includes(href) && href !== 'index.html') {
         link.classList.add('text-on-surface', 'border-b-2', 'border-primary');
         link.classList.remove('text-on-surface-variant');
      }
    });

    gsap.utils.toArray('.category-pill').forEach(pill => {
       gsap.from(pill, { x: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
    });
  }

  async renderFeaturedSegments() {
    try {
      const [productsRes, themesRes] = await Promise.all([
        fetch('/api/legacy/products'),
        fetch('/api/legacy/themes')
      ]);
      
      if (productsRes.ok && themesRes.ok) {
        const products = await productsRes.json();
        const themes = await themesRes.json();
        this.renderHomepagePicks(products, themes);
      }
    } catch (err) { 
      console.error('Featured segments sync failed:', err); 
    } finally { 
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); 
    }
  }

  async renderHomepageTestimonials() {
    try {
      const res = await fetch('/api/testimonials');
      if (res.ok) {
        const data = await res.json();
        this.renderTestimonials(data);
      }
    } catch (err) { console.error('Testimonial sync failed:', err); }
    finally { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); }
  }

  renderHomepagePicks(products, themes = {}) {
     const sections = [
        { id: 'home-kitchen-carousel', category: 'home-kitchen' },
        { id: 'health-wellness-carousel', category: 'health-wellness' },
        { id: 'beauty-personal-care-carousel', category: 'beauty-personal-care' },
        { id: 'pet-carousel', category: 'pet-supplies' },
        { id: 'baby-kids-essentials-carousel', category: 'baby-kids-essentials' },
        { id: 'electronics-carousel', category: 'electronics-accessories' },
        { id: 'sports-carousel', category: 'sports-fitness' }
     ];

     sections.forEach(sec => {
       const el = document.getElementById(sec.id);
       if (!el) return;
       
       const list = products
         .filter(p => p.category === sec.category)
         .slice(0, 8);

       if (list.length > 0) {
         const theme = themes[sec.category] || { primary: '#914d00', secondary: '#ff8c00' };
         const primary = theme.primary || '#914d00';
         el.style.setProperty('--category-primary', primary);
         el.style.setProperty('--category-secondary', theme.secondary || '#ff8c00');
         
         const r = parseInt(primary.slice(1, 3), 16);
         const g = parseInt(primary.slice(3, 5), 16);
         const b = parseInt(primary.slice(5, 7), 16);
         el.style.setProperty('--category-primary-glow', `rgba(${r}, ${g}, ${b}, 0.15)`);

         el.innerHTML = list.map(p => this.createProductCard(p, { variant: 'homepage' })).join('');
       } else {
         el.innerHTML = `<div class="w-full py-20 text-center opacity-30 italic">No products currently listed in ${sec.category}</div>`;
       }
     });
     this.initCardInteractions();
   }

  renderTestimonials(testimonials) {
    const render = (id, reg) => {
      const el = document.getElementById(id);
      if (!el) return;
      const list = testimonials.filter(t => t.region === reg);
      el.innerHTML = list.map((t, idx) => `
        <div class="p-10 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 hover:shadow-2xl transition-all duration-700 group reveal-up relative overflow-hidden" 
             style="transition-delay: ${idx * 150}ms">
          <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-6xl text-primary">format_quote</span>
          </div>
          <div class="flex mb-6 space-x-1">
            ${Array(5).fill('<span class="material-symbols-outlined text-sm text-primary fill-primary">star</span>').join('')}
          </div>
          <p class="text-2xl font-headline italic mb-10 leading-relaxed text-on-surface opacity-90 group-hover:opacity-100 transition-opacity relative z-10">"${t.text}"</p>
          <div class="flex items-center space-x-4 relative z-10">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              ${t.name.charAt(0)}
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-bold uppercase tracking-[0.2em] text-primary">${t.name}</span>
              <span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-50 font-bold">${t.location}</span>
            </div>
          </div>
        </div>
      `).join('');
    };
    render('testimonials-us', 'us');
    render('testimonials-ae', 'ae');
  }

  initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('bg-white/80', window.scrollY > 20);
      header.classList.toggle('backdrop-blur-xl', window.scrollY > 20);
      header.classList.toggle('shadow-xl', window.scrollY > 20);
    });
  }

  animateReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    // Register plugin to be safe
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { 
          trigger: el, 
          start: 'top 96%', // Trigger earlier
          toggleActions: 'play none none none',
          onEnter: () => el.classList.add('active') // Add class too
        },
        y: 30, // Subtle movement
        opacity: 0, 
        duration: 1.2, 
        ease: 'expo.out',
        clearProps: "all" // Remove GSAP styles after animation to avoid conflicts
      });
    });

    // Refresh after a delay to ensure everything is rendered
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 1000);
  }

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  bindEvents() {
    document.querySelectorAll('.nav-prev, .nav-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const el = document.getElementById(btn.dataset.target);
        if (el) el.scrollBy({ left: btn.classList.contains('nav-prev') ? -400 : 400, behavior: 'smooth' });
      });
    });

    // Review Modal Listeners
    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-review-btn]');
      if (btn) {
        this.openReviewModal(btn.dataset.productId, btn.dataset.productName);
      }
    });
  }

  async openReviewModal(productId, productName) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4';
    overlay.innerHTML = `
      <div class="bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <button class="absolute top-6 right-6 text-on-surface/40 hover:text-on-surface" id="close-modal">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
        
        <div class="p-10 overflow-y-auto">
          <h2 class="text-3xl font-headline italic mb-2">Reviews for <i>${productName}</i></h2>
          <p class="text-on-surface-variant opacity-60 text-sm mb-8">Hear what our global community is saying.</p>
          
          <div id="reviews-list" class="space-y-6 mb-12">
            <div class="py-10 text-center opacity-40 italic">Loading insights...</div>
          </div>
          
          <div class="border-t border-outline-variant/10 pt-10">
            <h3 class="text-xl font-headline italic mb-6">Write a <i>Review</i></h3>
            <form id="review-form" class="space-y-4">
              <input type="hidden" name="productId" value="${productId}">
              <div class="grid grid-cols-2 gap-4">
                <input type="text" name="userName" placeholder="Your Name" required class="w-full bg-white/50 border border-outline-variant/20 rounded-2xl px-6 py-4 outline-none focus:border-primary">
                <select name="rating" required class="w-full bg-white/50 border border-outline-variant/20 rounded-2xl px-6 py-4 outline-none focus:border-primary">
                  <option value="5">Excellent (5 Stars)</option>
                  <option value="4">Great (4 Stars)</option>
                  <option value="3">Good (3 Stars)</option>
                  <option value="2">Fair (2 Stars)</option>
                  <option value="1">Poor (1 Star)</option>
                </select>
              </div>
              <textarea name="comment" placeholder="Share your experience with this product..." required rows="4" class="w-full bg-white/50 border border-outline-variant/20 rounded-2xl px-6 py-4 outline-none focus:border-primary"></textarea>
              <button type="submit" class="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:scale-[1.02] transition-all">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => { overlay.remove(); document.body.style.overflow = 'auto'; };
    overlay.querySelector('#close-modal').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    // Fetch Reviews
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const reviews = await res.json();
      const listEl = overlay.querySelector('#reviews-list');
      
      if (reviews.length === 0) {
        listEl.innerHTML = `<div class="py-10 text-center opacity-30 italic">No reviews yet. Be the first to share your thoughts!</div>`;
      } else {
        listEl.innerHTML = reviews.map(r => `
          <div class="p-6 bg-white/40 rounded-3xl border border-white/60">
            <div class="flex justify-between items-center mb-3">
              <span class="font-bold text-primary">${r.userName}</span>
              <div class="flex text-orange-500 scale-75 transform-gpu">
                ${Array(parseInt(r.rating)).fill('<span class="material-symbols-outlined text-sm">star</span>').join('')}
              </div>
            </div>
            <p class="text-on-surface-variant italic leading-relaxed">"${r.comment}"</p>
            <p class="text-[10px] opacity-30 mt-3 uppercase tracking-widest">${new Date(r.createdAt).toLocaleDateString()}</p>
          </div>
        `).join('');
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    }

    // Submit Review
    const form = overlay.querySelector('#review-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (res.ok) {
          close();
          // Optional: Show success toast
          alert('Thank you for your review! It has been recorded.');
        } else {
          alert('Failed to submit review. Please try again.');
        }
      } catch (err) {
        alert('Network error. Please check your connection.');
      }
    };
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new MRTApp();
});
