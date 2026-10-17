/* OmniCalc - tools/culinary.js
   Cooking: volume <-> weight with ingredient densities, oven temperatures, recipe scaler. */

(function () {
  'use strict';

  var VOLUME_UNITS = [
    { id: 'cup', label: 'US cups', ml: 236.5882365 },
    { id: 'tbsp', label: 'US tablespoons', ml: 14.78676478125 },
    { id: 'tsp', label: 'US teaspoons', ml: 4.92892159375 },
    { id: 'floz', label: 'US fluid ounces', ml: 29.5735295625 },
    { id: 'pint', label: 'US pints', ml: 473.176473 },
    { id: 'quart', label: 'US quarts', ml: 946.352946 },
    { id: 'gallon', label: 'US gallons', ml: 3785.411784 },
    { id: 'ml', label: 'Millilitres', ml: 1 },
    { id: 'l', label: 'Litres', ml: 1000 }
  ];

  function ingredientById(id) {
    return OC.INGREDIENTS.filter(function (i) { return i.id === id; })[0];
  }

  function ingredientOptions(selected) {
    return OC.INGREDIENTS.map(function (i) {
      return '<option value="' + i.id + '"' + (i.id === selected ? ' selected' : '') + '>' + OC.esc(i.name) + '</option>';
    }).join('');
  }

  function renderCulinary(el) {
    var TABS = [
      { id: 'ingredient', label: 'Ingredient amounts', icon: 'restaurant' },
      { id: 'oven', label: 'Oven temperatures', icon: 'thermostat' },
      { id: 'scaler', label: 'Recipe scaler', icon: 'calculate' }
    ];

    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Converters',
      title: 'Cooking & Culinary',
      icon: 'restaurant',
      desc: 'Volume-to-weight conversions with a built-in ingredient density database, oven temperature chart and recipe scaler.',
      routeId: 'culinary'
    }) + OC.ui.tabsHTML(TABS, 'ingredient') +
      TABS.map(function (t) { return '<div id="cu-' + t.id + '" style="' + (t.id === 'ingredient' ? '' : 'display:none') + '"></div>'; }).join(''));

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) { OC.qs('#cu-' + t.id, page).style.display = t.id === id ? '' : 'none'; });
    });

    renderIngredient(OC.qs('#cu-ingredient', page));
    renderOven(OC.qs('#cu-oven', page));
    renderScaler(OC.qs('#cu-scaler', page));
  }

  /* ---------------- ingredient converter ---------------- */

  function renderIngredient(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="row mb-2">' +
      '    <button class="chip active" id="ciModeVol" type="button">Volume → Weight</button>' +
      '    <button class="chip" id="ciModeWt" type="button">Weight → Volume</button>' +
      '  </div>' +
      '  <div class="conv-row">' +
      '    <input class="input mono" id="ciAmount" inputmode="decimal" value="1">' +
      '    <select class="select" id="ciUnit"></select>' +
      '  </div>' +
      '  <div class="field mt-2"><label for="ciIngredient">Ingredient</label><select class="select" id="ciIngredient">' + ingredientOptions('all-purpose-flour') + '</select></div>' +
      '  <div class="result-hero mt-3"><div class="label" id="ciResultLabel">Weight</div><div class="value" id="ciOut">—</div></div>' +
      '  <div class="other-units">' +
      '    <div class="other-units-title">Same amount across other measures</div>' +
      '    <div id="ciTable"></div>' +
      '  </div>' +
      '</div>';

    var mode = 'vol';
    var amount = OC.qs('#ciAmount', root);
    var unitSel = OC.qs('#ciUnit', root);
    var ingSel = OC.qs('#ciIngredient', root);
    var out = OC.qs('#ciOut', root);
    var outLabel = OC.qs('#ciResultLabel', root);
    var table = OC.qs('#ciTable', root);
    var btnVol = OC.qs('#ciModeVol', root);
    var btnWt = OC.qs('#ciModeWt', root);

    function fillUnits() {
      if (mode === 'vol') {
        unitSel.innerHTML = VOLUME_UNITS.map(function (u) {
          return '<option value="' + u.id + '"' + (u.id === 'cup' ? ' selected' : '') + '>' + u.label + '</option>';
        }).join('');
      } else {
        unitSel.innerHTML = ['g', 'kg', 'oz', 'lb'].map(function (u) {
          var labels = { g: 'Grams', kg: 'Kilograms', oz: 'Ounces', lb: 'Pounds' };
          return '<option value="' + u + '"' + (u === 'g' ? ' selected' : '') + '>' + labels[u] + '</option>';
        }).join('');
      }
    }

    function weightToGrams(v, u) {
      if (u === 'g') return v;
      if (u === 'kg') return v * 1000;
      if (u === 'oz') return v * 28.349523125;
      if (u === 'lb') return v * 453.59237;
      return NaN;
    }

    function update() {
      var v = OC.parseNum(amount.value);
      var ing = ingredientById(ingSel.value);
      if (!isFinite(v) || !ing) { out.textContent = '—'; table.innerHTML = ''; return; }
      var gPerMl = ing.gPerCup / 236.5882365;

      var rows = [];
      if (mode === 'vol') {
        var volUnit = VOLUME_UNITS.filter(function (u) { return u.id === unitSel.value; })[0];
        var ml = v * volUnit.ml;
        var grams = ml * gPerMl;
        outLabel.textContent = 'Weight';
        out.textContent = OC.formatNumber(grams, { decimals: 'auto' }) + ' g';
        rows = [
          ['Grams', OC.formatNumber(grams, { decimals: 'auto' }) + ' g'],
          ['Kilograms', OC.formatNumber(grams / 1000, { decimals: 'auto' }) + ' kg'],
          ['Ounces', OC.formatNumber(grams / 28.349523125, { decimals: 'auto' }) + ' oz'],
          ['Pounds', OC.formatNumber(grams / 453.59237, { decimals: 'auto' }) + ' lb'],
          ['US cups', OC.formatNumber(ml / 236.5882365, { decimals: 'auto' })],
          ['Tablespoons', OC.formatNumber(ml / 14.78676478125, { decimals: 'auto' })],
          ['Teaspoons', OC.formatNumber(ml / 4.92892159375, { decimals: 'auto' })],
          ['Millilitres', OC.formatNumber(ml, { decimals: 'auto' }) + ' mL']
        ];
      } else {
        var grams2 = weightToGrams(v, unitSel.value);
        var ml2 = grams2 / gPerMl;
        outLabel.textContent = 'Volume';
        out.textContent = OC.formatNumber(ml2 / 236.5882365, { decimals: 'auto' }) + ' cups (' +
          OC.formatNumber(ml2 / 14.78676478125, { decimals: 'auto' }) + ' tbsp)';
        rows = [
          ['US cups', OC.formatNumber(ml2 / 236.5882365, { decimals: 'auto' })],
          ['Tablespoons', OC.formatNumber(ml2 / 14.78676478125, { decimals: 'auto' })],
          ['Teaspoons', OC.formatNumber(ml2 / 4.92892159375, { decimals: 'auto' })],
          ['Millilitres', OC.formatNumber(ml2, { decimals: 'auto' }) + ' mL'],
          ['Fluid ounces', OC.formatNumber(ml2 / 29.5735295625, { decimals: 'auto' })]
        ];
      }

      table.innerHTML = rows.map(function (r) {
        return '<div class="unit-row"><span class="unit-row-name">' + r[0] + '</span><span class="unit-row-value">' + r[1] + '</span></div>';
      }).join('');
    }

    btnVol.addEventListener('click', function () {
      mode = 'vol'; btnVol.classList.add('active'); btnWt.classList.remove('active');
      fillUnits(); update();
    });
    btnWt.addEventListener('click', function () {
      mode = 'wt'; btnWt.classList.add('active'); btnVol.classList.remove('active');
      fillUnits(); update();
    });
    amount.addEventListener('input', update);
    unitSel.addEventListener('change', update);
    ingSel.addEventListener('change', update);

    fillUnits();
    update();
  }

  /* ---------------- oven temperatures ---------------- */

  function renderOven(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="conv-row">' +
      '    <input class="input mono" id="ovTemp" inputmode="decimal" value="180">' +
      '    <select class="select" id="ovUnit"><option value="c">Celsius (°C)</option><option value="f">Fahrenheit (°F)</option><option value="gas">Gas mark</option></select>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Converted temperature</div><div class="value" id="ovOut">—</div></div>' +
      '  <div class="table-wrap"><table class="data-table" id="ovTable"><thead><tr><th>Gas mark</th><th class="num">°C</th><th class="num">°F</th></tr></thead><tbody></tbody></table></div>' +
      '</div>';

    var temp = OC.qs('#ovTemp', root);
    var unit = OC.qs('#ovUnit', root);
    var out = OC.qs('#ovOut', root);
    var tbody = OC.qs('#ovTable tbody', root);

    function nearestGas(c) {
      var best = OC.OVEN_TEMPS[0], bestD = Infinity;
      OC.OVEN_TEMPS.forEach(function (g) {
        var d = Math.abs(g.c - c);
        if (d < bestD) { bestD = d; best = g; }
      });
      return best;
    }

    function update() {
      var v = OC.parseNum(temp.value);
      if (!isFinite(v)) { out.textContent = '—'; return; }
      var c, f, gas;
      if (unit.value === 'c') { c = v; f = v * 9 / 5 + 32; }
      else if (unit.value === 'f') { f = v; c = (v - 32) * 5 / 9; }
      else { gas = v; var g = OC.OVEN_TEMPS.filter(function (x) { return Math.abs(parseFloat(x.gas) - v) < 0.01 || x.gas === String(v); })[0] || nearestGas(NaN); c = g.c; f = g.f; }
      var g2 = nearestGas(c);
      out.textContent = OC.formatNumber(c, { decimals: 0 }) + ' °C  ·  ' + OC.formatNumber(f, { decimals: 0 }) + ' °F  ·  gas mark ' + g2.gas;
      tbody.innerHTML = OC.OVEN_TEMPS.map(function (row) {
        var hl = row === g2 ? ' class="highlight-row"' : '';
        return '<tr' + hl + '><td>' + row.gas + '</td><td class="num">' + row.c + '</td><td class="num">' + row.f + '</td></tr>';
      }).join('');
    }

    temp.addEventListener('input', update);
    unit.addEventListener('change', update);
    update();
  }

  /* ---------------- recipe scaler ---------------- */

  function renderScaler(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="rsQty">Quantity in recipe</label><input class="input mono" id="rsQty" inputmode="decimal" value="1.5"></div>' +
      '    <div class="field"><label for="rsFrom">Recipe serves</label><input class="input mono" id="rsFrom" inputmode="numeric" value="4"></div>' +
      '    <div class="field"><label for="rsTo">You want to serve</label><input class="input mono" id="rsTo" inputmode="numeric" value="6"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Scaled quantity</div><div class="value" id="rsOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Scale factor</span><span class="kv-val" id="rsFactor">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Common measures at this factor</span><span class="kv-val" id="rsCommon">—</span></div>' +
      '  </div>' +
      '<p class="keypad-hint">Tip: for baking, prefer weight (see Ingredient amounts) — volume scaling gets imprecise fast.</p>' +
      '</div>';

    var qty = OC.qs('#rsQty', root), from = OC.qs('#rsFrom', root), to = OC.qs('#rsTo', root);

    function update() {
      var q = OC.parseNum(qty.value), f = OC.parseNum(from.value), t = OC.parseNum(to.value);
      if (![q, f, t].every(isFinite) || f <= 0 || t <= 0) { liveOut(root, 'rsOut').textContent = '—'; return; }
      var factor = t / f;
      liveOut(root, 'rsOut').textContent = OC.formatNumber(q * factor, { decimals: 'auto' });
      liveOut(root, 'rsFactor').textContent = '× ' + OC.formatNumber(factor, { decimals: 'auto' });
      liveOut(root, 'rsCommon').textContent = '1 cup → ' + OC.formatNumber(factor, { decimals: 2 }) + ' cup · 1 tbsp → ' +
        OC.formatNumber(factor, { decimals: 2 }) + ' tbsp';
    }

    [qty, from, to].forEach(function (n) { n.addEventListener('input', update); });
    update();
  }

  function liveOut(root, id) { return OC.qs('#' + id, root); }

  OC.registerCulinaryTools = function () {
    OC.registerRoute({
      id: 'culinary',
      name: 'Cooking & Culinary',
      icon: 'restaurant',
      group: 'convert',
      desc: 'Ingredient densities, oven temps, recipe scaling.',
      keywords: 'cooking recipe cup gram flour sugar butter oven gas mark scale serving kitchen',
      render: renderCulinary
    });
  };
})();
