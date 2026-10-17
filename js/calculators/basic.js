/* OmniCalc - calculators/basic.js
   Standard calculator: live-evaluating expression line, memory register,
   history tape, keyboard support. Shared engine kit reused by the scientific level. */

(function () {
  'use strict';

  /* ---------------- shared calculator kit ---------------- */

  OC.calcKit = (function () {

    function createEngine() {
      var expr = '';
      return {
        get: function () { return expr; },
        set: function (v) { expr = v; },
        clear: function () { expr = ''; },
        append: function (token) { expr += token; },
        backspace: function () {
          expr = expr.replace(/(sqrt\(|log2\(|log10\(|log\(|ln\(|exp\(|abs\(|asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|sinh\(|cosh\(|tanh\(|cbrt\(|ncr\(|npr\(|mod\(|.)$/, '');
        },
        /* evaluate the current expression; when empty returns null */
        preview: function (vars) {
          if (expr.trim() === '') return null;
          return OC.expr.tryEvaluate(expr, vars);
        },
        /* auto-close unbalanced parentheses and evaluate */
        finish: function (vars) {
          var open = (expr.match(/\(/g) || []).length;
          var close = (expr.match(/\)/g) || []).length;
          var patched = expr + new Array(Math.max(0, open - close) + 1).join(')');
          return { result: OC.expr.tryEvaluate(patched, vars), patched: patched };
        }
      };
    }

    function toggleSign(engine) {
      var expr = engine.get();
      var m = /(-?)(\d+\.?\d*)$/.exec(expr);
      if (!m) { engine.append('-'); return; }
      var before = expr.slice(0, m.index);
      if (m[1] === '-') {
        engine.set(before + m[2]);
      } else {
        var needsParen = /[)\d.]$/.test(before) && /[0-9]/.test(before.slice(-1));
        engine.set(before + (needsParen ? '-(' : '-') + m[2] + (needsParen ? ')' : ''));
      }
    }

    /* Wire a [data-key] keypad. keys map: token -> handler override */
    function wireKeypad(root, engine, handlers) {
      root.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-key]');
        if (!btn) return;
        var key = btn.getAttribute('data-key');
        if (handlers && handlers[key]) { handlers[key](btn); return; }
        defaultAction(engine, key, handlers);
      });
    }

    function defaultAction(engine, key, handlers) {
      switch (key) {
        case 'clear': engine.clear(); break;
        case 'back': engine.backspace(); break;
        case 'sign': toggleSign(engine); break;
        case 'percent': engine.append('/100'); break;
        case 'equals': if (handlers && handlers.onEquals) handlers.onEquals(); break;
        default: engine.append(key);
      }
    }

    /* Global keyboard support; active only while `routeId` is the current route. */
    function bindKeyboard(routeId, map) {
      var listener = function (e) {
        if (OC.router.current !== routeId) return;
        var tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        var handler = map[e.key];
        if (handler) { e.preventDefault(); handler(e); }
      };
      window.addEventListener('keydown', listener);
    }

    /* Render history tape entries; onPick inserts the result. */
    function renderHistory(tapeEl, engine, onChange) {
      var list = OC.history.list().slice(0, 20);
      if (!list.length) {
        tapeEl.innerHTML = '<div class="faint small" style="padding:.4rem .6rem">Past calculations appear here — tap one to reuse its result.</div>';
        return;
      }
      tapeEl.innerHTML = list.map(function (h, i) {
        return '<div class="history-entry" data-i="' + i + '" title="Use this result">' +
          '<span class="expr">' + OC.esc(h.expr) + ' =</span>' +
          '<span class="val">' + OC.esc(OC.formatNumber(h.result, { decimals: 'auto' })) + '</span></div>';
      }).join('');
      tapeEl.onclick = function (e) {
        var row = e.target.closest('.history-entry');
        if (!row) return;
        var h = list[parseInt(row.getAttribute('data-i'), 10)];
        if (h) { engine.set(String(h.result)); if (onChange) onChange(); }
      };
    }

    return {
      createEngine: createEngine,
      wireKeypad: wireKeypad,
      bindKeyboard: bindKeyboard,
      renderHistory: renderHistory,
      toggleSign: toggleSign
    };
  })();

  /* ---------------- standard calculator page ---------------- */

  function renderBasic(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Standard Calculator',
      icon: 'calculate',
      desc: 'Everyday arithmetic with memory keys, a history tape and full keyboard support.',
      routeId: 'basic'
    }) +
      '<div class="calc-card" style="max-width:560px">' +
      '  <div class="history-tape" id="bcHistory"></div>' +
      '  <div class="calc-display" aria-live="polite">' +
      '    <div class="calc-display-expr mono" id="bcExpr">&nbsp;</div>' +
      '    <div class="calc-display-main" id="bcMain">0</div>' +
      '  </div>' +
      '  <div class="row tight mb-2">' +
      '    <span class="tag" id="bcMemTag" style="display:none">M</span>' +
      '    <button class="btn btn-sm" data-key="m+MC" id="bcMC" type="button">MC</button>' +
      '    <button class="btn btn-sm" data-key="m+MR" id="bcMR" type="button">MR</button>' +
      '    <button class="btn btn-sm" data-key="m+M-" id="bcMm" type="button">M−</button>' +
      '    <button class="btn btn-sm" data-key="m+M+" id="bcMp" type="button">M+</button>' +
      '    <button class="btn btn-sm" data-key="m+MS" id="bcMS" type="button">MS</button>' +
      '  </div>' +
      '  <div class="keypad cols-5" id="bcKeys">' +
      key('clear', 'C', 'key-fn key-danger') +
      key('back', '<span class="msym" aria-hidden="true">' + (OC.ICONS['backspace'] || '') + '</span>', 'key-fn') +
      key('(', '(', 'key-fn') +
      key(')', ')', 'key-fn') +
      key('÷', '÷', 'key-op') +
      key('7', '7') + key('8', '8') + key('9', '9') +
      key('×', '×', 'key-op') + key('sqrt(', '√', 'key-fn') +
      key('4', '4') + key('5', '5') + key('6', '6') +
      key('−', '−', 'key-op') + key('^2', 'x²', 'key-fn') +
      key('1', '1') + key('2', '2') + key('3', '3') +
      key('+', '+', 'key-op') + key('^', 'x^y', 'key-fn') +
      key('0', '0') + key('.', '.') +
      key('sign', '±', 'key-fn') + key('percent', '%', 'key-fn') +
      key('equals', '=', 'key-eq') +
      '  </div>' +
      '  <p class="keypad-hint">Keyboard: digits, + − * / ^ ( ) . · Enter = equals · Backspace · Esc clears</p>' +
      '</div>');

    var engine = OC.calcKit.createEngine();
    var exprEl = OC.qs('#bcExpr', page);
    var mainEl = OC.qs('#bcMain', page);
    var memTag = OC.qs('#bcMemTag', page);
    var tapeEl = OC.qs('#bcHistory', page);
    var memory = 0;

    function render() {
      var expr = engine.get();
      exprEl.innerHTML = expr === '' ? '&nbsp;' : OC.esc(pretty(expr));
      var preview = engine.preview();
      if (preview === null) mainEl.textContent = expr === '' ? '0' : '…';
      else if (preview.ok) mainEl.textContent = OC.formatNumber(preview.value, { decimals: 'auto' });
      else mainEl.textContent = '…';
      memTag.style.display = memory !== 0 ? '' : 'none';
      memTag.textContent = 'M ' + OC.formatNumber(memory, { decimals: 'auto' });
    }

    function pretty(expr) {
      return expr.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/−/g, ' − ')
        .replace(/\s+/g, ' ').trim();
    }

    function commit() {
      var fin = engine.finish();
      if (!fin.result.ok) {
        mainEl.textContent = 'Error';
        return;
      }
      OC.history.add(pretty(engine.get()), fin.result.value);
      engine.set(String(fin.result.value));
      OC.calcKit.renderHistory(tapeEl, engine, render);
      render();
    }

    OC.calcKit.wireKeypad(page, engine, {
      onEquals: commit,
      'm+MC': function () { memory = 0; render(); },
      'm+MR': function () { engine.append(String(memory)); render(); },
      'm+M+': function () { var p = engine.preview(); if (p && p.ok) { memory += p.value; render(); } },
      'm+M-': function () { var p = engine.preview(); if (p && p.ok) { memory -= p.value; render(); } },
      'm+MS': function () { var p = engine.preview(); if (p && p.ok) { memory = p.value; render(); } }
    });

    /* keypad and memory buttons re-render the display after any click */
    OC.qs('.calc-card', page).addEventListener('click', render);

    OC.calcKit.bindKeyboard('basic', {
      'Enter': function () { commit(); },
      '=': function () { commit(); },
      'Escape': function () { engine.clear(); render(); },
      'Backspace': function () { engine.backspace(); render(); },
      'Delete': function () { engine.clear(); render(); },
      'x': function () { engine.append('×'); render(); },
      '*': function () { engine.append('×'); render(); },
      '/': function () { engine.append('÷'); render(); },
      '-': function () { engine.append('−'); render(); },
      '+': function () { engine.append('+'); render(); },
      '^': function () { engine.append('^'); render(); },
      '(': function () { engine.append('('); render(); },
      ')': function () { engine.append(')'); render(); },
      '.': function () { engine.append('.'); render(); },
      '%': function () { engine.append('/100'); render(); },
      '0': digit(), '1': digit(), '2': digit(), '3': digit(), '4': digit(),
      '5': digit(), '6': digit(), '7': digit(), '8': digit(), '9': digit()
    });

    function digit() {
      return function (e) { engine.append(e.key); render(); };
    }

    OC.calcKit.renderHistory(tapeEl, engine, render);
    render();
  }

  function key(k, label, cls) {
    return '<button class="key ' + (cls || '') + '" data-key="' + OC.esc(k) + '" type="button">' + label + '</button>';
  }

  OC.registerBasicCalculator = function () {
    OC.registerRoute({
      id: 'basic',
      name: 'Standard',
      icon: 'calculate',
      group: 'calc',
      desc: 'Everyday arithmetic with memory and history.',
      keywords: 'basic standard calculator arithmetic sum add multiply divide percent simple',
      render: renderBasic
    });
  };
})();
