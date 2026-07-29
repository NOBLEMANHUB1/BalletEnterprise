// Shared product catalog — single source of truth for seed data.
// The live/admin-editable copy lives in localStorage (see js/store.js);
// this file only provides the starting values the first time the site loads.

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'PowerBlend Pro Blender',
    category: 'Kitchen Appliances',
    price: 45.00,
    availability: 'ghana',
    tag: 'Best Seller',
    shipTime: '',
    description: 'A 1000W countertop blender with stainless steel blades, built for smoothies, sauces, and everyday kitchen prep.',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&q=80',
      'https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=700&q=80',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=700&q=80',
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=700&q=80'
    ],
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 2,
    name: 'Digital Microwave Oven 25L',
    category: 'Kitchen Appliances',
    price: 89.00,
    availability: 'ghana',
    tag: 'New',
    shipTime: '',
    description: 'A spacious 25-litre microwave with digital controls, quick-defrost, and multiple auto-cook presets.',
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=700&q=80',
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=700&q=80',
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&q=80',
      'https://images.unsplash.com/photo-1585237017125-24baf8d7406f?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 3,
    name: 'Nova X12 Smartphone',
    category: 'Phones',
    price: 399.00,
    availability: 'ghana',
    tag: 'Best Seller',
    shipTime: '',
    description: 'A 6.5-inch display, triple-camera smartphone with all-day battery life and fast charging support.',
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&q=80',
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=700&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 4,
    name: 'Wireless Earbuds Pro',
    category: 'Phone Accessories',
    price: 35.00,
    availability: 'ghana',
    tag: '',
    shipTime: '',
    description: 'True wireless earbuds with active noise cancellation and a compact charging case.',
    images: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=700&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=80',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=700&q=80',
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 5,
    name: 'UltraBook 14" Laptop',
    category: 'Laptops',
    price: 650.00,
    availability: 'ghana',
    tag: '',
    shipTime: '',
    description: 'A slim, lightweight 14-inch laptop with a fast processor and long battery life, built for work on the go.',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=700&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 6,
    name: 'Wireless Mouse & Pad Set',
    category: 'Laptop Accessories',
    price: 22.00,
    availability: 'ghana',
    tag: '',
    shipTime: '',
    description: 'An ergonomic wireless mouse paired with a smooth desk mat, built for long work sessions.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&q=80',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80',
      'https://images.unsplash.com/photo-1595225476474-4a8f1d5a1e1c?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 7,
    name: '55" 4K Smart TV',
    category: 'TVs',
    price: 520.00,
    availability: 'preorder',
    tag: '',
    shipTime: '3–4 weeks',
    description: 'A 55-inch 4K UHD smart TV with built-in streaming apps and a slim bezel design for any living room.',
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=700&q=80',
      'https://images.unsplash.com/photo-1571415060716-ba0fdd42fbc9?w=700&q=80',
      'https://images.unsplash.com/photo-1601944177325-f8867652837f?w=700&q=80',
      'https://images.unsplash.com/photo-1552975084-6e027cd345c2?w=700&q=80'
    ],
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 8,
    name: 'Premium Soundbar 2.1',
    category: 'TV Accessories',
    price: 150.00,
    availability: 'preorder',
    tag: '',
    shipTime: '2–3 weeks',
    description: 'A 2.1-channel soundbar with a wireless subwoofer, built to fill any room with rich, clear sound.',
    images: [
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=700&q=80',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=700&q=80',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=700&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&q=80'
    ],
    video: ''
  },
  {
    id: 9,
    name: '4-Burner Gas Cooker',
    category: 'Kitchen Appliances',
    price: 310.00,
    availability: 'preorder',
    tag: '',
    shipTime: '4–6 weeks',
    description: 'A sturdy 4-burner gas cooker with an oven and grill compartment, built for busy family kitchens.',
    images: [
      'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=700&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&q=80',
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=700&q=80',
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&q=80'
    ],
    video: ''
  }
];