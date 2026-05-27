/**
 * GastroLab — SPA Engine v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Fix #1  – autoAdvance topping: trigger scatta su newCatCount >= max
 *           (funziona per max=1, max=2, max=3 — incluso topping min=0)
 * Fix #2  – loadPreset: imposta activeCategory='sauce' + chiama renderConfigurator
 *           → isBowlValid()=true → computeProgressBar() → 100% verde immediato
 * NEW     – state.orderHistory + localStorage, dashboard admin, footer link segreto
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ==========================================================================
   1. DATA
   ========================================================================== */

const INGREDIENTS_DATA = [
    { id:'b1', name:'Riso Bianco',  type:'base',    price:2.00, cals:150, icon:'🍚', isVegan:true,  isGlutenFree:true,  img:'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&auto=format&fit=crop&q=60' },
    { id:'b2', name:'Quinoa',       type:'base',    price:3.00, cals:120, icon:'🌾', isVegan:true,  isGlutenFree:true,  img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60' },
    { id:'p1', name:'Salmone',      type:'protein', price:5.00, cals:200, icon:'🐟', isVegan:false, isGlutenFree:true,  img:'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&auto=format&fit=crop&q=60' },
    { id:'p2', name:'Tonno',        type:'protein', price:6.00, cals:180, icon:'🥩', isVegan:false, isGlutenFree:true,  img:'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=300&auto=format&fit=crop&q=60' },
    { id:'p3', name:'Tofu',         type:'protein', price:4.00, cals:100, icon:'🟩', isVegan:true,  isGlutenFree:true,  img:'https://images.unsplash.com/photo-1584984241774-67d710bf365f?w=300&auto=format&fit=crop&q=60' },
    { id:'t1', name:'Avocado',      type:'topping', price:1.50, cals:80,  icon:'🥑', isVegan:true,  isGlutenFree:true,  img:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=60' },
    { id:'t2', name:'Edamame',      type:'topping', price:1.00, cals:50,  icon:'🫛', isVegan:true,  isGlutenFree:true,  img:'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id:'t3', name:'Alga Wakame',  type:'topping', price:1.00, cals:30,  icon:'🌿', isVegan:true,  isGlutenFree:false, img:'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id:'s1', name:'Teriyaki',     type:'sauce',   price:0.00, cals:50,  icon:'🍯', isVegan:true,  isGlutenFree:false, img:'https://images.unsplash.com/photo-1605721160676-e1e3532c1eb3?w=300&auto=format&fit=crop&q=60' },
    { id:'s2', name:'Spicy Mayo',   type:'sauce',   price:0.00, cals:80,  icon:'🌶️', isVegan:false, isGlutenFree:true,  img:'https://images.unsplash.com/photo-1592518428581-22485590cb78?w=300&auto=format&fit=crop&q=60' },
];

const CATEGORIES_CONFIG = {
    base:    { label:'Base',     instruction:'Scegli la tua Base (Max 1)',            max:1, min:1, step:1 },
    protein: { label:'Proteine', instruction:'Aggiungi le tue Proteine (Fino a 2)',   max:2, min:1, step:2 },
    topping: { label:'Topping',  instruction:'Arricchisci con i Topping (Fino a 3)', max:3, min:0, step:3 },
    sauce:   { label:'Salse',    instruction:'Completa con le Salse (Fino a 2)',      max:2, min:0, step:4 },
};

const PRESETS_DATA = [
    { name:'🏆 Classic Salmon', description:'Il grande classico. Riso, salmone, avocado e salsa teriyaki.',       items:{ b1:1, p1:1, t1:1, s1:1 }, price:'8.50€', cals:'480 kcal', tag:'Bestseller', tagColor:'bg-amber-400 text-amber-900' },
    { name:'🍃 Green Vegan',    description:'Quinoa, tofu, edamame e teriyaki. 100% plant-based.',                items:{ b2:1, p3:1, t2:1, s1:1 }, price:'8.00€', cals:'320 kcal', tag:'Vegan',      tagColor:'bg-emerald-400 text-emerald-900' },
    { name:'🌶️ Spicy Tuna',     description:'Riso bianco, tonno, alga wakame e spicy mayo per i coraggiosi.',    items:{ b1:1, p2:1, t3:1, s2:1 }, price:'9.00€', cals:'460 kcal', tag:'Piccante',   tagColor:'bg-red-400 text-red-900' },
];


/* ==========================================================================
   2. STATE
   ========================================================================== */

const loadOrderHistory = () => {
    try { const r = localStorage.getItem('gl_orders'); return r ? JSON.parse(r) : []; } catch { return []; }
};
const persistOrderHistory = (h) => {
    try { localStorage.setItem('gl_orders', JSON.stringify(h)); } catch {}
};

const state = {
    currentPage:    'home',
    cart:           [],
    currentBowl:    {},
    activeCategory: 'base',
    filters:        { vegan: false, glutenFree: false },
    mobileMenuOpen: false,
    orderHistory:   loadOrderHistory(),
};


/* ==========================================================================
   3. DOM CACHE
   ========================================================================== */

let DOM = {};
let lottieFeedback = null;
let lottieCheckout = null;

const cacheDOMElements = () => {
    DOM = {
        pages: {
            home:         document.getElementById('page-home'),
            configurator: document.getElementById('page-configurator'),
            about:        document.getElementById('page-about'),
            contact:      document.getElementById('page-contact'),
            dashboard:    document.getElementById('page-dashboard'),
        },
        logoLink:               document.getElementById('logo-link'),
        mobileMenuBtn:          document.getElementById('mobile-menu-btn'),
        mobileMenu:             document.getElementById('mobile-menu'),
        hamburgerIcon:          document.getElementById('hamburger-icon'),
        presetsContainer:       document.getElementById('presets-container'),
        presetsContainerMobile: document.getElementById('presets-container-mobile'),
        famousPokGrid:          document.getElementById('famous-poke-grid'),
        bowlLivingContent:      document.getElementById('bowl-living-content'),
        emptyBowlPlaceholder:   document.getElementById('empty-bowl-placeholder'),
        bowlTagsPreview:        document.getElementById('bowl-tags-preview'),
        totalCaloriesBadge:     document.getElementById('total-calories-badge'),
        currentBowlPrice:       document.getElementById('current-bowl-price'),
        categoryInstruction:    document.getElementById('category-instruction'),
        stepCounter:            document.getElementById('step-counter'),
        ingredientsGrid:        document.getElementById('ingredients-grid'),
        mainActionBtn:          document.getElementById('main-action-btn'),
        filterVegan:            document.getElementById('filter-vegan'),
        filterGf:               document.getElementById('filter-gf'),
        progressBar:            document.getElementById('main-progress-bar'),
        lottieFeedbackContainer:document.getElementById('lottie-feedback-container'),
        lottieCheckoutContainer:document.getElementById('lottie-checkout-container'),
        checkoutOverlay:        document.getElementById('checkout-overlay'),
        checkoutModal:          document.getElementById('checkout-modal'),
        closeModalBtn:          document.getElementById('close-modal-btn'),
        cartToggleBtn:          document.getElementById('cart-toggle-btn'),
        cartBadge:              document.getElementById('cart-badge'),
        cartDrawer:             document.getElementById('cart-drawer'),
        cartBackdrop:           document.getElementById('cart-backdrop'),
        cartCloseBtn:           document.getElementById('cart-close-btn'),
        cartItemsContainer:     document.getElementById('cart-items-container'),
        cartTotalPrice:         document.getElementById('cart-total-price'),
        checkoutBtn:            document.getElementById('checkout-btn'),
        tabs: {
            base:    document.getElementById('tab-base'),
            protein: document.getElementById('tab-protein'),
            topping: document.getElementById('tab-topping'),
            sauce:   document.getElementById('tab-sauce'),
        },
        statuses: {
            base:    document.getElementById('status-base'),
            protein: document.getElementById('status-protein'),
            topping: document.getElementById('status-topping'),
            sauce:   document.getElementById('status-sauce'),
        },
        contactSubmitBtn:    document.getElementById('contact-submit-btn'),
        contactSuccessMsg:   document.getElementById('contact-success-msg'),
        secretAdminLink:     document.getElementById('secret-admin-link'),
        clearHistoryBtn:     document.getElementById('clear-history-btn'),
        kpiRevenue:          document.getElementById('kpi-revenue'),
        kpiBowls:            document.getElementById('kpi-bowls'),
        kpiOrders:           document.getElementById('kpi-orders'),
        ordersCountBadge:    document.getElementById('orders-count-badge'),
        dashboardOrdersList: document.getElementById('dashboard-orders-list'),
    };
};


/* ==========================================================================
   4. ANIMATIONS
   ========================================================================== */

const initAnimations = () => {
    if (DOM.lottieFeedbackContainer) {
        lottieFeedback = lottie.loadAnimation({
            container: DOM.lottieFeedbackContainer,
            renderer: 'svg', loop: false, autoplay: false,
            path: 'https://fonts.gstatic.com/s/a/666c5d95d9be25350fa67f13df7ad6b92a40fbbfdfba1519d08e2f099146ef94.json',
        });
    }
    if (DOM.lottieCheckoutContainer) {
        lottieCheckout = lottie.loadAnimation({
            container: DOM.lottieCheckoutContainer,
            renderer: 'svg', loop: false, autoplay: false,
            path: 'Add_to_cart.json',
        });
    }
};

const triggerFeedbackBurst = () => {
    if (!lottieFeedback) return;
    DOM.lottieFeedbackContainer.classList.remove('opacity-0');
    lottieFeedback.goToAndPlay(0, true);
    setTimeout(() => DOM.lottieFeedbackContainer.classList.add('opacity-0'), 1200);
};


/* ==========================================================================
   5. SPA ROUTER
   ========================================================================== */

const navigateTo = (page) => {
    if (!DOM.pages[page]) return;
    state.currentPage = page;

    Object.keys(DOM.pages).forEach(k => DOM.pages[k].classList.toggle('hidden', k !== page));

    // Aggiorna active state sui link di nav pubblici (non la dashboard)
    document.querySelectorAll('.nav-link[data-page]').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-page') === page);
    });

    if (state.mobileMenuOpen) closeMobileMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'configurator') renderConfigurator();
    if (page === 'dashboard')    renderDashboard();
};

