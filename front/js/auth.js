document.addEventListener("DOMContentLoaded", function () {
  // ================= SIGN UP =================

  const signupForm = document.getElementById("signupForm");

  if (signupForm) {
    const fullName = document.getElementById("fullName");
    const contact = document.getElementById("contact");
    const contactType = document.getElementById("contactType");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const errorEl = document.getElementById("formError");
    const submitBtn = document.querySelector(".auth-btn");

    const strongPasswordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    function showError(message) {
      errorEl.style.color = "#d64545";
      errorEl.textContent = message;
    }

    function clearError() {
      errorEl.textContent = "";
    }

    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      clearError();

      if (!fullName.value.trim()) {
        return showError("Please enter your full name.");
      }

      if (!contact.value.trim()) {
        return showError("Please enter your email or phone number.");
      }

      if (!contactType.value) {
        return showError("Please select email or phone.");
      }

      if (!strongPasswordPattern.test(password.value)) {
        return showError(
          "Password must contain letters, numbers, symbols and be at least 8 characters.",
        );
      }

      if (password.value !== confirmPassword.value) {
        return showError("Passwords do not match.");
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account...";

      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            fullName: fullName.value.trim(),

            contact: contact.value.trim(),

            contactType: contactType.value,

            password: password.value,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create account";

          return showError(data.message || "Unable to create account.");
        }

        setCustomerToken(data.token);

        setCustomerSession({
          name: data.user.name,

          contact: data.user.contact,
        });

        window.location.href = "index.html";
      } catch (err) {
        submitBtn.disabled = false;

        submitBtn.textContent = "Create account";

        showError("Could not connect to server.");
      }
    });
  }

  // ================= SIGN IN =================

  const signinForm = document.getElementById("signinForm");

  if (signinForm) {
    const loginContact = document.getElementById("loginContact");

    const loginPassword = document.getElementById("loginPassword");

    const errorEl = document.getElementById("formError");

    const submitBtn = document.getElementById("signinSubmitBtn");

    function showError(message) {
      errorEl.style.color = "#d64545";

      errorEl.textContent = message;
    }

    signinForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!loginContact.value.trim()) {
        return showError("Enter your email or phone number.");
      }

      if (!loginPassword.value.trim()) {
        return showError("Enter your password.");
      }

      submitBtn.disabled = true;

      submitBtn.textContent = "Signing in...";

      try {
        const res = await fetch(`${API_BASE_URL}/auth/signin`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contact: loginContact.value.trim(),

            password: loginPassword.value,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          submitBtn.disabled = false;

          submitBtn.textContent = "Sign in";

          return showError(data.message || "Login failed.");
        }

        setCustomerToken(data.token);

        setCustomerSession({
          name: data.user.name,

          contact: data.user.contact,
        });

        errorEl.style.color = "#2e7d32";

        errorEl.textContent = "Signed in. Redirecting...";

        setTimeout(() => {
          window.location.href = "index.html";
        }, 700);
      } catch (err) {
        submitBtn.disabled = false;

        submitBtn.textContent = "Sign in";

        showError("Could not connect to server.");
      }
    });
  }
});
