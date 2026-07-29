// Swaps the "Sign in / Sign up" nav links for a "My Account" link
// whenever a customer session exists (see js/session.js).
document.addEventListener('DOMContentLoaded', function () {
  if (typeof getCustomerSession !== 'function') return;

  const session = getCustomerSession();
  if (!session) return;

  const signInLink = document.querySelector('.nav-actions .sign-in');
  const signUpLink = document.querySelector('.nav-actions .sign-up');
  if (!signInLink || !signUpLink) return;

  const accountLink = document.createElement('a');
  accountLink.className = 'sign-in account-link';
  accountLink.href = 'account.html';
  accountLink.textContent = `Hi, ${session.name.split(' ')[0]}`;

  signInLink.replaceWith(accountLink);
  signUpLink.remove();

  // Keep the mobile menu in sync too
  const mobileAuthLinks = document.querySelector('.mobile-auth-links');
  if (mobileAuthLinks) {
    mobileAuthLinks.innerHTML = `<a href="account.html" class="mobile-signup">My Account</a>`;
  }
});