/**
 * GastroLab - Engine Sviluppato da Chef Franco
 * Tailwind Edition: UI ottimizzata, Logica Split-Screen e Carrello inclusa.
 * FIX: Risolto bug barra avanzamento prematura e classi dinamiche Tailwind.
 */

const INGREDIENTS_DATA = [
    { id: 'b1', name: 'Riso Bianco', type: 'base', price: 2.00, cals: 150, icon: '🍚', isVegan: true, isGlutenFree: true, img: 'assets/img/riso.jpg' }, 
    { id: 'b2', name: 'Quinoa', type: 'base', price: 3.00, cals: 120, icon: '🌾', isVegan: true, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60' },
    { id: 'p1', name: 'Salmone', type: 'protein', price: 5.00, cals: 200, icon: '🐟', isVegan: false, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=300&auto=format&fit=crop&q=60' },
    { id: 'p2', name: 'Tonno', type: 'protein', price: 6.00, cals: 180, icon: '🥩', isVegan: false, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1501595091296-3aa970afb3ff?w=300&auto=format&fit=crop&q=60' },
    { id: 'p3', name: 'Tofu', type: 'protein', price: 4.00, cals: 100, icon: '🟩', isVegan: true, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1584984241774-67d710bf365f?w=300&auto=format&fit=crop&q=60' },
    { id: 't1', name: 'Avocado', type: 'topping', price: 1.50, cals: 80, icon: '🥑', isVegan: true, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&auto=format&fit=crop&q=60' },
    { id: 't2', name: 'Edamame', type: 'topping', price: 1.00, cals: 50, icon: '🫛', isVegan: true, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id: 't3', name: 'Alga Wakame', type: 'topping', price: 1.00, cals: 30, icon: '🌿', isVegan: true, isGlutenFree: false, img: 'https://images.unsplash.com/photo-1615462444634-118baefae21b?w=300&auto=format&fit=crop&q=60' },
    { id: 's1', name: 'Teriyaki', type: 'sauce', price: 0.00, cals: 50, icon: '🍯', isVegan: true, isGlutenFree: false, img: 'https://images.unsplash.com/photo-1605721160676-e1e3532c1eb3?w=300&auto=format&fit=crop&q=60' },
    { id: 's2', name: 'Spicy Mayo', type: 'sauce', price: 0.00, cals: 80, icon: '🌶️', isVegan: false, isGlutenFree: true, img: 'https://images.unsplash.com/photo-1592518428581-22485590cb78?w=300&auto=format&fit=crop&q=60' }
];

const CATEGORIES_CONFIG = {
    base: { label: 'Basi', instruction: 'Scegli la tua Base (Max 1)', max: 1, min: 1 },
    protein: { label: 'Proteine', instruction: 'Aggiungi le tue Proteine (Fino a 2)', max: 2, min: 1 },
    topping: { label: 'Topping', instruction: 'Arricchisci con i Topping (Fino a 3)', max: 3, min: 0 },
    sauce: { label: 'Salse', instruction: 'Completa con le Salse (Fino a 2)', max: 2, min: 0 }
};

const PRESETS_DATA = [
    { name: "🏆 Classic Salmon", items: { 'b1': 1, 'p1': 1, 't1': 1, 's1': 1 } },
    { name: "🍃 Green Vegan", items: { 'b2': 1, 'p3': 1, 't2': 1, 's1': 1 } }
];

const state = {
    cart: [],
    currentBowl: {}, 
    activeCategory: 'base',
    filters: { vegan: false, glutenFree: false }
};

let lottieFeedback = null;
let lottieCheckout = null;
let DOM = {};

const cacheDOMElements = () => {
    DOM = {
        presetsContainer: document.getElementById('presets-container'),
        bowlLivingContent: document.getElementById('bowl-living-content'),
        emptyBowlPlaceholder: document.getElementById('empty-bowl-placeholder'),
        bowlTagsPreview: document.getElementById('bowl-tags-preview'),
        totalCaloriesBadge: document.getElementById('total-calories-badge'),
        currentBowlPrice: document.getElementById('current-bowl-price'),
        categoryInstruction: document.getElementById('category-instruction'),
        ingredientsGrid: document.getElementById('ingredients-grid'),
        mainActionBtn: document.getElementById('main-action-btn'),
        filterVegan: document.getElementById('filter-vegan'),
        filterGf: document.getElementById('filter-gf'),
        progressBar: document.getElementById('main-progress-bar'),
        
        lottieFeedbackContainer: document.getElementById('lottie-feedback-container'),
        lottieCheckoutContainer: document.getElementById('lottie-checkout-container'),
        checkoutOverlay: document.getElementById('checkout-overlay'),
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
            sauce: document.getElementById('tab-sauce')
        },
        statuses: {
            base: document.getElementById('status-base'),
            protein: document.getElementById('status-protein'),
            topping: document.getElementById('status-topping'),
            sauce: document.getElementById('status-sauce')
        }
    };
};

const initAnimations = () => {
    if (DOM.lottieFeedbackContainer) {
        lottieFeedback = lottie.loadAnimation({
            container: DOM.lottieFeedbackContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'https://fonts.gstatic.com/s/a/666c5d95d9be25350fa67f13df7ad6b92a40fbbfdfba1519d08e2f099146ef94.json' 
        });
    }

    if (DOM.lottieCheckoutContainer) {
        lottieCheckout = lottie.loadAnimation({
            container: DOM.lottieCheckoutContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'Add_to_cart.json'
        });
    }
};

const triggerFeedbackBurst = () => {
    if (lottieFeedback) {
        DOM.lottieFeedbackContainer.classList.remove('opacity-0');
        lottieFeedback.goToAndPlay(0, true);
        setTimeout(() => DOM.lottieFeedbackContainer.classList.add('opacity-0'), 1200);
    }
};

// ==========================================
// TEMPLATE COMPONENT
// ==========================================
const IngredientSelectorCard = (item, currentQty, maxReached) => {
    const isSelected = currentQty > 0;
    const allergenLabel = item.isVegan ? 'Vegan' : (item.isGlutenFree ? 'Senza Glutine' : '');
    const cardBorderBgClass = isSelected ? 'border-brand bg-brandLight' : 'border-slate-200 bg-white hover:border-brand/50';
    
    return `
        <article class="ingredient-card flex flex-col justify-between p-3 lg:p-4 rounded-2xl border-2 transition-all duration-200 min-h-[160px] lg:min-h-[180px] ${cardBorderBgClass}" data-id="${item.id}">
            <div class="w-full h-20 rounded-xl overflow-hidden bg-slate-100 relative">
                <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover" loading="lazy">
                ${allergenLabel ? `<span class="absolute top-1 right-1 bg-white/90 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">${allergenLabel}</span>` : ''}
            </div>
            
            <div class="mt-2 flex-1">
                <h4 class="text-sm lg:text-base font-bold text-slate-900 leading-tight">${item.icon} ${item.name}</h4>
                <p class="text-[11px] lg:text-xs font-medium text-slate-500 mt-0.5">+${item.price.toFixed(2)}€ &bull; ${item.cals} kcal</p>
            </div>
            
            <div class="mt-3">
                ${!isSelected ? `
                    <button type="button" class="w-full bg-slate-100 hover:bg-brand hover:text-white border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed" data-action="add" ${maxReached ? 'disabled' : ''}>
                        ${maxReached ? 'Limite Raggiunto' : 'Aggiungi'}
                    </button>
                ` : `
                    <div class="flex items-center justify-between bg-white border border-brand rounded-xl overflow-hidden h-8">
                        <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors" data-action="decrease">-</button>
                        <span class="text-sm font-bold text-slate-900">${currentQty}</span>
                        <button type="button" class="w-8 h-full text-brand font-bold hover:bg-brand hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand" data-action="increase" ${maxReached ? 'disabled' : ''}>+</button>
                    </div>
                `}
            </div>
        </article>
    `;
};

// ==========================================
// CORE LOGIC & RENDER
// ==========================================
const getCategoryTotalCount = (category) => {
    return Object.keys(state.currentBowl).reduce((acc, id) => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        return item.type === category ? acc + state.currentBowl[id] : acc;
    }, 0);
};

const isBowlValid = () => {
    return Object.keys(CATEGORIES_CONFIG).every(cat => {
        return getCategoryTotalCount(cat) >= CATEGORIES_CONFIG[cat].min;
    });
};

const renderApp = () => {
    const activeConfig = CATEGORIES_CONFIG[state.activeCategory];
    DOM.categoryInstruction.textContent = activeConfig.instruction;
    const currentCatCount = getCategoryTotalCount(state.activeCategory);
    const isMaxReachedForCategory = currentCatCount >= activeConfig.max;

    // 1. Griglia Ingredienti
    let filteredIngredients = INGREDIENTS_DATA.filter(item => item.type === state.activeCategory);
    if (state.filters.vegan) filteredIngredients = filteredIngredients.filter(item => item.isVegan);
    if (state.filters.glutenFree) filteredIngredients = filteredIngredients.filter(item => item.isGlutenFree);

    if (filteredIngredients.length === 0) {
        DOM.ingredientsGrid.innerHTML = `<p class="col-span-2 lg:col-span-3 text-center text-slate-500 font-medium py-8">Nessun ingrediente trovato coi filtri attivi.</p>`;
    } else {
        DOM.ingredientsGrid.innerHTML = filteredIngredients.map(item => {
            return IngredientSelectorCard(item, state.currentBowl[item.id] || 0, isMaxReachedForCategory);
        }).join('');
    }

    // 2. Tabs e Spunte Verdi
    Object.keys(CATEGORIES_CONFIG).forEach(cat => {
        const count = getCategoryTotalCount(cat);
        const config = CATEGORIES_CONFIG[cat];
        
        DOM.tabs[cat].classList.toggle('active', cat === state.activeCategory);

        if (count >= config.min && count > 0) {
            DOM.statuses[cat].classList.add('completed');
            DOM.statuses[cat].textContent = '✓';
        } else {
            DOM.statuses[cat].classList.remove('completed');
            DOM.statuses[cat].textContent = '';
        }
    });

    // 3. BARRA DI PROGRESSO (BUG RISOLTO!)
    const sequence = Object.keys(CATEGORIES_CONFIG);
    const currentIndex = sequence.indexOf(state.activeCategory);
    let progressPercentage = ((currentIndex + 1) / sequence.length) * 100;
    
    // Diventa verde solo se la ciotola intera è valida E siamo giunti all'ultimo tab (Salse)
    if (isBowlValid() && state.activeCategory === 'sauce') {
        progressPercentage = 100;
        DOM.progressBar.className = "h-full bg-emerald-500 transition-all duration-500 ease-out"; 
        DOM.progressBar.style.width = "100%";
    } else {
        // Ripristinato lo stile standard arancione, modificando la larghezza in modo pulito senza interpolazioni CSS rotte
        DOM.progressBar.className = "h-full bg-brand transition-all duration-500 ease-out";
        DOM.progressBar.style.width = `${progressPercentage}%`;
    }

    // 4. Aggiornamento Visivo Ciotola Viva
    const selectedItemsArray = Object.keys(state.currentBowl).flatMap(id => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        return Array(state.currentBowl[id]).fill(item);
    });

    if (selectedItemsArray.length === 0) {
        DOM.emptyBowlPlaceholder.style.display = 'flex';
        DOM.bowlLivingContent.querySelectorAll('.living-chip').forEach(c => c.remove());
        DOM.bowlTagsPreview.textContent = "Nessun ingrediente selezionato";
    } else {
        DOM.emptyBowlPlaceholder.style.display = 'none';
        DOM.bowlLivingContent.querySelectorAll('.living-chip').forEach(c => c.remove());

        selectedItemsArray.forEach((item, index) => {
            const chip = document.createElement('div');
            chip.className = 'living-chip';
            chip.innerHTML = item.icon;
            chip.title = item.name;
            
            const isDesktop = window.innerWidth >= 1024;
            const radius = isDesktop ? 65 : 30; 
            const angle = (index * (360 / selectedItemsArray.length)) * (Math.PI / 180);
            const offset = isDesktop ? 100 : 40; 
            
            chip.style.left = `${offset + radius * Math.cos(angle)}px`;
            chip.style.top = `${offset + radius * Math.sin(angle)}px`;
            
            DOM.bowlLivingContent.appendChild(chip);
        });

        DOM.bowlTagsPreview.textContent = Object.keys(state.currentBowl).map(id => {
            const item = INGREDIENTS_DATA.find(i => i.id === id);
            return `${item.name} (x${state.currentBowl[id]})`;
        }).join(', ');
    }

    // 5. Prezzi e Calorie
    const totals = Object.keys(state.currentBowl).reduce((acc, id) => {
        const item = INGREDIENTS_DATA.find(i => i.id === id);
        const qty = state.currentBowl[id];
        return { price: acc.price + (item.price * qty), cals: acc.cals + (item.cals * qty) };
    }, { price: 0, cals: 0 });

    DOM.totalCaloriesBadge.textContent = `${totals.cals} kcal`;
    DOM.currentBowlPrice.textContent = `${totals.price.toFixed(2)}€`;

    // 6. Tasto in Basso
    updateStickyBottomBar();
};

const updateStickyBottomBar = () => {
    if (isBowlValid()) {
        DOM.mainActionBtn.disabled = false;
        DOM.mainActionBtn.textContent = "Aggiungi al Carrello 🛒";
        DOM.mainActionBtn.onclick = () => addCurrentBowlToCart();
        return;
    }

    let nextIncompleteCategory = null;
    for (let cat of Object.keys(CATEGORIES_CONFIG)) {
        if (getCategoryTotalCount(cat) < CATEGORIES_CONFIG[cat].min) {
            nextIncompleteCategory = cat;
            break;
        }
    }

    if (nextIncompleteCategory) {
        DOM.mainActionBtn.disabled = false;
        DOM.mainActionBtn.textContent = `Scegli ${CATEGORIES_CONFIG[nextIncompleteCategory].label}`;
        DOM.mainActionBtn.onclick = () => {
            state.activeCategory = nextIncompleteCategory;
            renderApp();
            document.getElementById(`tab-${nextIncompleteCategory}`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
    }
};

const modifyIngredientQty = (id, action) => {
    const item = INGREDIENTS_DATA.find(i => i.id === id);
    const currentQty = state.currentBowl[id] || 0;
    const catConfig = CATEGORIES_CONFIG[item.type];
    const currentCatCount = getCategoryTotalCount(item.type);

    if (action === 'add' || action === 'increase') {
        if (currentCatCount < catConfig.max) {
            state.currentBowl[id] = currentQty + 1;
            triggerFeedbackBurst();
            if (currentCatCount + 1 === catConfig.max) setTimeout(autoAdvanceCategory, 400);
        }
    } else if (action === 'decrease') {
        if (currentQty > 1) state.currentBowl[id] = currentQty - 1;
        else delete state.currentBowl[id];
    }
    renderApp();
};

const autoAdvanceCategory = () => {
    const sequence = Object.keys(CATEGORIES_CONFIG);
    const currentIndex = sequence.indexOf(state.activeCategory);
    if (currentIndex > -1 && currentIndex < sequence.length - 1) {
        state.activeCategory = sequence[currentIndex + 1];
        renderApp();
        document.getElementById(`tab-${sequence[currentIndex + 1]}`).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// ==========================================
// LOGICA CARRELLO E CHECKOUT
// ==========================================
const toggleCartDrawer = (show) => {
    const isOpening = typeof show === 'boolean' ? show : DOM.cartDrawer.classList.contains('translate-x-full');
    DOM.cartDrawer.classList.toggle('translate-x-full', !isOpening);
    DOM.cartDrawer.classList.toggle('translate-x-0', isOpening);
    DOM.cartBackdrop.classList.toggle('opacity-0', !isOpening);
    DOM.cartBackdrop.classList.toggle('pointer-events-none', !isOpening);
    DOM.cartDrawer.setAttribute('aria-hidden', !isOpening);
    DOM.cartBackdrop.setAttribute('aria-hidden', !isOpening);
};

const renderCart = () => {
    DOM.cartBadge.textContent = state.cart.length;
    
    if (state.cart.length === 0) {
        DOM.cartItemsContainer.innerHTML = '<p class="text-center text-slate-500 font-medium mt-10">Il tuo carrello è vuoto.</p>';
        DOM.cartTotalPrice.textContent = '0.00€';
        DOM.checkoutBtn.disabled = true;
        return;
    }

    let cartTotal = 0;
    DOM.cartItemsContainer.innerHTML = state.cart.map((bowl, index) => {
        let bowlPrice = 0;
        const descriptions = Object.keys(bowl).map(id => {
            const item = INGREDIENTS_DATA.find(i => i.id === id);
            bowlPrice += item.price * bowl[id];
            return `${item.name} (x${bowl[id]})`;
        }).join(', ');
        
        cartTotal += bowlPrice;

        return `
            <div class="bg-white p-4 rounded-2xl border border-slate-200 relative shadow-sm">
                <button class="absolute top-3 right-3 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white px-2 py-1 rounded text-xs font-bold transition-colors btn-remove-item" data-index="${index}">Rimuovi</button>
                <div class="font-bold text-slate-800 text-sm mb-1 pr-16">Poke Personalizzata #${index + 1}</div>
                <div class="text-xs text-slate-500 mb-2 leading-relaxed">${descriptions}</div>
                <div class="font-black text-brand text-lg">${bowlPrice.toFixed(2)}€</div>
            </div>
        `;
    }).join('');

    DOM.cartTotalPrice.textContent = `${cartTotal.toFixed(2)}€`;
    DOM.checkoutBtn.disabled = false;
};

const addCurrentBowlToCart = () => {
    state.cart.push({ ...state.currentBowl });
    state.currentBowl = {};
    state.activeCategory = 'base';
    renderApp();
    renderCart();
    toggleCartDrawer(true);
};

const processCheckout = () => {
    toggleCartDrawer(false);
    DOM.checkoutOverlay.classList.remove('opacity-0', 'pointer-events-none');
    DOM.checkoutOverlay.classList.add('active');
    DOM.checkoutOverlay.setAttribute('aria-hidden', 'false');
    if (lottieCheckout) {
        lottieCheckout.goToAndPlay(0, true);
    }
};

// ==========================================
// EVENT LISTENERS
// ==========================================
const setupEventListeners = () => {
    DOM.ingredientsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.closest('.ingredient-card').getAttribute('data-id');
        modifyIngredientQty(id, btn.getAttribute('data-action'));
    });

    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', () => {
            state.activeCategory = tab.getAttribute('data-category');
            renderApp();
        });
    });

    DOM.filterVegan.addEventListener('click', function() {
        const isPressed = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', !isPressed);
        state.filters.vegan = !isPressed;
        renderApp();
    });

    DOM.filterGf.addEventListener('click', function() {
        const isPressed = this.getAttribute('aria-pressed') === 'true';
        this.setAttribute('aria-pressed', !isPressed);
        state.filters.glutenFree = !isPressed;
        renderApp();
    });

    DOM.cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    DOM.cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
    DOM.cartBackdrop.addEventListener('click', () => toggleCartDrawer(false));
    
    DOM.cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-item')) {
            const idx = e.target.getAttribute('data-index');
            state.cart.splice(idx, 1);
            renderCart();
        }
    });

    DOM.checkoutBtn.addEventListener('click', processCheckout);

    DOM.closeModalBtn.addEventListener('click', () => {
        DOM.checkoutOverlay.classList.add('opacity-0', 'pointer-events-none');
        DOM.checkoutOverlay.classList.remove('active');
        DOM.checkoutOverlay.setAttribute('aria-hidden', 'true');
        state.cart = [];
        state.currentBowl = {};
        state.activeCategory = 'base';
        renderApp();
        renderCart();
    });

    DOM.presetsContainer.innerHTML = PRESETS_DATA.map(preset => {
        return `<button type="button" class="btn-preset bg-slate-50 hover:bg-brandLight border border-slate-200 hover:border-brand hover:text-brand px-4 py-1.5 rounded-full text-xs font-bold text-slate-700 transition-colors" data-preset='${JSON.stringify(preset.items)}'>${preset.name}</button>`;
    }).join('');

    DOM.presetsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-preset')) {
            state.currentBowl = JSON.parse(e.target.getAttribute('data-preset'));
            state.activeCategory = 'protein'; 
            renderApp();
            triggerFeedbackBurst();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    cacheDOMElements();
    initAnimations();
    setupEventListeners();
    renderApp(); 
    renderCart(); 
});