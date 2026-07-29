// Product data now comes from the real backend API instead of localStorage.
// NOTE: these functions are now ASYNC (they return Promises) since they hit
// the network. Every place that calls them needs `await` and to be inside
// an `async function`.

async function getProducts(filters) {
  const params = new URLSearchParams(filters || {});
  const query = params.toString() ? `?${params.toString()}` : '';

  const res = await fetch(`${API_BASE_URL}/products${query}`);
  if (!res.ok) throw new Error('Failed to load products.');

  const products = await res.json();
  // The rest of the frontend expects an `id` field (not Mongo's `_id`)
  return products.map(normalizeProduct);
}

async function getProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) return null;

  const product = await res.json();
  return normalizeProduct(product);
}

// Admin-only: requires an admin JWT (see js/session.js for adminToken storage)
async function createProduct(productData) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create product.');
  }

  return normalizeProduct(await res.json());
}

// Admin-only
async function updateProduct(id, updates) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify(updates)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update product.');
  }

  return normalizeProduct(await res.json());
}

// Admin-only
async function deleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAdminToken()}` }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete product.');
  }

  return true;
}

// Converts Mongo's _id into a plain `id` string so existing frontend code
// (product cards, cart, detail page) doesn't need to change how it reads products.
function normalizeProduct(product) {
  return { ...product, id: product._id || product.id };
}