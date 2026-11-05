/* Browser-local registration and login; this is not server-side authentication. */
(function () {
  "use strict";

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabs = document.getElementById("auth-tabs");
  const loginError = document.getElementById("login-error");
  const loginResend = document.getElementById("login-resend");

  function safeNextPage() {
    const requested = new URLSearchParams(window.location.search).get("next") || "index.html";
    return ["index.html", "compare.html", "expenses.html", "add.html"].includes(requested) ? requested : "index.html";
  }

  function showMode(mode) {
    const selected = mode === "register" ? "register" : "login";
    loginForm.classList.toggle("hidden", selected !== "login");
    registerForm.classList.toggle("hidden", selected !== "register");
    tabs.querySelectorAll("[data-auth-mode]").forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === selected));
    document.getElementById("auth-eyebrow").textContent = selected === "login" ? "YOUR PERSONAL SPACE" : "A BETTER VIEW STARTS HERE";
    document.getElementById("auth-title").textContent = selected === "login" ? "Welcome home." : "Make it personal.";
    document.getElementById("auth-subtitle").textContent = selected === "login"
      ? "Sign in with your email and password."
      : "Create your secure Money Management account.";
    Finova.applyTranslations();
  }

  function initializeLanguage() {
    Finova.initLanguageSelector(document.getElementById("auth-language-picker"));
  }

  function updatePasswordStrength() {
    const input = document.getElementById("register-password");
    const status = document.getElementById("password-strength");
    const strength = Finova.passwordStrength(input.value);
    status.dataset.strength = strength;
    status.textContent = input.value
      ? `${Finova.translate("Password strength")}: ${Finova.translate(strength[0].toUpperCase() + strength.slice(1))}`
      : `${Finova.translate("Password strength")}: —`;
  }

  document.querySelectorAll("[data-auth-mode]").forEach((tab) => tab.addEventListener("click", () => showMode(tab.dataset.authMode)));
  document.querySelectorAll(".password-toggle").forEach((button) => button.addEventListener("click", () => {
    const input = button.closest(".password-field").querySelector("input");
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.textContent = Finova.translate(visible ? "Hide" : "Show");
    button.setAttribute("aria-label", Finova.translate(visible ? "Hide password" : "Show password"));
  }));
  document.getElementById("register-password").addEventListener("input", updatePasswordStrength);
  window.addEventListener("finova:language-changed", updatePasswordStrength);

  FinovaEmailVerification.bindResend(
    loginResend,
    () => document.getElementById("login-email").value,
    loginError
  );

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginError.textContent = "";
    loginResend.classList.add("hidden");
    if (!loginForm.reportValidity()) return;
    const submit = loginForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      await Finova.signIn(
        document.getElementById("remember-me").checked,
        document.getElementById("login-email").value.trim(),
        document.getElementById("login-password").value
      );
      window.location.replace(safeNextPage());
    } catch (error) {
      console.error("FINOVA local sign-in failed.", error);
      loginError.textContent = Finova.authErrorMessage(error);
      if (error.code === "email_not_confirmed") {
        if (error.email) document.getElementById("login-email").value = error.email;
        loginResend.classList.remove("hidden");
      }
    } finally {
      submit.disabled = false;
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorNode = document.getElementById("register-error");
    errorNode.textContent = "";
    errorNode.classList.remove("auth-success");
    if (!registerForm.reportValidity()) return;
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const username = document.getElementById("register-username").value.trim();
    const dob = document.getElementById("register-dob").value;
    const password = document.getElementById("register-password").value;
    const confirmation = document.getElementById("register-confirm").value;
    if (!name || !email || !username || !dob) {
      errorNode.textContent = "Complete all required fields before creating your account.";
      return;
    }
    if (new Date(`${dob}T12:00:00`) >= new Date(`${Finova.todayISO()}T12:00:00`)) {
      errorNode.textContent = "Enter a date of birth in the past.";
      return;
    }
    if (!Finova.isStrongPassword(password)) {
      errorNode.textContent = "Use at least 8 characters with uppercase, lowercase, a number and a special character.";
      document.getElementById("register-password").focus();
      return;
    }
    if (password !== confirmation) {
      errorNode.textContent = "Those passwords don't match yet.";
      document.getElementById("register-confirm").focus();
      return;
    }
    const submit = registerForm.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const registration = await Finova.registerProfile(
        name, email, username, password, dob,
        document.getElementById("register-remember").checked
      );
      if (registration.requiresEmailConfirmation || !Finova.isEmailVerified(Finova.getAuthUser())) {
        FinovaEmailVerification.markEmailSent();
        window.location.replace(`verify-email.html?email=${encodeURIComponent(email)}`);
        return;
      }
      window.location.replace(safeNextPage());
    } catch (error) {
      console.error("FINOVA profile registration failed.", error);
      errorNode.textContent = Finova.authErrorMessage(error);
    } finally {
      submit.disabled = false;
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    if (!await Finova.ready) return;
    document.getElementById("register-dob").max = Finova.todayISO();
    initializeLanguage();
    showMode(localStorage.getItem("finova.auth.has-account") === "true" ? "login" : "register");
    const params = new URLSearchParams(window.location.search);
    const pendingEmail = params.get("email");
    if (pendingEmail) document.getElementById("login-email").value = pendingEmail;
    if (params.get("unverified") === "1") {
      showMode("login");
      loginError.textContent = "Please verify your email before accessing your account. Resend the verification email below.";
      loginResend.classList.remove("hidden");
    }
  });
})();
