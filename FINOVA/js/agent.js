/* ========================================================
   FINOVA AGENT – Intelligent Financial Assistant Engine
   ======================================================== */
(function () {
  "use strict";

  const STORAGE_KEY_PREFIX = "finova.agent.history.v1.";
  const messagesContainer = document.getElementById("agent-messages");
  const chatForm = document.getElementById("agent-chat-form");
  const userInput = document.getElementById("agent-user-input");
  const typingIndicator = document.getElementById("agent-typing-indicator");
  const clearChatBtn = document.getElementById("agent-clear-chat");
  const recordsCountEl = document.getElementById("agent-records-count");

  let conversationHistory = [];
  let lastContext = null;
  let chartCounter = 0;

  function getUserKey() {
    const username = Finova.getCurrentUsername ? Finova.getCurrentUsername() : "guest";
    return `${STORAGE_KEY_PREFIX}${username}`;
  }

  function loadHistory() {
    try {
      const saved = localStorage.getItem(getUserKey());
      if (saved) {
        conversationHistory = JSON.parse(saved);
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          renderAllMessages();
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load agent history", e);
    }
    renderWelcomeMessage();
  }

  function saveHistory() {
    try {
      localStorage.setItem(getUserKey(), JSON.stringify(conversationHistory.slice(-40)));
    } catch (e) {
      console.warn("Could not save agent history", e);
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  function formatTime(timestamp) {
    const d = timestamp ? new Date(timestamp) : new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // --- Financial Calculation Helpers ---
  function getFinancialSummary() {
    const transactions = Finova.getTransactions ? Finova.getTransactions() : [];
    const preferredCurrency = Finova.getPreferredCurrency ? Finova.getPreferredCurrency() : "INR";
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const expensesAll = transactions.filter((t) => t.type === "expense");
    const incomeAll = transactions.filter((t) => t.type === "income");

    const currentMonthExpenses = expensesAll.filter((t) => t.date && t.date.slice(0, 7) === currentMonthKey);
    const currentMonthIncome = incomeAll.filter((t) => t.date && t.date.slice(0, 7) === currentMonthKey);

    const prevMonthExpenses = expensesAll.filter((t) => t.date && t.date.slice(0, 7) === prevMonthKey);
    const prevMonthIncome = incomeAll.filter((t) => t.date && t.date.slice(0, 7) === prevMonthKey);

    // Sum helper
    const sum = (arr) => arr.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Category breakdown
    const categoryTotals = {};
    const relevantExpenses = currentMonthExpenses.length > 0 ? currentMonthExpenses : expensesAll;
    relevantExpenses.forEach((t) => {
      const cat = t.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(t.amount) || 0);
    });

    const sortedCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const totalExpenseAmount = sum(relevantExpenses);
    const topCategory = sortedCategories[0] || null;

    // Income breakdown
    const incomeTotals = {};
    const relevantIncome = currentMonthIncome.length > 0 ? currentMonthIncome : incomeAll;
    relevantIncome.forEach((t) => {
      const cat = t.category || "Other";
      incomeTotals[cat] = (incomeTotals[cat] || 0) + (Number(t.amount) || 0);
    });
    const sortedIncomeCategories = Object.entries(incomeTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const totalIncomeAmount = sum(relevantIncome);

    // Wallet balances
    const walletBalances = Finova.getWalletBalances ? Finova.getWalletBalances(transactions) : {};

    return {
      transactions,
      preferredCurrency,
      totalCount: transactions.length,
      currentMonthKey,
      prevMonthKey,
      expensesAll,
      incomeAll,
      currentMonthExpenses,
      currentMonthIncome,
      prevMonthExpenses,
      prevMonthIncome,
      curMonthExpenseTotal: sum(currentMonthExpenses),
      curMonthIncomeTotal: sum(currentMonthIncome),
      prevMonthExpenseTotal: sum(prevMonthExpenses),
      prevMonthIncomeTotal: sum(prevMonthIncome),
      totalExpenseAmount,
      totalIncomeAmount,
      sortedCategories,
      topCategory,
      sortedIncomeCategories,
      walletBalances,
      isCurrentMonthSample: currentMonthExpenses.length > 0
    };
  }

  // --- Intent Classifier & Intelligence Engine ---
  async function processAgentQuery(queryText) {
    const raw = (queryText || "").trim();
    const query = raw.toLowerCase();
    const data = getFinancialSummary();
    const cur = data.preferredCurrency;
    const fmt = (amt, c = cur) => Finova.formatCurrency(amt, c);

    // 1. Where does most of my money go? / Analyze spending
    if (
      query.includes("where does most of my money go") ||
      query.includes("where did most of my money go") ||
      query.includes("analyze my spending") ||
      query.includes("analyse my spending") ||
      query.includes("spending breakdown") ||
      (query.includes("spending") && (query.includes("most") || query.includes("highest") || query.includes("category")))
    ) {
      if (data.totalExpenseAmount === 0) {
        return {
          text: `You have no recorded expenses yet in your FINOVA account. Add a transaction to start analyzing your spending trends!`,
          followUps: ["Add transaction", "Analyze my income"]
        };
      }

      const top = data.topCategory;
      const topPct = data.totalExpenseAmount > 0 ? ((top.amount / data.totalExpenseAmount) * 100).toFixed(1) : 0;
      const periodLabel = data.isCurrentMonthSample ? "this month" : "across all recorded transactions";

      let analysis = `Based on your records ${periodLabel}, your total spending is **${fmt(data.totalExpenseAmount)}** across **${data.sortedCategories.length} categories**.\n\n`;
      analysis += `🏷️ **Most of your money goes to ${top.category}**, which accounts for **${fmt(top.amount)}** (**${topPct}%** of your total spending).\n\n`;

      if (data.sortedCategories.length > 1) {
        const second = data.sortedCategories[1];
        const secondPct = ((second.amount / data.totalExpenseAmount) * 100).toFixed(1);
        analysis += `Your second highest spending area is **${second.category}** at **${fmt(second.amount)}** (${secondPct}%).\n\n`;
      }

      analysis += `Here is your complete spending distribution:`;

      lastContext = { topic: "spending_reduction", topCategory: top.category, topAmount: top.amount, totalExpenses: data.totalExpenseAmount };

      return {
        text: analysis,
        chartType: "spending_donut",
        chartData: {
          categories: data.sortedCategories.slice(0, 6),
          total: data.totalExpenseAmount,
          currency: cur
        },
        followUps: [
          `How can I reduce spending on ${top.category}?`,
          "Compare this month and last month.",
          "Create a savings plan."
        ]
      };
    }

    // 2. How can I reduce it? / Help me reduce expenses
    if (
      query.includes("reduce it") ||
      query.includes("reduce expenses") ||
      query.includes("cut expenses") ||
      query.includes("save more money") ||
      query.includes("how to cut down")
    ) {
      const targetCat = (lastContext && lastContext.topCategory) || (data.topCategory && data.topCategory.category) || "Bills";
      const targetAmt = (lastContext && lastContext.topAmount) || (data.topCategory && data.topCategory.amount) || 1000;

      const cut5 = targetAmt * 0.05;
      const cut10 = targetAmt * 0.10;
      const cut20 = targetAmt * 0.20;

      let tips = "";
      if (targetCat.toLowerCase().includes("food")) {
        tips = `1. **Plan weekly meals**: Batch cooking and grocery lists typically lower unplanned food bills by 15-20%.\n2. **Audit dining out vs cooking**: Set a dedicated weekly eating-out allowance.\n3. **Smart grocery substitutions**: Buy staple items in bulk and avoid convenience-store markups.`;
      } else if (targetCat.toLowerCase().includes("bill") || targetCat.toLowerCase().includes("utilities")) {
        tips = `1. **Subscription Audit**: Review all recurring streaming, fitness, or cloud subscriptions; cancel unused services.\n2. **Utility Efficiency**: Optimize electricity and thermostat settings during peak hours.\n3. **Negotiate Plans**: Call broadband and mobile providers to ask for retention or promotional rates.`;
      } else if (targetCat.toLowerCase().includes("shopping") || targetCat.toLowerCase().includes("entertainment")) {
        tips = `1. **The 48-Hour Rule**: Wait 48 hours before purchasing non-essential items over ${fmt(1000)} to avoid impulse buys.\n2. **Unlink One-Click Payment**: Remove saved card details on shopping apps to add positive friction.\n3. **Set a hard weekend cap**: Withdraw or designate an exact leisure balance in your wallet.`;
      } else {
        tips = `1. **Track micro-transactions**: Set a daily threshold for miscellaneous purchases.\n2. **Set a category budget**: Cap ${targetCat} to a specific weekly target.\n3. **Automate savings first**: Transfer savings immediately on payday before discretionary spending.`;
      }

      let response = `To reduce your spending—especially in your highest area (**${targetCat}** at **${fmt(targetAmt)}**)—here are 3 concrete targets:\n\n`;
      response += `• **Conservative 5% cut**: Saves **${fmt(cut5)}/month** (${fmt(cut5 * 12)}/year)\n`;
      response += `• **Balanced 10% cut**: Saves **${fmt(cut10)}/month** (${fmt(cut10 * 12)}/year)\n`;
      response += `• **Aggressive 20% cut**: Saves **${fmt(cut20)}/month** (${fmt(cut20 * 12)}/year)\n\n`;
      response += `### Actionable Strategy for ${targetCat}:\n${tips}`;

      return {
        text: response,
        followUps: [
          "Create a savings plan.",
          "Compare this month and last month.",
          "Give me a monthly financial report."
        ]
      };
    }

    // 3. Compare this month and last month
    if (
      query.includes("compare this month and last month") ||
      query.includes("compare month") ||
      query.includes("comparison") ||
      (query.includes("last month") && query.includes("this month"))
    ) {
      const curExp = data.curMonthExpenseTotal;
      const prevExp = data.prevMonthExpenseTotal;
      const curInc = data.curMonthIncomeTotal;
      const prevInc = data.prevMonthIncomeTotal;

      const expDiff = curExp - prevExp;
      const expPct = prevExp > 0 ? ((expDiff / prevExp) * 100).toFixed(1) : (curExp > 0 ? "100" : "0");

      const incDiff = curInc - prevInc;
      const incPct = prevInc > 0 ? ((incDiff / prevInc) * 100).toFixed(1) : (curInc > 0 ? "100" : "0");

      const curNet = curInc - curExp;
      const prevNet = prevInc - prevExp;

      let msg = `Here is your side-by-side comparison between **Last Month** and **This Month**:\n\n`;
      msg += `📉 **Expenses**: ${fmt(prevExp)} ➔ **${fmt(curExp)}** `;
      if (expDiff > 0) msg += `(🔺 Increased by ${fmt(expDiff)} or +${expPct}%)\n`;
      else if (expDiff < 0) msg += `(🟢 Decreased by ${fmt(Math.abs(expDiff))} or ${expPct}%)\n`;
      else msg += `(Unchanged)\n`;

      msg += `📈 **Income**: ${fmt(prevInc)} ➔ **${fmt(curInc)}** `;
      if (incDiff > 0) msg += `(🟢 Increased by ${fmt(incDiff)} or +${incPct}%)\n`;
      else if (incDiff < 0) msg += `(🔻 Decreased by ${fmt(Math.abs(incDiff))} or ${incPct}%)\n`;
      else msg += `(Unchanged)\n\n`;

      msg += `⚖️ **Net Cash Flow**: Last month was **${prevNet >= 0 ? "+" : "−"}${fmt(Math.abs(prevNet))}**, and this month is **${curNet >= 0 ? "+" : "−"}${fmt(Math.abs(curNet))}**.`;

      return {
        text: msg,
        chartType: "month_compare_bar",
        chartData: {
          labels: ["Last Month", "This Month"],
          income: [prevInc, curInc],
          expenses: [prevExp, curExp],
          currency: cur
        },
        followUps: [
          "Where does most of my money go?",
          "How much can I save?",
          "Help me reduce expenses."
        ]
      };
    }

    // 4. Create a savings plan / How much can I save?
    if (
      query.includes("savings plan") ||
      query.includes("how much can i save") ||
      query.includes("create a savings") ||
      query.includes("saving target") ||
      query.includes("how to save")
    ) {
      const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
      const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
      const surplus = income - expenses;

      if (surplus <= 0 && income === 0) {
        return {
          text: `You have not recorded any income yet. To build an accurate savings plan, record your monthly income in the **Add transaction** page so Agent can calculate your exact net cash flow surplus!`,
          followUps: ["Add transaction", "Analyze my spending"]
        };
      }

      if (surplus <= 0) {
        return {
          text: `Currently, your recorded expenses (**${fmt(expenses)}**) match or exceed your income (**${fmt(income)}**), resulting in a net cash flow of **${fmt(surplus)}**.\n\n` +
            `To start saving, we should prioritize reducing your top expense area (**${data.topCategory?.category || "Expenses"}**). Even cutting 10% will liberate **${fmt((data.topCategory?.amount || expenses) * 0.1)}/month** into pure savings!`,
          followUps: ["Help me reduce expenses.", "Where does most of my money go?"]
        };
      }

      const p15 = surplus * 0.20;
      const p30 = surplus * 0.40;
      const p50 = surplus * 0.60;

      let plan = `Based on your monthly surplus of **${fmt(surplus)}** (Income: ${fmt(income)} − Expenses: ${fmt(expenses)}), here is your tailored **3-Tier Savings Plan**:\n\n`;
      plan += `🛡️ **1. Essential Buffer Plan (20% of surplus)**\n`;
      plan += `• Save: **${fmt(p15)} / month**\n`;
      plan += `• 6-Month Projection: **${fmt(p15 * 6)}** | 1-Year Projection: **${fmt(p15 * 12)}**\n\n`;

      plan += `⭐ **2. Balanced Growth Plan (Recommended · 40% of surplus)**\n`;
      plan += `• Save: **${fmt(p30)} / month**\n`;
      plan += `• 6-Month Projection: **${fmt(p30 * 6)}** | 1-Year Projection: **${fmt(p30 * 12)}**\n\n`;

      plan += `🚀 **3. Wealth Accelerator Plan (60% of surplus)**\n`;
      plan += `• Save: **${fmt(p50)} / month**\n`;
      plan += `• 6-Month Projection: **${fmt(p50 * 6)}** | 1-Year Projection: **${fmt(p50 * 12)}**\n\n`;
      plan += `💡 *Tip: If you have a specific goal (e.g. emergency fund or holiday), type "I want to save [amount]" and I will build an exact timeline for you!*`;

      return {
        text: plan,
        chartType: "savings_projection",
        chartData: {
          monthlySavings: [p15, p30, p50],
          labels: ["Buffer (20%)", "Balanced (40%)", "Accelerator (60%)"],
          currency: cur
        },
        followUps: [
          `I want to save ${fmt(50000)}`,
          "Help me reduce expenses.",
          "Give me a monthly financial report."
        ]
      };
    }

    // 5. Custom Goal target (e.g. "I want to save 50000")
    const goalMatch = query.match(/(?:save|goal|target)\s*(?:of)?\s*(?:rs|inr|\$|€|£|₹)?\s*([0-9,]+)/i);
    if (goalMatch) {
      const targetGoal = Number(goalMatch[1].replace(/,/g, ""));
      if (Number.isFinite(targetGoal) && targetGoal > 0) {
        const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
        const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
        const surplus = Math.max(income - expenses, 1);

        const balancedMonthly = surplus * 0.40;
        const monthsNeeded = Math.ceil(targetGoal / Math.max(balancedMonthly, 500));

        let res = `🎯 **Goal Roadmap for ${fmt(targetGoal)}**\n\n`;
        res += `• Target Goal: **${fmt(targetGoal)}**\n`;
        res += `• Available Monthly Surplus: **${fmt(surplus)}**\n`;
        res += `• Recommended Monthly Contribution: **${fmt(balancedMonthly)}** (40% of surplus)\n\n`;
        res += `At this pace, you will reach your goal in **${monthsNeeded} months**!\n`;
        res += `If you increase your monthly savings by trimming discretionary spending, you could reach it even sooner.`;

        return {
          text: res,
          followUps: ["Help me reduce expenses.", "Where does most of my money go?"]
        };
      }
    }

    // 6. Analyze my income
    if (
      query.includes("analyze my income") ||
      query.includes("income breakdown") ||
      query.includes("my earnings") ||
      query.includes("where did my income come from")
    ) {
      if (data.totalIncomeAmount === 0) {
        return {
          text: `You have no income transactions recorded yet. Add your salary or income entries in **Add transaction** to track earnings diversification!`,
          followUps: ["Add transaction", "Analyze my spending"]
        };
      }

      let res = `💰 **Income Analysis**\n\n`;
      res += `Total recorded income: **${fmt(data.totalIncomeAmount)}** across **${data.sortedIncomeCategories.length} stream(s)**.\n\n`;
      data.sortedIncomeCategories.forEach((item, idx) => {
        const pct = ((item.amount / data.totalIncomeAmount) * 100).toFixed(1);
        res += `${idx + 1}. **${item.category}**: ${fmt(item.amount)} (${pct}%)\n`;
      });

      return {
        text: res,
        followUps: ["Create a savings plan.", "Compare this month and last month.", "Give me a monthly financial report."]
      };
    }

    // 7. Monthly financial report
    if (
      query.includes("monthly financial report") ||
      query.includes("financial report") ||
      query.includes("monthly report") ||
      query.includes("summary report")
    ) {
      const inc = data.curMonthIncomeTotal;
      const exp = data.curMonthExpenseTotal;
      const net = inc - exp;
      const savingsRate = inc > 0 ? ((Math.max(net, 0) / inc) * 100).toFixed(1) : 0;

      let report = `📋 **FINOVA Monthly Financial Report (${data.currentMonthKey})**\n\n`;
      report += `• **Income Received**: ${fmt(inc)}\n`;
      report += `• **Expenses Incurred**: ${fmt(exp)}\n`;
      report += `• **Net Surplus**: ${net >= 0 ? "+" : "−"}${fmt(Math.abs(net))}\n`;
      report += `• **Savings Rate**: **${savingsRate}%**\n`;
      report += `• **Top Expense Category**: ${data.topCategory ? `${data.topCategory.category} (${fmt(data.topCategory.amount)})` : "None"}\n\n`;

      if (net > 0 && Number(savingsRate) >= 20) {
        report += `✨ **Health Rating: Excellent.** You are saving over 20% of your earnings. Keep this discipline!`;
      } else if (net > 0) {
        report += `👍 **Health Rating: Good.** You have a positive cash flow. Consider reviewing top expenses to push your savings rate to 20%.`;
      } else {
        report += `⚠️ **Health Rating: Needs Attention.** Outflows match or exceed inflows this month. Review your biggest category to balance your cash flow.`;
      }

      return {
        text: report,
        chartType: "month_compare_bar",
        chartData: {
          labels: ["Income", "Expenses", "Net Surplus"],
          income: [inc, 0, Math.max(net, 0)],
          expenses: [0, exp, Math.max(-net, 0)],
          currency: cur
        },
        followUps: [
          "Where does most of my money go?",
          "How much can I save?",
          "Help me reduce expenses."
        ]
      };
    }

    // 8. Specific category check (e.g. "How much did I spend on Food?")
    const catCheck = data.sortedCategories.find((c) => query.includes(c.category.toLowerCase()));
    if (catCheck) {
      const pct = data.totalExpenseAmount > 0 ? ((catCheck.amount / data.totalExpenseAmount) * 100).toFixed(1) : 0;
      return {
        text: `You have spent **${fmt(catCheck.amount)}** on **${catCheck.category}**, which represents **${pct}%** of your total spending.`,
        followUps: [
          `How can I reduce spending on ${catCheck.category}?`,
          "Where does most of my money go?",
          "Create a savings plan."
        ]
      };
    }

    // 9. Wallet balance query
    if (query.includes("balance") || query.includes("wallet")) {
      const entries = Object.entries(data.walletBalances);
      if (entries.length === 0) {
        return {
          text: `You have not topped up your wallet yet. Add money from your Overview dashboard to track separate wallet funds!`,
          followUps: ["Analyze my spending", "Give me a monthly financial report."]
        };
      }
      let bMsg = `🏦 **Available Wallet Balances**:\n\n`;
      entries.forEach(([c, amt]) => {
        bMsg += `• **${c}**: ${fmt(amt, c)}\n`;
      });
      return {
        text: bMsg,
        followUps: ["Where does most of my money go?", "Create a savings plan."]
      };
    }

    // Default conversational response
    return {
      text: `I analyzed your **${data.totalCount} transaction records** in **${cur}**.\n\n` +
        `I can help you explore your finances deeper:\n` +
        `• Discover your highest expense categories\n` +
        `• Compare spending month-over-month\n` +
        `• Build an automated 3-tier savings plan\n` +
        `• Calculate cost-reduction scenarios\n\n` +
        `What would you like to inspect next?`,
      followUps: [
        "Where does most of my money go?",
        "Compare this month and last month.",
        "How much can I save?",
        "Give me a monthly financial report."
      ]
    };
  }

  // --- Rendering UI Functions ---
  function renderWelcomeMessage() {
    if (!messagesContainer) return;
    const summary = getFinancialSummary();
    const cur = summary.preferredCurrency;
    const user = Finova.getProfile ? Finova.getProfile() : null;
    const name = user?.name ? user.name.split(" ")[0] : "there";

    const welcome = {
      sender: "agent",
      timestamp: Date.now(),
      text: `Hello ${name}! I am **Agent**, your personal financial assistant.\n\n` +
        `I have connected to your account and analyzed your **${summary.totalCount} saved transactions** in **${cur}**.\n\n` +
        `Select a quick action below or ask me any question about your spending, trends, or savings goals!`,
      followUps: [
        "Analyze my spending.",
        "Where does most of my money go?",
        "Compare this month and last month.",
        "How much can I save?"
      ]
    };

    conversationHistory = [welcome];
    renderAllMessages();
  }

  function renderAllMessages() {
    if (!messagesContainer) return;
    messagesContainer.innerHTML = "";
    conversationHistory.forEach((msg) => renderSingleMessageDOM(msg, false));
    scrollToBottom();
  }

  function renderSingleMessageDOM(msg, shouldScroll = true) {
    if (!messagesContainer) return;
    const isUser = msg.sender === "user";
    const bubble = document.createElement("article");
    bubble.className = `agent-message ${isUser ? "agent-user-message" : "agent-bot-message"}`;

    const avatarHtml = isUser
      ? `<span class="agent-msg-avatar user-avatar">${(Finova.getProfile?.()?.name || "U")[0].toUpperCase()}</span>`
      : `<span class="agent-msg-avatar bot-avatar">✦</span>`;

    const formattedContent = formatMessageText(msg.text);

    let chartContainerHtml = "";
    let canvasId = null;
    if (msg.chartType && msg.chartData) {
      canvasId = `agent-chart-${++chartCounter}`;
      chartContainerHtml = `<div class="agent-inline-chart-wrap"><canvas id="${canvasId}" class="agent-inline-canvas"></canvas></div>`;
    }

    let followUpsHtml = "";
    if (msg.followUps && msg.followUps.length > 0) {
      followUpsHtml = `<div class="agent-followup-chips">${msg.followUps
        .map((fu) => `<button type="button" class="agent-chip" data-prompt="${Finova.escapeHTML(fu)}">${Finova.escapeHTML(fu)}</button>`)
        .join("")}</div>`;
    }

    const copyBtnHtml = !isUser
      ? `<button type="button" class="agent-copy-btn" title="Copy response">⧉ Copy</button>`
      : "";

    bubble.innerHTML = `
      ${avatarHtml}
      <div class="agent-msg-body">
        <div class="agent-msg-header">
          <span class="agent-msg-sender">${isUser ? "You" : "Agent"}</span>
          <span class="agent-msg-time">${formatTime(msg.timestamp)}</span>
          ${copyBtnHtml}
        </div>
        <div class="agent-msg-content">${formattedContent}</div>
        ${chartContainerHtml}
        ${followUpsHtml}
      </div>
    `;

    messagesContainer.appendChild(bubble);

    // Bind copy button
    const copyBtn = bubble.querySelector(".agent-copy-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard?.writeText(msg.text).then(() => {
          Finova.notify ? Finova.notify("Response copied to clipboard.") : alert("Copied!");
        });
      });
    }

    // Render chart if present
    if (canvasId && typeof Chart !== "undefined") {
      setTimeout(() => initInlineChart(canvasId, msg.chartType, msg.chartData), 50);
    }

    if (shouldScroll) scrollToBottom();
  }

  function formatMessageText(text) {
    if (!text) return "";
    let formatted = Finova.escapeHTML(text);

    // Markdown headers ### Header
    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="agent-content-h4">$1</h4>');
    // Markdown bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet lists •
    formatted = formatted.replace(/^[•\-] (.*$)/gim, '<li class="agent-content-li">$1</li>');
    formatted = formatted.replace(/(<li.*<\/li>)/s, '<ul class="agent-content-ul">$1</ul>');
    // Line breaks
    formatted = formatted.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

    return formatted;
  }

  function initInlineChart(canvasId, chartType, chartData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (chartType === "spending_donut") {
      const palette = ["#7c65f6", "#38bdf8", "#59d6a0", "#ff847c", "#efc869", "#9db2d8"];
      new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: chartData.categories.map((c) => c.category),
          datasets: [
            {
              data: chartData.categories.map((c) => c.amount),
              backgroundColor: palette.slice(0, chartData.categories.length),
              borderWidth: 2,
              borderColor: "#10182b"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: { color: "#8d9ab2", font: { size: 10, family: "DM Sans, sans-serif" }, boxWidth: 10 }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${Finova.formatCurrency(ctx.raw, chartData.currency)}`
              }
            }
          }
        }
      });
    } else if (chartType === "month_compare_bar") {
      new Chart(canvas, {
        type: "bar",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Income",
              data: chartData.income,
              backgroundColor: "#7c65f6",
              borderRadius: 6
            },
            {
              label: "Expenses",
              data: chartData.expenses,
              backgroundColor: "#38bdf8",
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#8d9ab2", font: { size: 10 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: ${Finova.formatCurrency(ctx.raw, chartData.currency)}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#8d9ab2" } },
            y: {
              grid: { color: "rgba(151,174,218,0.08)" },
              ticks: { color: "#71809a", callback: (val) => Finova.formatCurrency(val, chartData.currency, { compact: true }) }
            }
          }
        }
      });
    } else if (chartType === "savings_projection") {
      new Chart(canvas, {
        type: "bar",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Monthly Contribution",
              data: chartData.monthlySavings,
              backgroundColor: ["#638cff", "#7c65f6", "#59d6a0"],
              borderRadius: 6
            }
          ]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Monthly: ${Finova.formatCurrency(ctx.raw, chartData.currency)}`
              }
            }
          },
          scales: {
            x: { grid: { color: "rgba(151,174,218,0.08)" }, ticks: { color: "#8d9ab2" } },
            y: { grid: { display: false }, ticks: { color: "#eef3ff", font: { weight: "600" } } }
          }
        }
      });
    }
  }

  async function handleUserSubmit(userText) {
    const text = userText.trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      sender: "user",
      timestamp: Date.now(),
      text
    };
    conversationHistory.push(userMsg);
    renderSingleMessageDOM(userMsg, true);
    saveHistory();

    // Show typing
    if (typingIndicator) {
      typingIndicator.hidden = false;
      scrollToBottom();
    }

    // Realistic processing delay for AI feel
    const delay = 400 + Math.random() * 300;
    await new Promise((r) => setTimeout(r, delay));

    // Calculate response
    const agentResult = await processAgentQuery(text);

    if (typingIndicator) {
      typingIndicator.hidden = true;
    }

    const botMsg = {
      sender: "agent",
      timestamp: Date.now(),
      text: agentResult.text,
      chartType: agentResult.chartType || null,
      chartData: agentResult.chartData || null,
      followUps: agentResult.followUps || []
    };

    conversationHistory.push(botMsg);
    renderSingleMessageDOM(botMsg, true);
    saveHistory();
  }

  // --- Event Listeners ---
  function initEvents() {
    // Form submit
    if (chatForm && userInput) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = userInput.value;
        userInput.value = "";
        userInput.style.height = "auto";
        handleUserSubmit(text);
      });

      // Enter key submits (unless Shift+Enter)
      userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          chatForm.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      });

      // Auto resize textarea
      userInput.addEventListener("input", () => {
        userInput.style.height = "auto";
        userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
      });
    }

    // Quick action cards
    document.querySelectorAll(".agent-action-card").forEach((card) => {
      card.addEventListener("click", () => {
        const prompt = card.dataset.prompt;
        if (prompt) handleUserSubmit(prompt);
      });
    });

    // Follow up chip clicks (delegated)
    if (messagesContainer) {
      messagesContainer.addEventListener("click", (e) => {
        const chip = e.target.closest(".agent-chip");
        if (chip && chip.dataset.prompt) {
          handleUserSubmit(chip.dataset.prompt);
        }
      });
    }

    // Clear chat
    if (clearChatBtn) {
      clearChatBtn.addEventListener("click", async () => {
        const confirmed = await Finova.confirmAction({
          title: "Clear Agent conversation?",
          message: "This will remove your previous chat history on this device.",
          confirmLabel: "Clear chat"
        });
        if (confirmed) {
          conversationHistory = [];
          localStorage.removeItem(getUserKey());
          renderWelcomeMessage();
        }
      });
    }

    // Currency changed: update messages or reload
    window.addEventListener("finova:currency-changed", () => {
      renderAllMessages();
    });

    // Update records count badge
    const trans = Finova.getTransactions ? Finova.getTransactions() : [];
    if (recordsCountEl) {
      recordsCountEl.textContent = `Analyzed ${trans.length} records · Live Supabase connection`;
    }
  }

  // Expose Agent API for external/test integration
  window.FinovaAgent = {
    processQuery: (query) => processAgentQuery(query, getFinancialSummary()),
    getSummary: getFinancialSummary,
    getHistory: () => [...conversationHistory]
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (Finova.ready) await Finova.ready;
    loadHistory();
    initEvents();
  });
})();
