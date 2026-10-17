/* OmniCalc - calculators/financial.js
   Loan/EMI (+ amortization + CSV export), compound interest (with chart),
   simple interest, tip splitter, tax/VAT, discount & markup, ROI, break-even. */

(function () {
  'use strict';

  var TABS = [
    { id: 'emi', label: 'Loan / EMI', icon: 'account_balance' },
    { id: 'compound', label: 'Compound interest', icon: 'trending_up' },
    { id: 'simple', label: 'Simple interest', icon: 'percent' },
    { id: 'tip', label: 'Tip splitter', icon: 'restaurant' },
    { id: 'tax', label: 'Tax / VAT', icon: 'percent' },
    { id: 'discount', label: 'Discount & markup', icon: 'tag' },
    { id: 'roi', label: 'ROI', icon: 'trending_up' },
    { id: 'breakeven', label: 'Break-even', icon: 'equal' }
  ];

  function money(v) {
    return OC.formatNumber(v, { decimals: 2 });
  }

  function drawLineChart(canvas, values, label) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 600;
    var h = canvas.clientHeight || 260;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var pad = { l: 64, r: 16, t: 18, b: 30 };
    var iw = w - pad.l - pad.r;
    var ih = h - pad.t - pad.b;
    var max = Math.max.apply(null, values);
    var min = Math.min(0, Math.min.apply(null, values));
    if (max === min) max = min + 1;

    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    var ink = isDark ? '#eef3dd' : '#14170a';
    var lime = '#cbe376';

    /* grid + y labels */
    ctx.strokeStyle = isDark ? 'rgba(238,243,221,0.18)' : 'rgba(20,23,10,0.14)';
    ctx.fillStyle = isDark ? 'rgba(238,243,221,0.75)' : 'rgba(20,23,10,0.65)';
    ctx.font = '11px Fira Code, monospace';
    ctx.lineWidth = 1;
    var steps = 4;
    for (var i = 0; i <= steps; i++) {
      var yv = min + (max - min) * (i / steps);
      var y = pad.t + ih - (ih * (i / steps));
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + iw, y);
      ctx.stroke();
      ctx.fillText(OC.fmtAxis(yv), 6, y + 4);
    }

    /* x labels (years) */
    ctx.fillText('0', pad.l, h - 10);
    ctx.fillText(String(values.length - 1), pad.l + iw - 18, h - 10);

    /* area + line */
    ctx.beginPath();
    values.forEach(function (v, idx) {
      var x = pad.l + iw * (idx / Math.max(1, values.length - 1));
      var y = pad.t + ih - ih * ((v - min) / (max - min));
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.lineTo(pad.l + iw, pad.t + ih);
    ctx.lineTo(pad.l, pad.t + ih);
    ctx.closePath();
    ctx.fillStyle = lime;
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (label) {
      ctx.fillStyle = ink;
      ctx.font = '600 12px "Google Sans", sans-serif';
      ctx.fillText(label, pad.l + 8, pad.t + 14);
    }
  }

  function renderFinancial(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Financial Calculators',
      icon: 'account_balance',
      desc: 'Loans, interest, tips, taxes, discounts, ROI and break-even — all computed locally, nothing leaves your browser.',
      routeId: 'financial'
    }) + OC.ui.tabsHTML(TABS, 'emi') +
      TABS.map(function (t) { return '<div id="fi-' + t.id + '" style="' + (t.id === 'emi' ? '' : 'display:none') + '"></div>'; }).join(''));

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) { OC.qs('#fi-' + t.id, page).style.display = t.id === id ? '' : 'none'; });
    });

    renderEMI(OC.qs('#fi-emi', page));
    renderCompound(OC.qs('#fi-compound', page));
    renderSimple(OC.qs('#fi-simple', page));
    renderTip(OC.qs('#fi-tip', page));
    renderTax(OC.qs('#fi-tax', page));
    renderDiscount(OC.qs('#fi-discount', page));
    renderROI(OC.qs('#fi-roi', page));
    renderBreakeven(OC.qs('#fi-breakeven', page));
  }

  /* ---------------- EMI ---------------- */

  function renderEMI(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="emP">Loan amount</label><input class="input mono" id="emP" inputmode="decimal" value="250000"></div>' +
      '    <div class="field"><label for="emR">Annual interest rate (%)</label><input class="input mono" id="emR" inputmode="decimal" value="7.5"></div>' +
      '    <div class="field"><label for="emY">Tenure — years</label><input class="input mono" id="emY" inputmode="numeric" value="20"></div>' +
      '    <div class="field"><label for="emM">+ extra months</label><input class="input mono" id="emM" inputmode="numeric" value="0"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Monthly payment (EMI)</div><div class="value" id="emOut">—</div></div>' +
      '  <div class="kv-list mb-3">' +
      '    <div class="kv"><span class="kv-key">Total payment</span><span class="kv-val" id="emTotal">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Total interest</span><span class="kv-val" id="emInterest">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Number of payments</span><span class="kv-val" id="emN">—</span></div>' +
      '  </div>' +
      '  <div class="row spread mb-2"><span class="panel-title" style="margin:0">Amortization schedule</span>' +
      '  <span id="emCsvSlot"></span></div>' +
      '  <div class="table-wrap" style="max-height:340px;overflow-y:auto"><table class="data-table" id="emTable"><thead><tr>' +
      '  <th>#</th><th class="num">Payment</th><th class="num">Principal</th><th class="num">Interest</th><th class="num">Balance</th></tr></thead><tbody></tbody></table></div>' +
      '</div>';

    var P = OC.qs('#emP', root), R = OC.qs('#emR', root), Y = OC.qs('#emY', root), M = OC.qs('#emM', root);
    var rowsByYear = [];
    var csvSlot = OC.qs('#emCsvSlot', root);

    function schedule(Pv, r, n) {
      var rows = [];
      var i = r / 100 / 12;
      var emi = i === 0 ? Pv / n : Pv * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
      var bal = Pv;
      var totalInt = 0;
      for (var k = 1; k <= n; k++) {
        var int = bal * i;
        var prin = emi - int;
        bal -= prin;
        if (k === n) { prin += bal; bal = 0; }
        totalInt += int;
        rows.push({ k: k, pay: emi, prin: prin, int: int, bal: Math.max(0, bal) });
      }
      return { rows: rows, emi: emi, totalInt: totalInt };
    }

    function update() {
      var pv = OC.parseNum(P.value), rate = OC.parseNum(R.value);
      var n = OC.parseNum(Y.value) * 12 + OC.parseNum(M.value);
      if (!isFinite(pv) || !isFinite(rate) || !isFinite(n) || pv <= 0 || n <= 0) {
        OC.qs('#emOut', root).textContent = '—';
        return;
      }
      var res = schedule(pv, rate, Math.round(n));
      rowsByYear = res.rows;
      OC.qs('#emOut', root).textContent = money(res.emi);
      OC.qs('#emTotal', root).textContent = money(res.emi * n);
      OC.qs('#emInterest', root).textContent = money(res.totalInt);
      OC.qs('#emN', root).textContent = OC.formatNumber(Math.round(n), { decimals: 0 });
      var tbody = OC.qs('#emTable tbody', root);
      tbody.innerHTML = res.rows.slice(0, 480).map(function (r2) {
        return '<tr><td>' + r2.k + '</td><td class="num">' + money(r2.pay) + '</td><td class="num">' + money(r2.prin) +
          '</td><td class="num">' + money(r2.int) + '</td><td class="num">' + money(r2.bal) + '</td></tr>';
      }).join('');
    }

    csvSlot.appendChild(OC.ui.copyBtn(function () {
      if (!rowsByYear.length) return '';
      var csv = 'Payment,Installment,Principal,Interest,Balance\n' + rowsByYear.map(function (r) {
        return [r.k, r.pay.toFixed(2), r.prin.toFixed(2), r.int.toFixed(2), r.bal.toFixed(2)].join(',');
      }).join('\n');
      return csv;
    }, 'Copy CSV'));

    [P, R, Y, M].forEach(function (x) { x.addEventListener('input', update); });
    update();
  }

  /* ---------------- Compound ---------------- */

  function renderCompound(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="ciP">Initial principal</label><input class="input mono" id="ciP" inputmode="decimal" value="10000"></div>' +
      '    <div class="field"><label for="ciR">Annual rate (%)</label><input class="input mono" id="ciR" inputmode="decimal" value="8"></div>' +
      '    <div class="field"><label for="ciY">Years</label><input class="input mono" id="ciY" inputmode="numeric" value="10"></div>' +
      '    <div class="field"><label for="ciF">Compounding</label><select class="select" id="ciF">' +
      '      <option value="1">Annually</option><option value="2">Semi-annually</option>' +
      '      <option value="4">Quarterly</option><option value="12" selected>Monthly</option><option value="365">Daily</option>' +
      '    </select></div>' +
      '    <div class="field"><label for="ciPMT">Monthly contribution (optional)</label><input class="input mono" id="ciPMT" inputmode="decimal" value="0"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Future value</div><div class="value" id="ccOut">—</div></div>' +
      '  <div class="kv-list mb-2">' +
      '    <div class="kv"><span class="kv-key">Total contributions</span><span class="kv-val" id="ccContrib">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Interest earned</span><span class="kv-val" id="ccInt">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Effective annual rate</span><span class="kv-val" id="ccEar">—</span></div>' +
      '  </div>' +
      '  <div class="graph-wrap" style="box-shadow:none"><canvas id="ccChart" style="width:100%;height:260px"></canvas></div>' +
      '</div>';

    var P = OC.qs('#ciP', root), R = OC.qs('#ciR', root), Y = OC.qs('#ciY', root),
      F = OC.qs('#ciF', root), PMT = OC.qs('#ciPMT', root);
    var canvas = OC.qs('#ccChart', root);

    function update() {
      var p = OC.parseNum(P.value), r = OC.parseNum(R.value) / 100, y = OC.parseNum(Y.value);
      var f = parseFloat(F.value), pmt = OC.parseNum(PMT.value) || 0;
      if (!isFinite(p) || !isFinite(r) || !isFinite(y) || y <= 0) {
        OC.qs('#ccOut', root).textContent = '—';
        return;
      }
      var series = [];
      var balance = p;
      var contrib = p;
      var nPerYear = f;
      var iPer = r / f;
      for (var yr = 0; yr <= y; yr++) {
        series.push(balance);
        for (var k = 0; k < nPerYear && (yr + 1) <= y; k++) {
          balance = balance * (1 + iPer);
          var monthlyPart = pmt * (12 / nPerYear);
          if (monthlyPart > 0) {
            balance += monthlyPart;
            contrib += monthlyPart;
          }
        }
      }
      var fv = balance;
      OC.qs('#ccOut', root).textContent = money(fv);
      OC.qs('#ccContrib', root).textContent = money(contrib);
      OC.qs('#ccInt', root).textContent = money(fv - contrib);
      OC.qs('#ccEar', root).textContent = OC.formatNumber((Math.pow(1 + r / f, f) - 1) * 100, { decimals: 2 }) + '%';
      drawLineChart(canvas, series, 'Balance by year');
    }

    [P, R, Y, F, PMT].forEach(function (x) { x.addEventListener('input', update); x.addEventListener('change', update); });
    window.addEventListener('resize', OC.debounce(update, 200));
    update();
  }

  /* ---------------- Simple ---------------- */

  function renderSimple(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="siP">Principal</label><input class="input mono" id="siP" inputmode="decimal" value="5000"></div>' +
      '    <div class="field"><label for="siR">Annual rate (%)</label><input class="input mono" id="siR" inputmode="decimal" value="6"></div>' +
      '    <div class="field"><label for="siT">Time (years)</label><input class="input mono" id="siT" inputmode="decimal" value="3"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Interest</div><div class="value" id="siOut">—</div></div>' +
      '  <div class="kv-list"><div class="kv"><span class="kv-key">Total amount</span><span class="kv-val" id="siTotal">—</span></div>' +
      '  <div class="kv"><span class="kv-key">Interest per year</span><span class="kv-val" id="siYear">—</span></div></div>' +
      '</div>';

    var P = OC.qs('#siP', root), R = OC.qs('#siR', root), T = OC.qs('#siT', root);
    function update() {
      var p = OC.parseNum(P.value), r = OC.parseNum(R.value) / 100, t = OC.parseNum(T.value);
      if (![p, r, t].every(isFinite)) { OC.qs('#siOut', root).textContent = '—'; return; }
      var i = p * r * t;
      OC.qs('#siOut', root).textContent = money(i);
      OC.qs('#siTotal', root).textContent = money(p + i);
      OC.qs('#siYear', root).textContent = money(p * r);
    }
    [P, R, T].forEach(function (x) { x.addEventListener('input', update); });
    update();
  }

  /* ---------------- Tip ---------------- */

  function renderTip(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="tpBill">Bill amount</label><input class="input mono" id="tpBill" inputmode="decimal" value="86.40"></div>' +
      '    <div class="field"><label for="tpPct">Tip (%)</label><input class="input mono" id="tpPct" inputmode="decimal" value="18"></div>' +
      '    <div class="field"><label for="tpPpl">Split between</label><input class="input mono" id="tpPpl" inputmode="numeric" value="4"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Each person pays</div><div class="value" id="tpOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Tip amount</span><span class="kv-val" id="tpTip">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Total with tip</span><span class="kv-val" id="tpTotal">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Tip per person</span><span class="kv-val" id="tpTipEach">—</span></div>' +
      '  </div>' +
      '</div>';

    var B = OC.qs('#tpBill', root), P = OC.qs('#tpPct', root), N = OC.qs('#tpPpl', root);
    function update() {
      var b = OC.parseNum(B.value), p = OC.parseNum(P.value), n = OC.parseNum(N.value);
      if (![b, p].every(isFinite) || !isFinite(n) || n < 1) { OC.qs('#tpOut', root).textContent = '—'; return; }
      var tip = b * p / 100;
      OC.qs('#tpOut', root).textContent = money((b + tip) / n);
      OC.qs('#tpTip', root).textContent = money(tip);
      OC.qs('#tpTotal', root).textContent = money(b + tip);
      OC.qs('#tpTipEach', root).textContent = money(tip / n);
    }
    [B, P, N].forEach(function (x) { x.addEventListener('input', update); });
    update();
  }

  /* ---------------- Tax / VAT ---------------- */

  function renderTax(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="txAmount">Amount</label><input class="input mono" id="txAmount" inputmode="decimal" value="100"></div>' +
      '    <div class="field"><label for="txRate">Tax rate (%)</label><input class="input mono" id="txRate" inputmode="decimal" value="18"></div>' +
      '    <div class="field"><label for="txMode">Mode</label><select class="select" id="txMode">' +
      '      <option value="add">Add tax (amount is pre-tax)</option>' +
      '      <option value="remove">Reverse tax (amount includes tax)</option>' +
      '    </select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label" id="txOutLabel">Total with tax</div><div class="value" id="txOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Net (pre-tax)</span><span class="kv-val" id="txNet">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Tax</span><span class="kv-val" id="txTax">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Gross (with tax)</span><span class="kv-val" id="txGross">—</span></div>' +
      '  </div>' +
      '</div>';

    var A = OC.qs('#txAmount', root), R = OC.qs('#txRate', root), M = OC.qs('#txMode', root);
    function update() {
      var a = OC.parseNum(A.value), r = OC.parseNum(R.value);
      if (![a, r].every(isFinite)) { OC.qs('#txOut', root).textContent = '—'; return; }
      var net, tax;
      if (M.value === 'add') {
        net = a; tax = a * r / 100;
        OC.qs('#txOutLabel', root).textContent = 'Total with tax';
        OC.qs('#txOut', root).textContent = money(net + tax);
      } else {
        net = a / (1 + r / 100); tax = a - net;
        OC.qs('#txOutLabel', root).textContent = 'Net (tax removed)';
        OC.qs('#txOut', root).textContent = money(net);
      }
      OC.qs('#txNet', root).textContent = money(net);
      OC.qs('#txTax', root).textContent = money(tax);
      OC.qs('#txGross', root).textContent = money(net + tax);
    }
    [A, R, M].forEach(function (x) { x.addEventListener('input', update); x.addEventListener('change', update); });
    update();
  }

  /* ---------------- Discount & markup ---------------- */

  function renderDiscount(root) {
    root.innerHTML = '' +
      '<div class="grid-2">' +
      '  <div class="conv-card">' +
      '    <span class="panel-title">Discount</span>' +
      '    <div class="field"><label for="dcPrice">Original price</label><input class="input mono" id="dcPrice" inputmode="decimal" value="249"></div>' +
      '    <div class="field mt-2"><label for="dcPct">Discount (%)</label><input class="input mono" id="dcPct" inputmode="decimal" value="30"></div>' +
      '    <div class="result-hero mt-3"><div class="label">Sale price</div><div class="value" id="dcOut">—</div></div>' +
      '    <div class="kv"><span class="kv-key">You save</span><span class="kv-val" id="dcSave">—</span></div>' +
      '  </div>' +
      '  <div class="conv-card">' +
      '    <span class="panel-title">Markup</span>' +
      '    <div class="field"><label for="mkCost">Cost price</label><input class="input mono" id="mkCost" inputmode="decimal" value="80"></div>' +
      '    <div class="field mt-2"><label for="mkPct">Markup (%)</label><input class="input mono" id="mkPct" inputmode="decimal" value="45"></div>' +
      '    <div class="result-hero mt-3"><div class="label">Selling price</div><div class="value" id="mkOut">—</div></div>' +
      '    <div class="kv"><span class="kv-key">Profit per unit</span><span class="kv-val" id="mkProfit">—</span></div>' +
      '  </div>' +
      '</div>';

    var price = OC.qs('#dcPrice', root), dPct = OC.qs('#dcPct', root);
    var cost = OC.qs('#mkCost', root), mPct = OC.qs('#mkPct', root);

    function updD() {
      var p = OC.parseNum(price.value), d = OC.parseNum(dPct.value);
      if (![p, d].every(isFinite)) { OC.qs('#dcOut', root).textContent = '—'; return; }
      OC.qs('#dcOut', root).textContent = money(p * (1 - d / 100));
      OC.qs('#dcSave', root).textContent = money(p * d / 100);
    }
    function updM() {
      var c = OC.parseNum(cost.value), m = OC.parseNum(mPct.value);
      if (![c, m].every(isFinite)) { OC.qs('#mkOut', root).textContent = '—'; return; }
      OC.qs('#mkOut', root).textContent = money(c * (1 + m / 100));
      OC.qs('#mkProfit', root).textContent = money(c * m / 100);
    }
    [price, dPct].forEach(function (x) { x.addEventListener('input', updD); });
    [cost, mPct].forEach(function (x) { x.addEventListener('input', updM); });
    updD(); updM();
  }

  /* ---------------- ROI ---------------- */

  function renderROI(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="roInit">Initial investment</label><input class="input mono" id="roInit" inputmode="decimal" value="10000"></div>' +
      '    <div class="field"><label for="roFinal">Final value</label><input class="input mono" id="roFinal" inputmode="decimal" value="16289"></div>' +
      '    <div class="field"><label for="roYears">Years held (optional)</label><input class="input mono" id="roYears" inputmode="decimal" value="5"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Return on investment</div><div class="value" id="roOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Profit</span><span class="kv-val" id="roProfit">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Annualized return (CAGR)</span><span class="kv-val" id="roCagr">—</span></div>' +
      '  </div>' +
      '</div>';

    var I = OC.qs('#roInit', root), F = OC.qs('#roFinal', root), Y = OC.qs('#roYears', root);
    function update() {
      var i = OC.parseNum(I.value), f = OC.parseNum(F.value), y = OC.parseNum(Y.value);
      if (![i, f].every(isFinite) || i === 0) { OC.qs('#roOut', root).textContent = '—'; return; }
      var roi = (f - i) / i * 100;
      OC.qs('#roOut', root).textContent = OC.formatNumber(roi, { decimals: 2 }) + '%';
      OC.qs('#roProfit', root).textContent = money(f - i);
      if (isFinite(y) && y > 0 && f > 0 && i > 0) {
        var cagr = (Math.pow(f / i, 1 / y) - 1) * 100;
        OC.qs('#roCagr', root).textContent = OC.formatNumber(cagr, { decimals: 2 }) + '%';
      } else {
        OC.qs('#roCagr', root).textContent = '—';
      }
    }
    [I, F, Y].forEach(function (x) { x.addEventListener('input', update); });
    update();
  }

  /* ---------------- Break-even ---------------- */

  function renderBreakeven(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="beFixed">Fixed costs</label><input class="input mono" id="beFixed" inputmode="decimal" value="12000"></div>' +
      '    <div class="field"><label for="bePrice">Price per unit</label><input class="input mono" id="bePrice" inputmode="decimal" value="25"></div>' +
      '    <div class="field"><label for="beVar">Variable cost per unit</label><input class="input mono" id="beVar" inputmode="decimal" value="13"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Break-even point</div><div class="value" id="beOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Contribution margin per unit</span><span class="kv-val" id="beMargin">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Break-even revenue</span><span class="kv-val" id="beRevenue">—</span></div>' +
      '  </div>' +
      '</div>';

    var F = OC.qs('#beFixed', root), P = OC.qs('#bePrice', root), V = OC.qs('#beVar', root);
    function update() {
      var f = OC.parseNum(F.value), p = OC.parseNum(P.value), v = OC.parseNum(V.value);
      if (![f, p, v].every(isFinite)) { OC.qs('#beOut', root).textContent = '—'; return; }
      var margin = p - v;
      if (margin <= 0) { OC.qs('#beOut', root).textContent = 'Never — margin is ≤ 0'; OC.qs('#beMargin', root).textContent = money(margin); OC.qs('#beRevenue', root).textContent = '—'; return; }
      var units = f / margin;
      OC.qs('#beOut', root).textContent = OC.formatNumber(Math.ceil(units), { decimals: 0 }) + ' units';
      OC.qs('#beMargin', root).textContent = money(margin);
      OC.qs('#beRevenue', root).textContent = money(Math.ceil(units) * p);
    }
    [F, P, V].forEach(function (x) { x.addEventListener('input', update); });
    update();
  }

  OC.registerFinancialCalculators = function () {
    OC.registerRoute({
      id: 'financial',
      name: 'Financial',
      icon: 'account_balance',
      group: 'calc',
      desc: 'Loans, interest, tips, tax, ROI.',
      keywords: 'financial loan emi mortgage interest compound tip tax vat discount markup roi break even investment',
      render: renderFinancial
    });
  };
})();