const closeMobileMenu = () => {
    state.mobileMenuOpen = false;
    DOM.mobileMenu.classList.add('hidden');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    DOM.hamburgerIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"/>';
};
const openMobileMenu = () => {
    state.mobileMenuOpen = true;
    DOM.mobileMenu.classList.remove('hidden');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    DOM.hamburgerIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>';
};


/* ==========================================================================
   6. TEMPLATE COMPONENTS
   ========================================================================== */

const IngredientSelectorCard = (item, qty, maxReached) => {
    const sel   = qty > 0;
    const tag   = item.isVegan ? 'Vegan' : (item.isGlutenFree ? 'GF' : '');
    const ring  = sel ? 'border-brand bg-brandLight shadow-md' : 'border-slate-200 bg-white hover:border-brand/50 hover:shadow-md';
    return `
        <article class="ingredient-card flex flex-col justify-between p-3 lg:p-4 rounded-2xl border-2 transition-all duration-200 min-h-[160px] lg:min-h-[180px] ${ring}" data-id="${item.id}">
            <div class="w-full h-20 rounded-xl overflow-hidden bg-slate-100 relative">
                <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy">
                ${tag ? `<span class="absolute top-1 right-1 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">${tag}</span>` : ''}
                ${sel ? `<div class="absolute inset-0 bg-brand/10 flex items-center justify-center"><span class="text-brand text-2xl font-black">✓</span></div>` : ''}
            </div>
            <div class="mt-2 flex-1">
                <h4 class="text-sm lg:text-base font-bold text-slate-900 leading-tight">${item.icon} ${item.name}</h4>
                <p class="text-[11px] lg:text-xs font-medium text-slate-500 mt-0.5">+${item.price.toFixed(2)}€ &bull; ${item.cals} kcal</p>
            </div>
            <div class="mt-3">
                ${!sel
                    ? `<button type="button" class="w-full bg-slate-100 hover:bg-brand hover:text-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" data-action="add" ${maxReached ? 'disabled' : ''}>${maxReached ? 'Limite Raggiunto' : 'Aggiungi'}</button>`
                    : `<div class="flex items-center justify-between bg-white border border-brand rounded-xl overflow-hidden h-8">
                            <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors" data-action="decrease">−</button>
                            <span class="text-sm font-bold text-slate-900">${qty}</span>
                            <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand" data-action="increase" ${maxReached ? 'disabled' : ''}>+</button>
                       </div>`
                }
            </div>
        </article>`;
};

