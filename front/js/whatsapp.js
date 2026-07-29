// Floating WhatsApp button — shown on every customer-facing page.
//
// TO CHANGE THE NUMBER LATER: just update WHATSAPP_NUMBER below.
// Format: country code + number, no "+", no spaces, no leading 0.
// e.g. Ghana number 054 206 0426 becomes 233542060426.
const WHATSAPP_NUMBER = '233542060426';
const WHATSAPP_MESSAGE = "Hi! I have a question about a product on Ballet Enterprise.";

document.addEventListener('DOMContentLoaded', function () {
  const link = document.createElement('a');
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'whatsapp-float';
  link.setAttribute('aria-label', 'Chat with us on WhatsApp');

  link.innerHTML = `
    <svg viewBox="0 0 32 32" width="30" height="30" fill="white">
      <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.34.64 4.53 1.75 6.42L4 29l7.78-1.7A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.63 28 15S22.63 3 16.004 3zm6.98 17.02c-.29.82-1.44 1.5-2.36 1.7-.63.13-1.45.24-4.22-.9-3.54-1.46-5.83-5.02-6.01-5.25-.18-.24-1.44-1.92-1.44-3.66 0-1.74.91-2.6 1.24-2.95.29-.31.63-.39.84-.39.21 0 .42.002.6.01.19.01.45-.07.7.53.29.7.98 2.42 1.06 2.6.08.18.14.39.03.63-.11.24-.16.39-.32.6-.16.21-.34.47-.48.63-.16.18-.33.37-.14.71.19.34.85 1.4 1.83 2.27 1.26 1.12 2.32 1.47 2.66 1.63.34.16.55.14.75-.08.21-.24.86-.98 1.09-1.32.23-.34.45-.28.76-.17.31.11 1.98.93 2.32 1.1.34.16.56.24.64.39.08.14.08.79-.21 1.6z"/>
    </svg>
  `;

  document.body.appendChild(link);
});