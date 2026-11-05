/* Browser-side Supabase client. This key is publishable; never put service-role keys here. */
(function () {
  "use strict";

  const projectUrl = "https://tymbblolpbwwxrnomtvi.supabase.co";
  const publishableKey = "sb_publishable_3JyIPfuEGk6aG1rhQ75N6w_U0TJL7lS";
  const rememberKey = "finova.auth.remember-session";
  let authStorageKey = "";

  function selectedStorage() {
    return localStorage.getItem(rememberKey) === "false" ? sessionStorage : localStorage;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("Supabase JS did not load. Check your internet connection and CDN access.");
  }

  const authStorage = {
    getItem(key) {
      authStorageKey = key;
      return selectedStorage().getItem(key);
    },
    setItem(key, value) {
      authStorageKey = key;
      const target = selectedStorage();
      const other = target === localStorage ? sessionStorage : localStorage;
      other.removeItem(key);
      target.setItem(key, value);
    },
    removeItem(key) {
      authStorageKey = key;
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  };

  window.setFinovaRememberSession = function (remember) {
    localStorage.setItem(rememberKey, String(Boolean(remember)));
    if (authStorageKey) {
      const target = selectedStorage();
      const other = target === localStorage ? sessionStorage : localStorage;
      const activeSession = target.getItem(authStorageKey);
      other.removeItem(authStorageKey);
      if (activeSession) target.setItem(authStorageKey, activeSession);
    }
  };

  window.FinovaSupabase = window.supabase.createClient(projectUrl, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: authStorage
    }
  });
})();
