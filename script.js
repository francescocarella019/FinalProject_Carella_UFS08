/**
 * GastroLab — SPA Engine v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Fix #1  – autoAdvance topping: trigger scatta su newCatCount >= max
 * (funziona per max=1, max=2, max=3 — incluso topping min=0)
 * Fix #2  – loadPreset: imposta activeCategory='sauce' + chiama renderConfigurator
 * → isBowlValid()=true → computeProgressBar() → 100% verde immediato
 * NEW     – state.orderHistory + localStorage, dashboard admin, footer link segreto
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

/* ==========================================================================
   1. DATA
   ========================================================================== */

const INGREDIENTS_DATA = [
    { id: 'b1', name: 'Riso Bianco',    type: 'base',    price: 2.00, cals: 150, carbs: 33, protein: 2.5, fat: 0.3, icon: '🍚', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop&q=80' },
    { id: 'b2', name: 'Quinoa',         type: 'base',    price: 3.00, cals: 120, carbs: 21, protein: 4.0, fat: 2.0, icon: '🌾', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80' },
    { id: 'b3', name: 'Riso Integrale', type: 'base',    price: 2.50, cals: 130, carbs: 27, protein: 3.0, fat: 1.0, icon: '🟤', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&q=80' },
    { id: 'p1', name: 'Salmone',        type: 'protein', price: 5.00, cals: 200, carbs:  0, protein:22.0, fat:10.0, icon: '🐟', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&q=80' },
    { id: 'p2', name: 'Tonno',          type: 'protein', price: 6.00, cals: 180, carbs:  0, protein:28.0, fat: 5.0, icon: '🥩', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&h=300&fit=crop&q=80' },
    { id: 'p3', name: 'Tofu',           type: 'protein', price: 4.00, cals: 100, carbs:  2, protein:10.0, fat: 5.0, icon: '🟩', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop&q=80' },
    { id: 't1', name: 'Avocado',        type: 'topping', price: 1.50, cals:  80, carbs:  4, protein: 1.0, fat: 8.0, icon: '🥑', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop&q=80' },
    { id: 't2', name: 'Edamame',        type: 'topping', price: 1.00, cals:  50, carbs:  4, protein: 5.0, fat: 2.0, icon: '🫛', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop&q=80' },
    { id: 't3', name: 'Alga Wakame',    type: 'topping', price: 1.00, cals:  30, carbs:  3, protein: 2.0, fat: 0.5, icon: '🌿', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&h=300&fit=crop&q=80' },
    { id: 't4', name: 'Cetriolo',       type: 'topping', price: 0.80, cals:  15, carbs:  3, protein: 0.5, fat: 0.1, icon: '🥒', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=300&fit=crop&q=80' },
    { id: 't5', name: 'Mango',          type: 'topping', price: 1.20, cals:  60, carbs: 15, protein: 0.5, fat: 0.3, icon: '🥭', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&q=80' },
    { id: 't6', name: 'Sesamo Tostato', type: 'topping', price: 0.50, cals:  25, carbs:  1, protein: 1.5, fat: 2.0, icon: '🌰', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=300&fit=crop&q=80' },
    { id: 's1', name: 'Teriyaki',       type: 'sauce',   price: 0.00, cals:  50, carbs: 11, protein: 0.5, fat: 0.0, icon: '🍯', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1682482003091-d7d6427041fa?w=400&h=300&fit=crop&q=80' },
    { id: 's2', name: 'Spicy Mayo',     type: 'sauce',   price: 0.00, cals:  80, carbs:  1, protein: 0.5, fat: 8.0, icon: '🌶️', isVegan: false, isGlutenFree: true,  img: 'https://media.istockphoto.com/id/1195877732/photo/tasty-burger-sauce-in-bowl-isolated-on-white-background.jpg' },
    { id: 's3', name: 'Ponzu',          type: 'sauce',   price: 0.00, cals:  35, carbs:  7, protein: 0.5, fat: 0.0, icon: '🍋', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop&q=80' },
];

const CATEGORIES_CONFIG = {
    base: { label: 'Base', instruction: 'Scegli la tua Base (Max 1)', max: 1, min: 1, step: 1 },
    protein: { label: 'Proteine', instruction: 'Aggiungi le tue Proteine (Fino a 2)', max: 2, min: 1, step: 2 },
    topping: { label: 'Topping', instruction: 'Arricchisci con i Topping (Fino a 3)', max: 3, min: 0, step: 3 },
    sauce: { label: 'Salse', instruction: 'Completa con le Salse (Fino a 2)', max: 2, min: 0, step: 4 },
};

const PRESETS_DATA = [
    { name: 'La Vaporiera', description: 'Il grande classico. Riso, salmone, avocado e salsa teriyaki.', items: { b1: 1, p1: 1, t1: 1, s1: 1 }, price: '8.50€', cals: '480 kcal', tag: 'Bestseller', tagColor: 'bg-amber-400 text-amber-900', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80' },
    { name: 'Il Prato', description: 'Quinoa, tofu, edamame e teriyaki. 100% plant-based.', items: { b2: 1, p3: 1, t2: 1, s1: 1 }, price: '8.00€', cals: '320 kcal', tag: 'Vegan', tagColor: 'bg-emerald-400 text-emerald-900', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80' },
    { name: 'La Bomba', description: 'Riso bianco, tonno, alga wakame e spicy mayo per i coraggiosi.', items: { b1: 1, p2: 1, t3: 1, s2: 1 }, price: '9.00€', cals: '460 kcal', tag: 'Piccante', tagColor: 'bg-red-400 text-red-900', img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=400&fit=crop&q=80' },
];


/* ==========================================================================
   2. STATE
   ========================================================================== */

const loadOrderHistory = () => {
    try { const r = localStorage.getItem('gl_orders'); return r ? JSON.parse(r) : []; } catch { return []; }
};
const persistOrderHistory = (h) => {
    try { localStorage.setItem('gl_orders', JSON.stringify(h)); } catch { }
};

const state = {
    currentPage: 'home',
    cart: [],
    currentBowl: {},
    activeCategory: 'base',
    filters: { vegan: false, glutenFree: false },
    searchQuery: '',
    mobileMenuOpen: false,
    orderHistory: loadOrderHistory(),
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
            home: document.getElementById('page-home'),
            configurator: document.getElementById('page-configurator'),
            about: document.getElementById('page-about'),
            contact: document.getElementById('page-contact'),
            dashboard: document.getElementById('page-dashboard'),
        },
        logoLink: document.getElementById('logo-link'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        hamburgerIcon: document.getElementById('hamburger-icon'),
        presetsContainer: document.getElementById('presets-container'),
        presetsContainerMobile: document.getElementById('presets-container-mobile'),
        famousPokGrid: document.getElementById('famous-poke-grid'),
        bowlLivingContent: document.getElementById('bowl-living-content'),
        emptyBowlPlaceholder: document.getElementById('empty-bowl-placeholder'),
        bowlTagsPreview: document.getElementById('bowl-tags-preview'),
        totalCaloriesBadge: document.getElementById('total-calories-badge'),
        currentBowlPrice: document.getElementById('current-bowl-price'),
        categoryInstruction: document.getElementById('category-instruction'),
        stepCounter: document.getElementById('step-counter'),
        ingredientsGrid: document.getElementById('ingredients-grid'),
        mainActionBtn: document.getElementById('main-action-btn'),
        filterVegan: document.getElementById('filter-vegan'),
        filterGf: document.getElementById('filter-gf'),
        progressBar: document.getElementById('main-progress-bar'),
        lottieFeedbackContainer: document.getElementById('lottie-feedback-container'),
        lottieCheckoutContainer: document.getElementById('lottie-checkout-container'),
        checkoutOverlay: document.getElementById('checkout-overlay'),
        checkoutModal: document.getElementById('checkout-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        cartToggleBtn: document.getElementById('cart-toggle-btn'),
        cartBadge: document.getElementById('cart-badge'),
        cartDrawer: document.getElementById('cart-drawer'),
        cartBackdrop: document.getElementById('cart-backdrop'),
        cartCloseBtn: document.getElementById('cart-close-btn'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartTotalPrice: document.getElementById('cart-total-price'),
        checkoutBtn: document.getElementById('checkout-btn'),
        tabs: {
            base: document.getElementById('tab-base'),
            protein: document.getElementById('tab-protein'),
            topping: document.getElementById('tab-topping'),
            sauce: document.getElementById('tab-sauce'),
        },
        statuses: {
            base: document.getElementById('status-base'),
            protein: document.getElementById('status-protein'),
            topping: document.getElementById('status-topping'),
            sauce: document.getElementById('status-sauce'),
        },
        ingredientSearch: document.getElementById('ingredient-search'),
        macroBars: document.getElementById('macro-bars'),
        contactSubmitBtn: document.getElementById('contact-submit-btn'),
        contactSuccessMsg: document.getElementById('contact-success-msg'),
        secretAdminLink: document.getElementById('secret-admin-link'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),
        kpiRevenue: document.getElementById('kpi-revenue'),
        kpiBowls: document.getElementById('kpi-bowls'),
        kpiOrders: document.getElementById('kpi-orders'),
        ordersCountBadge: document.getElementById('orders-count-badge'),
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
    if (page === 'dashboard') renderDashboard();
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
    const sel = qty > 0;
    const borderCls = sel
        ? 'border-brand shadow-md'
        : 'border-transparent hover:border-slate-200 hover:shadow-sm';
    return `
<article class="ingredient-card group bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${borderCls}" data-id="${item.id}"> <div class="relative overflow-hidden" style="height:128px">
                <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy">
                ${sel ? `
                <div class="absolute inset-0 bg-brand/30 flex items-center justify-center">
                    <div class="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                </div>` : ''}
                <div class="absolute top-2 left-2 flex gap-1">
                    ${item.isVegan ? `<span class="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">Vegan</span>` : ''}
                    ${item.isGlutenFree ? `<span class="bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">GF</span>` : ''}
                </div>
                ${qty > 1 ? `<span class="absolute top-2 right-2 bg-brand text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow">×${qty}</span>` : ''}
            </div>
            <div class="p-3">
                <h4 class="font-bold text-slate-900 text-sm leading-tight mb-1.5">${item.name}</h4>
                <div class="flex items-center justify-between mb-3">
                    <span class="text-brand font-black text-sm">${item.price > 0 ? `+${item.price.toFixed(2)}€` : 'Inclusa'}</span>
                    <span class="text-slate-400 text-[11px] font-medium">${item.cals} kcal</span>
                </div>
                ${!sel
            ? `<button type="button" class="w-full bg-slate-900 hover:bg-brand text-white text-xs font-bold py-2 rounded-xl transition-colors duration-150 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed" data-action="add" ${maxReached ? 'disabled' : ''}>${maxReached ? 'Limite raggiunto' : '+ Aggiungi'}</button>`
            : `<div class="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-8">
                            <button type="button" class="w-9 h-full text-slate-600 font-bold hover:bg-red-50 hover:text-red-500 transition-colors" data-action="decrease">−</button>
                            <span class="text-sm font-bold text-slate-900">${qty}</span>
                            <button type="button" class="w-9 h-full text-slate-600 font-bold hover:bg-brand hover:text-white transition-colors disabled:opacity-30" data-action="increase" ${maxReached ? 'disabled' : ''}>+</button>
                       </div>`
        }
            </div>
        </article>`;
};

const FamousPokeCard = (p) => `
    <div class="poke-preset-card bg-white rounded-3xl border border-slate-200 overflow-hidden group">
        <div class="relative h-48 overflow-hidden">
            <img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent"></div>
            <span class="absolute top-4 left-4 ${p.tagColor} text-xs font-black px-3 py-1 rounded-full shadow">${p.tag}</span>
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

// Cambiate le classi grafiche esclusivamente in questo componente (Stile Shadcn Minimal Geometrico)
const PresetChip = (p) => `
    <button type="button" class="btn-preset bg-white hover:bg-zinc-100 border border-zinc-200 hover:border-black text-zinc-900 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap shadow-sm cursor-pointer" data-preset='${JSON.stringify(p.items)}'>${p.name}</button>`;

const CartItemCard = (bowl, idx) => {
    let price = 0;
    const desc = Object.keys(bowl).map(id => {
        const it = INGREDIENTS_DATA.find(i => i.id === id);
        if (!it) return '';
        price += it.price * bowl[id];
        return `${it.name}${bowl[id] > 1 ? ` ×${bowl[id]}` : ''}`;
    }).join(' · ');
    return `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 relative shadow-sm">
            <button class="absolute top-3 right-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white w-7 h-7 rounded-lg text-sm font-bold transition-colors flex items-center justify-center btn-remove-item" data-index="${idx}" aria-label="Rimuovi poke ${idx + 1}">×</button>
            <div class="font-bold text-slate-800 text-sm mb-1 pr-8">Poke Personalizzata #${idx + 1}</div>
            <div class="text-xs text-slate-500 mb-2 leading-relaxed">${desc}</div>
            <div class="font-black text-brand text-lg">${price.toFixed(2)}€</div>
        </div>`;
};

const OrderHistoryCard = (order, orderNumber) => {
    const d = new Date(order.timestamp);
    const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    const num = String(orderNumber).padStart(3, '0');

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
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Bowl #${bIdx + 1}</span>
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
    const seq = Object.keys(CATEGORIES_CONFIG);
    const idx = seq.indexOf(state.activeCategory);
    const valid = isBowlValid();
    const pct = valid ? 100 : Math.round(((idx + 1) / seq.length) * 100);
    return {
        pct,
        cls: valid
            ? 'h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out'
            : 'h-full bg-brand rounded-full transition-all duration-500 ease-out',
    };
};

const renderConfigurator = () => {
    if (!DOM.ingredientsGrid) return;

    const cfg = CATEGORIES_CONFIG[state.activeCategory];
    const count = getCatCount(state.activeCategory);
    const maxed = count >= cfg.max;
    const seq = Object.keys(CATEGORIES_CONFIG);
    const idx = seq.indexOf(state.activeCategory);

    // Instruction + counter
    if (DOM.categoryInstruction) DOM.categoryInstruction.textContent = cfg.instruction;
    if (DOM.stepCounter) DOM.stepCounter.textContent = `${idx + 1} / ${seq.length}`;

    // Grid
    let items = INGREDIENTS_DATA.filter(i => i.type === state.activeCategory);
    if (state.filters.vegan) items = items.filter(i => i.isVegan);
    if (state.filters.glutenFree) items = items.filter(i => i.isGlutenFree);
    if (state.searchQuery) items = items.filter(i => i.name.toLowerCase().includes(state.searchQuery.toLowerCase()));

    DOM.ingredientsGrid.innerHTML = items.length === 0
        ? `<p class="col-span-2 lg:col-span-3 text-center text-slate-500 font-medium py-10">Nessun ingrediente trovato con i filtri attivi.</p>`
        : items.map(i => IngredientSelectorCard(i, state.currentBowl[i.id] || 0, maxed)).join('');

    // Tabs + badges
    seq.forEach(cat => {
        const c = getCatCount(cat);
        if (DOM.tabs[cat]) DOM.tabs[cat].classList.toggle('active', cat === state.activeCategory);
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
        const q = state.currentBowl[id];
        return {
            price:   acc.price   + it.price   * q,
            cals:    acc.cals    + it.cals    * q,
            carbs:   acc.carbs   + it.carbs   * q,
            protein: acc.protein + it.protein * q,
            fat:     acc.fat     + it.fat     * q,
        };
    }, { price: 0, cals: 0, carbs: 0, protein: 0, fat: 0 });
    if (DOM.totalCaloriesBadge) DOM.totalCaloriesBadge.textContent = `${Math.round(totals.cals)} kcal`;
    if (DOM.currentBowlPrice) DOM.currentBowlPrice.textContent = `${totals.price.toFixed(2)}€`;
    renderMacroBars(totals);

    updateStickyBar();
};

const renderMacroBars = ({ carbs, protein, fat }) => {
    if (!DOM.macroBars) return;
    const total = carbs + protein + fat;
    if (total === 0) { DOM.macroBars.classList.add('hidden'); return; }
    DOM.macroBars.classList.remove('hidden');
    const pct = (v) => Math.round((v / total) * 100);
    const MacroRow = (label, value, pctVal, color) => `
        <div class="flex items-center gap-3">
            <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400 w-14 shrink-0">${label}</span>
            <div class="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div class="h-full ${color} rounded-full transition-all duration-500" style="width:${pctVal}%"></div>
            </div>
            <span class="text-[10px] font-mono text-zinc-500 w-10 text-right shrink-0">${value.toFixed(1)}g</span>
        </div>`;
    DOM.macroBars.innerHTML =
        `<p class="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400 mb-1">Macronutrienti</p>` +
        MacroRow('Carb', carbs, pct(carbs), 'bg-amber-400') +
        MacroRow('Prot', protein, pct(protein), 'bg-zinc-800') +
        MacroRow('Grassi', fat, pct(fat), 'bg-zinc-400');
};

/* ── SVG icons (monochrome, stroke-based) per ogni ingrediente ── */
const INGREDIENT_ICONS = {
    b1: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 14h18a9 9 0 0 1-18 0ZM8 14V9a4 4 0 0 1 8 0v5"/>',
    b2: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1.5 3-2 6-2 9s.5 6 2 9c1.5-3 2-6 2-9s-.5-6-2-9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 8c1.5 1 3 1.5 5 1.5S16 9 17.5 8M7 16c1.5-1 3-1.5 5-1.5s4.5.5 5.5 1.5"/>',
    b3: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 14h18a9 9 0 0 1-18 0ZM8 14V9a4 4 0 0 1 8 0v5"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 11h6"/>',
    p1: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 12c-2-3.5-5.5-6-9-6S4 8.5 2 12c2 3.5 5.5 6 9 6s7-2.5 9-6Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.5 22 12l-2.5 3.5"/>',
    p2: '<path stroke-linecap="round" stroke-linejoin="round" d="M20 12c-1.5-3-5-5.5-8-5.5S5 9 3.5 12c1.5 3 5 5.5 8 5.5s6.5-2.5 8-5.5Z"/><circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
    p3: '<rect x="4" y="7" width="16" height="10" rx="1.5" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M4 11h16M10 7v10"/>',
    t1: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-1 3-4.5 5-4.5 9a4.5 4.5 0 0 0 9 0c0-4-3.5-6-4.5-9Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.5 12.5A2.5 2.5 0 0 0 12 15"/>',
    t2: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12c0-4 3-7 7-7s7 3 7 7c0 3-2 5.5-4.5 6.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 15c1-3.5 5-3.5 6 0"/>',
    t3: '<path stroke-linecap="round" stroke-linejoin="round" d="M17 8C8 10 5.9 16.17 3.82 22"/><path stroke-linecap="round" stroke-linejoin="round" d="M9.23 8C9.23 8 14 8 18 11c4 3 4 7 4 7"/>',
    t4: '<ellipse cx="12" cy="12" rx="4" ry="9" stroke-linecap="round" stroke-linejoin="round"/><path stroke-linecap="round" stroke-linejoin="round" d="M8 9h8M8 15h8"/>',
    t5: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c-2 3.5-2 7 0 10 2-3 2-6.5 0-10Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 13c-2 3-5 5-5 8h10c0-3-3-5-5-8Z"/>',
    t6: '<circle cx="9" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="15" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="6" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="1.5" fill="currentColor" stroke="none"/>',
    s1: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3.5-6S12 3 12 3s-1.5 3.5-3.5 6S5 11.5 5 14a7 7 0 0 0 7 7Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M10 16a2 2 0 0 0 4 0"/>',
    s2: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3.5-6S12 3 12 3s-1.5 3.5-3.5 6S5 11.5 5 14a7 7 0 0 0 7 7Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 14c.5-1 1.5-1.5 3-1.5"/>',
    s3: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a7 7 0 0 0 7-7c0-2.5-1.5-4.5-3.5-6S12 3 12 3s-1.5 3.5-3.5 6S5 11.5 5 14a7 7 0 0 0 7 7Z"/><line stroke-linecap="round" x1="9" y1="17" x2="15" y2="17"/>',
};

const TYPE_LABELS = { base: 'Base', protein: 'Proteina', topping: 'Topping', sauce: 'Salsa' };

const renderLivingBowl = () => {
    if (!DOM.bowlLivingContent) return;

    const items = Object.keys(state.currentBowl).map(id => ({
        qty: state.currentBowl[id],
        data: INGREDIENTS_DATA.find(i => i.id === id),
    })).filter(item => item.data !== undefined);

    const isEmpty = items.length === 0;
    DOM.emptyBowlPlaceholder.classList.toggle('hidden', !isEmpty);
    DOM.bowlLivingContent.classList.toggle('hidden', isEmpty);
    DOM.bowlLivingContent.classList.toggle('flex', !isEmpty);

    if (isEmpty) { DOM.bowlLivingContent.innerHTML = ''; return; }

    DOM.bowlLivingContent.innerHTML = items.map(item => {
        const icon  = INGREDIENT_ICONS[item.data.id] || '';
        const label = TYPE_LABELS[item.data.type] || item.data.type;
        const priceStr = item.data.price > 0
            ? ` · <span class="font-mono">+${(item.data.price * item.qty).toFixed(2)}€</span>`
            : ` · <span class="font-mono text-zinc-300">Inclusa</span>`;
        return `
        <div class="group flex items-center gap-3.5 py-3 first:pt-1 last:pb-1 cursor-default">
            <div class="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 relative">
                <svg class="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">${icon}</svg>
                ${item.qty > 1 ? `<span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-zinc-950 text-white text-[9px] font-bold font-mono flex items-center justify-center leading-none">${item.qty}</span>` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-medium text-zinc-900 leading-tight truncate">${item.data.name}</span>
                    <span class="shrink-0 text-[10px] bg-zinc-100 text-zinc-500 px-2 py-px rounded-full font-medium leading-tight">${label}</span>
                </div>
                <p class="text-[11px] text-zinc-400 leading-tight">${item.data.cals * item.qty} kcal${priceStr}</p>
            </div>
            <button type="button"
                class="btn-remove-ingredient shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-950 hover:text-white transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                data-remove-id="${item.data.id}"
                aria-label="Rimuovi ${item.data.name}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>
            </button>
        </div>`;
    }).join('');

    if (DOM.bowlTagsPreview) DOM.bowlTagsPreview.textContent = items.map(i => `${i.data.name} (×${i.qty})`).join(' · ');
};

const updateStickyBar = () => {
    if (!DOM.mainActionBtn) return;
    if (isBowlValid()) {
        DOM.mainActionBtn.disabled = false;
        DOM.mainActionBtn.textContent = 'Aggiungi al Carrello 🛒';
        DOM.mainActionBtn.onclick = addCurrentBowlToCart;
        return;
    }
    const next = Object.keys(CATEGORIES_CONFIG).find(c => getCatCount(c) < CATEGORIES_CONFIG[c].min);
    if (next) {
        DOM.mainActionBtn.disabled = false;
        DOM.mainActionBtn.textContent = `Scegli ${CATEGORIES_CONFIG[next].label}`;
        DOM.mainActionBtn.onclick = () => {
            state.activeCategory = next;
            renderConfigurator();
            DOM.tabs[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    const it = INGREDIENTS_DATA.find(i => i.id === id);
    if (!it) return;
    const qty = state.currentBowl[id] || 0;
    const cfg = CATEGORIES_CONFIG[it.type];
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
        else delete state.currentBowl[id];
    }
    renderConfigurator();
};

const autoAdvanceCategory = () => {
    const seq = Object.keys(CATEGORIES_CONFIG);
    const i = seq.indexOf(state.activeCategory);
    if (i > -1 && i < seq.length - 1) {
        state.activeCategory = seq[i + 1];
        renderConfigurator();
        DOM.tabs[state.activeCategory]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

/**
 * loadPreset — FIX #2
 * ─────────────────────────────────────────────────────────────────────────
 * Imposta activeCategory su 'sauce' (ultimo step) PRIMA di chiamare
 * renderConfigurator. In questo modo:
 * · isBowlValid() = true (preset include base + protein, min soddisfatti)
 * · computeProgressBar() → pct=100, cls=emerald
 * · La barra diventa verde 100% immediatamente, senza ulteriori interazioni.
 */
const loadPreset = (items) => {
    state.currentBowl = { ...items };
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
    DOM.cartDrawer.classList.toggle('translate-x-0', o);
    DOM.cartBackdrop.classList.toggle('opacity-0', !o);
    DOM.cartBackdrop.classList.toggle('pointer-events-none', !o);
    DOM.cartDrawer.setAttribute('aria-hidden', String(!o));
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
    state.currentBowl = {};
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
            bowls: state.cart.map(b => ({ ...b })),
            total,
            timestamp: new Date().toISOString(),
        });
        persistOrderHistory(state.orderHistory);
    }

    DOM.checkoutOverlay.classList.add('opacity-0', 'pointer-events-none');
    DOM.checkoutOverlay.classList.remove('active');
    DOM.checkoutOverlay.setAttribute('aria-hidden', 'true');

    state.cart = [];
    state.currentBowl = {};
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
    const rev = orders.reduce((s, o) => s + o.total, 0);
    const bowls = orders.reduce((s, o) => s + o.bowls.length, 0);

    if (DOM.kpiRevenue) DOM.kpiRevenue.textContent = `${rev.toFixed(2)}€`;
    if (DOM.kpiBowls) DOM.kpiBowls.textContent = bowls;
    if (DOM.kpiOrders) DOM.kpiOrders.textContent = orders.length;
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
    if (DOM.presetsContainer) DOM.presetsContainer.innerHTML = chips;
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
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const card = btn.closest('.ingredient-card');
        if (!card) return;
        modifyIngredientQty(card.getAttribute('data-id'), btn.getAttribute('data-action'));
    });

    // Ingredient search
    if (DOM.ingredientSearch) {
        DOM.ingredientSearch.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            renderConfigurator();
        });
    }

    // Remove ingredient from living bowl (delegation on bowlLivingContent)
    if (DOM.bowlLivingContent) {
        DOM.bowlLivingContent.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-remove-ingredient');
            if (!btn) return;
            const id = btn.getAttribute('data-remove-id');
            delete state.currentBowl[id];
            renderConfigurator();
        });
    }

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
    DOM.cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    DOM.cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
    DOM.cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));
    DOM.cartItemsContainer.addEventListener('click', (e) => {
        const b = e.target.closest('.btn-remove-item');
        if (!b) return;
        state.cart.splice(parseInt(b.getAttribute('data-index'), 10), 1);
        renderCart();
    });
    DOM.checkoutBtn.addEventListener('click', processCheckout);
    DOM.closeModalBtn.addEventListener('click', resetAfterCheckout);

    // Contact form
    if (DOM.contactSubmitBtn) {
        DOM.contactSubmitBtn.addEventListener('click', () => {
            DOM.contactSuccessMsg.classList.remove('hidden');
            DOM.contactSubmitBtn.disabled = true;
            DOM.contactSubmitBtn.textContent = 'Messaggio Inviato ✓';
            setTimeout(() => {
                DOM.contactSuccessMsg.classList.add('hidden');
                DOM.contactSubmitBtn.disabled = false;
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
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins", "sans-serif"],
                accent: ["Poppins", "sans-serif"], // Virato su ultra-clean minimal geometrico
            },
            colors: {
                // Rimappatura dei vecchi hook colore dello script JS verso l'estetica premium ad alto contrasto
                brand: "#000000",          // Nero pieno al posto dell'arancione per pulsanti e scritte principali
                brandHover: "#27272a",     // Zinc-800 per gli stati hover
                brandLight: "#f4f4f5",     // Zinc-100 per gli sfondi attivi o hover leggeri
                brandDark: "#000000",      // Nero assoluto
            },
            boxShadow: {
                "delivery": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "card": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
                "floating": "0 10px 30px -10px rgba(0,0,0,0.1)",
            },
            borderRadius: {
                "3xl": "0.75rem", // Angoli retti o leggermente arrotondati (Stile Shadcn moderno)
                "2xl": "0.5rem",
                "xl": "0.375rem",
            }
        }
    }
}