'use strict';

const INGREDIENTS_DATA = [
    { id: 'b1', name: 'Riso Bianco',    type: 'base',    price: 2.00, cals: 150, carbs: 33,  protein:  2.5, fat:  0.3, icon: '🍚', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop&q=80' },
    { id: 'b2', name: 'Quinoa',         type: 'base',    price: 3.00, cals: 120, carbs: 21,  protein:  4.0, fat:  2.0, icon: '🌾', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&q=80' },
    { id: 'b3', name: 'Riso Integrale', type: 'base',    price: 2.50, cals: 130, carbs: 27,  protein:  3.0, fat:  1.0, icon: '🟤', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&q=80' },
    { id: 'p1', name: 'Salmone',        type: 'protein', price: 5.00, cals: 200, carbs:  0,  protein: 22.0, fat: 10.0, icon: '🐟', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&q=80' },
    { id: 'p2', name: 'Tonno',          type: 'protein', price: 6.00, cals: 180, carbs:  0,  protein: 28.0, fat:  5.0, icon: '🥩', isVegan: false, isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400&h=300&fit=crop&q=80' },
    { id: 'p3', name: 'Tofu',           type: 'protein', price: 4.00, cals: 100, carbs:  2,  protein: 10.0, fat:  5.0, icon: '🟩', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop&q=80' },
    { id: 't1', name: 'Avocado',        type: 'topping', price: 1.50, cals:  80, carbs:  4,  protein:  1.0, fat:  8.0, icon: '🥑', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop&q=80' },
    { id: 't2', name: 'Edamame',        type: 'topping', price: 1.00, cals:  50, carbs:  4,  protein:  5.0, fat:  2.0, icon: '🫛', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop&q=80' },
    { id: 't3', name: 'Alga Wakame',    type: 'topping', price: 1.00, cals:  30, carbs:  3,  protein:  2.0, fat:  0.5, icon: '🌿', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400&h=300&fit=crop&q=80' },
    { id: 't4', name: 'Cetriolo',       type: 'topping', price: 0.80, cals:  15, carbs:  3,  protein:  0.5, fat:  0.1, icon: '🥒', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=300&fit=crop&q=80' },
    { id: 't5', name: 'Mango',          type: 'topping', price: 1.20, cals:  60, carbs: 15,  protein:  0.5, fat:  0.3, icon: '🥭', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop&q=80' },
    { id: 't6', name: 'Sesamo Tostato', type: 'topping', price: 0.50, cals:  25, carbs:  1,  protein:  1.5, fat:  2.0, icon: '🌰', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400&h=300&fit=crop&q=80' },
    { id: 's1', name: 'Teriyaki',       type: 'sauce',   price: 0.00, cals:  50, carbs: 11,  protein:  0.5, fat:  0.0, icon: '🍯', isVegan: true,  isGlutenFree: false, img: 'https://images.unsplash.com/photo-1682482003091-d7d6427041fa?w=400&h=300&fit=crop&q=80' },
    { id: 's2', name: 'Spicy Mayo',     type: 'sauce',   price: 0.00, cals:  80, carbs:  1,  protein:  0.5, fat:  8.0, icon: '🌶️', isVegan: false, isGlutenFree: true,  img: 'https://media.istockphoto.com/id/1195877732/photo/tasty-burger-sauce-in-bowl-isolated-on-white-background.jpg' },
    { id: 's3', name: 'Ponzu',          type: 'sauce',   price: 0.00, cals:  35, carbs:  7,  protein:  0.5, fat:  0.0, icon: '🍋', isVegan: true,  isGlutenFree: true,  img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop&q=80' },
];

const CATEGORIES_CONFIG = {
    base:    { label: 'Base',     instruction: 'Scegli la tua Base (Max 1)',              max: 1, min: 1, step: 1 },
    protein: { label: 'Proteine', instruction: 'Aggiungi le tue Proteine (Fino a 2)',     max: 2, min: 1, step: 2 },
    topping: { label: 'Topping',  instruction: 'Arricchisci con i Topping (Fino a 3)',   max: 3, min: 0, step: 3 },
    sauce:   { label: 'Salse',    instruction: 'Completa con le Salse (Fino a 2)',        max: 2, min: 0, step: 4 },
};

const PRESETS_DATA = [
    { name: 'La Vaporiera', description: 'Il grande classico. Riso, salmone, avocado e salsa teriyaki.',               items: { b1: 1, p1: 1, t1: 1, s1: 1 }, price: '8.50€', cals: '480 kcal', tag: 'Bestseller', tagColor: 'bg-amber-400 text-amber-900',   img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80' },
    { name: 'Il Prato',     description: 'Quinoa, tofu, edamame e teriyaki. 100% plant-based.',                        items: { b2: 1, p3: 1, t2: 1, s1: 1 }, price: '8.00€', cals: '320 kcal', tag: 'Vegan',      tagColor: 'bg-emerald-400 text-emerald-900', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop&q=80' },
    { name: 'La Bomba',     description: 'Riso bianco, tonno, alga wakame e spicy mayo per i coraggiosi.',             items: { b1: 1, p2: 1, t3: 1, s2: 1 }, price: '9.00€', cals: '460 kcal', tag: 'Piccante',   tagColor: 'bg-red-400 text-red-900',         img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=400&fit=crop&q=80' },
];

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