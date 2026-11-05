/* Add or edit a transaction, keeping every original amount and currency intact. */
(function () {
  "use strict";
  const form = document.getElementById("transaction-form");
  const typeInput = document.getElementById("transaction-type");
  const categorySelect = document.getElementById("category");
  const placeLabel = document.getElementById("place-label");
  const amountInput = document.getElementById("amount");
  const currencyInput = document.getElementById("currency");
  const editingId = new URLSearchParams(window.location.search).get("id");
  let editingTransaction = null;

  function populateCategoryOptions(selected) {
    const categories = typeInput.value === "income" ? Finova.incomeCategories : Finova.expenseCategories;
    categorySelect.replaceChildren(...categories.map((category) => new Option(category, category)));
    if (selected && categories.includes(selected)) categorySelect.value = selected;
  }

  function setType(type, selectedCategory) {
    typeInput.value = type;
    document.querySelectorAll(".type-option").forEach((button) => {
      button.classList.toggle("active", button.dataset.type === type);
      button.setAttribute("aria-pressed", String(button.dataset.type === type));
    });
    placeLabel.textContent = type === "income" ? "Where did the money come from?" : "Where did you spend it?";
    populateCategoryOptions(selectedCategory);
  }

  function populateForm(transaction) {
    editingTransaction = transaction;
    if (!transaction) return;
    document.getElementById("form-page-title").innerHTML = 'Update the details<span class="heading-dot">.</span>';
    document.title = "Edit transaction · Money Management";
    document.getElementById("save-button").innerHTML = "<span>✓</span> Save changes";
    setType(transaction.type, transaction.category);
    amountInput.value = transaction.amount;
    currencyInput.value = transaction.currency;
    document.getElementById("title").value = transaction.title || "";
    document.getElementById("place").value = transaction.place || "";
    document.getElementById("date").value = transaction.date || Finova.todayISO();
    document.getElementById("payment-method").value = transaction.paymentMethod || "";
    document.getElementById("description").value = transaction.description || "";
  }

  function showSuccess() {
    const overlay = document.getElementById("success-overlay");
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    document.getElementById("success-done").focus();
  }

  document.querySelectorAll(".type-option").forEach((button) => button.addEventListener("click", () => setType(button.dataset.type)));
  document.getElementById("reset-form").addEventListener("click", () => {
    window.setTimeout(() => {
      setType("expense");
      document.getElementById("date").value = Finova.todayISO();
      Finova.fillCurrencySelect(currencyInput, Finova.getPreferredCurrency());
    }, 0);
  });
  document.getElementById("success-done").addEventListener("click", () => {
    if (editingTransaction) window.location.href = "expenses.html";
    else window.location.href = "index.html";
  });
  document.getElementById("success-overlay").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) document.getElementById("success-done").click();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const amount = Number(amountInput.value);
    const currency = currencyInput.value.trim().toUpperCase();
    if (!Number.isFinite(amount) || amount <= 0) {
      amountInput.setCustomValidity("Enter an amount greater than zero.");
      amountInput.reportValidity();
      amountInput.setCustomValidity("");
      return;
    }
    if (!Finova.currencies.some((item) => item.code === currency)) {
      currencyInput.setCustomValidity("Choose a supported currency from the suggestions.");
      currencyInput.reportValidity();
      currencyInput.setCustomValidity("");
      return;
    }
    const transaction = {
      id: editingTransaction ? editingTransaction.id : (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`),
      type: typeInput.value,
      title: document.getElementById("title").value.trim(),
      amount,
      currency,
      category: categorySelect.value,
      place: document.getElementById("place").value.trim(),
      date: document.getElementById("date").value,
      paymentMethod: document.getElementById("payment-method").value,
      description: document.getElementById("description").value.trim()
    };
    if (transaction.type === "expense" && !Finova.canSpend(amount, currency, editingTransaction?.id)) {
      Finova.notify(`This expense is more than your available ${currency} wallet balance. Add money or reduce the amount.`, "error");
      return;
    }
    const transactions = Finova.getTransactions();
    const updated = editingTransaction
      ? transactions.map((item) => item.id === editingTransaction.id ? transaction : item)
      : [transaction, ...transactions];
    if (!await Finova.saveTransactions(updated)) return;
    Finova.notify(editingTransaction ? "Transaction changes saved." : "Transaction saved.");
    showSuccess();
  });

  document.addEventListener("DOMContentLoaded", async () => {
    if (!await Finova.ready) return;
    Finova.fillCurrencySelect(currencyInput, Finova.getPreferredCurrency());
    document.getElementById("date").value = Finova.todayISO();
    setType("expense");
    if (editingId) {
      const authorized = await Finova.requirePasswordConfirmation({
        title: "Edit this transaction?",
        message: "Verify your password before viewing or changing its details."
      });
      if (!authorized) {
        window.location.replace("expenses.html");
        return;
      }
      const transaction = Finova.getTransactions().find((item) => item.id === editingId);
      if (transaction) populateForm(transaction);
      else Finova.notify("That transaction could not be found.", "error");
    }
    Finova.applyTranslations();
  });
  window.addEventListener("finova:currency-changed", () => {
    if (!editingId && !amountInput.value) {
      Finova.fillCurrencySelect(currencyInput, Finova.getPreferredCurrency());
    }
  });
  window.addEventListener("finova:language-changed", () => {
    setType(typeInput.value, categorySelect.value);
    Finova.applyTranslations();
  });
})();
