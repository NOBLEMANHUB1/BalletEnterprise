// Reviews now live in the real database instead of localStorage.
// NOTE: these are ASYNC — callers need `await`.

async function getReviewsForProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
  if (!res.ok) return [];
  return res.json();
}

async function addReview(productId, review) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit review.');
  }

  return res.json();
}

async function getAverageRating(productId) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews/summary`);
  if (!res.ok) return { average: 0, count: 0 };
  return res.json();
}

// Builds a simple ★★★★☆-style string for a given rating (rounded to nearest whole star)
function buildStarString(rating) {
  const rounded = Math.round(rating);
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}