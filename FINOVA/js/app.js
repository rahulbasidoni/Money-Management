/* Shared storage, formatting, currency and navigation helpers for every page. */
(function () {
  "use strict";

  const USERS_KEY = "finova.users.v2";
  const TRANSACTIONS_KEY = "finova.transactions.v1";
  const WALLET_KEY = "finova.wallet.v1";
  const PREFERENCES_KEY = "finova.preferences.v1";
  const RATES_KEY = "finova.exchange-rates.v1";
  const PROFILE_KEY = "finova.profile.v1";
  const BACKUP_KEY = "finova.automatic-backup.v1";
  const SESSION_KEY = "finova.authenticated";
  const LANGUAGE_KEY = "finova.language.v1";
  const supabase = window.FinovaSupabase;
  let currentUser = null;
  let appReady = Promise.resolve();
  const PASSWORD_ITERATIONS = 210000;
  const CURRENCY_CODES = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("currency")
    : ["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XCG", "XDR", "XOF", "XPF", "XSU", "YER", "ZAR", "ZMW", "ZWG", "ZWL"];
  const CURRENCY_NAMES = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "currency" }) : null;
  const CURRENCY_FLAGS = {
    AED: "🇦🇪", AFN: "🇦🇫", ALL: "🇦🇱", AMD: "🇦🇲", ANG: "🇨🇼", AOA: "🇦🇴", ARS: "🇦🇷", AUD: "🇦🇺",
    AWG: "🇦🇼", AZN: "🇦🇿", BAM: "🇧🇦", BBD: "🇧🇧", BDT: "🇧🇩", BGN: "🇧🇬", BHD: "🇧🇭", BIF: "🇧🇮",
    BMD: "🇧🇲", BND: "🇧🇳", BOB: "🇧🇴", BRL: "🇧🇷", BSD: "🇧🇸", BTN: "🇧🇹", BWP: "🇧🇼", BYN: "🇧🇾",
    BZD: "🇧🇿", CAD: "🇨🇦", CDF: "🇨🇩", CHF: "🇨🇭", CLP: "🇨🇱", CNY: "🇨🇳", COP: "🇨🇴", CRC: "🇨🇷",
    CUC: "🇨🇺", CUP: "🇨🇺", CVE: "🇨🇻", CZK: "🇨🇿", DJF: "🇩🇯", DKK: "🇩🇰", DOP: "🇩🇴", DZD: "🇩🇿",
    EGP: "🇪🇬", ERN: "🇪🇷", ETB: "🇪🇹", EUR: "🇪🇺", FJD: "🇫🇯", FKP: "🇫🇰", GBP: "🇬🇧", GEL: "🇬🇪",
    GHS: "🇬🇭", GIP: "🇬🇮", GMD: "🇬🇲", GNF: "🇬🇳", GTQ: "🇬🇹", GYD: "🇬🇾", HKD: "🇭🇰", HNL: "🇭🇳",
    HRK: "🇭🇷", HTG: "🇭🇹", HUF: "🇭🇺", IDR: "🇮🇩", ILS: "🇮🇱", INR: "🇮🇳", IQD: "🇮🇶", IRR: "🇮🇷",
    ISK: "🇮🇸", JMD: "🇯🇲", JOD: "🇯🇴", JPY: "🇯🇵", KES: "🇰🇪", KGS: "🇰🇬", KHR: "🇰🇭", KMF: "🇰🇲",
    KPW: "🇰🇵", KRW: "🇰🇷", KWD: "🇰🇼", KYD: "🇰🇾", KZT: "🇰🇿", LAK: "🇱🇦", LBP: "🇱🇧", LKR: "🇱🇰",
    LRD: "🇱🇷", LSL: "🇱🇸", LYD: "🇱🇾", MAD: "🇲🇦", MDL: "🇲🇩", MGA: "🇲🇬", MKD: "🇲🇰", MMK: "🇲🇲",
    MNT: "🇲🇳", MOP: "🇲🇴", MRU: "🇲🇷", MUR: "🇲🇺", MVR: "🇲🇻", MWK: "🇲🇼", MXN: "🇲🇽", MYR: "🇲🇾",
    MZN: "🇲🇿", NAD: "🇳🇦", NGN: "🇳🇬", NIO: "🇳🇮", NOK: "🇳🇴", NPR: "🇳🇵", NZD: "🇳🇿", OMR: "🇴🇲",
    PAB: "🇵🇦", PEN: "🇵🇪", PGK: "🇵🇬", PHP: "🇵🇭", PKR: "🇵🇰", PLN: "🇵🇱", PYG: "🇵🇾", QAR: "🇶🇦",
    RON: "🇷🇴", RSD: "🇷🇸", RUB: "🇷🇺", RWF: "🇷🇼", SAR: "🇸🇦", SBD: "🇸🇧", SCR: "🇸🇨", SDG: "🇸🇩",
    SEK: "🇸🇪", SGD: "🇸🇬", SHP: "🇸🇭", SLE: "🇸🇱", SLL: "🇸🇱", SOS: "🇸🇴", SRD: "🇸🇷", SSP: "🇸🇸",
    STN: "🇸🇹", SVC: "🇸🇻", SYP: "🇸🇾", SZL: "🇸🇿", THB: "🇹🇭", TJS: "🇹🇯", TMT: "🇹🇲", TND: "🇹🇳",
    TOP: "🇹🇴", TRY: "🇹🇷", TTD: "🇹🇹", TWD: "🇹🇼", TZS: "🇹🇿", UAH: "🇺🇦", UGX: "🇺🇬", USD: "🇺🇸",
    UYU: "🇺🇾", UZS: "🇺🇿", VES: "🇻🇪", VND: "🇻🇳", VUV: "🇻🇺", WST: "🇼🇸", XAF: "🇨🇲", XCD: "🇦🇬",
    XOF: "🇸🇳", XPF: "🇵🇫", YER: "🇾🇪", ZAR: "🇿🇦", ZMW: "🇿🇲", ZWG: "🇿🇼", ZWL: "🇿🇼"
  };

  function currencyFlag(code) {
    if (CURRENCY_FLAGS[code]) return CURRENCY_FLAGS[code];
    const country = code.slice(0, 2).toUpperCase();
    if (/^[A-Z]{2}$/.test(country)) {
      return String.fromCodePoint(...[...country].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)));
    }
    return "🌐";
  }

  function normalizeSearch(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['’ʻ`]/g, "")
      .replace(/[^\w\s$€£¥₹₨₽₩₪₺฿₫]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const CURRENCY_DATA = {
    AED: { name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", aliases: ["United Arab Emirates Dirham", "Emirati Dirham", "Dirham", "Dubai", "Abu Dhabi", "UAE", "United Arab Emirates", "Dhs", "DH"] },
    AFN: { name: "Afghan Afghani", symbol: "؋", flag: "🇦🇫", aliases: ["Afghani", "Afghanistan"] },
    ALL: { name: "Albanian Lek", symbol: "L", flag: "🇦🇱", aliases: ["Lek", "Albania"] },
    AMD: { name: "Armenian Dram", symbol: "֏", flag: "🇦🇲", aliases: ["Dram", "Armenia"] },
    ANG: { name: "Netherlands Antillean Guilder", symbol: "NAƒ", flag: "🇨🇼", aliases: ["Guilder", "Florin", "Antilles", "Curacao", "Curaçao", "Sint Maarten"] },
    AOA: { name: "Angolan Kwanza", symbol: "Kz", flag: "🇦🇴", aliases: ["Kwanza", "Angola"] },
    ARS: { name: "Argentine Peso", symbol: "$", flag: "🇦🇷", aliases: ["Peso", "Argentina"] },
    AUD: { name: "Australian Dollar", symbol: "$", flag: "🇦🇺", aliases: ["Dollar", "Aussie Dollar", "Australia"] },
    AWG: { name: "Aruban Florin", symbol: "Afl", flag: "🇦🇼", aliases: ["Florin", "Guilder", "Aruba"] },
    AZN: { name: "Azerbaijani Manat", symbol: "₼", flag: "🇦🇿", aliases: ["Manat", "Azerbaijan"] },
    BAM: { name: "Bosnia-Herzegovina Convertible Mark", symbol: "KM", flag: "🇧🇦", aliases: ["Convertible Mark", "Mark", "Bosnia", "Herzegovina"] },
    BBD: { name: "Barbadian Dollar", symbol: "$", flag: "🇧🇧", aliases: ["Dollar", "Bajan Dollar", "Barbados"] },
    BDT: { name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", aliases: ["Taka", "Bangladesh"] },
    BGN: { name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", aliases: ["Lev", "Bulgaria"] },
    BHD: { name: "Bahraini Dinar", symbol: "BD", flag: "🇧🇭", aliases: ["Dinar", "Bahrain"] },
    BIF: { name: "Burundian Franc", symbol: "FBu", flag: "🇧🇮", aliases: ["Franc", "Burundi"] },
    BMD: { name: "Bermudian Dollar", symbol: "$", flag: "🇧🇲", aliases: ["Dollar", "Bermuda"] },
    BND: { name: "Brunei Dollar", symbol: "$", flag: "🇧🇳", aliases: ["Dollar", "Brunei"] },
    BOB: { name: "Bolivian Boliviano", symbol: "Bs.", flag: "🇧🇴", aliases: ["Boliviano", "Bolivia"] },
    BRL: { name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", aliases: ["Real", "Reais", "Brazil", "Brasil"] },
    BSD: { name: "Bahamian Dollar", symbol: "$", flag: "🇧🇸", aliases: ["Dollar", "Bahamas"] },
    BTN: { name: "Bhutanese Ngultrum", symbol: "Nu.", flag: "🇧🇹", aliases: ["Ngultrum", "Bhutan"] },
    BWP: { name: "Botswanan Pula", symbol: "P", flag: "🇧🇼", aliases: ["Pula", "Botswana"] },
    BYN: { name: "Belarusian Ruble", symbol: "Br", flag: "🇧🇾", aliases: ["Ruble", "Rouble", "Belarus"] },
    BZD: { name: "Belize Dollar", symbol: "$", flag: "🇧🇿", aliases: ["Dollar", "Belize"] },
    CAD: { name: "Canadian Dollar", symbol: "$", flag: "🇨🇦", aliases: ["Dollar", "Canada", "Loonie"] },
    CDF: { name: "Congolese Franc", symbol: "FC", flag: "🇨🇩", aliases: ["Franc", "Congo", "DR Congo"] },
    CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", aliases: ["Franc", "Switzerland", "Swiss", "SFr"] },
    CLP: { name: "Chilean Peso", symbol: "$", flag: "🇨🇱", aliases: ["Peso", "Chile"] },
    CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", aliases: ["Yuan", "Renminbi", "RMB", "Kuai", "China"] },
    COP: { name: "Colombian Peso", symbol: "$", flag: "🇨🇴", aliases: ["Peso", "Colombia"] },
    CRC: { name: "Costa Rican Colon", symbol: "₡", flag: "🇨🇷", aliases: ["Colon", "Colón", "Costa Rica"] },
    CUP: { name: "Cuban Peso", symbol: "$", flag: "🇨🇺", aliases: ["Peso", "Cuba"] },
    CVE: { name: "Cape Verdean Escudo", symbol: "Esc", flag: "🇨🇻", aliases: ["Escudo", "Cape Verde", "Cabo Verde"] },
    CZK: { name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", aliases: ["Koruna", "Crown", "Czech Republic", "Czechia"] },
    DJF: { name: "Djiboutian Franc", symbol: "Fdj", flag: "🇩🇯", aliases: ["Franc", "Djibouti"] },
    DKK: { name: "Danish Krone", symbol: "kr", flag: "🇩🇰", aliases: ["Krone", "Crown", "Denmark", "Danish"] },
    DOP: { name: "Dominican Peso", symbol: "$", flag: "🇩🇴", aliases: ["Peso", "Dominican Republic"] },
    DZD: { name: "Algerian Dinar", symbol: "DA", flag: "🇩🇿", aliases: ["Dinar", "Algeria"] },
    EGP: { name: "Egyptian Pound", symbol: "E£", flag: "🇪🇬", aliases: ["Pound", "Egypt"] },
    ERN: { name: "Eritrean Nakfa", symbol: "Nfk", flag: "🇪🇷", aliases: ["Nakfa", "Eritrea"] },
    ETB: { name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", aliases: ["Birr", "Ethiopia"] },
    EUR: { name: "Euro", symbol: "€", flag: "🇪🇺", aliases: ["Euro", "Europe", "European Union", "Germany", "France", "Italy", "Spain", "Netherlands"] },
    FJD: { name: "Fijian Dollar", symbol: "$", flag: "🇫🇯", aliases: ["Dollar", "Fiji"] },
    FKP: { name: "Falkland Islands Pound", symbol: "£", flag: "🇫🇰", aliases: ["Pound", "Falkland Islands"] },
    GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", aliases: ["Pound", "Pound Sterling", "Great British Pound", "Sterling", "Quid", "United Kingdom", "UK", "Britain", "England"] },
    GEL: { name: "Georgian Lari", symbol: "₾", flag: "🇬🇪", aliases: ["Lari", "Georgia"] },
    GHS: { name: "Ghanaian Cedi", symbol: "GH₵", flag: "🇬🇭", aliases: ["Cedi", "Ghana"] },
    GIP: { name: "Gibraltar Pound", symbol: "£", flag: "🇬🇮", aliases: ["Pound", "Gibraltar"] },
    GMD: { name: "Gambian Dalasi", symbol: "D", flag: "🇬🇲", aliases: ["Dalasi", "Gambia"] },
    GNF: { name: "Guinean Franc", symbol: "FG", flag: "🇬🇳", aliases: ["Franc", "Guinea"] },
    GTQ: { name: "Guatemalan Quetzal", symbol: "Q", flag: "🇬🇹", aliases: ["Quetzal", "Guatemala"] },
    GYD: { name: "Guyanese Dollar", symbol: "$", flag: "🇬🇾", aliases: ["Dollar", "Guyana"] },
    HKD: { name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰", aliases: ["Dollar", "Hong Kong", "HK$"] },
    HNL: { name: "Honduran Lempira", symbol: "L", flag: "🇭🇳", aliases: ["Lempira", "Honduras"] },
    HRK: { name: "Croatian Kuna", symbol: "kn", flag: "🇭🇷", aliases: ["Kuna", "Croatia"] },
    HTG: { name: "Haitian Gourde", symbol: "G", flag: "🇭🇹", aliases: ["Gourde", "Haiti"] },
    HUF: { name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", aliases: ["Forint", "Hungary"] },
    IDR: { name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", aliases: ["Rupiah", "Rupee", "Indonesia"] },
    ILS: { name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱", aliases: ["Shekel", "Sheqel", "Israeli New Shekel", "Israel"] },
    INR: { name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", aliases: ["Rupee", "Rupiah", "Rupaye", "India", "Bharat"] },
    IQD: { name: "Iraqi Dinar", symbol: "ID", flag: "🇮🇶", aliases: ["Dinar", "Iraq"] },
    IRR: { name: "Iranian Rial", symbol: "IR", flag: "🇮🇷", aliases: ["Rial", "Riyal", "Iran", "Toman"] },
    ISK: { name: "Icelandic Krona", symbol: "kr", flag: "🇮🇸", aliases: ["Krona", "Crown", "Iceland"] },
    JMD: { name: "Jamaican Dollar", symbol: "$", flag: "🇯🇲", aliases: ["Dollar", "Jamaica"] },
    JOD: { name: "Jordanian Dinar", symbol: "JD", flag: "🇯🇴", aliases: ["Dinar", "Jordan"] },
    JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", aliases: ["Yen", "Japan"] },
    KES: { name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", aliases: ["Shilling", "Kenya"] },
    KGS: { name: "Kyrgyzstani Som", symbol: "som", flag: "🇰🇬", aliases: ["Som", "Kyrgyzstan"] },
    KHR: { name: "Cambodian Riel", symbol: "៛", flag: "🇰🇭", aliases: ["Riel", "Cambodia"] },
    KMF: { name: "Comorian Franc", symbol: "CF", flag: "🇰🇲", aliases: ["Franc", "Comoros"] },
    KPW: { name: "North Korean Won", symbol: "₩", flag: "🇰🇵", aliases: ["Won", "North Korea"] },
    KRW: { name: "South Korean Won", symbol: "₩", flag: "🇰🇷", aliases: ["Won", "South Korea", "Korea"] },
    KWD: { name: "Kuwaiti Dinar", symbol: "KD", flag: "🇰🇼", aliases: ["Dinar", "Kuwait"] },
    KYD: { name: "Cayman Islands Dollar", symbol: "$", flag: "🇰🇾", aliases: ["Dollar", "Cayman Islands"] },
    KZT: { name: "Kazakhstani Tenge", symbol: "₸", flag: "🇰🇿", aliases: ["Tenge", "Kazakhstan"] },
    LAK: { name: "Lao Kip", symbol: "₭", flag: "🇱🇦", aliases: ["Kip", "Laos"] },
    LBP: { name: "Lebanese Pound", symbol: "L£", flag: "🇱🇧", aliases: ["Pound", "Lebanon"] },
    LKR: { name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", aliases: ["Rupee", "Sri Lanka"] },
    LRD: { name: "Liberian Dollar", symbol: "$", flag: "🇱🇷", aliases: ["Dollar", "Liberia"] },
    LSL: { name: "Lesotho Loti", symbol: "L", flag: "🇱🇸", aliases: ["Loti", "Lesotho"] },
    LYD: { name: "Libyan Dinar", symbol: "LD", flag: "🇱🇾", aliases: ["Dinar", "Libya"] },
    MAD: { name: "Moroccan Dirham", symbol: "DH", flag: "🇲🇦", aliases: ["Dirham", "Morocco"] },
    MDL: { name: "Moldovan Leu", symbol: "L", flag: "🇲🇩", aliases: ["Leu", "Moldova"] },
    MGA: { name: "Malagasy Ariary", symbol: "Ar", flag: "🇲🇬", aliases: ["Ariary", "Madagascar"] },
    MKD: { name: "Macedonian Denar", symbol: "den", flag: "🇲🇰", aliases: ["Denar", "North Macedonia", "Macedonia"] },
    MMK: { name: "Myanmar Kyat", symbol: "K", flag: "🇲🇲", aliases: ["Kyat", "Myanmar", "Burma"] },
    MNT: { name: "Mongolian Tugrik", symbol: "₮", flag: "🇲🇳", aliases: ["Tugrik", "Togrog", "Mongolia"] },
    MOP: { name: "Macanese Pataca", symbol: "MOP$", flag: "🇲🇴", aliases: ["Pataca", "Macau", "Macao"] },
    MRU: { name: "Mauritanian Ouguiya", symbol: "UM", flag: "🇲🇷", aliases: ["Ouguiya", "Mauritania"] },
    MUR: { name: "Mauritian Rupee", symbol: "₨", flag: "🇲🇺", aliases: ["Rupee", "Mauritius"] },
    MVR: { name: "Maldivian Rufiyaa", symbol: "Rf", flag: "🇲🇻", aliases: ["Rufiyaa", "Maldives"] },
    MWK: { name: "Malawian Kwacha", symbol: "MK", flag: "🇲🇼", aliases: ["Kwacha", "Malawi"] },
    MXN: { name: "Mexican Peso", symbol: "$", flag: "🇲🇽", aliases: ["Peso", "Mexico"] },
    MYR: { name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", aliases: ["Ringgit", "Malaysia"] },
    MZN: { name: "Mozambican Metical", symbol: "MT", flag: "🇲🇿", aliases: ["Metical", "Mozambique"] },
    NAD: { name: "Namibian Dollar", symbol: "$", flag: "🇳🇦", aliases: ["Dollar", "Namibia"] },
    NGN: { name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", aliases: ["Naira", "Nigeria"] },
    NIO: { name: "Nicaraguan Cordoba", symbol: "C$", flag: "🇳🇮", aliases: ["Cordoba", "Córdoba", "Nicaragua"] },
    NOK: { name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", aliases: ["Krone", "Crown", "Norway", "Norwegian"] },
    NPR: { name: "Nepalese Rupee", symbol: "रू", flag: "🇳🇵", aliases: ["Rupee", "Nepali Rupee", "Nepal"] },
    NZD: { name: "New Zealand Dollar", symbol: "$", flag: "🇳🇿", aliases: ["Dollar", "Kiwi Dollar", "New Zealand"] },
    OMR: { name: "Omani Rial", symbol: "RO", flag: "🇴🇲", aliases: ["Rial", "Riyal", "Oman"] },
    PAB: { name: "Panamanian Balboa", symbol: "B/.", flag: "🇵🇦", aliases: ["Balboa", "Panama"] },
    PEN: { name: "Peruvian Sol", symbol: "S/.", flag: "🇵🇪", aliases: ["Sol", "Peru"] },
    PGK: { name: "Papua New Guinean Kina", symbol: "K", flag: "🇵🇬", aliases: ["Kina", "Papua New Guinea"] },
    PHP: { name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", aliases: ["Peso", "Piso", "Philippines"] },
    PKR: { name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", aliases: ["Rupee", "Pakistan"] },
    PLN: { name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", aliases: ["Zloty", "Złoty", "Poland"] },
    PYG: { name: "Paraguayan Guarani", symbol: "₲", flag: "🇵🇾", aliases: ["Guarani", "Guaraní", "Paraguay"] },
    QAR: { name: "Qatari Riyal", symbol: "QR", flag: "🇶🇦", aliases: ["Riyal", "Rial", "Qatar"] },
    RON: { name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", aliases: ["Leu", "Romania"] },
    RSD: { name: "Serbian Dinar", symbol: "din", flag: "🇷🇸", aliases: ["Dinar", "Serbia"] },
    RUB: { name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", aliases: ["Ruble", "Rouble", "Russia"] },
    RWF: { name: "Rwandan Franc", symbol: "RF", flag: "🇷🇼", aliases: ["Franc", "Rwanda"] },
    SAR: { name: "Saudi Riyal", symbol: "SR", flag: "🇸🇦", aliases: ["Riyal", "Rial", "Saudi Arabia"] },
    SBD: { name: "Solomon Islands Dollar", symbol: "$", flag: "🇸🇧", aliases: ["Dollar", "Solomon Islands"] },
    SCR: { name: "Seychellois Rupee", symbol: "₨", flag: "🇸🇨", aliases: ["Rupee", "Seychelles"] },
    SDG: { name: "Sudanese Pound", symbol: "SD", flag: "🇸🇩", aliases: ["Pound", "Sudan"] },
    SEK: { name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", aliases: ["Krona", "Crown", "Sweden", "Swedish"] },
    SGD: { name: "Singapore Dollar", symbol: "$", flag: "🇸🇬", aliases: ["Dollar", "Singapore"] },
    SHP: { name: "Saint Helena Pound", symbol: "£", flag: "🇸🇭", aliases: ["Pound", "Saint Helena"] },
    SLE: { name: "Sierra Leonean Leone", symbol: "Le", flag: "🇸🇱", aliases: ["Leone", "Sierra Leone"] },
    SOS: { name: "Somali Shilling", symbol: "Ssh", flag: "🇸🇴", aliases: ["Shilling", "Somalia"] },
    SRD: { name: "Surinamese Dollar", symbol: "$", flag: "🇸🇷", aliases: ["Dollar", "Suriname"] },
    STN: { name: "São Tomé and Príncipe Dobra", symbol: "Db", flag: "🇸🇹", aliases: ["Dobra", "Sao Tome", "São Tomé"] },
    SVC: { name: "Salvadoran Colon", symbol: "₡", flag: "🇸🇻", aliases: ["Colon", "El Salvador"] },
    SYP: { name: "Syrian Pound", symbol: "S£", flag: "🇸🇾", aliases: ["Pound", "Syria"] },
    SZL: { name: "Eswatini Lilangeni", symbol: "L", flag: "🇸🇿", aliases: ["Lilangeni", "Eswatini", "Swaziland"] },
    THB: { name: "Thai Baht", symbol: "฿", flag: "🇹🇭", aliases: ["Baht", "Thailand"] },
    TJS: { name: "Tajikistani Somoni", symbol: "SM", flag: "🇹🇯", aliases: ["Somoni", "Tajikistan"] },
    TMT: { name: "Turkmenistani Manat", symbol: "T", flag: "🇹🇲", aliases: ["Manat", "Turkmenistan"] },
    TND: { name: "Tunisian Dinar", symbol: "DT", flag: "🇹🇳", aliases: ["Dinar", "Tunisia"] },
    TOP: { name: "Tongan Paʻanga", symbol: "T$", flag: "🇹🇴", aliases: ["Paanga", "Paʻanga", "Tonga"] },
    TRY: { name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", aliases: ["Lira", "Turkey", "Türkiye"] },
    TTD: { name: "Trinidad and Tobago Dollar", symbol: "$", flag: "🇹🇹", aliases: ["Dollar", "Trinidad", "Tobago"] },
    TWD: { name: "New Taiwan Dollar", symbol: "NT$", flag: "🇹🇼", aliases: ["Taiwan Dollar", "Dollar", "Taiwan"] },
    TZS: { name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", aliases: ["Shilling", "Tanzania"] },
    UAH: { name: "Ukrainian Hryvnia", symbol: "₴", flag: "🇺🇦", aliases: ["Hryvnia", "Ukraine"] },
    UGX: { name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", aliases: ["Shilling", "Uganda"] },
    USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", aliases: ["Dollar", "United States Dollar", "American Dollar", "Buck", "Greenback", "USA", "United States", "America"] },
    UYU: { name: "Uruguayan Peso", symbol: "$", flag: "🇺🇾", aliases: ["Peso", "Uruguay"] },
    UZS: { name: "Uzbekistani Som", symbol: "soʻm", flag: "🇺🇿", aliases: ["Som", "Uzbekistan"] },
    VES: { name: "Venezuelan Bolivar", symbol: "Bs.", flag: "🇻🇪", aliases: ["Bolivar", "Bolívar", "Venezuela"] },
    VND: { name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", aliases: ["Dong", "Vietnam"] },
    VUV: { name: "Vanuatu Vatu", symbol: "VT", flag: "🇻🇺", aliases: ["Vatu", "Vanuatu"] },
    WST: { name: "Samoan Tala", symbol: "WS$", flag: "🇼🇸", aliases: ["Tala", "Samoa"] },
    XAF: { name: "Central African CFA Franc", symbol: "FCFA", flag: "🇨🇲", aliases: ["CFA Franc", "Franc", "CFA", "Central Africa", "Cameroon"] },
    XCD: { name: "East Caribbean Dollar", symbol: "$", flag: "🇦🇬", aliases: ["Dollar", "EC$", "East Caribbean", "Caribbean"] },
    XOF: { name: "West African CFA Franc", symbol: "CFA", flag: "🇸🇳", aliases: ["CFA Franc", "Franc", "CFA", "West Africa", "Senegal"] },
    XPF: { name: "CFP Franc", symbol: "F", flag: "🇵🇫", aliases: ["Franc", "CFP", "French Polynesia", "New Caledonia"] },
    YER: { name: "Yemeni Rial", symbol: "YR", flag: "🇾🇪", aliases: ["Rial", "Riyal", "Yemen"] },
    ZAR: { name: "South African Rand", symbol: "R", flag: "🇿🇦", aliases: ["Rand", "South Africa"] },
    ZMW: { name: "Zambian Kwacha", symbol: "ZK", flag: "🇿🇲", aliases: ["Kwacha", "Zambia"] }
  };

  const CURRENCIES = [...new Set(["INR", "USD", "EUR", "GBP", "JPY", "AED", "CAD", "AUD", "SGD", "CNY", ...CURRENCY_CODES])]
    .map((code) => {
      const known = CURRENCY_DATA[code];
      const parts = new Intl.NumberFormat("en", { style: "currency", currency: code, currencyDisplay: "narrowSymbol" }).formatToParts(0);
      const fallbackSymbol = (parts.find((part) => part.type === "currency") || {}).value || code;
      const name = known?.name || (CURRENCY_NAMES && CURRENCY_NAMES.of(code)) || code;
      const symbol = known?.symbol || fallbackSymbol;
      const flag = known?.flag || currencyFlag(code);
      const aliases = known?.aliases || [];
      const searchTerms = [code, name, symbol, flag, ...aliases].join(" ");
      let extra = "";
      const lowerTerms = searchTerms.toLowerCase();
      if (lowerTerms.includes("riyal")) extra += " rial";
      if (lowerTerms.includes("rial")) extra += " riyal";
      if (lowerTerms.includes("rupee")) extra += " rupiah";
      if (lowerTerms.includes("rupiah")) extra += " rupee";
      if (lowerTerms.includes("krona")) extra += " krone crown";
      if (lowerTerms.includes("krone")) extra += " krona crown";
      if (lowerTerms.includes("ruble")) extra += " rouble rubles";
      if (lowerTerms.includes("rouble")) extra += " ruble rubles";
      if (lowerTerms.includes("yuan")) extra += " rmb renminbi";
      if (lowerTerms.includes("shekel")) extra += " sheqel";

      return {
        code,
        name,
        symbol,
        flag,
        searchIndex: normalizeSearch(searchTerms + extra)
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  const EXPENSE_CATEGORIES = ["Food", "Travel", "Shopping", "Education", "Entertainment", "Health", "Bills", "Other"];
  const INCOME_CATEGORIES = ["Salary", "Pocket Money", "Freelancing", "Scholarship", "Business", "Other"];
  const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", locale: "en" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", locale: "hi" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", locale: "kn" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", locale: "te" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", locale: "ta" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം", locale: "ml" },
    { code: "mr", name: "Marathi", nativeName: "मराठी", locale: "mr" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা", locale: "bn" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", locale: "gu" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", locale: "pa" },
    { code: "ur", name: "Urdu", nativeName: "اردو", locale: "ur" },
    { code: "ar", name: "Arabic", nativeName: "العربية", locale: "ar" },
    { code: "es", name: "Spanish", nativeName: "Español", locale: "es" },
    { code: "fr", name: "French", nativeName: "Français", locale: "fr" },
    { code: "de", name: "German", nativeName: "Deutsch", locale: "de" },
    { code: "pt", name: "Portuguese", nativeName: "Português", locale: "pt" },
    { code: "it", name: "Italian", nativeName: "Italiano", locale: "it" },
    { code: "ru", name: "Russian", nativeName: "Русский", locale: "ru" },
    { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文", locale: "zh-CN" },
    { code: "zh-Hant", name: "Chinese (Traditional)", nativeName: "繁體中文", locale: "zh-TW" },
    { code: "ja", name: "Japanese", nativeName: "日本語", locale: "ja" },
    { code: "ko", name: "Korean", nativeName: "한국어", locale: "ko" },
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", locale: "id" },
    { code: "th", name: "Thai", nativeName: "ไทย", locale: "th" },
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", locale: "vi" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", locale: "tr" },
    { code: "nl", name: "Dutch", nativeName: "Nederlands", locale: "nl" },
    { code: "pl", name: "Polish", nativeName: "Polski", locale: "pl" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili", locale: "sw" },
    { code: "ne", name: "Nepali", nativeName: "नेपाली", locale: "ne" }
  ];
  const TRANSLATIONS = {
    hi: { Overview: "अवलोकन", Compare: "तुलना", "Money Used": "खर्च", "Add transaction": "लेन-देन जोड़ें", "Sign out": "साइन आउट", "Available wallet balance": "वॉलेट में उपलब्ध राशि", "Add Money": "पैसे जोड़ें", "Total available balance": "कुल उपलब्ध राशि", "Recent transactions": "हाल के लेन-देन", "Monthly summary": "मासिक सारांश", "Save transaction": "लेन-देन सहेजें", "Reset form": "फ़ॉर्म रीसेट करें", "Export JSON": "JSON निर्यात करें", "Import / restore": "आयात / पुनर्स्थापित करें", "Search transactions": "लेन-देन खोजें", "All types": "सभी प्रकार", Income: "आय", Expenses: "खर्च", Expense: "खर्च", "Current date": "आज की तारीख", Language: "भाषा", "Initial balance": "प्रारंभिक राशि", "Optional note": "वैकल्पिक टिप्पणी", Cancel: "रद्द करें", Save: "सहेजें" },
    kn: { Overview: "ಅವಲೋಕನ", Compare: "ಹೋಲಿಕೆ", "Money Used": "ಖರ್ಚು", "Add transaction": "ವಹಿವಾಟು ಸೇರಿಸಿ", "Sign out": "ಸೈನ್ ಔಟ್", "Available wallet balance": "ಲಭ್ಯವಿರುವ ವಾಲೆಟ್ ಮೊತ್ತ", "Add Money": "ಹಣ ಸೇರಿಸಿ", "Recent transactions": "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು", "Monthly summary": "ಮಾಸಿಕ ಸಾರಾಂಶ", Income: "ಆದಾಯ", Expenses: "ವೆಚ್ಚಗಳು", Expense: "ವೆಚ್ಚ", Language: "ಭಾಷೆ", Cancel: "ರದ್ದುಮಾಡಿ", Save: "ಉಳಿಸಿ" },
    te: { Overview: "అవలోకనం", Compare: "పోలిక", "Money Used": "ఖర్చులు", "Add transaction": "లావాదేవీని జోడించండి", "Sign out": "సైన్ అవుట్", "Available wallet balance": "అందుబాటులో ఉన్న వాలెట్ మొత్తం", "Add Money": "డబ్బు జోడించండి", "Recent transactions": "ఇటీవలి లావాదేవీలు", "Monthly summary": "నెలవారీ సారాంశం", Income: "ఆదాయం", Expenses: "ఖర్చులు", Expense: "ఖర్చు", Language: "భాష", Cancel: "రద్దు", Save: "సేవ్ చేయండి" },
    ta: { Overview: "கண்ணோட்டம்", Compare: "ஒப்பீடு", "Money Used": "செலவுகள்", "Add transaction": "பரிவர்த்தனை சேர்க்கவும்", "Sign out": "வெளியேறு", "Available wallet balance": "கிடைக்கும் பணப்பை இருப்பு", "Add Money": "பணம் சேர்க்கவும்", "Recent transactions": "சமீபத்திய பரிவர்த்தனைகள்", "Monthly summary": "மாதாந்திர சுருக்கம்", Income: "வருமானம்", Expenses: "செலவுகள்", Expense: "செலவு", Language: "மொழி", Cancel: "ரத்துசெய்", Save: "சேமி" },
    ml: { Overview: "അവലോകനം", Compare: "താരതമ്യം", "Money Used": "ചെലവുകൾ", "Add transaction": "ഇടപാട് ചേർക്കുക", "Sign out": "പുറത്തുകടക്കുക", "Available wallet balance": "ലഭ്യമായ വാലറ്റ് ബാലൻസ്", "Add Money": "പണം ചേർക്കുക", "Recent transactions": "സമീപകാല ഇടപാടുകൾ", "Monthly summary": "പ്രതിമാസ സംഗ്രഹം", Income: "വരുമാനം", Expenses: "ചെലവുകൾ", Expense: "ചെലവ്", Language: "ഭാഷ", Cancel: "റദ്ദാക്കുക", Save: "സേവ് ചെയ്യുക" },
    mr: { Overview: "आढावा", Compare: "तुलना", "Money Used": "खर्च", "Add transaction": "व्यवहार जोडा", "Sign out": "साइन आउट", "Available wallet balance": "उपलब्ध वॉलेट शिल्लक", "Add Money": "पैसे जोडा", "Recent transactions": "अलीकडील व्यवहार", "Monthly summary": "मासिक सारांश", Income: "उत्पन्न", Expenses: "खर्च", Expense: "खर्च", Language: "भाषा", Cancel: "रद्द करा", Save: "जतन करा" },
    bn: { Overview: "সংক্ষিপ্ত বিবরণ", Compare: "তুলনা", "Money Used": "খরচ", "Add transaction": "লেনদেন যোগ করুন", "Sign out": "সাইন আউট", "Available wallet balance": "ওয়ালেটে উপলব্ধ ব্যালেন্স", "Add Money": "টাকা যোগ করুন", "Recent transactions": "সাম্প্রতিক লেনদেন", "Monthly summary": "মাসিক সারাংশ", Income: "আয়", Expenses: "খরচ", Expense: "খরচ", Language: "ভাষা", Cancel: "বাতিল", Save: "সংরক্ষণ" },
    gu: { Overview: "ઝાંખી", Compare: "તુલના", "Money Used": "ખર્ચ", "Add transaction": "વ્યવહાર ઉમેરો", "Sign out": "સાઇન આઉટ", "Available wallet balance": "ઉપલબ્ધ વૉલેટ બેલેન્સ", "Add Money": "પૈસા ઉમેરો", "Recent transactions": "તાજેતરના વ્યવહારો", "Monthly summary": "માસિક સારાંશ", Income: "આવક", Expenses: "ખર્ચ", Expense: "ખર્ચ", Language: "ભાષા", Cancel: "રદ કરો", Save: "સાચવો" },
    pa: { Overview: "ਜਾਇਜ਼ਾ", Compare: "ਤੁਲਨਾ", "Money Used": "ਖਰਚੇ", "Add transaction": "ਲੈਣ-ਦੇਣ ਸ਼ਾਮਲ ਕਰੋ", "Sign out": "ਸਾਈਨ ਆਉਟ", "Available wallet balance": "ਉਪਲਬਧ ਵਾਲਿਟ ਬਕਾਇਆ", "Add Money": "ਪੈਸੇ ਸ਼ਾਮਲ ਕਰੋ", "Recent transactions": "ਹਾਲੀਆ ਲੈਣ-ਦੇਣ", "Monthly summary": "ਮਾਸਿਕ ਸਾਰ", Income: "ਆਮਦਨ", Expenses: "ਖਰਚੇ", Expense: "ਖਰਚ", Language: "ਭਾਸ਼ਾ", Cancel: "ਰੱਦ ਕਰੋ", Save: "ਸੰਭਾਲੋ" },
    ur: { Overview: "جائزہ", Compare: "موازنہ", "Money Used": "اخراجات", "Add transaction": "لین دین شامل کریں", "Sign out": "سائن آؤٹ", "Available wallet balance": "دستیاب والیٹ بیلنس", "Add Money": "رقم شامل کریں", "Recent transactions": "حالیہ لین دین", "Monthly summary": "ماہانہ خلاصہ", Income: "آمدنی", Expenses: "اخراجات", Expense: "خرچ", Language: "زبان", Cancel: "منسوخ", Save: "محفوظ کریں" },
    es: { Overview: "Resumen", Compare: "Comparar", "Money Used": "Gastos", "Add transaction": "Añadir transacción", "Sign out": "Cerrar sesión", "Available wallet balance": "Saldo disponible", "Add Money": "Añadir dinero", "Recent transactions": "Transacciones recientes", "Monthly summary": "Resumen mensual", Income: "Ingresos", Expenses: "Gastos", Expense: "Gasto", Language: "Idioma", Cancel: "Cancelar", Save: "Guardar" },
    fr: { Overview: "Aperçu", Compare: "Comparer", "Money Used": "Dépenses", "Add transaction": "Ajouter une transaction", "Sign out": "Déconnexion", "Available wallet balance": "Solde disponible", "Add Money": "Ajouter de l'argent", "Recent transactions": "Transactions récentes", "Monthly summary": "Résumé mensuel", Income: "Revenus", Expenses: "Dépenses", Expense: "Dépense", Language: "Langue", Cancel: "Annuler", Save: "Enregistrer" },
    de: { Overview: "Übersicht", Compare: "Vergleichen", "Money Used": "Ausgaben", "Add transaction": "Transaktion hinzufügen", "Sign out": "Abmelden", "Available wallet balance": "Verfügbares Guthaben", "Add Money": "Geld hinzufügen", "Recent transactions": "Letzte Transaktionen", "Monthly summary": "Monatsübersicht", Income: "Einnahmen", Expenses: "Ausgaben", Expense: "Ausgabe", Language: "Sprache", Cancel: "Abbrechen", Save: "Speichern" },
    pt: { Overview: "Visão geral", Compare: "Comparar", "Money Used": "Despesas", "Add transaction": "Adicionar transação", "Sign out": "Sair", "Available wallet balance": "Saldo disponível", "Add Money": "Adicionar dinheiro", "Recent transactions": "Transações recentes", "Monthly summary": "Resumo mensal", Income: "Receitas", Expenses: "Despesas", Expense: "Despesa", Language: "Idioma", Cancel: "Cancelar", Save: "Salvar" },
    ar: { Overview: "نظرة عامة", Compare: "مقارنة", "Money Used": "المصروفات", "Add transaction": "إضافة معاملة", "Sign out": "تسجيل الخروج", "Available wallet balance": "رصيد المحفظة المتاح", "Add Money": "إضافة أموال", "Recent transactions": "المعاملات الأخيرة", "Monthly summary": "الملخص الشهري", Income: "الدخل", Expenses: "المصروفات", Expense: "مصروف", Language: "اللغة", Cancel: "إلغاء", Save: "حفظ" },
    zh: { Overview: "概览", Compare: "比较", "Money Used": "支出", "Add transaction": "添加交易", "Sign out": "退出登录", "Available wallet balance": "可用钱包余额", "Add Money": "添加资金", "Recent transactions": "最近交易", "Monthly summary": "月度摘要", Income: "收入", Expenses: "支出", Expense: "支出", Language: "语言", Cancel: "取消", Save: "保存" },
    ja: { Overview: "概要", Compare: "比較", "Money Used": "支出", "Add transaction": "取引を追加", "Sign out": "ログアウト", "Available wallet balance": "利用可能な残高", "Add Money": "入金", "Recent transactions": "最近の取引", "Monthly summary": "月次概要", Income: "収入", Expenses: "支出", Expense: "支出", Language: "言語", Cancel: "キャンセル", Save: "保存" },
    ko: { Overview: "개요", Compare: "비교", "Money Used": "지출", "Add transaction": "거래 추가", "Sign out": "로그아웃", "Available wallet balance": "사용 가능한 잔액", "Add Money": "금액 추가", "Recent transactions": "최근 거래", "Monthly summary": "월간 요약", Income: "수입", Expenses: "지출", Expense: "지출", Language: "언어", Cancel: "취소", Save: "저장" }
  };
  const AUTH_TRANSLATIONS = {
    hi: { "A CLEARER WAY TO SEE YOUR MONEY": "अपने पैसे को बेहतर समझें", "Your money.": "आपका पैसा।", "Your terms.": "आपकी शर्तें।", "One calm place to understand your spending, build good habits, and feel a little more in control.": "अपने खर्चों को समझने, अच्छी आदतें बनाने और नियंत्रण पाने की एक सरल जगह।", "Private to your browser": "आपके ब्राउज़र तक निजी", "Financial data stays in local browser storage.": "वित्तीय डेटा इसी ब्राउज़र में रहता है।", "Clarity in every currency": "हर मुद्रा में स्पष्टता", "Keep spending in perspective, without mixing currencies.": "मुद्राओं को मिलाए बिना अपने खर्च को समझें।", "YOUR PERSONAL SPACE": "आपकी व्यक्तिगत जगह", "A BETTER VIEW STARTS HERE": "बेहतर नज़रिए की शुरुआत", "Welcome home.": "वापसी पर स्वागत है।", "Make it personal.": "इसे व्यक्तिगत बनाएं।", "Sign in with your existing username and password.": "अपने मौजूदा उपयोगकर्ता नाम और पासवर्ड से साइन इन करें।", "Create a separate local profile for your finances.": "अपने वित्त के लिए एक अलग स्थानीय प्रोफ़ाइल बनाएं।", "Sign in": "साइन इन", "Create account": "खाता बनाएं", "Username": "उपयोगकर्ता नाम", "Password": "पासवर्ड", "Full name": "पूरा नाम", "Date of birth": "जन्म तिथि", "Confirm password": "पासवर्ड की पुष्टि करें", "Remember me on this device": "इस डिवाइस पर मुझे याद रखें", "Your username": "आपका उपयोगकर्ता नाम", "How should we greet you?": "हम आपको किस नाम से बुलाएं?", "Choose a unique username": "एक अनोखा उपयोगकर्ता नाम चुनें", "Create my account": "मेरा खाता बनाएं", "Show": "दिखाएं", "Hide": "छिपाएं", "Local-only sign-in.": "केवल स्थानीय साइन-इन।", "Browser storage may be cleared by you or your browser.": "आप या आपका ब्राउज़र डेटा साफ़ कर सकते हैं।" },
    kn: { "A CLEARER WAY TO SEE YOUR MONEY": "ನಿಮ್ಮ ಹಣವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಯಿರಿ", "Your money.": "ನಿಮ್ಮ ಹಣ.", "Your terms.": "ನಿಮ್ಮ ನಿಯಮಗಳು.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "ನಿಮ್ಮ ಖರ್ಚನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ಬೆಳೆಸಲು ಒಂದೇ ಸರಳ ಸ್ಥಳ.", "Private to your browser": "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ಗೆ ಮಾತ್ರ ಖಾಸಗಿ", "Financial data stays in local browser storage.": "ಹಣಕಾಸಿನ ಮಾಹಿತಿ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಉಳಿಯುತ್ತದೆ.", "Clarity in every currency": "ಪ್ರತಿ ಕರೆನ್ಸಿಯಲ್ಲೂ ಸ್ಪಷ್ಟತೆ", "Keep spending in perspective, without mixing currencies.": "ಕರೆನ್ಸಿಗಳನ್ನು ಮಿಶ್ರಣ ಮಾಡದೆ ಖರ್ಚನ್ನು ಗಮನಿಸಿ.", "YOUR PERSONAL SPACE": "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸ್ಥಳ", "A BETTER VIEW STARTS HERE": "ಉತ್ತಮ ನೋಟ ಇಲ್ಲಿಂದ ಆರಂಭ", "Welcome home.": "ಮರಳಿ ಸ್ವಾಗತ.", "Make it personal.": "ನಿಮಗೆ ಹೊಂದಿಸಿ.", "Sign in with your existing username and password.": "ನಿಮ್ಮ ಬಳಕೆದಾರ ಹೆಸರು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಸೈನ್ ಇನ್ ಮಾಡಿ.", "Create a separate local profile for your finances.": "ನಿಮ್ಮ ಹಣಕಾಸಿಗೆ ಪ್ರತ್ಯೇಕ ಸ್ಥಳೀಯ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ.", "Sign in": "ಸೈನ್ ಇನ್", "Create account": "ಖಾತೆ ರಚಿಸಿ", "Username": "ಬಳಕೆದಾರ ಹೆಸರು", "Password": "ಪಾಸ್‌ವರ್ಡ್", "Full name": "ಪೂರ್ಣ ಹೆಸರು", "Date of birth": "ಜನ್ಮ ದಿನಾಂಕ", "Confirm password": "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ", "Remember me on this device": "ಈ ಸಾಧನದಲ್ಲಿ ನನ್ನನ್ನು ನೆನಪಿಡಿ", "Your username": "ನಿಮ್ಮ ಬಳಕೆದಾರ ಹೆಸರು", "How should we greet you?": "ನಿಮ್ಮನ್ನು ಯಾವ ಹೆಸರಿನಿಂದ ಕರೆಯಬೇಕು?", "Choose a unique username": "ವಿಶಿಷ್ಟ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ಆರಿಸಿ", "Create my account": "ನನ್ನ ಖಾತೆ ರಚಿಸಿ", "Show": "ತೋರಿಸಿ", "Hide": "ಮರೆಮಾಡಿ", "Local-only sign-in.": "ಸ್ಥಳೀಯ ಸೈನ್-ಇನ್ ಮಾತ್ರ.", "Browser storage may be cleared by you or your browser.": "ನೀವು ಅಥವಾ ಬ್ರೌಸರ್ ಸಂಗ್ರಹಣೆಯನ್ನು ಅಳಿಸಬಹುದು." },
    te: { "A CLEARER WAY TO SEE YOUR MONEY": "మీ డబ్బును స్పష్టంగా తెలుసుకోండి", "Your money.": "మీ డబ్బు.", "Your terms.": "మీ నియమాలు.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "ఖర్చులను అర్థం చేసుకుని మంచి అలవాట్లు పెంచుకునే సరళమైన స్థలం.", "Private to your browser": "మీ బ్రౌజర్‌లో మాత్రమే ప్రైవేట్", "Financial data stays in local browser storage.": "ఆర్థిక సమాచారం ఈ బ్రౌజర్‌లోనే ఉంటుంది.", "Clarity in every currency": "ప్రతి కరెన్సీలో స్పష్టత", "Keep spending in perspective, without mixing currencies.": "కరెన్సీలను కలపకుండా ఖర్చులను గమనించండి.", "YOUR PERSONAL SPACE": "మీ వ్యక్తిగత స్థలం", "A BETTER VIEW STARTS HERE": "మెరుగైన దృక్కోణం ఇక్కడ మొదలు", "Welcome home.": "తిరిగి స్వాగతం.", "Make it personal.": "మీకు అనుగుణంగా మార్చండి.", "Sign in with your existing username and password.": "మీ ప్రస్తుత వినియోగదారు పేరు, పాస్‌వర్డ్‌తో సైన్ ఇన్ చేయండి.", "Create a separate local profile for your finances.": "మీ ఆర్థిక వివరాల కోసం ప్రత్యేక స్థానిక ప్రొఫైల్ సృష్టించండి.", "Sign in": "సైన్ ఇన్", "Create account": "ఖాతా సృష్టించండి", "Username": "వినియోగదారు పేరు", "Password": "పాస్‌వర్డ్", "Full name": "పూర్తి పేరు", "Date of birth": "పుట్టిన తేదీ", "Confirm password": "పాస్‌వర్డ్ నిర్ధారించండి", "Remember me on this device": "ఈ పరికరంలో నన్ను గుర్తుంచుకోండి", "Your username": "మీ వినియోగదారు పేరు", "How should we greet you?": "మిమ్మల్ని ఏ పేరుతో పిలవాలి?", "Choose a unique username": "ప్రత్యేక వినియోగదారు పేరును ఎంచుకోండి", "Create my account": "నా ఖాతా సృష్టించండి", "Show": "చూపించు", "Hide": "దాచు", "Local-only sign-in.": "స్థానిక సైన్-ఇన్ మాత్రమే.", "Browser storage may be cleared by you or your browser.": "మీరు లేదా బ్రౌజర్ నిల్వను తొలగించవచ్చు." },
    ta: { "A CLEARER WAY TO SEE YOUR MONEY": "உங்கள் பணத்தைத் தெளிவாக அறியுங்கள்", "Your money.": "உங்கள் பணம்.", "Your terms.": "உங்கள் விதிகள்.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "செலவுகளைப் புரிந்து நல்ல பழக்கங்களை வளர்க்கும் எளிய இடம்.", "Private to your browser": "உங்கள் உலாவியில் மட்டும் தனிப்பட்டது", "Financial data stays in local browser storage.": "நிதித் தகவல்கள் இந்த உலாவியிலேயே இருக்கும்.", "Clarity in every currency": "ஒவ்வொரு நாணயத்திலும் தெளிவு", "Keep spending in perspective, without mixing currencies.": "நாணயங்களை கலக்காமல் செலவுகளைப் பாருங்கள்.", "YOUR PERSONAL SPACE": "உங்கள் தனிப்பட்ட இடம்", "A BETTER VIEW STARTS HERE": "சிறந்த பார்வை இங்கே தொடங்குகிறது", "Welcome home.": "மீண்டும் வருக.", "Make it personal.": "உங்களுக்கேற்றதாக மாற்றுங்கள்.", "Sign in with your existing username and password.": "ஏற்கனவே உள்ள பயனர்பெயர் மற்றும் கடவுச்சொல்லால் உள்நுழையவும்.", "Create a separate local profile for your finances.": "உங்கள் நிதிக்காக தனி உள்ளூர் சுயவிவரத்தை உருவாக்கவும்.", "Sign in": "உள்நுழை", "Create account": "கணக்கை உருவாக்கு", "Username": "பயனர்பெயர்", "Password": "கடவுச்சொல்", "Full name": "முழுப் பெயர்", "Date of birth": "பிறந்த தேதி", "Confirm password": "கடவுச்சொல்லை உறுதிப்படுத்து", "Remember me on this device": "இந்தச் சாதனத்தில் என்னை நினைவில் கொள்ளவும்", "Your username": "உங்கள் பயனர்பெயர்", "How should we greet you?": "உங்களை எந்தப் பெயரில் அழைக்கலாம்?", "Choose a unique username": "தனித்துவமான பயனர்பெயரைத் தேர்ந்தெடுக்கவும்", "Create my account": "எனது கணக்கை உருவாக்கு", "Show": "காட்டு", "Hide": "மறை", "Local-only sign-in.": "உள்ளூர் உள்நுழைவு மட்டும்.", "Browser storage may be cleared by you or your browser.": "நீங்கள் அல்லது உலாவி சேமிப்பகத்தை அழிக்கலாம்." },
    es: { "A CLEARER WAY TO SEE YOUR MONEY": "ENTIENDE MEJOR TU DINERO", "Your money.": "Tu dinero.", "Your terms.": "Tus condiciones.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "Un espacio sencillo para entender tus gastos, crear buenos hábitos y sentir más control.", "Private to your browser": "Privado en tu navegador", "Financial data stays in local browser storage.": "Los datos financieros permanecen en este navegador.", "Clarity in every currency": "Claridad en cada moneda", "Keep spending in perspective, without mixing currencies.": "Controla tus gastos sin mezclar monedas.", "YOUR PERSONAL SPACE": "TU ESPACIO PERSONAL", "A BETTER VIEW STARTS HERE": "UNA MEJOR PERSPECTIVA EMPIEZA AQUÍ", "Welcome home.": "Qué bueno verte de nuevo.", "Make it personal.": "Hazlo personal.", "Sign in with your existing username and password.": "Inicia sesión con tu usuario y contraseña actuales.", "Create a separate local profile for your finances.": "Crea un perfil local independiente para tus finanzas.", "Sign in": "Iniciar sesión", "Create account": "Crear cuenta", "Username": "Usuario", "Password": "Contraseña", "Full name": "Nombre completo", "Date of birth": "Fecha de nacimiento", "Confirm password": "Confirmar contraseña", "Remember me on this device": "Recordarme en este dispositivo", "Your username": "Tu usuario", "How should we greet you?": "¿Cómo te llamamos?", "Choose a unique username": "Elige un usuario único", "Create my account": "Crear mi cuenta", "Show": "Mostrar", "Hide": "Ocultar", "Local-only sign-in.": "Inicio de sesión local.", "Browser storage may be cleared by you or your browser.": "Tú o tu navegador pueden borrar el almacenamiento." },
    fr: { "A CLEARER WAY TO SEE YOUR MONEY": "VOYEZ VOTRE ARGENT PLUS CLAIREMENT", "Your money.": "Votre argent.", "Your terms.": "Vos choix.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "Un espace serein pour comprendre vos dépenses, prendre de bonnes habitudes et garder le contrôle.", "Private to your browser": "Privé dans votre navigateur", "Financial data stays in local browser storage.": "Les données financières restent dans ce navigateur.", "Clarity in every currency": "De la clarté dans chaque devise", "Keep spending in perspective, without mixing currencies.": "Suivez vos dépenses sans mélanger les devises.", "YOUR PERSONAL SPACE": "VOTRE ESPACE PERSONNEL", "A BETTER VIEW STARTS HERE": "UN MEILLEUR REGARD COMMENCE ICI", "Welcome home.": "Ravi de vous revoir.", "Make it personal.": "Personnalisez votre espace.", "Sign in with your existing username and password.": "Connectez-vous avec votre nom d’utilisateur et votre mot de passe.", "Create a separate local profile for your finances.": "Créez un profil local distinct pour vos finances.", "Sign in": "Se connecter", "Create account": "Créer un compte", "Username": "Nom d’utilisateur", "Password": "Mot de passe", "Full name": "Nom complet", "Date of birth": "Date de naissance", "Confirm password": "Confirmer le mot de passe", "Remember me on this device": "Se souvenir de moi sur cet appareil", "Your username": "Votre nom d’utilisateur", "How should we greet you?": "Comment devons-nous vous appeler ?", "Choose a unique username": "Choisissez un nom d’utilisateur unique", "Create my account": "Créer mon compte", "Show": "Afficher", "Hide": "Masquer", "Local-only sign-in.": "Connexion locale uniquement.", "Browser storage may be cleared by you or your browser.": "Vous ou votre navigateur pouvez effacer ces données." },
    de: { "A CLEARER WAY TO SEE YOUR MONEY": "BEHALTEN SIE IHR GELD IM BLICK", "Your money.": "Ihr Geld.", "Your terms.": "Ihre Regeln.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "Ein ruhiger Ort, um Ausgaben zu verstehen, gute Gewohnheiten zu entwickeln und den Überblick zu behalten.", "Private to your browser": "Privat in Ihrem Browser", "Financial data stays in local browser storage.": "Finanzdaten bleiben in diesem Browser.", "Clarity in every currency": "Klarheit in jeder Währung", "Keep spending in perspective, without mixing currencies.": "Behalten Sie Ausgaben im Blick, ohne Währungen zu vermischen.", "YOUR PERSONAL SPACE": "IHR PERSÖNLICHER BEREICH", "A BETTER VIEW STARTS HERE": "EIN BESSERER ÜBERBLICK BEGINNT HIER", "Welcome home.": "Willkommen zurück.", "Make it personal.": "Gestalten Sie es persönlich.", "Sign in with your existing username and password.": "Melden Sie sich mit Ihrem Benutzernamen und Passwort an.", "Create a separate local profile for your finances.": "Erstellen Sie ein separates lokales Profil für Ihre Finanzen.", "Sign in": "Anmelden", "Create account": "Konto erstellen", "Username": "Benutzername", "Password": "Passwort", "Full name": "Vollständiger Name", "Date of birth": "Geburtsdatum", "Confirm password": "Passwort bestätigen", "Remember me on this device": "Auf diesem Gerät angemeldet bleiben", "Your username": "Ihr Benutzername", "How should we greet you?": "Wie dürfen wir Sie nennen?", "Choose a unique username": "Wählen Sie einen eindeutigen Benutzernamen", "Create my account": "Mein Konto erstellen", "Show": "Anzeigen", "Hide": "Ausblenden", "Local-only sign-in.": "Nur lokale Anmeldung.", "Browser storage may be cleared by you or your browser.": "Sie oder Ihr Browser können den Speicher löschen." },
    pt: { "A CLEARER WAY TO SEE YOUR MONEY": "TENHA MAIS CLAREZA SOBRE SEU DINHEIRO", "Your money.": "Seu dinheiro.", "Your terms.": "Do seu jeito.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "Um lugar tranquilo para entender seus gastos, criar bons hábitos e ter mais controle.", "Private to your browser": "Privado no seu navegador", "Financial data stays in local browser storage.": "Os dados financeiros ficam neste navegador.", "Clarity in every currency": "Clareza em cada moeda", "Keep spending in perspective, without mixing currencies.": "Acompanhe seus gastos sem misturar moedas.", "YOUR PERSONAL SPACE": "SEU ESPAÇO PESSOAL", "A BETTER VIEW STARTS HERE": "UMA VISÃO MELHOR COMEÇA AQUI", "Welcome home.": "Que bom ter você de volta.", "Make it personal.": "Deixe com a sua cara.", "Sign in with your existing username and password.": "Entre com seu nome de usuário e senha atuais.", "Create a separate local profile for your finances.": "Crie um perfil local separado para suas finanças.", "Sign in": "Entrar", "Create account": "Criar conta", "Username": "Nome de usuário", "Password": "Senha", "Full name": "Nome completo", "Date of birth": "Data de nascimento", "Confirm password": "Confirmar senha", "Remember me on this device": "Manter conectado neste dispositivo", "Your username": "Seu nome de usuário", "How should we greet you?": "Como podemos chamar você?", "Choose a unique username": "Escolha um nome de usuário exclusivo", "Create my account": "Criar minha conta", "Show": "Mostrar", "Hide": "Ocultar", "Local-only sign-in.": "Acesso somente local.", "Browser storage may be cleared by you or your browser.": "Você ou seu navegador podem apagar os dados." },
    ar: { "A CLEARER WAY TO SEE YOUR MONEY": "رؤية أوضح لأموالك", "Your money.": "أموالك.", "Your terms.": "وفق اختياراتك.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "مساحة هادئة لفهم إنفاقك وبناء عادات جيدة والشعور بمزيد من التحكم.", "Private to your browser": "خاص بمتصفحك", "Financial data stays in local browser storage.": "تبقى بياناتك المالية في تخزين المتصفح المحلي.", "Clarity in every currency": "وضوح مع كل عملة", "Keep spending in perspective, without mixing currencies.": "تابع إنفاقك دون دمج العملات.", "YOUR PERSONAL SPACE": "مساحتك الشخصية", "A BETTER VIEW STARTS HERE": "تبدأ الرؤية الأفضل من هنا", "Welcome home.": "مرحبًا بعودتك.", "Make it personal.": "اجعلها تناسبك.", "Sign in with your existing username and password.": "سجّل الدخول باسم المستخدم وكلمة المرور الحاليين.", "Create a separate local profile for your finances.": "أنشئ ملفًا محليًا منفصلًا لشؤونك المالية.", "Sign in": "تسجيل الدخول", "Create account": "إنشاء حساب", "Username": "اسم المستخدم", "Password": "كلمة المرور", "Full name": "الاسم الكامل", "Date of birth": "تاريخ الميلاد", "Confirm password": "تأكيد كلمة المرور", "Remember me on this device": "تذكرني على هذا الجهاز", "Your username": "اسم المستخدم", "How should we greet you?": "بأي اسم نناديك؟", "Choose a unique username": "اختر اسم مستخدم فريدًا", "Create my account": "إنشاء حسابي", "Show": "إظهار", "Hide": "إخفاء", "Local-only sign-in.": "تسجيل دخول محلي فقط.", "Browser storage may be cleared by you or your browser.": "يمكنك أو يمكن للمتصفح مسح البيانات." },
    zh: { "A CLEARER WAY TO SEE YOUR MONEY": "清晰掌握你的财务", "Your money.": "你的金钱。", "Your terms.": "由你决定。", "One calm place to understand your spending, build good habits, and feel a little more in control.": "在这里了解支出、培养好习惯，让财务更有掌控感。", "Private to your browser": "仅保存在你的浏览器", "Financial data stays in local browser storage.": "财务数据保存在本地浏览器中。", "Clarity in every currency": "每种货币都清晰明了", "Keep spending in perspective, without mixing currencies.": "分别查看支出，不混合不同货币。", "YOUR PERSONAL SPACE": "你的个人空间", "A BETTER VIEW STARTS HERE": "从这里开始更清晰的理财", "Welcome home.": "欢迎回来。", "Make it personal.": "打造专属体验。", "Sign in with your existing username and password.": "使用现有用户名和密码登录。", "Create a separate local profile for your finances.": "为你的财务创建独立的本地个人资料。", "Sign in": "登录", "Create account": "创建账户", "Username": "用户名", "Password": "密码", "Full name": "姓名", "Date of birth": "出生日期", "Confirm password": "确认密码", "Remember me on this device": "在此设备上记住我", "Your username": "你的用户名", "How should we greet you?": "希望我们如何称呼你？", "Choose a unique username": "选择一个独特的用户名", "Create my account": "创建我的账户", "Show": "显示", "Hide": "隐藏", "Local-only sign-in.": "仅限本地登录。", "Browser storage may be cleared by you or your browser.": "你或浏览器可以清除本地存储。" },
    ja: { "A CLEARER WAY TO SEE YOUR MONEY": "お金の流れをわかりやすく", "Your money.": "あなたのお金。", "Your terms.": "あなたらしく。", "One calm place to understand your spending, build good habits, and feel a little more in control.": "支出を把握し、良い習慣を身につけ、安心して管理できる場所です。", "Private to your browser": "このブラウザー内でのみ管理", "Financial data stays in local browser storage.": "金融データはブラウザー内に保存されます。", "Clarity in every currency": "どの通貨もわかりやすく", "Keep spending in perspective, without mixing currencies.": "通貨を混ぜずに支出を確認できます。", "YOUR PERSONAL SPACE": "あなたのパーソナルスペース", "A BETTER VIEW STARTS HERE": "よりよい見通しをここから", "Welcome home.": "おかえりなさい。", "Make it personal.": "自分らしく設定しましょう。", "Sign in with your existing username and password.": "登録済みのユーザー名とパスワードでサインインしてください。", "Create a separate local profile for your finances.": "資産管理用のローカルプロフィールを作成します。", "Sign in": "サインイン", "Create account": "アカウント作成", "Username": "ユーザー名", "Password": "パスワード", "Full name": "氏名", "Date of birth": "生年月日", "Confirm password": "パスワードの確認", "Remember me on this device": "この端末でログイン状態を保持", "Your username": "ユーザー名", "How should we greet you?": "お呼びするお名前", "Choose a unique username": "他の人と重複しないユーザー名を選択", "Create my account": "アカウントを作成", "Show": "表示", "Hide": "非表示", "Local-only sign-in.": "ローカル限定のサインイン。", "Browser storage may be cleared by you or your browser.": "ブラウザーのデータは利用者またはブラウザーによって消去される場合があります。" },
    ko: { "A CLEARER WAY TO SEE YOUR MONEY": "내 돈을 더 명확하게", "Your money.": "나의 돈.", "Your terms.": "나의 방식.", "One calm place to understand your spending, build good habits, and feel a little more in control.": "지출을 이해하고 좋은 습관을 만들며 재정을 관리하는 차분한 공간입니다.", "Private to your browser": "브라우저에서만 비공개로 관리", "Financial data stays in local browser storage.": "금융 데이터는 이 브라우저에 저장됩니다.", "Clarity in every currency": "모든 통화를 명확하게", "Keep spending in perspective, without mixing currencies.": "통화를 합산하지 않고 지출을 확인하세요.", "YOUR PERSONAL SPACE": "나만의 공간", "A BETTER VIEW STARTS HERE": "더 나은 관리를 시작하세요", "Welcome home.": "다시 오신 것을 환영합니다.", "Make it personal.": "나에게 맞게 설정하세요.", "Sign in with your existing username and password.": "기존 사용자 이름과 비밀번호로 로그인하세요.", "Create a separate local profile for your finances.": "재정 관리를 위한 별도의 로컬 프로필을 만드세요.", "Sign in": "로그인", "Create account": "계정 만들기", "Username": "사용자 이름", "Password": "비밀번호", "Full name": "이름", "Date of birth": "생년월일", "Confirm password": "비밀번호 확인", "Remember me on this device": "이 기기에서 로그인 유지", "Your username": "사용자 이름", "How should we greet you?": "어떤 이름으로 불러드릴까요?", "Choose a unique username": "고유한 사용자 이름을 선택하세요", "Create my account": "계정 만들기", "Show": "표시", "Hide": "숨기기", "Local-only sign-in.": "로컬 전용 로그인입니다.", "Browser storage may be cleared by you or your browser.": "사용자 또는 브라우저가 저장 데이터를 삭제할 수 있습니다." }
  };
  const LEGACY_LANGUAGE_CODES = { zh: "zh-Hans" };
  const GREETING_TRANSLATIONS = {
    hi: { "Good morning": "शुभ प्रभात", "Good afternoon": "नमस्कार", "Good evening": "शुभ संध्या" },
    kn: { "Good morning": "ಶುಭೋದಯ", "Good afternoon": "ಶುಭ ಮಧ್ಯಾಹ್ನ", "Good evening": "ಶುಭ ಸಂಜೆ" },
    te: { "Good morning": "శుభోదయం", "Good afternoon": "శుభ మధ్యాహ్నం", "Good evening": "శుభ సాయంత్రం" },
    ta: { "Good morning": "காலை வணக்கம்", "Good afternoon": "மதிய வணக்கம்", "Good evening": "மாலை வணக்கம்" },
    ml: { "Good morning": "സുപ്രഭാതം", "Good afternoon": "ശുഭ ഉച്ച", "Good evening": "ശുഭ സായാഹ്നം" },
    mr: { "Good morning": "शुभ सकाळ", "Good afternoon": "शुभ दुपार", "Good evening": "शुभ संध्याकाळ" },
    bn: { "Good morning": "সুপ্রভাত", "Good afternoon": "শুভ অপরাহ্ণ", "Good evening": "শুভ সন্ধ্যা" },
    gu: { "Good morning": "સુપ્રભાત", "Good afternoon": "શુભ બપોર", "Good evening": "શુભ સાંજ" },
    pa: { "Good morning": "ਸ਼ੁਭ ਸਵੇਰ", "Good afternoon": "ਸ਼ੁਭ ਦੁਪਹਿਰ", "Good evening": "ਸ਼ੁਭ ਸ਼ਾਮ" },
    ur: { "Good morning": "صبح بخیر", "Good afternoon": "دوپہر بخیر", "Good evening": "شام بخیر" },
    ar: { "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Good evening": "مساء الخير" },
    es: { "Good morning": "Buenos días", "Good afternoon": "Buenas tardes", "Good evening": "Buenas noches" },
    fr: { "Good morning": "Bonjour", "Good afternoon": "Bon après-midi", "Good evening": "Bonsoir" },
    de: { "Good morning": "Guten Morgen", "Good afternoon": "Guten Tag", "Good evening": "Guten Abend" },
    pt: { "Good morning": "Bom dia", "Good afternoon": "Boa tarde", "Good evening": "Boa noite" },
    it: { "Good morning": "Buongiorno", "Good afternoon": "Buon pomeriggio", "Good evening": "Buonasera" },
    ru: { "Good morning": "Доброе утро", "Good afternoon": "Добрый день", "Good evening": "Добрый вечер" },
    "zh-Hans": { "Good morning": "早上好", "Good afternoon": "下午好", "Good evening": "晚上好" },
    "zh-Hant": { "Good morning": "早安", "Good afternoon": "午安", "Good evening": "晚安" },
    ja: { "Good morning": "おはようございます", "Good afternoon": "こんにちは", "Good evening": "こんばんは" },
    ko: { "Good morning": "좋은 아침입니다", "Good afternoon": "안녕하세요", "Good evening": "좋은 저녁입니다" },
    id: { "Good morning": "Selamat pagi", "Good afternoon": "Selamat siang", "Good evening": "Selamat malam" },
    th: { "Good morning": "อรุณสวัสดิ์", "Good afternoon": "สวัสดีตอนบ่าย", "Good evening": "สวัสดีตอนเย็น" },
    vi: { "Good morning": "Chào buổi sáng", "Good afternoon": "Chào buổi chiều", "Good evening": "Chào buổi tối" },
    tr: { "Good morning": "Günaydın", "Good afternoon": "İyi günler", "Good evening": "İyi akşamlar" },
    nl: { "Good morning": "Goedemorgen", "Good afternoon": "Goedemiddag", "Good evening": "Goedenavond" },
    pl: { "Good morning": "Dzień dobry", "Good afternoon": "Dzień dobry", "Good evening": "Dobry wieczór" },
    sw: { "Good morning": "Habari za asubuhi", "Good afternoon": "Habari za mchana", "Good evening": "Habari za jioni" },
    ne: { "Good morning": "शुभ प्रभात", "Good afternoon": "शुभ दिउँसो", "Good evening": "शुभ साँझ" }
  };
  const pendingRates = new Map();
  const translationOriginals = new WeakMap();
  const LEGACY_KEYS = {
    transactions: "finova.transactions.v1",
    accounts: "finova.accounts.v1",
    preferences: "finova.preferences.v1",
    profile: "finova.profile.v1",
    backup: "finova.automatic-backup.v1"
  };

  function normalizedUsername(value) {
    return String(value || "").trim().toLocaleLowerCase().replace(/\s+/g, "");
  }

  function findUsername(value) {
    const users = getUsers();
    const normalized = normalizedUsername(value);
    if (users[normalized]) return normalized;
    const name = String(value || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
    const match = Object.values(users).find((profile) => profile.name.toLocaleLowerCase() === name);
    return match ? match.username : "";
  }

  function getUsers() {
    const users = readJSON(USERS_KEY, {});
    if (users && typeof users === "object" && !Array.isArray(users) && Object.keys(users).length) return users;
    const legacyProfile = readJSON(PROFILE_KEY, null);
    if (legacyProfile && legacyProfile.name && legacyProfile.passwordHash) {
      const username = normalizedUsername(legacyProfile.username || legacyProfile.name);
      const migrated = { [username]: { ...legacyProfile, username } };
      writeJSON(USERS_KEY, migrated);
      migrateLegacyData(username);
      if (localStorage.getItem(SESSION_KEY) === "true" || sessionStorage.getItem(SESSION_KEY) === "true") {
        localStorage.setItem(SESSION_KEY, username);
      }
      return migrated;
    }
    return users && typeof users === "object" && !Array.isArray(users) ? users : {};
  }

  function getCurrentUsername() {
    return currentUser?.id || "";
  }

  function scopedKey(key) {
    return currentUser?.id ? `${key}.${encodeURIComponent(currentUser.id)}` : key;
  }

  function migrateLegacyData(username, copyLegacy) {
    const mappings = [
      [TRANSACTIONS_KEY, LEGACY_KEYS.transactions],
      [PREFERENCES_KEY, LEGACY_KEYS.preferences],
      [PROFILE_KEY, LEGACY_KEYS.profile],
      [BACKUP_KEY, LEGACY_KEYS.backup]
    ];
    if (copyLegacy !== false) mappings.forEach(([key, legacyKey]) => {
      const target = `${key}.${encodeURIComponent(username)}`;
      if (localStorage.getItem(target) === null && localStorage.getItem(legacyKey) !== null) {
        localStorage.setItem(target, localStorage.getItem(legacyKey));
      }
    });
    const walletKey = `${WALLET_KEY}.${encodeURIComponent(username)}`;
    if (localStorage.getItem(walletKey) === null) {
      const legacyAccounts = copyLegacy === false ? [] : readJSON(LEGACY_KEYS.accounts, []);
      const initialBalances = Array.isArray(legacyAccounts) ? legacyAccounts.reduce((totals, account) => {
        if (account && CURRENCIES.some((currency) => currency.code === account.currency) &&
            Number.isFinite(Number(account.openingBalance)) && Number(account.openingBalance) >= 0) {
          totals[account.currency] = (totals[account.currency] || 0) + Number(account.openingBalance);
        }
        return totals;
      }, {}) : {};
      writeJSON(walletKey, { initialBalances, topUps: [] });
    }
  }

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error("FINOVA could not read local data.", error);
      notify("Some saved data could not be read. Check your browser storage.", "error");
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("FINOVA could not save local data.", error);
      notify("Unable to save data. Your browser storage may be full or unavailable.", "error");
      return false;
    }
  }

  function getTransactions() {
    const saved = readJSON(scopedKey(TRANSACTIONS_KEY), []);
    if (!Array.isArray(saved)) {
      notify("Saved transactions have an unexpected format.", "error");
      return [];
    }
    return saved.filter((item) => item && typeof item === "object" && (item.type === "income" || item.type === "expense") && Number.isFinite(Number(item.amount)) && item.currency)
      .map(({ accountId, ...transaction }) => transaction);
  }

  function transactionToRow(transaction) {
    return {
      user_id: currentUser.id,
      id: transaction.id,
      type: transaction.type,
      title: transaction.title || "",
      amount: Number(transaction.amount),
      currency: transaction.currency,
      category: transaction.category || "",
      place: transaction.place || "",
      transaction_date: transaction.date,
      payment_method: transaction.paymentMethod || "",
      description: transaction.description || ""
    };
  }

  function transactionFromRow(row) {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      amount: Number(row.amount),
      currency: row.currency,
      category: row.category,
      place: row.place || "",
      date: row.transaction_date,
      paymentMethod: row.payment_method,
      description: row.description
    };
  }

  async function persistTransactions(transactions, previousTransactions) {
    if (!currentUser) throw new Error("Sign in before saving transactions.");
    const previousById = new Map(previousTransactions.map((transaction) => [transaction.id, transaction]));
    const retainedIds = new Set(transactions.map((item) => item.id));
    const removedIds = previousTransactions.map((item) => item.id).filter((id) => !retainedIds.has(id));
    for (const transaction of transactions) {
      const previous = previousById.get(transaction.id);
      if (!previous) {
        const { error } = await supabase.from("transactions").insert(transactionToRow(transaction));
        if (error) throw error;
      } else if (JSON.stringify(previous) !== JSON.stringify(transaction)) {
        const { data, error } = await supabase.from("transactions")
          .update(transactionToRow(transaction))
          .eq("user_id", currentUser.id)
          .eq("id", transaction.id)
          .select("id");
        if (error) throw error;
        if (data.length !== 1) throw new Error("A transaction could not be found in your account.");
      }
    }
    if (removedIds.length) {
      const { error } = await supabase.from("transactions")
        .delete()
        .eq("user_id", currentUser.id)
        .in("id", removedIds);
      if (error) throw error;
    }
  }

  async function saveTransactions(transactions) {
    if (!Array.isArray(transactions)) throw new Error("Transactions must be a list.");
    if (!currentUser) throw new Error("Sign in before saving transactions.");
    const previousTransactions = getTransactions();
    createAutomaticBackup();
    const cleanTransactions = transactions.map(({ accountId, ...transaction }) => transaction);
    if (!writeJSON(scopedKey(TRANSACTIONS_KEY), cleanTransactions)) return false;
    try {
      await persistTransactions(cleanTransactions, previousTransactions);
      window.dispatchEvent(new CustomEvent("finova:data-changed"));
      return true;
    } catch (error) {
      let rollbackFailed = false;
      try {
        await persistTransactions(previousTransactions, cleanTransactions);
      } catch (rollbackError) {
        rollbackFailed = true;
        console.error("Money Management could not roll back a failed Supabase transaction save.", rollbackError);
      }
      writeJSON(scopedKey(TRANSACTIONS_KEY), previousTransactions);
      console.error("Money Management could not save transactions to Supabase.", error);
      notify(`${error.message || "Transactions could not be saved to your account."}${rollbackFailed ? " The rollback also failed; check your account data before retrying." : ""}`, "error");
      return false;
    }
  }

  function canSpend(amount, currency, excludedTransactionId) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return false;
    const remaining = getTransactions().filter((transaction) => transaction.id !== excludedTransactionId);
    const available = getWalletBalances(remaining)[currency] || 0;
    return value <= available + 0.000001;
  }

  function getWallet() {
    const wallet = readJSON(scopedKey(WALLET_KEY), { initialBalances: {}, topUps: [] });
    if (!wallet || typeof wallet !== "object" || Array.isArray(wallet)) return { initialBalances: {}, topUps: [] };
    return {
      initialBalances: wallet.initialBalances && typeof wallet.initialBalances === "object" ? wallet.initialBalances : {},
      topUps: Array.isArray(wallet.topUps) ? wallet.topUps : []
    };
  }

  async function loadCloudData() {
    if (!currentUser) throw new Error("A signed-in Supabase user is required to load finance data.");
    const [transactionsResult, walletsResult, topUpsResult] = await Promise.all([
      supabase.from("transactions").select("id,user_id,type,title,amount,currency,category,transaction_date,payment_method,description,place").eq("user_id", currentUser.id).order("transaction_date", { ascending: false }),
      supabase.from("wallets").select("id,currency,starting_balance").eq("user_id", currentUser.id),
      supabase.from("wallet_topups").select("id,amount,currency,note,created_at").eq("user_id", currentUser.id).order("created_at", { ascending: true })
    ]);
    const failedResult = [transactionsResult, walletsResult, topUpsResult].find((result) => result.error);
    if (failedResult) throw failedResult.error;

    const transactions = transactionsResult.data.map(transactionFromRow);
    const wallet = {
      initialBalances: Object.fromEntries(walletsResult.data.map((row) => [row.currency, Number(row.starting_balance)])),
      topUps: topUpsResult.data.map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        currency: row.currency,
        note: row.note,
        createdAt: row.created_at
      }))
    };
    if (!writeJSON(scopedKey(TRANSACTIONS_KEY), transactions) || !writeJSON(scopedKey(WALLET_KEY), wallet)) {
      throw new Error("Cloud data was loaded but could not be cached in this browser.");
    }
  }

  async function persistWalletData(wallet, previousWallet) {
    const previousCurrencies = new Set(Object.keys(previousWallet.initialBalances));
    for (const [currency, startingBalance] of Object.entries(wallet.initialBalances)) {
      if (previousCurrencies.has(currency)) {
        const { error } = await supabase.from("wallets")
          .update({ starting_balance: Number(startingBalance) })
          .eq("user_id", currentUser.id)
          .eq("currency", currency);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("wallets").insert({
          user_id: currentUser.id,
          currency,
          starting_balance: Number(startingBalance)
        });
        if (error) throw error;
      }
    }
    const retainedCurrencies = new Set(Object.keys(wallet.initialBalances));
    const removedCurrencies = Object.keys(previousWallet.initialBalances).filter((currency) => !retainedCurrencies.has(currency));
    if (removedCurrencies.length) {
      const { error } = await supabase.from("wallets").delete()
        .eq("user_id", currentUser.id).in("currency", removedCurrencies);
      if (error) throw error;
    }
    const previousTopUpIds = new Set(previousWallet.topUps.map((topUp) => topUp.id));
    for (const topUp of wallet.topUps) {
      if (!previousTopUpIds.has(topUp.id)) {
        const { error } = await supabase.from("wallet_topups").insert({
          user_id: currentUser.id,
          id: topUp.id,
          amount: Number(topUp.amount),
          currency: topUp.currency,
          note: topUp.note || "",
          created_at: topUp.createdAt
        });
        if (error) throw error;
      }
    }
    const retainedTopUpIds = new Set(wallet.topUps.map((topUp) => topUp.id));
    const removedTopUpIds = previousWallet.topUps.map((topUp) => topUp.id).filter((id) => !retainedTopUpIds.has(id));
    if (removedTopUpIds.length) {
      const { error } = await supabase.from("wallet_topups").delete()
        .eq("user_id", currentUser.id).in("id", removedTopUpIds);
      if (error) throw error;
    }
  }

  function getWalletBalances(transactions) {
    const wallet = getWallet();
    const balances = { ...wallet.initialBalances };
    wallet.topUps.forEach((topUp) => {
      if (topUp && CURRENCIES.some((currency) => currency.code === topUp.currency) && Number.isFinite(Number(topUp.amount))) {
        balances[topUp.currency] = (balances[topUp.currency] || 0) + Number(topUp.amount);
      }
    });
    (transactions || getTransactions()).forEach((transaction) => {
      const movement = (transaction.type === "income" ? 1 : -1) * Number(transaction.amount);
      balances[transaction.currency] = (balances[transaction.currency] || 0) + movement;
    });
    return balances;
  }

  async function addWalletTopUp(amount, currency, note) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error("Enter an amount greater than zero.");
    if (!CURRENCIES.some((item) => item.code === currency)) throw new Error("Choose a supported currency.");
    if (!currentUser) throw new Error("Sign in before adding money to your wallet.");
    const wallet = getWallet();
    const topUp = {
      id: window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      amount: value,
      currency,
      note: String(note || "").trim().slice(0, 120),
      createdAt: new Date().toISOString()
    };
    const { error } = await supabase.from("wallet_topups").insert({
      user_id: currentUser.id,
      id: topUp.id,
      amount: topUp.amount,
      currency: topUp.currency,
      note: topUp.note,
      created_at: topUp.createdAt
    });
    if (error) throw error;
    wallet.topUps.push(topUp);
    createAutomaticBackup();
    if (!writeJSON(scopedKey(WALLET_KEY), wallet)) {
      const { error: rollbackError } = await supabase.from("wallet_topups").delete()
        .eq("user_id", currentUser.id).eq("id", topUp.id);
      if (rollbackError) {
        console.error("Money Management could not roll back a wallet top-up after a browser storage failure.", rollbackError);
        notify("The wallet top-up was saved remotely but could not be removed after a local storage error.", "error");
      }
      return false;
    }
    window.dispatchEvent(new CustomEvent("finova:data-changed"));
    return true;
  }

  function createAutomaticBackup() {
    try {
      const snapshot = {
        version: 1,
        savedAt: new Date().toISOString(),
        transactions: getTransactions(),
        wallet: getWallet(),
        preferences: getPreferences()
      };
      localStorage.setItem(scopedKey(BACKUP_KEY), JSON.stringify(snapshot));
    } catch (error) {
      console.error("FINOVA could not create an automatic local backup.", error);
      notify("Automatic backup could not be updated. Export a JSON backup before continuing.", "error");
    }
  }

  function getAutomaticBackup() {
    return readJSON(scopedKey(BACKUP_KEY), null);
  }

  function exportData() {
    return {
      application: "FINOVA",
      version: 2,
      exportedAt: new Date().toISOString(),
      profile: { name: getProfile()?.name || "" },
      transactions: getTransactions(),
      wallet: getWallet(),
      preferences: getPreferences()
    };
  }

  async function restoreData(data) {
    if (!data || data.application !== "FINOVA" || !Array.isArray(data.transactions)) {
      throw new Error("This file is not a valid Money Management backup.");
    }
    const validTransactions = data.transactions.every((item) =>
      item && (item.type === "income" || item.type === "expense") && Number.isFinite(Number(item.amount)) &&
      Number(item.amount) > 0 && CURRENCIES.some((currency) => currency.code === item.currency));
    const legacyInitialBalances = Array.isArray(data.accounts) ? data.accounts.reduce((totals, account) => {
      if (account && CURRENCIES.some((currency) => currency.code === account.currency) &&
          Number.isFinite(Number(account.openingBalance)) && Number(account.openingBalance) >= 0) {
        totals[account.currency] = (totals[account.currency] || 0) + Number(account.openingBalance);
      }
      return totals;
    }, {}) : {};
    const wallet = data.wallet && typeof data.wallet === "object"
      ? data.wallet
      : { initialBalances: legacyInitialBalances, topUps: [] };
    const initialBalances = wallet.initialBalances && typeof wallet.initialBalances === "object" ? wallet.initialBalances : {};
    const validTopUps = Array.isArray(wallet.topUps) && wallet.topUps.every((item) =>
      item && typeof item.id === "string" && Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 &&
      CURRENCIES.some((currency) => currency.code === item.currency));
    const validInitialBalances = Object.entries(initialBalances).every(([currency, amount]) =>
      CURRENCIES.some((item) => item.code === currency) && Number.isFinite(Number(amount)) && Number(amount) >= 0);
    if (!validTransactions || !validTopUps || !validInitialBalances) throw new Error("The backup contains invalid transactions or wallet entries.");
    if (!currentUser) throw new Error("Sign in before restoring a backup.");
    createAutomaticBackup();
    const previousTransactions = getTransactions();
    const previousWallet = getWallet();
    const cleanTransactions = data.transactions.map(({ accountId, ...item }) => item);
    const nextWallet = {
      initialBalances,
      topUps: wallet.topUps.map((item) => ({ ...item, note: String(item.note || ""), createdAt: item.createdAt || new Date().toISOString() }))
    };
    let transactionWriteStarted = false;
    let walletWriteStarted = false;
    try {
      transactionWriteStarted = true;
      await persistTransactions(cleanTransactions, previousTransactions);
      walletWriteStarted = true;
      await persistWalletData(nextWallet, previousWallet);
      if (!writeJSON(scopedKey(TRANSACTIONS_KEY), cleanTransactions) || !writeJSON(scopedKey(WALLET_KEY), nextWallet)) {
        throw new Error("Restored data could not be cached in this browser.");
      }
      if (data.preferences && typeof data.preferences === "object") {
        localStorage.setItem(scopedKey(PREFERENCES_KEY), JSON.stringify({ ...getPreferences(), ...data.preferences }));
      }
    } catch (error) {
      let rollbackFailed = false;
      if (walletWriteStarted) {
        try {
          await persistWalletData(previousWallet, nextWallet);
        } catch (rollbackError) {
          rollbackFailed = true;
          console.error("Money Management could not roll back wallet data after a failed restore.", rollbackError);
        }
      }
      if (transactionWriteStarted) {
        try {
          await persistTransactions(previousTransactions, cleanTransactions);
        } catch (rollbackError) {
          rollbackFailed = true;
          console.error("Money Management could not roll back transactions after a failed restore.", rollbackError);
        }
      }
      console.error("FINOVA could not restore the selected backup.", error);
      throw new Error(`Restore failed: ${error.message || "Supabase rejected the data."}${rollbackFailed ? " Rollback also failed; check your account data." : " Your previous automatic backup is still available."}`);
    }
    window.dispatchEvent(new CustomEvent("finova:data-changed"));
    window.dispatchEvent(new CustomEvent("finova:preferences-changed"));
  }

  function getPreferences() {
    const username = getCurrentUsername();
    const scoped = username ? readJSON(scopedKey(PREFERENCES_KEY), null) : null;
    const globalPrefs = readJSON(PREFERENCES_KEY, {});
    return { ...globalPrefs, ...(scoped || {}) };
  }

  function getProfile() {
    if (!currentUser) return null;
    const metadata = currentUser.user_metadata || {};
    return {
      name: metadata.full_name || metadata.name || currentUser.email || "",
      username: metadata.username || ""
    };
  }

  function isEmailVerified(user = currentUser) {
    return Boolean(user?.email_confirmed_at || user?.confirmed_at);
  }

  function authErrorMessage(error) {
    const code = String(error?.code || error?.name || "").toLowerCase();
    const message = String(error?.message || "").toLowerCase();
    if (code.includes("email_not_confirmed") || message.includes("email not confirmed")) {
      return "Please verify your email before signing in. You can resend the verification email below.";
    }
    if (code.includes("otp_expired") || code.includes("token_expired") || message.includes("expired") || message.includes("invalid")) {
      return "This verification link is invalid or has expired. Request a new verification email and try again.";
    }
    if (code.includes("rate") || code === "429" || message.includes("rate limit") || message.includes("too many requests")) {
      return "Email sending is temporarily rate-limited. Please wait a little while before trying again.";
    }
    if (code.includes("user_already_exists") || message.includes("already registered") || message.includes("already exists")) {
      return "An account with this email may already exist. Sign in or request a new verification email.";
    }
    if (code.includes("weak_password") || message.includes("password should") || message.includes("weak password")) {
      return "Choose a stronger password with at least 8 characters, including uppercase, lowercase, a number and a symbol.";
    }
    if (code.includes("invalid_email") || message.includes("invalid email")) {
      return "Enter a valid email address and try again.";
    }
    if (message.includes("failed to fetch") || message.includes("network") || message.includes("fetch")) {
      return "We couldn't reach the authentication service. Check your connection and try again.";
    }
    return error?.message || "Your request could not be completed. Please try again.";
  }

  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }

  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function hashPassword(password, salt, iterations) {
    if (!window.crypto?.subtle) throw new Error("Password protection requires a secure browser context (HTTPS or localhost).");
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt: salt || crypto.getRandomValues(new Uint8Array(16)),
      iterations: iterations || PASSWORD_ITERATIONS,
      hash: "SHA-256"
    }, keyMaterial, 256);
    return bytesToBase64(bits);
  }

  async function registerProfile(name, email, usernameValue, password, dateOfBirth, remember) {
    const normalizedName = name.trim().replace(/\s+/g, " ");
    const username = normalizedUsername(usernameValue);
    if (!/^[a-z0-9._-]{3,30}$/.test(username)) throw new Error("Username must be 3–30 characters using letters, numbers, dots, underscores or hyphens.");
    if (!isStrongPassword(password)) throw new Error("Use at least 8 characters with uppercase, lowercase, a number and a special character.");
    window.setFinovaRememberSession(Boolean(remember));
    const redirectUrl = new URL("verify-email.html", window.location.href);
    redirectUrl.searchParams.set("email", email.trim());
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: normalizedName, username, date_of_birth: dateOfBirth },
        emailRedirectTo: redirectUrl.href
      }
    });
    if (error) throw error;
    localStorage.setItem("finova.auth.has-account", "true");
    if (!data.session) return { requiresEmailConfirmation: true };
    currentUser = data.user;
    return { requiresEmailConfirmation: false };
  }

  async function resendVerificationEmail(email) {
    const normalizedEmail = String(email || "").trim();
    if (!normalizedEmail) throw new Error("Enter your email address to resend the verification link.");
    const redirectUrl = new URL("verify-email.html", window.location.href);
    redirectUrl.searchParams.set("email", normalizedEmail);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: redirectUrl.href }
    });
    if (error) throw error;
  }

  function isStrongPassword(password) {
    return typeof password === "string" && password.length >= 8 && /[A-Z]/.test(password) &&
      /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  }

  function passwordStrength(password) {
    const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password),
      /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
    return score >= 5 ? "strong" : score >= 3 ? "medium" : "weak";
  }

  async function verifyPassword(password) {
    if (!password || !currentUser?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({ email: currentUser.email, password });
    if (error?.code === "invalid_credentials") return false;
    if (error) throw error;
    return true;
  }

  function isAuthenticated() {
    return Boolean(currentUser?.id);
  }

  async function signIn(remember, email, password) {
    window.setFinovaRememberSession(Boolean(remember));
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (!isEmailVerified(data.user)) {
      currentUser = data.user;
      const unverifiedError = new Error("Please verify your email before signing in. You can resend the verification email below.");
      unverifiedError.code = "email_not_confirmed";
      unverifiedError.email = data.user?.email || email.trim();
      throw unverifiedError;
    }
    localStorage.setItem("finova.auth.has-account", "true");
    currentUser = data.user;
    const savedLanguage = readJSON(scopedKey(PREFERENCES_KEY), {}).language;
    const language = LEGACY_LANGUAGE_CODES[savedLanguage] || savedLanguage;
    if (language && LANGUAGES.some((item) => item.code === language)) localStorage.setItem(LANGUAGE_KEY, language);
    return data.user;
  }

  async function signOut() {
    if (!await confirmAction({
      title: "Sign out of Money Management?",
      message: "Your financial data will remain saved to your account.",
      confirmLabel: "Sign out"
    })) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      notify(error.message || "Sign out could not be completed.", "error");
      return;
    }
    currentUser = null;
    window.location.href = "login.html";
  }

  function confirmAction({ title, message, confirmLabel, danger }) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "action-confirm-overlay";

      const dialog = document.createElement("section");
      dialog.className = "action-confirm-card";
      dialog.setAttribute("role", "alertdialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "action-confirm-title");
      dialog.setAttribute("aria-describedby", "action-confirm-message");

      const icon = document.createElement("span");
      icon.className = "reassurance-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = danger ? "!" : "?";

      const eyebrow = document.createElement("span");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "PLEASE CONFIRM";

      const heading = document.createElement("h2");
      heading.id = "action-confirm-title";
      heading.textContent = title;

      const description = document.createElement("p");
      description.id = "action-confirm-message";
      description.textContent = message;

      const actions = document.createElement("div");
      actions.className = "password-confirm-actions";

      const cancel = document.createElement("button");
      cancel.className = "button button-quiet";
      cancel.type = "button";
      cancel.textContent = "Cancel";

      const confirm = document.createElement("button");
      confirm.className = `button button-primary${danger ? " action-confirm-danger" : ""}`;
      confirm.type = "button";
      confirm.textContent = confirmLabel || "Continue";

      actions.append(cancel, confirm);
      dialog.append(icon, eyebrow, heading, description, actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      const finish = (result) => {
        overlay.remove();
        resolve(result);
      };

      cancel.addEventListener("click", () => finish(false));
      confirm.addEventListener("click", () => finish(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(false);
      });
      overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") finish(false);
      });
      window.requestAnimationFrame(() => cancel.focus());
    });
  }

  function requirePasswordConfirmation({ title, message }) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "password-confirm-overlay";
      overlay.innerHTML = `<form class="password-confirm-card"><span class="reassurance-icon">⌑</span><span class="eyebrow">VERIFY IT'S YOU</span><h2>${escapeHTML(title || "Confirm your password")}</h2><p>${escapeHTML(message || "Enter your password to continue.")}</p><label class="field"><span class="field-label">Password</span><input type="password" name="password" autocomplete="current-password" required></label><div class="password-confirm-error" role="alert"></div><div class="password-confirm-actions"><button type="button" class="button button-quiet" data-cancel>Cancel</button><button type="submit" class="button button-primary">Continue</button></div></form>`;
      document.body.appendChild(overlay);
      const form = overlay.querySelector("form");
      const input = form.elements.password;
      const finish = (result) => {
        overlay.remove();
        resolve(result);
      };
      overlay.querySelector("[data-cancel]").addEventListener("click", () => finish(false));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) finish(false);
      });
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submit = form.querySelector('[type="submit"]');
        submit.disabled = true;
        try {
          if (await verifyPassword(input.value)) finish(true);
          else {
            form.querySelector(".password-confirm-error").textContent = "That password did not match.";
            input.value = "";
            input.focus();
            submit.disabled = false;
          }
        } catch (error) {
          console.error("FINOVA could not verify the local password.", error);
          form.querySelector(".password-confirm-error").textContent = error.message;
          submit.disabled = false;
        }
      });
      input.focus();
    });
  }

  async function protectPage() {
    const page = document.body.dataset.page;
    if (page === "login") {
      if (isAuthenticated() && isEmailVerified()) window.location.replace("index.html");
      return true;
    }
    if (!isAuthenticated() || !isEmailVerified()) {
      const next = `${window.location.pathname.split("/").pop()}${window.location.search}`;
      const email = currentUser && !isEmailVerified()
        ? `&email=${encodeURIComponent(currentUser.email || "")}&unverified=1`
        : "";
      window.location.replace(`login.html?next=${encodeURIComponent(next)}${email}`);
      return false;
    }
    return true;
  }

  function fillSidebarProfile() {
    const profile = getProfile();
    const name = document.getElementById("sidebar-profile-name");
    if (name) name.textContent = profile?.name || "My wallet";
    const avatar = document.getElementById("sidebar-profile-avatar");
    if (avatar) avatar.textContent = profile?.name?.trim()?.[0]?.toLocaleUpperCase() || "F";
    document.querySelectorAll(".avatar-button").forEach((button) => {
      button.textContent = profile?.name?.trim()?.[0]?.toLocaleUpperCase() || "F";
      button.setAttribute("aria-label", profile ? `Profile: ${profile.name}` : "Profile");
    });
    document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", signOut));
  }

  function setPreference(name, value) {
    const username = getCurrentUsername();
    const prefs = getPreferences();
    prefs[name] = value;
    if (username) writeJSON(scopedKey(PREFERENCES_KEY), prefs);
    writeJSON(PREFERENCES_KEY, prefs);
    window.dispatchEvent(new CustomEvent("finova:preferences-changed", { detail: { name, value } }));
    return true;
  }

  function setLanguage(code) {
    code = LEGACY_LANGUAGE_CODES[code] || code;
    if (!LANGUAGES.some((language) => language.code === code)) throw new Error("Choose a supported language.");
    setPreference("language", code);
    localStorage.setItem(LANGUAGE_KEY, code);
    applyTranslations();
    window.dispatchEvent(new CustomEvent("finova:language-changed"));
  }

  function getLanguage() {
    const saved = getPreferences().language || localStorage.getItem(LANGUAGE_KEY) || "en";
    const normalized = LEGACY_LANGUAGE_CODES[saved] || saved;
    return LANGUAGES.some((language) => language.code === normalized) ? normalized : "en";
  }

  function getLocale() {
    return LANGUAGES.find((language) => language.code === getLanguage())?.locale || "en";
  }

  const EXTRA_TRANSLATIONS = {
    hi: {
      "Total income": "कुल आय", "Total expenses": "कुल खर्च", "Transactions": "लेन-देन",
      "Workspace": "कार्यस्थान", "Your financial space": "आपका वित्तीय स्थान", "Display": "प्रदर्शन",
      "Take a Tour": "टूर देखें", "Live overview": "लाइव अवलोकन", "Money received": "प्राप्त राशि",
      "Money spent": "खर्च की गई राशि", "Across all your currencies": "आपकी सभी मुद्राओं में",
      "View all": "सभी देखें", "This month": "इस महीने", "Monthly net": "मासिक शुद्ध",
      "Your personal wallet": "आपका व्यक्तिगत वॉलेट", "Confirm top-up": "टॉप-अप की पुष्टि करें",
      "Amount": "राशि", "Currency": "मुद्रा", "Note": "टिप्पणी", "Date": "तारीख",
      "Payment method": "भुगतान विधि", "Choose a payment method": "भुगतान विधि चुनें",
      "How much?": "कितनी राशि?", "Give it a name": "नाम दें", "Category": "श्रेणी",
      "Where did you spend it?": "आपने कहाँ खर्च किया?", "Where did you receive it?": "आपको कहाँ से मिला?",
      "Add a note": "नोट जोड़ें", "Financial analytics": "वित्तीय विश्लेषण", "See the bigger picture": "बड़ी तस्वीर देखें",
      "Circular chart": "वृत्ताकार चार्ट", "Normal chart": "सामान्य चार्ट", "This month vs last": "इस महीने बनाम पिछला",
      "Average daily spend": "औसत दैनिक खर्च", "Top spending category": "शीर्ष खर्च श्रेणी",
      "Spending mix": "खर्च का विवरण", "Where your money went": "आपका पैसा कहाँ गया",
      "Spending by week": "साप्ताहिक खर्च", "Month by month": "महीने दर महीने",
      "Income vs expenses": "आय बनाम खर्च", "Money in motion": "पैसे की गतिविधि",
      "All transactions": "सभी लेन-देन", "Income entries": "आय प्रविष्टियाँ", "Expense entries": "खर्च प्रविष्टियाँ",
      "Ledger": "खाता-बही", "Personal account": "व्यक्तिगत खाता", "Good morning": "शुभ प्रभात",
      "Good afternoon": "नमस्कार", "Good evening": "शुभ संध्या", "Welcome back": "वापसी पर स्वागत है",
      "Password strength": "पासवर्ड की मजबूती", "Weak": "कमजोर", "Medium": "मध्यम", "Strong": "मजबूत"
    },
    es: {
      "Total income": "Ingresos totales", "Total expenses": "Gastos totales", "Transactions": "Transacciones",
      "Workspace": "Espacio de trabajo", "Your financial space": "Tu espacio financiero", "Display": "Mostrar",
      "Take a Tour": "Ver tour", "Live overview": "Resumen en vivo", "Money received": "Dinero recibido",
      "Money spent": "Dinero gastado", "Across all your currencies": "En todas tus monedas",
      "View all": "Ver todo", "This month": "Este mes", "Monthly net": "Neto mensual",
      "Your personal wallet": "Tu cartera personal", "Confirm top-up": "Confirmar recarga",
      "Amount": "Importe", "Currency": "Moneda", "Note": "Nota", "Date": "Fecha",
      "Payment method": "Método de pago", "Choose a payment method": "Elige un método de pago",
      "How much?": "¿Cuánto?", "Give it a name": "Ponle un nombre", "Category": "Categoría",
      "Where did you spend it?": "¿Dónde lo gastaste?", "Where did you receive it?": "¿Dónde lo recibiste?",
      "Add a note": "Añadir una nota", "Financial analytics": "Análisis financiero", "See the bigger picture": "Ve el panorama completo",
      "Circular chart": "Gráfico circular", "Normal chart": "Gráfico normal", "This month vs last": "Este mes vs anterior",
      "Average daily spend": "Gasto diario promedio", "Top spending category": "Categoría principal de gasto",
      "Spending mix": "Distribución del gasto", "Where your money went": "Adónde fue tu dinero",
      "Spending by week": "Gasto por semana", "Month by month": "Mes a mes",
      "Income vs expenses": "Ingresos vs gastos", "Money in motion": "Dinero en movimiento",
      "All transactions": "Todas las transacciones", "Income entries": "Entradas de ingresos", "Expense entries": "Entradas de gastos",
      "Ledger": "Libro de registro", "Personal account": "Cuenta personal", "Good morning": "Buenos días",
      "Good afternoon": "Buenas tardes", "Good evening": "Buenas noches", "Welcome back": "Te damos la bienvenida",
      "Password strength": "Seguridad de la contraseña", "Weak": "Débil", "Medium": "Media", "Strong": "Fuerte"
    },
    fr: {
      "Total income": "Revenus totaux", "Total expenses": "Dépenses totales", "Transactions": "Transactions",
      "Workspace": "Espace de travail", "Your financial space": "Votre espace financier", "Display": "Affichage",
      "Take a Tour": "Visite guidée", "Live overview": "Aperçu en direct", "Money received": "Argent reçu",
      "Money spent": "Argent dépensé", "Across all your currencies": "Toutes devises confondues",
      "View all": "Voir tout", "This month": "Ce mois-ci", "Monthly net": "Solde net mensuel",
      "Your personal wallet": "Votre portefeuille personnel", "Confirm top-up": "Confirmer le rechargement",
      "Amount": "Montant", "Currency": "Devise", "Note": "Note", "Date": "Date",
      "Payment method": "Moyen de paiement", "Choose a payment method": "Choisir un moyen de paiement",
      "How much?": "Combien ?", "Give it a name": "Donnez-lui un nom", "Category": "Catégorie",
      "Where did you spend it?": "Où l'avez-vous dépensé ?", "Where did you receive it?": "D'où provient ce montant ?",
      "Add a note": "Ajouter une note", "Financial analytics": "Analyses financières", "See the bigger picture": "Voyez les choses en grand",
      "Circular chart": "Graphique circulaire", "Normal chart": "Graphique standard", "This month vs last": "Ce mois vs dernier",
      "Average daily spend": "Dépense quotidienne moyenne", "Top spending category": "Catégorie principale de dépenses",
      "Spending mix": "Répartition des dépenses", "Where your money went": "Où est passé votre argent",
      "Spending by week": "Dépenses par semaine", "Month by month": "Mois par mois",
      "Income vs expenses": "Revenus vs dépenses", "Money in motion": "Flux financiers",
      "All transactions": "Toutes les transactions", "Income entries": "Entrées de revenus", "Expense entries": "Entrées de dépenses",
      "Ledger": "Grand livre", "Personal account": "Compte personnel", "Good morning": "Bonjour",
      "Good afternoon": "Bon après-midi", "Good evening": "Bonsoir", "Welcome back": "Bon retour",
      "Password strength": "Niveau du mot de passe", "Weak": "Faible", "Medium": "Moyen", "Strong": "Fort"
    },
    de: {
      "Total income": "Gesamteinnahmen", "Total expenses": "Gesamtausgaben", "Transactions": "Transaktionen",
      "Workspace": "Arbeitsbereich", "Your financial space": "Ihr Finanzbereich", "Display": "Anzeige",
      "Take a Tour": "Tour ansehen", "Live overview": "Live-Übersicht", "Money received": "Erhaltenes Geld",
      "Money spent": "Ausgegebenes Geld", "Across all your currencies": "Über alle Währungen hinweg",
      "View all": "Alle anzeigen", "This month": "Diesen Monat", "Monthly net": "Monatssaldo",
      "Your personal wallet": "Ihre persönliche Geldbörse", "Confirm top-up": "Aufladung bestätigen",
      "Amount": "Betrag", "Currency": "Währung", "Note": "Notiz", "Date": "Datum",
      "Payment method": "Zahlungsart", "Choose a payment method": "Zahlungsart wählen",
      "How much?": "Wie viel?", "Give it a name": "Name vergeben", "Category": "Kategorie",
      "Where did you spend it?": "Wo ausgegeben?", "Where did you receive it?": "Woher erhalten?",
      "Add a note": "Notiz hinzufügen", "Financial analytics": "Finanzanalysen", "See the bigger picture": "Das Gesamtbild sehen",
      "Circular chart": "Kreisdiagramm", "Normal chart": "Balkendiagramm", "This month vs last": "Dieser Monat vs. letzter",
      "Average daily spend": "Durchschnittl. Tagesausgaben", "Top spending category": "Top-Ausgabenkategorie",
      "Spending mix": "Ausgabenverteilung", "Where your money went": "Wohin Ihr Geld floss",
      "Spending by week": "Ausgaben nach Woche", "Month by month": "Monat für Monat",
      "Income vs expenses": "Einnahmen vs. Ausgaben", "Money in motion": "Finanzen in Bewegung",
      "All transactions": "Alle Transaktionen", "Income entries": "Einnahmeneinträge", "Expense entries": "Ausgabeneinträge",
      "Ledger": "Transaktionsbuch", "Personal account": "Persönliches Konto", "Good morning": "Guten Morgen",
      "Good afternoon": "Guten Tag", "Good evening": "Guten Abend", "Welcome back": "Willkommen zurück",
      "Password strength": "Passwortstärke", "Weak": "Schwach", "Medium": "Mittel", "Strong": "Stark"
    },
    pt: {
      "Total income": "Rendimento total", "Total expenses": "Despesas totais", "Transactions": "Transações",
      "Workspace": "Espaço de trabalho", "Your financial space": "Seu espaço financeiro", "Display": "Exibição",
      "Take a Tour": "Rever tour", "Live overview": "Visão geral ao vivo", "Money received": "Dinheiro recebido",
      "Money spent": "Dinheiro gasto", "Across all your currencies": "Em todas as suas moedas",
      "View all": "Ver tudo", "This month": "Este mês", "Monthly net": "Saldo mensal",
      "Your personal wallet": "Sua carteira pessoal", "Confirm top-up": "Confirmar recarga",
      "Amount": "Valor", "Currency": "Moeda", "Note": "Nota", "Date": "Data",
      "Payment method": "Método de pagamento", "Choose a payment method": "Escolha um método de pagamento",
      "How much?": "Quanto?", "Give it a name": "Dê um nome", "Category": "Categoria",
      "Where did you spend it?": "Onde gastou?", "Where did you receive it?": "Onde recebeu?",
      "Add a note": "Adicionar uma nota", "Financial analytics": "Análise financeira", "See the bigger picture": "Veja o quadro geral",
      "Circular chart": "Gráfico circular", "Normal chart": "Gráfico normal", "This month vs last": "Este mês vs anterior",
      "Average daily spend": "Gasto diário médio", "Top spending category": "Principal categoria de gastos",
      "Spending mix": "Distribuição de gastos", "Where your money went": "Para onde foi seu dinheiro",
      "Spending by week": "Gastos por semana", "Month by month": "Mês a mês",
      "Income vs expenses": "Receitas vs despesas", "Money in motion": "Dinheiro em movimento",
      "All transactions": "Todas as transações", "Income entries": "Entradas de receita", "Expense entries": "Entradas de despesa",
      "Ledger": "Livro de registros", "Personal account": "Conta pessoal", "Good morning": "Bom dia",
      "Good afternoon": "Boa tarde", "Good evening": "Boa noite", "Welcome back": "Bem-vindo de volta",
      "Password strength": "Força da senha", "Weak": "Fraca", "Medium": "Média", "Strong": "Forte"
    },
    ar: {
      "Total income": "إجمالي الدخل", "Total expenses": "إجمالي المصروفات", "Transactions": "المعاملات",
      "Workspace": "مساحة العمل", "Your financial space": "مساحتك المالية", "Display": "العرض",
      "Take a Tour": "مشاهدة الجولة", "Live overview": "نظرة عامة مباشرة", "Money received": "الأموال المستلمة",
      "Money spent": "الأموال المصروفة", "Across all your currencies": "عبر جميع عملاتك",
      "View all": "عرض الكل", "This month": "هذا الشهر", "Monthly net": "صافي الشهر",
      "Your personal wallet": "محفظتك الشخصية", "Confirm top-up": "تأكيد الإيداع",
      "Amount": "المبلغ", "Currency": "العملة", "Note": "ملاحظة", "Date": "التاريخ",
      "Payment method": "طريقة الدفع", "Choose a payment method": "اختر طريقة الدفع",
      "How much?": "كم المبلغ؟", "Give it a name": "أدخل الاسم", "Category": "الفئة",
      "Where did you spend it?": "أين أنفقتها؟", "Where did you receive it?": "من أين استلمتها؟",
      "Add a note": "إضافة ملاحظة", "Financial analytics": "التحليلات المالية", "See the bigger picture": "شاهد الصورة الشاملة",
      "Circular chart": "مخطط دائري", "Normal chart": "مخطط عادي", "This month vs last": "هذا الشهر مقابل السابق",
      "Average daily spend": "متوسط الإنفاق اليومي", "Top spending category": "أعلى فئة إنفاق",
      "Spending mix": "توزيع الإنفاق", "Where your money went": "أين ذهبت أموالك",
      "Spending by week": "الإنفاق أسبوعياً", "Month by month": "شهراً بشهر",
      "Income vs expenses": "الدخل مقابل المصروفات", "Money in motion": "الأموال قيد الحركة",
      "All transactions": "جميع المعاملات", "Income entries": "سجلات الدخل", "Expense entries": "سجلات المصروفات",
      "Ledger": "دفتر الحسابات", "Personal account": "حساب شخصي", "Good morning": "صباح الخير",
      "Good afternoon": "مساء الخير", "Good evening": "مساء الخير", "Welcome back": "مرحباً بعودتك",
      "Password strength": "قوة كلمة المرور", "Weak": "ضعيفة", "Medium": "متوسطة", "Strong": "قوية"
    },
    zh: {
      "Total income": "总收入", "Total expenses": "总支出", "Transactions": "交易记录",
      "Workspace": "工作区", "Your financial space": "个人财务空间", "Display": "显示",
      "Take a Tour": "查看导览", "Live overview": "实时概览", "Money received": "已收款项",
      "Money spent": "已支出款项", "Across all your currencies": "涵盖所有货币",
      "View all": "查看全部", "This month": "本月", "Monthly net": "本月净额",
      "Your personal wallet": "个人钱包", "Confirm top-up": "确认充值",
      "Amount": "金额", "Currency": "货币", "Note": "备注", "Date": "日期",
      "Payment method": "支付方式", "Choose a payment method": "选择支付方式",
      "How much?": "金额多少？", "Give it a name": "填写名称", "Category": "分类",
      "Where did you spend it?": "支出去向？", "Where did you receive it?": "款项来源？",
      "Add a note": "添加备注", "Financial analytics": "财务分析", "See the bigger picture": "掌控全局财务",
      "Circular chart": "环形图", "Normal chart": "柱状图", "This month vs last": "本月与上月对比",
      "Average daily spend": "日均支出", "Top spending category": "支出最高分类",
      "Spending mix": "支出构成", "Where your money went": "钱花在何处",
      "Spending by week": "每周支出", "Month by month": "月度趋势",
      "Income vs expenses": "收入与支出", "Money in motion": "资金动态",
      "All transactions": "全部交易", "Income entries": "收入记录", "Expense entries": "支出记录",
      "Ledger": "账本", "Personal account": "个人账户", "Good morning": "早上好",
      "Good afternoon": "下午好", "Good evening": "晚上好", "Welcome back": "欢迎回来",
      "Password strength": "密码强度", "Weak": "弱", "Medium": "中等", "Strong": "强"
    }
  };

  function getDictionary(language) {
    const lang = language || getLanguage();
    const base = lang.split("-")[0];
    const main = TRANSLATIONS[lang] || TRANSLATIONS[base] || (lang.startsWith("zh-") ? TRANSLATIONS.zh : null) || {};
    const extra = EXTRA_TRANSLATIONS[lang] || EXTRA_TRANSLATIONS[base] || (lang.startsWith("zh-") ? EXTRA_TRANSLATIONS.zh : null) || {};
    const auth = AUTH_TRANSLATIONS[lang] || AUTH_TRANSLATIONS[base] || (lang.startsWith("zh-") ? AUTH_TRANSLATIONS.zh : null) || {};
    const greet = GREETING_TRANSLATIONS[lang] || GREETING_TRANSLATIONS[base] || {};
    return { ...main, ...extra, ...auth, ...greet };
  }

  function translate(text) {
    if (!text || typeof text !== "string") return text;
    const language = getLanguage();
    if (language === "en") return text;
    const dict = getDictionary(language);
    if (dict[text]) return dict[text];
    const trimmed = text.trim();
    if (dict[trimmed]) return dict[trimmed];
    const lower = trimmed.toLowerCase();
    const foundKey = Object.keys(dict).find((k) => k.trim().toLowerCase() === lower);
    if (foundKey) return dict[foundKey];
    return text;
  }

  function applyTranslations() {
    const language = getLanguage();
    document.documentElement.lang = language;
    document.documentElement.dir = ["ar", "ur"].includes(language) ? "rtl" : "ltr";
    const dict = getDictionary(language);
    const lowerKeys = new Set(Object.keys(dict).map((k) => k.trim().toLowerCase()));

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentElement || node.parentElement.closest("script,style,textarea,input,.language-picker,.currency-picker")) {
          return NodeFilter.FILTER_REJECT;
        }
        const currentText = node.nodeValue.trim();
        if (!currentText) return NodeFilter.FILTER_REJECT;
        const record = translationOriginals.get(node);
        const source = record ? record.source : currentText;
        const sourceLower = source.toLowerCase();
        return (record || dict[source] || lowerKeys.has(sourceLower)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const currentText = node.nodeValue.trim();
      const record = translationOriginals.get(node);
      const source = record && currentText === record.translated ? record.source : currentText;
      const translated = translate(source);
      translationOriginals.set(node, { source, translated });
      if (currentText !== translated) node.nodeValue = node.nodeValue.replace(currentText, translated);
    });
    document.querySelectorAll("[placeholder]").forEach((input) => {
      input.dataset.originalPlaceholder = input.dataset.originalPlaceholder || input.placeholder;
      input.placeholder = translate(input.dataset.originalPlaceholder);
    });
    document.querySelectorAll("[aria-label]").forEach((element) => {
      element.dataset.originalAriaLabel = element.dataset.originalAriaLabel || element.getAttribute("aria-label");
      element.setAttribute("aria-label", translate(element.dataset.originalAriaLabel));
    });
    updateLanguagePickers();
  }

  function updateLanguagePickers() {
    const current = LANGUAGES.find((item) => item.code === getLanguage()) || LANGUAGES[0];
    document.querySelectorAll("[data-language-picker]").forEach((picker) => {
      const trigger = picker.querySelector("[data-language-trigger]");
      if (trigger) {
        trigger.querySelector(".language-current").textContent = current.nativeName;
        trigger.setAttribute("aria-label", `Language: ${current.name}`);
      }
      picker.querySelectorAll("[role='option']").forEach((option) => {
        const selected = option.dataset.languageCode === current.code;
        option.setAttribute("aria-selected", String(selected));
        option.classList.toggle("selected", selected);
      });
    });
  }

  function updateCurrencyPicker(picker) {
    const select = picker.querySelector("[data-preferred-currency]");
    const current = CURRENCIES.find((currency) => currency.code === select.value) || CURRENCIES[0];
    const trigger = picker.querySelector("[data-currency-trigger]");
    trigger.querySelector(".currency-current").textContent = `${current.symbol} ${current.code}`;
    trigger.setAttribute("aria-label", `Display currency: ${current.name} (${current.code} · ${current.symbol})`);
    trigger.title = `${current.name} (${current.code} · ${current.symbol}) ${current.flag}`;
    picker.querySelectorAll("[data-currency-code]").forEach((option) => {
      const selected = option.dataset.currencyCode === current.code;
      option.setAttribute("aria-selected", String(selected));
      option.classList.toggle("selected", selected);
    });
  }

  function initializeCurrencyPicker(select) {
    if (!select || select.dataset.currencyPickerInitialized === "true") return;
    const control = select.closest(".currency-control");
    if (control && control.tagName === "LABEL") {
      const container = document.createElement("div");
      container.className = control.className;
      control.replaceWith(container);
      while (control.firstChild) container.appendChild(control.firstChild);
    }
    const picker = document.createElement("div");
    picker.className = "currency-picker language-picker";
    picker.dataset.currencyPicker = "";
    select.parentElement.insertBefore(picker, select);
    picker.appendChild(select);
    select.classList.add("currency-native-select");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    picker.insertAdjacentHTML("beforeend", `<button type="button" class="language-trigger currency-trigger" data-currency-trigger aria-haspopup="dialog" aria-expanded="false"><span class="currency-current"></span><span class="language-chevron" aria-hidden="true"></span></button><div class="language-menu currency-menu" role="dialog" aria-label="Choose display currency" hidden><label class="language-search-wrap"><span aria-hidden="true">⌕</span><input type="search" class="language-search currency-search" data-currency-search placeholder="Search currencies" autocomplete="off" aria-label="Search currencies"></label><div class="language-options currency-options" role="listbox"></div><p class="currency-no-results" hidden>No currencies found.</p></div>`);
    select.dataset.currencyPickerInitialized = "true";

    const options = picker.querySelector(".currency-options");
    CURRENCIES.forEach((currency) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "language-option currency-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-label", `${currency.name}, ${currency.code} (${currency.symbol})`);
      option.dataset.currencyCode = currency.code;
      option.dataset.currencyName = currency.name;
      option.dataset.searchIndex = currency.searchIndex;
      option.innerHTML = `<div class="currency-option-info"><span class="currency-option-name">${currency.name}</span><span class="currency-option-meta"><strong class="currency-option-code">${currency.code}</strong><span class="currency-option-sep">·</span><span class="currency-option-symbol">${currency.symbol}</span></span></div><span class="currency-option-flag" aria-hidden="true">${currency.flag}</span>`;
      options.appendChild(option);
    });

    const trigger = picker.querySelector("[data-currency-trigger]");
    const menu = picker.querySelector(".currency-menu");
    const search = picker.querySelector(".currency-search");
    const noResults = picker.querySelector(".currency-no-results");
    const close = () => {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      picker.classList.remove("open");
    };

    trigger.addEventListener("click", () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
      picker.classList.toggle("open", opening);
      if (opening) {
        search.value = "";
        picker.querySelectorAll(".currency-option").forEach((option) => {
          option.hidden = false;
          option.style.order = "0";
        });
        noResults.hidden = true;
        options.scrollTop = 0;
        search.focus();
      }
    });

    search.addEventListener("input", () => {
      const query = normalizeSearch(search.value);
      const variants = [query];
      if (query === "riyal" || query === "rial") variants.push("riyal", "rial");
      if (query === "yuan" || query === "rmb" || query === "renminbi") variants.push("yuan", "rmb", "renminbi");
      if (query === "ruble" || query === "rouble") variants.push("ruble", "rouble");
      if (query === "krona" || query === "krone") variants.push("krona", "krone");
      if (query === "shekel" || query === "sheqel") variants.push("shekel", "sheqel");

      let visibleCount = 0;
      picker.querySelectorAll(".currency-option").forEach((option) => {
        const index = option.dataset.searchIndex || "";
        const matches = !query || variants.some((term) => index.includes(term));
        option.hidden = !matches;
        if (matches) {
          visibleCount++;
          if (query) {
            const nameNorm = normalizeSearch(option.dataset.currencyName || "");
            const isPrimary = nameNorm.startsWith(query) || nameNorm.includes(" " + query) || option.dataset.currencyCode.toLowerCase() === query;
            option.style.order = isPrimary ? "-1" : "0";
          } else {
            option.style.order = "0";
          }
        }
      });
      noResults.hidden = visibleCount > 0;
      options.scrollTop = 0;
    });

    picker.addEventListener("click", (event) => {
      const option = event.target.closest("[data-currency-code]");
      if (!option) return;
      select.value = option.dataset.currencyCode;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      trigger.focus();
    });
    picker.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!picker.contains(event.target)) close();
    });
    select.addEventListener("change", () => updateCurrencyPicker(picker));
    updateCurrencyPicker(picker);
  }

  function initializeLanguagePicker(picker) {
    if (!picker || picker.dataset.initialized === "true") return;
    picker.classList.add("language-picker");
    picker.innerHTML = `<button type="button" class="language-trigger" data-language-trigger aria-haspopup="dialog" aria-expanded="false"><span class="language-current"></span><span class="language-chevron" aria-hidden="true"></span></button><div class="language-menu" role="dialog" aria-label="Choose language" hidden><label class="language-search-wrap"><span aria-hidden="true">⌕</span><input type="search" class="language-search" placeholder="Search languages" autocomplete="off" aria-label="Search languages"></label><div class="language-options" role="listbox"></div></div>`;
    picker.dataset.initialized = "true";
    const options = picker.querySelector(".language-options");
    LANGUAGES.forEach((language) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "language-option";
      option.setAttribute("role", "option");
      option.dataset.languageCode = language.code;
      option.dataset.searchText = `${language.name} ${language.nativeName}`.toLocaleLowerCase();
      option.innerHTML = `<span class="language-native"></span><span class="language-english"></span>`;
      option.querySelector(".language-native").textContent = language.nativeName;
      option.querySelector(".language-english").textContent = language.name;
      options.appendChild(option);
    });
    const trigger = picker.querySelector("[data-language-trigger]");
    const menu = picker.querySelector(".language-menu");
    const search = picker.querySelector(".language-search");
    const close = () => {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      picker.classList.remove("open");
    };
    trigger.addEventListener("click", () => {
      const opening = menu.hidden;
      menu.hidden = !opening;
      trigger.setAttribute("aria-expanded", String(opening));
      picker.classList.toggle("open", opening);
      if (opening) {
        search.value = "";
        picker.querySelectorAll(".language-option").forEach((option) => { option.hidden = false; });
        search.focus();
      }
    });
    search.addEventListener("input", () => {
      const query = search.value.trim().toLocaleLowerCase();
      picker.querySelectorAll(".language-option").forEach((option) => {
        option.hidden = !option.dataset.searchText.includes(query);
      });
    });
    picker.addEventListener("click", (event) => {
      const option = event.target.closest("[data-language-code]");
      if (!option) return;
      setLanguage(option.dataset.languageCode);
      close();
      trigger.focus();
    });
    picker.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!picker.contains(event.target)) close();
    });
    updateLanguagePickers();
  }

  function installLanguageSelector(container) {
    const picker = container || document.querySelector("[data-language-picker]");
    if (picker) {
      initializeLanguagePicker(picker);
      return;
    }
    const actions = document.querySelector(".topbar-actions");
    if (!actions) return;
    const newPicker = document.createElement("div");
    newPicker.dataset.languagePicker = "";
    newPicker.className = "language-control";
    const currencyControl = actions.querySelector(".currency-control");
    actions.insertBefore(newPicker, currencyControl ? currencyControl.nextSibling : null);
    initializeLanguagePicker(newPicker);
  }

  function updateHeaderLocale() {
    const dateNode = document.getElementById("current-date");
    const mobileDate = document.getElementById("overview-date-mobile");
    const formattedDate = new Intl.DateTimeFormat(getLocale(), { weekday: "short", month: "short", day: "numeric" }).format(new Date());
    if (dateNode) dateNode.textContent = formattedDate;
    if (mobileDate) mobileDate.textContent = formattedDate;
    const welcome = document.getElementById("welcome-message");
    if (welcome) {
      const hour = new Date().getHours();
      const timeGreeting = hour >= 5 && hour < 12 ? "Good morning" : hour >= 12 && hour < 17 ? "Good afternoon" : "Good evening";
      welcome.textContent = `${translate(timeGreeting)}, ${getProfile()?.name || translate("welcome back")}`;
    }
  }

  function currencyInfo(code) {
    const target = code || getPreferredCurrency();
    return CURRENCIES.find((currency) => currency.code === target) || {
      code: target || "USD",
      name: target || "Unknown currency",
      symbol: target || "$",
      flag: currencyFlag(target || "USD")
    };
  }

  function formatCurrency(amount, currency, options) {
    const info = currencyInfo(currency || getPreferredCurrency());
    const num = Number(amount) || 0;
    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const noDecimals = ["JPY", "KRW", "VND", "CLP", "PYG", "UGX", "RWF"].includes(info.code);
    try {
      const formattedNum = absNum.toLocaleString(getLocale(), {
        minimumFractionDigits: noDecimals ? 0 : 2,
        maximumFractionDigits: noDecimals ? 0 : 2,
        ...(options || {})
      });
      const symbol = info.symbol || info.code;
      const needsSpace = /[a-zA-Z؀-ۿ]/.test(symbol);
      const res = needsSpace ? `${symbol} ${formattedNum}` : `${symbol}${formattedNum}`;
      return isNegative ? `-${res}` : res;
    } catch (error) {
      console.error("FINOVA could not format currency.", error);
      const symbol = info.symbol || info.code;
      return `${isNegative ? "-" : ""}${symbol}${absNum.toFixed(noDecimals ? 0 : 2)}`;
    }
  }

  function dateFromISO(iso, options) {
    if (!iso) return "Date not set";
    const date = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(getLocale(), options || { month: "short", day: "numeric", year: "numeric" }).format(date);
  }

  function notify(message, type) {
    const region = document.querySelector(".toast-region");
    if (!region) return;
    const toast = document.createElement("div");
    toast.className = `toast${type === "error" ? " error" : ""}`;
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function todayISO() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function fillCurrencySelect(select, selected) {
    if (!select) return;
    if (select.tagName === "DATALIST") {
      select.replaceChildren(...CURRENCIES.flatMap((currency) => {
        const optCode = document.createElement("option");
        optCode.value = currency.code;
        optCode.label = `${currency.name} (${currency.code} · ${currency.symbol}) ${currency.flag}`;
        const optName = document.createElement("option");
        optName.value = currency.name;
        optName.label = `${currency.code} · ${currency.symbol} ${currency.flag}`;
        return [optCode, optName];
      }));
      return;
    }
    if (select.tagName !== "SELECT") {
      const list = select.list || document.getElementById(select.getAttribute("list"));
      if (list) {
        list.replaceChildren(...CURRENCIES.flatMap((currency) => {
          const optCode = document.createElement("option");
          optCode.value = currency.code;
          optCode.label = `${currency.name} (${currency.code} · ${currency.symbol}) ${currency.flag}`;
          const optName = document.createElement("option");
          optName.value = currency.name;
          optName.label = `${currency.code} · ${currency.symbol} ${currency.flag}`;
          return [optCode, optName];
        }));
      }
      select.value = selected;
      return;
    }
    select.replaceChildren(...CURRENCIES.map((currency) => {
      const option = document.createElement("option");
      option.value = currency.code;
      option.textContent = `${currency.name} (${currency.code} · ${currency.symbol}) ${currency.flag}`;
      option.selected = currency.code === selected;
      return option;
    }));
  }

  function getRateCache() {
    const cache = readJSON(RATES_KEY, {});
    return cache && typeof cache === "object" ? cache : {};
  }

  async function getExchangeRate(from, to) {
    if (from === to) return { rate: 1, date: todayISO() };
    const cache = getRateCache();
    const key = `${from}_${to}`;
    const cached = cache[key];
    if (cached && cached.rate > 0 && Date.now() - cached.savedAt < 24 * 60 * 60 * 1000) {
      return { rate: cached.rate, date: cached.date };
    }
    if (pendingRates.has(key)) return pendingRates.get(key);
    const request = (async () => {
      const url = `https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
      if (!response.ok) throw new Error(`Exchange-rate service returned ${response.status}.`);
      const result = await response.json();
      const rate = Number(result.rates && result.rates[to]);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error(`No exchange rate is available for ${from} to ${to}.`);
      cache[key] = { rate, date: result.date || todayISO(), savedAt: Date.now() };
      writeJSON(RATES_KEY, cache);
      return { rate, date: cache[key].date };
    })();
    pendingRates.set(key, request);
    try {
      return await request;
    } finally {
      pendingRates.delete(key);
    }
  }

  function groupAmounts(transactions, type) {
    return transactions.reduce((groups, transaction) => {
      if (type && transaction.type !== type) return groups;
      const code = transaction.currency;
      groups[code] = (groups[code] || 0) + Number(transaction.amount);
      return groups;
    }, {});
  }

  function groupedText(groups, signed) {
    const entries = Object.entries(groups).filter(([, amount]) => Math.abs(amount) > 0.000001);
    if (!entries.length) return formatCurrency(0, Object.keys(groups)[0] || getPreferredCurrency());
    return entries.map(([code, amount]) => `${signed && amount > 0 ? "+" : ""}${formatCurrency(amount, code)}`).join(" · ");
  }

  function getPreferredCurrency() {
    const preferred = getPreferences().currency;
    return CURRENCIES.some((currency) => currency.code === preferred) ? preferred : "INR";
  }

  async function convertTransactions(transactions, targetCurrency, amountSelector) {
    const amounts = new Map();
    const codes = [...new Set(transactions.map((transaction) => transaction.currency))];
    let newestRateDate = "";
    try {
      const rates = await Promise.all(codes.map(async (code) => [code, await getExchangeRate(code, targetCurrency)]));
      rates.forEach(([code, value]) => {
        amounts.set(code, value.rate);
        if (value.date > newestRateDate) newestRateDate = value.date;
      });
    } catch (error) {
      console.warn("FINOVA currency conversion is unavailable; totals remain separated by currency.", error);
      return { converted: false, value: null, ratesDate: "", groups: groupAmounts(transactions), error };
    }
    const value = transactions.reduce((sum, transaction) => {
      const amount = amountSelector ? amountSelector(transaction) : Number(transaction.amount);
      return sum + amount * (amounts.get(transaction.currency) || 1);
    }, 0);
    return { converted: true, value, ratesDate: newestRateDate, groups: groupAmounts(transactions) };
  }

  function netByCurrency(transactions) {
    return transactions.reduce((groups, transaction) => {
      const sign = transaction.type === "income" ? 1 : -1;
      groups[transaction.currency] = (groups[transaction.currency] || 0) + sign * Number(transaction.amount);
      return groups;
    }, {});
  }

  async function displayTotal(element, transactions, targetCurrency, mode, noteElement) {
    if (!element) return null;
    const filtered = mode === "balance"
      ? transactions
      : transactions.filter((transaction) => transaction.type === mode);
    if (mode === "balance") {
      const net = netByCurrency(filtered);
      const conversionRows = Object.entries(net).map(([currency, amount]) => ({ currency, amount }));
      const result = await convertTransactions(conversionRows, targetCurrency, (row) => row.amount);
      if (result.converted) {
        element.textContent = formatCurrency(result.value, targetCurrency);
        if (noteElement) noteElement.textContent = Object.keys(net).length > 1 ? `Estimated conversion to ${targetCurrency} · rates dated ${result.ratesDate}` : "Based on your saved transactions";
      } else {
        element.textContent = groupedText(net, true);
        if (noteElement) noteElement.textContent = "Exchange rates unavailable · balances shown separately by currency";
      }
      return result;
    }
    const result = await convertTransactions(filtered, targetCurrency);
    if (result.converted) {
      element.textContent = formatCurrency(result.value, targetCurrency);
      if (noteElement) noteElement.textContent = Object.keys(result.groups).length > 1 ? `Estimated conversion to ${targetCurrency} · rates dated ${result.ratesDate}` : "Based on your saved transactions";
    } else {
      element.textContent = groupedText(result.groups, false);
      if (noteElement) noteElement.textContent = "Exchange rates unavailable · totals shown separately by currency";
    }
    return result;
  }

  function setActiveNavigation() {
    const page = document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === page;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function applyTheme() {
    const isLight = getPreferences().theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.setAttribute("aria-label", isLight ? "Toggle dark theme" : "Toggle light theme");
      button.title = isLight ? "Switch to dark mode" : "Switch to light mode";
      button.textContent = isLight ? "☾" : "☼";
    });
  }

  function bindThemeToggles() {
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.removeEventListener("click", handleThemeToggle);
      button.addEventListener("click", handleThemeToggle);
    });
  }

  function handleThemeToggle() {
    const next = !document.body.classList.contains("light-theme");
    document.body.classList.toggle("light-theme", next);
    setPreference("theme", next ? "light" : "dark");
    applyTheme();
  }

  async function initShell() {
    applyTheme();
    bindThemeToggles();
    const { data, error } = await supabase.auth.getSession();
    if (error) console.warn("Supabase session check error", error);
    currentUser = data?.session?.user || null;
    if (currentUser) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) currentUser = userData.user;
      } catch (e) {
        console.warn("Could not refresh user from Supabase", e);
      }
    }
    if (document.body.dataset.page === "login" || document.body.dataset.page === "verification") {
      applyTranslations();
      installLanguageSelector(document.querySelector("[data-language-picker]"));
      bindThemeToggles();
      if (document.body.dataset.page === "login") {
        await protectPage();
      }
      window.setTimeout(() => document.querySelector(".loading-screen")?.remove(), 500);
      return true;
    }
    if (!await protectPage()) return false;
    try {
      await loadCloudData();
    } catch (cloudErr) {
      console.warn("Using local records as cloud sync had an error:", cloudErr);
    }
    applyTranslations();
    installLanguageSelector();
    setActiveNavigation();
    fillSidebarProfile();
    updateHeaderLocale();
    const preferred = getPreferredCurrency();
    document.querySelectorAll("[data-preferred-currency]").forEach((select) => {
      fillCurrencySelect(select, preferred);
      select.addEventListener("change", () => {
        setPreference("currency", select.value);
        document.querySelectorAll("[data-preferred-currency]").forEach((other) => { other.value = select.value; });
        window.dispatchEvent(new CustomEvent("finova:currency-changed"));
      });
      initializeCurrencyPicker(select);
    });
    applyTheme();
    bindThemeToggles();
    window.addEventListener("finova:preferences-changed", () => {
      const restoredCurrency = getPreferredCurrency();
      document.querySelectorAll("[data-preferred-currency]").forEach((select) => { select.value = restoredCurrency; });
      applyTheme();
      applyTranslations();
    });
    window.addEventListener("finova:language-changed", updateHeaderLocale);
    document.querySelectorAll(".avatar-button").forEach((button) => button.addEventListener("click", () => notify("Your account and financial data are securely stored with Supabase.")));
    window.setTimeout(() => document.querySelector(".loading-screen")?.remove(), 500);
    return true;
  }

  window.Finova = {
    currencies: CURRENCIES,
    expenseCategories: EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
    languages: LANGUAGES,
    getLanguage,
    getLocale,
    initLanguageSelector: initializeLanguagePicker,
    get ready() { return appReady; },
    updateHeaderLocale,
    translate,
    applyTranslations,
    getCurrentUsername,
    getUsers,
    findUsername,
    setLanguage,
    getTransactions,
    saveTransactions,
    getWallet,
    getWalletBalances,
    canSpend,
    addWalletTopUp,
    getAutomaticBackup,
    exportData,
    restoreData,
    getPreferences,
    setPreference,
    getProfile,
    registerProfile,
    resendVerificationEmail,
    authErrorMessage,
    isEmailVerified,
    getAuthUser: () => currentUser,
    isStrongPassword,
    passwordStrength,
    verifyPassword,
    signIn,
    signOut,
    isAuthenticated,
    confirmAction,
    requirePasswordConfirmation,
    currencyInfo,
    formatCurrency,
    dateFromISO,
    todayISO,
    fillCurrencySelect,
    initializeCurrencyPicker,
    getPreferredCurrency,
    getExchangeRate,
    convertTransactions,
    groupAmounts,
    groupedText,
    displayTotal,
    notify,
    escapeHTML,
    initShell
  };

  document.addEventListener("DOMContentLoaded", () => {
    appReady = initShell().catch((error) => {
      console.error("Money Management could not initialize its Supabase session or data.", error);
      notify(`Could not connect to your account data. ${error.message || "Check Supabase setup and network access."}`, "error");
      document.querySelectorAll("[data-logout]").forEach((button) => button.addEventListener("click", signOut));
      window.setTimeout(() => document.querySelector(".loading-screen")?.remove(), 900);
      return false;
    });
  });
})();
