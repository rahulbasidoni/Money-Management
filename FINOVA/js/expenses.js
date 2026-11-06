/* Transaction ledger with searchable filters, safe editing and confirmed deletion. */
(function () {
  "use strict";
  const search = document.getElementById("search-transactions");
  const typeFilter = document.getElementById("filter-type");
  const categoryFilter = document.getElementById("filter-category");
  const fromFilter = document.getElementById("filter-date-from");
  const toFilter = document.getElementById("filter-date-to");
  const sortFilter = document.getElementById("sort-transactions");
  const tableBody = document.getElementById("transactions-body");
  const importFile = document.getElementById("import-file");

  function populateCategories() {
    const categories = [...new Set(Finova.getTransactions().map((transaction) => transaction.category).filter(Boolean))].sort();
    const selected = categoryFilter.value;
    categoryFilter.replaceChildren(new Option("All categories", "all"));
    categories.forEach((category) => categoryFilter.add(new Option(category, category)));
    if (categories.includes(selected)) categoryFilter.value = selected;
  }

  function getFilteredTransactions() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = Finova.getTransactions().filter((transaction) => {
      const searchable = [transaction.title, transaction.place, transaction.description, transaction.category, transaction.paymentMethod].join(" ").toLocaleLowerCase();
      return (!query || searchable.includes(query))
        && (typeFilter.value === "all" || transaction.type === typeFilter.value)
        && (categoryFilter.value === "all" || transaction.category === categoryFilter.value)
        && (!fromFilter.value || transaction.date >= fromFilter.value)
        && (!toFilter.value || transaction.date <= toFilter.value);
    });
    const sort = sortFilter.value;
    filtered.sort((a, b) => {
      if (sort === "newest") return b.date.localeCompare(a.date);
      if (sort === "oldest") return a.date.localeCompare(b.date);
      if (sort === "amount-high") return a.currency.localeCompare(b.currency) || Number(b.amount) - Number(a.amount);
      if (sort === "amount-low") return a.currency.localeCompare(b.currency) || Number(a.amount) - Number(b.amount);
      return 0;
    });
    return filtered;
  }

  function render() {
    populateCategories();
    const all = Finova.getTransactions();
    const filtered = getFilteredTransactions();
    function animateBadge(el, target) {
      if (!el) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = target.toLocaleString();
        return;
      }
      const start = 0;
      const duration = 600;
      const startTime = performance.now();
      function step(now) {
        const p = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + (target - start) * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    animateBadge(document.getElementById("all-count"), all.length);
    animateBadge(document.getElementById("income-count"), all.filter((item) => item.type === "income").length);
    animateBadge(document.getElementById("expense-count"), all.filter((item) => item.type === "expense").length);
    document.getElementById("result-count").textContent = `(${filtered.length})`;
    tableBody.innerHTML = filtered.map((transaction) => {
      const income = transaction.type === "income";
      const details = [transaction.place, transaction.description].filter(Boolean).join(" · ");
      const editURL = `add.html?id=${encodeURIComponent(transaction.id)}`;
      return `<tr>
        <td><div class="table-transaction"><span class="transaction-symbol${income ? " income" : ""}">${income ? "↙" : "↗"}</span><span><strong>${Finova.escapeHTML(transaction.title)}</strong><small title="${Finova.escapeHTML(details)}">${Finova.escapeHTML(details || transaction.type)}</small></span></div></td>
        <td>${Finova.escapeHTML(transaction.category || "Other")}</td>
        <td>${Finova.dateFromISO(transaction.date, { month: "short", day: "numeric", year: "numeric" })}</td>
        <td>${Finova.escapeHTML(transaction.paymentMethod || "—")}</td>
        <td class="table-amount ${income ? "income" : "expense"}">${income ? "+" : "−"}${Finova.formatCurrency(transaction.amount, transaction.currency)}</td>
        <td><div class="table-actions"><a class="table-action" href="${editURL}" aria-label="Edit ${Finova.escapeHTML(transaction.title)}" title="Edit">✎</a><button type="button" class="table-action delete" data-delete="${Finova.escapeHTML(transaction.id)}" aria-label="Delete ${Finova.escapeHTML(transaction.title)}" title="Delete">×</button></div></td>
      </tr>`;
    }).join("");
    const empty = document.getElementById("empty-transactions");
    empty.classList.toggle("hidden", filtered.length > 0);
    document.querySelector(".table-wrap").classList.toggle("hidden", filtered.length === 0);
    tableBody.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", async () => {
      const transaction = all.find((item) => item.id === button.dataset.delete);
      if (!transaction || !await Finova.requirePasswordConfirmation({
        title: "Delete this transaction?",
        message: "Verify your password before deleting this financial record."
      })) return;
      if (!await Finova.confirmAction({
        title: `Delete "${transaction.title}"?`,
        message: "This transaction will be permanently removed.",
        confirmLabel: "Delete transaction",
        danger: true
      })) return;
      if (await Finova.saveTransactions(all.filter((item) => item.id !== transaction.id))) Finova.notify("Transaction deleted.");
    }));
    const backup = Finova.getAutomaticBackup();
    const backupStatus = document.getElementById("backup-status");
    backupStatus.textContent = backup?.savedAt
      ? `Automatic local backup available · ${new Intl.DateTimeFormat(Finova.getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(backup.savedAt))}`
      : "An automatic local backup is created before your next change.";
    Finova.applyTranslations();
  }

  [search, typeFilter, categoryFilter, fromFilter, toFilter, sortFilter].forEach((control) => {
    control.addEventListener(control === search ? "input" : "change", render);
  });
  document.getElementById("export-data").addEventListener("click", () => {
    const data = Finova.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `money-management-backup-${Finova.todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    Finova.notify("Your Money Management JSON backup has been exported.");
  });
  document.getElementById("import-data").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      if (!await Finova.requirePasswordConfirmation({
        title: "Restore Money Management data?",
        message: "Verify your password before replacing the transactions and wallet saved in this browser."
      })) return;
      const backup = JSON.parse(await file.text());
      if (!await Finova.confirmAction({
        title: "Replace your Money Management data?",
        message: "Importing this backup replaces your current transactions, wallet, and preferences.",
        confirmLabel: "Restore backup",
        danger: true
      })) return;
      await Finova.restoreData(backup);
      Finova.notify("Money Management data restored from the selected backup.");
    } catch (error) {
      console.error("FINOVA could not import the selected backup.", error);
      Finova.notify(error.message || "The selected backup could not be restored.", "error");
    } finally {
      importFile.value = "";
    }
  });
  const backupButton = document.createElement("button");
  backupButton.type = "button";
  backupButton.className = "button button-quiet";
  backupButton.textContent = "Restore auto-backup";
  backupButton.addEventListener("click", async () => {
    const backup = Finova.getAutomaticBackup();
    if (!backup || !Array.isArray(backup.transactions)) {
      Finova.notify("No automatic backup is available yet.", "error");
      return;
    }
    if (!await Finova.requirePasswordConfirmation({
      title: "Restore the automatic backup?",
      message: "Verify your password before restoring the previous local snapshot."
    })) return;
    if (!await Finova.confirmAction({
      title: "Restore the automatic backup?",
      message: "This replaces your current transactions, wallet, and preferences with the saved snapshot.",
      confirmLabel: "Restore backup",
      danger: true
    })) return;
    try {
      await Finova.restoreData({ ...backup, application: "FINOVA", wallet: backup.wallet || { initialBalances: {}, topUps: [] } });
      Finova.notify("The automatic local backup has been restored.");
    } catch (error) {
      console.error("FINOVA could not restore its automatic backup.", error);
      Finova.notify(error.message || "The automatic backup could not be restored.", "error");
    }
  });
  document.querySelector(".data-tools").appendChild(backupButton);
  window.addEventListener("finova:data-changed", render);
  window.addEventListener("finova:currency-changed", render);
  window.addEventListener("finova:language-changed", render);
  document.addEventListener("DOMContentLoaded", async () => {
    if (await Finova.ready) render();
  });
})();
