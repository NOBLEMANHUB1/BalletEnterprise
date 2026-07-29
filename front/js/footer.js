document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('newsletterForm');
  const note = document.getElementById('newsletterNote');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');

    if (!emailInput.value.trim()) return;

    // Front-end only for now — no backend wired up yet
    note.textContent = "Thanks! You're on the list.";
    form.reset();
  });
});