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

  async fetchAPI(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    let url = endpoint;
    const isGet = !options.method || options.method === 'GET';
    if (isGet && !url.includes('_t=')) {
      const sep = url.includes('?') ? '&' : '?';
      url += `${sep}_t=${Date.now()}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500) {
          console.warn(`[MRT API] Server Error (${response.status}) on ${endpoint}`);
        }
        throw new Error(`API Error: ${response.status}`);
      }
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        console.warn(`[MRT API] Request Timeout: ${endpoint}`);
      }
      throw err;
    }
  }

  lockScroll() {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    const header = document.querySelector('header.fixed');
    if (header) header.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.overflow = 'hidden';
  }

  unlockScroll() {
    document.body.style.paddingRight = '';
    const header = document.querySelector('header.fixed');
    if (header) header.style.paddingRight = '';
    document.body.style.overflow = '';
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
        this.fetchAPI('/api/legacy/products'),
        this.fetchAPI('/api/legacy/themes')
      ]);

      const products = await productsRes.json();
      const themes = await themesRes.json();
      const theme = themes[this.currentCategory];

      if (theme) {
        this.applyTheme(theme);
        this.renderBoutiqueProducts(products, this.currentCategory, container);
        this.setupSortListener(products, container);
      } else {
        container.innerHTML = `<div class="min-h-[50vh] flex items-center justify-center"><p class="text-center serif italic opacity-50 py-20 animate-pulse text-on-surface">Synchronizing Collection for "${this.currentCategory}"...</p></div>`;
      }
    } catch (err) {
      console.error('Boutique sync failed:', err);
      container.innerHTML = `
        <div class="col-span-full min-h-[50vh] flex flex-col items-center justify-center text-center">
            <span class="material-symbols-outlined text-6xl text-primary opacity-50 mb-4">cloud_off</span>
            <p class="text-2xl font-headline italic text-on-surface mb-2">Sync Interrupted</p>
            <p class="text-on-surface-variant opacity-70">We are unable to connect to the boutique catalog right now. Please refresh.</p>
        </div>
      `;
    } finally {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
  }

  setupSortListener(products, container) {
    const sortEl = document.getElementById('product-sort');
    if (!sortEl) return;
    sortEl.onchange = () => {
      const sorted = this.sortProducts(products, sortEl.value);
      this.renderBoutiqueProducts(sorted, this.currentCategory, container);
    };
  }

  sortProducts(products, criteria) {
    const sorted = [...products];
    switch (criteria) {
      case 'rating': sorted.sort((a, b) => b.ratingValue - a.ratingValue); break;
      case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-high': sorted.sort((a, b) => b.price - a.price); break;
      case 'newest': sorted.sort((a, b) => b.id - a.id); break;
    }
    return sorted;
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
    const categoryName = theme.title || 'Products';
    set('seo-title', `Top 10 Best ${categoryName} (2026)`);
    set('seo-intro', `Discover the most useful, trending, and top-rated ${categoryName.toLowerCase()} products carefully selected for quality and value.`);
    set('breadcrumb-category', categoryName);
    
    const glowEl = document.getElementById('hero-glow');
    if (glowEl) {
      glowEl.style.backgroundColor = primary;
      glowEl.style.filter = 'blur(100px)';
    }

    document.title = `${theme.title} | MRT International`;
  }

  createProductCard(product) {
    const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
    const category = (product.category || '').replace(/-/g, ' ');
    const icon = product.icon || 'shopping_bag';
    const image = product.image || '';
    const name = product.name || 'Product';

    // Stringify for Quick View resilience
    const productData = JSON.stringify({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      ratingValue: product.ratingValue,
      badge: product.badge,
      affiliateUrl: product.affiliateUrl,
      keyBenefits: product.keyBenefits,
      shortBenefit: product.shortBenefit || product.shortDescription
    }).replace(/"/g, '&quot;');

    return `
      <div class="product-card reveal-up" data-premium-card data-id="${product.id}" data-product-json="${productData}">
        <div class="product-image-container group">
          ${image
            ? `<img src="${image}" alt="${name}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">`
            : `<div class="w-full h-full flex items-center justify-center opacity-20"><span class="material-symbols-outlined text-6xl">image</span></div>`
          }
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
          <div class="absolute bottom-4 right-4 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <button class="bg-white/90 backdrop-blur-md text-on-surface p-3 rounded-xl shadow-xl hover:scale-110 transition-transform" data-quick-view-btn data-product-id="${product.id}" aria-label="Quick View">
              <span class="material-symbols-outlined">visibility</span>
            </button>
            <button class="bg-primary text-white p-3 rounded-xl shadow-xl hover:scale-110 transition-transform" aria-label="Add to cart">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex justify-between items-start mb-2 gap-2">
            <h3 class="text-lg font-headline italic tracking-tight leading-snug">${name}</h3>
            <span class="font-bold text-sm whitespace-nowrap" style="color:var(--category-primary, #914d00)">$${price}</span>
          </div>
          <div class="flex items-center gap-1 text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em] opacity-50">
            <span class="material-symbols-outlined text-[14px]">${icon}</span>
            ${category}
          </div>
        </div>
      </div>
    `;
  }

  renderBoutiqueProducts(products, category, container) {
    const filtered = products.filter(p => p.category === category);

    if (filtered.length === 0) {
      container.innerHTML = `<p class="col-span-full text-center serif italic opacity-50 py-20">No products in this collection yet — check back soon.</p>`;
      return;
    }

    container.innerHTML = filtered.map(p => this.createProductCard(p)).join('');
  }

  initCardInteractions(targetId = null) {
    const selector = targetId ? `#${targetId} [data-premium-card]` : '[data-premium-card]';
    const cards = document.querySelectorAll(selector);
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);

        // Subtle 3D Tilt - Enhanced for Premium feel
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = (x - xc) / (rect.width / 2);
        const dy = (y - yc) / (rect.height / 2);

        if (typeof gsap !== 'undefined') {
          gsap.to(card, {
            rotateY: dx * 8, // More pronounced tilt
            rotateX: -dy * 8,
            boxShadow: `${-dx * 20}px ${-dy * 20}px 50px -10px rgba(0,0,0,0.1)`,
            duration: 0.4,
            ease: 'power2.out'
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
        // Removed gsap.set opacity: 0 to ensure cards are always visible even if ScrollTrigger is delayed
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
        this.fetchAPI('/api/legacy/products'),
        this.fetchAPI('/api/legacy/themes')
      ]);
      
      const products = await productsRes.json();
      const themes = await themesRes.json();
      this.renderHomepagePicks(products, themes);
    } catch (err) { 
      console.error('Featured segments sync failed:', err); 
    } finally { 
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); 
    }
  }

  async renderHomepageTestimonials() {
    try {
      const res = await this.fetchAPI('/api/testimonials');
      const data = await res.json();
      this.renderTestimonials(data);
    } catch (err) { console.error('Testimonial sync failed:', err); }
    finally { if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(); }
  }

  renderHomepagePicks(products, themes = {}) {
     const sections = [
        { id: 'home-kitchen-carousel', category: 'home-kitchen' },
        { id: 'health-care-carousel', category: 'health-wellness' }, // Map to new categories mapping
        { id: 'beauty-skincare-carousel', category: 'beauty-personal-care' },
        { id: 'pet-carousel', category: 'pet-supplies' },
        { id: 'baby-carousel', category: 'baby-kids-essentials' },
        { id: 'electronics-carousel', category: 'electronics-accessories' },
        { id: 'sports-carousel', category: 'sports-fitness' }
     ];

     sections.forEach(sec => {
       const el = document.getElementById(sec.id);
       if (!el) return;
       
       const list = products.filter(p => p.category === sec.category);

       if (list.length > 0) {
         el.innerHTML = list.map(p => this.createProductCard(p)).join('');
       } else {
         el.innerHTML = `<div class="w-full py-20 text-center opacity-30 italic">No products currently listed in ${sec.category}</div>`;
       }
     });
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

    // Quick View & Review Modal Listeners
    document.addEventListener('click', async (e) => {
      const card = e.target.closest('[data-premium-card]');
      const buyBtn = e.target.closest('.shimmer-btn'); // Link to Amazon
      const quickBtn = e.target.closest('[data-quick-view-btn]');
      if (quickBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.openQuickView(quickBtn.dataset.productId);
        return;
      }

      // If clicking card but NOT direct buy button
      if (card && !buyBtn) {
        const productId = card.dataset.id;
        const productJson = card.dataset.productJson;
        this.openQuickView(productId, productJson ? JSON.parse(productJson.replace(/&quot;/g, '"')) : null);
      }
    });
  }

  async openQuickView(productId, initialData = null) {
    try {
      // 1. RESILIENCE: Use initial data from card if available for instant load
      let product = initialData;
      
      // 2. Prepare Overlay immediately for animation
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-8 animate-fade-in';
      
      const renderModal = (productData, reviewsData = []) => {
        const benefits = (productData.keyBenefits ? (typeof productData.keyBenefits === 'string' ? JSON.parse(productData.keyBenefits) : productData.keyBenefits) : []).slice(0, 4);
        
        const searchTerms = `${productData.category || 'Product'},${productData.name || ''}`.replace(/[^a-zA-Z0-9,]/g, '').toLowerCase();
        const fallback = `https://loremflickr.com/600/600/${searchTerms}?lock=${productData.id || 1}`;

        overlay.innerHTML = `
          <div class="bg-surface w-full max-w-6xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row max-h-[95vh] animate-scale-up border border-white/10">
            <button class="absolute top-8 right-8 z-50 text-on-surface/40 hover:text-on-surface bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all" id="close-quickview">
              <span class="material-symbols-outlined text-3xl">close</span>
            </button>
            
            <!-- Image Section -->
            <div class="w-full md:w-1/2 bg-surface-variant/10 p-12 flex items-center justify-center relative group min-h-[400px]">
              <div class="premium-glow-bg absolute inset-0 opacity-20 transition-opacity duration-1000"></div>
              <img src="${productData.image}" alt="${productData.name}" class="w-full h-full object-contain relative z-10 floating-image drop-shadow-2xl" onerror="this.src='${fallback}';this.onerror=null;">
            </div>
            
            <!-- Info Section -->
            <div class="w-full md:w-1/2 p-12 overflow-y-auto detail-scrollbar bg-surface/50 backdrop-blur-md">
              <div class="mb-10">
                <div class="flex items-center gap-3 mb-4">
                  <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary text-white">${productData.badge || 'Elite'}</span>
                  <div class="flex items-center gap-1 text-primary">
                     <span class="material-symbols-outlined text-lg fill-primary">star</span>
                     <span class="font-bold text-sm">${productData.ratingValue || 4.9} / 5</span>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-headline italic text-on-surface mb-4 leading-tight">${productData.name}</h2>
                <p class="text-lg text-on-surface-variant font-body opacity-80 leading-relaxed">${productData.shortBenefit || ''}</p>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                ${benefits.map(b => `
                  <div class="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1">verified</span>
                    <span class="text-xs font-bold text-on-surface opacity-80 uppercase tracking-wide text-left">${b}</span>
                  </div>
                `).join('')}
              </div>
              
              <!-- Price & Action -->
              <div class="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 p-8 rounded-3xl bg-primary/5 border border-primary/10">
                <div class="text-center sm:text-left">
                  <p class="text-[10px] uppercase font-black tracking-widest text-primary opacity-60 mb-1">Store Price</p>
                  <span class="text-4xl font-bold text-on-surface">$${productData.price ? (typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price) : '39.99'}</span>
                </div>
                <a href="${productData.affiliateUrl}" target="_blank" class="shimmer-btn flex-grow sm:flex-grow-0 w-full sm:w-auto px-12 py-5 rounded-2xl bg-[#FF9900] text-[#111] font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <span class="material-symbols-outlined">shopping_cart</span>
                  Buy on Amazon
                </a>
              </div>
              
              <!-- Reviews Segment -->
              <div class="border-t border-outline-variant/10 pt-10">
                <div class="flex items-center justify-between mb-8">
                  <h3 class="text-2xl font-headline italic">Recent <i>Insights</i></h3>
                  <span class="text-xs font-bold uppercase tracking-widest opacity-40">${reviewsData.length} Reviews</span>
                </div>
                
                <div class="space-y-6">
                  ${reviewsData.length > 0 ? reviewsData.map(r => `
                    <div class="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all group/rev">
                      <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">${r.userName.charAt(0)}</div>
                          <span class="text-xs font-black uppercase tracking-wider text-on-surface">${r.userName}</span>
                          ${r.isVerified ? `<span class="material-symbols-outlined text-[14px] text-primary" style="font-variation-settings: 'FILL' 1">verified</span>` : ''}
                        </div>
                        <div class="flex text-primary opacity-60">
                          ${Array(r.rating || 5).fill('<span class="material-symbols-outlined text-[10px] fill-primary">star</span>').join('')}
                        </div>
                      </div>
                      <p class="text-sm font-body italic text-on-surface-variant opacity-80 leading-relaxed group-hover/rev:opacity-100 transition-opacity">"${r.comment}"</p>
                    </div>
                  `).join('') : `
                    <div class="py-12 flex flex-col items-center justify-center text-center opacity-50">
                      <span class="material-symbols-outlined text-4xl mb-4 text-primary/30">rate_review</span>
                      <p class="text-base font-headline italic">No reviews yet.</p>
                      <p class="text-sm mt-2 opacity-60">Be the first to share your experience with this product!</p>
                    </div>
                  `}
                </div>
              </div>
            </div>
          </div>
        `;
        
        const close = () => { overlay.remove(); this.unlockScroll(); };
        overlay.querySelector('#close-quickview').onclick = close;
        overlay.onclick = (e) => { if (e.target.classList.contains('fixed')) close(); };
      };

      // Initial Render if we have data
      if (product) {
        renderModal(product);
        document.body.appendChild(overlay);
        this.lockScroll();
      }

      // Fetch Full Data (Hydration)
      try {
        let response;
        try {
          response = await this.fetchAPI(`/api/products/${productId}`);
        } catch (err) {
          response = await this.fetchAPI(`http://127.0.0.1:3001/api/products/${productId}`);
        }

        const freshProduct = await response.json();
        
        let reviews = [];
        try {
          let reviewsRes;
          try {
            reviewsRes = await this.fetchAPI(`/api/reviews/${productId}`);
          } catch(e) {
            reviewsRes = await this.fetchAPI(`http://127.0.0.1:3001/api/reviews/${productId}`);
          }
          reviews = await reviewsRes.json();
        } catch(e) {}

        // Render with full data
        if (!product) {
          document.body.appendChild(overlay);
          this.lockScroll();
        }
        renderModal(freshProduct, reviews);

      } catch (err) {
        console.warn('API Hydration failed, using card data only.');
      }
    } catch (err) {
      console.error('Quick View Error:', err);
    }
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
    this.lockScroll();

    const close = () => { overlay.remove(); this.unlockScroll(); };
    overlay.querySelector('#close-modal').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    // Fetch Reviews with Proxy Fallback
    try {
      let res;
      try {
        res = await this.fetchAPI(`/api/reviews/${productId}`);
      } catch(e) {
        res = await this.fetchAPI(`http://127.0.0.1:3001/api/reviews/${productId}`);
      }
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
        await this.fetchAPI('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        close();
        alert('Thank you for your review! It has been recorded.');
      } catch (err) {
        alert('Failed to submit review or network error. Please try again.');
      }
    };
  }

}

document.addEventListener('DOMContentLoaded', () => {
  new MRTApp();
});
