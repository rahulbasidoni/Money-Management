/* Handles Supabase confirmation-link returns and the pending verification view. */
(function () {
  "use strict";

  const statusNode = document.getElementById("verification-status");
  const emailNode = document.getElementById("verification-email");
  const resendButton = document.getElementById("verification-resend");
  const resendActions = document.getElementById("verification-actions");
  const dashboardButton = document.getElementById("verification-dashboard");

  function showInvalidLink(error) {
    document.getElementById("verification-eyebrow").textContent = "LINK NOT VALID";
    document.getElementById("verification-title").textContent = "This link didn't work.";
    document.getElementById("verification-message").textContent = Finova.authErrorMessage(error);
    document.getElementById("verification-detail").textContent = "Request a fresh verification email and use the newest link.";
    document.getElementById("verification-illustration").classList.add("verification-illustration-error");
    statusNode.textContent = "";
  }

  function showVerified(user) {
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || "there";
    document.getElementById("verification-eyebrow").textContent = "EMAIL VERIFIED";
    document.getElementById("verification-title").textContent = "You're all set.";
    document.getElementById("verification-message").textContent = `Welcome to FINOVA, ${name}!`;
    document.getElementById("verification-detail").textContent = "Your email is verified. Your secure financial workspace is ready.";
    document.getElementById("verification-illustration").classList.add("verification-illustration-success");
    resendActions.classList.add("hidden");
    dashboardButton.classList.remove("hidden");
    statusNode.textContent = "";
  }

  function verificationLinkError(params) {
    const code = params.get("error_code") || params.get("error") || "";
    const description = params.get("error_description") || "";
    if (!code && !description) return null;
    return { code, message: `${code} ${description}`.trim() };
  }

  FinovaEmailVerification.bindResend(
    resendButton,
    () => emailNode.textContent,
    statusNode
  );

  document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email") || "";
    emailNode.textContent = email;

    if (await Finova.ready) {
      const user = Finova.getAuthUser();
      if (user?.email && !emailNode.textContent) emailNode.textContent = user.email;
      if (Finova.isEmailVerified(user)) {
        showVerified(user);
      } else {
        const linkError = verificationLinkError(params);
        if (linkError) showInvalidLink(linkError);
        else if (!emailNode.textContent) {
          showInvalidLink({ code: "otp_expired", message: "No email address was provided for this verification link." });
          document.getElementById("verification-detail").textContent = "Return to registration and request a new verification email.";
          resendButton.disabled = true;
        }
      }
    } else {
      showInvalidLink({ message: "We couldn't verify your session. Check your connection and try again." });
    }

    window.setTimeout(() => document.querySelector(".loading-screen")?.remove(), 500);
  });
})();