const FamousPokeCard = (p) => `
    <div class="poke-preset-card bg-white rounded-3xl border border-slate-200 overflow-hidden group">
        <div class="bg-slate-900 h-36 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent"></div>
            <span class="text-7xl group-hover:scale-110 transition-transform duration-300 relative z-10">🥗</span>
            <span class="absolute top-4 left-4 ${p.tagColor} text-xs font-black px-3 py-1 rounded-full">${p.tag}</span>
        </div>
        <div class="p-6">
            <h3 class="font-bold text-slate-900 text-lg mb-2">${p.name}</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-4">${p.description}</p>
            <div class="flex items-center justify-between">
                <div><span class="text-brand font-black text-xl">${p.price}</span><span class="text-slate-400 text-xs font-medium ml-2">${p.cals}</span></div>
                <button type="button" class="btn-load-preset bg-brand hover:bg-brandHover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm" data-preset='${JSON.stringify(p.items)}'>Carica →</button>
            </div>
        </div>
    </div>`;

const PresetChip = (p) => `
    <button type="button" class="btn-preset bg-slate-50 hover:bg-brandLight border border-slate-200 hover:border-brand hover:text-brand px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 transition-all duration-200 whitespace-nowrap" data-preset='${JSON.stringify(p.items)}'>${p.name}</button>`;

