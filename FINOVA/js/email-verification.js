/* Shared resend cooldown and button behavior for the signup and login flows. */
(function () {
  "use strict";

  const COOLDOWN_KEY = "finova.auth.verification-resend-until";
  const COOLDOWN_SECONDS = 60;

  function remainingSeconds() {
    const until = Number(sessionStorage.getItem(COOLDOWN_KEY) || 0);
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }

  function markEmailSent() {
    sessionStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_SECONDS * 1000));
  }

  function bindResend(button, getEmail, statusNode) {
    if (!button) return;
    const updateButton = () => {
      const seconds = remainingSeconds();
      button.disabled = seconds > 0;
      button.textContent = seconds > 0 ? `Resend available in ${seconds}s` : "Resend verification email";
    };
    button.addEventListener("click", async () => {
      const email = String(getEmail() || "").trim();
      if (!email) {
        statusNode.textContent = "Enter your email address first.";
        return;
      }
      button.disabled = true;
      statusNode.textContent = "";
      statusNode.classList.remove("auth-success");
      try {
        await Finova.resendVerificationEmail(email);
        markEmailSent();
        statusNode.classList.add("auth-success");
        statusNode.textContent = "A new verification email has been sent.";
      } catch (error) {
        console.error("FINOVA verification email could not be resent.", error);
        statusNode.textContent = Finova.authErrorMessage(error);
      }
      updateButton();
    });
    updateButton();
    window.setInterval(updateButton, 1000);
  }

  window.FinovaEmailVerification = { bindResend, markEmailSent, remainingSeconds };
})();
