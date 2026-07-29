// Front-end only "session" — no real backend auth yet. Stores just enough
// so the nav and account page can recognize a signed-in customer.

const SESSION_STORAGE_KEY = 'balletCustomerSession';

function setCustomerSession(data) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
}

function getCustomerSession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearCustomerSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ===== Admin JWT (separate from the customer session above) =====
const ADMIN_TOKEN_KEY = 'balletAdminToken';

function setAdminToken(token) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function getAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

// ===== Customer JWT (returned by /api/auth/signin and /signup) =====
const CUSTOMER_TOKEN_KEY = 'balletCustomerToken';

function setCustomerToken(token) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
}

function getCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

function clearCustomerToken() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
}