// Central place to point the frontend at the backend API.
// Change this if you deploy the backend somewhere other than localhost.
const API_BASE_URL = "https://balletenterprise.onrender.com/api";

// Paystack PUBLIC key — safe to expose in frontend code, that's how Paystack
// Inline is designed to work. Find it in your Paystack dashboard under
// Settings -> API Keys & Webhooks. Use the TEST key while developing.
// NEVER put your Paystack SECRET key here or anywhere in frontend code —
// that one only ever belongs in the backend's .env file.
const PAYSTACK_PUBLIC_KEY = "pk_test_18855a99f2c4dc3797983671e6cd9e1763184fd0";
