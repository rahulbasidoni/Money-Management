/* First-run, account-scoped product tour shared by every authenticated Money Management page. */
(function () {
  "use strict";

  const STATE_KEY = "finova.tour.active.v1";
  const COMPLETED_KEY = "finova.tour.completed.v1";
  const STEPS = [
    { title: "Welcome to Money Management!", message: "Welcome to your personal finance dashboard! Let me quickly show you how Money Management helps you manage and understand your money." },
    { title: "Your financial overview", message: "This is your financial overview. Here you can see your total balance, income, expenses, transaction count and recent activity in one place.", targets: [".dashboard-grid", '[data-nav="overview"]'] },
    { title: "Compare your finances", message: "Understand your spending habits with charts and reports. Compare your income and expenses, explore monthly spending and see where your money goes.", targets: [".primary-chart-panel", '[data-nav="compare"]'] },
    { title: "Your transaction history", message: "Here you can view your transaction history. Search, filter, sort, edit or delete your previous transactions whenever you need.", targets: [".transactions-panel", '[data-nav="expenses"]'] },
    { title: "Add a transaction", message: "Record your income and expenses here. Enter the amount, category, date and other details to keep your financial records updated.", targets: [".form-panel", '[data-nav="add"]'] },
    { title: "Your wallet balance", message: "Your wallet helps you track your available money. Add money to your wallet, and your balance will automatically update when you record income or expenses.", targets: [".wallet-panel"] },
    { title: "You're all set!", message: "That's how Money Management works! You are ready to take control of your finances. Make every transaction count.", finish: true }
  ];
  const COPY = {
    hi: {
      titles: ["Money Management में आपका स्वागत है!", "आपका वित्तीय अवलोकन", "अपने वित्त की तुलना करें", "आपके लेन-देन का इतिहास", "लेन-देन जोड़ें", "आपके वॉलेट का बैलेंस", "आप तैयार हैं!"],
      messages: [
        "आपके व्यक्तिगत वित्त डैशबोर्ड में आपका स्वागत है! आइए देखें कि Money Management आपके पैसे को समझने और प्रबंधित करने में कैसे मदद करता है।",
        "यह आपका वित्तीय अवलोकन है। यहाँ आप अपना कुल बैलेंस, आय, खर्च, लेन-देन की संख्या और हाल की गतिविधि एक जगह देख सकते हैं।",
        "चार्ट और रिपोर्ट से अपनी खर्च करने की आदतें समझें। आय और खर्च की तुलना करें, मासिक खर्च देखें और जानें कि आपका पैसा कहाँ जाता है।",
        "यहाँ अपने लेन-देन का इतिहास देखें। ज़रूरत पड़ने पर खोजें, फ़िल्टर करें, क्रमबद्ध करें, संपादित करें या पुराने लेन-देन हटाएँ।",
        "अपनी आय और खर्च यहाँ दर्ज करें। रिकॉर्ड अपडेट रखने के लिए राशि, श्रेणी, तारीख और अन्य विवरण भरें।",
        "आपका वॉलेट उपलब्ध पैसे को ट्रैक करने में मदद करता है। पैसे जोड़ें; आय या खर्च दर्ज करने पर बैलेंस अपने आप अपडेट होगा।",
        "Money Management इसी तरह काम करता है! अब आप अपने वित्त पर नियंत्रण पाने के लिए तैयार हैं। हर लेन-देन को महत्व दें।"
      ],
      next: "आगे", back: "पीछे", skip: "टूर छोड़ें", finish: "शुरू करें", step: "चरण {current} / {total}", replay: "टूर देखें"
    },
    es: {
      titles: ["¡Te damos la bienvenida a Money Management!", "Tu resumen financiero", "Compara tus finanzas", "Tu historial de transacciones", "Añadir transacción", "El saldo de tu cartera", "¡Todo listo!"],
      messages: [
        "¡Te damos la bienvenida a tu panel financiero personal! Descubre cómo Money Management te ayuda a gestionar y entender tu dinero.",
        "Este es tu resumen financiero. Aquí puedes ver tu saldo total, ingresos, gastos, número de transacciones y actividad reciente.",
        "Entiende tus hábitos de gasto con gráficos e informes. Compara ingresos y gastos y descubre adónde va tu dinero.",
        "Consulta tu historial de transacciones. Busca, filtra, ordena, edita o elimina transacciones anteriores cuando lo necesites.",
        "Registra aquí tus ingresos y gastos. Añade el importe, la categoría, la fecha y otros detalles para mantener tus registros al día.",
        "Tu cartera te ayuda a controlar el dinero disponible. Añade dinero y el saldo se actualizará al registrar ingresos o gastos.",
        "¡Así funciona Money Management! Ya puedes tomar el control de tus finanzas. Haz que cada transacción cuente."
      ],
      next: "Siguiente", back: "Atrás", skip: "Saltar recorrido", finish: "Empezar", step: "Paso {current} de {total}", replay: "Ver recorrido"
    },
    fr: {
      titles: ["Bienvenue sur Money Management !", "Votre aperçu financier", "Comparez vos finances", "Votre historique des transactions", "Ajouter une transaction", "Le solde de votre portefeuille", "Vous êtes prêt !"],
      messages: [
        "Bienvenue sur votre tableau de bord financier personnel ! Découvrez comment Money Management vous aide à gérer et comprendre votre argent.",
        "Voici votre aperçu financier. Consultez ici votre solde total, vos revenus, vos dépenses, le nombre de transactions et l’activité récente.",
        "Comprenez vos habitudes grâce aux graphiques et rapports. Comparez revenus et dépenses et découvrez où va votre argent.",
        "Consultez l’historique de vos transactions. Recherchez, filtrez, triez, modifiez ou supprimez vos anciennes transactions.",
        "Enregistrez vos revenus et dépenses ici. Saisissez le montant, la catégorie, la date et les détails utiles.",
        "Votre portefeuille suit votre argent disponible. Ajoutez de l’argent ; le solde évoluera avec vos revenus et dépenses.",
        "Voilà comment fonctionne Money Management ! Vous êtes prêt à reprendre le contrôle de vos finances. Chaque transaction compte."
      ],
      next: "Suivant", back: "Retour", skip: "Ignorer la visite", finish: "Commencer", step: "Étape {current} sur {total}", replay: "Visiter Money Management"
    },
    de: {
      titles: ["Willkommen bei Money Management!", "Dein Finanzüberblick", "Vergleiche deine Finanzen", "Dein Transaktionsverlauf", "Transaktion hinzufügen", "Dein Wallet-Guthaben", "Alles bereit!"],
      messages: [
        "Willkommen in deinem persönlichen Finanz-Dashboard! Entdecke, wie Money Management dir hilft, dein Geld zu verwalten und besser zu verstehen.",
        "Hier ist dein Finanzüberblick. Sieh dir Gesamtsaldo, Einnahmen, Ausgaben, Transaktionsanzahl und aktuelle Aktivitäten an.",
        "Verstehe dein Ausgabeverhalten mit Diagrammen und Berichten. Vergleiche Einnahmen und Ausgaben und sieh, wohin dein Geld fließt.",
        "Hier findest du deinen Transaktionsverlauf. Suche, filtere, sortiere, bearbeite oder lösche frühere Transaktionen.",
        "Erfasse hier deine Einnahmen und Ausgaben. Gib Betrag, Kategorie, Datum und weitere Details ein.",
        "Dein Wallet zeigt dein verfügbares Geld. Füge Geld hinzu; dein Saldo wird mit erfassten Einnahmen und Ausgaben aktualisiert.",
        "So funktioniert Money Management! Du kannst jetzt deine Finanzen selbst in die Hand nehmen. Jede Transaktion zählt."
      ],
      next: "Weiter", back: "Zurück", skip: "Tour überspringen", finish: "Los geht's", step: "Schritt {current} von {total}", replay: "Tour ansehen"
    },
    kn: {
      titles: ["Money Managementಗೆ ಸುಸ್ವಾಗತ!", "ನಿಮ್ಮ ಹಣಕಾಸಿನ ಅವಲೋಕನ", "ನಿಮ್ಮ ಹಣಕಾಸನ್ನು ಹೋಲಿಸಿ", "ನಿಮ್ಮ ವಹಿವಾಟಿನ ಇತಿಹಾಸ", "ವಹಿವಾಟು ಸೇರಿಸಿ", "ನಿಮ್ಮ ವಾಲೆಟ್ ಬ್ಯಾಲೆನ್ಸ್", "ಎಲ್ಲವೂ ಸಿದ್ಧವಾಗಿದೆ!"],
      messages: [
        "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸುಸ್ವಾಗತ! ನಿಮ್ಮ ಹಣವನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು Money Management ಹೇಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ ನೋಡಿ.",
        "ಇದು ನಿಮ್ಮ ಹಣಕಾಸಿನ ಅವಲೋಕನ. ಇಲ್ಲಿ ಒಟ್ಟು ಬ್ಯಾಲೆನ್ಸ್, ಆದಾಯ, ವೆಚ್ಚ, ವಹಿವಾಟುಗಳ ಸಂಖ್ಯೆ ಮತ್ತು ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಯನ್ನು ನೋಡಿ.",
        "ಚಾರ್ಟ್‌ಗಳು ಮತ್ತು ವರದಿಗಳ ಮೂಲಕ ನಿಮ್ಮ ಖರ್ಚಿನ ಅಭ್ಯಾಸವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಆದಾಯ ಮತ್ತು ವೆಚ್ಚಗಳನ್ನು ಹೋಲಿಸಿ, ನಿಮ್ಮ ಹಣ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ ನೋಡಿ.",
        "ಇಲ್ಲಿ ನಿಮ್ಮ ವಹಿವಾಟಿನ ಇತಿಹಾಸವನ್ನು ನೋಡಿ. ಅಗತ್ಯವಿದ್ದಾಗ ಹಿಂದಿನ ವಹಿವಾಟುಗಳನ್ನು ಹುಡುಕಿ, ಫಿಲ್ಟರ್ ಮಾಡಿ, ವಿಂಗಡಿಸಿ, ಸಂಪಾದಿಸಿ ಅಥವಾ ಅಳಿಸಿ.",
        "ನಿಮ್ಮ ಆದಾಯ ಮತ್ತು ವೆಚ್ಚಗಳನ್ನು ಇಲ್ಲಿ ದಾಖಲಿಸಿ. ಮೊತ್ತ, ವರ್ಗ, ದಿನಾಂಕ ಮತ್ತು ಇತರ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
        "ನಿಮ್ಮ ವಾಲೆಟ್ ಲಭ್ಯವಿರುವ ಹಣವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುತ್ತದೆ. ಹಣ ಸೇರಿಸಿ; ಆದಾಯ ಅಥವಾ ವೆಚ್ಚ ದಾಖಲಿಸಿದಾಗ ಬ್ಯಾಲೆನ್ಸ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಿಸುತ್ತದೆ.",
        "Money Management ಹೀಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ! ನಿಮ್ಮ ಹಣಕಾಸಿನ ನಿಯಂತ್ರಣಕ್ಕೆ ನೀವು ಸಿದ್ಧ. ಪ್ರತಿಯೊಂದು ವಹಿವಾಟಿಗೂ ಮಹತ್ವ ನೀಡಿ."
      ],
      next: "ಮುಂದೆ", back: "ಹಿಂದೆ", skip: "ಪರಿಚಯ ಬಿಟ್ಟುಬಿಡಿ", finish: "ಪ್ರಾರಂಭಿಸಿ", step: "ಹಂತ {current} / {total}", replay: "ಪರಿಚಯ ನೋಡಿ"
    },
    te: {
      titles: ["Money Managementకి స్వాగతం!", "మీ ఆర్థిక అవలోకనం", "మీ ఆర్థికాలను పోల్చండి", "మీ లావాదేవీల చరిత్ర", "లావాదేవీని జోడించండి", "మీ వాలెట్ బ్యాలెన్స్", "అంతా సిద్ధం!"],
      messages: [
        "మీ వ్యక్తిగత ఆర్థిక డాష్‌బోర్డ్‌కు స్వాగతం! మీ డబ్బును నిర్వహించడానికి, అర్థం చేసుకోవడానికి Money Management ఎలా సహాయపడుతుందో చూద్దాం.",
        "ఇది మీ ఆర్థిక అవలోకనం. మొత్తం బ్యాలెన్స్, ఆదాయం, ఖర్చులు, లావాదేవీల సంఖ్య, ఇటీవలి కార్యకలాపాలను ఇక్కడ చూడండి.",
        "చార్ట్‌లు, నివేదికలతో మీ ఖర్చు అలవాట్లను అర్థం చేసుకోండి. ఆదాయం, ఖర్చులను పోల్చి మీ డబ్బు ఎక్కడికి వెళ్తుందో తెలుసుకోండి.",
        "మీ లావాదేవీల చరిత్రను ఇక్కడ చూడండి. అవసరమైనప్పుడు పాత లావాదేవీలను వెతకండి, ఫిల్టర్ చేయండి, క్రమబద్ధీకరించండి, సవరించండి లేదా తొలగించండి.",
        "మీ ఆదాయం, ఖర్చులను ఇక్కడ నమోదు చేయండి. మొత్తం, వర్గం, తేదీ, ఇతర వివరాలను నమోదు చేయండి.",
        "మీ వాలెట్ అందుబాటులో ఉన్న డబ్బును ట్రాక్ చేస్తుంది. డబ్బు జోడించండి; ఆదాయం లేదా ఖర్చులను నమోదు చేసినప్పుడు బ్యాలెన్స్ స్వయంచాలకంగా మారుతుంది.",
        "Money Management ఇలా పనిచేస్తుంది! మీ ఆర్థికాలపై నియంత్రణ సాధించడానికి మీరు సిద్ధంగా ఉన్నారు. ప్రతి లావాదేవీని విలువైనదిగా చేయండి."
      ],
      next: "తదుపరి", back: "వెనుకకు", skip: "టూర్‌ను దాటవేయండి", finish: "ప్రారంభించండి", step: "దశ {current} / {total}", replay: "టూర్ చూడండి"
    },
    pt: {
      titles: ["Boas-vindas ao Money Management!", "Sua visão financeira", "Compare suas finanças", "Seu histórico de transações", "Adicionar transação", "Saldo da sua carteira", "Tudo pronto!"],
      messages: [
        "Boas-vindas ao seu painel financeiro pessoal! Veja como o Money Management ajuda você a administrar e entender seu dinheiro.",
        "Esta é sua visão financeira. Veja seu saldo total, receitas, despesas, número de transações e atividades recentes.",
        "Entenda seus hábitos com gráficos e relatórios. Compare receitas e despesas e descubra para onde seu dinheiro vai.",
        "Consulte seu histórico de transações. Pesquise, filtre, ordene, edite ou exclua transações anteriores quando precisar.",
        "Registre suas receitas e despesas aqui. Informe o valor, a categoria, a data e outros detalhes para manter seus registros atualizados.",
        "Sua carteira ajuda a acompanhar o dinheiro disponível. Adicione dinheiro; o saldo muda ao registrar receitas ou despesas.",
        "É assim que o Money Management funciona! Você está pronto para cuidar das suas finanças. Faça cada transação valer."
      ],
      next: "Avançar", back: "Voltar", skip: "Pular visita", finish: "Começar", step: "Etapa {current} de {total}", replay: "Fazer tour"
    },
    it: {
      titles: ["Benvenuto in Money Management!", "La tua panoramica finanziaria", "Confronta le tue finanze", "La cronologia delle transazioni", "Aggiungi una transazione", "Il saldo del tuo portafoglio", "È tutto pronto!"],
      messages: [
        "Benvenuto nella tua dashboard finanziaria personale! Scopri come Money Management ti aiuta a gestire e comprendere il tuo denaro.",
        "Questa è la tua panoramica finanziaria. Qui trovi saldo totale, entrate, uscite, numero di transazioni e attività recenti.",
        "Comprendi le tue abitudini con grafici e report. Confronta entrate e uscite e scopri dove va il tuo denaro.",
        "Qui trovi la cronologia delle transazioni. Cerca, filtra, ordina, modifica o elimina le transazioni passate.",
        "Registra qui entrate e uscite. Inserisci importo, categoria, data e altri dettagli per tenere aggiornati i tuoi dati.",
        "Il portafoglio tiene traccia del denaro disponibile. Aggiungi denaro; il saldo si aggiorna con entrate e uscite registrate.",
        "Ecco come funziona Money Management! Ora puoi gestire al meglio le tue finanze. Ogni transazione conta."
      ],
      next: "Avanti", back: "Indietro", skip: "Salta il tour", finish: "Inizia", step: "Passaggio {current} di {total}", replay: "Fai un tour"
    },
    ru: {
      titles: ["Добро пожаловать в Money Management!", "Обзор ваших финансов", "Сравнение финансов", "История операций", "Добавление операции", "Баланс кошелька", "Всё готово!"],
      messages: [
        "Добро пожаловать в личную финансовую панель! Узнайте, как Money Management помогает управлять деньгами и лучше их понимать.",
        "Это обзор ваших финансов. Здесь доступны общий баланс, доходы, расходы, число операций и недавняя активность.",
        "Изучайте привычки с помощью графиков и отчётов. Сравнивайте доходы и расходы и смотрите, куда уходят деньги.",
        "Здесь находится история операций. Ищите, фильтруйте, сортируйте, редактируйте или удаляйте прошлые операции.",
        "Записывайте здесь доходы и расходы. Укажите сумму, категорию, дату и другие сведения.",
        "Кошелёк помогает отслеживать доступные деньги. Пополните его; баланс обновляется при учёте доходов и расходов.",
        "Теперь вы знаете, как работает Money Management! Пора взять финансы под контроль. Каждая операция имеет значение."
      ],
      next: "Далее", back: "Назад", skip: "Пропустить тур", finish: "Начать", step: "Шаг {current} из {total}", replay: "Показать тур"
    },
    ja: {
      titles: ["Money Managementへようこそ！", "あなたの財務概要", "財務を比較", "取引履歴", "取引を追加", "ウォレット残高", "準備完了です！"],
      messages: [
        "個人向け財務ダッシュボードへようこそ。Money Managementでお金を管理し、状況を把握する方法をご紹介します。",
        "ここでは合計残高、収入、支出、取引数、最近のアクティビティをまとめて確認できます。",
        "グラフやレポートで支出の傾向を把握できます。収入と支出を比較し、お金の使い道を確認しましょう。",
        "ここで取引履歴を確認できます。必要に応じて検索、絞り込み、並べ替え、編集、削除ができます。",
        "ここで収入と支出を記録します。金額、カテゴリ、日付などを入力して記録を更新しましょう。",
        "ウォレットで利用可能なお金を管理できます。入金すると、収入や支出の記録に合わせて残高が更新されます。",
        "Money Managementの使い方は以上です。これから安心して資産を管理できます。ひとつひとつの取引を大切に。"
      ],
      next: "次へ", back: "戻る", skip: "ツアーをスキップ", finish: "使ってみる", step: "{total}ステップ中 {current} ステップ", replay: "ツアーを見る"
    },
    zh: {
      titles: ["欢迎使用 Money Management！", "财务概览", "比较财务状况", "交易记录", "添加交易", "钱包余额", "一切就绪！"],
      messages: [
        "欢迎来到您的个人财务仪表板！快速了解 Money Management 如何帮助您管理和了解自己的资金。",
        "这里是您的财务概览。您可以在此查看总余额、收入、支出、交易数量和近期活动。",
        "通过图表和报告了解消费习惯。比较收入与支出，查看每月消费并了解资金去向。",
        "在此查看交易记录。您可以随时搜索、筛选、排序、编辑或删除以往的交易。",
        "在此记录收入和支出。填写金额、类别、日期等信息，保持财务记录完整。",
        "钱包可帮助您追踪可用资金。添加资金后，记录收入或支出时余额会自动更新。",
        "Money Management 的使用方法就是这些！现在您可以开始管理自己的财务，让每笔交易都更有意义。"
      ],
      next: "下一步", back: "上一步", skip: "跳过导览", finish: "开始使用", step: "第 {current} 步，共 {total} 步", replay: "查看导览"
    },
    ar: {
      titles: ["مرحبًا بك في Money Management!", "نظرة عامة على أموالك", "قارن أموالك", "سجل معاملاتك", "إضافة معاملة", "رصيد محفظتك", "أنت جاهز!"],
      messages: [
        "مرحبًا بك في لوحة معلوماتك المالية الشخصية! تعرّف بسرعة على كيفية مساعدة Money Management لك في إدارة أموالك وفهمها.",
        "هذه نظرة عامة على أموالك. يمكنك هنا رؤية الرصيد الإجمالي والدخل والنفقات وعدد المعاملات والنشاط الأخير.",
        "افهم عادات الإنفاق من خلال الرسوم والتقارير. قارن الدخل والنفقات واكتشف أين تذهب أموالك.",
        "يمكنك هنا مراجعة سجل معاملاتك والبحث فيها وتصفيتها وترتيبها وتعديلها أو حذفها.",
        "سجّل دخلك ونفقاتك هنا. أدخل المبلغ والفئة والتاريخ والتفاصيل الأخرى لتحديث سجلاتك.",
        "تساعدك المحفظة على تتبع الأموال المتاحة. أضف المال وسيُحدّث الرصيد عند تسجيل الدخل أو النفقات.",
        "هكذا يعمل Money Management! أنت مستعد الآن للتحكم في أموالك. اجعل لكل معاملة قيمة."
      ],
      next: "التالي", back: "السابق", skip: "تخطي الجولة", finish: "ابدأ الاستكشاف", step: "الخطوة {current} من {total}", replay: "ابدأ الجولة"
    }
  };

  let state;
  let overlay;
  let shade;
  let spotlights;
  let card;
  let renderTimer;
  let activeTargets = [];

  function accountKey(key) {
    const user = Finova.getCurrentUsername() || "default";
    return `${key}.${encodeURIComponent(user)}`;
  }

  function readState() {
    try {
      const saved = sessionStorage.getItem(STATE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const username = Finova.getCurrentUsername() || "default";
      return parsed && (!parsed.username || parsed.username === username) &&
        Number.isInteger(parsed.step) && parsed.step >= 0 && parsed.step < STEPS.length
        ? parsed
        : null;
    } catch (error) {
      console.error("Money Management could not restore the active product tour.", error);
      return null;
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Money Management could not save the active product tour.", error);
      Finova.notify("The tour cannot continue across pages because browser session storage is unavailable.", "error");
    }
  }

  function copyForLanguage() {
    const language = Finova.getLanguage();
    return COPY[language] || COPY[language.split("-")[0]] || null;
  }

  function translated(step, key) {
    const localized = copyForLanguage();
    if (localized) {
      if (key === "title") return localized.titles[state.step];
      if (key === "message") return localized.messages[state.step];
      if (key === "step") return localized.step
        .replace("{current}", String(state.step + 1))
        .replace("{total}", String(STEPS.length));
      return localized[key];
    }
    const source = key === "title" ? step.title : key === "message" ? step.message : ({
      next: "Next",
      back: "Back",
      skip: "Skip Tour",
      finish: "Start Exploring",
      replay: "Take a Tour"
    })[key];
    if (key === "step") return `Step ${state.step + 1} of ${STEPS.length}`;
    return Finova.translate(source);
  }

  function updateReplayLabels() {
    document.querySelectorAll("[data-start-tour]").forEach((button) => {
      const label = button.querySelector("[data-tour-replay-label]");
      if (label) label.textContent = translated(STEPS[0], "replay");
      button.setAttribute("aria-label", translated(STEPS[0], "replay"));
      button.title = translated(STEPS[0], "replay");
    });
  }

  function roundedRectPath(rect) {
    const radius = Math.min(13, rect.width / 2, rect.height / 2);
    const left = Math.max(0, rect.left);
    const top = Math.max(0, rect.top);
    const right = Math.min(window.innerWidth, rect.right);
    const bottom = Math.min(window.innerHeight, rect.bottom);
    const width = Math.max(0, right - left);
    const height = Math.max(0, bottom - top);
    const r = Math.min(radius, width / 2, height / 2);
    return `M${left + r},${top} H${right - r} Q${right},${top} ${right},${top + r} V${bottom - r} Q${right},${bottom} ${right - r},${bottom} H${left + r} Q${left},${bottom} ${left},${bottom - r} V${top + r} Q${left},${top} ${left + r},${top} Z`;
  }

  function targetsFor(step) {
    return (step.targets || []).map((selector) => document.querySelector(selector)).filter(Boolean);
  }

  function updateSpotlight(targets) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    shade.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const outer = `M0,0 H${width} V${height} H0 Z`;
    const rects = targets.map((target) => {
      const bounds = target.getBoundingClientRect();
      return {
        left: bounds.left - 7,
        top: bounds.top - 7,
        right: bounds.right + 7,
        bottom: bounds.bottom + 7,
        width: bounds.width + 14,
        height: bounds.height + 14
      };
    });
    shade.querySelector("path").setAttribute("d", [outer, ...rects.map(roundedRectPath)].join(" "));
    spotlights.replaceChildren();
    rects.forEach((rect) => {
      const spotlight = document.createElement("span");
      spotlight.className = "tour-spotlight";
      spotlight.style.left = `${Math.max(0, rect.left)}px`;
      spotlight.style.top = `${Math.max(0, rect.top)}px`;
      spotlight.style.width = `${Math.max(0, Math.min(width, rect.right) - Math.max(0, rect.left))}px`;
      spotlight.style.height = `${Math.max(0, Math.min(height, rect.bottom) - Math.max(0, rect.top))}px`;
      spotlights.appendChild(spotlight);
    });
    return rects;
  }

  function createTourUI() {
    overlay = document.createElement("div");
    overlay.className = "tour-overlay";
    overlay.setAttribute("aria-hidden", "false");

    shade = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    shade.classList.add("tour-shade");
    shade.setAttribute("aria-hidden", "true");
    const shadePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shadePath.setAttribute("fill-rule", "evenodd");
    shade.appendChild(shadePath);

    spotlights = document.createElement("div");
    spotlights.className = "tour-spotlights";
    spotlights.setAttribute("aria-hidden", "true");

    card = document.createElement("section");
    card.className = "tour-card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.setAttribute("aria-live", "polite");

    overlay.append(shade, spotlights, card);
    document.body.appendChild(overlay);
  }

  function endTour(markCompleted) {
    if (renderTimer) window.clearTimeout(renderTimer);
    overlay?.remove();
    overlay = null;
    activeTargets = [];
    window.removeEventListener("resize", reposition);
    window.removeEventListener("scroll", reposition, true);
    state = null;
    try {
      sessionStorage.removeItem(STATE_KEY);
      if (markCompleted) localStorage.setItem(accountKey(COMPLETED_KEY), "true");
    } catch (error) {
      console.error("Money Management could not save product tour completion.", error);
      Finova.notify("Your tour status could not be saved in browser storage.", "error");
    }
  }

  function handleLanguageChange() {
    updateReplayLabels();
    if (state && overlay) renderStep();
  }

  function reposition() {
    if (!state || !overlay) return;
    if (renderTimer) window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      if (!state || !overlay) return;
      updateSpotlight(activeTargets);
    }, 16);
  }

  function goToStep(index) {
    if (index >= STEPS.length) {
      endTour(true);
      return;
    }
    state.step = index;
    saveState();
    renderStep();
  }

  function renderStep() {
    if (!state) return;
    const step = STEPS[state.step];
    const targets = targetsFor(step);
    if (step.targets && targets.length === 0) {
      goToStep(state.step + 1);
      return;
    }
    if (!overlay) createTourUI();
    activeTargets = targets;
    card.setAttribute("aria-labelledby", "tour-title");
    card.setAttribute("aria-describedby", "tour-message");
    card.innerHTML = "";

    const orb = document.createElement("span");
    orb.className = "tour-orb";
    orb.setAttribute("aria-hidden", "true");
    const eyebrow = document.createElement("span");
    eyebrow.className = "tour-eyebrow";
    eyebrow.textContent = "Money Management · YOUR MONEY, IN FOCUS";
    const heading = document.createElement("h2");
    heading.className = "tour-title";
    heading.id = "tour-title";
    heading.textContent = translated(step, "title");
    const message = document.createElement("p");
    message.className = "tour-message";
    message.id = "tour-message";
    message.textContent = translated(step, "message");
    const footer = document.createElement("div");
    footer.className = "tour-footer";
    const progress = document.createElement("span");
    progress.className = "tour-progress";
    progress.textContent = translated(step, "step");
    const actions = document.createElement("div");
    actions.className = "tour-actions";

    if (state.step > 0) {
      const back = document.createElement("button");
      back.className = "tour-button tour-back";
      back.type = "button";
      back.textContent = translated(step, "back");
      back.addEventListener("click", () => goToStep(state.step - 1));
      actions.appendChild(back);
    }

    const skip = document.createElement("button");
    skip.className = "tour-button tour-skip";
    skip.type = "button";
    skip.textContent = translated(step, "skip");
    skip.addEventListener("click", () => endTour(true));

    const next = document.createElement("button");
    next.className = "tour-button tour-next";
    next.type = "button";
    next.textContent = translated(step, step.finish ? "finish" : "next");
    next.addEventListener("click", () => goToStep(state.step + 1));
    actions.append(skip, next);
    footer.append(progress, actions);
    card.append(orb, eyebrow, heading, message, footer);
    next.focus({ preventScroll: true });

    if (targets.length) {
      const firstTarget = targets[0];
      if (firstTarget.getBoundingClientRect().bottom > window.innerHeight ||
          firstTarget.getBoundingClientRect().top < 0) {
        firstTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
      reposition();
    } else {
      reposition();
    }
  }

  function startTour() {
    if (overlay) return;
    const username = Finova.getCurrentUsername() || "default";
    state = { username, step: 0 };
    saveState();
    goToStep(0);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
  }

  function bindTourTriggers() {
    updateReplayLabels();
    document.querySelectorAll("[data-start-tour]").forEach((button) => {
      button.removeEventListener("click", startTour);
      button.addEventListener("click", startTour);
    });
  }

  function initialize() {
    bindTourTriggers();
    window.addEventListener("finova:language-changed", handleLanguageChange);
    const username = Finova.getCurrentUsername() || "default";
    state = readState();
    if (!state) {
      try {
        if (localStorage.getItem(accountKey(COMPLETED_KEY)) === "true") return;
      } catch (error) {
        console.error("Money Management could not check product tour completion.", error);
      }
      state = { username, step: 0 };
      saveState();
    }
    window.setTimeout(() => {
      if (!state) return;
      renderStep();
      window.addEventListener("resize", reposition);
      window.addEventListener("scroll", reposition, true);
    }, 350);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bindTourTriggers();
    try {
      if (await Finova.ready) initialize();
      else bindTourTriggers();
    } catch {
      bindTourTriggers();
    }
  });
})();
