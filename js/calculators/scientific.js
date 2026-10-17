/* OmniCalc - calculators/scientific.js
   Scientific calculator: trig (deg/rad/grad), logs, constants, combinatorics,
   factorial, memory, history — parsed with the shunting-yard engine (no eval). */

(function () {
  'use strict';

  function key(k, label, cls) {
    return '<button class="key ' + (cls || '') + '" data-key="' + OC.esc(k) + '" type="button">' + label + '</button>';
  }

  function renderScientific(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Scientific Calculator',
      icon: 'science',
      desc: 'Trigonometry, logarithms, powers, factorials, permutations and constants — with degree, radian and gradian modes.',
      routeId: 'scientific'
    }) +
      '<div class="calc-card" style="max-width:640px">' +
      '  <div class="calc-badges" id="scAngles">' +
      '    <span class="tag" data-mode="deg">DEG</span>' +
      '    <span class="tag" data-mode="rad">RAD</span>' +
      '    <span class="tag" data-mode="grad">GRAD</span>' +
      '  </div>' +
      '  <div class="history-tape" id="scHistory"></div>' +
      '  <div class="calc-display" aria-live="polite">' +
      '    <div class="calc-display-expr mono" id="scExpr">&nbsp;</div>' +
      '    <div class="calc-display-main" id="scMain">0</div>' +
      '  </div>' +
      '  <div class="row tight mb-2">' +
      '    <span class="tag" id="scMemTag" style="display:none">M</span>' +
      '    <button class="btn btn-sm" id="scMC" type="button">MC</button>' +
      '    <button class="btn btn-sm" id="scMR" type="button">MR</button>' +
      '    <button class="btn btn-sm" id="scMm" type="button">M−</button>' +
      '    <button class="btn btn-sm" id="scMp" type="button">M+</button>' +
      '    <button class="btn btn-sm" id="scMS" type="button">MS</button>' +
      '    <span class="row-divider"></span>' +
      '    <button class="btn btn-sm" data-chip="c" type="button">c</button>' +
      '    <button class="btn btn-sm" data-chip="g" type="button">g</button>' +
      '    <button class="btn btn-sm" data-chip="avogadro" type="button">N_A</button>' +
      '    <button class="btn btn-sm" data-chip="phi" type="button">φ</button>' +
      '  </div>' +
      '  <div class="keypad cols-6 keep-6" id="scKeys">' +
      key('clear', 'C', 'key-fn key-danger') +
      key('back', '<span class="msym" aria-hidden="true">' + (OC.ICONS['backspace'] || '') + '</span>', 'key-fn') +
      key('(', '(', 'key-fn') +
      key(')', ')', 'key-fn') +
      key('pi', 'π', 'key-fn') +
      key('e', 'e', 'key-fn') +

      key('sin(', 'sin', 'key-fn') + key('cos(', 'cos', 'key-fn') + key('tan(', 'tan', 'key-fn') +
      key('sinh(', 'sinh', 'key-fn') + key('cosh(', 'cosh', 'key-fn') + key('tanh(', 'tanh', 'key-fn') +

      key('asin(', 'sin⁻¹', 'key-fn') + key('acos(', 'cos⁻¹', 'key-fn') + key('atan(', 'tan⁻¹', 'key-fn') +
      key('log(', 'log', 'key-fn') + key('ln(', 'ln', 'key-fn') + key('log2(', 'log₂', 'key-fn') +

      key('sqrt(', '√', 'key-fn') + key('^2', 'x²', 'key-fn') + key('^', 'xʸ', 'key-fn') +
      key('!', 'n!', 'key-fn') + key('^(-1)', '1/x', 'key-fn') + key('percent', '%', 'key-fn') +

      key('7', '7') + key('8', '8') + key('9', '9') + key('÷', '÷', 'key-op') +
      key('ncr(', 'nCr', 'key-fn') + key('npr(', 'nPr', 'key-fn') +

      key('4', '4') + key('5', '5') + key('6', '6') + key('×', '×', 'key-op') +
      key('abs(', 'abs', 'key-fn') + key('exp(', 'eˣ', 'key-fn') +

      key('1', '1') + key('2', '2') + key('3', '3') + key('−', '−', 'key-op') +
      key('__ans', 'Ans', 'key-fn') + key('mod(', 'mod', 'key-fn') +

      key('0', '0') + key('.', '.') + key('sign', '±', 'key-fn') + key('+', '+', 'key-op') +
      key('equals', '=', 'key-eq key-wide') +
      '  </div>' +
      '  <p class="keypad-hint">Physical keyboard works too: digits and operators type straight into the expression.</p>' +
      '</div>');

    var engine = OC.calcKit.createEngine();
    var exprEl = OC.qs('#scExpr', page);
    var mainEl = OC.qs('#scMain', page);
    var memTag = OC.qs('#scMemTag', page);
    var tapeEl = OC.qs('#scHistory', page);
    var memory = 0;
    OC.ANS = OC.ANS || 0;

    function pretty(expr) {
      return expr.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/−/g, ' − ')
        .replace(/\s+/g, ' ').trim();
    }

    function render() {
      var expr = engine.get();
      exprEl.innerHTML = expr === '' ? '&nbsp;' : OC.esc(pretty(expr));
      var preview = engine.preview();
      if (preview === null) mainEl.textContent = expr === '' ? '0' : '…';
      else if (preview.ok) mainEl.textContent = OC.formatNumber(preview.value, { decimals: 'auto' });
      else mainEl.textContent = '…';
      memTag.style.display = memory !== 0 ? '' : 'none';
      memTag.textContent = 'M ' + OC.formatNumber(memory, { decimals: 'auto' });
      OC.qsa('#scAngles .tag', page).forEach(function (tag) {
        tag.classList.toggle('active', tag.getAttribute('data-mode') === OC.settings().angleMode);
      });
    }

    function commit() {
      var fin = engine.finish();
      if (!fin.result.ok) { mainEl.textContent = 'Error'; return; }
      OC.ANS = fin.result.value;
      OC.history.add(pretty(engine.get()), fin.result.value);
      engine.set(String(fin.result.value));
      OC.calcKit.renderHistory(tapeEl, engine, render);
      render();
    }

    OC.calcKit.wireKeypad(page, engine, {
      onEquals: commit,
      '__ans': function () { engine.append(String(OC.ANS)); render(); }
    }, render);

    OC.qsa('#scAngles .tag', page).forEach(function (tag) {
      tag.addEventListener('click', function () {
        OC.saveSettings({ angleMode: tag.getAttribute('data-mode') });
        render();
      });
    });

    OC.qsa('[data-chip]', page).forEach(function (btn) {
      btn.addEventListener('click', function () {
        engine.append(btn.getAttribute('data-chip'));
        render();
      });
    });

    OC.qs('#scMC', page).addEventListener('click', function () { memory = 0; render(); });
    OC.qs('#scMR', page).addEventListener('click', function () { engine.append(String(memory)); render(); });
    OC.qs('#scMp', page).addEventListener('click', function () { var p = engine.preview(); if (p && p.ok) { memory += p.value; render(); } });
    OC.qs('#scMm', page).addEventListener('click', function () { var p = engine.preview(); if (p && p.ok) { memory -= p.value; render(); } });
    OC.qs('#scMS', page).addEventListener('click', function () { var p = engine.preview(); if (p && p.ok) { memory = p.value; render(); } });

    var keyMap = {
      'Enter': commit,
      '=': commit,
      'Escape': function () { engine.clear(); render(); },
      'Backspace': function () { engine.backspace(); render(); },
      'Delete': function () { engine.clear(); render(); },
      '*': function () { engine.append('×'); render(); },
      'x': function () { engine.append('×'); render(); },
      '/': function () { engine.append('÷'); render(); },
      '-': function () { engine.append('−'); render(); },
      '+': function () { engine.append('+'); render(); },
      '^': function () { engine.append('^'); render(); },
      '!': function () { engine.append('!'); render(); },
      '(': function () { engine.append('('); render(); },
      ')': function () { engine.append(')'); render(); },
      '.': function () { engine.append('.'); render(); },
      '%': function () { engine.append('/100'); render(); }
    };
    '0123456789'.split('').forEach(function (d) {
      keyMap[d] = function (e) { engine.append(e.key); render(); };
    });
    OC.calcKit.bindKeyboard('scientific', keyMap);

    OC.calcKit.renderHistory(tapeEl, engine, render);
    render();
  }

  OC.registerScientificCalculator = function () {
    OC.registerRoute({
      id: 'scientific',
      name: 'Scientific',
      icon: 'science',
      group: 'calc',
      desc: 'Trig, logs, powers, factorial, nCr/nPr.',
      keywords: 'scientific calculator trigonometry sin cos tan log ln factorial permutation combination',
      render: renderScientific
    });
  };
})();
