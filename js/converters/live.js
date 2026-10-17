/* OmniCalc - converters/live.js
   Currency / crypto / metals / legacy-currency pages.
   Live data via fetch() with localStorage cache + bundled offline fallback. */

(function () {
  'use strict';

  var HOUR = 3600 * 1000;

  /* ---------------- fiat: multi-provider chain ---------------- */

  /* Pure payload normalizers (exported for the test runner). Each returns
     { rates, apiUpdated } or throws. Rates are USD-based, merged with the
     bundled seed so the currency list never loses coverage. */
  function fiatWhitelist() {
    var w = {};
    Object.keys(OC.FIAT_SEED.rates).forEach(function (c) { w[c] = true; });
    Object.keys(OC.FIAT_SEED.names).forEach(function (c) { w[c] = true; });
    return w;
  }

  var FIAT_PARSERS = {
    'er-api': function (data) {
      if (!data || data.result === 'error' || !data.rates) throw new Error('unexpected payload');
      var white = fiatWhitelist();
      var rates = { USD: 1 };
      Object.keys(data.rates).forEach(function (code) {
        var up = code.toUpperCase();
        if (white[up]) rates[up] = data.rates[code];
      });
      if (Object.keys(rates).length < 50) throw new Error('too few currencies');
      return {
        rates: rates,
        apiUpdated: data.time_last_update_utc ? new Date(data.time_last_update_utc).toISOString() : null
      };
    },
    'currency-api': function (data) {
      if (!data || !data.usd) throw new Error('unexpected payload');
      var white = fiatWhitelist();
      var rates = { USD: 1 };
      Object.keys(data.usd).forEach(function (code) {
        var up = code.toUpperCase();
        if (white[up] && typeof data.usd[code] === 'number') rates[up] = data.usd[code];
      });
      if (Object.keys(rates).length < 50) throw new Error('too few currencies');
      return {
        rates: rates,
        apiUpdated: data.date ? new Date(data.date + 'T00:00:00Z').toISOString() : null
      };
    },
    'frankfurter': function (data) {
      if (!data || !data.rates) throw new Error('unexpected payload');
      var white = fiatWhitelist();
      var rates = { USD: 1 };
      Object.keys(data.rates).forEach(function (code) {
        var up = code.toUpperCase();
        if (white[up]) rates[up] = data.rates[code];
      });
      return {
        rates: rates,
        apiUpdated: data.date ? new Date(data.date + 'T00:00:00Z').toISOString() : null
      };
    }
  };

  var FIAT_PROVIDERS = [
    { id: 'er-api', label: 'exchangerate-api.com', url: 'https://open.er-api.com/v6/latest/USD' },
    { id: 'currency-api', label: 'jsDelivr currency-api', url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json' },
    { id: 'frankfurter', label: 'frankfurter.app (ECB)', url: 'https://api.frankfurter.app/latest?from=USD' }
  ];

  function fetchFiatChain(i) {
    if (i >= FIAT_PROVIDERS.length) {
      return Promise.reject(new Error('all rates providers failed'));
    }
    var p = FIAT_PROVIDERS[i];
    return OC.live.fetchJSON(p.url, 8000).then(function (data) {
      var parsed = FIAT_PARSERS[p.id](data);
      return {
        rates: Object.assign({}, OC.FIAT_SEED.rates, parsed.rates),
        apiUpdated: parsed.apiUpdated,
        provider: p.label
      };
    }).catch(function (err) {
      console.warn('OmniCalc: fiat provider "' + p.id + '" failed — ' + err.message);
      return fetchFiatChain(i + 1);
    });
  }

  OC.live = {
    fetchJSON: function (url, ms) {
      if (!window.fetch) return Promise.reject(new Error('fetch unsupported'));
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms || 8000) : null;
      return fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
        .then(function (r) {
          if (timer) clearTimeout(timer);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .catch(function (e) {
          if (timer) clearTimeout(timer);
          throw e;
        });
    },

    /* exported for tests */
    fiatParsers: FIAT_PARSERS,
    fiatProviders: FIAT_PROVIDERS,

    fiat: function (force) {
      var cached = OC.rateCache.get('fiat');
      var fresh = cached && cached.updated &&
        (Date.now() - new Date(cached.updated).getTime()) < HOUR;
      var auto = !OC.settings || OC.settings().autoRefreshRates !== false;

      if (!force && fresh) {
        return Promise.resolve({
          rates: cached.rates, source: 'cache', updated: cached.updated,
          provider: cached.provider, apiUpdated: cached.apiUpdated
        });
      }
      if (!auto) {
        if (cached) {
          return Promise.resolve({
            rates: cached.rates, source: 'cache', updated: cached.updated,
            provider: cached.provider, apiUpdated: cached.apiUpdated
          });
        }
        return Promise.resolve({ rates: OC.FIAT_SEED.rates, source: 'seed', updated: null, provider: null });
      }

      return fetchFiatChain(0).then(function (res) {
        var payload = {
          rates: res.rates,
          updated: new Date().toISOString(),
          apiUpdated: res.apiUpdated,
          provider: res.provider,
          base: 'USD'
        };
        OC.rateCache.set('fiat', payload);
        return {
          rates: payload.rates, source: 'live', updated: payload.updated,
          provider: payload.provider, apiUpdated: payload.apiUpdated
        };
      }).catch(function (err) {
        if (cached && cached.rates) {
          return {
            rates: cached.rates, source: 'cache', updated: cached.updated,
            provider: cached.provider, apiUpdated: cached.apiUpdated, error: err.message
          };
        }
        return { rates: OC.FIAT_SEED.rates, source: 'seed', updated: null, provider: null, error: err.message };
      });
    },

    crypto: function (force) {
      var cached = OC.rateCache.get('crypto');
      var fresh = cached && cached.updated &&
        (Date.now() - new Date(cached.updated).getTime()) < HOUR;
      var auto = !OC.settings || OC.settings().autoRefreshRates !== false;

      if (!force && fresh) {
        return Promise.resolve({ prices: cached.prices, source: 'cache', updated: cached.updated, provider: 'CoinGecko' });
      }
      if (!auto) {
        if (cached) {
          return Promise.resolve({ prices: cached.prices, source: 'cache', updated: cached.updated, provider: 'CoinGecko' });
        }
        return Promise.resolve({ prices: null, source: 'seed', updated: null, provider: null });
      }

      var ids = OC.CRYPTO_SEED.coins.map(function (c) { return c.id; }).join(',');
      return OC.live.fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd', 8000)
        .then(function (data) {
          if (!data || typeof data !== 'object') throw new Error('Unexpected API payload');
          var prices = {};
          var any = false;
          Object.keys(data).forEach(function (id) {
            if (data[id] && typeof data[id].usd === 'number') { prices[id] = data[id].usd; any = true; }
          });
          if (!any) throw new Error('Empty price payload');
          var updated = new Date().toISOString();
          OC.rateCache.set('crypto', { prices: prices, updated: updated });
          return { prices: prices, source: 'live', updated: updated, provider: 'CoinGecko' };
        })
        .catch(function (err) {
          if (cached && cached.prices) {
            return { prices: cached.prices, source: 'cache', updated: cached.updated, provider: 'CoinGecko', error: err.message };
          }
          var seed = {};
          OC.CRYPTO_SEED.coins.forEach(function (c) { seed[c.id] = c.price; });
          return { prices: seed, source: 'seed', updated: null, provider: null, error: err.message };
        });
    }
  };

  /* Shared: status banner updater */
  function statusBanner(slot, res, refreshFn) {
    var title, body, type = '';
    if (res.source === 'live') {
      title = 'Live rates';
      body = 'Fetched just now' + (res.provider ? ' via ' + OC.esc(res.provider) : '') +
        (res.apiUpdated ? ' · source data from ' + OC.timeAgo(res.apiUpdated) : '') + '.';
    } else if (res.source === 'cache') {
      title = 'Cached rates';
      body = 'Fetched ' + OC.timeAgo(res.updated) + (res.provider ? ' via ' + OC.esc(res.provider) : '') +
        (res.error ? ' — live refresh failed (' + OC.esc(res.error) + '), showing the cache.' : '.');
      type = res.error ? 'warn' : '';
    } else {
      title = 'Offline reference rates';
      body = 'Approximate bundled values' + (res.error ? ' — live APIs unreachable (' + OC.esc(res.error) + ')' : '') +
        '. Connect to the internet and press Refresh for live rates.';
      type = 'warn';
    }
    slot.innerHTML = OC.ui.banner(type, title, body,
      '<button class="btn btn-sm live-refresh" type="button">' + OC.iconHTML('refresh') + '<span>Refresh</span></button>');
    OC.hydrateIcons(slot);
    var btn = OC.qs('.live-refresh', slot);
    if (btn) btn.addEventListener('click', refreshFn);
  }

  /* Shared pair-converter page skeleton (amount + two unit selects + swap + others). */
  function pairCardHTML(prefix) {
    return '' +
      '<div class="conv-card">' +
      '  <div class="conv-row">' +
      '    <input type="text" inputmode="decimal" class="input" id="' + prefix + 'Amount" value="1" aria-label="Amount" autocomplete="off">' +
      '    <select class="select" id="' + prefix + 'From" aria-label="From"></select>' +
      '  </div>' +
      '  <div class="conv-swap-row">' +
      '    <span class="line"></span>' +
      '    <button class="swap-btn" id="' + prefix + 'Swap" type="button" aria-label="Swap">' + OC.iconHTML('swap_vert') + '</button>' +
      '    <span class="line"></span>' +
      '  </div>' +
      '  <div class="conv-row">' +
      '    <input type="text" class="input" id="' + prefix + 'Out" readonly aria-live="polite" aria-label="Result">' +
      '    <select class="select" id="' + prefix + 'To" aria-label="To"></select>' +
      '  </div>' +
      '  <div class="conv-result-note"><span id="' + prefix + 'Exact" class="live-result"></span><span id="' + prefix + 'CopySlot"></span></div>' +
      '  <div class="other-units">' +
      '    <div class="other-units-title" id="' + prefix + 'OthersTitle">Same amount in other units</div>' +
      '    <div id="' + prefix + 'Others"></div>' +
      '  </div>' +
      '</div>';
  }

  function optionList(units, selected) {
    return units.map(function (u) {
      return '<option value="' + OC.esc(u.id) + '"' + (u.id === selected ? ' selected' : '') + '>' + OC.esc(u.label) + '</option>';
    }).join('');
  }

  /* ---------------- CURRENCY ---------------- */

  function renderCurrency(el, params) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Finance',
      title: 'Currency Converter',
      icon: 'currency_exchange',
      desc: 'Convert 120+ fiat currencies with live rates, cached for offline use.',
      routeId: 'currency'
    }) + '<div id="curBanner"></div>' + pairCardHTML('cur'));

    var amount = OC.qs('#curAmount', page);
    var fromSel = OC.qs('#curFrom', page);
    var out = OC.qs('#curOut', page);
    var toSel = OC.qs('#curTo', page);
    var exact = OC.qs('#curExact', page);
    var others = OC.qs('#curOthers', page);
    var bannerSlot = OC.qs('#curBanner', page);
    OC.qs('#curCopySlot', page).appendChild(OC.ui.copyBtn(function () { return exact.textContent; }, 'Copy'));

    var state = { rates: OC.FIAT_SEED.rates, loaded: false };

    function nameOf(code) {
      var n = OC.FIAT_SEED.names[code];
      return n ? code + ' · ' + n[0] : code;
    }

    function buildSelects() {
      var codes = Object.keys(state.rates).sort();
      var units = codes.map(function (c) { return { id: c, label: nameOf(c) }; });
      var curFrom = (params && params.from ? params.from.toUpperCase() : null) || 'USD';
      var curTo = (params && params.to ? params.to.toUpperCase() : null) || 'EUR';
      if (!state.rates[curFrom]) curFrom = 'USD';
      if (!state.rates[curTo]) curTo = 'EUR';
      fromSel.innerHTML = optionList(units, curFrom);
      toSel.innerHTML = optionList(units, curTo);
      if (params && params.v) amount.value = params.v;
    }

    function convert(v, f, t) {
      if (!state.rates[f] || !state.rates[t]) return NaN;
      return v * state.rates[t] / state.rates[f];
    }

    function update() {
      var v = OC.parseNum(amount.value);
      var f = fromSel.value, t = toSel.value;
      if (!isFinite(v)) { out.value = '—'; exact.textContent = ''; renderOthers(NaN); return; }
      var res = convert(v, f, t);
      out.value = OC.formatNumber(res, { decimals: 'auto' });
      exact.textContent = OC.formatNumber(v, { decimals: 'auto' }) + ' ' + f + ' = ' + OC.formatNumber(res, { decimals: 'auto' }) + ' ' + t;
      renderOthers(v);
    }

    var popular = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY', 'AUD', 'CAD', 'CHF', 'AED', 'SGD', 'HKD', 'NZD', 'SEK', 'ZAR', 'BRL', 'MXN', 'TRY', 'PKR', 'BDT', 'NGN', 'KES', 'THB', 'IDR', 'PHP', 'KRW'];

    function renderOthers(v) {
      if (!isFinite(v)) { others.innerHTML = ''; return; }
      var f = fromSel.value;
      var codes = popular.filter(function (c) { return state.rates[c] && c !== toSel.value; });
      var rest = Object.keys(state.rates).sort().filter(function (c) { return codes.indexOf(c) === -1 && c !== toSel.value; });
      others.innerHTML = codes.concat(rest).slice(0, 60).map(function (c) {
        var val = convert(v, f, c);
        return '<div class="unit-row" data-code="' + c + '" title="Convert into ' + c + '">' +
          '<span class="unit-row-name">' + OC.esc(nameOf(c)) + '</span>' +
          '<span class="unit-row-value">' + OC.formatNumber(val, { decimals: 'auto' }) + '</span></div>';
      }).join('');
    }

    function load(force) {
      OC.live.fiat(force).then(function (res) {
        state.rates = res.rates;
        state.loaded = true;
        var keepFrom = fromSel.value, keepTo = toSel.value;
        buildSelects();
        if (state.rates[keepFrom]) fromSel.value = keepFrom;
        if (state.rates[keepTo]) toSel.value = keepTo;
        statusBanner(bannerSlot, res, function () { bannerSlot.innerHTML = '<div class="page-loading">Refreshing…</div>'; load(true); });
        update();
      });
    }

    amount.addEventListener('input', update);
    fromSel.addEventListener('change', update);
    toSel.addEventListener('change', update);
    OC.qs('#curSwap', page).addEventListener('click', function () {
      var f = fromSel.value; fromSel.value = toSel.value; toSel.value = f; update();
    });
    others.addEventListener('click', function (e) {
      var row = e.target.closest('[data-code]');
      if (!row) return;
      toSel.value = row.getAttribute('data-code');
      update();
    });

    buildSelects();
    load(false);
    update();
  }

  /* ---------------- CRYPTO ---------------- */

  function renderCrypto(el, params) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Finance',
      title: 'Cryptocurrency Converter',
      icon: 'currency_bitcoin',
      desc: 'Top coins by market cap vs USD (and each other) via CoinGecko.',
      routeId: 'crypto'
    }) + '<div id="cxBanner"></div>' + pairCardHTML('cx'));

    var amount = OC.qs('#cxAmount', page);
    var fromSel = OC.qs('#cxFrom', page);
    var out = OC.qs('#cxOut', page);
    var toSel = OC.qs('#cxTo', page);
    var exact = OC.qs('#cxExact', page);
    var others = OC.qs('#cxOthers', page);
    var bannerSlot = OC.qs('#cxBanner', page);
    var othersTitle = OC.qs('#cxOthersTitle', page);
    OC.qs('#cxCopySlot', page).appendChild(OC.ui.copyBtn(function () { return exact.textContent; }, 'Copy'));

    var state = { usd: {}, updated: null };

    var units = [{ id: 'USD', label: 'USD · US Dollar', usd: 1 }].concat(
      OC.CRYPTO_SEED.coins.map(function (c) { return { id: c.sym, label: c.sym + ' · ' + c.name, cg: c.id, seed: c.price }; })
    );

    function priceOf(id) {
      if (id === 'USD') return 1;
      var u = units.filter(function (x) { return x.id === id; })[0];
      if (!u) return NaN;
      var p = state.usd[u.cg];
      return (p !== undefined && isFinite(p)) ? p : u.seed;
    }

    function convert(v, f, t) {
      var pf = priceOf(f), pt = priceOf(t);
      if (!isFinite(pf) || !isFinite(pt) || pf === 0) return NaN;
      return v * pf / pt;
    }

    function buildSelects() {
      var curFrom = (params && params.from ? params.from.toUpperCase() : null) || 'BTC';
      var curTo = (params && params.to ? params.to.toUpperCase() : null) || 'USD';
      var ids = units.map(function (u) { return u.id; });
      if (ids.indexOf(curFrom) === -1) curFrom = 'BTC';
      if (ids.indexOf(curTo) === -1) curTo = 'USD';
      var opts = units.map(function (u) { return { id: u.id, label: u.label }; });
      fromSel.innerHTML = optionList(opts, curFrom);
      toSel.innerHTML = optionList(opts, curTo);
      if (params && params.v) amount.value = params.v;
    }

    function update() {
      var v = OC.parseNum(amount.value);
      var f = fromSel.value, t = toSel.value;
      if (!isFinite(v)) { out.value = '—'; exact.textContent = ''; renderOthers(NaN); return; }
      var res = convert(v, f, t);
      out.value = OC.formatNumber(res, { decimals: 'auto' });
      exact.textContent = OC.formatNumber(v, { decimals: 'auto' }) + ' ' + f + ' = ' + OC.formatNumber(res, { decimals: 'auto' }) + ' ' + t;
      renderOthers(v);
    }

    function renderOthers(v) {
      if (!isFinite(v)) { others.innerHTML = ''; return; }
      var f = fromSel.value;
      othersTitle.textContent = 'Same amount in every tracked currency (sorted by price)';
      var list = units.filter(function (u) { return u.id !== toSel.value; })
        .map(function (u) { return { u: u, val: convert(v, f, u.id) }; })
        .sort(function (a, b) { return priceOf(b.u.id) - priceOf(a.u.id); });
      others.innerHTML = list.map(function (x) {
        return '<div class="unit-row" data-code="' + OC.esc(x.u.id) + '">' +
          '<span class="unit-row-name">' + OC.esc(x.u.label) + '</span>' +
          '<span class="unit-row-value">' + OC.formatNumber(x.val, { decimals: 'auto' }) + '</span></div>';
      }).join('');
    }

    function load(force) {
      OC.live.crypto(force).then(function (res) {
        state.usd = res.prices || {};
        var keepFrom = fromSel.value, keepTo = toSel.value;
        buildSelects();
        if (keepFrom) fromSel.value = keepFrom;
        if (keepTo) toSel.value = keepTo;
        statusBanner(bannerSlot, res, function () { bannerSlot.innerHTML = '<div class="page-loading">Refreshing…</div>'; load(true); });
        update();
      });
    }

    amount.addEventListener('input', update);
    fromSel.addEventListener('change', update);
    toSel.addEventListener('change', update);
    OC.qs('#cxSwap', page).addEventListener('click', function () {
      var f = fromSel.value; fromSel.value = toSel.value; toSel.value = f; update();
    });
    others.addEventListener('click', function (e) {
      var row = e.target.closest('[data-code]');
      if (!row) return;
      toSel.value = row.getAttribute('data-code');
      update();
    });

    buildSelects();
    load(false);
    update();
  }

  /* ---------------- PRECIOUS METALS ---------------- */

  var WEIGHT_UNITS = [
    { id: 'g', label: 'Grams', g: 1 },
    { id: 'kg', label: 'Kilograms', g: 1000 },
    { id: 'ozt', label: 'Troy ounces', g: 31.1034768 },
    { id: 'oz', label: 'Ounces (avoirdupois)', g: 28.349523125 },
    { id: 'tola', label: 'Tola (South Asia)', g: 11.6638125 },
    { id: 'baht', label: 'Baht (Thailand)', g: 15.244 },
    { id: 'dwt', label: 'Pennyweight', g: 1.55517384 },
    { id: 'gr', label: 'Grains', g: 0.06479891 },
    { id: 'lb', label: 'Pounds', g: 453.59237 }
  ];

  function renderMetals(el) {
    var overrides = OC.store.read('metals_prices', {});
    function priceOf(m) {
      var p = overrides[m.id];
      return (typeof p === 'number' && isFinite(p) && p > 0) ? p : m.price;
    }

    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Finance',
      title: 'Precious Metals',
      icon: 'diamond',
      desc: 'Value gold, silver, platinum or palladium by weight — with tola and baht units.',
      routeId: 'metals'
    }) + OC.ui.banner('', 'Reference prices',
      'Prices are reference spot values in USD per troy ounce. Edit a price — your override is saved locally. Live metals APIs need a key, so OmniCalc stays offline-friendly here.') +
      '<div class="conv-card">' +
      '  <div class="conv-row">' +
      '    <input type="text" inputmode="decimal" class="input" id="mAmount" value="1" aria-label="Weight">' +
      '    <select class="select" id="mUnit" aria-label="Weight unit">' + optionList(WEIGHT_UNITS, 'g') + '</select>' +
      '  </div>' +
      '  <div class="conv-row mt-3">' +
      '    <select class="select" id="mMetal" aria-label="Metal"></select>' +
      '    <div class="field"><label>Price USD / troy oz</label><input type="text" inputmode="decimal" class="input mono" id="mPrice"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Estimated value</div><div class="value" id="mValue">—</div></div>' +
      '  <div class="other-units"><div class="other-units-title">Price breakdown</div><div id="mBreak"></div></div>' +
      '</div>');

    var amount = OC.qs('#mAmount', page);
    var unitSel = OC.qs('#mUnit', page);
    var metalSel = OC.qs('#mMetal', page);
    var priceInput = OC.qs('#mPrice', page);
    var valueEl = OC.qs('#mValue', page);
    var breakEl = OC.qs('#mBreak', page);

    metalSel.innerHTML = OC.METALS.metals.map(function (m) {
      return '<option value="' + m.id + '">' + m.name + ' (' + m.id + ')</option>';
    }).join('');

    function currentMetal() {
      return OC.METALS.metals.filter(function (m) { return m.id === metalSel.value; })[0];
    }

    function update() {
      var v = OC.parseNum(amount.value);
      var metal = currentMetal();
      var price = OC.parseNum(priceInput.value);
      if (!isFinite(price) || price <= 0) price = priceOf(metal);
      var unit = WEIGHT_UNITS.filter(function (u) { return u.id === unitSel.value; })[0];
      if (!isFinite(v)) { valueEl.textContent = '—'; return; }
      var grams = v * unit.g;
      var value = grams / 31.1034768 * price;
      valueEl.textContent = '$' + OC.formatNumber(value, { decimals: 'auto' });
      breakEl.innerHTML = WEIGHT_UNITS.map(function (u) {
        var per = (u.id === 'ozt' ? price : (u.g / 31.1034768) * price);
        return '<div class="unit-row"><span class="unit-row-name">Price per ' + u.label.toLowerCase() + '</span>' +
          '<span class="unit-row-value">$' + OC.formatNumber(per, { decimals: 'auto' }) + '</span></div>';
      }).join('');
    }

    metalSel.addEventListener('change', function () {
      priceInput.value = String(priceOf(currentMetal()));
      update();
    });
    priceInput.addEventListener('change', function () {
      var p = OC.parseNum(priceInput.value);
      if (isFinite(p) && p > 0) {
        overrides[metalSel.value] = p;
        OC.store.write('metals_prices', overrides);
      }
      update();
    });
    amount.addEventListener('input', update);
    unitSel.addEventListener('change', update);

    priceInput.value = String(priceOf(currentMetal()));
    update();
  }

  /* ---------------- LEGACY (PRE-EURO) CURRENCIES ---------------- */

  function renderLegacy(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Finance',
      title: 'Historic Currencies',
      icon: 'history_edu',
      desc: 'Pre-Euro national currencies of the Eurozone at their irrevocable fixed conversion rates.',
      routeId: 'legacy'
    }) + OC.ui.banner('', 'Fixed forever',
      'These are the exact legal rates locked when each country adopted the Euro — they never change.') +
      '<div class="conv-card">' +
      '  <div class="conv-form">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label>Amount</label><input type="text" inputmode="decimal" class="input" id="lgAmount" value="100"></div>' +
      '    <div class="field"><label>Legacy currency</label><select class="select" id="lgCur"></select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Value in Euro (and USD today)</div><div class="value" id="lgValue">—</div></div>' +
      '  </div>' +
      '  <div class="other-units"><div class="other-units-title">All legacy rates to EUR — click to select</div><div id="lgTable"></div></div>' +
      '</div>');

    var amount = OC.qs('#lgAmount', page);
    var curSel = OC.qs('#lgCur', page);
    var valueEl = OC.qs('#lgValue', page);
    var tableEl = OC.qs('#lgTable', page);

    curSel.innerHTML = OC.LEGACY_EUR.map(function (c) {
      return '<option value="' + c.code + '">' + OC.esc(c.code + ' · ' + c.name) + '</option>';
    }).join('');

    var usdPerEur = null; /* filled from cache/seed */

    function update() {
      var v = OC.parseNum(amount.value);
      var cur = OC.LEGACY_EUR.filter(function (c) { return c.code === curSel.value; })[0];
      if (!isFinite(v)) { valueEl.textContent = '—'; return; }
      var eur = v / cur.rate;
      var txt = '€ ' + OC.formatNumber(eur, { decimals: 'auto' });
      if (usdPerEur) {
        txt += '  ·  ' + OC.formatNumber(eur * usdPerEur, { decimals: 'auto' }) + ' USD';
      }
      valueEl.textContent = txt;
    }

    OC.live.fiat(false).then(function (res) {
      var r = res.rates;
      if (r && r.EUR) usdPerEur = 1 / r.EUR;
      else if (r && r.USD && r.USD !== 1) usdPerEur = r.USD / (r.EUR || 1);
      update();
    });

    tableEl.innerHTML = OC.LEGACY_EUR.map(function (c) {
      return '<div class="unit-row" data-code="' + c.code + '"><span class="unit-row-name">' + OC.esc(c.name) + '</span>' +
        '<span class="unit-row-value">1 ' + c.code + ' = € ' + OC.formatNumber(1 / c.rate, { decimals: 'auto' }) + '</span></div>';
    }).join('');

    amount.addEventListener('input', update);
    curSel.addEventListener('change', update);
    tableEl.addEventListener('click', function (e) {
      var row = e.target.closest('[data-code]');
      if (!row) return;
      curSel.value = row.getAttribute('data-code');
      update();
    });

    update();
  }

  OC.registerLiveConverters = function () {
    OC.registerRoute({
      id: 'currency', name: 'Currency', icon: 'currency_exchange', group: 'convert',
      desc: 'Live fiat exchange rates with offline cache.', keywords: 'currency fiat money exchange rate usd eur inr forex dollar',
      render: renderCurrency
    });
    OC.registerRoute({
      id: 'crypto', name: 'Cryptocurrency', icon: 'currency_bitcoin', group: 'convert',
      desc: 'Top cryptocurrencies vs USD via CoinGecko.', keywords: 'crypto bitcoin ethereum btc eth coin market price',
      render: renderCrypto
    });
    OC.registerRoute({
      id: 'metals', name: 'Precious Metals', icon: 'diamond', group: 'convert',
      desc: 'Gold, silver, platinum and palladium by weight.', keywords: 'gold silver platinum palladium metal tola baht ounce bullion',
      render: renderMetals
    });
    OC.registerRoute({
      id: 'legacy', name: 'Historic Currencies', icon: 'history_edu', group: 'convert',
      desc: 'Pre-Euro European currencies at fixed rates.', keywords: 'historic deutschmark franc lira peseta legacy pre-euro coins currency',
      render: renderLegacy
    });
  };
})();
