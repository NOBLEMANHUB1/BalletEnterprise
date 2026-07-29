// Shared cart store — a simple { productId: quantity } map saved to localStorage.
// Used by product cards (home/shop/detail pages), the nav cart badge, and cart.html.

const CART_STORAGE_KEY = 'balletEnterpriseCart';

function getCart() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// productName is optional — only used to make the admin activity log readable.
function addToCart(productId, qty, productName) {
  qty = qty || 1;
  const cart = getCart();
  const key = String(productId);
  cart[key] = (cart[key] || 0) + qty;
  saveCart(cart);
  pingCartActivity(productName, qty);
}

function setCartQty(productId, qty) {
  const cart = getCart();
  const key = String(productId);
  if (qty <= 0) {
    delete cart[key];
  } else {
    cart[key] = qty;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart();
  delete cart[String(productId)];
  saveCart(cart);
}

function getCartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

// Combines cart quantities with live product data (price/name/image may have
// changed since the item was added), skipping items whose product no longer exists.
async function getCartLines() {
  const cart = getCart();
  const lines = [];

  await Promise.all(Object.keys(cart).map(async function (id) {
    const product = await getProductById(id);
    if (product) {
      lines.push({ product, qty: cart[id] });
    }
  }));

  return lines;
}

async function getCartTotal() {
  const lines = await getCartLines();
  return lines.reduce((sum, line) => sum + (line.product.price * line.qty), 0);
}

// Keeps every page's nav cart badge in sync
function updateCartBadge() {
  const badge = document.querySelector('.cart .count');
  if (badge) {
    badge.textContent = getCartCount();
  }
}

// Fire-and-forget — lets the admin's Activity Log show real-time cart activity
// without ever blocking or breaking the actual add-to-cart action if it fails.
function pingCartActivity(productName, qty) {
  if (typeof API_BASE_URL === 'undefined') return;

  const session = typeof getCustomerSession === 'function' ? getCustomerSession() : null;
  const who = session ? `${session.name} (${session.contact})` : 'Guest';

  fetch(`${API_BASE_URL}/activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'Item added to cart',
      user: who,
      details: productName ? `${productName} × ${qty}` : `Qty: ${qty}`
    })
  }).catch(() => {}); // silently ignore — never block the shopper over a logging failure
}

document.addEventListener('DOMContentLoaded', updateCartBadge);