/* OmniCalc - calculators/programmer.js
   Programmer calculator: BIN/OCT/DEC/HEX, bitwise ops, shifts,
   8/16/32/64-bit word size with two's-complement wraparound (BigInt). */

(function () {
  'use strict';

  var OPS = ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', '<<', '>>'];

  function key(k, label, cls) {
    return '<button class="key ' + (cls || '') + '" data-key="' + OC.esc(k) + '" type="button">' + label + '</button>';
  }

  function renderProgrammer(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Programmer Calculator',
      icon: 'code',
      desc: 'Binary, octal, decimal and hex with bitwise logic, shifts, and wraparound at your chosen word size.',
      routeId: 'programmer'
    }) +
      '<div class="calc-card" style="max-width:760px">' +
      '  <div class="calc-badges" id="pgWord">' +
      '    <span class="tag" data-bits="8">8-bit</span>' +
      '    <span class="tag" data-bits="16">16-bit</span>' +
      '    <span class="tag active" data-bits="32">32-bit</span>' +
      '    <span class="tag" data-bits="64">64-bit</span>' +
      '  </div>' +
      '  <div class="kv-list" id="pgRows"></div>' +
      '  <div class="row spread mt-2">' +
      '    <span class="mono small muted" id="pgPending">&nbsp;</span>' +
      '    <span class="row tight"><span id="pgCopySlot"></span>' +
      '    <button class="btn btn-sm" id="pgSignToggle" type="button">Two\u2019s complement: <strong id="pgSignState">on</strong></button></span>' +
      '  </div>' +
      '  <div class="keypad cols-6 keep-6 mt-2" id="pgKeys">' +
      key('AND', 'AND', 'key-fn') + key('OR', 'OR', 'key-fn') + key('XOR', 'XOR', 'key-fn') +
      key('NOT', 'NOT', 'key-fn') + key('NAND', 'NAND', 'key-fn') + key('NOR', 'NOR', 'key-fn') +

      key('XNOR', 'XNOR', 'key-fn') + key('<<', '<<', 'key-fn') + key('>>', '>>', 'key-fn') +
      key('AC', 'AC', 'key-fn key-danger') +
      key('BACK', '<span class="msym" aria-hidden="true">' + (OC.ICONS['backspace'] || '') + '</span>', 'key-fn') +
      key('=', '=', 'key-eq') +

      key('A', 'A', 'key-fn') + key('B', 'B', 'key-fn') + key('C', 'C', 'key-fn') +
      key('D', 'D', 'key-fn') + key('E', 'E', 'key-fn') + key('F', 'F', 'key-fn') +

      key('7', '7', 'key-wide') + key('8', '8', 'key-wide') + key('9', '9', 'key-wide') +
      key('4', '4', 'key-wide') + key('5', '5', 'key-wide') + key('6', '6', 'key-wide') +
      key('1', '1', 'key-wide') + key('2', '2', 'key-wide') + key('3', '3', 'key-wide') +
      '<button class="key key-wide" data-key="0" type="button" style="grid-column: span 6">0</button>' +
      '  </div>' +
      '  <p class="keypad-hint">Ops act on two numbers: type a, an operator, then b. Values wrap at the selected word size (two\u2019s complement).</p>' +
      '</div>');

    var state = {
      bits: 32,
      value: 0n,
      acc: 0n,
      entry: '',
      entryBase: 16,
      pending: null,
      complement: true
    };

    var rowsEl = OC.qs('#pgRows', page);
    var pendingEl = OC.qs('#pgPending', page);
    var signState = OC.qs('#pgSignState', page);

    var BASES = [
      { id: 'hex', base: 16, label: 'HEX', group: 4 },
      { id: 'dec', base: 10, label: 'DEC', group: 0 },
      { id: 'oct', base: 8, label: 'OCT', group: 0 },
      { id: 'bin', base: 2, label: 'BIN', group: 4 }
    ];

    function mask() { return (1n << BigInt(state.bits)) - 1n; }
    function wrap(v) {
      var m = mask();
      return ((v % (m + 1n)) + m + 1n) % (m + 1n);
    }
    function signBit() { return 1n << BigInt(state.bits - 1); }
    function signed(v) {
      return (v & signBit()) ? v - (mask() + 1n) : v;
    }
    function toBaseStr(v, base, group) {
      var s = v.toString(base).toUpperCase();
      if (group) {
        s = s.padStart(Math.ceil(s.length / group) * group, '0');
        s = s.match(new RegExp('.{1,' + group + '}', 'g')).join(' ');
      }
      return s;
    }

    function renderRows(skipId) {
      BASES.forEach(function (b) {
        var input = OC.qs('#pg-' + b.id, page);
        if (!input || b === skipId) return;
        var v = state.entry !== '' && state.entryBase === b.base ? parseEntry() : state.value;
        if (b.base === 10) {
          input.value = state.complement ? signed(v).toString(10) : v.toString(10);
        } else {
          input.value = toBaseStr(v, b.base, b.group);
        }
      });
      pendingEl.textContent = state.pending
        ? (signed(state.acc).toString(10) + ' ' + state.pending + ' …')
        : '\u00a0';
    }

    function parseEntry() {
      try {
        return wrap(parseInBase(state.entry, state.entryBase));
      } catch (e) { return state.value; }
    }

    function parseInBase(str, base) {
      var s = String(str).toLowerCase().replace(/0x/g, '').replace(/[\s_]/g, '');
      if (s === '' || s === '-') return 0n;
      var neg = false;
      if (s[0] === '-') { neg = true; s = s.slice(1); }
      var acc = 0n, b = BigInt(base);
      var digits = '0123456789abcdef';
      for (var i = 0; i < s.length; i++) {
        var d = digits.indexOf(s[i]);
        if (d === -1 || d >= base) throw new Error('bad digit');
        acc = acc * b + BigInt(d);
      }
      return neg ? -acc : acc;
    }

    function pushEntry(digit) {
      var maxLen = 64;
      if (state.entry.length >= maxLen) return;
      if (state.entry === '0') state.entry = '';
      state.entry += digit.toLowerCase();
      var v = parseEntry();
      state.value = v;
      renderRows();
    }

    function applyOp(op, a, b) {
      var m = mask();
      switch (op) {
        case 'AND': return wrap(a & b);
        case 'OR': return wrap(a | b);
        case 'XOR': return wrap(a ^ b);
        case 'NAND': return wrap(~(a & b));
        case 'NOR': return wrap(~(a | b));
        case 'XNOR': return wrap(~(a ^ b));
        case '<<': return wrap(a << (b & 63n));
        case '>>': return wrap((a & m) >> (b & 63n));
        default: return b;
      }
    }

    function handleKey(k) {
      if (/^[0-9A-F]$/i.test(k)) {
        if (state.entry === '') state.entryBase = 16;
        if (parseInt(k, 16) >= state.entryBase) state.entryBase = 16;
        pushEntry(k);
        return;
      }
      if (OPS.indexOf(k) !== -1) {
        var b = state.entry !== '' ? parseEntry() : state.value;
        state.acc = state.pending ? applyOp(state.pending, state.acc, b) : b;
        state.pending = k;
        state.entry = '';
        state.value = state.acc;
        renderRows();
        return;
      }
      switch (k) {
        case '=':
          var b2 = state.entry !== '' ? parseEntry() : state.value;
          if (state.pending) {
            state.acc = applyOp(state.pending, state.acc, b2);
            state.pending = null;
          } else {
            state.acc = b2;
          }
          state.entry = '';
          state.value = state.acc;
          renderRows();
          break;
        case 'NOT':
          state.value = wrap(~(state.entry !== '' ? parseEntry() : state.value));
          state.acc = state.value;
          state.entry = '';
          renderRows();
          break;
        case 'AC':
          state.value = 0n; state.acc = 0n; state.entry = ''; state.pending = null;
          renderRows();
          break;
        case 'BACK':
          state.entry = state.entry.slice(0, -1);
          state.value = state.entry === '' ? state.acc : parseEntry();
          renderRows();
          break;
      }
    }

    /* rows */
    rowsEl.innerHTML = BASES.map(function (b) {
      return '<div class="conv-row" style="grid-template-columns:64px 1fr;margin-bottom:.5rem;align-items:center">' +
        '<span class="tag tag-dark" style="justify-self:start">' + b.label + '</span>' +
        '<input class="input mono" id="pg-' + b.id + '" inputmode="text" spellcheck="false" autocomplete="off" aria-label="Value in ' + b.label + '">' +
        '</div>';
    }).join('');

    BASES.forEach(function (b) {
      var input = OC.qs('#pg-' + b.id, page);
      input.addEventListener('focus', function () {
        state.entryBase = b.base;
        state.entry = '';
      });
      input.addEventListener('input', function () {
        state.entryBase = b.base;
        state.entry = input.value.replace(/[,\s_]/g, '');
        try {
          state.value = wrap(parseInBase(input.value, b.base));
        } catch (e) { /* keep last valid */ }
        renderRows(b);
      });
    });

    OC.qs('#pgKeys', page).addEventListener('click', function (e) {
      var btn = e.target.closest('[data-key]');
      if (!btn) return;
      btn.classList.add('pressed');
      setTimeout(function () { btn.classList.remove('pressed'); }, 120);
      handleKey(btn.getAttribute('data-key'));
    });

    OC.qsa('#pgWord .tag', page).forEach(function (tag) {
      tag.addEventListener('click', function () {
        state.bits = parseInt(tag.getAttribute('data-bits'), 10);
        state.value = wrap(state.value);
        OC.qsa('#pgWord .tag', page).forEach(function (t) { t.classList.toggle('active', t === tag); });
        renderRows();
      });
    });

    OC.qs('#pgSignToggle', page).addEventListener('click', function () {
      state.complement = !state.complement;
      signState.textContent = state.complement ? 'on' : 'off';
      renderRows();
    });

    OC.qs('#pgCopySlot', page).appendChild(OC.ui.copyBtn(function () {
      return state.value.toString(10);
    }, 'Copy'));

    renderRows();
    var initial = OC.qs('#pg-hex', page);
    if (initial) initial.focus();
  }

  OC.registerProgrammerCalculator = function () {
    OC.registerRoute({
      id: 'programmer',
      name: 'Programmer',
      icon: 'code',
      group: 'calc',
      desc: 'Base conversion and bitwise operations.',
      keywords: 'programmer binary hex octal bitwise and or xor not shift bit twos complement developer',
      render: renderProgrammer
    });
  };
})();