const CartItemCard = (bowl, idx) => {
    let price = 0;
    const desc = Object.keys(bowl).map(id => {
        const it = INGREDIENTS_DATA.find(i => i.id === id);
        price += it.price * bowl[id];
        return `${it.icon} ${it.name}${bowl[id] > 1 ? ` ×${bowl[id]}` : ''}`;
    }).join(' · ');
    return `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 relative shadow-sm">
            <button class="absolute top-3 right-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white w-7 h-7 rounded-lg text-sm font-bold transition-colors flex items-center justify-center btn-remove-item" data-index="${idx}" aria-label="Rimuovi poke ${idx+1}">×</button>
            <div class="font-bold text-slate-800 text-sm mb-1 pr-8">Poke Personalizzata #${idx+1}</div>
            <div class="text-xs text-slate-500 mb-2 leading-relaxed">${desc}</div>
            <div class="font-black text-brand text-lg">${price.toFixed(2)}€</div>
        </div>`;
};

const OrderHistoryCard = (order, orderNumber) => {
    const d    = new Date(order.timestamp);
    const date = d.toLocaleDateString('it-IT', { day:'2-digit', month:'short', year:'numeric' });
    const time = d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });
    const num  = String(orderNumber).padStart(3, '0');

    const bowlsHtml = order.bowls.map((bowl, bIdx) => {
        let bPrice = 0;
        const chips = Object.keys(bowl).map(id => {
            const it = INGREDIENTS_DATA.find(i => i.id === id);
            if (!it) return '';
            bPrice += it.price * bowl[id];
            return `<span class="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-lg">${it.icon} ${it.name}${bowl[id] > 1 ? ` ×${bowl[id]}` : ''}</span>`;
        }).join('');
        return `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Bowl #${bIdx+1}</span>
                    <span class="text-brand font-black text-sm">${bPrice.toFixed(2)}€</span>
                </div>
                <div class="flex flex-wrap gap-1.5">${chips}</div>
            </div>`;
    }).join('');

    return `
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-11 h-11 bg-brand/20 border border-brand/30 rounded-xl flex items-center justify-center shrink-0">
                        <span class="text-brand font-black text-xs">#${num}</span>
                    </div>
                    <div>
                        <p class="text-white font-bold text-sm">Ordine del ${date}</p>
                        <p class="text-slate-400 text-xs">⏱ ${time} &bull; ${order.bowls.length} bowl</p>
                    </div>
                </div>
                <div class="text-left sm:text-right shrink-0">
                    <p class="text-slate-400 text-[10px] uppercase tracking-wide font-bold">Totale</p>
                    <p class="text-emerald-400 font-black text-xl">${order.total.toFixed(2)}€</p>
                </div>
            </div>
            <div class="p-4 flex flex-col gap-2">${bowlsHtml}</div>
        </div>`;
};


/* ==========================================================================
   7. CONFIGURATOR
   ========================================================================== */

const getCatCount = (cat) =>
    Object.keys(state.currentBowl).reduce((acc, id) => {
        const it = INGREDIENTS_DATA.find(i => i.id === id);
        return it && it.type === cat ? acc + state.currentBowl[id] : acc;
    }, 0);

const isBowlValid = () =>
    Object.keys(CATEGORIES_CONFIG).every(c => getCatCount(c) >= CATEGORIES_CONFIG[c].min);

/**
 * computeProgressBar
 * ─ Se il bowl soddisfa tutti i minimi → 100% verde (indipendente dalla tab attiva)
 * ─ Altrimenti → percentuale lineare dello step corrente
 */
const computeProgressBar = () => {
    const seq   = Object.keys(CATEGORIES_CONFIG);
    const idx   = seq.indexOf(state.activeCategory);
    const valid = isBowlValid();
    const pct   = valid ? 100 : Math.round(((idx + 1) / seq.length) * 100);
    return {
        pct,
        cls: valid
            ? 'h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out'
            : 'h-full bg-brand rounded-full transition-all duration-500 ease-out',
    };
};

