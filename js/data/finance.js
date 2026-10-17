/* OmniCalc - data/finance.js
   Reference seed data for currencies, crypto, metals and pre-Euro currencies.
   These bundled values are offline fallbacks; live rates replace them when online. */

(function () {
  'use strict';

  /* Fiat currencies ~ USD base. Offline reference values (approximate). */
  OC.FIAT_SEED = {
    note: 'Bundled offline reference rates — they are approximate and will be replaced by live rates when online.',
    rates: {
      USD: 1, EUR: 0.93, GBP: 0.79, JPY: 149, CNY: 7.24, INR: 83.4, AUD: 1.52, CAD: 1.36,
      CHF: 0.88, HKD: 7.82, SGD: 1.34, NZD: 1.64, SEK: 10.45, NOK: 10.65, DKK: 6.94, PLN: 3.98,
      CZK: 23.1, HUF: 355, RON: 4.57, BGN: 1.82, ISK: 138, RUB: 91, TRY: 30.5, UAH: 39.5,
      ILS: 3.72, AED: 3.67, SAR: 3.75, QAR: 3.64, KWD: 0.308, BHD: 0.376, OMR: 0.385, JOD: 0.709,
      EGP: 47.5, ZAR: 18.6, NGN: 1400, KES: 130, GHS: 13.9, MAD: 10.0, TND: 3.12, DZD: 134.5,
      ETB: 56.5, UGX: 3800, TZS: 2580, XOF: 604, XAF: 604, PKR: 278, BDT: 110, LKR: 305,
      NPR: 133.5, BTN: 83.4, MMK: 2100, THB: 35.8, MYR: 4.72, IDR: 15800, PHP: 56.2, VND: 24600,
      KRW: 1335, TWD: 31.5, MNT: 3390, KZT: 452, UZS: 12600, AZN: 1.70, GEL: 2.68, AMD: 402,
      BYN: 3.28, MDL: 17.7, RSD: 108.5, MKD: 56.7, ALL: 96, BAM: 1.82, MXN: 17.1, BRL: 5.05,
      ARS: 850, CLP: 950, COP: 3950, PEN: 3.76, UYU: 39.5, BOB: 6.91, PYG: 7300, VES: 36.5,
      CRC: 515, GTQ: 7.82, HNL: 24.7, NIO: 36.7, PAB: 1, DOP: 58.5, JMD: 156, TTD: 6.79,
      BSD: 1, BBD: 2, BZD: 2.01, XCD: 2.70, FJD: 2.25, PGK: 3.82, WST: 2.72, TOP: 2.36,
      VUV: 120, SBD: 8.45, MUR: 46, MVR: 15.4, BWP: 13.6, NAD: 18.6, ZMW: 25.5, MWK: 1690,
      MZN: 63.8, AOA: 830, CDF: 2700, XPF: 111, GMD: 67, GNF: 8600, LRD: 190, SLE: 22.5,
      SDG: 600, SSP: 1300, SOS: 571, RWF: 1290, BIF: 2860, DJF: 178, ERN: 15, SCR: 13.5,
      MGA: 4500, ZWL: 322, CUP: 24, HTG: 132, BMD: 1, KYD: 0.83, AWG: 1.79, ANG: 1.79,
      GYD: 209, SRD: 36.5, BND: 1.34, KHR: 4100, LAK: 20600, MOP: 8.05, TJS: 10.9, KGS: 89.5,
      TMT: 3.50, AFN: 72, IRR: 42000, IQD: 1310, LBP: 89500, SYP: 13000, YER: 250, LSL: 18.6,
      SZL: 18.6, FKP: 0.79, GIP: 0.79, SHP: 0.79, NIS: 3.72
    },
    names: {
      USD: ['US Dollar', '$'], EUR: ['Euro', '€'], GBP: ['British Pound', '£'], JPY: ['Japanese Yen', '¥'],
      CNY: ['Chinese Yuan', '¥'], INR: ['Indian Rupee', '₹'], AUD: ['Australian Dollar', 'A$'],
      CAD: ['Canadian Dollar', 'C$'], CHF: ['Swiss Franc', 'CHF'], HKD: ['Hong Kong Dollar', 'HK$'],
      SGD: ['Singapore Dollar', 'S$'], NZD: ['New Zealand Dollar', 'NZ$'], SEK: ['Swedish Krona', 'kr'],
      NOK: ['Norwegian Krone', 'kr'], DKK: ['Danish Krone', 'kr'], PLN: ['Polish Złoty', 'zł'],
      CZK: ['Czech Koruna', 'Kč'], HUF: ['Hungarian Forint', 'Ft'], RON: ['Romanian Leu', 'lei'],
      BGN: ['Bulgarian Lev', 'лв'], ISK: ['Icelandic Króna', 'kr'], RUB: ['Russian Ruble', '₽'],
      TRY: ['Turkish Lira', '₺'], UAH: ['Ukrainian Hryvnia', '₴'], ILS: ['Israeli New Shekel', '₪'],
      AED: ['UAE Dirham', 'د.إ'], SAR: ['Saudi Riyal', '﷼'], QAR: ['Qatari Riyal', '﷼'],
      KWD: ['Kuwaiti Dinar', 'د.ك'], BHD: ['Bahraini Dinar', 'د.ب'], OMR: ['Omani Rial', '﷼'],
      JOD: ['Jordanian Dinar', 'د.ا'], EGP: ['Egyptian Pound', 'E£'], ZAR: ['South African Rand', 'R'],
      NGN: ['Nigerian Naira', '₦'], KES: ['Kenyan Shilling', 'KSh'], GHS: ['Ghanaian Cedi', '₵'],
      MAD: ['Moroccan Dirham', 'د.م.'], TND: ['Tunisian Dinar', 'د.ت'], DZD: ['Algerian Dinar', 'د.ج'],
      ETB: ['Ethiopian Birr', 'Br'], UGX: ['Ugandan Shilling', 'USh'], TZS: ['Tanzanian Shilling', 'TSh'],
      XOF: ['West African CFA Franc', 'CFA'], XAF: ['Central African CFA Franc', 'FCFA'],
      PKR: ['Pakistani Rupee', '₨'], BDT: ['Bangladeshi Taka', '৳'], LKR: ['Sri Lankan Rupee', '₨'],
      NPR: ['Nepalese Rupee', '₨'], BTN: ['Bhutanese Ngultrum', 'Nu.'], MMK: ['Myanmar Kyat', 'K'],
      THB: ['Thai Baht', '฿'], MYR: ['Malaysian Ringgit', 'RM'], IDR: ['Indonesian Rupiah', 'Rp'],
      PHP: ['Philippine Peso', '₱'], VND: ['Vietnamese Đồng', '₫'], KRW: ['South Korean Won', '₩'],
      TWD: ['New Taiwan Dollar', 'NT$'], MNT: ['Mongolian Tögrög', '₮'], KZT: ['Kazakhstani Tenge', '₸'],
      UZS: ['Uzbekistani Som', "so'm"], AZN: ['Azerbaijani Manat', '₼'], GEL: ['Georgian Lari', '₾'],
      AMD: ['Armenian Dram', '֏'], BYN: ['Belarusian Ruble', 'Br'], MDL: ['Moldovan Leu', 'L'],
      RSD: ['Serbian Dinar', 'дин'], MKD: ['Macedonian Denar', 'ден'], ALL: ['Albanian Lek', 'L'],
      BAM: ['Bosnia-Herzegovina Mark', 'KM'], MXN: ['Mexican Peso', '$'], BRL: ['Brazilian Real', 'R$'],
      ARS: ['Argentine Peso', '$'], CLP: ['Chilean Peso', '$'], COP: ['Colombian Peso', '$'],
      PEN: ['Peruvian Sol', 'S/'], UYU: ['Uruguayan Peso', '$U'], BOB: ['Bolivian Boliviano', 'Bs'],
      PYG: ['Paraguayan Guaraní', '₲'], VES: ['Venezuelan Bolívar', 'Bs.S'], CRC: ['Costa Rican Colón', '₡'],
      GTQ: ['Guatemalan Quetzal', 'Q'], HNL: ['Honduran Lempira', 'L'], NIO: ['Nicaraguan Córdoba', 'C$'],
      PAB: ['Panamanian Balboa', 'B/.'], DOP: ['Dominican Peso', 'RD$'], JMD: ['Jamaican Dollar', 'J$'],
      TTD: ['Trinidad & Tobago Dollar', 'TT$'], BSD: ['Bahamian Dollar', 'B$'], BBD: ['Barbadian Dollar', 'Bds$'],
      BZD: ['Belize Dollar', 'BZ$'], XCD: ['East Caribbean Dollar', 'EC$'], FJD: ['Fijian Dollar', 'FJ$'],
      PGK: ['Papua New Guinean Kina', 'K'], WST: ['Samoan Tālā', 'WS$'], TOP: ['Tongan Paʻanga', 'T$'],
      VUV: ['Vanuatu Vatu', 'VT'], SBD: ['Solomon Islands Dollar', 'SI$'], MUR: ['Mauritian Rupee', '₨'],
      MVR: ['Maldivian Rufiyaa', 'Rf'], BWP: ['Botswana Pula', 'P'], NAD: ['Namibian Dollar', 'N$'],
      ZMW: ['Zambian Kwacha', 'ZK'], MWK: ['Malawian Kwacha', 'MK'], MZN: ['Mozambican Metical', 'MT'],
      AOA: ['Angolan Kwanza', 'Kz'], CDF: ['Congolese Franc', 'FC'], XPF: ['CFP Franc', '₣'],
      GMD: ['Gambian Dalasi', 'D'], GNF: ['Guinean Franc', 'FG'], LRD: ['Liberian Dollar', 'L$'],
      SLE: ['Sierra Leonean Leone', 'Le'], SDG: ['Sudanese Pound', 'ج.س'], SSP: ['South Sudanese Pound', '£'],
      SOS: ['Somali Shilling', 'Sh'], RWF: ['Rwandan Franc', 'FRw'], BIF: ['Burundian Franc', 'FBu'],
      DJF: ['Djiboutian Franc', 'Fdj'], ERN: ['Eritrean Nakfa', 'Nfk'], SCR: ['Seychellois Rupee', '₨'],
      MGA: ['Malagasy Ariary', 'Ar'], ZWL: ['Zimbabwean Dollar', 'Z$'], CUP: ['Cuban Peso', '$'],
      HTG: ['Haitian Gourde', 'G'], BMD: ['Bermudian Dollar', 'BD$'], KYD: ['Cayman Islands Dollar', 'CI$'],
      AWG: ['Aruban Florin', 'ƒ'], ANG: ['Netherlands Antillean Guilder', 'ƒ'], GYD: ['Guyanese Dollar', 'G$'],
      SRD: ['Surinamese Dollar', '$'], BND: ['Brunei Dollar', 'B$'], KHR: ['Cambodian Riel', '៛'],
      LAK: ['Lao Kip', '₭'], MOP: ['Macanese Pataca', 'MOP$'], TJS: ['Tajikistani Somoni', 'SM'],
      KGS: ['Kyrgyzstani Som', 'сом'], TMT: ['Turkmenistan Manat', 'm'], AFN: ['Afghan Afghani', '؋'],
      IRR: ['Iranian Rial', '﷼'], IQD: ['Iraqi Dinar', 'ع.د'], LBP: ['Lebanese Pound', 'ل.ل'],
      SYP: ['Syrian Pound', '£S'], YER: ['Yemeni Rial', '﷼'], LSL: ['Lesotho Loti', 'L'],
      SZL: ['Swazi Lilangeni', 'E'], FKP: ['Falkland Islands Pound', '£'], GIP: ['Gibraltar Pound', '£'],
      SHP: ['Saint Helena Pound', '£'], NIS: ['Israeli New Shekel', '₪']
    }
  };

  /* Cryptocurrencies: CoinGecko ids + bundled USD reference prices. */
  OC.CRYPTO_SEED = {
    note: 'Bundled reference prices in USD — replaced by live CoinGecko prices when online.',
    coins: [
      { id: 'bitcoin', sym: 'BTC', name: 'Bitcoin', price: 67000 },
      { id: 'ethereum', sym: 'ETH', name: 'Ethereum', price: 3300 },
      { id: 'tether', sym: 'USDT', name: 'Tether', price: 1.0 },
      { id: 'binancecoin', sym: 'BNB', name: 'BNB', price: 580 },
      { id: 'solana', sym: 'SOL', name: 'Solana', price: 165 },
      { id: 'ripple', sym: 'XRP', name: 'XRP', price: 0.62 },
      { id: 'cardano', sym: 'ADA', name: 'Cardano', price: 0.46 },
      { id: 'dogecoin', sym: 'DOGE', name: 'Dogecoin', price: 0.13 },
      { id: 'tron', sym: 'TRX', name: 'TRON', price: 0.12 },
      { id: 'polkadot', sym: 'DOT', name: 'Polkadot', price: 6.8 },
      { id: 'chainlink', sym: 'LINK', name: 'Chainlink', price: 15.5 },
      { id: 'litecoin', sym: 'LTC', name: 'Litecoin', price: 84 },
      { id: 'avalanche-2', sym: 'AVAX', name: 'Avalanche', price: 32 },
      { id: 'stellar', sym: 'XLM', name: 'Stellar', price: 0.12 },
      { id: 'cosmos', sym: 'ATOM', name: 'Cosmos', price: 8.6 },
      { id: 'algorand', sym: 'ALGO', name: 'Algorand', price: 0.19 },
      { id: 'uniswap', sym: 'UNI', name: 'Uniswap', price: 9.5 },
      { id: 'matic-network', sym: 'POL', name: 'Polygon (POL)', price: 0.62 },
      { id: 'near', sym: 'NEAR', name: 'NEAR Protocol', price: 5.4 },
      { id: 'filecoin', sym: 'FIL', name: 'Filecoin', price: 5.6 },
      { id: 'aptos', sym: 'APT', name: 'Aptos', price: 8.5 },
      { id: 'arbitrum', sym: 'ARB', name: 'Arbitrum', price: 1.05 },
      { id: 'optimism', sym: 'OP', name: 'Optimism', price: 2.1 },
      { id: 'sui', sym: 'SUI', name: 'Sui', price: 1.25 },
      { id: 'hedera-hashgraph', sym: 'HBAR', name: 'Hedera', price: 0.09 },
      { id: 'internet-computer', sym: 'ICP', name: 'Internet Computer', price: 11 },
      { id: 'vechain', sym: 'VET', name: 'VeChain', price: 0.032 },
      { id: 'shiba-inu', sym: 'SHIB', name: 'Shiba Inu', price: 0.000022 },
      { id: 'pepe', sym: 'PEPE', name: 'Pepe', price: 0.000008 },
      { id: 'monero', sym: 'XMR', name: 'Monero', price: 155 },
      { id: 'bitcoin-cash', sym: 'BCH', name: 'Bitcoin Cash', price: 320 },
      { id: 'ethereum-classic', sym: 'ETC', name: 'Ethereum Classic', price: 26 },
      { id: 'tezos', sym: 'XTZ', name: 'Tezos', price: 0.95 },
      { id: 'eos', sym: 'EOS', name: 'EOS', price: 0.72 },
      { id: 'flow', sym: 'FLOW', name: 'Flow', price: 0.85 },
      { id: 'aave', sym: 'AAVE', name: 'Aave', price: 90 },
      { id: 'maker', sym: 'MKR', name: 'Maker', price: 2300 },
      { id: 'render-token', sym: 'RNDR', name: 'Render', price: 7.5 },
      { id: 'immutable-x', sym: 'IMX', name: 'Immutable', price: 2.2 },
      { id: 'injective-protocol', sym: 'INJ', name: 'Injective', price: 24 },
      { id: 'celestia', sym: 'TIA', name: 'Celestia', price: 9 },
      { id: 'sei-network', sym: 'SEI', name: 'Sei', price: 0.45 },
      { id: 'kaspa', sym: 'KAS', name: 'Kaspa', price: 0.11 },
      { id: 'blockstack', sym: 'STX', name: 'Stacks', price: 1.6 },
      { id: 'theta-token', sym: 'THETA', name: 'Theta Network', price: 1.3 },
      { id: 'the-sandbox', sym: 'SAND', name: 'The Sandbox', price: 0.38 },
      { id: 'decentraland', sym: 'MANA', name: 'Decentraland', price: 0.40 },
      { id: 'axie-infinity', sym: 'AXS', name: 'Axie Infinity', price: 6.5 },
      { id: 'curve-dao-token', sym: 'CRV', name: 'Curve DAO', price: 0.45 },
      { id: 'gala', sym: 'GALA', name: 'Gala', price: 0.04 }
    ]
  };

  /* Precious metals — USD per troy ounce reference seed. */
  OC.METALS = {
    note: 'Reference spot prices (USD per troy ounce). Edit prices to match your own source — edits are saved locally.',
    metals: [
      { id: 'XAU', name: 'Gold', price: 2350 },
      { id: 'XAG', name: 'Silver', price: 28 },
      { id: 'XPT', name: 'Platinum', price: 950 },
      { id: 'XPD', name: 'Palladium', price: 1050 }
    ]
  };

  /* Pre-Euro national currencies: exact legal irrevocable conversion rates to EUR. */
  OC.LEGACY_EUR = [
    { code: 'DEM', name: 'Deutsche Mark (Germany)', rate: 1.95583 },
    { code: 'FRF', name: 'French Franc (France)', rate: 6.55957 },
    { code: 'ITL', name: 'Italian Lira (Italy)', rate: 1936.27 },
    { code: 'ESP', name: 'Spanish Peseta (Spain)', rate: 166.386 },
    { code: 'NLG', name: 'Dutch Guilder (Netherlands)', rate: 2.20371 },
    { code: 'BEF', name: 'Belgian Franc (Belgium)', rate: 40.3399 },
    { code: 'ATS', name: 'Austrian Schilling (Austria)', rate: 13.7603 },
    { code: 'IEP', name: 'Irish Pound (Ireland)', rate: 0.787564 },
    { code: 'PTE', name: 'Portuguese Escudo (Portugal)', rate: 200.482 },
    { code: 'FIM', name: 'Finnish Markka (Finland)', rate: 5.94573 },
    { code: 'GRD', name: 'Greek Drachma (Greece)', rate: 340.750 },
    { code: 'LUF', name: 'Luxembourg Franc (Luxembourg)', rate: 40.3399 },
    { code: 'SIT', name: 'Slovenian Tolar (Slovenia)', rate: 239.640 },
    { code: 'SKK', name: 'Slovak Koruna (Slovakia)', rate: 30.1260 },
    { code: 'MTL', name: 'Maltese Lira (Malta)', rate: 0.429300 },
    { code: 'CYP', name: 'Cypriot Pound (Cyprus)', rate: 0.585274 },
    { code: 'EEK', name: 'Estonian Kroon (Estonia)', rate: 15.6466 },
    { code: 'LVL', name: 'Latvian Lats (Latvia)', rate: 0.702804 },
    { code: 'LTL', name: 'Lithuanian Litas (Lithuania)', rate: 3.45280 },
    { code: 'HRK', name: 'Croatian Kuna (Croatia)', rate: 7.53450 }
  ];
})();
