/* Overview page: live totals, recent activity and current-month summary. */
(function () {
  "use strict";
  let chart;
  const DAILY_QUOTES = [
    { text: "Welcome back. Small steps create remarkable futures.", highlight: "remarkable futures" },
    { text: "Your journey to financial freedom begins with today's choices.", highlight: "financial freedom" },
    { text: "Wealth is built quietly, one wise decision at a time.", highlight: "one wise decision" },
    { text: "Make your money work as beautifully as your dreams.", highlight: "your dreams" },
    { text: "A little discipline today, a lifetime of freedom tomorrow.", highlight: "freedom tomorrow" },
    { text: "Do not save what is left after spending, but spend what is left after saving.", highlight: "what is left after saving" },
    { text: "The art of wealth is not having more, but needing less.", highlight: "needing less" },
    { text: "Great fortunes begin with small acts of discipline.", highlight: "small acts of discipline" },
    { text: "Time is your greatest investment. Use it wisely.", highlight: "greatest investment" },
    { text: "Build a life where peace is richer than possessions.", highlight: "peace is richer" },
    { text: "Elegance is knowing where every rupee belongs.", highlight: "every rupee" },
    { text: "Financial freedom is the ultimate luxury.", highlight: "ultimate luxury" },
    { text: "Think wisely. Spend mindfully. Live freely.", highlight: "Live freely" },
    { text: "Let your habits create the wealth your dreams deserve.", highlight: "wealth your dreams deserve" },
    { text: "True wealth is measured in freedom, not numbers.", highlight: "freedom, not numbers" }
  ];
  let selectedQuoteIndex = null;

  function greetingForHour(hour) {
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function initializeGreeting() {
    const quoteKey = `finova.last-overview-quote.v1.${Finova.getCurrentUsername() || "guest"}`;
    const profile = Finova.getProfile();
    if (!profile) return;
    const greetingNode = document.getElementById("personalized-greeting");
    const quoteNode = document.getElementById("daily-quote");
    if (!greetingNode || !quoteNode) return;

    greetingNode.textContent = `${Finova.translate(greetingForHour(new Date().getHours()))}, ${profile.name}!`;

    if (selectedQuoteIndex === null) {
      let previousIndex = -1;
      try {
        const previous = localStorage.getItem(quoteKey);
        previousIndex = previous === null ? -1 : Number(previous);
      } catch (error) {
        console.warn("FINOVA could not read the previous daily quote.", error);
      }
      const availableIndices = DAILY_QUOTES.map((_, index) => index).filter((index) => index !== previousIndex);
      selectedQuoteIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      try {
        localStorage.setItem(quoteKey, String(selectedQuoteIndex));
      } catch (error) {
        console.warn("FINOVA could not save the selected daily quote.", error);
      }
    }
    const quote = DAILY_QUOTES[selectedQuoteIndex];
    const translatedText = Finova.translate(quote.text);
    const translatedHighlight = Finova.translate(quote.highlight);
    const highlight = translatedText === quote.text ? quote.highlight : translatedHighlight;
    const [before, after] = translatedText.split(highlight);
    quoteNode.innerHTML = translatedText.includes(highlight)
      ? `${Finova.escapeHTML(before)}<span class="quote-highlight">${Finova.escapeHTML(highlight)}</span>${Finova.escapeHTML(after)}`
      : Finova.escapeHTML(translatedText);
    Finova.applyTranslations();
  }

  function animateCount(element, value, formatter) {
    if (!element) return;
    const end = Number(value) || 0;
    const start = 0;
    const duration = 650;
    const started = performance.now();
    function frame(now) {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatter(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function monthTransactions(transactions, date) {
    const month = date.getMonth();
    const year = date.getFullYear();
    return transactions.filter((transaction) => {
      const transactionDate = new Date(`${transaction.date}T12:00:00`);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
  }

  function currentMonthLabel(date) {
    return new Intl.DateTimeFormat(Finova.getLocale(), { month: "long", year: "numeric" }).format(date);
  }

  function renderRecent(transactions) {
    const container = document.getElementById("recent-transactions");
    if (!container) return;
    const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    if (!recent.length) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">✳</span><h3>Your story starts here</h3><p>Add a transaction to see your activity.</p><a class="button button-secondary" href="add.html">Add transaction</a></div>';
      return;
    }
    container.innerHTML = recent.map((transaction, index) => {
      const income = transaction.type === "income";
      const symbol = income ? "↙" : "↗";
      const place = transaction.place || transaction.category || "Uncategorized";
      return `<div class="transaction-row" style="animation-delay:${index * 45}ms">
        <span class="transaction-symbol${income ? " income" : ""}">${symbol}</span>
        <span class="transaction-row-info"><strong>${Finova.escapeHTML(transaction.title)}</strong><small>${Finova.escapeHTML(place)} · ${Finova.dateFromISO(transaction.date, { month: "short", day: "numeric" })}</small></span>
        <span class="transaction-row-amount ${income ? "income" : "expense"}">${income ? "+" : "−"}${Finova.formatCurrency(transaction.amount, transaction.currency)}<small>${Finova.escapeHTML(transaction.category || "Other")}</small></span>
      </div>`;
    }).join("");
  }

  function renderChart(incomeValue, expenseValue, currency) {
    const canvas = document.getElementById("overview-chart");
    if (!canvas || typeof Chart === "undefined") return;
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [{
          data: [incomeValue, expenseValue],
          backgroundColor: ["rgba(89, 214, 160, .78)", "rgba(130, 137, 255, .8)"],
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 29
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => Finova.formatCurrency(context.raw, currency) } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#8492aa", font: { size: 9 } }, border: { display: false } },
          y: { beginAtZero: true, grid: { color: "rgba(151,174,218,.08)" }, ticks: { color: "#71809a", font: { size: 8 }, maxTicksLimit: 4, callback: (value) => Finova.formatCurrency(value, currency) }, border: { display: false } }
        }
      }
    });
  }

  async function renderDashboard() {
    const transactions = Finova.getTransactions();
    const preferred = Finova.getPreferredCurrency();
    const balanceNote = document.getElementById("balance-caption");
    const availableByCurrency = Finova.getWalletBalances(transactions);
    const availableRows = Object.entries(availableByCurrency).map(([currency, amount]) => ({ currency, amount }));
    const availableBalance = await Finova.convertTransactions(availableRows, preferred, (row) => row.amount);
    if (availableBalance.converted) {
      Finova.animateNumber(document.getElementById("balance-total"), availableBalance.value, preferred);
      balanceNote.textContent = Object.keys(availableByCurrency).length > 1 ||
        Object.keys(availableByCurrency).some((currency) => currency !== preferred)
        ? `Estimated conversion to ${preferred} · rates dated ${availableBalance.ratesDate}`
        : "Based on wallet top-ups, income, and expenses";
    } else {
      document.getElementById("balance-total").textContent = Finova.groupedText(availableByCurrency, true);
      balanceNote.textContent = "Exchange rates unavailable · balances shown separately by currency";
    }
    const walletList = document.getElementById("wallet-balance-list");
    if (walletList) {
      const entries = Object.entries(availableByCurrency);
      walletList.innerHTML = entries.length
        ? entries.map(([currency, amount]) => `<span class="wallet-currency-balance"><small>${Finova.escapeHTML(currency)}</small><strong>${Finova.formatCurrency(amount, currency)}</strong></span>`).join("")
        : `<span class="wallet-empty">No wallet funds yet. Add money or record income to get started.</span>`;
    }
    const incomeNote = document.getElementById("overview-conversion-note");
    await Finova.displayTotal(document.getElementById("income-total"), transactions, preferred, "income", incomeNote);
    await Finova.displayTotal(document.getElementById("expense-total"), transactions, preferred, "expense");
    const count = document.getElementById("transaction-count");
    animateCount(count, transactions.length, (value) => Math.round(value).toLocaleString());
    renderRecent(transactions);

    const now = new Date();
    const month = monthTransactions(transactions, now);
    document.getElementById("summary-month").textContent = currentMonthLabel(now);
    const income = month.filter((transaction) => transaction.type === "income");
    const expenses = month.filter((transaction) => transaction.type === "expense");
    const monthIncome = await Finova.convertTransactions(income, preferred);
    const monthExpenses = await Finova.convertTransactions(expenses, preferred);
    if (monthIncome.converted && monthExpenses.converted) {
      Finova.animateNumber(document.getElementById("month-income"), monthIncome.value, preferred);
      Finova.animateNumber(document.getElementById("month-expenses"), monthExpenses.value, preferred);
      const net = monthIncome.value - monthExpenses.value;
      const netNode = document.getElementById("month-net");
      Finova.animateNumber(netNode, Math.abs(net), preferred, { prefix: net < 0 ? "−" : "+" });
      netNode.className = net < 0 ? "negative-text" : "positive-text";
      renderChart(monthIncome.value, monthExpenses.value, preferred);
      document.getElementById("overview-conversion-note").textContent = month.length && (monthIncome.groups && Object.keys(monthIncome.groups).length > 1 || monthExpenses.groups && Object.keys(monthExpenses.groups).length > 1)
        ? `Estimated conversions · rates dated ${monthIncome.ratesDate || monthExpenses.ratesDate}`
        : "";
    } else {
      document.getElementById("month-income").textContent = Finova.groupedText(Finova.groupAmounts(income), false);
      document.getElementById("month-expenses").textContent = Finova.groupedText(Finova.groupAmounts(expenses), false);
      document.getElementById("month-net").textContent = Finova.groupedText(Finova.groupAmounts(month.map((transaction) => ({ ...transaction, amount: transaction.type === "expense" ? -Number(transaction.amount) : Number(transaction.amount) }))), true);
      document.getElementById("month-net").className = "";
      document.getElementById("overview-conversion-note").textContent = "Exchange rates unavailable · monthly totals shown separately by currency";
      if (chart) { chart.destroy(); chart = null; }
    }
    if (!month.length) {
      document.getElementById("month-income").textContent = Finova.formatCurrency(0, preferred);
      document.getElementById("month-expenses").textContent = Finova.formatCurrency(0, preferred);
      document.getElementById("month-net").textContent = Finova.formatCurrency(0, preferred);
      document.getElementById("overview-conversion-note").textContent = "";
      renderChart(0, 0, preferred);
    }
    Finova.applyTranslations();
  }

  function initializeWalletTopUp() {
    const dialog = document.getElementById("wallet-topup-dialog");
    const form = document.getElementById("wallet-topup-form");
    const amount = document.getElementById("wallet-topup-amount");
    const currency = document.getElementById("wallet-topup-currency");
    const open = document.getElementById("open-wallet-topup");
    if (!dialog || !form || !open) return;
    Finova.fillCurrencySelect(currency, Finova.getPreferredCurrency());
    const close = () => {
      dialog.classList.remove("visible");
      dialog.setAttribute("aria-hidden", "true");
      form.reset();
      Finova.fillCurrencySelect(currency, Finova.getPreferredCurrency());
    };
    open.addEventListener("click", () => {
      dialog.classList.add("visible");
      dialog.setAttribute("aria-hidden", "false");
      amount.focus();
    });
    document.getElementById("close-wallet-topup").addEventListener("click", close);
    document.getElementById("cancel-wallet-topup").addEventListener("click", close);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = document.getElementById("save-wallet-topup");
      if (submit.disabled) return;
      submit.disabled = true;
      try {
        if (await Finova.addWalletTopUp(amount.value, currency.value, document.getElementById("wallet-topup-note").value)) {
          Finova.notify("Money added to your wallet.");
          close();
        }
      } catch (error) {
        Finova.notify(error.message, "error");
      } finally {
        submit.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (!await Finova.ready) return;
    initializeGreeting();
    await renderDashboard();
    initializeWalletTopUp();
  });
  window.addEventListener("finova:data-changed", renderDashboard);
  window.addEventListener("finova:currency-changed", renderDashboard);
  window.addEventListener("finova:language-changed", () => {
    initializeGreeting();
    renderDashboard();
  });
})();
