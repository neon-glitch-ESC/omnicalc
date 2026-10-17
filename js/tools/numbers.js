/* OmniCalc - tools/numbers.js
   Number Systems & Encoding: base-N, Roman numerals, text/Unicode/Base64, Morse. */

(function () {
  'use strict';

  var DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

  /* ---------------- base conversion (BigInt safe) ---------------- */

  function parseInBase(str, base) {
    var s = String(str).trim().toLowerCase().replace(/^0b|^0o|^0x/, function (m) {
      return '';
    });
    if (s === '') return null;
    var neg = false;
    if (s[0] === '-') { neg = true; s = s.slice(1); }
    if (s === '') return null;
    var acc = 0n;
    var b = BigInt(base);
    for (var i = 0; i < s.length; i++) {
      var d = DIGITS.indexOf(s[i]);
      if (d === -1 || d >= base) return null;
      acc = acc * b + BigInt(d);
    }
    return neg ? -acc : acc;
  }

  function toBase(value, base) {
    if (value === 0n) return '0';
    var neg = value < 0n;
    var v = neg ? -value : value;
    var b = BigInt(base);
    var out = '';
    while (v > 0n) {
      out = DIGITS[Number(v % b)] + out;
      v = v / b;
    }
    return (neg ? '-' : '') + out;
  }

  /* ---------------- roman numerals ---------------- */

  var ROMAN = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  function toRoman(n) {
    if (!isFinite(n) || n !== Math.round(n) || n < 1 || n > 3999) return null;
    var out = '';
    ROMAN.forEach(function (pair) {
      while (n >= pair[0]) { out += pair[1]; n -= pair[0]; }
    });
    return out;
  }

  function fromRoman(str) {
    var s = String(str).trim().toUpperCase();
    if (!/^[IVXLCDM]+$/.test(s)) return null;
    var vals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    var sum = 0;
    for (var i = 0; i < s.length; i++) {
      var v = vals[s[i]];
      var next = vals[s[i + 1]] || 0;
      sum += v < next ? -v : v;
    }
    /* Validate round-trip (rejects forms like IIII or VX) */
    if (toRoman(sum) !== s) return null;
    return sum;
  }

  /* ---------------- morse ---------------- */

  var MORSE = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--',
    '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '$': '...-..-', '@': '.--.-.'
  };
  var MORSE_REV = (function () {
    var r = {};
    Object.keys(MORSE).forEach(function (k) { r[MORSE[k]] = k; });
    return r;
  })();

  function textToMorse(text) {
    return String(text).toUpperCase().split('').map(function (ch) {
      if (ch === ' ') return '/';
      return MORSE[ch] || '';
    }).filter(function (x) { return x !== ''; }).join(' ');
  }

  function morseToText(code) {
    return String(code).trim().split(/\s*\/\s*/).map(function (word) {
      return word.split(/\s+/).map(function (tok) {
        return MORSE_REV[tok] || (tok ? '?' : '');
      }).join('');
    }).join(' ');
  }

  /* ---------------- page ---------------- */

  function renderNumbers(el) {
    var TABS = [
      { id: 'base', label: 'Base converter', icon: 'pin' },
      { id: 'roman', label: 'Roman numerals', icon: 'history_edu' },
      { id: 'text', label: 'Text & encoding', icon: 'code' },
      { id: 'morse', label: 'Morse code', icon: 'air' }
    ];

    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Converters',
      title: 'Number Systems & Encoding',
      icon: 'pin',
      desc: 'Binary, octal, hex, base-N, Roman numerals, Unicode code points, Base64 and Morse code.',
      routeId: 'numbers'
    }) + OC.ui.tabsHTML(TABS, 'base') + '' +
      '<div id="ns-base"></div>' +
      '<div id="ns-roman" style="display:none"></div>' +
      '<div id="ns-text" style="display:none"></div>' +
      '<div id="ns-morse" style="display:none"></div>');

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) {
        OC.qs('#ns-' + t.id, page).style.display = t.id === id ? '' : 'none';
      });
    });

    renderBase(OC.qs('#ns-base', page));
    renderRoman(OC.qs('#ns-roman', page));
    renderText(OC.qs('#ns-text', page));
    renderMorse(OC.qs('#ns-morse', page));
  }

  function renderBase(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="conv-row">' +
      '    <input type="text" class="input mono" id="nbIn" value="255" aria-label="Number" autocomplete="off" spellcheck="false">' +
      '    <select class="select" id="nbBase" aria-label="Input base">' +
      ['2', '8', '10', '16'].map(function (b) { return '<option value="' + b + '"' + (b === '10' ? ' selected' : '') + '>Base ' + b + (b === '2' ? ' (binary)' : b === '8' ? ' (octal)' : b === '16' ? ' (hex)' : ' (decimal)') + '</option>'; }).join('') +
      '    </select>' +
      '  </div>' +
      '  <div class="kv-list mt-3" id="nbOut"></div>' +
      '  <p class="keypad-hint">Digits 0-9 and a-z are accepted for bases up to 36. Arbitrary precision via BigInt.</p>' +
      '</div>';

    var input = OC.qs('#nbIn', root);
    var baseSel = OC.qs('#nbBase', root);
    var out = OC.qs('#nbOut', root);

    function update() {
      var base = parseInt(baseSel.value, 10);
      var val = parseInBase(input.value, base);
      if (val === null) {
        out.innerHTML = '<div class="banner error" style="margin:0">' + OC.iconHTML('error') +
          '<div class="banner-body">Invalid number for base ' + base + '.</div></div>';
        OC.hydrateIcons(out);
        return;
      }
      var rows = [
        ['Binary (2)', toBase(val, 2)],
        ['Octal (8)', toBase(val, 8)],
        ['Decimal (10)', toBase(val, 10)],
        ['Hexadecimal (16)', toBase(val, 16).toUpperCase()]
      ];
      out.innerHTML = rows.map(function (r) {
        return '<div class="kv"><span class="kv-key">' + r[0] + '</span><span class="kv-val mono">' + OC.esc(r[1]) + '</span></div>';
      }).join('');
    }

    input.addEventListener('input', update);
    baseSel.addEventListener('change', update);
    update();
  }

  function renderRoman(root) {
    root.innerHTML = '' +
      '<div class="grid-2">' +
      '  <div class="panel"><span class="panel-title">Decimal to Roman</span>' +
      '    <div class="field"><label for="nrNum">Number (1 – 3999)</label><input class="input mono" id="nrNum" inputmode="numeric" value="2026"></div>' +
      '    <div class="result-hero mt-3"><div class="label">Roman numeral</div><div class="value" id="nrRomanOut">—</div></div>' +
      '  </div>' +
      '  <div class="panel"><span class="panel-title">Roman to decimal</span>' +
      '    <div class="field"><label for="nrRoman">Roman numeral</label><input class="input mono" id="nrRoman" value="MMXXVI" spellcheck="false"></div>' +
      '    <div class="result-hero mt-3"><div class="label">Decimal value</div><div class="value" id="nrNumOut">—</div></div>' +
      '  </div>' +
      '</div>' +
      '<div class="panel"><span class="panel-title">Reference</span>' +
      '<p class="small muted">I = 1 · V = 5 · X = 10 · L = 50 · C = 100 · D = 500 · M = 1000. Standard subtractive notation is supported and validated (IIII is rejected in favour of IV).</p></div>';

    var numIn = OC.qs('#nrNum', root);
    var romanOut = OC.qs('#nrRomanOut', root);
    var romanIn = OC.qs('#nrRoman', root);
    var numOut = OC.qs('#nrNumOut', root);

    function fromNum() {
      var n = OC.parseNum(numIn.value);
      var r = toRoman(n);
      romanOut.textContent = r || '— (out of range)';
    }
    function fromRomanInput() {
      var n = fromRoman(romanIn.value);
      numOut.textContent = n === null ? '— (invalid)' : OC.formatNumber(n, { decimals: 0 });
    }

    numIn.addEventListener('input', fromNum);
    romanIn.addEventListener('input', fromRomanInput);
    fromNum();
    fromRomanInput();
  }

  function renderText(root) {
    root.innerHTML = '' +
      '<div class="grid-2">' +
      '  <div class="panel"><span class="panel-title">Encode</span>' +
      '    <div class="field"><label for="ntText">Text</label><textarea class="input mono" id="ntText" rows="4">Hello, OmniCalc!</textarea></div>' +
      '    <div class="field mt-2"><label for="ntMode">Format</label><select class="select" id="ntMode">' +
      '      <option value="codes">Unicode code points</option>' +
      '      <option value="b64">Base64</option>' +
      '      <option value="hex">Hex (UTF-8 bytes)</option>' +
      '      <option value="bin">Binary (UTF-8 bytes)</option>' +
      '      <option value="json">JSON string literal</option>' +
      '    </select></div>' +
      '    <div class="result-hero mt-3"><div class="label">Encoded</div><div class="value mono small" id="ntOut" style="overflow-wrap:anywhere">—</div></div>' +
      '  </div>' +
      '  <div class="panel"><span class="panel-title">Decode</span>' +
      '    <div class="field"><label for="ntCode">Encoded input</label><textarea class="input mono" id="ntCode" rows="4"></textarea></div>' +
      '    <div class="row mt-2">' +
      '      <button class="btn btn-sm" id="ntDecodeB64" type="button">From Base64</button>' +
      '      <button class="btn btn-sm" id="ntDecodeCodes" type="button">From code points</button>' +
      '      <button class="btn btn-sm" id="ntDecodeMorseHidden" type="button" style="display:none">unused</button>' +
      '    </div>' +
      '    <div class="result-hero mt-3"><div class="label">Decoded text</div><div class="value mono small" id="ntIn" style="overflow-wrap:anywhere">—</div></div>' +
      '  </div>' +
      '</div>';

    var text = OC.qs('#ntText', root);
    var mode = OC.qs('#ntMode', root);
    var out = OC.qs('#ntOut', root);
    var code = OC.qs('#ntCode', root);
    var decoded = OC.qs('#ntIn', root);

    function encode() {
      var s = text.value;
      var m = mode.value;
      try {
        if (m === 'codes') {
          out.textContent = Array.from(s).map(function (c) { return c.codePointAt(0); }).join(' ');
        } else if (m === 'b64') {
          out.textContent = btoa(unescape(encodeURIComponent(s)));
        } else if (m === 'json') {
          out.textContent = JSON.stringify(s);
        } else {
          var bytes = new TextEncoder().encode(s);
          out.textContent = Array.from(bytes).map(function (b) {
            return m === 'hex' ? b.toString(16).padStart(2, '0') : b.toString(2).padStart(8, '0');
          }).join(' ');
        }
      } catch (e) {
        out.textContent = 'Error: ' + e.message;
      }
    }

    function decodeAs(kind) {
      var src = code.value.trim();
      try {
        if (kind === 'b64') {
          decoded.textContent = decodeURIComponent(escape(atob(src)));
        } else if (kind === 'codes') {
          decoded.textContent = src.split(/[\s,]+/).filter(Boolean).map(function (n) {
            var cp = parseInt(n, 10);
            return isFinite(cp) ? String.fromCodePoint(cp) : '';
          }).join('');
        } else if (kind === 'hex') {
          decoded.textContent = new TextDecoder().decode(new Uint8Array(src.split(/[\s]+/).filter(Boolean).map(function (h) { return parseInt(h, 16); })));
        } else if (kind === 'bin') {
          decoded.textContent = new TextDecoder().decode(new Uint8Array(src.split(/[\s]+/).filter(Boolean).map(function (b) { return parseInt(b, 2); })));
        }
      } catch (e) {
        decoded.textContent = 'Error: ' + e.message;
      }
    }

    text.addEventListener('input', encode);
    mode.addEventListener('change', encode);
    OC.qs('#ntDecodeB64', root).addEventListener('click', function () { decodeAs('b64'); });
    OC.qs('#ntDecodeCodes', root).addEventListener('click', function () { decodeAs('codes'); });
    encode();
  }

  function renderMorse(root) {
    root.innerHTML = '' +
      '<div class="grid-2">' +
      '  <div class="panel"><span class="panel-title">Text to Morse</span>' +
      '    <div class="field"><label for="nmText">Text</label><textarea class="input" id="nmText" rows="3">SOS help</textarea></div>' +
      '    <div class="result-hero mt-3"><div class="label">Morse</div><div class="value mono" id="nmOut" style="overflow-wrap:anywhere">—</div></div>' +
      '  </div>' +
      '  <div class="panel"><span class="panel-title">Morse to text</span>' +
      '    <div class="field"><label for="nmCode">Morse (space between letters, / between words)</label><textarea class="input mono" id="nmCode" rows="3">... --- ... / .... . .-.. .--.</textarea></div>' +
      '    <div class="result-hero mt-3"><div class="label">Text</div><div class="value mono" id="nmTextOut" style="overflow-wrap:anywhere">—</div></div>' +
      '  </div>' +
      '</div>';

    var text = OC.qs('#nmText', root);
    var out = OC.qs('#nmOut', root);
    var code = OC.qs('#nmCode', root);
    var textOut = OC.qs('#nmTextOut', root);

    text.addEventListener('input', function () { out.textContent = textToMorse(text.value) || '—'; });
    code.addEventListener('input', function () { textOut.textContent = morseToText(code.value) || '—'; });
    out.textContent = textToMorse(text.value);
    textOut.textContent = morseToText(code.value);
  }

  /* Exposed for the test runner and future reuse. */
  OC.numtools = {
    parseInBase: parseInBase,
    toBase: toBase,
    toRoman: toRoman,
    fromRoman: fromRoman,
    textToMorse: textToMorse,
    morseToText: morseToText
  };

  OC.registerNumberTools = function () {
    OC.registerRoute({
      id: 'numbers',
      name: 'Number Systems',
      icon: 'pin',
      group: 'convert',
      desc: 'Base-N, Roman numerals, encoding and Morse.',
      keywords: 'binary octal hex base64 roman numeral ascii unicode morse encoding text',
      render: renderNumbers
    });
  };
})();
