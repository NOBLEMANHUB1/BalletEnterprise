// Currency switcher — lets customers view prices in USD or Ghanaian Cedis.
//
// IMPORTANT: prices are stored in the database in whatever currency the
// admin has set as the "base currency" (see the admin dashboard's Currency
// Exchange Rate card) -- for a Ghana-based business that's GHS by default,
// not USD. This file converts FROM the base currency TO whichever currency
// the customer has toggled to.

const CURRENCY_STORAGE_KEY = 'balletCurrency';
const SETTINGS_CACHE_KEY = 'balletSiteSettings';
const SETTINGS_TIMESTAMP_KEY = 'balletSiteSettingsTime';
const SETTINGS_MAX_AGE_MS = 15 * 60 * 1000; // re-check admin settings every 15 minutes

// Used only if the backend can't be reached at all (offline, server down).
const FALLBACK_SETTINGS = { baseCurrency: 'GHS', usdToGhsRate: 15.5 };

function getCurrentCurrency() {
  // May be null if the customer hasn't picked one yet — formatPrice()
  // falls back to the site's base currency in that case.
  return localStorage.getItem(CURRENCY_STORAGE_KEY);
}

function setCurrentCurrency(code) {
  localStorage.setItem(CURRENCY_STORAGE_KEY, code);
}

// Reads the admin-controlled base currency + exchange rate from the backend,
// caching briefly so every price on a page doesn't trigger its own request.
async function getSiteSettings() {
  const cachedRaw = localStorage.getItem(SETTINGS_CACHE_KEY);
  const cachedTime = Number(localStorage.getItem(SETTINGS_TIMESTAMP_KEY) || 0);
  const isFresh = Date.now() - cachedTime < SETTINGS_MAX_AGE_MS;

  if (cachedRaw && isFresh) {
    try { return JSON.parse(cachedRaw); } catch (e) { /* fall through */ }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/settings/exchange-rate`);
    const data = await res.json();

    if (data && data.usdToGhsRate) {
      const settings = { baseCurrency: data.baseCurrency || 'GHS', usdToGhsRate: data.usdToGhsRate };
      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
      localStorage.setItem(SETTINGS_TIMESTAMP_KEY, String(Date.now()));
      return settings;
    }
  } catch (err) {
    // backend unreachable — fall through to cached/fallback settings below
  }

  if (cachedRaw) {
    try { return JSON.parse(cachedRaw); } catch (e) { /* fall through */ }
  }
  return FALLBACK_SETTINGS;
}

// Kept as a convenience for any older code that just wants the rate number
async function getUsdToGhsRate() {
  const settings = await getSiteSettings();
  return settings.usdToGhsRate;
}

// Admin-only: updates the base currency and/or exchange rate everyone sees going forward
async function updateSiteSettings({ baseCurrency, usdToGhsRate }) {
  const res = await fetch(`${API_BASE_URL}/settings/exchange-rate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: JSON.stringify({ baseCurrency, usdToGhsRate })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update currency settings.');
  }

  const data = await res.json();
  const settings = { baseCurrency: data.baseCurrency, usdToGhsRate: data.usdToGhsRate };
  localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
  localStorage.setItem(SETTINGS_TIMESTAMP_KEY, String(Date.now()));
  return settings;
}

// Converts a raw stored price (in the site's base currency) into whatever
// currency the customer currently has selected, formatted with the right symbol.
async function formatPrice(rawPrice) {
  const { baseCurrency, usdToGhsRate } = await getSiteSettings();

  let displayCurrency = getCurrentCurrency();
  if (!displayCurrency) {
    // first-time visitor — default to the site's base currency
    displayCurrency = baseCurrency;
    setCurrentCurrency(displayCurrency);
  }

  let amount = rawPrice;

  if (displayCurrency !== baseCurrency) {
    if (baseCurrency === 'GHS' && displayCurrency === 'USD') {
      amount = rawPrice / usdToGhsRate;
    } else if (baseCurrency === 'USD' && displayCurrency === 'GHS') {
      amount = rawPrice * usdToGhsRate;
    }
  }

  const symbol = displayCurrency === 'GHS' ? 'GH₵' : '$';
  return `${symbol}${amount.toFixed(2)}`;
}

// Converts an amount stored in the site's base currency into GHS specifically —
// used for Paystack charges, since Ghanaian Paystack accounts reliably support
// GHS regardless of what currency the shopper has the display toggled to.
async function convertToGHS(rawAmountInBaseCurrency) {
  const { baseCurrency, usdToGhsRate } = await getSiteSettings();
  if (baseCurrency === 'GHS') return rawAmountInBaseCurrency;
  return rawAmountInBaseCurrency * usdToGhsRate; // baseCurrency is USD
}

// Injects the toggle button (+ its styling) into the navbar if it's not
// already there, and wires up clicking it. Fully self-contained — no HTML
// or CSS editing needed anywhere else.
document.addEventListener('DOMContentLoaded', async function () {

  if (!document.getElementById('currencyToggleStyles')) {
    const style = document.createElement('style');
    style.id = 'currencyToggleStyles';
    style.textContent = `
      .currency-toggle{
        display:flex;
        border:1px solid #ececec;
        border-radius:20px;
        overflow:hidden;
      }
      .currency-btn{
        background:transparent;
        border:none;
        padding:8px 14px;
        font-family:'Inter', sans-serif;
        font-size:12.5px;
        font-weight:600;
        color:#767676;
        cursor:pointer;
        transition:background .2s ease, color .2s ease;
      }
      .currency-btn.active{
        background:#0a0a0a;
        color:#ffffff;
      }
    `;
    document.head.appendChild(style);
  }

  const navActions = document.querySelector('.nav-actions');

  if (navActions && !document.querySelector('.currency-toggle')) {
    const toggle = document.createElement('div');
    toggle.className = 'currency-toggle';
    toggle.innerHTML = `
      <button class="currency-btn" data-currency="GHS">GHS</button>
      <button class="currency-btn" data-currency="USD">USD</button>
    `;
    navActions.insertBefore(toggle, navActions.firstChild);
  }

  const buttons = document.querySelectorAll('.currency-btn');
  if (buttons.length === 0) return;

  let current = getCurrentCurrency();
  if (!current) {
    const settings = await getSiteSettings();
    current = settings.baseCurrency;
    setCurrentCurrency(current);
  }

  buttons.forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.currency === current);
    btn.addEventListener('click', function () {
      if (btn.dataset.currency === getCurrentCurrency()) return;
      setCurrentCurrency(btn.dataset.currency);
      window.location.reload();
    });
  });
});