const renderConfigurator = () => {
    if (!DOM.ingredientsGrid) return;

    const cfg   = CATEGORIES_CONFIG[state.activeCategory];
    const count = getCatCount(state.activeCategory);
    const maxed = count >= cfg.max;
    const seq   = Object.keys(CATEGORIES_CONFIG);
    const idx   = seq.indexOf(state.activeCategory);

    // Instruction + counter
    if (DOM.categoryInstruction) DOM.categoryInstruction.textContent = cfg.instruction;
    if (DOM.stepCounter)         DOM.stepCounter.textContent         = `${idx + 1} / ${seq.length}`;

    // Grid
    let items = INGREDIENTS_DATA.filter(i => i.type === state.activeCategory);
    if (state.filters.vegan)      items = items.filter(i => i.isVegan);
    if (state.filters.glutenFree) items = items.filter(i => i.isGlutenFree);

    DOM.ingredientsGrid.innerHTML = items.length === 0
        ? `<p class="col-span-2 lg:col-span-3 text-center text-slate-500 font-medium py-10">Nessun ingrediente trovato con i filtri attivi.</p>`
        : items.map(i => IngredientSelectorCard(i, state.currentBowl[i.id] || 0, maxed)).join('');

    // Tabs + badges
    seq.forEach(cat => {
        const c = getCatCount(cat);
        if (DOM.tabs[cat])     DOM.tabs[cat].classList.toggle('active', cat === state.activeCategory);
        if (DOM.statuses[cat]) {
            const done = c > 0 && c >= CATEGORIES_CONFIG[cat].min;
            DOM.statuses[cat].classList.toggle('completed', done);
            DOM.statuses[cat].textContent = done ? '✓' : '';
        }
    });

    // ── FIX #2: progress bar usa isBowlValid() senza condizionare sulla tab attiva ──
    const { pct, cls } = computeProgressBar();
    if (DOM.progressBar) { DOM.progressBar.style.width = `${pct}%`; DOM.progressBar.className = cls; }

    // Living bowl + totals
    renderLivingBowl();
    const totals = Object.keys(state.currentBowl).reduce((acc, id) => {
        const it = INGREDIENTS_DATA.find(i => i.id === id);
        const q  = state.currentBowl[id];
        return { price: acc.price + it.price * q, cals: acc.cals + it.cals * q };
    }, { price:0, cals:0 });
    if (DOM.totalCaloriesBadge) DOM.totalCaloriesBadge.textContent = `${totals.cals} kcal`;
    if (DOM.currentBowlPrice)   DOM.currentBowlPrice.textContent   = `${totals.price.toFixed(2)}€`;

    updateStickyBar();
};

const renderLivingBowl = () => {
    if (!DOM.bowlLivingContent) return;
    DOM.bowlLivingContent.querySelectorAll('.living-chip').forEach(c => c.remove());
    const items = Object.keys(state.currentBowl).flatMap(id =>
        Array(state.currentBowl[id]).fill(INGREDIENTS_DATA.find(i => i.id === id))
    );
    if (items.length === 0) {
        DOM.emptyBowlPlaceholder.style.display = 'flex';
        DOM.bowlTagsPreview.textContent = 'Nessun ingrediente selezionato';
        return;
    }
    DOM.emptyBowlPlaceholder.style.display = 'none';
    const lg = window.innerWidth >= 1024;
    items.forEach((it, i) => {
        const chip = document.createElement('div');
        chip.className = 'living-chip';
        chip.innerHTML = it.icon;
        chip.title     = it.name;
        const r = lg ? 65 : 30, o = lg ? 95 : 38;
        const a = (i * 360 / items.length) * Math.PI / 180;
        chip.style.left = `${o + r * Math.cos(a)}px`;
        chip.style.top  = `${o + r * Math.sin(a)}px`;
        DOM.bowlLivingContent.appendChild(chip);
    });
    DOM.bowlTagsPreview.textContent = Object.keys(state.currentBowl).map(id => {
        const it = INGREDIENTS_DATA.find(i => i.id === id);
        return `${it.name}${state.currentBowl[id] > 1 ? ` ×${state.currentBowl[id]}` : ''}`;
    }).join(' · ');
};

