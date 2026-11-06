/* ========================================================
   FINOVA AGENT i18n – Multilingual Localization System
   Synchronized directly with FINOVA application language
   Supports all 30 FINOVA languages
   ======================================================== */
(function () {
  "use strict";

  const I18N = {};

  // English
  I18N.en = {
    langName: "English",
    greeting_default: "Hey! 👋 How's your day going? What can I help you with?",
    greeting_morning: "Good morning! ☀️ Hope your day is off to a great start. What can I help you with today?",
    greeting_afternoon: "Good afternoon! ☀️ How's your day going? What can I help you with?",
    greeting_evening: "Good evening! 🌙 How was your day? Let me know what you'd like to check today.",
    casual_how_are_you: "Doing well, thanks for asking! 😊 How about you? What would you like help with today?",
    casual_thank_you: "You're welcome! 😊 Let me know if you need any other help with your finances.",
    casual_ack: "Glad to hear! 😊 Feel free to ask whenever you'd like to check your spending or savings.",
    casual_help: "Of course! 😊 I can help you track your spending, check wallet balances, compare months, and build savings plans. What would you like to explore?",
    casual_who: "I'm **Agent**, your personal finance companion in FINOVA! I help you keep track of your income, expenses, and savings goals.",
    casual_bye: "Have a great day ahead! 👋 I'm always here whenever you want to check your finances.",
    casual_fallback: "I'm here to help! 😊 Feel free to ask anything about your spending, income, or savings goals.",
    unrelated_scope: "Sorry! 😊 I'm your personal finance Agent. I can help you understand your income, expenses, savings, and manage your money, but I can't help with that topic.",
    welcome_msg: "Hey {name}! 👋 I'm **Agent**, your personal finance companion.\n\nAsk me anything about your spending, income, or savings goals, or pick one of the quick suggestions below to get started!",
    spending_month: "You spent **{amount}** this month across **{count} transaction{s}**.\n\nMost of it went toward **{topCategory}** ({topAmount}).\n\nWould you like to see which category was highest, or how you can reduce it?",
    spending_zero: "You haven't recorded any expenses for this month yet. Once you add transactions on the **Add transaction** page, I'll keep track of your spending here! 😊",
    where_money_goes: "Most of your spending {period} was on **{topCategory}**, totaling **{topAmount}** (about **{topPct}%** of your total spending).\n\n{secondText}Would you like some practical tips to cut down on **{topCategory}**?",
    second_highest: "Your next biggest expense was **{category}** at **{amount}** ({pct}%).\n\n",
    reduce_intro: "To cut down on **{category}** (currently **{amount}**), here are practical steps you can take:\n\n{tips}\n\n💡 If you trim just 10%, you'll save **{cut10}/month** ({cut10Year} a year)!\n\nWould you like to build a savings plan around this?",
    savings_plan_intro: "Based on your current monthly surplus of **{surplus}** (Income: {income} − Expenses: {expenses}), here is a realistic savings roadmap:\n\n• **Comfortable Plan (20%)**: Save **{p20}/month** → **{p20Year}/year**\n• **Balanced Plan (Recommended · 40%)**: Save **{p40}/month** → **{p40Year}/year**\n• **Accelerated Plan (60%)**: Save **{p60}/month** → **{p60Year}/year**\n\nYou can also tell me a specific goal (e.g. *'I want to save $500'*), and I'll calculate how quickly you can hit it!",
    savings_zero_income: "You haven't recorded your income yet. Once you add your salary or earnings on the **Add transaction** page, I can calculate your exact monthly surplus and build a custom savings plan for you! 😊",
    savings_deficit: "Right now, your monthly expenses (**{expenses}**) match or exceed your income (**{income}**).\n\nThe quickest win is trimming 10% from your highest expense (**{topCategory}**), which would put **{cut10}/month** straight into savings.\n\nWould you like some ideas to trim spending on **{topCategory}**?",
    custom_goal: "🎯 **Savings Roadmap for {targetGoal}**:\n\n• Target Goal: **{targetGoal}**\n• Current Monthly Surplus: **{surplus}**\n• Suggested Contribution: **{contribution}/month** (40% of surplus)\n\nAt this pace, you'll reach your goal in about **{months} month{s}**! Trimming discretionary spending could get you there even faster.",
    month_compare_title: "Here is your month-over-month comparison:\n\n",
    month_compare_exp: "📉 **Expenses**: {prevExp} ➔ **{curExp}** {expDiff}\n",
    month_compare_inc: "📈 **Income**: {prevInc} ➔ **{curInc}** {incDiff}\n\n",
    month_compare_net: "⚖️ **Net Cash Flow**: Last month was **{prevNet}**, and this month is **{curNet}**.",
    diff_increased: "(🔺 Increased by {diff} or +{pct}%)",
    diff_decreased: "(🟢 Decreased by {diff} or {pct}%)",
    diff_unchanged: "(Unchanged)",
    income_analysis: "💰 **Income Overview**:\n\nTotal recorded earnings: **{total}** across **{count} stream{s}**.\n\n{streams}",
    income_zero: "You have no income entries recorded yet. Once you add your salary or earnings on the **Add transaction** page, I'll analyze your income diversification! 😊",
    monthly_report_title: "📋 **Monthly Financial Summary ({month})**:\n\n",
    monthly_report_body: "• **Income Received**: {inc}\n• **Expenses Incurred**: {exp}\n• **Net Cash Flow**: {net}\n• **Savings Rate**: **{savingsRate}%**\n• **Top Category**: {topCat}\n\n",
    health_excellent: "✨ **Health Rating: Excellent.** You are saving over 20% of your earnings. Keep up the good work!",
    health_good: "👍 **Health Rating: Good.** You have a positive cash flow. Consider trimming your top category to save even more.",
    health_attention: "⚠️ **Health Rating: Needs Attention.** Expenses match or exceed income this month. Reviewing your top category can help balance your cash flow.",
    category_spent: "You have spent **{amount}** on **{category}**, which is about **{pct}%** of your total spending.",
    wallet_title: "🏦 **Current Wallet Balances**:\n\n",
    wallet_zero: "You haven't set up any wallet balances yet. You can manage your wallets from the Overview dashboard!",
    financial_fallback: "I'm ready to help with your personal finances! You can ask me about your spending this month, check where most of your money goes, or ask for savings tips. What would you like to check?",
    connected_badge: "Connected to your financial records · {count} transactions",
    tips_food: "• **Plan weekly meals**: Batch cooking and grocery lists typically lower unplanned food bills by 10–15%.\n• **Audit dining out**: Set a dedicated weekly eating-out limit so impulse meals don't sneak up.\n• **Buy staples in bulk**: Stock up on long-lasting essentials when on discount.",
    tips_bills: "• **Audit recurring subscriptions**: Cancel streaming, gym, or digital services you haven't used in 30 days.\n• **Check provider rates**: Calling your broadband or mobile provider can often lower plans to newer promotional rates.\n• **Energy conservation**: Turn off idle electronics and adjust heating/cooling during peak hours.",
    tips_shopping: "• **The 48-Hour Rule**: Wait 48 hours before purchasing non-essential items to avoid impulse buying.\n• **Unlink one-click checkout**: Remove saved cards from online stores to add positive friction.\n• **Set a fun-money envelope**: Decide an exact budget for leisure each month and stick to it.",
    tips_general: "• **Set a category limit**: Give yourself a clear weekly ceiling for {category}.\n• **Track smaller purchases**: Daily micro-transactions often add up to half of the total.\n• **Automate savings first**: Transfer savings right when you get paid before spending on {category}.",
    prompts: {
      spend_month: "How much did I spend this month?",
      where_money: "Where does most of my money go?",
      save_more: "How can I save more?",
      cat_highest: "Which category was highest?",
      reduce_it: "How can I reduce it?",
      compare_months: "Compare this month and last month.",
      savings_plan: "Create a savings plan.",
      monthly_report: "Give me a monthly financial report.",
      analyze_income: "Analyze my income.",
      analyze_spending: "Analyze my spending.",
      reduce_cat: "How can I reduce spending on {category}?"
    }
  };

  // Helper function to clone & customize for languages
  function createLang(name, overrides) {
    const res = Object.assign({}, I18N.en, overrides);
    res.langName = name;
    if (overrides.prompts) {
      res.prompts = Object.assign({}, I18N.en.prompts, overrides.prompts);
    }
    return res;
  }

  // Hindi (हिन्दी)
  I18N.hi = createLang("हिन्दी", {
    greeting_default: "नमस्ते! 👋 आज मैं आपकी कैसे मदद कर सकता हूँ?",
    greeting_morning: "शुभ प्रभात! ☀️ आशा है आपका दिन अच्छा शुरू हुआ होगा। आज मैं आपकी कैसे मदद कर सकता हूँ?",
    greeting_afternoon: "नमस्कार! ☀️ आपका दिन कैसा चल रहा है? मैं आपकी क्या मदद कर सकता हूँ?",
    greeting_evening: "शुभ संध्या! 🌙 आज आप क्या देखना चाहेंगे?",
    casual_how_are_you: "मैं ठीक हूँ, पूछने के लिए धन्यवाद! 😊 आप कैसे हैं? आज आप क्या देखना चाहेंगे?",
    casual_thank_you: "आपका स्वागत है! 😊 अगर आपको पैसों से जुड़ी कोई और मदद चाहिए तो मुझे जरूर बताएं।",
    casual_ack: "यह सुनकर अच्छा लगा! 😊 जब भी आप अपने खर्च या बचत देखना चाहें, बेझिझक पूछें।",
    casual_help: "बिल्कुल! 😊 मैं आपके खर्च ट्रैक करने, वॉलेट बैलेंस देखने, महीनों की तुलना करने और बचत योजना बनाने में मदद कर सकता हूँ।",
    casual_who: "मैं **Agent** हूँ, FINOVA में आपका पर्सनल फ़ाइनेंस साथी! मैं आपकी आय, खर्च और बचत लक्ष्यों को ट्रैक करने में मदद करता हूँ।",
    casual_bye: "आपका दिन शुभ हो! 👋 जब भी आपको अपने पैसों की जानकारी चाहिए, मैं यहीं हूँ।",
    casual_fallback: "मैं आपकी मदद के लिए यहाँ हूँ! 😊 अपने खर्च, आय या बचत लक्ष्यों के बारे में कुछ भी पूछें।",
    unrelated_scope: "माफ़ कीजिए! 😊 मैं आपका पर्सनल फ़ाइनेंस एजेंट हूँ। मैं आपकी आय, खर्च, बचत और पैसों के प्रबंधन में मदद कर सकता हूँ, लेकिन इस विषय में नहीं।",
    welcome_msg: "नमस्ते {name}! 👋 मैं **Agent** हूँ, आपका पर्सनल फ़ाइनेंस साथी।\n\nअपने खर्च, आय या बचत लक्ष्यों के बारे में मुझसे कुछ भी पूछें, या शुरू करने के लिए नीचे दिए गए सुझावों में से चुनें!",
    spending_month: "आपने इस महीने **{amount}** खर्च किए हैं ({count} लेन-देन में)।\n\nइसमें सबसे ज्यादा खर्च **{topCategory}** ({topAmount}) पर हुआ है।\n\nक्या आप जानना चाहते हैं कि किस श्रेणी में सबसे ज्यादा खर्च हुआ, या इसे कैसे कम किया जाए?",
    spending_zero: "आपने इस महीने के लिए अभी तक कोई खर्च दर्ज नहीं किया है। जैसे ही आप **Add transaction** पेज पर लेन-देन जोड़ेंगे, मैं यहाँ आपका खर्च ट्रैक रखूँगा! 😊",
    where_money_goes: "{period} आपका सबसे ज्यादा पैसा **{topCategory}** पर खर्च हुआ, कुल **{topAmount}** (आपके कुल खर्च का लगभग **{topPct}%**)।\n\n{secondText}क्या आप **{topCategory}** पर खर्च कम करने के व्यावहारिक सुझाव जानना चाहते हैं?",
    second_highest: "आपका दूसरा सबसे बड़ा खर्च **{category}** पर था: **{amount}** ({pct}%)।\n\n",
    reduce_intro: "**{category}** (वर्तमान में **{amount}**) पर खर्च कम करने के लिए, यहाँ कुछ व्यावहारिक उपाय दिए गए हैं:\n\n{tips}\n\n💡 यदि आप केवल 10% की कटौती करते हैं, तो आप **{cut10}/माह** ({cut10Year} प्रति वर्ष) बचा सकते हैं!",
    savings_plan_intro: "आपकी वर्तमान मासिक बचत अधिशेष **{surplus}** (आय: {income} − व्यय: {expenses}) के आधार पर, यहाँ एक बचत योजना है:\n\n• **सहज योजना (20%)**: बचत **{p20}/माह** → **{p20Year}/वर्ष**\n• **संतुलित योजना (अनुशंसित · 40%)**: बचत **{p40}/माह** → **{p40Year}/वर्ष**\n• **त्वरित योजना (60%)**: बचत **{p60}/माह** → **{p60Year}/वर्ष**",
    savings_zero_income: "आपने अभी तक अपनी आय दर्ज नहीं की है। एक बार जब आप **Add transaction** पेज पर अपनी कमाई जोड़ेंगे, तो मैं आपके लिए कस्टम बचत योजना बना दूंगा! 😊",
    savings_deficit: "वर्तमान में आपका मासिक खर्च (**{expenses}**) आपकी आय (**{income}**) से मेल खाता है या उससे अधिक है। सबसे आसान उपाय अपने सबसे बड़े खर्च (**{topCategory}**) में 10% की कटौती करना है।",
    month_compare_title: "यहाँ आपका महीने-दर-महीने का तुलनात्मक विवरण है:\n\n",
    month_compare_exp: "📉 **खर्च**: {prevExp} ➔ **{curExp}** {expDiff}\n",
    month_compare_inc: "📈 **आय**: {prevInc} ➔ **{curInc}** {incDiff}\n\n",
    month_compare_net: "⚖️ **नेट कैश फ्लो**: पिछले महीने **{prevNet}** था, और इस महीने **{curNet}** है।",
    diff_increased: "(🔺 {diff} बढ़ा या +{pct}%)",
    diff_decreased: "(🟢 {diff} घटा या {pct}%)",
    diff_unchanged: "(अपरिवर्तित)",
    income_analysis: "💰 **आय विश्लेषण**:\n\nकुल दर्ज आय: **{total}** ({count} स्रोतों से)।\n\n{streams}",
    income_zero: "आपके पास अभी कोई आय दर्ज नहीं है। आय विविधीकरण ट्रैक करने के लिए **Add transaction** में अपनी कमाई जोड़ें! 😊",
    monthly_report_title: "📋 **मासिक वित्तीय सारांश ({month})**:\n\n",
    monthly_report_body: "• **प्राप्त आय**: {inc}\n• **कुल खर्च**: {exp}\n• **नेट कैश फ्लो**: {net}\n• **बचत दर**: **{savingsRate}%**\n• **शीर्ष खर्च श्रेणी**: {topCat}\n\n",
    health_excellent: "✨ **स्वास्थ्य रेटिंग: उत्कृष्ट।** आप अपनी कमाई का 20% से अधिक बचा रहे हैं। बहुत बढ़िया!",
    health_good: "👍 **स्वास्थ्य रेटिंग: अच्छी।** आपके पास सकारात्मक कैश फ्लो है।",
    health_attention: "⚠️ **स्वास्थ्य रेटिंग: ध्यान देने की आवश्यकता है।** इस महीने खर्च आय के बराबर या उससे अधिक है।",
    category_spent: "आपने **{category}** पर **{amount}** खर्च किए हैं, जो आपके कुल खर्च का लगभग **{pct}%** है।",
    wallet_title: "🏦 **वर्तमान वॉलेट बैलेंस**:\n\n",
    wallet_zero: "आपने अभी तक कोई वॉलेट बैलेंस सेट नहीं किया है।",
    financial_fallback: "मैं आपके व्यक्तिगत वित्त में मदद के लिए तैयार हूँ! आप इस महीने के खर्च, सबसे ज्यादा खर्च कहाँ हुआ, या बचत टिप्स पूछ सकते हैं।",
    connected_badge: "आपके वित्तीय रिकॉर्ड से जुड़ा हुआ · {count} लेन-देन",
    prompts: {
      spend_month: "इस महीने मैंने कितना खर्च किया?",
      where_money: "मेरा सबसे ज्यादा पैसा कहाँ जाता है?",
      save_more: "मैं और बचत कैसे कर सकता हूँ?",
      cat_highest: "किस श्रेणी में सबसे ज्यादा खर्च हुआ?",
      reduce_it: "मैं इसे कैसे कम कर सकता हूँ?",
      compare_months: "इस महीने और पिछले महीने की तुलना करें।",
      savings_plan: "बचत योजना बनाएं।",
      monthly_report: "मासिक वित्तीय रिपोर्ट दें।",
      analyze_income: "मेरी आय का विश्लेषण करें।",
      analyze_spending: "मेरे खर्च का विश्लेषण करें।",
      reduce_cat: "{category} पर खर्च कैसे कम करें?"
    }
  });

  // Kannada (ಕನ್ನಡ)
  I18N.kn = createLang("ಕನ್ನಡ", {
    greeting_default: "ನಮಸ್ಕಾರ! ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    greeting_morning: "ಶುಭೋದಯ! ☀️ ನಿಮ್ಮ ದಿನವು ಉತ್ತಮವಾಗಿ ಆರಂಭವಾಗಲಿ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    greeting_afternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ! ☀️ ನಿಮ್ಮ ದಿನ ಹೇಗಿದೆ? ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    greeting_evening: "ಶುಭ ಸಂಜೆ! 🌙 ಇಂದು ನೀವು ಏನನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸುತ್ತೀರಿ?",
    casual_how_are_you: "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! 😊 ನೀವು ಹೇಗಿದ್ದೀರಿ? ಇಂದು ನಾನು ನಿಮಗೆ ಏನು ಸಹಾಯ ಮಾಡಲಿ?",
    casual_thank_you: "ಸ್ವಾಗತ! 😊 ನಿಮ್ಮ ಹಣಕಾಸಿನ ಬಗ್ಗೆ ಇನ್ನೇನಾದರೂ ಸಹಾಯ ಬೇಕಿದ್ದರೆ ನನಗೆ ತಿಳಿಸಿ.",
    casual_ack: "ಖುಷಿಯಾಯಿತು! 😊 ನಿಮ್ಮ ಖರ್ಚು ಅಥವಾ ಉಳಿತಾಯವನ್ನು ಪರಿಶೀಲಿಸಲು ಬಯಸಿದಾಗಲೆಲ್ಲಾ ಕೇಳಿ.",
    casual_help: "ಖಂಡಿತ! 😊 ನಿಮ್ಮ ಖರ್ಚುಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು, ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ ನೋಡಲು, ತಿಂಗಳುಗಳನ್ನು ಹೋಲಿಸಲು ಮತ್ತು ಉಳಿತಾಯ ಯೋಜನೆ ರೂಪಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.",
    casual_who: "ನಾನು **Agent**, FINOVA ನಲ್ಲಿ ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಒಡನಾಡಿ! ನಿಮ್ಮ ಆದಾಯ, ಖರ್ಚು ಮತ್ತು ಉಳಿತಾಯ ಗುರಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    casual_bye: "ಶುಭ ದಿನ! 👋 ನಿಮ್ಮ ಹಣಕಾಸು ಪರಿಶೀಲಿಸಲು ಬಯಸಿದಾಗಲೆಲ್ಲಾ ನಾನು ಇಲ್ಲೇ ಇರುತ್ತೇನೆ.",
    casual_fallback: "ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ! 😊 ನಿಮ್ಮ ಖರ್ಚು, ಆದಾಯ ಅಥವಾ ಉಳಿತಾಯದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ.",
    unrelated_scope: "ಕ್ಷಮಿಸಿ! 😊 ನಾನು ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಏಜೆಂಟ್. ನಿಮ್ಮ ಆದಾಯ, ಖರ್ಚು, ಉಳಿತಾಯ ಮತ್ತು ಹಣ ನಿರ್ವಹಣೆಗೆ ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ, ಆದರೆ ಈ ವಿಷಯದಲ್ಲಿ ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.",
    welcome_msg: "ನಮಸ್ಕಾರ {name}! 👋 ನಾನು **Agent**, ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಒಡನಾಡಿ.\n\nನಿಮ್ಮ ಖರ್ಚು, ಆದಾಯ ಅಥವಾ ಉಳಿತಾಯ ಗುರಿಗಳ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ!",
    spending_month: "ನೀವು ಈ ತಿಂಗಳು **{count} ವಹಿವಾಟುಗಳಲ್ಲಿ** ಒಟ್ಟು **{amount}** ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ.\n\nಇದರಲ್ಲಿ ಹೆಚ್ಚಿನ ಖರ್ಚು **{topCategory}** ({topAmount}) ಆಗಿದೆ.\n\nಯಾವ ವರ್ಗದಲ್ಲಿ ಹೆಚ್ಚು ಖರ್ಚಾಗಿದೆ ಅಥವಾ ಅದನ್ನು ಹೇಗೆ ಕಡಿಮೆ ಮಾಡಬಹುದು ಎಂದು ನೋಡಲು ಬಯಸುವಿರಾ?",
    spending_zero: "ನೀವು ಈ ತಿಂಗಳಿಗೆ ಇನ್ನೂ ಯಾವುದೇ ಖರ್ಚುಗಳನ್ನು ದಾಖಲಿಸಿಲ್ಲ. ವಹಿವಾಟುಗಳನ್ನು ಸೇರಿಸಿದ ನಂತರ ನಾನು ಅದನ್ನು ಇಲ್ಲಿ ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತೇನೆ! 😊",
    where_money_goes: "{period}ದಲ್ಲಿ ನಿಮ್ಮ ಹೆಚ್ಚಿನ ಹಣ **{topCategory}** ಮೇಲೆ ಖರ್ಚಾಗಿದೆ, ಒಟ್ಟು **{topAmount}** (ನಿಮ್ಮ ಒಟ್ಟು ಖರ್ಚಿನ ಸುಮಾರು **{topPct}%**).\n\n{secondText}ನೀವು **{topCategory}** ಮೇಲಿನ ಖರ್ಚನ್ನು ಕಡಿಮೆ ಮಾಡಲು ಉಪಯುಕ್ತ ಸಲಹೆಗಳನ್ನು ಬಯಸುವಿರಾ?",
    second_highest: "ನಿಮ್ಮ ಮುಂದಿನ ದೊಡ್ಡ ಖರ್ಚು **{category}** ಆಗಿದೆ: **{amount}** ({pct}%).\n\n",
    reduce_intro: "**{category}** (ಪ್ರಸ್ತುತ **{amount}**) ಮೇಲಿನ ಖರ್ಚನ್ನು ಕಡಿಮೆ ಮಾಡಲು, ಇಲ್ಲಿದೆ ಉಪಯುಕ್ತ ಸಲಹೆಗಳು:\n\n{tips}\n\n💡 ನೀವು ಕೇವಲ 10% ಉಳಿಸಿದರೆ, **{cut10}/ತಿಂಗಳು** ({cut10Year} ಪ್ರತಿ ವರ್ಷ) ಉಳಿಸಬಹುದು!",
    savings_plan_intro: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಮಾಸಿಕ ಉಳಿಕೆ **{surplus}** (ಆದಾಯ: {income} − ಖರ್ಚು: {expenses}) ಆಧಾರದ ಮೇಲೆ, ಇಲ್ಲಿದೆ ಉಳಿತಾಯ ಯೋಜನೆ:\n\n• **ಆರಾಮದಾಯಕ ಯೋಜನೆ (20%)**: ಉಳಿತಾಯ **{p20}/ತಿಂಗಳು** → **{p20Year}/ವರ್ಷ**\n• **ಸಮತೋಲಿತ ಯೋಜನೆ (ಶಿಫಾರಸು · 40%)**: ಉಳಿತಾಯ **{p40}/ತಿಂಗಳು** → **{p40Year}/ವರ್ಷ**\n• **ವೇಗದ ಯೋಜನೆ (60%)**: ಉಳಿತಾಯ **{p60}/ತಿಂಗಳು** → **{p60Year}/ವರ್ಷ**",
    savings_zero_income: "ನೀವು ಇನ್ನೂ ಆದಾಯವನ್ನು ದಾಖಲಿಸಿಲ್ಲ. ಒಮ್ಮೆ ಆದಾಯವನ್ನು ಸೇರಿಸಿದ ನಂತರ ನಾನು ನಿಖರವಾದ ಉಳಿತಾಯ ಯೋಜನೆಯನ್ನು ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತೇನೆ! 😊",
    savings_deficit: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಮಾಸಿಕ ಖರ್ಚುಗಳು (**{expenses}**) ನಿಮ್ಮ ಆದಾಯವನ್ನು (**{income}**) ಮೀರಿವೆ. ನಿಮ್ಮ ಅತಿ ಹೆಚ್ಚು ಖರ್ಚಿನ ವರ್ಗದಿಂದ (**{topCategory}**) 10% ಕಡಿತಗೊಳಿಸುವುದು ಉತ್ತಮ ಆರಂಭವಾಗಿದೆ.",
    month_compare_title: "ಇಲ್ಲಿದೆ ನಿಮ್ಮ ತಿಂಗಳ ಹೋಲಿಕೆ:\n\n",
    month_compare_exp: "📉 **ಖರ್ಚುಗಳು**: {prevExp} ➔ **{curExp}** {expDiff}\n",
    month_compare_inc: "📈 **ಆದಾಯ**: {prevInc} ➔ **{curInc}** {incDiff}\n\n",
    month_compare_net: "⚖️ **ನಿವ್ವಳ ನಗದು ಹರಿವು**: ಕಳೆದ ತಿಂಗಳು **{prevNet}**, ಈ ತಿಂಗಳು **{curNet}**.",
    diff_increased: "(🔺 {diff} ಹೆಚ್ಚಾಗಿದೆ ಅಥವಾ +{pct}%)",
    diff_decreased: "(🟢 {diff} ಕಡಿಮೆಯಾಗಿದೆ ಅಥವಾ {pct}%)",
    diff_unchanged: "(ಬದಲಾಗಿಲ್ಲ)",
    income_analysis: "💰 **ಆದಾಯ ವಿಶ್ಲೇಷಣೆ**:\n\nಒಟ್ಟು ದಾಖಲಾದ ಗಳಿಕೆ: **{total}** ({count} ಮೂಲಗಳಿಂದ).\n\n{streams}",
    income_zero: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಆದಾಯವನ್ನು ದಾಖಲಿಸಿಲ್ಲ. ಗಳಿಕೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು **Add transaction** ನಲ್ಲಿ ಸೇರಿಸಿ! 😊",
    monthly_report_title: "📋 **ಮಾಸಿಕ ಹಣಕಾಸು ಸಾರಾಂಶ ({month})**:\n\n",
    monthly_report_body: "• **ಸ್ವೀಕರಿಸಿದ ಆದಾಯ**: {inc}\n• **ಮಾಡಲಾದ ಖರ್ಚು**: {exp}\n• **ನಿವ್ವಳ ಹರಿವು**: {net}\n• **ಉಳಿತಾಯ ದರ**: **{savingsRate}%**\n• **ಮುಖ್ಯ ಖರ್ಚು ವರ್ಗ**: {topCat}\n\n",
    health_excellent: "✨ **ರೇಟಿಂಗ್: ಅತ್ಯುತ್ತಮ.** ನೀವು ನಿಮ್ಮ ಆದಾಯದ 20% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಉಳಿಸುತ್ತಿದ್ದೀರಿ. ಮುಂದುವರಿಸಿ!",
    health_good: "👍 **ರೇಟಿಂಗ್: ಉತ್ತಮ.** ನಿಮ್ಮ ನಗದು ಹರಿವು ಧನಾತ್ಮಕವಾಗಿದೆ.",
    health_attention: "⚠️ **ರೇಟಿಂಗ್: ಗಮನ ಅಗತ್ಯ.** ಈ ತಿಂಗಳು ಖರ್ಚು ಆದಾಯಕ್ಕೆ ಸಮನಾಗಿದೆ ಅಥವಾ ಹೆಚ್ಚಾಗಿದೆ.",
    category_spent: "ನೀವು **{category}** ಮೇಲೆ **{amount}** ಖರ್ಚು ಮಾಡಿದ್ದೀರಿ (ಒಟ್ಟು ಖರ್ಚಿನ ಸುಮಾರು **{pct}%**).",
    wallet_title: "🏦 **ಪ್ರಸ್ತುತ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್**:\n\n",
    wallet_zero: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್ ಹೊಂದಿಸಿಲ್ಲ.",
    financial_fallback: "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ! ನಿಮ್ಮ ಖರ್ಚು, ಉಳಿತಾಯ ಅಥವಾ ಹಣಕಾಸಿನ ಬಗ್ಗೆ ಕೇಳಿ.",
    connected_badge: "ನಿಮ್ಮ ಹಣಕಾಸು ದಾಖಲೆಗಳಿಗೆ ಸಂಪರ್ಕಗೊಂಡಿದೆ · {count} ವಹಿವಾಟುಗಳು",
    prompts: {
      spend_month: "ಈ ತಿಂಗಳು ನಾನು ಎಷ್ಟು ಖರ್ಚು ಮಾಡಿದ್ದೇನೆ?",
      where_money: "ನನ್ನ ಹೆಚ್ಚಿನ ಹಣ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ?",
      save_more: "ನಾನು ಹೆಚ್ಚು ಉಳಿತಾಯ ಮಾಡುವುದು ಹೇಗೆ?",
      cat_highest: "ಯಾವ ವರ್ಗದಲ್ಲಿ ಹೆಚ್ಚು ಖರ್ಚಾಗಿದೆ?",
      reduce_it: "ನಾನು ಅದನ್ನು ಹೇಗೆ ಕಡಿಮೆ ಮಾಡಬಹುದು?",
      compare_months: "ಈ ತಿಂಗಳು ಮತ್ತು ಕಳೆದ ತಿಂಗಳನ್ನು ಹೋಲಿಸಿ.",
      savings_plan: "ಉಳಿತಾಯ ಯೋಜನೆ ರಚಿಸಿ.",
      monthly_report: "ಮಾಸಿಕ ಹಣಕಾಸು ವರದಿ ನೀಡಿ.",
      analyze_income: "ನನ್ನ ಆದಾಯವನ್ನು ವಿಶ್ಲೇಷಿಸಿ.",
      analyze_spending: "ನನ್ನ ಖರ್ಚನ್ನು ವಿಶ್ಲೇಷಿಸಿ.",
      reduce_cat: "{category} ಮೇಲಿನ ಖರ್ಚನ್ನು ಕಡಿಮೆ ಮಾಡುವುದು ಹೇಗೆ?"
    }
  });

  // Telugu (తెలుగు)
  I18N.te = createLang("తెలుగు", {
    greeting_default: "నమస్కారం! ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    greeting_morning: "శుభోదయం! ☀️ మీ రోజు ఉత్సాహంగా ప్రారంభం కావాలని ఆశిస్తున్నాను. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    greeting_afternoon: "శుభ మధ్యాహ్నం! ☀️ మీ రోజు ఎలా ఉంది? నేను ఎలా సహాయపడగలను?",
    greeting_evening: "శుభ సాయంత్రం! 🌙 ఈరోజు మీరు ఏమి పరిశీలించాలనుకుంటున్నారు?",
    casual_how_are_you: "నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! 😊 మీరు ఎలా ఉన్నారు? ఈరోజు మీకు ఏమి సహాయం కావాలి?",
    casual_thank_you: "ధన్యవాదాలు! 😊 మీకు ఆర్థిక విషయాల్లో మరేదైనా సహాయం కావాలంటే నాకు తెలియజేయండి.",
    casual_ack: "సంతోషం! 😊 మీ ఖర్చులు లేదా పొదుపు వివరాలు తెలుసుకోవడానికి ఎప్పుడైనా అడగవచ్చు.",
    casual_help: "తప్పకుండా! 😊 మీ ఖర్చులను ట్రాక్ చేయడానికి, వాలెట్ బ్యాలెన్స్ చూడటానికి, నెలలను పోల్చడానికి మరియు పొదుపు ప్రణాళికలు రూపొందించడానికి నేను సహాయం చేయగలను.",
    casual_who: "నేను **Agent**, FINOVA లో మీ వ్యక్తిగత ఆర్థిక సహచరుడిని! మీ ఆదాయం, ఖర్చులు మరియు పొదుపు లక్ష్యాలను పర్యవేక్షించడంలో నేను సహాయపడతాను.",
    casual_bye: "మంచి రోజు కావాలని కోరుకుంటున్నాను! 👋 మీ ఆర్థిక వివరాలు చూసుకోవడానికి నేను ఎప్పుడూ ఇక్కడే ఉంటాను.",
    casual_fallback: "నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను! 😊 మీ ఖర్చులు, ఆదాయం లేదా పొదుపుల గురించి ఏదైనా అడగండి.",
    unrelated_scope: "క్షమించండి! 😊 నేను మీ వ్యక్తిగత ఆర్థిక సహాయకుడిని. మీ ఆదాయం, ఖర్చులు, పొదుపు మరియు డబ్బు నిర్వహణలో నేను సహాయపడగలను, కానీ ఈ అంశంలో సహాయం చేయలేను.",
    welcome_msg: "నమస్కారం {name}! 👋 నేను **Agent**, మీ వ్యక్తిగత ఆర్థిక సహచరుడిని.\n\nమీ ఖర్చులు, ఆదాయం లేదా పొదుపు లక్ష్యాల గురించి నన్ను ఏదైనా అడగండి!",
    spending_month: "మీరు ఈ నెల **{count} లావాదేవీలలో** మొత్తం **{amount}** ఖర్చు చేశారు.\n\nఇందులో ఎక్కువ ఖర్చు **{topCategory}** ({topAmount}) పై జరిగింది.\n\nఏ విభాగంలో అత్యధికంగా ఖర్చయిందో లేదా దాన్ని ఎలా తగ్గించవచ్చో చూడాలనుకుంటున్నారా?",
    spending_zero: "మీరు ఈ నెలకు సంబంధించి ఇంకా ఎటువంటి ఖర్చులను నమోదు చేయలేదు. లావాదేవీలను జోడించిన తర్వాత నేను ట్రాక్ చేస్తాను! 😊",
    where_money_goes: "{period}లో మీ ఎక్కువ డబ్బు **{topCategory}** పై ఖర్చయింది, మొత్తం **{topAmount}** (మీ మొత్తం ఖర్చులో దాదాపు **{topPct}%**).\n\n{secondText}మీరు **{topCategory}** ఖర్చును తగ్గించడానికి ఆచరణాత్మక చిట్కాలను చూడాలనుకుంటున్నారా?",
    second_highest: "మీ తదుపరి అతిపెద్ద ఖర్చు **{category}**: **{amount}** ({pct}%).\n\n",
    reduce_intro: "**{category}** (ప్రస్తుతం **{amount}**) పై ఖర్చును తగ్గించడానికి, ఇక్కడ కొన్ని ఆచరణాత్మక సూచనలు ఉన్నాయి:\n\n{tips}\n\n💡 మీరు కేవలం 10% తగ్గిస్తే, **{cut10}/నెల** ({cut10Year} సంవత్సరానికి) ఆదా చేసుకోవచ్చు!",
    savings_plan_intro: "మీ ప్రస్తుత నెలవారీ మిగులు **{surplus}** (ఆదాయం: {income} − ఖర్చులు: {expenses}) ఆధారంగా, ఇక్కడ ఒక పొదుపు ప్రణాళిక ఉంది:\n\n• **సులభమైన ప్లాన్ (20%)**: పొదుపు **{p20}/నెల** → **{p20Year}/సంవత్సరం**\n• **సమతుల్య ప్లాన్ (సిఫార్సు చేయబడింది · 40%)**: పొదుపు **{p40}/నెల** → **{p40Year}/సంవత్సరం**\n• **వేగవంతమైన ప్లాన్ (60%)**: పొదుపు **{p60}/నెల** → **{p60Year}/సంవత్సరం**",
    savings_zero_income: "మీరు ఇంకా మీ ఆదాయ వివరాలను నమోదు చేయలేదు. లావాదేవీలలో ఆదాయాన్ని చేర్చిన తర్వాత నేను పొదుపు ప్రణాళికను సిద్ధం చేస్తాను! 😊",
    savings_deficit: "ప్రస్తుతం మీ నెలవారీ ఖర్చులు (**{expenses}**) మీ ఆదాయాన్ని (**{income}**) మించిపోయాయి. మీ అత్యధిక ఖర్చు విభాగం (**{topCategory}**) నుండి 10% తగ్గించడం ఉత్తమ ప్రారంభం.",
    month_compare_title: "నెలవారీ పోలిక వివరాలు ఇక్కడ ఉన్నాయి:\n\n",
    month_compare_exp: "📉 **ఖర్చులు**: {prevExp} ➔ **{curExp}** {expDiff}\n",
    month_compare_inc: "📈 **ఆదాయం**: {prevInc} ➔ **{curInc}** {incDiff}\n\n",
    month_compare_net: "⚖️ **నికర నగదు ప్రవాహం**: గత నెల **{prevNet}**, ఈ నెల **{curNet}**.",
    diff_increased: "(🔺 {diff} పెరిగింది లేదా +{pct}%)",
    diff_decreased: "(🟢 {diff} తగ్గింది లేదా {pct}%)",
    diff_unchanged: "(మార్పు లేదు)",
    income_analysis: "💰 **ఆదాయ విశ్లేషణ**:\n\nమొత్తం నమోదైన ఆదాయం: **{total}** ({count} మార్గాల ద్వారా).\n\n{streams}",
    income_zero: "మీరు ఇంకా ఆదాయ వివరాలను నమోదు చేయలేదు. ట్రాక్ చేయడానికి **Add transaction** లో చేర్చండి! 😊",
    monthly_report_title: "📋 **నెలవారీ ఆర్థిక సారాంశం ({month})**:\n\n",
    monthly_report_body: "• **వచ్చిన ఆదాయం**: {inc}\n• **అయిన ఖర్చులు**: {exp}\n• **నికర ప్రవాహం**: {net}\n• **పొదుపు రేటు**: **{savingsRate}%**\n• **ప్రధాన ఖర్చు విభాగం**: {topCat}\n\n",
    health_excellent: "✨ **రేటింగ్: అద్భుతం.** మీరు మీ ఆదాయంలో 20% కంటే ఎక్కువ పొదుపు చేస్తున్నారు. కొనసాగించండి!",
    health_good: "👍 **రేటింగ్: మంచిది.** మీ నగదు ప్రవాహం సానుకూలంగా ఉంది.",
    health_attention: "⚠️ **రేటింగ్: శ్రద్ధ అవసరం.** ఈ నెల ఖర్చులు ఆదాయానికి సమానంగా లేదా ఎక్కువగా ఉన్నాయి.",
    category_spent: "మీరు **{category}** పై **{amount}** ఖర్చు చేశారు (మొత్తం ఖర్చులో దాదాపు **{pct}%**).",
    wallet_title: "🏦 **ప్రస్తుత వాలెట్ బ్యాలెన్స్‌లు**:\n\n",
    wallet_zero: "మీరు ఇంకా ఎటువంటి వాలెట్ బ్యాలెన్స్‌లను సెట్ చేయలేదు.",
    financial_fallback: "మీ వ్యక్తిగత ఆర్థిక విషయాలలో సహాయం చేయడానికి నేను సిద్ధంగా ఉన్నాను! మీ ఖర్చులు, పొదుపు లేదా బ్యాలెన్స్ వివరాలను అడగండి.",
    connected_badge: "మీ ఆర్థిక రికార్డులకు కనెక్ట్ చేయబడింది · {count} లావాదేవీలు",
    prompts: {
      spend_month: "ఈ నెల నేను ఎంత ఖర్చు చేశాను?",
      where_money: "నా డబ్బు ఎక్కువగా దేనికి ఖర్చవుతోంది?",
      save_more: "నేను మరింత ఎలా పొదుపు చేయగలను?",
      cat_highest: "ఏ విభాగంలో అత్యధికంగా ఖర్చయింది?",
      reduce_it: "నేను దీన్ని ఎలా తగ్గించగలను?",
      compare_months: "ఈ నెలను మరియు గత నెలను పోల్చండి.",
      savings_plan: "పొదుపు ప్రణాళికను సృష్టించండి.",
      monthly_report: "నెలవారీ ఆర్థిక నివేదికను ఇవ్వండి.",
      analyze_income: "నా ఆదాయాన్ని విశ్లేషించండి.",
      analyze_spending: "నా ఖర్చును విశ్లేషించండి.",
      reduce_cat: "{category} ఖర్చును తగ్గించడం ఎలా?"
    }
  });

  // Tamil (தமிழ்)
  I18N.ta = createLang("தமிழ்", {
    greeting_default: "வணக்கம்! இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    greeting_morning: "காலை வணக்கம்! ☀️ உங்கள் நாள் இனிதாகத் தொடங்கட்டும். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    greeting_afternoon: "மதிய வணக்கம்! ☀️ உங்கள் நாள் எப்படி போகிறது? நான் எப்படி உதவலாம்?",
    greeting_evening: "மாலை வணக்கம்! 🌙 இன்று எதைப் பார்க்க விரும்புகிறீர்கள்?",
    casual_how_are_you: "நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! 😊 நீங்கள் எப்படி இருக்கிறீர்கள்? இன்று உங்களுக்கு என்ன உதவி வேண்டும்?",
    casual_thank_you: "நல்வரவு! 😊 உங்கள் நிதி தொடர்பாக வேறு ஏதேனும் உதவி தேவைப்பட்டால் எனக்குத் தெரியப்படுத்துங்கள்.",
    casual_ack: "மகிழ்ச்சி! 😊 உங்கள் செலவுகள் அல்லது சேமிப்பை சரிபார்க்க விரும்பும் போதெல்லாம் கேளுங்கள்.",
    casual_help: "நிச்சயமாக! 😊 உங்கள் செலவுகளைக் கண்காணிக்க, வாலட் இருப்பை சரிபார்க்க, மாதங்களை ஒப்பிட மற்றும் சேமிப்புத் திட்டங்களை உருவாக்க நான் உதவ முடியும்.",
    casual_who: "நான் **Agent**, FINOVA இல் உங்கள் தனிப்பட்ட நிதித் துணைவன்! உங்கள் வருமானம், செலவுகள் மற்றும் சேமிப்பு இலக்குகளைக் கண்காணிக்க உதவுகிறேன்.",
    casual_bye: "இனிய நாளாக அமையட்டும்! 👋 உங்கள் நிதியை சரிபார்க்க எப்போது வேண்டுமானாலும் நான் இங்கே இருப்பேன்.",
    casual_fallback: "நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்! 😊 உங்கள் செலவுகள், வருமானம் அல்லது சேமிப்பு பற்றி எதையும் கேளுங்கள்.",
    unrelated_scope: "மன்னிக்கவும்! 😊 நான் உங்கள் தனிப்பட்ட நிதி முகவர். உங்கள் வருமானம், செலவுகள், சேமிப்பு மற்றும் பண நிர்வாகத்திற்கு உதவ முடியும், ஆனால் இந்தத் தலைப்பில் உதவ முடியாது.",
    welcome_msg: "வணக்கம் {name}! 👋 நான் **Agent**, உங்கள் தனிப்பட்ட நிதித் துணைவன்.\n\nஉங்கள் செலவுகள், வருமானம் அல்லது சேமிப்பு இலக்குகள் பற்றி என்னிடம் கேளுங்கள்!",
    spending_month: "இந்த மாதம் **{count} பரிவர்த்தனைகளில்** நீங்கள் **{amount}** செலவிட்டுள்ளீர்கள்.\n\nஇதில் பெரும்பகுதி **{topCategory}** ({topAmount}) க்குச் சென்றுள்ளது.\n\nஎந்தப் பிரிவில் அதிக செலவானது அல்லது அதை எவ்வாறு குறைக்கலாம் என்பதைப் பார்க்க விரும்புகிறீர்களா?",
    spending_zero: "இந்த மாதத்திற்கான எந்த செலவையும் நீங்கள் இன்னும் பதிவு செய்யவில்லை. பரிவர்த்தனைகளைச் சேர்த்த பிறகு நான் கண்காணிக்கிறேன்! 😊",
    where_money_goes: "{period}ல் உங்கள் பெரும்பாலான பணம் **{topCategory}** மீது செலவிடப்பட்டுள்ளது, மொத்தம் **{topAmount}** (உங்கள் மொத்த செலவில் சுமார் **{topPct}%**).\n\n{secondText}**{topCategory}** செலவைக் குறைக்க நடைமுறை ஆலோசனைகளைப் பெற விரும்புகிறீர்களா?",
    second_highest: "உங்கள் அடுத்த பெரிய செலவு **{category}**: **{amount}** ({pct}%).\n\n",
    reduce_intro: "**{category}** (தற்போது **{amount}**) செலவைக் குறைக்க, இதோ நடைமுறை வழிமுறைகள்:\n\n{tips}\n\n💡 நீங்கள் வெறும் 10% குறைத்தால் கூட, மாதம் **{cut10}** ({cut10Year} ஆண்டுக்கு) சேமிக்க முடியும்!",
    savings_plan_intro: "உங்கள் தற்போதைய மாதாந்திர உபரி **{surplus}** (வருமானம்: {income} − செலவுகள்: {expenses}) அடிப்படையில், இதோ ஒரு சேமிப்புத் திட்டம்:\n\n• **எளிய திட்டம் (20%)**: சேமிப்பு **{p20}/மாதம்** → **{p20Year}/ஆண்டு**\n• **சமச்சீர் திட்டம் (பரிந்துரைக்கப்படுகிறது · 40%)**: சேமிப்பு **{p40}/மாதம்** → **{p40Year}/ஆண்டு**\n• **விரைவான திட்டம் (60%)**: சேமிப்பு **{p60}/மாதம்** → **{p60Year}/ஆண்டு**",
    savings_zero_income: "நீங்கள் இன்னும் உங்கள் வருமானத்தைப் பதிவு செய்யவில்லை. வருமானத்தைச் சேர்த்த பிறகு துல்லியமான சேமிப்புத் திட்டத்தைக் கணக்கிடுவேன்! 😊",
    savings_deficit: "தற்போது உங்கள் மாதாந்திர செலவுகள் (**{expenses}**) உங்கள் வருமானத்தை (**{income}**) தாண்டியுள்ளது. உங்கள் அதிக செலவுப் பிரிவிலிருந்து (**{topCategory}**) 10% குறைப்பது நல்ல தொடக்கம்.",
    month_compare_title: "மாதாந்திர ஒப்பீட்டு விவரங்கள் இங்கே:\n\n",
    month_compare_exp: "📉 **செலவுகள்**: {prevExp} ➔ **{curExp}** {expDiff}\n",
    month_compare_inc: "📈 **வருமானம்**: {prevInc} ➔ **{curInc}** {incDiff}\n\n",
    month_compare_net: "⚖️ **நிகர பணப்புழக்கம்**: கடந்த மாதம் **{prevNet}**, இந்த மாதம் **{curNet}**.",
    diff_increased: "(🔺 {diff} அதிகரித்துள்ளது அல்லது +{pct}%)",
    diff_decreased: "(🟢 {diff} குறைந்துள்ளது அல்லது {pct}%)",
    diff_unchanged: "(மாற்றமில்லை)",
    income_analysis: "💰 **வருமான பகுப்பாய்வு**:\n\nமொத்த பதிவு செய்யப்பட்ட வருமானம்: **{total}** ({count} வழிகளில்).\n\n{streams}",
    income_zero: "நீங்கள் இன்னும் எந்த வருமானத்தையும் பதிவு செய்யவில்லை. கண்காணிக்க **Add transaction** இல் சேர்க்கவும்! 😊",
    monthly_report_title: "📋 **மாதாந்திர நிதி சுருக்கம் ({month})**:\n\n",
    monthly_report_body: "• **பெறப்பட்ட வருமானம்**: {inc}\n• **ஏற்பட்ட செலவுகள்**: {exp}\n• **நிகர பணப்புழக்கம்**: {net}\n• **சேமிப்பு விகிதம்**: **{savingsRate}%**\n• **முக்கிய செலவுப் பிரிவு**: {topCat}\n\n",
    health_excellent: "✨ **மதிப்பீடு: சிறப்பானது.** உங்கள் வருமானத்தில் 20% க்கும் அதிகமாக சேமிக்கிறீர்கள். அருமை!",
    health_good: "👍 **மதிப்பீடு: நல்லது.** உங்கள் பணப்புழக்கம் நேர்மறையாக உள்ளது.",
    health_attention: "⚠️ **மதிப்பீடு: கவனம் தேவை.** இந்த மாதம் செலவுகள் வருமானத்திற்கு சமமாக அல்லது அதிகமாக உள்ளன.",
    category_spent: "நீங்கள் **{category}** பிரிவில் **{amount}** செலவிட்டுள்ளீர்கள் (மொத்த செலவில் சுமார் **{pct}%**).",
    wallet_title: "🏦 **தற்போதைய வாலட் இருப்பு**:\n\n",
    wallet_zero: "நீங்கள் இன்னும் எந்த வாலட் இருப்பையும் அமைக்கவில்லை.",
    financial_fallback: "உங்கள் தனிப்பட்ட நிதிக்கு உதவ நான் தயார்! உங்கள் செலவுகள், சேமிப்பு அல்லது பணத்தைப் பற்றி கேளுங்கள்.",
    connected_badge: "உங்கள் நிதிப் பதிவுகளுடன் இணைக்கப்பட்டுள்ளது · {count} பரிவர்த்தனைகள்",
    prompts: {
      spend_month: "இந்த மாதம் நான் எவ்வளவு செலவு செய்தேன்?",
      where_money: "என் பணம் பெரும்பாலும் எங்கே போகிறது?",
      save_more: "நான் எப்படி அதிகம் சேமிப்பது?",
      cat_highest: "எந்தப் பிரிவில் அதிக செலவானது?",
      reduce_it: "நான் அதை எப்படி குறைக்கலாம்?",
      compare_months: "இந்த மாதத்தையும் கடந்த மாதத்தையும் ஒப்பிடுக.",
      savings_plan: "சேமிப்புத் திட்டத்தை உருவாக்குங்கள்.",
      monthly_report: "மாதாந்திர நிதி அறிக்கையைத் தாருங்கள்.",
      analyze_income: "என் வருமானத்தை பகுப்பாய்வு செய்யுங்கள்.",
      analyze_spending: "என் செலவுகளை பகுப்பாய்வு செய்யுங்கள்.",
      reduce_cat: "{category} செலவைக் குறைப்பது எப்படி?"
    }
  });

  // Spanish (Español)
  I18N.es = createLang("Español", {
    greeting_default: "¡Hola! 👋 ¿Cómo va tu día? ¿En qué te puedo ayudar hoy?",
    greeting_morning: "¡Buenos días! ☀️ Espero que tu día empiece genial. ¿En qué te puedo ayudar hoy?",
    greeting_afternoon: "¡Buenas tardes! ☀️ ¿Cómo va tu día? ¿En qué te puedo colaborar?",
    greeting_evening: "¡Buenas noches! 🌙 ¿Qué te gustaría revisar hoy?",
    casual_how_are_you: "¡Muy bien, gracias por preguntar! 😊 ¿Y tú? ¿Qué te gustaría revisar hoy?",
    casual_thank_you: "¡De nada! 😊 Avísame si necesitas cualquier otra ayuda con tus finanzas.",
    casual_ack: "¡Me alegra saberlo! 😊 Pregúntame cuando quieras revisar tus gastos o ahorros.",
    casual_help: "¡Por supuesto! 😊 Puedo ayudarte a registrar gastos, revisar saldos, comparar meses y armar planes de ahorro.",
    casual_who: "¡Soy **Agent**, tu compañero de finanzas personales en FINOVA! Te ayudo a monitorear tus ingresos, gastos y metas de ahorro.",
    casual_bye: "¡Que tengas un excelente día! 👋 Siempre estaré aquí cuando quieras revisar tus finanzas.",
    casual_fallback: "¡Estoy aquí para ayudarte! 😊 Pregúntame sobre tus gastos, ingresos o metas de ahorro.",
    unrelated_scope: "¡Lo siento! 😊 Soy tu Agent de finanzas personales. Puedo ayudarte con tus ingresos, gastos, ahorros y administración de dinero, pero no con ese tema.",
    welcome_msg: "¡Hola {name}! 👋 Soy **Agent**, tu compañero de finanzas personales.\n\n¡Pregúntame sobre tus gastos, ingresos o metas de ahorro, o elige una de las sugerencias!",
    spending_month: "Has gastado **{amount}** este mes en **{count} transacción{s}**.\n\nLa mayor parte fue en **{topCategory}** ({topAmount}).",
    spending_zero: "Aún no has registrado gastos este mes. ¡Agrega transacciones en la página **Add transaction** para ver tu análisis! 😊",
    where_money_goes: "La mayor parte de tus gastos {period} fue en **{topCategory}**, sumando **{topAmount}** (aproximadamente **{topPct}%** de tus gastos totales).",
    second_highest: "Tu siguiente mayor gasto fue **{category}** con **{amount}** ({pct}%).\n\n",
    reduce_intro: "Para recortar gastos en **{category}** (actualmente **{amount}**), aquí tienes pasos prácticos:\n\n{tips}\n\n💡 ¡Si reduces solo un 10%, ahorrarás **{cut10}/mes** ({cut10Year} al año)!",
    savings_plan_intro: "Con base en tu excedente mensual actual de **{surplus}** (Ingresos: {income} − Gastos: {expenses}), este es un plan de ahorro realista:\n\n• **Plan Cómodo (20%)**: Ahorra **{p20}/mes** → **{p20Year}/año**\n• **Plan Equilibrado (Recomendado · 40%)**: Ahorra **{p40}/mes** → **{p40Year}/año**\n• **Plan Acelerado (60%)**: Ahorra **{p60}/mes** → **{p60Year}/año**",
    savings_zero_income: "Aún no has registrado tus ingresos. ¡Agrégalos para calcular tu excedente exacto y crear un plan de ahorro! 😊",
    savings_deficit: "Actualmente tus gastos (**{expenses}**) igualan o superan tus ingresos (**{income}**). Reducir un 10% en tu mayor gasto (**{topCategory}**) es la mejor manera de comenzar.",
    prompts: {
      spend_month: "¿Cuánto gasté este mes?",
      where_money: "¿A dónde va la mayor parte de mi dinero?",
      save_more: "¿Cómo puedo ahorrar más?",
      cat_highest: "¿Cuál fue la categoría más alta?",
      reduce_it: "¿Cómo puedo reducirlo?",
      compare_months: "Comparar este mes con el anterior.",
      savings_plan: "Crear un plan de ahorro.",
      monthly_report: "Darme un informe financiero mensual.",
      analyze_income: "Analizar mis ingresos.",
      analyze_spending: "Analizar mis gastos.",
      reduce_cat: "¿Cómo puedo reducir gastos en {category}?"
    }
  });

  // French (Français)
  I18N.fr = createLang("Français", {
    greeting_default: "Bonjour ! 👋 Comment se passe votre journée ? Comment puis-je vous aider ?",
    greeting_morning: "Bonjour ! ☀️ J'espère que votre journée commence bien. Que puis-je faire pour vous ?",
    greeting_afternoon: "Bon après-midi ! ☀️ Comment puis-je vous aider aujourd'hui ?",
    greeting_evening: "Bonsoir ! 🌙 Que souhaitez-vous consulter ce soir ?",
    casual_how_are_you: "Je vais très bien, merci ! 😊 Et vous ? Que souhaitez-vous vérifier aujourd'hui ?",
    casual_thank_you: "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions sur vos finances.",
    casual_ack: "Ravi de l'entendre ! 😊 Posez vos questions quand vous souhaitez vérifier vos dépenses.",
    casual_help: "Bien sûr ! 😊 Je peux vous aider à suivre vos dépenses, vérifier vos soldes et planifier votre épargne.",
    casual_who: "Je suis **Agent**, votre compagnon financier personnel sur FINOVA !",
    casual_bye: "Bonne journée ! 👋 Je suis toujours là quand vous souhaitez consulter vos finances.",
    casual_fallback: "Je suis là pour vous aider ! 😊 Posez-moi des questions sur vos finances.",
    unrelated_scope: "Désolé ! 😊 Je suis votre Agent de finances personnelles. Je peux vous aider avec vos revenus, dépenses et épargne, mais pas sur ce sujet.",
    welcome_msg: "Bonjour {name} ! 👋 Je suis **Agent**, votre compagnon financier personnel.\n\nPosez-moi des questions sur vos finances ou choisissez une suggestion ci-dessous !",
    spending_month: "Vous avez dépensé **{amount}** ce mois-ci sur **{count} transaction{s}**.\n\nLa majeure partie est allée à **{topCategory}** ({topAmount}).",
    spending_zero: "Vous n'avez pas encore enregistré de dépenses ce mois-ci. Ajoutez des transactions pour commencer ! 😊",
    where_money_goes: "La plupart de vos dépenses {period} concernent **{topCategory}**, totalisant **{topAmount}** (environ **{topPct}%** du total).",
    second_highest: "Votre deuxième plus grand poste de dépense est **{category}** à **{amount}** ({pct}%).\n\n",
    reduce_intro: "Pour réduire vos dépenses en **{category}** (actuellement **{amount}**), voici quelques étapes pratiques :\n\n{tips}\n\n💡 En réduisant de seulement 10 %, vous économiserez **{cut10}/mois** ({cut10Year}/an) !",
    prompts: {
      spend_month: "Combien ai-je dépensé ce mois-ci ?",
      where_money: "Où va la majorité de mon argent ?",
      save_more: "Comment puis-je épargner davantage ?",
      cat_highest: "Quelle catégorie était la plus élevée ?",
      reduce_it: "Comment puis-je la réduire ?",
      compare_months: "Comparer ce mois-ci et le mois dernier.",
      savings_plan: "Créer un plan d'épargne.",
      monthly_report: "Donnez-moi un rapport financier mensuel.",
      analyze_income: "Analyser mes revenus.",
      analyze_spending: "Analyser mes dépenses.",
      reduce_cat: "Comment réduire les dépenses en {category} ?"
    }
  });

  // Arabic (العربية)
  I18N.ar = createLang("العربية", {
    greeting_default: "مرحباً! 👋 كيف تسير أمورك اليوم؟ كيف يمكنني مساعدتك؟",
    greeting_morning: "صباح الخير! ☀️ أتمنى لك يوماً رائعاً. كيف يمكنني مساعدتك اليوم؟",
    greeting_afternoon: "مساء الخير! ☀️ كيف يسير يومك؟",
    greeting_evening: "مساء الخير! 🌙 ما الذي ترغب في الاطلاع عليه الليلة؟",
    casual_how_are_you: "أنا بخير، شكراً لسؤالك! 😊 وأنت، كيف حالك؟ ما الذي تود مراجعته اليوم؟",
    casual_thank_you: "على الرحب والسعة! 😊 أخبرني إذا كنت بحاجة لأي مساعدة أخرى في شؤونك المالية.",
    casual_ack: "يسعدني سماع ذلك! 😊 لا تتردد في السؤال عندما ترغب في التحقق من نفقاتك أو مدخراتك.",
    casual_help: "بالتأكيد! 😊 يمكنني مساعدتك في تتبع النفقات، مراجعة الأرصدة، مقارنة الأشهر ووضع خطط التوفير.",
    casual_who: "أنا **Agent**، رفيقك المالي الشخصي في FINOVA! أساعدك في إدارة دخلك ومصروفاتك.",
    casual_bye: "أتمنى لك يوماً سعيداً! 👋 أنا دائماً هنا لمساعدتك في أمورك المالية.",
    casual_fallback: "أنا هنا للمساعدة! 😊 اسألني عن مصروفاتك، دخلك أو أهداف التوفير.",
    unrelated_scope: "عذراً! 😊 أنا وكيلك المالي الشخصي (Agent). يمكنني مساعدتك في الدخل والنفقات والادخار وإدارة أموالك، لكن لا يمكنني المساعدة في هذا الموضوع.",
    welcome_msg: "مرحباً {name}! 👋 أنا **Agent**، رفيقك المالي الشخصي.\n\nاسألني عن نفقاتك أو دخلك أو أهدافك الادخارية!",
    spending_month: "لقد أنفقت **{amount}** هذا الشهر في **{count} معاملة**.\n\nذهب الجزء الأكبر إلى **{topCategory}** ({topAmount}).",
    spending_zero: "لم تسجل أي نفقات لهذا الشهر بعد. بمجرد إضافة المعاملات سأقوم بتتبعها هنا! 😊",
    where_money_goes: "أكبر نفقاتك {period} كانت على **{topCategory}** بإجمالي **{topAmount}** (حوالي **{topPct}%** من إجمالي النفقات).",
    prompts: {
      spend_month: "كم أنفقت هذا الشهر؟",
      where_money: "أين تذهب معظم أموالي؟",
      save_more: "كيف يمكنني توفير المزيد؟",
      cat_highest: "ما هي الفئة الأعلى إنفاقاً؟",
      reduce_it: "كيف يمكنني تقليل هذا الإنفاق؟",
      compare_months: "مقارنة هذا الشهر بالشهر الماضي.",
      savings_plan: "إنشاء خطة ادخار.",
      monthly_report: "إعطائي تقريراً مالياً شهرياً.",
      analyze_income: "تحليل دخلي.",
      analyze_spending: "تحليل مصروفاتي.",
      reduce_cat: "كيف أقلل الإنفاق على {category}؟"
    }
  });

  // German (Deutsch)
  I18N.de = createLang("Deutsch", {
    greeting_default: "Hallo! 👋 Wie läuft Ihr Tag? Wie kann ich Ihnen heute helfen?",
    greeting_morning: "Guten Morgen! ☀️ Ich hoffe, Ihr Tag beginnt gut. Wie kann ich helfen?",
    casual_how_are_you: "Mir geht es gut, danke der Nachfrage! 😊 Wie geht es Ihnen?",
    casual_thank_you: "Gern geschehen! 😊 Lassen Sie mich wissen, wenn Sie weitere Hilfe benötigen.",
    casual_help: "Natürlich! 😊 Ich kann Ihnen helfen, Ausgaben zu verfolgen und Sparpläne zu erstellen.",
    casual_who: "Ich bin **Agent**, Ihr persönlicher Finanzbegleiter bei FINOVA!",
    unrelated_scope: "Entschuldigung! 😊 Ich bin Ihr persönlicher Finanz-Agent. Ich kann Ihnen bei Finanzen helfen, aber nicht bei diesem Thema.",
    spending_month: "Sie haben diesen Monat **{amount}** in **{count} Transaktion(en)** ausgegeben.\n\nDer Großteil ging an **{topCategory}** ({topAmount}).",
    prompts: {
      spend_month: "Wie viel habe ich diesen Monat ausgegeben?",
      where_money: "Wohin geht das meiste Geld?",
      save_more: "Wie kann ich mehr sparen?",
      reduce_it: "Wie kann ich das reduzieren?",
      compare_months: "Diesen Monat mit letztem vergleichen."
    }
  });

  // Chinese (Simplified & Traditional)
  const zhCommon = {
    greeting_default: "您好！👋 今天过得怎么样？有什么我可以帮您的吗？",
    greeting_morning: "早上好！☀️ 祝您开启美好的一天。今天需要什么帮助？",
    casual_how_are_you: "我很好，谢谢关心！😊 您怎么样？今天想看点什么？",
    casual_thank_you: "不客气！😊 如果您还有其他财务问题，随时告诉我。",
    casual_help: "当然可以！😊 我可以帮您记录支出、查看余额、比较月份以及制定储蓄计划。",
    casual_who: "我是 **Agent**，您在 FINOVA 的个人财务助手！",
    unrelated_scope: "抱歉！😊 我是您的个人财务 Agent。我可以协助您处理收入、支出、储蓄和理财，但无法解答该主题。",
    welcome_msg: "您好 {name}！👋 我是 **Agent**，您的个人财务伴侣。\n\n请随时询问关于支出、收入或储蓄的问题！",
    spending_month: "您本月共在 **{count} 笔交易** 中支出了 **{amount}**。\n\n其中大部分用于 **{topCategory}** ({topAmount})。",
    where_money_goes: "{period}您的主要支出在 **{topCategory}**，共计 **{topAmount}**（约占总支出的 **{topPct}%**）。",
    prompts: {
      spend_month: "我这个月花了多少钱？",
      where_money: "我的钱大部分花在哪里了？",
      save_more: "我怎样才能存更多钱？",
      cat_highest: "哪个类别开销最高？",
      reduce_it: "我该如何减少这项开支？",
      compare_months: "对比本月与上月。",
      savings_plan: "制定储蓄计划。"
    }
  };
  I18N["zh-Hans"] = createLang("简体中文", zhCommon);
  I18N["zh-Hant"] = createLang("繁體中文", zhCommon);
  I18N.zh = I18N["zh-Hans"];

  // Japanese (日本語)
  I18N.ja = createLang("日本語", {
    greeting_default: "こんにちは！👋 今日はどのようなご用件でしょうか？",
    greeting_morning: "おはようございます！☀️ 本日はどのようなお手伝いをしましょうか？",
    casual_how_are_you: "元気です、お気遣いありがとうございます！😊 どのようなお手伝いをしましょうか？",
    casual_thank_you: "どういたしまして！😊 お金に関するご質問があればいつでもどうぞ。",
    casual_help: "もちろんです！😊 支出の追跡や残高確認、貯蓄プランの作成をお手伝いできます。",
    casual_who: "私はFINOVAの専属ファイナンシャルパートナー **Agent** です！",
    unrelated_scope: "申し訳ありません！😊 私は個人財務専用のAgentです。収入、支出、貯蓄の管理はお手伝いできますが、この話題にはお答えできません。",
    spending_month: "今月は **{count} 件の取引** で合計 **{amount}** を支出しました。\n\n最も多かった支出は **{topCategory}** ({topAmount}) です。",
    where_money_goes: "{period}の支出の大部分は **{topCategory}** に使われており、合計 **{topAmount}**（全体の約 **{topPct}%**）です。",
    prompts: {
      spend_month: "今月の支出はいくらですか？",
      where_money: "お金の大部分は何に使われていますか？",
      save_more: "もっと貯蓄するにはどうすればいいですか？",
      reduce_it: "どうやって支出を減らせますか？",
      compare_months: "今月と先月を比較してください。"
    }
  });

  // Korean (한국어)
  I18N.ko = createLang("한국어", {
    greeting_default: "안녕하세요! 👋 오늘 어떤 도움이 필요하신가요?",
    greeting_morning: "좋은 아침입니다! ☀️ 오늘 무엇을 도와드릴까요?",
    casual_how_are_you: "잘 지내고 있습니다, 물어봐 주셔서 감사합니다! 😊 오늘은 무엇을 확인하시겠어요?",
    casual_thank_you: "천만에요! 😊 금융에 관한 도움이 더 필요하시면 언제든 말씀해주세요.",
    casual_help: "물론이죠! 😊 지출 추적, 잔액 확인, 저축 계획 수립을 도와드릴 수 있습니다.",
    casual_who: "저는 FINOVA의 개인 금융 도우미 **Agent** 입니다!",
    unrelated_scope: "죄송합니다! 😊 저는 개인 금융 전용 Agent입니다. 수입, 지출, 저축 및 자산 관리를 도와드릴 수 있지만, 해당 주제에는 답변해 드릴 수 없습니다.",
    spending_month: "이번 달에 총 **{count}건의 거래**로 **{amount}**을(를) 지출하셨습니다.\n\n가장 많은 지출은 **{topCategory}** ({topAmount})였습니다.",
    where_money_goes: "{period} 지출의 대부분은 **{topCategory}**에 사용되었으며, 총 **{topAmount}**(전체 지출의 약 **{topPct}%**)입니다.",
    prompts: {
      spend_month: "이번 달에 얼마를 썼나요?",
      where_money: "돈이 주로 어디로 나가나요?",
      save_more: "어떻게 더 저축할 수 있나요?",
      reduce_it: "이 지출을 어떻게 줄일 수 있나요?",
      compare_months: "이번 달과 지난달을 비교해 줘."
    }
  });

  // Russian (Русский)
  I18N.ru = createLang("Русский", {
    greeting_default: "Здравствуйте! 👋 Как ваш день? Чем я могу помочь вам сегодня?",
    casual_how_are_you: "Все отлично, спасибо! 😊 А у вас? Что бы вы хотели проверить сегодня?",
    casual_thank_you: "Пожалуйста! 😊 Дайте знать, если понадобится помощь с финансами.",
    casual_who: "Я **Agent**, ваш личный финансовый помощник в FINOVA!",
    unrelated_scope: "Извините! 😊 Я ваш личный финансовый Agent. Я могу помочь с доходами, расходами и сбережениями, но не по этой теме.",
    spending_month: "В этом месяце вы потратили **{amount}** в **{count} транзакциях**.\n\nБольше всего ушло на **{topCategory}** ({topAmount}).",
    prompts: {
      spend_month: "Сколько я потратил в этом месяце?",
      where_money: "Куда уходит большая часть денег?",
      save_more: "Как я могу сэкономить больше?",
      reduce_it: "Как мне уменьшить эти расходы?"
    }
  });

  // Italian (Italiano)
  I18N.it = createLang("Italiano", {
    greeting_default: "Ciao! 👋 Come va la tua giornata? Come posso aiutarti oggi?",
    casual_how_are_you: "Tutto bene, grazie! 😊 E tu? Cosa vorresti verificare oggi?",
    casual_thank_you: "Prego! 😊 Fammi sapere se hai bisogno di altro aiuto con le tue finanze.",
    casual_who: "Sono **Agent**, il tuo assistente finanziario personale in FINOVA!",
    unrelated_scope: "Mi dispiace! 😊 Sono il tuo Agent di finanza personale. Posso aiutarti con entrate, uscite e risparmi, ma non con questo argomento.",
    spending_month: "Hai speso **{amount}** questo mese in **{count} transazioni**.\n\nLa maggior parte è andata in **{topCategory}** ({topAmount}).",
    prompts: {
      spend_month: "Quanto ho speso questo mese?",
      where_money: "Dove va la maggior parte dei miei soldi?",
      save_more: "Come posso risparmiare di più?",
      reduce_it: "Come posso ridurla?"
    }
  });

  // Portuguese (Português)
  I18N.pt = createLang("Português", {
    greeting_default: "Olá! 👋 Como vai o seu dia? Como posso ajudar você hoje?",
    casual_how_are_you: "Tudo bem, obrigado por perguntar! 😊 E você? O que gostaria de verificar hoje?",
    casual_thank_you: "De nada! 😊 Avise-me se precisar de mais alguma ajuda com suas finanças.",
    casual_who: "Eu sou o **Agent**, seu assistente financeiro pessoal no FINOVA!",
    unrelated_scope: "Desculpe! 😊 Eu sou o seu Agent de finanças pessoais. Posso ajudar com receitas, despesas e poupança, mas não com esse assunto.",
    spending_month: "Você gastou **{amount}** este mês em **{count} transações**.\n\nA maior parte foi em **{topCategory}** ({topAmount}).",
    prompts: {
      spend_month: "Quanto gastei este mês?",
      where_money: "Para onde vai a maior parte do meu dinheiro?",
      save_more: "Como posso economizar mais?",
      reduce_it: "Como posso reduzir isso?"
    }
  });

  // Other languages inherit gracefully through createLang
  const otherLanguages = [
    { code: "ml", name: "മലയാളം", greeting: "ഹലോ! ഇന്ന് ഞാൻ നിങ്ങൾക്ക് എങ്ങനെ സഹായിക്കണം?", scope: "ക്ഷമിക്കണം! 😊 ഞാൻ നിങ്ങളുടെ സ്വകാര്യ ധനകാര്യ ഏജന്റാണ്. നിങ്ങളുടെ വരുമാനം, ചെലവ്, സമ്പാദ്യം എന്നിവയിൽ സഹായിക്കാനാകും, എന്നാൽ ഈ വിഷയത്തിൽ സഹായിക്കാനാവില്ല." },
    { code: "mr", name: "मराठी", greeting: "नमस्कार! आज मी आपल्याला कशी मदत करू शकतो?", scope: "माफ करा! 😊 मी आपला वैयक्तिक आर्थिक Agent आहे. मी उत्पन्न, खर्च आणि बचतीत मदत करू शकतो, परंतु या विषयावर नाही." },
    { code: "bn", name: "বাংলা", greeting: "হ্যালো! আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?", scope: "দুঃখিত! 😊 আমি আপনার ব্যক্তিগত অর্থ সহকারী। আমি আয়, ব্যয় এবং সঞ্চয়ে সাহায্য করতে পারি, কিন্তু এই বিষয়ে নয়।" },
    { code: "gu", name: "ગુજરાતી", greeting: "નમસ્તે! આજે હું તમને કેવી રીતે મદદ કરી શકું?", scope: "માફ કરશો! 😊 હું તમારો વ્યક્તિગત ફાઇનાન્સ એજન્ટ છું. હું આવક, ખર્ચ અને બચતમાં મદદ કરી શકું છું, પરંતુ આ વિષયમાં નહીં." },
    { code: "pa", name: "ਪੰਜਾਬੀ", greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?", scope: "ਮਾਫ਼ ਕਰਨਾ! 😊 ਮੈਂ ਤੁਹਾਡਾ ਨਿੱਜੀ ਵਿੱਤ ਏਜੰਟ ਹਾਂ। ਮੈਂ ਆਮਦਨ, ਖਰਚੇ ਅਤੇ ਬੱਚਤ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ, ਪਰ ਇਸ ਵਿਸ਼ੇ 'ਤੇ ਨਹੀਂ।" },
    { code: "ur", name: "اردو", greeting: "ہیلو! آج میں آپ کی کیا مدد کر سکتا ہوں؟", scope: "معذرت! 😊 میں آپ کا پرسنل فنانس ایجنٹ ہوں۔ میں آمدنی، اخراجات اور بچت میں مدد کر سکتا ہوں، لیکن اس موضوع پر نہیں۔" },
    { code: "id", name: "Bahasa Indonesia", greeting: "Halo! Apa yang bisa saya bantu hari ini?", scope: "Maaf! 😊 Saya adalah Agent keuangan pribadi Anda. Saya bisa membantu Anda mengelola pemasukan, pengeluaran, dan tabungan, tetapi bukan topik ini." },
    { code: "th", name: "ไทย", greeting: "สวัสดีครับ/ค่ะ! วันนี้มีอะไรให้ฉันช่วยไหม?", scope: "ขออภัยด้วยครับ/ค่ะ! 😊 ฉันเป็น Agent ด้านการเงินส่วนบุคคล ฉันช่วยเรื่องรายรับ รายจ่าย และการออมได้ แต่ไม่สามารถตอบหัวข้อนี้ได้" },
    { code: "vi", name: "Tiếng Việt", greeting: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?", scope: "Xin lỗi bạn! 😊 Tôi là Agent tài chính cá nhân của bạn. Tôi có thể hỗ trợ về thu nhập, chi tiêu và tiết kiệm, लेकिन không thể hỗ trợ chủ đề này." },
    { code: "tr", name: "Türkçe", greeting: "Merhaba! Bugün size nasıl yardımcı olabilirim?", scope: "Üzgünüm! 😊 Ben kişisel finans Agent'ınızım. Gelir, gider ve tasarruflarınızda yardımcı olabilirim ancak bu konuda yardımcı olamam." },
    { code: "nl", name: "Nederlands", greeting: "Hallo! Waar kan ik je vandaag mee helpen?", scope: "Sorry! 😊 Ik ben je persoonlijke financiële Agent. Ik kan je helpen met inkomsten, uitgaven en sparen, maar niet met dit onderwerp." },
    { code: "pl", name: "Polski", greeting: "Cześć! W czym mogę Ci dzisiaj pomóc?", scope: "Przepraszam! 😊 Jestem Twoim osobistym asystentem finansowym Agent. Mogę pomóc z dochodami, wydatkami i oszczędnościami, ale nie w tym temacie." },
    { code: "sw", name: "Kiswahili", greeting: "Habari! Nawezaje kukusaidia leo?", scope: "Samahani! 😊 Mimi ni Agent wako wa fedha binafsi. Naweza kukusaidia kuhusu mapato, matumizi, na akiba, lakini si mada hii." },
    { code: "ne", name: "नेपाली", greeting: "नमस्ते! म आज तपाईंलाई कसरी मद्दत गर्न सक्छु?", scope: "माफ गर्नुहोस्! 😊 म तपाईंको व्यक्तिगत वित्त Agent हुँ। म आय, खर्च र बचतमा मद्दत गर्न सक्छु, तर यस विषयमा होइन।" }
  ];

  otherLanguages.forEach(function (item) {
    if (!I18N[item.code]) {
      I18N[item.code] = createLang(item.name, {
        greeting_default: item.greeting,
        unrelated_scope: item.scope
      });
    }
  });

  // Getter functions
  function t(key, vars, langOverride) {
    const currentLang = langOverride || (window.Finova && Finova.getLanguage ? Finova.getLanguage() : localStorage.getItem("finova.language.v1") || "en");
    const langDict = I18N[currentLang] || I18N[currentLang.split("-")[0]] || I18N.en;
    let template = langDict[key] || I18N.en[key] || key;

    if (typeof template === "string") {
      const v = vars || {};
      Object.keys(v).forEach(function (k) {
        template = template.replace(new RegExp("\\{" + k + "\\}", "g"), v[k]);
      });
    }
    return template;
  }

  function getPrompt(promptKey, vars, langOverride) {
    const currentLang = langOverride || (window.Finova && Finova.getLanguage ? Finova.getLanguage() : localStorage.getItem("finova.language.v1") || "en");
    const langDict = I18N[currentLang] || I18N[currentLang.split("-")[0]] || I18N.en;
    const prompts = langDict.prompts || I18N.en.prompts || {};
    let str = prompts[promptKey] || I18N.en.prompts[promptKey] || promptKey;
    if (typeof str === "string") {
      const v = vars || {};
      Object.keys(v).forEach(function (k) {
        str = str.replace(new RegExp("\\{" + k + "\\}", "g"), v[k]);
      });
    }
    return str;
  }

  function getSystemInstruction(langOverride) {
    const currentLang = langOverride || (window.Finova && Finova.getLanguage ? Finova.getLanguage() : localStorage.getItem("finova.language.v1") || "en");
    const langObj = (window.Finova && Finova.languages ? Finova.languages.find(function (l) { return l.code === currentLang; }) : null) || { name: currentLang, nativeName: currentLang };
    const langDisplayName = langObj.nativeName ? (langObj.name + " (" + langObj.nativeName + ")") : langObj.name;
    return "Always respond in the user's currently selected FINOVA application language: " + langDisplayName + ". This instruction applies to every response, including greetings, casual conversations, financial analysis, recommendations, follow-up questions, and error messages. Do not switch to English unless English is the selected language or the user explicitly requests another language.";
  }

  window.FinovaAgentI18n = {
    dictionaries: I18N,
    t: t,
    getPrompt: getPrompt,
    getSystemInstruction: getSystemInstruction
  };
})();
