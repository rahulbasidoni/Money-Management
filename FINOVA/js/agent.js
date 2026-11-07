/* ========================================================
   FINOVA AGENT – Intelligent Financial Assistant Engine
   Natural Conversation · Friendly Personality · Personal Finance Scope
   Fully Synchronized with FINOVA Application Language
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

  // --- Language Management ---
    function getAgentDisplayName() {
    return (window.Finova && typeof Finova.translate === "function")
      ? Finova.translate("Agent")
      : "Agent";
  }

  function updateAgentUiLanguage() {
    const agentName = getAgentDisplayName();
    document.querySelectorAll("[data-agent-display-name]").forEach((el) => {
      el.textContent = agentName;
    });

    if (document.body && document.body.dataset && document.body.dataset.page === "agent") {
      const mm = (window.Finova && typeof Finova.translate === "function") ? Finova.translate("Money Management") : "Money Management";
      document.title = `${agentName} · ${mm}`;
    }

    if (userInput) {
      userInput.placeholder = (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Ask Agent anything about your finances, spending, or savings…")
        : `Ask ${agentName} anything about your finances, spending, or savings…`;
      userInput.setAttribute("aria-label", (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Message to Agent")
        : `Message to ${agentName}`);
    }

    const sendBtn = document.getElementById("agent-send-btn");
    if (sendBtn) {
      sendBtn.setAttribute("aria-label", (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Send message to Agent")
        : `Send message to ${agentName}`);
    }

    const typingLabel = document.getElementById("agent-typing-label");
    if (typingLabel) {
      typingLabel.textContent = (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Agent is analyzing your records…")
        : `${agentName} is analyzing your records…`;
    }

    const chatCard = document.querySelector(".agent-chat-card");
    if (chatCard) {
      chatCard.setAttribute("aria-label", (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Agent conversation")
        : `${agentName} conversation`);
    }

    const footnote = document.getElementById("agent-footnote-text");
    if (footnote) {
      footnote.textContent = (window.Finova && typeof Finova.translate === "function")
        ? Finova.translate("Agent analyzes records strictly within your local authenticated account. Never shares private financial data.")
        : `🔒 ${agentName} analyzes records strictly within your local authenticated account. Never shares private financial data.`;
    }

    const youText = (window.Finova && typeof Finova.translate === "function") ? Finova.translate("You") : "You";
    document.querySelectorAll(".agent-msg-ai .agent-msg-sender").forEach((el) => {
      el.textContent = agentName;
    });
    document.querySelectorAll(".agent-msg-user .agent-msg-sender").forEach((el) => {
      el.textContent = youText;
    });
  }

  function getCurrentLang() {
    return (window.Finova && typeof Finova.getLanguage === "function"
      ? Finova.getLanguage()
      : localStorage.getItem("finova.language.v1") || "en");
  }

  function t(key, vars = {}) {
    if (window.FinovaAgentI18n && typeof FinovaAgentI18n.t === "function") {
      return FinovaAgentI18n.t(key, vars, getCurrentLang());
    }
    return key;
  }

  function getPrompt(promptKey, vars = {}) {
    if (window.FinovaAgentI18n && typeof FinovaAgentI18n.getPrompt === "function") {
      return FinovaAgentI18n.getPrompt(promptKey, vars, getCurrentLang());
    }
    return promptKey;
  }

  function getSystemInstruction() {
    if (window.FinovaAgentI18n && typeof FinovaAgentI18n.getSystemInstruction === "function") {
      return FinovaAgentI18n.getSystemInstruction(getCurrentLang());
    }
    const currentLang = getCurrentLang();
    return `Always respond in the user's currently selected FINOVA application language: ${currentLang}. This instruction applies to every response, including greetings, casual conversations, financial analysis, recommendations, follow-up questions, and error messages. Do not switch to English unless English is the selected language or the user explicitly requests another language.`;
  }

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
    const locale = (window.Finova && typeof Finova.getLocale === "function") ? Finova.getLocale() : "en";
    return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
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

  // --- Multilingual Intent Classification Engine ---
  function classifyIntent(queryText) {
    const raw = (queryText || "").trim();
    const q = raw.toLowerCase();
    const clean = q.replace(/['’]/g, "").replace(/[?!.,;:()"„“”`]/g, " ").replace(/\s+/g, " ").trim();
    const words = clean.split(" ").filter(Boolean);

    // 1. GREETINGS (English & Multilingual)
    const greetings = [
      "hi", "hello", "hey", "heyy", "heya", "howdy", "hola", "yo", "greetings", "hiya",
      "good morning", "good afternoon", "good evening", "good day", "morning", "evening",
      "नमस्ते", "नमस्कार", "सुप्रभात", "शुभ संध्या",
      "ನಮಸ್ಕಾರ", "ಶುಭೋದಯ", "ಶುಭ ಸಂಜೆ",
      "నమస్కారం", "నమస్తే", "శుభోదయం", "శుభ సాయంత్రం",
      "வணக்கம்", "காலை வணக்கம்", "மாலை வணக்கம்",
      "ഹലോ", "നമസ്കാരം", "സുപ്രഭാതം",
      "bonjour", "salut", "buenos dias", "buenas tardes", "buenas noches", "ciao",
      "hallo", "guten morgen", "guten tag", "olá", "bom dia", "привет", "здравствуйте",
      "你好", "早上好", "下午好", "晚上好", "こんにちは", "おはよう", "안녕하세요",
      "مرحبا", "صباح الخير", "مساء الخير"
    ];
    const isGreeting = greetings.some((g) => clean === g || clean.startsWith(g + " "));

    // Financial keywords (English & Indic/Global)
    const financeKeywords = [
      "spend", "spent", "spending", "expense", "expenses", "cost", "costs", "paid", "payment", "payments",
      "income", "salary", "earning", "earnings", "earned", "revenue", "deposit",
      "save", "saving", "savings", "saved", "budget", "budgeting", "fund", "funds",
      "wallet", "balance", "balances", "transaction", "transactions", "record", "records",
      "category", "categories", "groceries", "food", "dining", "transport", "entertainment",
      "bills", "utilities", "rent", "shopping", "money", "cash", "surplus",
      "report", "summary", "compare", "comparison",
      // Hindi
      "खर्च", "खर्चे", "आय", "कमाई", "वेतन", "बचत", "बचाना", "बजट", "पैसा", "पैसे", "लेन-देन", "श्रेणी", "रिपोर्ट", "तुलना", "वॉलेट",
      // Kannada
      "ಖರ್ಚು", "ವೆಚ್ಚ", "ಆದಾಯ", "ಗಳಿಕೆ", "ಉಳಿತಾಯ", "ಬಜೆಟ್", "ಹಣ", "ವಹಿವಾಟು", "ವರ್ಗ", "ವರದಿ", "ಹೋಲಿಕೆ", "ವಾಲೆಟ್",
      // Telugu
      "ఖర్చు", "ఖర్చులు", "ఆదాయం", "సంపాదన", "పొదుపు", "బడ్జెట్", "డబ్బు", "లావాదేవీ", "విభాగం", "నివేదిక", "పోలిక", "వాలెట్",
      // Tamil
      "செலவு", "செலவுகள்", "வருமானம்", "சேமிப்பு", "பட்ஜெட்", "பணம்", "பரிவர்த்தனை", "பிரிவு", "அறிக்கை", "ஒப்பீடு", "வாலட்",
      // Malayalam
      "ചെലവ്", "വരുമാനം", "സമ്പാദ്യം", "പണം", "ഇടപാട്", "റിപ്പോർട്ട്",
      // Spanish/French/German/Chinese
      "gasto", "gastos", "ingreso", "ahorro", "dinero",
      "dépense", "dépenses", "revenu", "épargne", "argent",
      "ausgaben", "einnahmen", "sparen", "geld",
      "支出", "开销", "收入", "储蓄", "存钱", "理财",
      "支出", "収入", "貯蓄", "お金",
      "지출", "수입", "저축", "돈"
    ];
    const hasFinanceKeyword = financeKeywords.some((k) => clean.includes(k));
    const hasMoneyAmount = /(?:₹|\$|€|£|rs|inr)\s*\d+|\d+\s*(?:dollars|rupees|bucks|inr|usd)/i.test(q);

    if (isGreeting && !hasFinanceKeyword && !hasMoneyAmount && words.length <= 6) {
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
      "bye", "goodbye", "see you", "cya", "have a good day",
      // Indic
      "धन्यवाद", "शुक्रिया", "आप कैसे हैं", "क्या आप मदद कर सकते हैं", "तुम कौन हो", "आप कौन हैं", "अलविदा", "ठीक है",
      "ಧನ್ಯವಾದಗಳು", "ನೀವು ಹೇಗಿದ್ದೀರಿ", "ಸಹಾಯ ಮಾಡಬಹುದೇ", "ನೀವು ಯಾರು", "ಶುಭ ದಿನ", "ಸರಿ",
      "ధన్యవాదాలు", "మీరు ఎలా ఉన్నారు", "సహాయం చేయగలరా", "మీరు ఎవరు", "సరే",
      "நன்றி", "நீங்கள் எப்படி இருக்கிறீர்கள்", "உதவ முடியுமா", "நீங்கள் யார்", "சரி",
      // Global
      "merci", "gracias", "danke", "grazie", "obrigado", "спасибо", "谢谢", "ありがとう", "감사합니다", "شكرا"
    ];
    const isCasual = casualPhrases.some((cp) => {
      if (clean === cp || clean.startsWith(cp + " ")) return true;
      return clean.includes(cp);
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
      /what\s+about\s+that/i,
      // Indic contextual follow-ups
      /इसे\s*कैसे\s*कम\s*कर/i,
      /किस\s*श्रेणी\s*में\s*सबसे\s*ज्यादा/i,
      /ಅದನ್ನು\s*ಹೇಗೆ\s*ಕಡಿಮೆ\s*ಮಾಡ/i,
      /ಯಾವ\s*ವರ್ಗದಲ್ಲಿ\s*ಹೆಚ್ಚು/i,
      /దీన్ని\s*ఎలా\s*తగ్గించ/i,
      /ఏ\s*విభాగంలో\s*అత్యధిక/i,
      /அதை\s*எப்படி\s*குறைக்க/i,
      /எந்தப்\s*பிரிவில்\s*அதிக/i
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
      let greetKey = "greeting_default";
      if (clean.includes("morning") || clean.includes("प्रभात") || clean.includes("ಶುಭೋದಯ") || clean.includes("శుభోదయం") || clean.includes("காலை")) {
        greetKey = "greeting_morning";
      } else if (clean.includes("evening") || clean.includes("संध्या") || clean.includes("ಸಂಜೆ") || clean.includes("సాయంత్రం") || clean.includes("மாலை")) {
        greetKey = "greeting_evening";
      } else if (clean.includes("afternoon")) {
        greetKey = "greeting_afternoon";
      }

      return {
        text: t(greetKey),
        followUps: [
          getPrompt("spend_month"),
          getPrompt("where_money"),
          getPrompt("save_more")
        ]
      };
    }

    // ========================================================
    // B. NORMAL / CASUAL CONVERSATIONS (NO FINANCIAL DATA FETCHED)
    // ========================================================
    if (intent === "CASUAL") {
      // "How are you?"
      if (/how\s*(?:are|r)\s*(?:you|u)|hows\s*it\s*going|कैसे\s*हैं|ಹೇಗಿದ್ದೀರಿ|ఎలా\s*ఉన్నారు|எப்படி\s*இருக்கிறீர்கள்/i.test(clean)) {
        return {
          text: t("casual_how_are_you"),
          followUps: [
            getPrompt("spend_month"),
            getPrompt("where_money"),
            getPrompt("save_more")
          ]
        };
      }

      // "Thank you"
      if (/thank|thanks|thx|धन्यवाद|ಧನ್ಯವಾದ|ధన్యవాదాలు|நன்றி|merci|gracias|danke/i.test(clean)) {
        return {
          text: t("casual_thank_you"),
          followUps: [
            getPrompt("where_money"),
            getPrompt("save_more")
          ]
        };
      }

      // "Okay", "That's good", "Cool", "Nice"
      if (/^(?:ok|okay|alright|cool|nice|got\s*it|sounds\s*good|thats\s*good|great|awesome|perfect|fine|ठीक\s*है|ಸರಿ|సరే|சரி)$/i.test(clean)) {
        return {
          text: t("casual_ack"),
          followUps: [
            getPrompt("compare_months"),
            getPrompt("savings_plan")
          ]
        };
      }

      // "Can you help me?"
      if (/can\s*you\s*help|need\s*help|what\s*can\s*you\s*do|help\s*me|मदद|ಸಹಾಯ|సహాయం|உதவ/i.test(clean)) {
        return {
          text: t("casual_help"),
          followUps: [
            getPrompt("spend_month"),
            getPrompt("where_money"),
            getPrompt("save_more")
          ]
        };
      }

      // "Who are you?"
      if (/who\s*are\s*you|what\s*is\s*your\s*name|whats\s*your\s*name|what\s*are\s*you|तुम\s*कौन\s*हो|ನೀವು\s*ಯಾರು|మీరు\s*ఎవరు|நீங்கள்\s*யார்/i.test(clean)) {
        return {
          text: t("casual_who"),
          followUps: [
            getPrompt("spend_month"),
            getPrompt("where_money"),
            getPrompt("savings_plan")
          ]
        };
      }

      // "Goodbye"
      if (/bye|goodbye|see\s*you|cya|अलविदा/i.test(clean)) {
        return {
          text: t("casual_bye")
        };
      }

      return {
        text: t("casual_fallback"),
        followUps: [
          getPrompt("spend_month"),
          getPrompt("where_money"),
          getPrompt("save_more")
        ]
      };
    }

    // ========================================================
    // C. UNRELATED TOPICS (NO FINANCIAL DATA FETCHED)
    // ========================================================
    if (intent === "UNRELATED") {
      return {
        text: t("unrelated_scope"),
        followUps: [
          getPrompt("spend_month"),
          getPrompt("where_money"),
          getPrompt("save_more")
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
      /इस\s*महीने\s*मैंने\s*कितना\s*खर्च/i.test(clean) ||
      /ಈ\s*ತಿಂಗಳು\s*ನಾನು\s*ಎಷ್ಟು\s*ಖರ್ಚು/i.test(clean) ||
      /ఈ\s*నెల\s*నేను\s*ఎంత\s*ఖర్చు/i.test(clean) ||
      /இந்த\s*மாதம்\s*நான்\s*எவ்வளவு\s*செலவு/i.test(clean) ||
      (clean.includes("spend") && clean.includes("month") && !clean.includes("compare") && !clean.includes("last"))
    ) {
      const curExp = data.curMonthExpenseTotal;
      const count = data.currentMonthExpenses.length;
      const top = data.topCategory;

      if (curExp === 0) {
        return {
          text: t("spending_zero"),
          followUps: [getPrompt("analyze_income"), getPrompt("savings_plan")]
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

      const resp = t("spending_month", {
        amount: fmt(curExp),
        count,
        s: count === 1 ? "" : "s",
        topCategory: top ? top.category : "Expenses",
        topAmount: top ? fmt(top.amount) : fmt(0)
      });

      return {
        text: resp,
        savedContext: { ...lastContext },
        followUps: [
          getPrompt("cat_highest"),
          getPrompt("reduce_it"),
          getPrompt("compare_months")
        ]
      };
    }

    // 2. "Which category was highest?" / "Which category did I spend the most on?" / "Where does most of my money go?"
    if (
      /where\s*(?:does|did)\s*most\s*of\s*my\s*money\s*go/i.test(clean) ||
      /which\s*category\s*(?:did\s*i\s*spend\s*the\s*most|was\s*highest|was\s*the\s*highest)/i.test(clean) ||
      /highest\s*(?:category|spending|expense)/i.test(clean) ||
      /what\s*was\s*(?:the\s*)?highest/i.test(clean) ||
      /पैसा\s*कहाँ\s*जाता\s*है|किस\s*श्रेणी\s*में\s*सबसे\s*ज्यादा/i.test(clean) ||
      /ಹಣ\s*ಎಲ್ಲಿಗೆ\s*ಹೋಗುತ್ತದೆ|ಯಾವ\s*ವರ್ಗದಲ್ಲಿ\s*ಹೆಚ್ಚು/i.test(clean) ||
      /డబ్బు\s*ఎక్కువగా\s*దేనికి|ఏ\s*విభాగంలో\s*అత్యధిక/i.test(clean) ||
      /பணம்\s*பெரும்பாலும்\s*எங்கே|எந்தப்\s*பிரிவில்\s*அதிக/i.test(clean) ||
      clean === "where does most of my money go"
    ) {
      if (data.totalExpenseAmount === 0) {
        return {
          text: t("spending_zero"),
          followUps: [getPrompt("analyze_income"), getPrompt("savings_plan")]
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

      let secondText = "";
      if (data.sortedCategories.length > 1) {
        const second = data.sortedCategories[1];
        const secondPct = ((second.amount / data.totalExpenseAmount) * 100).toFixed(1);
        secondText = t("second_highest", { category: second.category, amount: fmt(second.amount), pct: secondPct });
      }

      const resp = t("where_money_goes", {
        period: periodLabel,
        topCategory: top.category,
        topAmount: fmt(top.amount),
        topPct,
        secondText
      });

      return {
        text: resp,
        savedContext: { ...lastContext },
        followUps: [
          getPrompt("reduce_it"),
          getPrompt("save_more"),
          getPrompt("compare_months")
        ]
      };
    }

    // 3. "Analyze my spending" (Explicit full spending breakdown & doughnut chart)
    if (
      /analyze\s*my\s*spending/i.test(clean) ||
      /analyse\s*my\s*spending/i.test(clean) ||
      /spending\s*breakdown/i.test(clean) ||
      /खर्च\s*का\s*विश्लेषण|ಖರ್ಚನ್ನು\s*ವಿಶ್ಲೇಷಿಸಿ|ఖర్చును\s*విశ్లేషించండి|செலவுகளை\s*பகுப்பாய்வு/i.test(clean)
    ) {
      if (data.totalExpenseAmount === 0) {
        return {
          text: t("spending_zero"),
          followUps: [getPrompt("analyze_income"), getPrompt("savings_plan")]
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

      let secondText = "";
      if (data.sortedCategories.length > 1) {
        const second = data.sortedCategories[1];
        const secondPct = ((second.amount / data.totalExpenseAmount) * 100).toFixed(1);
        secondText = t("second_highest", { category: second.category, amount: fmt(second.amount), pct: secondPct });
      }

      const analysis = t("where_money_goes", {
        period: periodLabel,
        topCategory: top.category,
        topAmount: fmt(top.amount),
        topPct,
        secondText
      });

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
          getPrompt("reduce_cat", { category: top.category }),
          getPrompt("compare_months"),
          getPrompt("save_more")
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
      /कम\s*कर|ಕಡಿಮೆ\s*ಮಾಡ|తగ్గించ|குறைக்க/i.test(clean) ||
      clean === "help me reduce expenses"
    ) {
      const targetCat = (lastContext && lastContext.topCategory) || (data.topCategory && data.topCategory.category) || "Bills";
      const targetAmt = (lastContext && lastContext.topAmount) || (data.topCategory && data.topCategory.amount) || 1000;

      const cut10 = targetAmt * 0.10;
      const catLower = targetCat.toLowerCase();
      let tips = "";
      if (catLower.includes("food") || catLower.includes("grocer") || catLower.includes("dining")) {
        tips = t("tips_food");
      } else if (catLower.includes("bill") || catLower.includes("utilit")) {
        tips = t("tips_bills");
      } else if (catLower.includes("shop") || catLower.includes("entertain")) {
        tips = t("tips_shopping");
      } else {
        tips = t("tips_general", { category: targetCat });
      }

      const response = t("reduce_intro", {
        category: targetCat,
        amount: fmt(targetAmt),
        tips,
        cut10: fmt(cut10),
        cut10Year: fmt(cut10 * 12)
      });

      return {
        text: response,
        savedContext: { ...lastContext },
        followUps: [
          getPrompt("savings_plan"),
          getPrompt("where_money"),
          getPrompt("compare_months")
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
      /बचत\s*योजना|ಉಳಿತಾಯ\s*ಯೋಜನೆ|పొదుపు\s*ప్రణాళిక|சேமிப்புத்\s*திட்டம்/i.test(clean) ||
      clean === "create a savings plan"
    ) {
      const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
      const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
      const surplus = income - expenses;

      if (surplus <= 0 && income === 0) {
        return {
          text: t("savings_zero_income"),
          followUps: [getPrompt("analyze_spending"), getPrompt("spend_month")]
        };
      }

      if (surplus <= 0) {
        const topCat = data.topCategory?.category || "Expenses";
        const topAmt = data.topCategory?.amount || expenses;
        return {
          text: t("savings_deficit", {
            expenses: fmt(expenses),
            income: fmt(income),
            topCategory: topCat,
            cut10: fmt(topAmt * 0.1)
          }),
          followUps: [getPrompt("reduce_it"), getPrompt("where_money")]
        };
      }

      const p20 = surplus * 0.20;
      const p40 = surplus * 0.40;
      const p60 = surplus * 0.60;

      const plan = t("savings_plan_intro", {
        surplus: fmt(surplus),
        income: fmt(income),
        expenses: fmt(expenses),
        p20: fmt(p20),
        p20Year: fmt(p20 * 12),
        p40: fmt(p40),
        p40Year: fmt(p40 * 12),
        p60: fmt(p60),
        p60Year: fmt(p60 * 12)
      });

      return {
        text: plan,
        chartType: "savings_projection",
        chartData: {
          monthlySavings: [p20, p40, p60],
          labels: ["20%", "40%", "60%"],
          currency: cur
        },
        savedContext: { topic: "savings_plan", surplus, income, expenses },
        followUps: [
          `I want to save ${fmt(50000)}`,
          getPrompt("reduce_it"),
          getPrompt("compare_months")
        ]
      };
    }

    // 6. Custom Goal Target (e.g. "I want to save 500 dollars")
    const goalMatch = q.match(/(?:save|goal|target|बचाना|ಉಳಿತಾಯ|పొదుపు|சேமிக்க)\s*(?:of)?\s*(?:rs|inr|\$|€|£|₹)?\s*([0-9,]+)/i);
    if (goalMatch) {
      const targetGoal = Number(goalMatch[1].replace(/,/g, ""));
      if (Number.isFinite(targetGoal) && targetGoal > 0) {
        const income = data.curMonthIncomeTotal > 0 ? data.curMonthIncomeTotal : data.totalIncomeAmount;
        const expenses = data.curMonthExpenseTotal > 0 ? data.curMonthExpenseTotal : data.totalExpenseAmount;
        const surplus = Math.max(income - expenses, 1);

        const balancedMonthly = surplus * 0.40;
        const monthsNeeded = Math.ceil(targetGoal / Math.max(balancedMonthly, 500));

        const res = t("custom_goal", {
          targetGoal: fmt(targetGoal),
          surplus: fmt(surplus),
          contribution: fmt(balancedMonthly),
          months: monthsNeeded,
          s: monthsNeeded === 1 ? "" : "s"
        });

        return {
          text: res,
          followUps: [getPrompt("reduce_it"), getPrompt("where_money")]
        };
      }
    }

    // 7. "Compare this month and last month"
    if (
      /compare\s*this\s*month\s*and\s*last\s*month/i.test(clean) ||
      /compare\s*month/i.test(clean) ||
      /monthly\s*comparison/i.test(clean) ||
      /तुलना\s*करें|ಹೋಲಿಸಿ|పోల్చండి|ஒப்பிடுக/i.test(clean) ||
      (clean.includes("last month") && clean.includes("this month"))
    ) {
      const curExp = data.curMonthExpenseTotal;
      const prevExp = data.prevMonthExpenseTotal;
      const curInc = data.curMonthIncomeTotal;
      const prevInc = data.prevMonthIncomeTotal;

      const expDiff = curExp - prevExp;
      const expPct = prevExp > 0 ? ((Math.abs(expDiff) / prevExp) * 100).toFixed(1) : (curExp > 0 ? "100" : "0");

      const incDiff = curInc - prevInc;
      const incPct = prevInc > 0 ? ((Math.abs(incDiff) / prevInc) * 100).toFixed(1) : (curInc > 0 ? "100" : "0");

      const curNet = curInc - curExp;
      const prevNet = prevInc - prevExp;

      const expDiffText = expDiff > 0 ? t("diff_increased", { diff: fmt(expDiff), pct: expPct })
        : (expDiff < 0 ? t("diff_decreased", { diff: fmt(Math.abs(expDiff)), pct: expPct }) : t("diff_unchanged"));

      const incDiffText = incDiff > 0 ? t("diff_increased", { diff: fmt(incDiff), pct: incPct })
        : (incDiff < 0 ? t("diff_decreased", { diff: fmt(Math.abs(incDiff)), pct: incPct }) : t("diff_unchanged"));

      const prevNetFormatted = (prevNet >= 0 ? "+" : "−") + fmt(Math.abs(prevNet));
      const curNetFormatted = (curNet >= 0 ? "+" : "−") + fmt(Math.abs(curNet));

      let msg = t("month_compare_title");
      msg += t("month_compare_exp", { prevExp: fmt(prevExp), curExp: fmt(curExp), expDiff: expDiffText });
      msg += t("month_compare_inc", { prevInc: fmt(prevInc), curInc: fmt(curInc), incDiff: incDiffText });
      msg += t("month_compare_net", { prevNet: prevNetFormatted, curNet: curNetFormatted });

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
          getPrompt("where_money"),
          getPrompt("save_more"),
          getPrompt("reduce_it")
        ]
      };
    }

    // 8. "Analyze my income"
    if (
      /analyze\s*my\s*income/i.test(clean) ||
      /analyse\s*my\s*income/i.test(clean) ||
      /income\s*breakdown/i.test(clean) ||
      /आय\s*का\s*विश्लेषण|ಆದಾಯವನ್ನು\s*ವಿಶ್ಲೇಷಿಸಿ|ఆదాయాన్ని\s*విశ్లేషించండి|வருமான\s*பகுப்பாய்வு/i.test(clean)
    ) {
      if (data.totalIncomeAmount === 0) {
        return {
          text: t("income_zero"),
          followUps: [getPrompt("analyze_spending"), getPrompt("spend_month")]
        };
      }

      let streamsText = "";
      data.sortedIncomeCategories.forEach((item, idx) => {
        const pct = ((item.amount / data.totalIncomeAmount) * 100).toFixed(1);
        streamsText += `${idx + 1}. **${item.category}**: ${fmt(item.amount)} (${pct}%)\n`;
      });

      const res = t("income_analysis", {
        total: fmt(data.totalIncomeAmount),
        count: data.sortedIncomeCategories.length,
        s: data.sortedIncomeCategories.length === 1 ? "" : "s",
        streams: streamsText
      });

      return {
        text: res,
        followUps: [
          getPrompt("savings_plan"),
          getPrompt("compare_months"),
          getPrompt("monthly_report")
        ]
      };
    }

    // 9. "Give me a monthly financial report"
    if (
      /monthly\s*financial\s*report/i.test(clean) ||
      /financial\s*report/i.test(clean) ||
      /summary\s*report/i.test(clean) ||
      /वित्तीय\s*रिपोर्ट|ಹಣಕಾಸು\s*ವರದಿ|ఆర్థిక\s*నివేదిక|நிதி\s*அறிக்கை/i.test(clean)
    ) {
      const inc = data.curMonthIncomeTotal;
      const exp = data.curMonthExpenseTotal;
      const net = inc - exp;
      const savingsRate = inc > 0 ? ((Math.max(net, 0) / inc) * 100).toFixed(1) : 0;

      let healthText = t("health_good");
      if (net > 0 && Number(savingsRate) >= 20) {
        healthText = t("health_excellent");
      } else if (net <= 0) {
        healthText = t("health_attention");
      }

      const topCatText = data.topCategory ? `${data.topCategory.category} (${fmt(data.topCategory.amount)})` : "None";

      let report = t("monthly_report_title", { month: data.currentMonthKey });
      report += t("monthly_report_body", {
        inc: fmt(inc),
        exp: fmt(exp),
        net: (net >= 0 ? "+" : "−") + fmt(Math.abs(net)),
        savingsRate,
        topCat: topCatText
      });
      report += healthText;

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
          getPrompt("where_money"),
          getPrompt("save_more"),
          getPrompt("reduce_it")
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
        text: t("category_spent", {
          category: catCheck.category,
          amount: fmt(catCheck.amount),
          pct
        }),
        savedContext: { ...lastContext },
        followUps: [
          getPrompt("reduce_cat", { category: catCheck.category }),
          getPrompt("where_money"),
          getPrompt("savings_plan")
        ]
      };
    }

    // 11. Wallet balance query
    if (clean.includes("balance") || clean.includes("wallet") || clean.includes("वॉलेट") || clean.includes("ವಾಲೆಟ್") || clean.includes("వాలెట్") || clean.includes("வாலட்")) {
      const entries = Object.entries(data.walletBalances);
      if (entries.length === 0) {
        return {
          text: t("wallet_zero"),
          followUps: [getPrompt("analyze_spending"), getPrompt("save_more")]
        };
      }
      let bMsg = t("wallet_title");
      entries.forEach(([c, amt]) => {
        bMsg += `• **${c}**: ${fmt(amt, c)}\n`;
      });
      return {
        text: bMsg,
        followUps: [getPrompt("spend_month"), getPrompt("savings_plan")]
      };
    }

    // Fallback for general financial questions: keep it short and friendly in current language
    return {
      text: t("financial_fallback"),
      followUps: [
        getPrompt("spend_month"),
        getPrompt("where_money"),
        getPrompt("save_more")
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
      text: t("welcome_msg", { name }),
      followUps: [
        getPrompt("spend_month"),
        getPrompt("where_money"),
        getPrompt("save_more"),
        getPrompt("compare_months")
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
          <span class="agent-msg-sender">${isUser ? (window.Finova ? Finova.translate("You") : "You") : getAgentDisplayName()}</span>
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

    // Calculate response in the currently selected language
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

  function updateLocalizedUI() {
    updateAgentUiLanguage();
    try {
      const pending = sessionStorage.getItem("finova.agent.pending_query");
      if (pending && userInput) {
        userInput.value = pending;
        userInput.focus();
        userInput.dispatchEvent(new Event("input", { bubbles: true }));
        sessionStorage.removeItem("finova.agent.pending_query");
      }
    } catch {}
    const trans = Finova.getTransactions ? Finova.getTransactions() : [];
    if (recordsCountEl) {
      recordsCountEl.textContent = t("connected_badge", { count: trans.length });
    }
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

      userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          chatForm.dispatchEvent(new Event("submit", { cancelable: true }));
        }
      });

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

    // Currency changed
    window.addEventListener("finova:currency-changed", () => {
      renderAllMessages();
    });

    // Language changed: immediately update badge without reload
    window.addEventListener("finova:language-changed", () => {
      updateLocalizedUI();
    });

    updateLocalizedUI();
  }

  // Expose Agent API for external & test integration
  window.FinovaAgent = {
    processQuery: (query) => processAgentQuery(query),
    classifyIntent: (query) => classifyIntent(query),
    getSummary: getFinancialSummary,
    getHistory: () => [...conversationHistory],
    getContext: () => (lastContext ? { ...lastContext } : null),
    setContext: (ctx) => {
      lastContext = ctx ? { ...ctx } : null;
    },
    getSystemInstruction: getSystemInstruction,
    getCurrentLanguage: getCurrentLang
  };

  document.addEventListener("DOMContentLoaded", async () => {
    if (Finova.ready) await Finova.ready;
    loadHistory();
    initEvents();
    updateAgentUiLanguage();
    try {
      const pending = sessionStorage.getItem("finova.agent.pending_query");
      if (pending && userInput) {
        userInput.value = pending;
        userInput.focus();
        userInput.dispatchEvent(new Event("input", { bubbles: true }));
        sessionStorage.removeItem("finova.agent.pending_query");
      }
    } catch {}
  });
})();