const updateStickyBar = () => {
    if (!DOM.mainActionBtn) return;
    if (isBowlValid()) {
        DOM.mainActionBtn.disabled    = false;
        DOM.mainActionBtn.textContent = 'Aggiungi al Carrello 🛒';
        DOM.mainActionBtn.onclick     = addCurrentBowlToCart;
        return;
    }
    const next = Object.keys(CATEGORIES_CONFIG).find(c => getCatCount(c) < CATEGORIES_CONFIG[c].min);
    if (next) {
        DOM.mainActionBtn.disabled    = false;
        DOM.mainActionBtn.textContent = `Scegli ${CATEGORIES_CONFIG[next].label}`;
        DOM.mainActionBtn.onclick     = () => {
            state.activeCategory = next;
            renderConfigurator();
            DOM.tabs[next]?.scrollIntoView({ behavior:'smooth', block:'nearest' });
        };
    }
};

/**
 * modifyIngredientQty — FIX #1
 * ─────────────────────────────────────────────────────────────────────────
 * Leggiamo catCount PRIMA di aggiornare lo stato.
 * Dopo l'aggiornamento, newCatCount = catCount + 1.
 * Se newCatCount >= cfg.max → autoAdvance (scatta per max=1, 2, 3 e per
 * qualsiasi categoria, incluso topping che ha min=0).
 *
 * Il vecchio controllo "catConfig.min > 0" escludeva topping e sauce
 * perché hanno min=0. Rimosso intenzionalmente.
 */
const modifyIngredientQty = (id, action) => {
    const it  = INGREDIENTS_DATA.find(i => i.id === id);
    if (!it) return;
    const qty     = state.currentBowl[id] || 0;
    const cfg     = CATEGORIES_CONFIG[it.type];
    const catCount = getCatCount(it.type);  // conta PRIMA dell'aggiornamento

    if (action === 'add' || action === 'increase') {
        if (catCount < cfg.max) {
            state.currentBowl[id] = qty + 1;
            triggerFeedbackBurst();
            const newCount = catCount + 1;
            // FIX #1: autoAdvance scatta quando la categoria raggiunge il max.
            // Guardia: avanziamo solo se siamo già visualizzando questa categoria
            // (evita avanzamenti inattesi navigando da un'altra tab).
            if (newCount >= cfg.max && state.activeCategory === it.type) {
                setTimeout(autoAdvanceCategory, 420);
            }
        }
    } else if (action === 'decrease') {
        if (qty > 1) state.currentBowl[id] = qty - 1;
        else         delete state.currentBowl[id];
    }
    renderConfigurator();
};

