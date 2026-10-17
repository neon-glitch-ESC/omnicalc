/* OmniCalc - utils.js
   Namespace, DOM helpers, number formatting, icon helper. No dependencies. */

window.OC = window.OC || {};
OC.ICONS = OC.ICONS || {};

(function () {
  'use strict';

  /* ---------------- DOM helpers ---------------- */

  OC.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  OC.el = function (html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  OC.qs = function (sel, root) { return (root || document).querySelector(sel); };
  OC.qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- icon helper (Material Symbols codepoints) ---------------- */

  OC.iconHTML = function (name, cls) {
    var ch = OC.ICONS[name] || OC.ICONS['help'] || '';
    return '<span class="msym ' + (cls || '') + '" aria-hidden="true">' + ch + '</span>';
  };

  /* Replace every <span data-icon="name"> placeholder in a root element. */
  OC.hydrateIcons = function (root) {
    OC.qsa('[data-icon]', root || document).forEach(function (n) {
      var name = n.getAttribute('data-icon');
      n.textContent = OC.ICONS[name] || OC.ICONS['help'] || '';
      n.classList.add('msym');
      n.removeAttribute('data-icon');
    });
  };

  /* ---------------- number formatting ---------------- */

  OC.roundSig = function (v, sig) {
    if (!isFinite(v) || v === 0) return v;
    var d = Math.ceil(Math.log10(Math.abs(v)));
    var p = sig - d;
    var m = Math.pow(10, p);
    return Math.round(v * m) / m;
  };

  OC.formatNumber = function (v, opts) {
    opts = opts || {};
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'string') return v;
    if (Number.isNaN(v)) return 'NaN';
    if (!isFinite(v)) return v > 0 ? '∞' : '−∞';

    var s = OC.settings();
    var decimals = opts.decimals !== undefined ? opts.decimals : s.decimals;
    var grouping = opts.grouping !== undefined ? opts.grouping : s.grouping;
    var abs = Math.abs(v);

    if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
      var sig = decimals === 'auto' ? 8 : Math.min(decimals + 6, 10);
      var str = v.toExponential(Math.max(0, sig - 1));
      return str.replace('e', ' × 10^');
    }

    var max = decimals === 'auto' ? 10 : decimals;
    var rounded = OC.roundSig(v, decimals === 'auto' ? 10 : 15);
    if (decimals !== 'auto') {
      rounded = Number(v.toFixed(decimals));
    }
    return rounded.toLocaleString(undefined, {
      maximumFractionDigits: max,
      minimumFractionDigits: 0,
      useGrouping: grouping
    });
  };

  /* Scientific-notation-friendly value for charts/labels */
  OC.fmtAxis = function (v) {
    var abs = Math.abs(v);
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-4)) {
      return OC.roundSig(v, 4).toExponential(2).replace('e', 'e');
    }
    return String(OC.roundSig(v, 5));
  };

  OC.parseNum = function (str) {
    if (typeof str === 'number') return str;
    if (str === null || str === undefined) return NaN;
    var s = String(str).trim().replace(/[,\s_]/g, '');
    if (s === '') return NaN;
    if (/^\.\d/.test(s)) s = '0' + s;
    if (/^-\d/.test(s)) s = '−' + s.slice(1);
    s = s.replace(/−/g, '-');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  };

  /* ---------------- misc ---------------- */

  OC.debounce = function (fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  };

  OC.throttle = function (fn, ms) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now(), ctx = this, args = arguments;
      if (now - last >= ms) { last = now; fn.apply(ctx, args); }
      else if (!timer) {
        timer = setTimeout(function () { last = Date.now(); timer = null; fn.apply(ctx, args); }, ms - (now - last));
      }
    };
  };

  OC.uid = function () {
    return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  OC.todayISO = function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  OC.toISODate = function (d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  OC.addDays = function (d, n) {
    var c = new Date(d.getTime());
    c.setDate(c.getDate() + n);
    return c;
  };

  OC.daysInMonth = function (y, m) { return new Date(y, m + 1, 0).getDate(); };

  OC.downloadTextFile = function (name, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      a.remove();
    }, 300);
  };

  OC.readFile = function (file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(fr.result); };
      fr.onerror = reject;
      fr.readAsText(file);
    });
  };

  /* Relative "time ago" label */
  OC.timeAgo = function (isoString) {
    var then = new Date(isoString).getTime();
    if (isNaN(then)) return 'unknown';
    var diff = Math.max(0, Date.now() - then);
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    var days = Math.floor(hours / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
  };

  /* Simple pub/sub bus */
  OC.bus = (function () {
    var map = {};
    return {
      on: function (type, fn) {
        (map[type] = map[type] || []).push(fn);
        return function () { map[type] = map[type].filter(function (f) { return f !== fn; }); };
      },
      emit: function (type, data) {
        (map[type] || []).forEach(function (fn) { fn(data); });
      }
    };
  })();
})();
