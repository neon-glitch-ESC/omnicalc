/* OmniCalc - data/culinary.js
   Ingredient densities (grams per US cup) + oven temperature chart. */

(function () {
  'use strict';

  /* gramsPerCup values follow common USDA / King Arthur style references.
     gramsPerTbsp / gramsPerTsp are derived (16 and 48 per cup) unless stated. */
  OC.INGREDIENTS = [
    { id: 'water', name: 'Water', gPerCup: 237 },
    { id: 'milk', name: 'Milk', gPerCup: 244 },
    { id: 'heavy-cream', name: 'Heavy cream', gPerCup: 238 },
    { id: 'sour-cream', name: 'Sour cream', gPerCup: 242 },
    { id: 'yogurt', name: 'Yogurt (plain)', gPerCup: 245 },
    { id: 'butter', name: 'Butter (melted)', gPerCup: 227 },
    { id: 'vegetable-oil', name: 'Vegetable oil', gPerCup: 218 },
    { id: 'olive-oil', name: 'Olive oil', gPerCup: 216 },
    { id: 'honey', name: 'Honey', gPerCup: 340 },
    { id: 'maple-syrup', name: 'Maple syrup', gPerCup: 322 },
    { id: 'molasses', name: 'Molasses', gPerCup: 337 },
    { id: 'corn-syrup', name: 'Corn syrup', gPerCup: 328 },
    { id: 'all-purpose-flour', name: 'All-purpose flour', gPerCup: 120 },
    { id: 'whole-wheat-flour', name: 'Whole-wheat flour', gPerCup: 120 },
    { id: 'bread-flour', name: 'Bread flour', gPerCup: 120 },
    { id: 'cake-flour', name: 'Cake flour', gPerCup: 114 },
    { id: 'granulated-sugar', name: 'Granulated sugar', gPerCup: 200 },
    { id: 'brown-sugar', name: 'Brown sugar (packed)', gPerCup: 213 },
    { id: 'powdered-sugar', name: 'Powdered sugar', gPerCup: 120 },
    { id: 'cocoa-powder', name: 'Cocoa powder', gPerCup: 85 },
    { id: 'cornstarch', name: 'Cornstarch', gPerCup: 120 },
    { id: 'baking-powder', name: 'Baking powder', gPerCup: 192 },
    { id: 'baking-soda', name: 'Baking soda', gPerCup: 216 },
    { id: 'table-salt', name: 'Table salt', gPerCup: 288, gPerTbsp: 18 },
    { id: 'kosher-salt', name: 'Kosher salt', gPerCup: 145, gPerTbsp: 10 },
    { id: 'rice-uncooked', name: 'Rice (uncooked)', gPerCup: 185 },
    { id: 'rice-cooked', name: 'Rice (cooked)', gPerCup: 205 },
    { id: 'oats', name: 'Rolled oats', gPerCup: 90 },
    { id: 'cornmeal', name: 'Cornmeal', gPerCup: 156 },
    { id: 'breadcrumbs', name: 'Breadcrumbs (dry)', gPerCup: 108 },
    { id: 'peanut-butter', name: 'Peanut butter', gPerCup: 256 },
    { id: 'cream-cheese', name: 'Cream cheese', gPerCup: 232 },
    { id: 'ricotta', name: 'Ricotta', gPerCup: 246 },
    { id: 'parmesan-grated', name: 'Parmesan (grated)', gPerCup: 100 },
    { id: 'cheddar-shredded', name: 'Cheddar (shredded)', gPerCup: 113 },
    { id: 'almonds', name: 'Almonds (whole)', gPerCup: 143 },
    { id: 'walnuts', name: 'Walnuts (chopped)', gPerCup: 117 },
    { id: 'chocolate-chips', name: 'Chocolate chips', gPerCup: 170 },
    { id: 'raisins', name: 'Raisins', gPerCup: 145 },
    { id: 'lentils', name: 'Lentils (dry)', gPerCup: 192 },
    { id: 'black-beans', name: 'Black beans (dry)', gPerCup: 193 }
  ];

  /* Oven temperature chart — gas mark to °C/°F. */
  OC.OVEN_TEMPS = [
    { gas: '¼', c: 110, f: 225 },
    { gas: '½', c: 120, f: 250 },
    { gas: '1', c: 140, f: 275 },
    { gas: '2', c: 150, f: 300 },
    { gas: '3', c: 170, f: 325 },
    { gas: '4', c: 180, f: 350 },
    { gas: '5', c: 190, f: 375 },
    { gas: '6', c: 200, f: 400 },
    { gas: '7', c: 220, f: 425 },
    { gas: '8', c: 230, f: 450 },
    { gas: '9', c: 240, f: 475 },
    { gas: '10', c: 260, f: 500 }
  ];
})();
