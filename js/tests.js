/* OmniCalc - tests.js
   Hand-rolled assertion runner (no dependencies). Open tests.html. */

(function () {
  'use strict';

  var passed = 0, failed = 0;
  var rows = [];

  function approx(a, b, eps) {
    eps = eps || 1e-9;
    return Math.abs(a - b) <= eps * Math.max(1, Math.abs(b));
  }

  function near(a, b, msg, eps) {
    if (!approx(a, b, eps)) throw new Error((msg || 'near') + ': expected ≈' + b + ', got ' + a);
  }

  function eq(a, b, msg) {
    if (a !== b) throw new Error((msg || 'eq') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a));
  }

  function ok(cond, msg) {
    if (!cond) throw new Error(msg || 'expected truthy');
  }

  function test(name, fn) {
    try {
      fn();
      passed++;
      rows.push({ name: name, ok: true });
    } catch (e) {
      failed++;
      rows.push({ name: name, ok: false, err: e.message });
    }
  }

  /* ---------- expression parser ---------- */

  test('parser: precedence 3 + 4 × 2 = 11', function () {
    eq(OC.expr.evaluate('3 + 4 * 2'), 11);
  });

  test('parser: parentheses (3+4)×2 = 14', function () {
    eq(OC.expr.evaluate('(3 + 4) * 2'), 14);
  });

  test('parser: power is right-associative 2^3^2 = 512', function () {
    eq(OC.expr.evaluate('2^3^2'), 512);
  });

  test('parser: unary minus binds after power: -2^2 = -4', function () {
    eq(OC.expr.evaluate('-2^2'), -4);
  });

  test('parser: implicit multiplication 2(3+4) = 14, 2pi ≈ 6.2832', function () {
    eq(OC.expr.evaluate('2(3+4)'), 14);
    near(OC.expr.evaluate('2pi'), 2 * Math.PI, 'two pi');
  });

  test('parser: factorial 5! = 120, gamma(0.5) = √π', function () {
    eq(OC.expr.evaluate('5!'), 120);
    near(OC.expr.evaluate('gamma(0.5)'), Math.sqrt(Math.PI), 'gamma half', 1e-6);
  });

  test('parser: nCr(5,2) = 10, nPr(5,2) = 20', function () {
    eq(OC.expr.evaluate('ncr(5,2)'), 10);
    eq(OC.expr.evaluate('npr(5,2)'), 20);
  });

  test('parser: modulo, gcd, sqrt, log', function () {
    eq(OC.expr.evaluate('7 % 3'), 1);
    eq(OC.expr.evaluate('gcd(12,18)'), 6);
    eq(OC.expr.evaluate('sqrt(16)'), 4);
    near(OC.expr.evaluate('log(1000)'), 3, 'log10');
    near(OC.expr.evaluate('ln(e)'), 1, 'ln e');
  });

  test('parser: errors are thrown, not eval-ed', function () {
    var r = OC.expr.tryEvaluate('2 +');
    ok(!r.ok, '2 + should fail');
    var r2 = OC.expr.tryEvaluate('alert(1)');
    ok(!r2.ok, 'alert(1) must be rejected');
    var r3 = OC.expr.tryEvaluate('window');
    ok(!r3.ok, 'unknown identifiers must be rejected');
  });

  test('trig: degrees mode sin(30)=0.5, cos(60)=0.5, tan(45)=1', function () {
    OC.saveSettings({ angleMode: 'deg' });
    near(OC.expr.evaluate('sin(30)'), 0.5, 'sin30');
    near(OC.expr.evaluate('cos(60)'), 0.5, 'cos60');
    near(OC.expr.evaluate('tan(45)'), 1, 'tan45');
  });

  test('trig: radians mode sin(pi/2)=1', function () {
    OC.saveSettings({ angleMode: 'rad' });
    near(OC.expr.evaluate('sin(pi/2)'), 1, 'sin pi/2');
    near(OC.expr.evaluate('asin(1)'), Math.PI / 2, 'asin 1');
    OC.saveSettings({ angleMode: 'deg' });
  });

  /* ---------- unit conversions ---------- */

  test('length: 1 km = 0.621371192 mi, 1 mi = 1609.344 m, 1 in = 2.54 cm', function () {
    near(OC.convertIn('length', 1, 'kilometer', 'mile'), 0.621371192237334, 'km→mi', 1e-9);
    near(OC.convertIn('length', 1, 'mile', 'meter'), 1609.344, 'mi→m');
    near(OC.convertIn('length', 1, 'inch', 'centimeter'), 2.54, 'in→cm');
    near(OC.convertIn('length', 1, 'light-year', 'kilometer'), 9.4607304725808e12, 'ly→km');
  });

  test('temperature: 100C = 212F, 32F = 0C, 0C = 273.15K, -40C = -40F', function () {
    near(OC.convertIn('temperature', 100, 'celsius', 'fahrenheit'), 212);
    near(OC.convertIn('temperature', 32, 'fahrenheit', 'celsius'), 0);
    near(OC.convertIn('temperature', 0, 'celsius', 'kelvin'), 273.15);
    near(OC.convertIn('temperature', -40, 'celsius', 'fahrenheit'), -40);
  });

  test('temperature: 212F = 373.15K, 0C = 150 delisle', function () {
    near(OC.convertIn('temperature', 212, 'fahrenheit', 'kelvin'), 373.15, 'F→K', 1e-9);
    near(OC.convertIn('temperature', 0, 'celsius', 'delisle'), 150, 'C→De', 1e-9);
  });

  test('mass: 1 kg ≈ 2.2046226218 lb, 1 stone = 14 lb', function () {
    near(OC.convertIn('mass', 1, 'kilogram', 'pound'), 2.204622621848776, 'kg→lb');
    near(OC.convertIn('mass', 1, 'stone', 'pound'), 14, 'stone→lb', 1e-9);
  });

  test('volume: 1 US gal = 3.785411784 L, 1 cup = 236.588 ml, 1 UK pint = 568.261 ml', function () {
    near(OC.convertIn('volume', 1, 'us-gallon', 'liter'), 3.785411784, 'gal→L');
    near(OC.convertIn('volume', 1, 'us-cup', 'milliliter'), 236.5882365, 'cup→ml');
    near(OC.convertIn('volume', 1, 'imperial-pint', 'milliliter'), 568.26125, 'UK pint');
  });

  test('area: 1 acre = 4046.856 m², 1 ha ≈ 2.471054 acres', function () {
    near(OC.convertIn('area', 1, 'acre', 'square-meter'), 4046.8564224, 'acre');
    near(OC.convertIn('area', 1, 'hectare', 'acre'), 2.471053814671653, 'ha→acre');
  });

  test('speed: 1 m/s = 3.6 km/h, 1 knot = 1.852 km/h', function () {
    near(OC.convertIn('speed', 1, 'meter-per-second', 'kilometer-per-hour'), 3.6);
    near(OC.convertIn('speed', 1, 'knot', 'kilometer-per-hour'), 1.852);
  });

  test('digital: 1 GiB = 1073741824 B, 1 GB ≈ 0.93132 GiB', function () {
    near(OC.convertIn('digital', 1, 'gibibyte', 'byte'), 1073741824, 'GiB', 1e-12);
    near(OC.convertIn('digital', 1, 'gigabyte', 'gibibyte'), 0.9313225746154785, 'GB→GiB');
  });

  test('fuel: 30 mpg(US) ≈ 7.8405 L/100km and round-trips', function () {
    var l100 = OC.convertIn('fuel', 30, 'mpg-us', 'liter-per-100km');
    near(l100, 7.840486111111111, 'mpg→L100', 1e-9);
    near(OC.convertIn('fuel', l100, 'liter-per-100km', 'mpg-us'), 30, 'round trip', 1e-9);
    near(OC.convertIn('fuel', 8, 'liter-per-100km', 'mpg-us'), 29.401822916666667, 'L100→mpg');
  });

  test('pressure: 1 atm = 101325 Pa, 1 bar ≈ 14.5038 psi', function () {
    near(OC.convertIn('pressure', 1, 'atmosphere', 'pascal'), 101325);
    near(OC.convertIn('pressure', 1, 'bar', 'psi'), 14.503773773020923, 'bar→psi');
  });

  test('energy: 1 kcal = 4184 J, 1 kWh = 3.6 MJ', function () {
    near(OC.convertIn('energy', 1, 'kilocalorie', 'joule'), 4184);
    near(OC.convertIn('energy', 1, 'kilowatt-hour', 'joule'), 3.6e6);
  });

  test('power: 1 hp = 745.7 W, 1 kW ≈ 1.341 hp', function () {
    near(OC.convertIn('power', 1, 'horsepower-mechanical', 'watt'), 745.6998715822702);
    near(OC.convertIn('power', 1, 'kilowatt', 'horsepower-mechanical'), 1.3410220895950279, 'kW→hp');
  });

  test('time: 1 day = 86400 s, 1 year ≈ 31556952 s', function () {
    near(OC.convertIn('time', 1, 'day', 'second'), 86400);
    near(OC.convertIn('time', 1, 'year', 'second'), 31556952);
  });

  test('angle: 180° = π rad, 180° = 200 gradians', function () {
    near(OC.convertIn('angle', 180, 'degree', 'radian'), Math.PI);
    near(OC.convertIn('angle', 180, 'degree', 'gradian'), 200);
  });

  /* ---------- helpers ---------- */

  test('resolveUnit: aliases map to unit ids', function () {
    eq(OC.resolveUnit(OC.UNITS.length, 'km'), 'kilometer');
    eq(OC.resolveUnit(OC.UNITS.mass, 'lb'), 'pound');
    eq(OC.resolveUnit(OC.UNITS.temperature, '°F'), 'fahrenheit');
    eq(OC.resolveUnit(OC.UNITS.volume, 'cup'), 'us-cup');
  });

  test('number formatting: 0.1 + 0.2 shows 0.3, big numbers group', function () {
    eq(OC.formatNumber(0.1 + 0.2, { grouping: false }), '0.3');
    eq(OC.formatNumber(1234567.89, { decimals: 2, grouping: false }), '1234567.89');
    eq(OC.roundSig(6.2137119223733395, 10), 6.213711922);
  });

  test('parseNum handles junk and separators', function () {
    eq(OC.parseNum('1,234.5'), 1234.5);
    ok(isNaN(OC.parseNum('12abc')), 'junk should be NaN');
    eq(OC.parseNum('1e3'), 1000);
  });

  /* ---------- numbers & encodings ---------- */

  test('base conversion: ff hex = 255, 255 = 11111111 binary', function () {
    eq(OC.numtools.parseInBase('ff', 16), 255n);
    eq(OC.numtools.toBase(255n, 2), '11111111');
    eq(OC.numtools.toBase(255n, 16), 'ff');
    eq(OC.numtools.parseInBase('11111111', 2), 255n);
  });

  test('roman numerals: 2026 = MMXXVI, MCMXCIV = 1994, IIII rejected', function () {
    eq(OC.numtools.toRoman(2026), 'MMXXVI');
    eq(OC.numtools.fromRoman('MCMXCIV'), 1994);
    eq(OC.numtools.fromRoman('IIII'), null);
    eq(OC.numtools.toRoman(4000), null);
  });

  test('morse: SOS round-trips, word separator works', function () {
    eq(OC.numtools.textToMorse('SOS'), '... --- ...');
    eq(OC.numtools.morseToText('... --- ...'), 'SOS');
    eq(OC.numtools.morseToText(OC.numtools.textToMorse('HI YOU')), 'HI YOU');
  });

  /* ---------- search parsing ---------- */

  test('search: "10 km to miles" parses to length conversion', function () {
    var p = OC.search.parseConvert('10 km to miles');
    ok(p, 'should parse');
    eq(p.cat, 'length');
    eq(p.from, 'kilometer');
    eq(p.to, 'mile');
    eq(p.value, 10);
  });

  test('search: "100 usd to eur" parses to currency', function () {
    var p = OC.search.parseConvert('100 usd to eur');
    ok(p, 'should parse');
    eq(p.cat, 'currency');
    eq(p.from, 'USD');
    eq(p.to, 'EUR');
  });

  test('search: "350 f to c" parses to temperature', function () {
    var p = OC.search.parseConvert('350 f to c');
    ok(p, 'should parse');
    eq(p.cat, 'temperature');
    eq(p.from, 'fahrenheit');
    eq(p.to, 'celsius');
  });

  test('search: complex phrases do not fake a conversion', function () {
    eq(OC.search.parseConvert('1 cup flour in grams'), null);
    eq(OC.search.parseConvert('hello world'), null);
    var p = OC.search.parseConvert('10 to miles');
    ok(p, 'bare number to unit still works');
    eq(p.cat, 'length');
    eq(p.to, 'mile');
  });

  /* ---------- live data parsers ---------- */

  test('live: er-api parser keeps known fiat and filters unknown codes', function () {
    var payload = {
      result: 'success',
      time_last_update_utc: 'Wed, 15 Oct 2026 00:02:31 +0000',
      rates: {}
    };
    Object.keys(OC.FIAT_SEED.rates).forEach(function (c) { payload.rates[c] = OC.FIAT_SEED.rates[c]; });
    payload.rates.EUR = 0.92;
    payload.rates.INR = 83.5;
    payload.rates.XYZ = 5;              /* unknown 3-letter code */
    var p = OC.live.fiatParsers['er-api'](payload);
    eq(p.rates.EUR, 0.92);
    eq(p.rates.INR, 83.5);
    eq(p.rates.XYZ, undefined, 'unknown codes must be filtered');
    ok(!!p.apiUpdated, 'apiUpdated is parsed');
  });

  test('live: er-api parser rejects error payloads', function () {
    var threw = false;
    try {
      OC.live.fiatParsers['er-api']({ result: 'error', 'error-type': 'quota exceeded' });
    } catch (e) { threw = true; }
    ok(threw, 'error payload must throw');
  });

  test('live: currency-api parser filters crypto symbols out of fiat', function () {
    var usd = {};
    Object.keys(OC.FIAT_SEED.rates).forEach(function (c) { usd[c.toLowerCase()] = OC.FIAT_SEED.rates[c]; });
    usd.eur = 0.92;
    usd.jpy = 149;
    usd.btc = 67000;
    usd.ada = 0.45;
    usd['1inch'] = 10.6;
    var p = OC.live.fiatParsers['currency-api']({ date: '2026-10-16', usd: usd });
    eq(p.rates.EUR, 0.92);
    eq(p.rates.JPY, 149);
    eq(p.rates.INR, OC.FIAT_SEED.rates.INR);
    eq(p.rates.BTC, undefined, 'crypto must be filtered');
    eq(p.rates.ADA, undefined, 'crypto must be filtered');
    eq(p.rates['1INCH'], undefined, 'crypto must be filtered');
  });

  test('live: three fiat providers are configured in fallback order', function () {
    var ids = OC.live.fiatProviders.map(function (p) { return p.id; });
    eq(ids.join('>'), 'er-api>currency-api>frankfurter');
  });

  /* ---------- data integrity ---------- */

  test('data: currency names contain no pre-escaped entities', function () {
    var entities = ['&amp;', '&lt;', '&gt;', '&quot;', '&#39;'];
    Object.keys(OC.FIAT_SEED.names).forEach(function (c) {
      var n = OC.FIAT_SEED.names[c][0];
      entities.forEach(function (entity) {
        ok(n.indexOf(entity) === -1, 'name for ' + c + ' contains pre-escaped entity');
      });
    });
  });

  test('data: every category has unique unit ids and valid factors', function () {
    Object.keys(OC.UNITS).forEach(function (cid) {
      var cat = OC.UNITS[cid];
      var seen = {};
      cat.units.forEach(function (u) {
        ok(!seen[u.id], cid + ' duplicate unit ' + u.id);
        seen[u.id] = true;
        if (cat.type === 'linear') ok(isFinite(u.toBase) && u.toBase !== 0, cid + '.' + u.id + ' bad factor');
      });
      ok(cat.units.length >= 2, cid + ' needs at least 2 units');
    });
  });

  test('data: currency seed has 100+ codes with names', function () {
    var codes = Object.keys(OC.FIAT_SEED.rates);
    ok(codes.length >= 100, 'expected 100+ currencies, got ' + codes.length);
    codes.forEach(function (c) {
      ok(OC.FIAT_SEED.names[c], 'missing name for ' + c);
    });
  });

  test('data: ingredient densities are sane (water 237 g/cup)', function () {
    var water = OC.INGREDIENTS.filter(function (i) { return i.id === 'water'; })[0];
    eq(water.gPerCup, 237);
    var flour = OC.INGREDIENTS.filter(function (i) { return i.id === 'all-purpose-flour'; })[0];
    eq(flour.gPerCup, 120);
  });

  /* ---------- report ---------- */

  var summary = document.getElementById('summary');
  var resultsEl = document.getElementById('results');
  if (summary) {
    summary.innerHTML = '<strong class="' + (failed ? 'test-fail' : 'test-pass') + '">' +
      (failed ? '✗ ' + failed + ' failed' : '✓ all tests passed') + '</strong> — ' +
      passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total.';
  }
  if (resultsEl) {
    resultsEl.innerHTML = rows.map(function (r) {
      return '<div class="test-row ' + (r.ok ? 'test-pass' : 'test-fail') + '">' +
        (r.ok ? '✓' : '✗') + ' ' + OC.esc(r.name) +
        (r.ok ? '' : ' — <span class="test-fail">' + OC.esc(r.err) + '</span>') +
        '</div>';
    }).join('');
  }
  console.log('OmniCalc tests: ' + passed + ' passed, ' + failed + ' failed');
})();
