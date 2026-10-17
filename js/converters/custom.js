/* OmniCalc - converters/custom.js
   User-defined linear converters: output = (input * multiplier) + offset.
   Saved to localStorage, listed under "My Converters". */

(function () {
  'use strict';

  function formulaText(conv) {
    var parts = [];
    if (conv.multiplier !== 1) parts.push(OC.formatNumber(conv.multiplier, { decimals: 'auto' }) + ' × input');
    else parts.push('input');
    if (conv.offset) {
      parts.push((conv.offset > 0 ? '+ ' : '− ') + OC.formatNumber(Math.abs(conv.offset), { decimals: 'auto' }));
    }
    return parts.join(' ');
  }

  function renderCustom(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Converters',
      title: 'My Custom Converters',
      icon: 'extension',
      desc: 'Build your own converter with a simple formula: <span class="mono">output = (input × multiplier) + offset</span>. Saved locally, available offline.',
      routeId: 'custom'
    }) +
      '<div id="customBannerSlot"></div>' +
      '<div class="panel">' +
      '  <span class="panel-title">New converter</span>' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="ccName">Name</label><input class="input" id="ccName" placeholder="Game gold to USD" maxlength="40"></div>' +
      '    <div class="field"><label for="ccFrom">Input label</label><input class="input" id="ccFrom" placeholder="Gold coins" maxlength="24"></div>' +
      '    <div class="field"><label for="ccTo">Output label</label><input class="input" id="ccTo" placeholder="USD" maxlength="24"></div>' +
      '    <div class="field"><label for="ccMul">Multiplier</label><input class="input mono" id="ccMul" inputmode="decimal" placeholder="0.001"></div>' +
      '    <div class="field"><label for="ccOff">Offset (optional)</label><input class="input mono" id="ccOff" inputmode="decimal" placeholder="0"></div>' +
      '  </div>' +
      '  <div class="row spread mt-3">' +
      '    <span class="mono small muted" id="ccPreview">output = input</span>' +
      '    <button class="btn btn-primary" id="ccSave" type="button">Save converter</button>' +
      '  </div>' +
      '</div>' +
      '<div class="section-heading"><h2>Saved converters</h2><span class="faint small" id="ccCount"></span></div>' +
      '<div id="ccList" class="grid-2"></div>');

    var nameIn = OC.qs('#ccName', page);
    var fromIn = OC.qs('#ccFrom', page);
    var toIn = OC.qs('#ccTo', page);
    var mulIn = OC.qs('#ccMul', page);
    var offIn = OC.qs('#ccOff', page);
    var preview = OC.qs('#ccPreview', page);
    var list = OC.qs('#ccList', page);
    var count = OC.qs('#ccCount', page);
    var bannerSlot = OC.qs('#customBannerSlot', page);

    function readForm() {
      return {
        name: nameIn.value.trim(),
        fromLabel: fromIn.value.trim() || 'Input',
        toLabel: toIn.value.trim() || 'Output',
        multiplier: isFinite(OC.parseNum(mulIn.value)) ? OC.parseNum(mulIn.value) : 1,
        offset: isFinite(OC.parseNum(offIn.value)) ? OC.parseNum(offIn.value) : 0
      };
    }

    function updatePreview() {
      var f = readForm();
      preview.textContent = 'output = ' + formulaText(f);
    }

    [nameIn, fromIn, toIn, mulIn, offIn].forEach(function (n) {
      n.addEventListener('input', updatePreview);
    });

    function renderList() {
      var convs = OC.customs.list();
      count.textContent = convs.length + (convs.length === 1 ? ' converter' : ' converters');
      if (!convs.length) {
        list.innerHTML = '<div class="panel center muted">Nothing yet — build your first converter above. It will live here and in the sidebar.</div>';
        return;
      }
      list.innerHTML = convs.map(function (c) {
        return '<div class="panel" data-id="' + c.id + '">' +
          '<div class="row spread">' +
          '  <strong>' + OC.esc(c.name) + '</strong>' +
          '  <button class="icon-btn cc-del" aria-label="Delete ' + OC.esc(c.name) + '" title="Delete">' + OC.iconHTML('delete') + '</button>' +
          '</div>' +
          '<div class="small muted mono mb-2">' + OC.esc(c.fromLabel) + ' → ' + OC.esc(c.toLabel) + ' · output = ' + OC.esc(formulaText(c)) + '</div>' +
          '<div class="conv-row" style="grid-template-columns:1fr 1fr;">' +
          '  <input class="input mono cc-in" inputmode="decimal" value="1" aria-label="Value in ' + OC.esc(c.fromLabel) + '">' +
          '  <input class="input mono cc-out" readonly aria-live="polite" aria-label="Result in ' + OC.esc(c.toLabel) + '">' +
          '</div>' +
          '<div class="mt-1 small muted cc-line"></div>' +
          '</div>';
      }).join('');
      OC.hydrateIcons(list);

      OC.qsa('.panel[data-id]', list).forEach(function (card) {
        var conv = convs.filter(function (c) { return c.id === card.getAttribute('data-id'); })[0];
        var input = OC.qs('.cc-in', card);
        var output = OC.qs('.cc-out', card);
        var line = OC.qs('.cc-line', card);
        function update() {
          var v = OC.parseNum(input.value);
          if (!isFinite(v)) { output.value = '—'; line.textContent = ''; return; }
          var res = v * conv.multiplier + conv.offset;
          output.value = OC.formatNumber(res, { decimals: 'auto' });
          line.textContent = OC.formatNumber(v, { decimals: 'auto' }) + ' ' + conv.fromLabel + '  =  ' +
            OC.formatNumber(res, { decimals: 'auto' }) + ' ' + conv.toLabel;
        }
        input.addEventListener('input', update);
        update();
      });

      OC.qsa('.cc-del', list).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var card = btn.closest('.panel[data-id]');
          var id = card.getAttribute('data-id');
          if (confirm('Delete this converter?')) {
            OC.customs.remove(id);
            renderList();
            renderBanner();
          }
        });
      });
    }

    function renderBanner() {
      var convs = OC.customs.list();
      bannerSlot.innerHTML = convs.length ? '' :
        OC.ui.banner('', 'Tip', 'Custom converters appear in the sidebar under <strong>Converter → My Converters</strong>. Export a backup any time from Settings.');
    }

    OC.qs('#ccSave', page).addEventListener('click', function () {
      var f = readForm();
      if (!f.name) {
        nameIn.focus();
        bannerSlot.innerHTML = OC.ui.banner('error', 'Name required', 'Give your converter a name so you can find it later.');
        return;
      }
      if (f.name.toLowerCase() === 'input' && false) { /* reserved */ }
      OC.customs.save(f);
      bannerSlot.innerHTML = OC.ui.banner('', 'Saved', 'Converter "' + OC.esc(f.name) + '" saved to this browser.');
      nameIn.value = ''; fromIn.value = ''; toIn.value = ''; mulIn.value = ''; offIn.value = '';
      updatePreview();
      renderList();
    });

    updatePreview();
    renderList();
    renderBanner();
  }

  OC.registerCustomConverters = function () {
    OC.registerRoute({
      id: 'custom',
      name: 'My Converters',
      icon: 'extension',
      group: 'convert',
      desc: 'Build your own formula-based converters.',
      keywords: 'custom builder my converter formula multiplier offset create',
      render: renderCustom
    });
  };
})();
