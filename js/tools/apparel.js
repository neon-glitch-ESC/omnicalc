/* OmniCalc - tools/apparel.js
   Apparel & footwear sizing charts with lookup. */

(function () {
  'use strict';

  function tableHTML(headers, rows, highlightFn) {
    return '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      headers.map(function (h) { return '<th>' + h + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      rows.map(function (r, i) {
        var hl = highlightFn && highlightFn(r, i) ? ' class="highlight-row"' : '';
        return '<tr' + hl + '>' + r.map(function (cell) { return '<td>' + cell + '</td>'; }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  function renderApparel(el) {
    var TABS = [
      { id: 'shoes', label: 'Shoes', icon: 'straighten' },
      { id: 'clothing', label: 'Clothing', icon: 'apparel' },
      { id: 'rings', label: 'Rings', icon: 'diamond' },
      { id: 'hats', label: 'Hats', icon: 'architecture' }
    ];

    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Converters',
      title: 'Apparel & Sizing',
      icon: 'apparel',
      desc: 'Shoe, clothing, ring and hat sizes across US, UK, EU and JP systems. Sizes vary by brand — treat these as guidance.',
      routeId: 'apparel'
    }) + OC.ui.tabsHTML(TABS, 'shoes') +
      TABS.map(function (t) { return '<div id="ap-' + t.id + '" style="' + (t.id === 'shoes' ? '' : 'display:none') + '"></div>'; }).join(''));

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) { OC.qs('#ap-' + t.id, page).style.display = t.id === id ? '' : 'none'; });
    });

    renderShoes(OC.qs('#ap-shoes', page));
    renderClothing(OC.qs('#ap-clothing', page));
    renderRings(OC.qs('#ap-rings', page));
    renderHats(OC.qs('#ap-hats', page));
  }

  function renderShoes(root) {
    var group = 'men';
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="row mb-2">' +
      '    <button class="chip active" data-group="men" type="button">Men</button>' +
      '    <button class="chip" data-group="women" type="button">Women</button>' +
      '    <button class="chip" data-group="kids" type="button">Kids</button>' +
      '  </div>' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="shSize">US size</label><select class="select" id="shSize"></select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Size conversions</div><div class="value" id="shOut">—</div></div>' +
      '  <div id="shTable"></div>' +
      '</div>';

    var sizeSel = OC.qs('#shSize', root);
    var out = OC.qs('#shOut', root);
    var tableWrap = OC.qs('#shTable', root);

    function rowFor(r) {
      return [
        'US ' + r.us,
        'UK ' + r.uk,
        'EU ' + r.eu,
        'JP ' + r.jp + ' cm'
      ];
    }

    function update() {
      var rows = OC.APPAREL.shoes[group];
      var sel = rows.filter(function (r) { return String(r.us) === sizeSel.options[sizeSel.selectedIndex] ? true : false; });
      var chosen = sizeSel.options[sizeSel.selectedIndex] ? parseFloat(sizeSel.options[sizeSel.selectedIndex].value) : rows[0].us;
      var match = rows.filter(function (r) { return r.us === chosen; })[0] || rows[0];
      out.textContent = 'US ' + match.us + ' = UK ' + match.uk + ' = EU ' + match.eu + ' = ' + match.jp + ' cm (insole)';
      tableWrap.innerHTML = tableHTML(['US', 'UK', 'EU', 'Japan (cm)'],
        rows.map(rowFor),
        function (r, i) { return rows[i].us === match.us; });
    }

    function rebuild() {
      var rows = OC.APPAREL.shoes[group];
      sizeSel.innerHTML = rows.map(function (r) { return '<option value="' + r.us + '">US ' + r.us + '</option>'; }).join('');
      update();
    }

    OC.qsa('[data-group]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        group = btn.getAttribute('data-group');
        OC.qsa('[data-group]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        rebuild();
      });
    });
    sizeSel.addEventListener('change', update);
    rebuild();
  }

  function renderClothing(root) {
    var group = 'women';
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="row mb-2">' +
      '    <button class="chip active" data-cgroup="women" type="button">Women</button>' +
      '    <button class="chip" data-cgroup="men" type="button">Men</button>' +
      '  </div>' +
      '  <div id="clTable"></div>' +
      '</div>';

    var wrap = OC.qs('#clTable', root);

    function draw() {
      var rows = OC.APPAREL.clothing[group];
      var extra = group === 'women' ? ['Bust', 'Waist'] : ['Chest', 'Waist'];
      wrap.innerHTML = rows.map(function (r) {
        return '<div class="panel" style="box-shadow:var(--shadow-hard-sm);margin-bottom:1rem;padding:1rem 1.2rem;">' +
          '<div class="row spread"><strong style="font-size:1.15rem">' + r.intl + '</strong>' +
          '<span class="tag tag-lime">US ' + r.us + '</span></div>' +
          '<div class="kv-list mt-1">' +
          '<div class="kv"><span class="kv-key">UK</span><span class="kv-val">' + r.uk + '</span></div>' +
          '<div class="kv"><span class="kv-key">EU</span><span class="kv-val">' + r.eu + '</span></div>' +
          '<div class="kv"><span class="kv-key">' + extra[0] + '</span><span class="kv-val">' + r.bust + r.chest + '</span></div>' +
          '<div class="kv"><span class="kv-key">' + extra[1] + '</span><span class="kv-val">' + r.waist + '</span></div>' +
          '</div></div>';
      }).join('');
    }

    OC.qsa('[data-cgroup]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        group = btn.getAttribute('data-cgroup');
        OC.qsa('[data-cgroup]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        draw();
      });
    });
    draw();
  }

  function renderRings(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="rgSize">US ring size</label><select class="select" id="rgSize"></select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Conversions</div><div class="value" id="rgOut">—</div></div>' +
      '  <div id="rgTable"></div>' +
      '  <p class="keypad-hint">EU ring size ≈ inner circumference in mm; diameter is the best measurement to take.</p>' +
      '</div>';

    var sel = OC.qs('#rgSize', root);
    var out = OC.qs('#rgOut', root);
    var wrap = OC.qs('#rgTable', root);
    sel.innerHTML = OC.APPAREL.rings.map(function (r) { return '<option value="' + r.us + '">US ' + r.us + '</option>'; }).join('');

    function update() {
      var chosen = parseFloat(sel.value);
      var m = OC.APPAREL.rings.filter(function (r) { return r.us === chosen; })[0];
      out.textContent = 'US ' + m.us + ' = UK ' + m.uk + ' = EU ' + m.eu + ' (' + m.diameterMm + ' mm diameter)';
      wrap.innerHTML = tableHTML(['US', 'UK', 'EU', 'Diameter (mm)'],
        OC.APPAREL.rings.map(function (r) { return [r.us, r.uk, r.eu, r.diameterMm]; }),
        function (r, i) { return OC.APPAREL.rings[i].us === chosen; });
    }

    sel.addEventListener('change', update);
    update();
  }

  function renderHats(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="result-hero" style="text-align:left"><div class="label">How to measure</div>' +
      '<div class="small">Wrap a tape measure around your head just above the ears, keeping it level — that circumference is your size.</div></div>' +
      '  <div id="htTable"></div>' +
      '</div>';

    OC.qs('#htTable', root).innerHTML = tableHTML(['Size', 'US hat size', 'Circumference (cm)', 'Circumference (in)'],
      OC.APPAREL.hats.map(function (h) { return [h.size, h.us, h.cm, h.inches]; }));
  }

  OC.registerApparelTools = function () {
    OC.registerRoute({
      id: 'apparel',
      name: 'Apparel & Sizing',
      icon: 'apparel',
      group: 'convert',
      desc: 'Shoe, clothing, ring and hat size charts.',
      keywords: 'shoes clothing size chart ring hat apparel fashion us uk eu jp dress',
      render: renderApparel
    });
  };
})();
