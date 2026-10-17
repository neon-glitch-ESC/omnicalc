/* OmniCalc - tools/health.js
   Health & Fitness suite: BMI, BMR/TDEE, body fat (US Navy), heart-rate zones,
   waist-to-hip ratio, pregnancy due date. */

(function () {
  'use strict';

  var TABS = [
    { id: 'bmi', label: 'BMI', icon: 'monitor_heart' },
    { id: 'tdee', label: 'BMR & Calories', icon: 'local_fire_department' },
    { id: 'bodyfat', label: 'Body Fat', icon: 'straighten' },
    { id: 'hr', label: 'Heart Rate Zones', icon: 'trending_up' },
    { id: 'due', label: 'Due Date', icon: 'calendar_month' }
  ];

  function bmiCategory(bmi) {
    if (bmi < 16) return 'Severe thinness';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    if (bmi < 35) return 'Obese (class I)';
    if (bmi < 40) return 'Obese (class II)';
    return 'Obese (class III)';
  }

  function renderHealth(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Health & Fitness',
      icon: 'monitor_heart',
      desc: 'BMI, BMR, daily calories, body fat, heart-rate zones and pregnancy due date. Educational estimates — not medical advice.',
      routeId: 'health'
    }) + OC.ui.tabsHTML(TABS, 'bmi') +
      TABS.map(function (t) {
        return '<div id="hf-' + t.id + '" style="' + (t.id === 'bmi' ? '' : 'display:none') + '"></div>';
      }).join(''));

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) {
        OC.qs('#hf-' + t.id, page).style.display = t.id === id ? '' : 'none';
      });
    });

    renderBMI(OC.qs('#hf-bmi', page));
    renderTDEE(OC.qs('#hf-tdee', page));
    renderBodyFat(OC.qs('#hf-bodyfat', page));
    renderHR(OC.qs('#hf-hr', page));
    renderDue(OC.qs('#hf-due', page));
  }

  function liveOut(root, id) { return OC.qs('#' + id, root); }

  /* ---------------- BMI ---------------- */

  function renderBMI(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="bmiUnits">Units</label><select class="select" id="bmiUnits"><option value="metric">Metric (kg / cm)</option><option value="imperial">Imperial (lb / in)</option></select></div>' +
      '    <div class="field"><label for="bmiWeight">Weight</label><input class="input mono" id="bmiWeight" inputmode="decimal" value="70"></div>' +
      '    <div class="field"><label for="bmiHeight">Height</label><input class="input mono" id="bmiHeight" inputmode="decimal" value="175"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Your BMI</div><div class="value" id="bmiOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Category</span><span class="kv-val" id="bmiCat">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Healthy weight range for your height</span><span class="kv-val" id="bmiRange">—</span></div>' +
      '  </div>' +
      '</div>';

    var units = OC.qs('#bmiUnits', root);
    var w = OC.qs('#bmiWeight', root);
    var h = OC.qs('#bmiHeight', root);

    units.addEventListener('change', function () {
      if (units.value === 'imperial') { w.value = '154'; h.value = '69'; }
      else { w.value = '70'; h.value = '175'; }
      update();
    });

    function update() {
      var wv = OC.parseNum(w.value), hv = OC.parseNum(h.value);
      if (!isFinite(wv) || !isFinite(hv) || wv <= 0 || hv <= 0) {
        liveOut(root, 'bmiOut').textContent = '—';
        liveOut(root, 'bmiCat').textContent = '—';
        liveOut(root, 'bmiRange').textContent = '—';
        return;
      }
      var kg = units.value === 'metric' ? wv : wv * 0.45359237;
      var m = units.value === 'metric' ? hv / 100 : hv * 0.0254;
      var bmi = kg / (m * m);
      liveOut(root, 'bmiOut').textContent = OC.formatNumber(bmi, { decimals: 1 }) + ' kg/m²';
      liveOut(root, 'bmiCat').textContent = bmiCategory(bmi);
      var lo = 18.5 * m * m, hi = 24.9 * m * m;
      if (units.value === 'metric') {
        liveOut(root, 'bmiRange').textContent = OC.formatNumber(lo, { decimals: 1 }) + ' – ' + OC.formatNumber(hi, { decimals: 1 }) + ' kg';
      } else {
        liveOut(root, 'bmiRange').textContent = OC.formatNumber(lo / 0.45359237, { decimals: 1 }) + ' – ' + OC.formatNumber(hi / 0.45359237, { decimals: 1 }) + ' lb';
      }
    }

    w.addEventListener('input', update);
    h.addEventListener('input', update);
    update();
  }

  /* ---------------- BMR / TDEE ---------------- */

  function renderTDEE(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="tdSex">Sex</label><select class="select" id="tdSex"><option value="male">Male</option><option value="female">Female</option></select></div>' +
      '    <div class="field"><label for="tdAge">Age (years)</label><input class="input mono" id="tdAge" inputmode="numeric" value="30"></div>' +
      '    <div class="field"><label for="tdWeight">Weight (kg)</label><input class="input mono" id="tdWeight" inputmode="decimal" value="70"></div>' +
      '    <div class="field"><label for="tdHeight">Height (cm)</label><input class="input mono" id="tdHeight" inputmode="decimal" value="175"></div>' +
      '    <div class="field"><label for="tdActivity">Activity</label><select class="select" id="tdActivity">' +
      '      <option value="1.2">Sedentary (little exercise)</option>' +
      '      <option value="1.375" selected>Light (1–3 days/week)</option>' +
      '      <option value="1.55">Moderate (3–5 days/week)</option>' +
      '      <option value="1.725">Very active (6–7 days/week)</option>' +
      '      <option value="1.9">Extra active (physical job)</option>' +
      '    </select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Estimated daily calories (TDEE)</div><div class="value" id="tdOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">BMR — Mifflin-St Jeor</span><span class="kv-val" id="tdMifflin">—</span></div>' +
      '    <div class="kv"><span class="kv-key">BMR — Harris-Benedict (revised)</span><span class="kv-val" id="tdHarris">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Mild weight loss (−250 kcal)</span><span class="kv-val" id="tdLose">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Weight gain (+300 kcal)</span><span class="kv-val" id="tdGain">—</span></div>' +
      '  </div>' +
      '</div>';

    var sex = OC.qs('#tdSex', root), age = OC.qs('#tdAge', root), w = OC.qs('#tdWeight', root),
      h = OC.qs('#tdHeight', root), act = OC.qs('#tdActivity', root);

    function update() {
      var a = OC.parseNum(age.value), kg = OC.parseNum(w.value), cm = OC.parseNum(h.value);
      if (![a, kg, cm].every(isFinite) || a <= 0 || kg <= 0 || cm <= 0) return;
      var mifflin = sex.value === 'male' ? 10 * kg + 6.25 * cm - 5 * a + 5 : 10 * kg + 6.25 * cm - 5 * a - 161;
      var harris = sex.value === 'male'
        ? 13.397 * kg + 4.799 * cm - 5.677 * a + 88.362
        : 9.247 * kg + 3.098 * cm - 4.330 * a + 447.593;
      var tdee = mifflin * parseFloat(act.value);
      liveOut(root, 'tdMifflin').textContent = OC.formatNumber(mifflin, { decimals: 0 }) + ' kcal/day';
      liveOut(root, 'tdHarris').textContent = OC.formatNumber(harris, { decimals: 0 }) + ' kcal/day';
      liveOut(root, 'tdOut').textContent = OC.formatNumber(tdee, { decimals: 0 }) + ' kcal/day';
      liveOut(root, 'tdLose').textContent = OC.formatNumber(tdee - 250, { decimals: 0 }) + ' kcal/day';
      liveOut(root, 'tdGain').textContent = OC.formatNumber(tdee + 300, { decimals: 0 }) + ' kcal/day';
    }

    [sex, age, w, h, act].forEach(function (n) { n.addEventListener('input', update); n.addEventListener('change', update); });
    update();
  }

  /* ---------------- Body fat (US Navy) ---------------- */

  function renderBodyFat(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="bfSex">Sex</label><select class="select" id="bfSex"><option value="male">Male</option><option value="female">Female</option></select></div>' +
      '    <div class="field"><label for="bfHeight">Height (cm)</label><input class="input mono" id="bfHeight" inputmode="decimal" value="175"></div>' +
      '    <div class="field"><label for="bfNeck">Neck (cm)</label><input class="input mono" id="bfNeck" inputmode="decimal" value="38"></div>' +
      '    <div class="field"><label for="bfWaist">Waist (cm)</label><input class="input mono" id="bfWaist" inputmode="decimal" value="85"></div>' +
      '    <div class="field" id="bfHipField" style="display:none"><label for="bfHip">Hip (cm)</label><input class="input mono" id="bfHip" inputmode="decimal" value="95"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Estimated body fat (US Navy method)</div><div class="value" id="bfOut">—</div></div>' +
      '  <p class="keypad-hint">Measure at the narrowest point of the neck and at navel level for the waist.</p>' +
      '</div>';

    var sex = OC.qs('#bfSex', root), h = OC.qs('#bfHeight', root), n = OC.qs('#bfNeck', root),
      w = OC.qs('#bfWaist', root), hip = OC.qs('#bfHip', root), hipField = OC.qs('#bfHipField', root);

    sex.addEventListener('change', function () {
      hipField.style.display = sex.value === 'female' ? '' : 'none';
      update();
    });

    function update() {
      var cm = OC.parseNum(h.value), neck = OC.parseNum(n.value), waist = OC.parseNum(w.value), hp = OC.parseNum(hip.value);
      if (![cm, neck, waist].every(isFinite)) { liveOut(root, 'bfOut').textContent = '—'; return; }
      var inch = function (x) { return x / 2.54; };
      var bf;
      if (sex.value === 'male') {
        if (waist - neck <= 0) { liveOut(root, 'bfOut').textContent = 'Waist must exceed neck'; return; }
        bf = 86.010 * Math.log10(inch(waist) - inch(neck)) - 70.041 * Math.log10(inch(cm)) + 36.76;
      } else {
        if (!isFinite(hp)) { liveOut(root, 'bfOut').textContent = '—'; return; }
        if (waist + hp - neck <= 0) { liveOut(root, 'bfOut').textContent = 'Check measurements'; return; }
        bf = 163.205 * Math.log10(inch(waist) + inch(hp) - inch(neck)) - 97.684 * Math.log10(inch(cm)) - 78.387;
      }
      liveOut(root, 'bfOut').textContent = OC.formatNumber(Math.max(0, bf), { decimals: 1 }) + '%';
    }

    [sex, h, n, w, hip].forEach(function (x) { x.addEventListener('input', update); x.addEventListener('change', update); });
    update();
  }

  /* ---------------- Heart rate zones ---------------- */

  function renderHR(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="hrAge">Age (years)</label><input class="input mono" id="hrAge" inputmode="numeric" value="30"></div>' +
      '    <div class="field"><label for="hrRest">Resting heart rate (optional)</label><input class="input mono" id="hrRest" inputmode="numeric" placeholder="60"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Estimated maximum heart rate</div><div class="value" id="hrMax">—</div></div>' +
      '  <div class="table-wrap"><table class="data-table" id="hrTable"><thead><tr><th>Zone</th><th>Intensity</th><th class="num">BPM</th><th>Purpose</th></tr></thead><tbody></tbody></table></div>' +
      '  <p class="keypad-hint">Max HR uses 220 − age; zones use a heart-rate-reserve estimate when resting HR is provided.</p>' +
      '</div>';

    var age = OC.qs('#hrAge', root), rest = OC.qs('#hrRest', root);
    var zones = [
      ['Z1', '50–60%', 'Very light — warm-up, recovery'],
      ['Z2', '60–70%', 'Light — fat burn, base building'],
      ['Z3', '70–80%', 'Moderate — aerobic endurance'],
      ['Z4', '80–90%', 'Hard — speed / threshold'],
      ['Z5', '90–100%', 'Maximum — sprints, short bursts']
    ];

    function update() {
      var a = OC.parseNum(age.value);
      if (!isFinite(a) || a <= 0 || a > 120) { liveOut(root, 'hrMax').textContent = '—'; return; }
      var max = 220 - a;
      liveOut(root, 'hrMax').textContent = OC.formatNumber(max, { decimals: 0 }) + ' bpm';
      var r = OC.parseNum(rest.value);
      var useHrr = isFinite(r) && r > 0 && r < max;
      var body = OC.qs('#hrTable tbody', root);
      body.innerHTML = zones.map(function (z) {
        var pct = z[1].split('–').map(function (p) { return parseFloat(p) / 100; });
        var lo, hi;
        if (useHrr) {
          lo = r + (max - r) * pct[0];
          hi = r + (max - r) * pct[1];
        } else {
          lo = max * pct[0];
          hi = max * pct[1];
        }
        return '<tr><td><strong>' + z[0] + '</strong></td><td>' + z[1] + (useHrr ? ' HRR' : ' max') + '</td>' +
          '<td class="num">' + Math.round(lo) + ' – ' + Math.round(hi) + '</td><td>' + z[3] + '</td></tr>';
      }).join('');
    }

    age.addEventListener('input', update);
    rest.addEventListener('input', update);
    update();
  }

  /* ---------------- Due date ---------------- */

  function renderDue(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="ddLmp">First day of last menstrual period</label><input type="date" class="input mono" id="ddLmp"></div>' +
      '    <div class="field"><label for="ddCycle">Average cycle length (days)</label><input class="input mono" id="ddCycle" inputmode="numeric" value="28"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Estimated due date (Naegele\u2019s rule)</div><div class="value" id="ddOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Gestational age today</span><span class="kv-val" id="ddWeeks">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Estimated conception date</span><span class="kv-val" id="ddConc">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Trimester boundaries (approx.)</span><span class="kv-val" id="ddTri">—</span></div>' +
      '  </div>' +
      '  <p class="keypad-hint">Only an estimate — always confirm with a healthcare professional.</p>' +
      '</div>';

    var lmp = OC.qs('#ddLmp', root);
    var cycle = OC.qs('#ddCycle', root);
    lmp.value = OC.toISODate(OC.addDays(new Date(), -70));

    function fmtDate(d) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function update() {
      var lmpDate = new Date(lmp.value + 'T00:00:00');
      if (isNaN(lmpDate.getTime())) { liveOut(root, 'ddOut').textContent = '—'; return; }
      var c = OC.parseNum(cycle.value);
      if (!isFinite(c) || c < 20 || c > 45) c = 28;
      var adjust = c - 28;
      var due = OC.addDays(lmpDate, 280 + adjust);
      var conception = OC.addDays(lmpDate, 14 + adjust);
      liveOut(root, 'ddOut').textContent = fmtDate(due);
      var days = Math.floor((Date.now() - lmpDate.getTime()) / 86400000);
      var weeks = Math.floor(days / 7), rem = days % 7;
      liveOut(root, 'ddWeeks').textContent = days < 0 ? 'Not started yet' :
        (days > 300 ? 'Past due date' : weeks + ' weeks ' + rem + ' days');
      liveOut(root, 'ddConc').textContent = fmtDate(conception);
      liveOut(root, 'ddTri').textContent = fmtDate(OC.addDays(lmpDate, 13 * 7 + adjust)) + '  ·  ' + fmtDate(OC.addDays(lmpDate, 27 * 7 + adjust));
    }

    lmp.addEventListener('input', update);
    cycle.addEventListener('input', update);
    update();
  }

  OC.registerHealthTools = function () {
    OC.registerRoute({
      id: 'health',
      name: 'Health & Fitness',
      icon: 'monitor_heart',
      group: 'convert',
      desc: 'BMI, calories, body fat, heart rate zones.',
      keywords: 'bmi bmr tdee body fat calorie health fitness heart rate pregnancy due date waist',
      render: renderHealth
    });
  };
})();
