/* OmniCalc - converters/generic.js
   Data-driven converter page for every linear / affine / fuel category in OC.UNITS. */

(function () {
  'use strict';

  /* ---------------- conversion core ---------------- */

  function fuelToBase(id, v) {
    switch (id) {
      case 'mpg-us': return v * (1.609344 / 3.785411784);
      case 'mpg-uk': return v * (1.609344 / 4.54609);
      case 'kilometer-per-liter': return v;
      case 'mile-per-liter': return v * 1.609344;
      case 'liter-per-100km': return v === 0 ? Infinity : 100 / v;
      default: return NaN;
    }
  }

  function fuelFromBase(id, base) {
    switch (id) {
      case 'mpg-us': return base / (1.609344 / 3.785411784);
      case 'mpg-uk': return base / (1.609344 / 4.54609);
      case 'kilometer-per-liter': return base;
      case 'mile-per-liter': return base / 1.609344;
      case 'liter-per-100km': return base === 0 ? Infinity : 100 / base;
      default: return NaN;
    }
  }

  OC.convertIn = function (catId, value, fromId, toId) {
    var cat = OC.UNITS[catId];
    if (!cat || !isFinite(value)) return NaN;
    var from = null, to = null;
    cat.units.forEach(function (u) {
      if (u.id === fromId) from = u;
      if (u.id === toId) to = u;
    });
    if (!from || !to) return NaN;

    var base;
    if (cat.type === 'affine') base = (value + from.offset) * from.scale;
    else if (cat.type === 'fuel') base = fuelToBase(from.id, value);
    else base = value * from.toBase;

    if (cat.type === 'affine') return base / to.scale - to.offset;
    if (cat.type === 'fuel') return fuelFromBase(to.id, base);
    return base / to.toBase;
  };

  /* Resolve a loose token ("km", "Kilometers", "kilometer") to a unit id. */
  OC.resolveUnit = function (cat, token) {
    if (!cat || !token) return null;
    var t = String(token).toLowerCase().replace(/[.\s]/g, '');
    var found = null;
    cat.units.forEach(function (u) {
      if (found) return;
      var id = u.id.toLowerCase().replace(/-/g, '');
      var sym = (u.symbol || '').toLowerCase().replace(/[.\s]/g, '');
      var label = u.label.toLowerCase().replace(/[.\s]/g, '');
      if (t === id || t === sym || t === label || id.indexOf(t) === 0 || t.indexOf(id) === 0) found = u.id;
    });
    if (!found) {
      cat.units.forEach(function (u) {
        if (found) return;
        var label = u.label.toLowerCase();
        if (label.indexOf(t) !== -1 || t.indexOf(label) !== -1) found = u.id;
      });
    }
    return found;
  };

  /* Lazy unit alias index for the universal search. */
  OC.unitIndex = function () {
    if (OC._unitIndex) return OC._unitIndex;
    var idx = {};
    var preferred = ['length', 'mass', 'volume', 'area', 'temperature', 'speed', 'time', 'angle',
      'digital', 'transfer', 'pressure', 'energy', 'power', 'force', 'torque', 'fuel', 'typography',
      'viscosity', 'kinematicViscosity', 'flow', 'radiationDose', 'radioactivity', 'historical'];
    preferred.forEach(function (catId) {
      var cat = OC.UNITS[catId];
      if (!cat) return;
      cat.units.forEach(function (u) {
        var keys = [u.id.replace(/-/g, ''), (u.symbol || '').toLowerCase().replace(/[.\s]/g, ''), u.label.toLowerCase().replace(/[.\s]/g, '')];
        keys.forEach(function (k) {
          if (!k) return;
          if (!idx[k]) idx[k] = { cat: catId, unit: u.id };
        });
      });
    });
    /* Single-letter aliases: temperature scales own c/f/k (most common intent). */
    idx['c'] = { cat: 'temperature', unit: 'celsius' };
    idx['°c'] = { cat: 'temperature', unit: 'celsius' };
    idx['f'] = { cat: 'temperature', unit: 'fahrenheit' };
    idx['°f'] = { cat: 'temperature', unit: 'fahrenheit' };
    idx['k'] = { cat: 'temperature', unit: 'kelvin' };
    idx['r'] = { cat: 'temperature', unit: 'rankine' };
    idx['°r'] = { cat: 'temperature', unit: 'rankine' };
    OC._unitIndex = idx;
    return idx;
  };

  /* ---------------- generic page ---------------- */

  OC.registerGenericConverters = function () {
    Object.keys(OC.UNITS).forEach(function (catId) {
      (function (id) {
        var cat = OC.UNITS[id];

        OC.registerRoute({
          id: id,
          name: cat.name,
          icon: cat.icon,
          group: 'convert',
          desc: cat.desc,
          keywords: (cat.keywords || '') + ' converter convert unit',
          render: renderConverter
        });

        function renderConverter(el, params) {
          var page = OC.ui.mount(el,
            OC.ui.pageHead({
              kicker: 'Converter',
              title: cat.name,
              icon: cat.icon,
              desc: OC.esc(cat.desc),
              routeId: id
            }) +
            convCardHTML() +
            (cat.note ? OC.ui.banner('', 'Good to know', OC.esc(cat.note)) : ''));

          var input = OC.qs('#convFrom', page);
          var fromSel = OC.qs('#convFromUnit', page);
          var output = OC.qs('#convTo', page);
          var toSel = OC.qs('#convToUnit', page);
          var others = OC.qs('#convOthers', page);
          var exact = OC.qs('#convExact', page);
          var swapBtn = OC.qs('#convSwap', page);
          var copySlot = OC.qs('#convCopySlot', page);
          copySlot.appendChild(OC.ui.copyBtn(function () { return exact.textContent; }, 'Copy'));

          /* defaults (unit system aware) */
          var s = OC.settings();
          var defFrom = cat.defaultFrom || cat.units[0].id;
          var defTo = (cat.defaultTo || cat.units[1].id);
          if (s.unitSystem === 'imperial' && cat.type === 'linear') {
            var tmp = defFrom; defFrom = defTo; defTo = tmp;
          }

          /* params prefill */
          var value = 1;
          if (params && params.v !== undefined) {
            var pv = OC.parseNum(params.v);
            if (isFinite(pv)) value = pv;
          }
          if (params && params.from) defFrom = OC.resolveUnit(cat, params.from) || defFrom;
          if (params && params.to) defTo = OC.resolveUnit(cat, params.to) || defTo;
          if (defFrom === defTo) defTo = (defTo === cat.units[0].id ? cat.units[1].id : cat.units[0].id);

          input.value = String(value);
          fromSel.innerHTML = OC.ui.unitOptions(cat.units, defFrom);
          toSel.innerHTML = OC.ui.unitOptions(cat.units, defTo);

          function update() {
            var v = OC.parseNum(input.value);
            if (!isFinite(v)) {
              output.value = '—';
              exact.textContent = 'Enter a number to convert';
              renderOthers(NaN);
              return;
            }
            var out = OC.convertIn(id, v, fromSel.value, toSel.value);
            output.value = OC.formatNumber(out, { decimals: 'auto' });
            exact.textContent = OC.formatNumber(v, { decimals: 'auto' }) + ' ' + unitLabel(fromSel.value) +
              '  =  ' + OC.formatNumber(out, { decimals: 'auto' }) + ' ' + unitLabel(toSel.value);
            renderOthers(v);
          }

          function unitLabel(uid) {
            var u = cat.units.filter(function (x) { return x.id === uid; })[0];
            return u ? u.label.replace(/\s*\(.*\)$/, '') : uid;
          }

          function renderOthers(v) {
            if (!isFinite(v)) { others.innerHTML = ''; return; }
            var html = cat.units.map(function (u) {
              if (u.id === toSel.value) return '';
              var out = OC.convertIn(id, v, fromSel.value, u.id);
              var active = u.id === fromSel.value ? ' style="background:var(--lime-soft);"' : '';
              return '<div class="unit-row" data-unit="' + OC.esc(u.id) + '"' + active + ' title="Click to convert into ' + OC.esc(u.label) + '">' +
                '<span class="unit-row-name">' + OC.esc(u.label) + '</span>' +
                '<span class="unit-row-value">' + OC.formatNumber(out, { decimals: 'auto' }) + '</span></div>';
            }).join('');
            others.innerHTML = html;
          }

          input.addEventListener('input', update);
          fromSel.addEventListener('change', update);
          toSel.addEventListener('change', update);

          swapBtn.addEventListener('click', function () {
            var f = fromSel.value;
            fromSel.value = toSel.value;
            toSel.value = f;
            var parsed = OC.parseNum(output.value.replace(/[\s,]/g, ''));
            if (isFinite(parsed)) input.value = String(parsed);
            update();
          });

          others.addEventListener('click', function (e) {
            var row = e.target.closest('.unit-row');
            if (!row) return;
            toSel.value = row.getAttribute('data-unit');
            update();
          });

          update();
        }

        function convCardHTML() {
          return '' +
            '<div class="conv-card">' +
            '  <div class="conv-row">' +
            '    <input type="text" inputmode="decimal" class="input" id="convFrom" value="1" aria-label="Value to convert" autocomplete="off" spellcheck="false">' +
            '    <select class="select" id="convFromUnit" aria-label="Convert from unit"></select>' +
            '  </div>' +
            '  <div class="conv-swap-row">' +
            '    <span class="line"></span>' +
            '    <button class="swap-btn" id="convSwap" type="button" aria-label="Swap units" title="Swap units">' + OC.iconHTML('swap_vert') + '</button>' +
            '    <span class="line"></span>' +
            '  </div>' +
            '  <div class="conv-row">' +
            '    <input type="text" class="input" id="convTo" readonly aria-label="Converted result" aria-live="polite">' +
            '    <select class="select" id="convToUnit" aria-label="Convert to unit"></select>' +
            '  </div>' +
            '  <div class="conv-result-note">' +
            '    <span id="convExact" class="live-result"></span>' +
            '    <span id="convCopySlot"></span>' +
            '  </div>' +
            '  <div class="other-units">' +
            '    <div class="other-units-title">Same value in other units — click a row to make it the target</div>' +
            '    <div id="convOthers"></div>' +
            '  </div>' +
            '</div>';
        }
      })(catId);
    });
  };
})();
