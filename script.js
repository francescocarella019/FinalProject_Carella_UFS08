/**
 * GastroLab — SPA Engine
 * Architettura: State → Data → Render → Events
 * Funzionalità: SPA Router, Configuratore Wizard, Carrello, Lottie, Presets
 */

'use strict';

/* ==========================================================================
   1. DATA CONFIGURATION
   ========================================================================== */

const INGREDIENTS_DATA = [
    { id: 'b1', name: 'Riso Bianco',   type: 'base',    price: 2.00, cals: 150, icon: '🍚', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&auto=format&fit=crop&q=60' },
    { id: 'b2', name: 'Quinoa',        type: 'base',    price: 3.00, cals: 120, icon: '🌾', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60' },
    { id: 'p1', name: 'Salmone',       type: 'protein', price: 5.00, cals: 200, icon: '🐟', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&auto=format&fit=crop&q=60' },
    { id: 'p2', name: 'Tonno',         type: 'protein', price: 6.00, cals: 180, icon: '🥩', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=300&auto=format&fit=crop&q=60' },
    { id: 'p3', name: 'Tofu',          type: 'protein', price: 4.00, cals: 100, icon: '🟩', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1584984241774-67d710bf365f?w=300&auto=format&fit=crop&q=60' },
    { id: 't1', name: 'Avocado',       type: 'topping', price: 1.50, cals: 80,  icon: '🥑', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=60' },
    { id: 't2', name: 'Edamame',       type: 'topping', price: 1.00, cals: 50,  icon: '🫛', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id: 't3', name: 'Alga Wakame',   type: 'topping', price: 1.00, cals: 30,  icon: '🌿', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id: 's1', name: 'Teriyaki',      type: 'sauce',   price: 0.00, cals: 50,  icon: '🍯', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1605721160676-e1e3532c1eb3?w=300&auto=format&fit=crop&q=60' },
    { id: 's2', name: 'Spicy Mayo',    type: 'sauce',   price: 0.00, cals: 80,  icon: '🌶️', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1592518428581-22485590cb78?w=300&auto=format&fit=crop&q=60' },
];

const CATEGORIES_CONFIG = {
    base:    { label: 'Base',     instruction: 'Scegli la tua Base (Max 1)',             max: 1, min: 1, icon: '🍚', step: 1 },
    protein: { label: 'Proteine', instruction: 'Aggiungi le tue Proteine (Fino a 2)',    max: 2, min: 1, icon: '🥩', step: 2 },
    topping: { label: 'Topping',  instruction: 'Arricchisci con i Topping (Fino a 3)',  max: 3, min: 0, icon: '🥑', step: 3 },
    sauce:   { label: 'Salse',    instruction: 'Completa con le Salse (Fino a 2)',       max: 2, min: 0, icon: '🍯', step: 4 },
};

const PRESETS_DATA = [
    {
        name: '🏆 Classic Salmon',
        description: 'Il grande classico. Riso, salmone, avocado e salsa teriyaki.',
        items: { b1: 1, p1: 1, t1: 1, s1: 1 },
        price: '8.50€',
        cals: '480 kcal',
        tag: 'Bestseller',
        tagColor: 'bg-amber-400 text-amber-900',
    },
    {
        name: '🍃 Green Vegan',
        description: 'Quinoa, tofu, edamame e teriyaki. 100% plant-based.',
        items: { b2: 1, p3: 1, t2: 1, s1: 1 },
        price: '8.00€',
        cals: '320 kcal',
        tag: 'Vegan',
        tagColor: 'bg-emerald-400 text-emerald-900',
    },
    {
        name: '🌶️ Spicy Tuna',
        description: 'Riso bianco, tonno, alga wakame e spicy mayo per i coraggiosi.',
        items: { b1: 1, p2: 1, t3: 1, s2: 1 },
        price: '9.00€',
        cals: '460 kcal',
        tag: 'Piccante',
        tagColor: 'bg-red-400 text-red-900',
    },
];


/* ==========================================================================
   2. APPLICATION STATE
   ========================================================================== */

const state = {
    currentPage: 'home',      // SPA page routing
    cart: [],                  // Array of bowl objects
    currentBowl: {},           // { ingredientId: qty }
    activeCategory: 'base',    // Wizard step
    filters: { vegan: false, glutenFree: false },
    mobileMenuOpen: false,
};


/* ==========================================================================
   3. DOM CACHE
   ========================================================================== */

let DOM = {};
let lottieFeedback = null;
let lottieCheckout = null;

const cacheDOMElements = () => {
    DOM = {
        // Pages
        pages: {
            home:         document.getElementById('page-home'),
            configurator: document.getElementById('page-configurator'),
            about:        document.getElementById('page-about'),
            contact:      document.getElementById('page-contact'),
        },

        // Nav
        navLinks:      document.querySelectorAll('.nav-link[data-page]'),
        logoLink:      document.getElementById('logo-link'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        mobileMenu:    document.getElementById('mobile-menu'),
        hamburgerIcon: document.getElementById('hamburger-icon'),

        // Presets (desktop + mobile)
        presetsContainer:       document.getElementById('presets-container'),
        presetsContainerMobile: document.getElementById('presets-container-mobile'),

        // Famous poke grid (Home)
        famousPokGrid: document.getElementById('famous-poke-grid'),

        // Configurator
        bowlLivingContent:       document.getElementById('bowl-living-content'),
        emptyBowlPlaceholder:    document.getElementById('empty-bowl-placeholder'),
        bowlTagsPreview:         document.getElementById('bowl-tags-preview'),
        totalCaloriesBadge:      document.getElementById('total-calories-badge'),
        currentBowlPrice:        document.getElementById('current-bowl-price'),
        categoryInstruction:     document.getElementById('category-instruction'),
        stepCounter:             document.getElementById('step-counter'),
        ingredientsGrid:         document.getElementById('ingredients-grid'),
        mainActionBtn:           document.getElementById('main-action-btn'),
        filterVegan:             document.getElementById('filter-vegan'),
        filterGf:                document.getElementById('filter-gf'),
        progressBar:             document.getElementById('main-progress-bar'),

        // Lottie
        lottieFeedbackContainer: document.getElementById('lottie-feedback-container'),
        lottieCheckoutContainer: document.getElementById('lottie-checkout-container'),

        // Checkout overlay
        checkoutOverlay: document.getElementById('checkout-overlay'),
        checkoutModal:   document.getElementById('checkout-modal'),
        closeModalBtn:   document.getElementById('close-modal-btn'),

        // Cart Drawer
        cartToggleBtn:     document.getElementById('cart-toggle-btn'),
        cartBadge:         document.getElementById('cart-badge'),
        cartDrawer:        document.getElementById('cart-drawer'),
        cartBackdrop:      document.getElementById('cart-backdrop'),
        cartCloseBtn:      document.getElementById('cart-close-btn'),
        cartItemsContainer:document.getElementById('cart-items-container'),
        cartTotalPrice:    document.getElementById('cart-total-price'),
        checkoutBtn:       document.getElementById('checkout-btn'),

        // Tabs + Statuses
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

        // Contact
        contactSubmitBtn: document.getElementById('contact-submit-btn'),
        contactSuccessMsg: document.getElementById('contact-success-msg'),
    };
};


/* ==========================================================================
   4. ANIMATIONS
   ========================================================================== */

const initAnimations = () => {
    // Feedback burst (add-to-bowl effect)
    if (DOM.lottieFeedbackContainer) {
        lottieFeedback = lottie.loadAnimation({
            container: DOM.lottieFeedbackContainer,
            renderer:  'svg',
            loop:      false,
            autoplay:  false,
            path:      'https://fonts.gstatic.com/s/a/666c5d95d9be25350fa67f13df7ad6b92a40fbbfdfba1519d08e2f099146ef94.json',
        });
    }

    // Checkout success animation
    if (DOM.lottieCheckoutContainer) {
        lottieCheckout = lottie.loadAnimation({
            container: DOM.lottieCheckoutContainer,
            renderer:  'svg',
            loop:      false,
            autoplay:  false,
            path:      'Add_to_cart.json',
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

    // Show/hide pages
    Object.keys(DOM.pages).forEach(key => {
        const el = DOM.pages[key];
        if (key === page) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Update nav link active states
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const isActive = link.getAttribute('data-page') === page;
        link.classList.toggle('active', isActive);
    });

    // Close mobile menu if open
    if (state.mobileMenuOpen) closeMobileMenu();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If entering configurator, re-render to ensure DOM is fresh
    if (page === 'configurator') {
        renderConfigurator();
    }
};

const closeMobileMenu = () => {
    state.mobileMenuOpen = false;
    DOM.mobileMenu.classList.add('hidden');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    DOM.hamburgerIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"/>`;
};

const openMobileMenu = () => {
    state.mobileMenuOpen = true;
    DOM.mobileMenu.classList.remove('hidden');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', 'true');
    DOM.hamburgerIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>`;
};


/* ==========================================================================
   6. TEMPLATE COMPONENTS
   ========================================================================== */

const IngredientSelectorCard = (item, currentQty, maxReached) => {
    const isSelected  = currentQty > 0;
    const allergenLabel = item.isVegan ? 'Vegan' : (item.isGlutenFree ? 'GF' : '');
    const borderBg   = isSelected
        ? 'border-brand bg-brandLight shadow-md'
        : 'border-slate-200 bg-white hover:border-brand/50 hover:shadow-md';

    return `
        <article class="ingredient-card flex flex-col justify-between p-3 lg:p-4 rounded-2xl border-2 transition-all duration-200 min-h-[160px] lg:min-h-[180px] ${borderBg}" data-id="${item.id}">
            <div class="w-full h-20 rounded-xl overflow-hidden bg-slate-100 relative">
                <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy">
                ${allergenLabel ? `<span class="absolute top-1 right-1 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">${allergenLabel}</span>` : ''}
                ${isSelected ? `<div class="absolute inset-0 bg-brand/10 flex items-center justify-center"><span class="text-brand text-2xl font-black">✓</span></div>` : ''}
            </div>
            <div class="mt-2 flex-1">
                <h4 class="text-sm lg:text-base font-bold text-slate-900 leading-tight">${item.icon} ${item.name}</h4>
                <p class="text-[11px] lg:text-xs font-medium text-slate-500 mt-0.5">+${item.price.toFixed(2)}€ &bull; ${item.cals} kcal</p>
            </div>
            <div class="mt-3">
                ${!isSelected ? `
                    <button type="button"
                        class="w-full bg-slate-100 hover:bg-brand hover:text-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-action="add" ${maxReached ? 'disabled' : ''}>
                        ${maxReached ? 'Limite Raggiunto' : 'Aggiungi'}
                    </button>
                ` : `
                    <div class="flex items-center justify-between bg-white border border-brand rounded-xl overflow-hidden h-8">
                        <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors" data-action="decrease">−</button>
                        <span class="text-sm font-bold text-slate-900">${currentQty}</span>
                        <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand" data-action="increase" ${maxReached ? 'disabled' : ''}>+</button>
                    </div>
                `}
            </div>
        </article>
    `;
};

const FamousPokeCard = (preset) => `
    <div class="poke-preset-card bg-white rounded-3xl border border-slate-200 overflow-hidden group cursor-pointer" data-preset='${JSON.stringify(preset.items)}'>
        <div class="bg-slate-900 h-36 flex items-center justify-center relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent"></div>
            <span class="text-7xl group-hover:scale-110 transition-transform duration-300 relative z-10">🥗</span>
            <span class="absolute top-4 left-4 ${preset.tagColor} text-xs font-black px-3 py-1 rounded-full">${preset.tag}</span>
        </div>
        <div class="p-6">
            <h3 class="font-bold text-slate-900 text-lg mb-2">${preset.name}</h3>
            <p class="text-slate-500 text-sm leading-relaxed mb-4">${preset.description}</p>
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-brand font-black text-xl">${preset.price}</span>
                    <span class="text-slate-400 text-xs font-medium ml-2">${preset.cals}</span>
                </div>
                <button type="button" class="btn-load-preset bg-brand hover:bg-brandHover text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm" data-preset='${JSON.stringify(preset.items)}'>
                    Carica →
                </button>
            </div>
        </div>
    </div>
`;

const PresetChip = (preset) => `
    <button type="button" class="btn-preset bg-slate-50 hover:bg-brandLight border border-slate-200 hover:border-brand hover:text-brand px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 transition-all duration-200 whitespace-nowrap" data-preset='${JSON.stringify(preset.items)}'>
        ${preset.name}
    </button>
`;

const CartItemCard = (bowl, index) => {
    let bowlPrice = 0;
    const descriptions = Object.keys(bowl).map(id => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        bowlPrice += item.price * bowl[id];
        return `${item.icon} ${item.name}${bowl[id] > 1 ? ` ×${bowl[id]}` : ''}`;
    }).join(' · ');

    return `
        <div class="bg-white p-4 rounded-2xl border border-slate-200 relative shadow-sm">
            <button class="absolute top-3 right-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white w-7 h-7 rounded-lg text-sm font-bold transition-colors flex items-center justify-center btn-remove-item" data-index="${index}" aria-label="Rimuovi poke ${index + 1}">×</button>
            <div class="font-bold text-slate-800 text-sm mb-1 pr-8">Poke Personalizzata #${index + 1}</div>
            <div class="text-xs text-slate-500 mb-2 leading-relaxed">${descriptions}</div>
            <div class="font-black text-brand text-lg">${bowlPrice.toFixed(2)}€</div>
        </div>
    `;
};


/* ==========================================================================
   7. CORE CONFIGURATOR LOGIC
   ========================================================================== */

const getCategoryTotalCount = (category) =>
    Object.keys(state.currentBowl).reduce((acc, id) => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        return item && item.type === category ? acc + state.currentBowl[id] : acc;
    }, 0);

const isBowlValid = () =>
    Object.keys(CATEGORIES_CONFIG).every(cat =>
        getCategoryTotalCount(cat) >= CATEGORIES_CONFIG[cat].min
    );

const renderConfigurator = () => {
    if (!DOM.ingredientsGrid) return;

    const activeConfig      = CATEGORIES_CONFIG[state.activeCategory];
    const currentCatCount   = getCategoryTotalCount(state.activeCategory);
    const isMaxReached      = currentCatCount >= activeConfig.max;

    // ── Category instruction & step counter ──────────────────────────────
    if (DOM.categoryInstruction) DOM.categoryInstruction.textContent = activeConfig.instruction;
    const sequence = Object.keys(CATEGORIES_CONFIG);
    const currentIndex = sequence.indexOf(state.activeCategory);
    if (DOM.stepCounter) DOM.stepCounter.textContent = `${currentIndex + 1} / ${sequence.length}`;

    // ── Ingredients Grid ──────────────────────────────────────────────────
    let filtered = INGREDIENTS_DATA.filter(item => item.type === state.activeCategory);
    if (state.filters.vegan)      filtered = filtered.filter(i => i.isVegan);
    if (state.filters.glutenFree) filtered = filtered.filter(i => i.isGlutenFree);

    DOM.ingredientsGrid.innerHTML = filtered.length === 0
        ? `<p class="col-span-2 lg:col-span-3 text-center text-slate-500 font-medium py-10">Nessun ingrediente trovato con i filtri attivi.</p>`
        : filtered.map(item => IngredientSelectorCard(item, state.currentBowl[item.id] || 0, isMaxReached)).join('');

    // ── Tabs & Step Status Badges ─────────────────────────────────────────
    Object.keys(CATEGORIES_CONFIG).forEach(cat => {
        const count  = getCategoryTotalCount(cat);
        const config = CATEGORIES_CONFIG[cat];

        if (DOM.tabs[cat])     DOM.tabs[cat].classList.toggle('active', cat === state.activeCategory);
        if (DOM.statuses[cat]) {
            const done = count >= config.min && count > 0;
            DOM.statuses[cat].classList.toggle('completed', done);
            DOM.statuses[cat].textContent = done ? '✓' : '';
        }
    });

    // ── Progress Bar ──────────────────────────────────────────────────────
    const isComplete = isBowlValid() && state.activeCategory === 'sauce';
    const progressPct = isComplete ? 100 : ((currentIndex + 1) / sequence.length) * 100;
    if (DOM.progressBar) {
        DOM.progressBar.style.width = `${progressPct}%`;
        DOM.progressBar.className = isComplete
            ? 'h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out'
            : 'h-full bg-brand rounded-full transition-all duration-500 ease-out';
    }

    // ── Living Bowl ───────────────────────────────────────────────────────
    renderLivingBowl();

    // ── Totals ────────────────────────────────────────────────────────────
    const totals = Object.keys(state.currentBowl).reduce((acc, id) => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        const qty  = state.currentBowl[id];
        return { price: acc.price + (item.price * qty), cals: acc.cals + (item.cals * qty) };
    }, { price: 0, cals: 0 });

    if (DOM.totalCaloriesBadge) DOM.totalCaloriesBadge.textContent = `${totals.cals} kcal`;
    if (DOM.currentBowlPrice)   DOM.currentBowlPrice.textContent   = `${totals.price.toFixed(2)}€`;

    // ── Sticky Bottom Button ──────────────────────────────────────────────
    updateStickyBottomBar();
};

const renderLivingBowl = () => {
    if (!DOM.bowlLivingContent) return;

    const selectedItems = Object.keys(state.currentBowl).flatMap(id => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        return Array(state.currentBowl[id]).fill(item);
    });

    DOM.bowlLivingContent.querySelectorAll('.living-chip').forEach(c => c.remove());

    if (selectedItems.length === 0) {
        DOM.emptyBowlPlaceholder.style.display = 'flex';
        DOM.bowlTagsPreview.textContent = 'Nessun ingrediente selezionato';
        return;
    }

    DOM.emptyBowlPlaceholder.style.display = 'none';

    selectedItems.forEach((item, index) => {
        const chip = document.createElement('div');
        chip.className = 'living-chip';
        chip.innerHTML = item.icon;
        chip.title = item.name;

        const isDesktop = window.innerWidth >= 1024;
        const radius = isDesktop ? 65 : 30;
        const offset = isDesktop ? 95 : 38;
        const angle  = (index * (360 / selectedItems.length)) * (Math.PI / 180);

        chip.style.left = `${offset + radius * Math.cos(angle)}px`;
        chip.style.top  = `${offset + radius * Math.sin(angle)}px`;

        DOM.bowlLivingContent.appendChild(chip);
    });

    DOM.bowlTagsPreview.textContent = Object.keys(state.currentBowl).map(id => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        return `${item.name}${state.currentBowl[id] > 1 ? ` ×${state.currentBowl[id]}` : ''}`;
    }).join(' · ');
};

const updateStickyBottomBar = () => {
    if (!DOM.mainActionBtn) return;

    if (isBowlValid()) {
        DOM.mainActionBtn.disabled     = false;
        DOM.mainActionBtn.textContent  = 'Aggiungi al Carrello 🛒';
        DOM.mainActionBtn.onclick      = () => addCurrentBowlToCart();
        return;
    }

    // Find first incomplete required category
    const nextIncomplete = Object.keys(CATEGORIES_CONFIG).find(cat =>
        getCategoryTotalCount(cat) < CATEGORIES_CONFIG[cat].min
    );

    if (nextIncomplete) {
        DOM.mainActionBtn.disabled    = false;
        DOM.mainActionBtn.textContent = `Scegli ${CATEGORIES_CONFIG[nextIncomplete].label}`;
        DOM.mainActionBtn.onclick     = () => {
            state.activeCategory = nextIncomplete;
            renderConfigurator();
            const tabEl = DOM.tabs[nextIncomplete];
            if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
    }
};

const modifyIngredientQty = (id, action) => {
    const item       = INGREDIENTS_DATA.find(i => i.id === id);
    if (!item) return;
    const currentQty = state.currentBowl[id] || 0;
    const catConfig  = CATEGORIES_CONFIG[item.type];
    const catCount   = getCategoryTotalCount(item.type);

    if (action === 'add' || action === 'increase') {
        if (catCount < catConfig.max) {
            state.currentBowl[id] = currentQty + 1;
            triggerFeedbackBurst();
            // Auto-advance after reaching max for required categories
            if (catCount + 1 === catConfig.max && catConfig.min > 0) {
                setTimeout(autoAdvanceCategory, 420);
            }
        }
    } else if (action === 'decrease') {
        if (currentQty > 1) state.currentBowl[id] = currentQty - 1;
        else delete state.currentBowl[id];
    }

    renderConfigurator();
};

const autoAdvanceCategory = () => {
    const sequence     = Object.keys(CATEGORIES_CONFIG);
    const currentIndex = sequence.indexOf(state.activeCategory);
    if (currentIndex > -1 && currentIndex < sequence.length - 1) {
        state.activeCategory = sequence[currentIndex + 1];
        renderConfigurator();
        const nextTab = DOM.tabs[state.activeCategory];
        if (nextTab) nextTab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

const loadPreset = (presetItems) => {
    state.currentBowl    = { ...presetItems };
    state.activeCategory = 'protein';
    navigateTo('configurator');
    triggerFeedbackBurst();
    renderConfigurator();
};


/* ==========================================================================
   8. CART LOGIC
   ========================================================================== */

const toggleCartDrawer = (show) => {
    const isOpening = typeof show === 'boolean' ? show : DOM.cartDrawer.classList.contains('translate-x-full');
    DOM.cartDrawer.classList.toggle('translate-x-full', !isOpening);
    DOM.cartDrawer.classList.toggle('translate-x-0',    isOpening);
    DOM.cartBackdrop.classList.toggle('opacity-0',          !isOpening);
    DOM.cartBackdrop.classList.toggle('pointer-events-none', !isOpening);
    DOM.cartDrawer.setAttribute('aria-hidden',   String(!isOpening));
    DOM.cartBackdrop.setAttribute('aria-hidden', String(!isOpening));
};

const renderCart = () => {
    DOM.cartBadge.textContent = state.cart.length;

    if (state.cart.length === 0) {
        DOM.cartItemsContainer.innerHTML = `<p class="text-center text-slate-400 font-medium mt-12 text-sm">🛒 Il tuo carrello è vuoto.<br><span class="text-xs text-slate-300 mt-1 block">Componi una poke per iniziare!</span></p>`;
        DOM.cartTotalPrice.textContent   = '0.00€';
        DOM.checkoutBtn.disabled         = true;
        return;
    }

    let cartTotal = 0;
    DOM.cartItemsContainer.innerHTML = state.cart.map((bowl, i) => {
        // Calculate price per bowl for total
        const bowlPrice = Object.keys(bowl).reduce((sum, id) => {
            const item = INGREDIENTS_DATA.find(i => i.id === id);
            return sum + (item ? item.price * bowl[id] : 0);
        }, 0);
        cartTotal += bowlPrice;
        return CartItemCard(bowl, i);
    }).join('');

    DOM.cartTotalPrice.textContent = `${cartTotal.toFixed(2)}€`;
    DOM.checkoutBtn.disabled       = false;
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

const resetAfterCheckout = () => {
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
   9. HOME PAGE RENDER
   ========================================================================== */

const renderHomePage = () => {
    // Famous Poke Grid
    if (DOM.famousPokGrid) {
        DOM.famousPokGrid.innerHTML = PRESETS_DATA.map(FamousPokeCard).join('');
    }

    // Preset chips (desktop nav + mobile menu)
    const chipsHtml = PRESETS_DATA.map(PresetChip).join('');
    if (DOM.presetsContainer)       DOM.presetsContainer.innerHTML       = chipsHtml;
    if (DOM.presetsContainerMobile) DOM.presetsContainerMobile.innerHTML = chipsHtml;
};


/* ==========================================================================
   10. EVENT LISTENERS
   ========================================================================== */

const setupEventListeners = () => {

    // ── SPA Navigation ────────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (link) {
            e.preventDefault();
            navigateTo(link.getAttribute('data-page'));
        }
    });

    // Logo → Home
    DOM.logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('home');
    });

    // Mobile menu toggle
    DOM.mobileMenuBtn.addEventListener('click', () => {
        if (state.mobileMenuOpen) closeMobileMenu();
        else openMobileMenu();
    });

    // ── Configurator: Tab Switching ───────────────────────────────────────
    Object.keys(DOM.tabs).forEach(cat => {
        DOM.tabs[cat].addEventListener('click', () => {
            state.activeCategory = cat;
            renderConfigurator();
        });
    });

    // ── Configurator: Ingredient Grid (event delegation) ─────────────────
    DOM.ingredientsGrid.addEventListener('click', (e) => {
        const btn  = e.target.closest('button[data-action]');
        if (!btn) return;
        const card = btn.closest('.ingredient-card');
        if (!card) return;
        const id   = card.getAttribute('data-id');
        modifyIngredientQty(id, btn.getAttribute('data-action'));
    });

    // ── Configurator: Filters ─────────────────────────────────────────────
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

    // ── Preset Chips (nav bar) ────────────────────────────────────────────
    const handlePresetClick = (e) => {
        const btn = e.target.closest('.btn-preset');
        if (!btn) return;
        loadPreset(JSON.parse(btn.getAttribute('data-preset')));
    };
    DOM.presetsContainer.addEventListener('click', handlePresetClick);
    DOM.presetsContainerMobile.addEventListener('click', handlePresetClick);

    // ── Famous Poke Grid (Home) ───────────────────────────────────────────
    DOM.famousPokGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-load-preset');
        if (!btn) return;
        loadPreset(JSON.parse(btn.getAttribute('data-preset')));
    });

    // ── Cart ──────────────────────────────────────────────────────────────
    DOM.cartToggleBtn.addEventListener('click',  () => toggleCartDrawer(true));
    DOM.cartCloseBtn.addEventListener('click',   () => toggleCartDrawer(false));
    DOM.cartBackdrop.addEventListener('click',   () => toggleCartDrawer(false));

    DOM.cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-item');
        if (!btn) return;
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        state.cart.splice(idx, 1);
        renderCart();
    });

    DOM.checkoutBtn.addEventListener('click', processCheckout);
    DOM.closeModalBtn.addEventListener('click', resetAfterCheckout);

    // ── Contact Form (simulated) ──────────────────────────────────────────
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

    // ── Keyboard: close cart on Escape ────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!DOM.cartDrawer.classList.contains('translate-x-full')) toggleCartDrawer(false);
            if (state.mobileMenuOpen) closeMobileMenu();
        }
    });
};


/* ==========================================================================
   11. INIT
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