/* OmniCalc - search.js
   Universal search: parses "10 km to miles", matches currencies/crypto/tools,
   renders a results dropdown. Used by the header and the home hero. */

(function () {
  'use strict';

  var CONVERT_RE = /^\s*(-?[\d.,]+)\s*([a-zA-Zµ°$€£¥₹\/²³]+(?:\s?[a-zA-Z]+)?|)\s*(?:to|in|->|→|=)\s*([a-zA-Zµ°$€£¥₹\/²³]+(?:\s?[a-zA-Z]+)?)\s*$/i;

  function fiatIndex() {
    if (OC._fiatIndex) return OC._fiatIndex;
    var idx = {};
    Object.keys(OC.FIAT_SEED.rates).forEach(function (code) {
      idx[code.toLowerCase()] = code;
      var n = OC.FIAT_SEED.names[code];
      if (n) {
        n[0].toLowerCase().split(/[^a-z]+/).forEach(function (word) {
          if (word.length > 2 && !idx[word]) idx[word] = code;
        });
      }
    });
    OC._fiatIndex = idx;
    return idx;
  }

  function cryptoIndex() {
    if (OC._cryptoIndex) return OC._cryptoIndex;
    var idx = {};
    OC.CRYPTO_SEED.coins.forEach(function (c) {
      idx[c.sym.toLowerCase()] = c.sym;
      c.name.toLowerCase().split(/[^a-z]+/).forEach(function (word) {
        if (word.length > 2 && !idx[word]) idx[word] = c.sym;
      });
    });
    OC._cryptoIndex = idx;
    return idx;
  }

  function unitLookup(token) {
    if (!token) return null;
    var key = token.toLowerCase().replace(/[.\s]/g, '');
    var idx = OC.unitIndex();
    return idx[key] || null;
  }

  /* Parse a direct conversion request. Returns {cat, from, to, value, via} or null. */
  function parseConvert(query) {
    var m = CONVERT_RE.exec(query);
    if (!m) return null;
    var value = OC.parseNum(m[1]);
    if (!isFinite(value)) return null;
    var fromTok = m[2] ? m[2].trim() : '';
    var toTok = m[3].trim();

    var fiats = fiatIndex();
    var cryptos = cryptoIndex();

    var fromFiat = fiats[fromTok.toLowerCase()];
    var toFiat = fiats[toTok.toLowerCase()];
    if (fromFiat && toFiat) {
      return { cat: 'currency', from: fromFiat, to: toFiat, value: value, via: 'currency' };
    }

    var fromCry = cryptos[fromTok.toLowerCase()];
    var toCry = cryptos[toTok.toLowerCase()];
    if ((fromCry || fromFiat) && (toCry || toFiat) && !(fromFiat && toFiat)) {
      var from = fromCry || fromFiat || 'USD';
      var to = toCry || toFiat || 'USD';
      return { cat: 'crypto', from: from, to: to, value: value, via: 'crypto' };
    }

    var fu = unitLookup(fromTok);
    var tu = unitLookup(toTok);
    if (fu && tu && fu.cat === tu.cat) {
      return { cat: fu.cat, from: fu.unit, to: tu.unit, value: value, via: 'units' };
    }
    if (tu && !fu && !fromTok) {
      /* "10 to miles" — use the category's default source unit */
      var cat = OC.UNITS[tu.cat];
      var def = cat && (cat.defaultFrom || (cat.units[0] && cat.units[0].id));
      if (def) return { cat: tu.cat, from: def, to: tu.unit, value: value, via: 'units' };
    }
    return null;
  }

  var STOPWORDS = { to: 1, in: 1, of: 1, a: 1, an: 1, the: 1, for: 1, per: 1, my: 1, and: 1, is: 1 };

  function toolMatches(query) {
    var q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    var words = q.split(/[^a-z0-9°]+/).filter(function (w) {
      return w.length >= 2 && !STOPWORDS[w];
    });
    var results = [];
    OC.routeList.forEach(function (id) {
      var r = OC.routes[id];
      if (!r || id === 'home' || id === 'settings') return;
      var name = r.name.toLowerCase();
      var kw = (r.keywords || '').toLowerCase();
      var desc = (r.desc || '').toLowerCase();
      var score = 0.01;

      if (name === q) score += 6;
      else if (name.indexOf(q) === 0) score += 4;
      else if (name.indexOf(q) !== -1) score += 3;
      if (id === q) score += 3;
      else if (id.indexOf(q) === 0) score += 2;

      words.forEach(function (w) {
        var variants = w.length > 3 ? [w, w.replace(/s$/, ''), w.replace(/es$/, '')] : [w];
        var wordScore = 0;
        variants.forEach(function (v) {
          if (v.length < 2) return;
          if (name.indexOf(v) !== -1) wordScore = Math.max(wordScore, 2);
          else if (kw.indexOf(v) !== -1) wordScore = Math.max(wordScore, 1.5);
          else if (desc.indexOf(v) !== -1) wordScore = Math.max(wordScore, 0.5);
        });
        score += wordScore;
      });

      if (score >= 2) results.push({ route: r, score: score });
    });
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 8);
  }

  function search(query) {
    var out = [];
    var conv = parseConvert(query);
    if (conv) {
      var cat = OC.UNITS[conv.cat];
      var title, sub;
      var fromLabel = conv.from, toLabel = conv.to;
      if (conv.via === 'units' && cat) {
        var fu = cat.units.filter(function (u) { return u.id === conv.from; })[0];
        var tu = cat.units.filter(function (u) { return u.id === conv.to; })[0];
        fromLabel = fu ? fu.label : conv.from;
        toLabel = tu ? tu.label : conv.to;
        var preview = OC.convertIn(conv.cat, conv.value, conv.from, conv.to);
        title = OC.formatNumber(conv.value) + ' ' + fromLabel + ' → ' + OC.formatNumber(preview, { decimals: 'auto' }) + ' ' + toLabel;
        sub = 'Open the ' + cat.name.toLowerCase() + ' converter';
      } else if (conv.via === 'currency') {
        title = conv.value + ' ' + conv.from + ' → ' + conv.to;
        sub = 'Currency converter with live rates';
      } else {
        title = conv.value + ' ' + conv.from + ' → ' + conv.to;
        sub = 'Crypto converter via CoinGecko';
      }
      out.push({
        icon: conv.via === 'currency' ? 'currency_exchange' : conv.via === 'crypto' ? 'currency_bitcoin' : (cat && cat.icon) || 'calculate',
        title: title,
        sub: sub,
        go: function () {
          OC.router.go(conv.cat, { v: conv.value, from: conv.from, to: conv.to });
        }
      });
    }

    toolMatches(query).forEach(function (m) {
      out.push({
        icon: m.route.icon,
        title: m.route.name,
        sub: m.route.desc || '',
        go: function () { OC.router.go(m.route.id); }
      });
    });

    /* direct unit suggestions (e.g. typing "kilometer") */
    if (!conv && query.trim().length >= 3) {
      var key = query.trim().toLowerCase().replace(/[.\s]/g, '');
      var idx = OC.unitIndex();
      var hit = idx[key];
      if (hit) {
        var cat2 = OC.UNITS[hit.cat];
        var unit = cat2.units.filter(function (u) { return u.id === hit.unit; })[0];
        out.unshift({
          icon: cat2.icon,
          title: unit.label + ' — ' + cat2.name,
          sub: 'Open converter · ' + (unit.symbol || ''),
          go: function () { OC.router.go(hit.cat, { from: hit.unit }); }
        });
      }
    }

    return out;
  }

  /* ---------------- dropdown wiring ---------------- */

  function attach(input, resultsEl, onAfterPick) {
    var results = [];
    var highlighted = -1;
    var open = false;

    function close() {
      open = false;
      highlighted = -1;
      resultsEl.classList.remove('show');
    }

    function render() {
      if (!results.length) {
        resultsEl.innerHTML = '<div class="search-empty">No matches. Try “10 km to miles”, “100 usd to inr” or “tip”.</div>';
      } else {
        resultsEl.innerHTML = results.map(function (r, i) {
          return '<div class="search-item ' + (i === highlighted ? 'highlighted' : '') + '" data-i="' + i + '" role="option">' +
            OC.iconHTML(r.icon) +
            '<div class="search-item-text"><div class="search-item-title">' + OC.esc(r.title) + '</div>' +
            '<div class="search-item-sub">' + OC.esc(r.sub) + '</div></div>' +
            '<span class="search-kbd">↵</span></div>';
        }).join('');
        OC.hydrateIcons(resultsEl);
      }
      resultsEl.classList.add('show');
      open = true;
    }

    function pick(i) {
      var r = results[i];
      if (!r) return;
      input.value = '';
      close();
      r.go();
      if (onAfterPick) onAfterPick();
    }

    input.addEventListener('input', function () {
      var q = input.value;
      if (!q.trim()) { close(); return; }
      results = search(q);
      highlighted = results.length ? 0 : -1;
      render();
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.length) { highlighted = (highlighted + 1) % results.length; render(); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length) { highlighted = (highlighted - 1 + results.length) % results.length; render(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open && results.length) pick(highlighted === -1 ? 0 : highlighted);
        else {
          var q = input.value;
          if (q.trim()) { results = search(q); if (results.length) pick(0); }
        }
      } else if (e.key === 'Escape') {
        close();
        input.blur();
      }
    });

    resultsEl.addEventListener('click', function (e) {
      var item = e.target.closest('.search-item');
      if (item) pick(parseInt(item.getAttribute('data-i'), 10));
    });

    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !resultsEl.contains(e.target)) close();
    });
  }

  OC.search = {
    search: search,
    parseConvert: parseConvert,
    attach: attach
  };
})();
