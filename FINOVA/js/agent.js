/* ========================================================
   FINOVA AGENT – Intelligent Financial Assistant Engine
   Natural Conversation · Friendly Personality · Personal Finance Scope
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
          // Restore last financial context from history if available
          restoreContextFromHistory();
          renderAllMessages();
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load agent history", e);
    }
    renderWelcomeMessage();
  }

  function restoreContextFromHistory() {
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      if (msg && msg.savedContext) {
        lastContext = { ...msg.savedContext };
        break;
      }
    }
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

  // --- Financial Calculation Helpers (CALLED STRICTLY ON FINANCIAL INTENTS ONLY) ---
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

    const sum = (arr) => arr.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // Current month category breakdown (fallback to all if current month has none)
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

  // --- Intent Classification Engine ---
  function classifyIntent(queryText) {
    const raw = (queryText || "").trim();
    const q = raw.toLowerCase();
    // Normalize contractions and strip punctuation
    const clean = q.replace(/['’]/g, "").replace(/[?!.,;:()"„“”`]/g, " ").replace(/\s+/g, " ").trim();
    const words = clean.split(" ").filter(Boolean);

    // 1. GREETINGS
    const greetings = [
      "hi", "hello", "hey", "heyy", "heya", "howdy", "hola", "yo", "greetings", "hiya",
      "good morning", "good afternoon", "good evening", "good day", "morning", "evening"
    ];
    const isGreeting = greetings.some(
      (g) => clean === g || clean.startsWith(g + " ")
    );

    // Financial keywords
    const financeKeywords = [
      "spend", "spent", "spending", "expense", "expenses", "cost", "costs", "paid", "payment", "payments",
      "income", "salary", "earning", "earnings", "earned", "revenue", "deposit",
      "save", "saving", "savings", "saved", "budget", "budgeting", "fund", "funds",
      "wallet", "balance", "balances", "transaction", "transactions", "record", "records",
      "category", "categories", "groceries", "food", "dining", "transport", "entertainment",
      "bills", "utilities", "rent", "shopping", "money", "cash", "surplus",
      "report", "summary", "compare", "comparison"
    ];
    const hasFinanceKeyword = financeKeywords.some((k) => {
      const regex = new RegExp(`\\b${k}\\b`, "i");
      return regex.test(clean);
    });

    const hasMoneyAmount = /(?:₹|\$|€|£|rs|inr)\s*\d+|\d+\s*(?:dollars|rupees|bucks|inr|usd)/i.test(q);

    if (isGreeting && !hasFinanceKeyword && !hasMoneyAmount && words.length <= 5) {
      return "GREETING";
    }

    // 2. CASUAL CONVERSATIONS
    const casualPhrases = [
      "how are you", "how are u", "how r u", "how you doing", "hows it going", "how is it going",
      "thank you", "thanks", "thx", "thank u", "appreciate it", "many thanks",
      "ok", "okay", "alright", "cool", "nice", "got it", "sounds good", "thats good", "that is good",
      "great", "awesome", "perfect", "fine",
      "can you help me", "i need help", "could you help me", "could you help", "what can you do", "help me",
      "who are you", "what is your name", "whats your name", "what are you",
      "bye", "goodbye", "see you", "cya", "have a good day"
    ];
    const isCasual = casualPhrases.some((cp) => {
      if (words.length <= 6 && (clean === cp || clean.startsWith(cp + " "))) return true;
      const regex = new RegExp(`\\b${cp.replace(/\s+/g, "\\s+")}\\b`, "i");
      return regex.test(clean);
    });

    if (isCasual && !hasFinanceKeyword && !hasMoneyAmount && words.length <= 8) {
      return "CASUAL";
    }

    // 3. CONTEXTUAL FOLLOW-UPS (Refer to earlier financial topics using "it", "that", "highest", etc.)
    const contextPhrases = [
      /how\s+can\s+i\s+reduce\s+(it|that)/i,
      /how\s+to\s+reduce\s+(it|that)/i,
      /how\s+(can|do)\s+i\s+cut\s+(it|that)/i,
      /reduce\s+(it|that)/i,
      /cut\s+(it|that)/i,
      /save\s+on\s+(it|that)/i,
      /which\s+category\s+was\s+(the\s+)?highest/i,
      /what\s+was\s+(the\s+)?highest/i,
      /which\s+(one\s+)?was\s+(the\s+)?most/i,
      /break\s+it\s+down/i,
      /tell\s+me\s+more\s+about\s+(it|that)/i,
      /why\s+is\s+(it|that)\s+so\s+high/i,
      /what\s+about\s+that/i
    ];
    if (contextPhrases.some((p) => p.test(q))) {
      return "FINANCIAL_CONTEXT";
    }

    // 4. FINANCIAL QUERIES
    if (hasFinanceKeyword || hasMoneyAmount) {
      return "FINANCIAL";
    }

    // 5. UNRELATED / OUTSIDE SCOPE
    return "UNRELATED";
  }

  // --- Main Conversational Intelligence Engine ---
  async function processAgentQuery(queryText) {
    const raw = (queryText || "").trim();
    const q = raw.toLowerCase();
    const clean = q.replace(/['’]/g, "").replace(/[?!.,;:()"„“”`]/g, " ").replace(/\s+/g, " ").trim();
    const intent = classifyIntent(raw);

    // ========================================================
    // A. GREETINGS (NO FINANCIAL DATA FETCHED)
    // ========================================================
    if (intent === "GREETING") {
      if (clean.includes("morning")) {
        return {
          text: "Good morning! ☀️ Hope your day is off to a great start. What can I help you with today?",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }
      if (clean.includes("evening")) {
        return {
          text: "Good evening! 🌙 How was your day? Let me know what you'd like to check today.",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }
      if (clean.includes("afternoon")) {
        return {
          text: "Good afternoon! ☀️ How's your day going? What can I help you with?",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }
      return {
        text: "Hey! 👋 How's your day going? What can I help you with?",
        followUps: [
          "How much did I spend this month?",
          "Where does most of my money go?",
          "How can I save more?"
        ]
      };
    }

    // ========================================================
    // B. NORMAL / CASUAL CONVERSATIONS (NO FINANCIAL DATA FETCHED)
    // ========================================================
    if (intent === "CASUAL") {
      // "How are you?"
      if (/how\s*(?:are|r)\s*(?:you|u)|hows\s*it\s*going/i.test(clean)) {
        return {
          text: "Doing well, thanks for asking! 😊 How about you? What would you like help with today?",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }

      // "Thank you"
      if (/thank\s*(?:you|u)|thanks|thx|appreciate/i.test(clean)) {
        return {
          text: "You're welcome! 😊 Let me know if you need any other help with your finances.",
          followUps: [
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }

      // "Okay", "That's good", "Cool", "Nice"
      if (/^(?:ok|okay|alright|cool|nice|got\s*it|sounds\s*good|thats\s*good|great|awesome|perfect|fine)$/i.test(clean)) {
        return {
          text: "Glad to hear! 😊 Feel free to ask whenever you'd like to check your spending or savings.",
          followUps: [
            "Compare this month and last month.",
            "Create a savings plan."
          ]
        };
      }

      // "Can you help me?"
      if (/can\s*you\s*help|need\s*help|what\s*can\s*you\s*do|help\s*me/i.test(clean)) {
        return {
          text: "Of course! 😊 I can help you track your spending, check wallet balances, compare months, and build savings plans. What would you like to explore?",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "How can I save more?"
          ]
        };
      }

      // "Who are you?"
      if (/who\s*are\s*you|what\s*is\s*your\s*name|whats\s*your\s*name|what\s*are\s*you/i.test(clean)) {
        return {
          text: "I'm **Agent**, your personal finance companion in FINOVA! I help you keep track of your income, expenses, and savings goals.",
          followUps: [
            "How much did I spend this month?",
            "Where does most of my money go?",
            "Create a savings plan."
          ]
        };
      }

      // "Goodbye"
      if (/bye|goodbye|see\s*you|cya/i.test(clean)) {
        return {
          text: "Have a great day ahead! 👋 I'm always here whenever you want to check your finances."
        };
      }

      return {
        text: "I'm here to help! 😊 Feel free to ask anything about your spending, income, or savings goals.",
        followUps: [
          "How much did I spend this month?",
          "Where does most of my money go?",
          "How can I save more?"
        ]
      };
    }

    // ========================================================
    // C. UNRELATED TOPICS (NO FINANCIAL DATA FETCHED)
    // ========================================================
    if (intent === "UNRELATED") {
      return {
        text: "Sorry! 😊 I'm your personal finance Agent. I can help you understand your income, expenses, savings, and manage your money, but I can't help with that topic.",
        followUps: [
          "How much did I spend this month?",
          "Where does most of my money go?",
          "How can I save more?"
        ]
      };
    }

    // ========================================================
    // D. FINANCIAL QUESTIONS & CONTEXTUAL FOLLOW-UPS (FETCH DATA)
    // ========================================================
    const data = getFinancialSummary();
    const cur = data.preferredCurrency;
    const fmt = (amt, c = cur) => Finova.formatCurrency(amt, c);

    // 1. "How much did I spend this month?" / "Monthly spending" / "What did I spend?"
    if (
      /how\s*much\s*did\s*i\s*spend/i.test(clean) ||
      /what\s*did\s*i\s*spend/i.test(clean) ||
      /my\s*spending\s*this\s*month/i.test(clean) ||
      /spent\s*this\s*month/i.test(clean) ||
      /spending\s*this\s*month/i.test(clean) ||
      (clean.includes("spend") && clean.includes("month") && !clean.includes("compare") && !clean.includes("last"))
    ) {
      const curExp = data.curMonthExpenseTotal;
      const count = data.currentMonthExpenses.length;
      const top = data.topCategory;

      if (curExp === 0) {
        return {
          text: "You haven't recorded any expenses for this month yet. Once you add transactions on the **Add transaction** page, I'll keep track of your spending here! 😊",
          followUps: ["Analyze my income.", "Create a savings plan."]
        };
      }

      lastContext = {
        topic: "monthly_spending",
        timePeriod: "this_month",
        totalExpenses: curExp,
        topCategory: top ? top.category : null,
        topAmount: top ? top.amount : 0,
        count
      };

      let resp = `You spent **${fmt(curExp)}** this month`;
      if (count > 0) {
        resp += ` across **${count} transaction${count === 1 ? "" : "s"}**`;
      }
      resp += `.\n\n`;

      if (top) {
        resp += `Most of it went toward **${top.category}** (${fmt(top.amount)}).\n\n`;
      }
      resp += `Would you like to see which category was highest, or how you can reduce it?`;

      return {
        text: resp,
        savedContext: { ...lastContext },
        followUps: [
          "Which category was highest?",
          "How can I reduce it?",
          "Compare this month and last month."
        ]
      };
    }

    // 2. "Which category was highest?" / "Which category did I spend the most on?" / "Where does most of my money go?"
    if (
      /where\s*(?:does|did)\s*most\s*of\s*my\s*money\s*go/i.test(clean) ||
      /which\s*category\s*(?:did\s*i\s*spend\s*the\s*most|was\s*highest|was\s*the\s*highest)/i.test(clean) ||
      /highest\s*(?:category|spending|expense)/i.test(clean) ||
      /what\s*was\s*(?:the\s*)?highest/i.test(clean) ||
      clean === "where does most of my money go"
    ) {
      if (data.totalExpenseAmount === 0) {
        return {
          text: "You don't have any recorded expenses yet in your FINOVA account. Add a transaction to see your spending categories!",
          followUps: ["Analyze my income.", "Add transaction"]
        };
      }

      const top = data.topCategory;
      const topPct = data.totalExpenseAmount > 0 ? ((top.amount / data.totalExpenseAmount) * 100).toFixed(1) : 0;
      const periodLabel = data.isCurrentMonthSample ? "this month" : "overall";

      lastContext = {
        topic: "category_focus",
        timePeriod: periodLabel,
        topCategory: top.category,
        topAmount: top.amount,
        totalExpenses: data.totalExpenseAmount
      };

      let resp = `Most of your spending ${periodLabel} was on **${top.category}**, totaling **${fmt(top.amount)}** (about **${topPct}%** of your total spending).\n\n`;

      if (data.sortedCategories.length > 1) {
        const second = data.sortedCategories[1];
        const secondPct = ((second.amount / data.totalExpenseAmount) * 100).toFixed(1);
        resp += `Your next biggest expense was **${second.category}** at **${fmt(second.amount)}** (${secondPct}%).\n\n`;
      }
      resp += `Would you like some practical tips to cut down on **${top.category}**?`;

      return {
        text: resp,
        savedContext: { ...lastContext },
        followUps: [
          "How can I reduce it?",
          "How can I save more?",
          "Compare this month and last month."
        ]
      };
    }

    // 3. "Analyze my spending" (Explicit full spending breakdown & doughnut chart)
    if (
      /analyze\s*my\s*spending/i.test(clean) ||
      /analyse\s*my\s*spending/i.test(clean) ||
      /spending\s*breakdown/i.test(clean)
    ) {
      if (data.totalExpenseAmount === 0) {
        return {
          text: "You haven't recorded any expenses yet in FINOVA. Add a transaction to start analyzing your spending trends!",
          followUps: ["Analyze my income.", "Add transaction"]
        };
      }

      const top = data.topCategory;
      const topPct = data.totalExpenseAmount > 0 ? ((top.amount / data.totalExpenseAmount) * 100).toFixed(1) : 0;
      const periodLabel = data.isCurrentMonthSample ? "this month" : "overall";

      lastContext = {
        topic: "category_focus",
        timePeriod: periodLabel,
        topCategory: top.category,
        topAmount: top.amount,
        totalExpenses: data.totalExpenseAmount
      };

      let analysis = `Here is your spending breakdown ${periodLabel}:\n\n`;
      analysis += `Total spending is **${fmt(data.totalExpenseAmount)}** across **${data.sortedCategories.length} categories**.\n\n`;
      analysis += `🏷️ **Highest expense**: **${top.category}** at **${fmt(top.amount)}** (${topPct}%).\n\n`;

      if (data.sortedCategories.length > 1) {
        const second = data.sortedCategories[1];
        const secondPct = ((second.amount / data.totalExpenseAmount) * 100).toFixed(1);
        analysis += `Second highest is **${second.category}** at **${fmt(second.amount)}** (${secondPct}%).`;
      }

      return {
        text: analysis,
        chartType: "spending_donut",
        chartData: {
          categories: data.sortedCategories.slice(0, 6),
          total: data.totalExpenseAmount,
          currency: cur
        },
        savedContext: { ...lastContext },
        followUps: [
          `How can I reduce spending on ${top.category}?`,
          "Compare this month and last month.",
          "How can I save more?"
        ]
      };
    }

    // 4. "How can I reduce it?" / "Help me reduce expenses" / Contextual Reduction
    if (
      /reduce\s*(?:it|that)/i.test(clean) ||
      /cut\s*(?:it|that)/i.test(clean) ||
      /save\s*on\s*(?:it|that)/i.test(clean) ||
      /reduce\s*expenses/i.test(clean) ||
      /cut\s*expenses/i.test(clean) ||
      /how\s*to\s*cut\s*down/i.test(clean) ||
      clean === "help me reduce expenses"
    ) {
      const targetCat = (lastContext && lastContext.topCategory) || (data.topCategory && data.topCategory.category) || "Bills";
      const targetAmt = (lastContext && lastContext.topAmount) || (data.topCategory && data.topCategory.amount) || 1000;

      const cut10 = targetAmt * 0.10;
      const cut20 = targetAmt * 0.20;

      let tips = "";
      const catLower = targetCat.toLowerCase();
      if (catLower.includes("food") || catLower.includes("grocer") || catLower.includes("dining")) {
        tips = `• **Plan weekly meals**: Batch cooking and grocery lists typically lower unplanned food bills by 10–15%.\n• **Audit dining out**: Set a dedicated weekly eating-out limit so impulse meals don't sneak up.\n• **Buy staples in bulk**: Stock up on long-lasting essentials when on discount.`;
      } else if (catLower.includes("bill") || catLower.includes("utilit")) {
        tips = `• **Audit recurring subscriptions**: Cancel streaming, gym, or digital services you haven't used in 30 days.\n• **Check provider rates**: Calling your broadband or mobile provider can often lower plans to newer promotional rates.\n• **Energy conservation**: Turn off idle electronics and adjust heating/cooling during peak hours.`;
      } else if (catLower.includes("shop") || catLower.includes("entertain")) {
        tips = `• **The 48-Hour Rule**: Wait 48 hours before purchasing non-essential items to avoid impulse buying.\n• **Unlink one-click checkout**: Remove saved cards from online stores to add positive friction.\n• **Set a fun-money envelope**: Decide an exact budget for leisure each month and stick to it.`;
      } else {
        tips = `• **Set a category limit**: Give yourself a clear weekly ceiling for ${targetCat}.\n• **Track smaller purchases**: Daily micro-transactions often add up to half of the total.\n• **Automate savings first**: Transfer savings right when you get paid before spending on ${targetCat}.`;
      }

      let response = `To cut down on **${targetCat}** (currently **${fmt(targetAmt)}**), here are practical steps you can take:\n\n`;
      response += `${tips}\n\n`;
      response += `💡 If you trim just 10%, you'll save **${fmt(cut10)}/month** (${fmt(cut10 * 12)} a year)!\n\n`;
      response += `Would you like to build a savings plan around this?`;

      return {
        text: response,
        savedContext: { ...lastContext },
        followUps: [
          "Create a savings plan.",
          "How much can I save?",
          "Compare this month and last month."
        ]
      };
    }

    // 5. "How can I save more?" / "How much can I save?" / "Create a savings plan"
    if (
      /how\s*can\s*i\s*save\s*more/i.test(clean) ||
      /how\s*much\s*can\s*i\s*save/i.test(clean) ||
      /savings\s*plan/i.test(clean) ||
      /create\s*a\s*savings/i.test(clean) ||
      /how\s*to\s*save/i.test(clean) ||
      clean === "create a savings plan"
    ) {
      const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
      const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
      const surplus = income - expenses;

      if (surplus <= 0 && income === 0) {
        return {
          text: `You haven't recorded your income yet. Once you add your salary or earnings on the **Add transaction** page, I can calculate your exact monthly surplus and build a custom savings plan for you! 😊`,
          followUps: ["Analyze my spending.", "Add transaction"]
        };
      }

      if (surplus <= 0) {
        const topCat = data.topCategory?.category || "Expenses";
        const topAmt = data.topCategory?.amount || expenses;
        return {
          text: `Right now, your monthly expenses (**${fmt(expenses)}**) match or exceed your income (**${fmt(income)}**).\n\n` +
            `The quickest win is trimming 10% from your highest expense (**${topCat}**), which would put **${fmt(topAmt * 0.1)}/month** straight into savings.\n\n` +
            `Would you like some ideas to trim spending on **${topCat}**?`,
          followUps: ["Help me reduce expenses.", "Where does most of my money go?"]
        };
      }

      const p20 = surplus * 0.20;
      const p40 = surplus * 0.40;
      const p60 = surplus * 0.60;

      let plan = `Based on your current monthly surplus of **${fmt(surplus)}** (Income: ${fmt(income)} − Expenses: ${fmt(expenses)}), here is a realistic savings roadmap:\n\n`;
      plan += `• **Comfortable Plan (20%)**: Save **${fmt(p20)}/month** → **${fmt(p20 * 12)}/year**\n`;
      plan += `• **Balanced Plan (Recommended · 40%)**: Save **${fmt(p40)}/month** → **${fmt(p40 * 12)}/year**\n`;
      plan += `• **Accelerated Plan (60%)**: Save **${fmt(p60)}/month** → **${fmt(p60 * 12)}/year**\n\n`;
      plan += `You can also tell me a specific goal (e.g. *"I want to save $500"*), and I'll calculate how quickly you can hit it!`;

      return {
        text: plan,
        chartType: "savings_projection",
        chartData: {
          monthlySavings: [p20, p40, p60],
          labels: ["Comfortable (20%)", "Balanced (40%)", "Accelerated (60%)"],
          currency: cur
        },
        savedContext: { topic: "savings_plan", surplus, income, expenses },
        followUps: [
          `I want to save ${fmt(50000)}`,
          "Help me reduce expenses.",
          "Compare this month and last month."
        ]
      };
    }

    // 6. Custom Goal Target (e.g. "I want to save 500 dollars")
    const goalMatch = q.match(/(?:save|goal|target)\s*(?:of)?\s*(?:rs|inr|\$|€|£|₹)?\s*([0-9,]+)/i);
    if (goalMatch) {
      const targetGoal = Number(goalMatch[1].replace(/,/g, ""));
      if (Number.isFinite(targetGoal) && targetGoal > 0) {
        const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
        const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
        const surplus = Math.max(income - expenses, 1);

        const balancedMonthly = surplus * 0.40;
        const monthsNeeded = Math.ceil(targetGoal / Math.max(balancedMonthly, 500));

        let res = `🎯 **Savings Roadmap for ${fmt(targetGoal)}**:\n\n`;
        res += `• Target Goal: **${fmt(targetGoal)}**\n`;
        res += `• Current Monthly Surplus: **${fmt(surplus)}**\n`;
        res += `• Suggested Contribution: **${fmt(balancedMonthly)}/month** (40% of surplus)\n\n`;
        res += `At this pace, you'll reach your goal in about **${monthsNeeded} month${monthsNeeded === 1 ? "" : "s"}**! Trimming discretionary spending could get you there even faster.`;

        return {
          text: res,
          followUps: ["Help me reduce expenses.", "Where does most of my money go?"]
        };
      }
    }

    // 7. "Compare this month and last month"
    if (
      /compare\s*this\s*month\s*and\s*last\s*month/i.test(clean) ||
      /compare\s*month/i.test(clean) ||
      /monthly\s*comparison/i.test(clean) ||
      (clean.includes("last month") && clean.includes("this month"))
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

      let msg = `Here is your month-over-month comparison:\n\n`;
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

    // 8. "Analyze my income"
    if (
      /analyze\s*my\s*income/i.test(clean) ||
      /analyse\s*my\s*income/i.test(clean) ||
      /income\s*breakdown/i.test(clean) ||
      /where\s*did\s*my\s*income\s*come\s*from/i.test(clean)
    ) {
      if (data.totalIncomeAmount === 0) {
        return {
          text: `You have no income entries recorded yet. Once you add your salary or earnings on the **Add transaction** page, I'll analyze your income diversification! 😊`,
          followUps: ["Analyze my spending.", "Add transaction"]
        };
      }

      let res = `💰 **Income Overview**:\n\n`;
      res += `Total recorded earnings: **${fmt(data.totalIncomeAmount)}** across **${data.sortedIncomeCategories.length} stream${data.sortedIncomeCategories.length === 1 ? "" : "s"}**.\n\n`;
      data.sortedIncomeCategories.forEach((item, idx) => {
        const pct = ((item.amount / data.totalIncomeAmount) * 100).toFixed(1);
        res += `${idx + 1}. **${item.category}**: ${fmt(item.amount)} (${pct}%)\n`;
      });

      return {
        text: res,
        followUps: [
          "Create a savings plan.",
          "Compare this month and last month.",
          "Give me a monthly financial report."
        ]
      };
    }

    // 9. "Give me a monthly financial report"
    if (
      /monthly\s*financial\s*report/i.test(clean) ||
      /financial\s*report/i.test(clean) ||
      /summary\s*report/i.test(clean)
    ) {
      const inc = data.curMonthIncomeTotal;
      const exp = data.curMonthExpenseTotal;
      const net = inc - exp;
      const savingsRate = inc > 0 ? ((Math.max(net, 0) / inc) * 100).toFixed(1) : 0;

      let report = `📋 **Monthly Financial Summary (${data.currentMonthKey})**\n\n`;
      report += `• **Income Received**: ${fmt(inc)}\n`;
      report += `• **Expenses Incurred**: ${fmt(exp)}\n`;
      report += `• **Net Cash Flow**: ${net >= 0 ? "+" : "−"}${fmt(Math.abs(net))}\n`;
      report += `• **Savings Rate**: **${savingsRate}%**\n`;
      report += `• **Top Category**: ${data.topCategory ? `${data.topCategory.category} (${fmt(data.topCategory.amount)})` : "None"}\n\n`;

      if (net > 0 && Number(savingsRate) >= 20) {
        report += `✨ **Health Rating: Excellent.** You are saving over 20% of your earnings. Keep up the good work!`;
      } else if (net > 0) {
        report += `👍 **Health Rating: Good.** You have a positive cash flow. Consider trimming your top category to save even more.`;
      } else {
        report += `⚠️ **Health Rating: Needs Attention.** Expenses match or exceed income this month. Reviewing your top category can help balance your cash flow.`;
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

    // 10. Specific category check (e.g. "Groceries spending", "How much on food?")
    const catCheck = data.sortedCategories.find((c) => clean.includes(c.category.toLowerCase()));
    if (catCheck) {
      const pct = data.totalExpenseAmount > 0 ? ((catCheck.amount / data.totalExpenseAmount) * 100).toFixed(1) : 0;
      lastContext = {
        topic: "category_focus",
        topCategory: catCheck.category,
        topAmount: catCheck.amount,
        totalExpenses: data.totalExpenseAmount
      };
      return {
        text: `You have spent **${fmt(catCheck.amount)}** on **${catCheck.category}**, which is about **${pct}%** of your total spending.`,
        savedContext: { ...lastContext },
        followUps: [
          `How can I reduce spending on ${catCheck.category}?`,
          "Where does most of my money go?",
          "Create a savings plan."
        ]
      };
    }

    // 11. Wallet balance query
    if (clean.includes("balance") || clean.includes("wallet")) {
      const entries = Object.entries(data.walletBalances);
      if (entries.length === 0) {
        return {
          text: `You haven't set up any wallet balances yet. You can manage your wallets from the Overview dashboard!`,
          followUps: ["Analyze my spending.", "How much can I save?"]
        };
      }
      let bMsg = `🏦 **Current Wallet Balances**:\n\n`;
      entries.forEach(([c, amt]) => {
        bMsg += `• **${c}**: ${fmt(amt, c)}\n`;
      });
      return {
        text: bMsg,
        followUps: ["How much did I spend this month?", "Create a savings plan."]
      };
    }

    // Fallback for general financial questions: keep it short and friendly
    return {
      text: `I'm ready to help with your personal finances! You can ask me about your spending this month, check where most of your money goes, or ask for savings tips. What would you like to check?`,
      followUps: [
        "How much did I spend this month?",
        "Where does most of my money go?",
        "How can I save more?"
      ]
    };
  }

  // --- Rendering UI Functions ---
  function renderWelcomeMessage() {
    if (!messagesContainer) return;
    const user = Finova.getProfile ? Finova.getProfile() : null;
    const name = user?.name ? user.name.split(" ")[0] : "there";

    const welcome = {
      sender: "agent",
      timestamp: Date.now(),
      text: `Hey ${name}! 👋 I'm **Agent**, your personal finance companion.\n\n` +
        `Ask me anything about your spending, income, or savings goals, or pick one of the quick suggestions below to get started!`,
      followUps: [
        "How much did I spend this month?",
        "Where does most of my money go?",
        "How can I save more?",
        "Compare this month and last month."
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
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "#8d9ab2", font: { size: 10 } }
            },
            y: {
              grid: { color: "rgba(255, 255, 255, 0.05)" },
              ticks: {
                color: "#8d9ab2",
                font: { size: 9 },
                callback: (v) => Finova.formatCurrency(v, chartData.currency)
              }
            }
          },
          plugins: {
            legend: {
              position: "top",
              labels: { color: "#8d9ab2", font: { size: 10, family: "DM Sans, sans-serif" }, boxWidth: 10 }
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
              label: "Monthly Savings Potential",
              data: chartData.monthlySavings,
              backgroundColor: ["#38bdf8", "#7c65f6", "#59d6a0"],
              borderRadius: 6
            }
          ]
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { color: "rgba(255, 255, 255, 0.05)" },
              ticks: {
                color: "#8d9ab2",
                font: { size: 9 },
                callback: (v) => Finova.formatCurrency(v, chartData.currency)
              }
            },
            y: {
              grid: { display: false },
              ticks: { color: "#8d9ab2", font: { size: 10 } }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Save: ${Finova.formatCurrency(ctx.raw, chartData.currency)} / month`
              }
            }
          }
        }
      });
    }
  }

  // --- Submission Handler ---
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

    // Show typing indicator
    if (typingIndicator) {
      typingIndicator.hidden = false;
      scrollToBottom();
    }

    // Natural processing delay
    const delay = 350 + Math.random() * 250;
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
      followUps: agentResult.followUps || [],
      savedContext: agentResult.savedContext || null
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

    // Follow-up chip clicks (delegated)
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
          lastContext = null;
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
      recordsCountEl.textContent = `Connected to your financial records · ${trans.length} transactions`;
    }
  }

  // Expose Agent API for external/test integration
  window.FinovaAgent = {
    processQuery: (query) => processAgentQuery(query),
    classifyIntent: (query) => classifyIntent(query),
    getSummary: getFinancialSummary,
    getHistory: () => [...conversationHistory],
    getContext: () => (lastContext ? { ...lastContext } : null),
    setContext: (ctx) => {
      lastContext = ctx ? { ...ctx } : null;
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (Finova.ready) await Finova.ready;
    loadHistory();
    initEvents();
  });
})();