const autoAdvanceCategory = () => {
    const seq = Object.keys(CATEGORIES_CONFIG);
    const i   = seq.indexOf(state.activeCategory);
    if (i > -1 && i < seq.length - 1) {
        state.activeCategory = seq[i + 1];
        renderConfigurator();
        DOM.tabs[state.activeCategory]?.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
};

/**
 * loadPreset — FIX #2
 * ─────────────────────────────────────────────────────────────────────────
 * Imposta activeCategory su 'sauce' (ultimo step) PRIMA di chiamare
 * renderConfigurator. In questo modo:
 *   · isBowlValid() = true (preset include base + protein, min soddisfatti)
 *   · computeProgressBar() → pct=100, cls=emerald
 *   · La barra diventa verde 100% immediatamente, senza ulteriori interazioni.
 */
const loadPreset = (items) => {
    state.currentBowl    = { ...items };
    // FIX #2: impostiamo 'sauce' (ultimo step) PRIMA della navigazione.
    // Così quando navigateTo → renderConfigurator viene chiamato,
    // isBowlValid()=true → computeProgressBar() → 100% verde immediato.
    state.activeCategory = 'sauce';
    navigateTo('configurator');  // internamente chiama renderConfigurator()
    triggerFeedbackBurst();
    // NON richiamiamo renderConfigurator() di nuovo: navigateTo lo fa già.
};


/* ==========================================================================
   8. CART
   ========================================================================== */

const toggleCartDrawer = (open) => {
    const o = typeof open === 'boolean' ? open : DOM.cartDrawer.classList.contains('translate-x-full');
    DOM.cartDrawer.classList.toggle('translate-x-full', !o);
    DOM.cartDrawer.classList.toggle('translate-x-0',     o);
    DOM.cartBackdrop.classList.toggle('opacity-0',            !o);
    DOM.cartBackdrop.classList.toggle('pointer-events-none',  !o);
    DOM.cartDrawer.setAttribute('aria-hidden',   String(!o));
    DOM.cartBackdrop.setAttribute('aria-hidden', String(!o));
};

const renderCart = () => {
    DOM.cartBadge.textContent = state.cart.length;
    if (state.cart.length === 0) {
        DOM.cartItemsContainer.innerHTML = `<p class="text-center text-slate-400 font-medium mt-12 text-sm">🛒 Il tuo carrello è vuoto.<br><span class="text-xs text-slate-300 mt-1 block">Componi una poke per iniziare!</span></p>`;
        DOM.cartTotalPrice.textContent = '0.00€';
        DOM.checkoutBtn.disabled = true;
        return;
    }
    let total = 0;
    DOM.cartItemsContainer.innerHTML = state.cart.map((bowl, i) => {
        const p = Object.keys(bowl).reduce((s, id) => {
            const it = INGREDIENTS_DATA.find(x => x.id === id);
            return s + (it ? it.price * bowl[id] : 0);
        }, 0);
        total += p;
        return CartItemCard(bowl, i);
    }).join('');
    DOM.cartTotalPrice.textContent = `${total.toFixed(2)}€`;
    DOM.checkoutBtn.disabled = false;
};

const addCurrentBowlToCart = () => {
    state.cart.push({ ...state.currentBowl });
    state.currentBowl    = {};
    state.activeCategory = 'base';
    renderConfigurator();
    renderCart();
    toggleCartDrawer(true);
};

const processCheckout = () => {
    toggleCartDrawer(false);
    DOM.checkoutOverlay.classList.remove('opacity-0', 'pointer-events-none');
    DOM.checkoutOverlay.classList.add('active');
    DOM.checkoutOverlay.setAttribute('aria-hidden', 'false');
    if (lottieCheckout) lottieCheckout.goToAndPlay(0, true);
};

/** resetAfterCheckout: salva l'ordine PRIMA di resettare lo stato */
const resetAfterCheckout = () => {
    if (state.cart.length > 0) {
        const total = state.cart.reduce((sum, bowl) =>
            sum + Object.keys(bowl).reduce((s, id) => {
                const it = INGREDIENTS_DATA.find(i => i.id === id);
                return s + (it ? it.price * bowl[id] : 0);
            }, 0), 0);

        state.orderHistory.push({
            bowls:     state.cart.map(b => ({ ...b })),
            total,
            timestamp: new Date().toISOString(),
        });
        persistOrderHistory(state.orderHistory);
    }

    DOM.checkoutOverlay.classList.add('opacity-0', 'pointer-events-none');
    DOM.checkoutOverlay.classList.remove('active');
    DOM.checkoutOverlay.setAttribute('aria-hidden', 'true');

    state.cart           = [];
    state.currentBowl    = {};
    state.activeCategory = 'base';
    renderConfigurator();
    renderCart();
    navigateTo('home');
};


/* ==========================================================================
   9. DASHBOARD
   ========================================================================== */

const renderDashboard = () => {
    const orders = state.orderHistory;
    const rev    = orders.reduce((s, o) => s + o.total, 0);
    const bowls  = orders.reduce((s, o) => s + o.bowls.length, 0);

    if (DOM.kpiRevenue)       DOM.kpiRevenue.textContent       = `${rev.toFixed(2)}€`;
    if (DOM.kpiBowls)         DOM.kpiBowls.textContent         = bowls;
    if (DOM.kpiOrders)        DOM.kpiOrders.textContent        = orders.length;
    if (DOM.ordersCountBadge) DOM.ordersCountBadge.textContent = `${orders.length} ordini`;

    if (!DOM.dashboardOrdersList) return;

    if (orders.length === 0) {
        DOM.dashboardOrdersList.innerHTML = `
            <div class="text-center py-24 text-slate-400">
                <div class="text-7xl mb-5 opacity-30">📭</div>
                <p class="font-bold text-lg text-slate-500">Nessun ordine ancora.</p>
                <p class="text-sm mt-2">Completa il tuo primo checkout per vedere i dati qui.</p>
                <button data-page="configurator" class="nav-link mt-6 inline-flex items-center gap-2 bg-brand text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-floating text-sm">Crea la prima Bowl →</button>
            </div>`;
        return;
    }

    // Più recente prima
    DOM.dashboardOrdersList.innerHTML =
        [...orders].reverse().map((o, revIdx) =>
            OrderHistoryCard(o, orders.length - revIdx)
        ).join('');
};

const clearOrderHistory = () => {
    if (!confirm('Eliminare tutto lo storico ordini? L\'operazione è irreversibile.')) return;
    state.orderHistory = [];
    persistOrderHistory([]);
    renderDashboard();
};


/* ==========================================================================
   10. HOME
   ========================================================================== */

const renderHomePage = () => {
    if (DOM.famousPokGrid) DOM.famousPokGrid.innerHTML = PRESETS_DATA.map(FamousPokeCard).join('');
    const chips = PRESETS_DATA.map(PresetChip).join('');
    if (DOM.presetsContainer)       DOM.presetsContainer.innerHTML       = chips;
    if (DOM.presetsContainerMobile) DOM.presetsContainerMobile.innerHTML = chips;
};


/* ==========================================================================
   11. EVENT LISTENERS
   ========================================================================== */

const setupEventListeners = () => {

    // SPA navigation (data-page anywhere)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (link) { e.preventDefault(); navigateTo(link.getAttribute('data-page')); }
    });

    DOM.logoLink.addEventListener('click', (e) => { e.preventDefault(); navigateTo('home'); });
    DOM.mobileMenuBtn.addEventListener('click', () => state.mobileMenuOpen ? closeMobileMenu() : openMobileMenu());

    // Tabs
    Object.keys(DOM.tabs).forEach(cat =>
        DOM.tabs[cat].addEventListener('click', () => { state.activeCategory = cat; renderConfigurator(); })
    );

    // Ingredient grid (delegation)
    DOM.ingredientsGrid.addEventListener('click', (e) => {
        const btn  = e.target.closest('button[data-action]');
        if (!btn) return;
        const card = btn.closest('.ingredient-card');
        if (!card) return;
        modifyIngredientQty(card.getAttribute('data-id'), btn.getAttribute('data-action'));
    });

    // Filters
    DOM.filterVegan.addEventListener('click', function () {
        const was = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', String(!was));
        state.filters.vegan = !was;
        renderConfigurator();
    });
    DOM.filterGf.addEventListener('click', function () {
        const was = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', String(!was));
        state.filters.glutenFree = !was;
        renderConfigurator();
    });

    // Preset chips (navbar)
    const handlePreset = (e) => {
        const b = e.target.closest('.btn-preset');
        if (b) loadPreset(JSON.parse(b.getAttribute('data-preset')));
    };
    DOM.presetsContainer.addEventListener('click', handlePreset);
    DOM.presetsContainerMobile.addEventListener('click', handlePreset);

    // Famous poke grid
    DOM.famousPokGrid.addEventListener('click', (e) => {
        const b = e.target.closest('.btn-load-preset');
        if (b) loadPreset(JSON.parse(b.getAttribute('data-preset')));
    });

    // Cart
    DOM.cartToggleBtn.addEventListener('click',  () => toggleCartDrawer(true));
    DOM.cartCloseBtn.addEventListener('click',   () => toggleCartDrawer(false));
    DOM.cartBackdrop.addEventListener('click',   () => toggleCartDrawer(false));
    DOM.cartItemsContainer.addEventListener('click', (e) => {
        const b = e.target.closest('.btn-remove-item');
        if (!b) return;
        state.cart.splice(parseInt(b.getAttribute('data-index'), 10), 1);
        renderCart();
    });
    DOM.checkoutBtn.addEventListener('click',  processCheckout);
    DOM.closeModalBtn.addEventListener('click', resetAfterCheckout);

    // Contact form
    if (DOM.contactSubmitBtn) {
        DOM.contactSubmitBtn.addEventListener('click', () => {
            DOM.contactSuccessMsg.classList.remove('hidden');
            DOM.contactSubmitBtn.disabled    = true;
            DOM.contactSubmitBtn.textContent = 'Messaggio Inviato ✓';
            setTimeout(() => {
                DOM.contactSuccessMsg.classList.add('hidden');
                DOM.contactSubmitBtn.disabled    = false;
                DOM.contactSubmitBtn.textContent = 'Invia Messaggio ✉️';
            }, 5000);
        });
    }

    // Secret admin link
    DOM.secretAdminLink?.addEventListener('click', () => navigateTo('dashboard'));

    // Dashboard: clear history
    DOM.clearHistoryBtn?.addEventListener('click', clearOrderHistory);

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!DOM.cartDrawer.classList.contains('translate-x-full')) toggleCartDrawer(false);
            if (state.mobileMenuOpen) closeMobileMenu();
        }
    });
};


/* ==========================================================================
   12. INIT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    initAnimations();
    renderHomePage();
    renderConfigurator();
    renderCart();
    setupEventListeners();
    navigateTo('home');
});