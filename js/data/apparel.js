/* OmniCalc - data/apparel.js
   Footwear, clothing, ring and hat size charts (US / UK / EU / JP / cm). */

(function () {
  'use strict';

  OC.APPAREL = {
    shoes: {
      men: [
        { us: 6, uk: 5.5, eu: 38.5, jp: 24 },
        { us: 6.5, uk: 6, eu: 39, jp: 24.5 },
        { us: 7, uk: 6.5, eu: 40, jp: 25 },
        { us: 7.5, uk: 7, eu: 40.5, jp: 25.5 },
        { us: 8, uk: 7.5, eu: 41, jp: 26 },
        { us: 8.5, uk: 8, eu: 42, jp: 26.5 },
        { us: 9, uk: 8.5, eu: 42.5, jp: 27 },
        { us: 9.5, uk: 9, eu: 43, jp: 27.5 },
        { us: 10, uk: 9.5, eu: 44, jp: 28 },
        { us: 10.5, uk: 10, eu: 44.5, jp: 28.5 },
        { us: 11, uk: 10.5, eu: 45, jp: 29 },
        { us: 11.5, uk: 11, eu: 45.5, jp: 29.5 },
        { us: 12, uk: 11.5, eu: 46, jp: 30 },
        { us: 12.5, uk: 12, eu: 47, jp: 30.5 },
        { us: 13, uk: 12.5, eu: 47.5, jp: 31 },
        { us: 14, uk: 13.5, eu: 48.5, jp: 32 }
      ],
      women: [
        { us: 5, uk: 2.5, eu: 35.5, jp: 22 },
        { us: 5.5, uk: 3, eu: 36, jp: 22.5 },
        { us: 6, uk: 3.5, eu: 36.5, jp: 23 },
        { us: 6.5, uk: 4, eu: 37, jp: 23.5 },
        { us: 7, uk: 4.5, eu: 37.5, jp: 24 },
        { us: 7.5, uk: 5, eu: 38, jp: 24 },
        { us: 8, uk: 5.5, eu: 38.5, jp: 24.5 },
        { us: 8.5, uk: 6, eu: 39, jp: 25 },
        { us: 9, uk: 6.5, eu: 39.5, jp: 25.5 },
        { us: 9.5, uk: 7, eu: 40, jp: 26 },
        { us: 10, uk: 7.5, eu: 40.5, jp: 26.5 },
        { us: 10.5, uk: 8, eu: 41, jp: 27 },
        { us: 11, uk: 8.5, eu: 41.5, jp: 27.5 },
        { us: 12, uk: 9.5, eu: 42.5, jp: 28.5 }
      ],
      kids: [
        { us: 8, uk: 7.5, eu: 24, jp: 14.5 },
        { us: 9, uk: 8.5, eu: 25, jp: 15.5 },
        { us: 10, uk: 9.5, eu: 27, jp: 16.5 },
        { us: 11, uk: 10.5, eu: 28, jp: 17.5 },
        { us: 12, uk: 11.5, eu: 29.5, jp: 18.5 },
        { us: 13, uk: 12.5, eu: 31, jp: 19.5 },
        { us: 1, uk: 13.5, eu: 32, jp: 20 },
        { us: 2, uk: 1.5, eu: 33.5, jp: 21 },
        { us: 3, uk: 2.5, eu: 35, jp: 22 },
        { us: 4, uk: 3.5, eu: 36, jp: 23 },
        { us: 5, uk: 4.5, eu: 37, jp: 24 },
        { us: 6, uk: 5.5, eu: 38, jp: 25 },
        { us: 7, uk: 6.5, eu: 39, jp: 26 }
      ]
    },

    clothing: {
      women: [
        { intl: 'XS', us: '0 – 2', uk: '4', eu: '32', bust: '76 – 81 cm', waist: '58 – 63 cm' },
        { intl: 'S', us: '4 – 6', uk: '8', eu: '34 – 36', bust: '81 – 86 cm', waist: '63 – 69 cm' },
        { intl: 'M', us: '8 – 10', uk: '12', eu: '38 – 40', bust: '86 – 91 cm', waist: '69 – 74 cm' },
        { intl: 'L', us: '12 – 14', uk: '16', eu: '42 – 44', bust: '91 – 97 cm', waist: '74 – 81 cm' },
        { intl: 'XL', us: '16 – 18', uk: '20', eu: '46 – 48', bust: '97 – 104 cm', waist: '81 – 89 cm' },
        { intl: 'XXL', us: '20 – 22', uk: '24', eu: '50 – 52', bust: '104 – 112 cm', waist: '89 – 97 cm' },
        { intl: 'XXXL', us: '24 – 26', uk: '28', eu: '54 – 56', bust: '112 – 120 cm', waist: '97 – 105 cm' }
      ],
      men: [
        { intl: 'XS', us: '30 – 32', uk: '30 – 32', eu: '40 – 42', chest: '81 – 86 cm', waist: '66 – 71 cm' },
        { intl: 'S', us: '34 – 36', uk: '34 – 36', eu: '44 – 46', chest: '86 – 91 cm', waist: '71 – 76 cm' },
        { intl: 'M', us: '38 – 40', uk: '38 – 40', eu: '48 – 50', chest: '91 – 97 cm', waist: '76 – 81 cm' },
        { intl: 'L', us: '42 – 44', uk: '42 – 44', eu: '52 – 54', chest: '97 – 104 cm', waist: '81 – 86 cm' },
        { intl: 'XL', us: '46 – 48', uk: '46 – 48', eu: '56 – 58', chest: '104 – 112 cm', waist: '86 – 94 cm' },
        { intl: 'XXL', us: '50 – 52', uk: '50 – 52', eu: '60 – 62', chest: '112 – 119 cm', waist: '94 – 102 cm' },
        { intl: 'XXXL', us: '54 – 56', uk: '54 – 56', eu: '64 – 66', chest: '119 – 127 cm', waist: '102 – 110 cm' }
      ]
    },

    rings: [
      { us: 4, uk: 'H', eu: 46.8, diameterMm: 14.9 },
      { us: 5, uk: 'J½', eu: 49.3, diameterMm: 15.7 },
      { us: 6, uk: 'L½', eu: 51.9, diameterMm: 16.5 },
      { us: 7, uk: 'O½', eu: 54.4, diameterMm: 17.3 },
      { us: 8, uk: 'Q½', eu: 57.0, diameterMm: 18.1 },
      { us: 9, uk: 'S½', eu: 59.5, diameterMm: 18.9 },
      { us: 10, uk: 'U½', eu: 62.1, diameterMm: 19.8 },
      { us: 11, uk: 'W½', eu: 64.6, diameterMm: 20.6 },
      { us: 12, uk: 'Y½', eu: 67.2, diameterMm: 21.4 },
      { us: 13, uk: 'Z½', eu: 69.7, diameterMm: 22.2 }
    ],

    hats: [
      { size: 'XS', us: '6⅝', cm: 53, inches: 20.9 },
      { size: 'S', us: '6¾ – 7', cm: 55, inches: 21.6 },
      { size: 'M', us: '7⅛ – 7¼', cm: 57, inches: 22.4 },
      { size: 'L', us: '7⅜ – 7½', cm: 59, inches: 23.2 },
      { size: 'XL', us: '7⅝ – 7¾', cm: 61, inches: 24.0 },
      { size: 'XXL', us: '7⅞ – 8', cm: 63, inches: 24.8 }
    ]
  };
})();
