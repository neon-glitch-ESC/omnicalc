/* OmniCalc - calculators/datetime.js
   Date difference, age, add/subtract, countdown, workdays, timezone world clock. */

(function () {
  'use strict';

  var TABS = [
    { id: 'diff', label: 'Date difference', icon: 'event' },
    { id: 'age', label: 'Age', icon: 'calendar_month' },
    { id: 'add', label: 'Add / subtract', icon: 'update' },
    { id: 'count', label: 'Countdown', icon: 'timer' },
    { id: 'work', label: 'Work days', icon: 'table_chart' },
    { id: 'tz', label: 'Time zones', icon: 'language' }
  ];

  function fmtDate(d) {
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  function diffYMD(a, b) {
    var start = a < b ? a : b;
    var end = a < b ? b : a;
    var years = end.getFullYear() - start.getFullYear();
    var months = end.getMonth() - start.getMonth();
    var days = end.getDate() - start.getDate();
    if (days < 0) {
      months--;
      var prevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      days += prevMonth;
    }
    if (months < 0) { years--; months += 12; }
    return { years: years, months: months, days: days, swapped: a > b };
  }

  function renderDatetime(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Date & Time',
      icon: 'event',
      desc: 'Differences, ages, countdowns, working days and a live world clock.',
      routeId: 'datetime'
    }) + OC.ui.tabsHTML(TABS, 'diff') +
      TABS.map(function (t) { return '<div id="dt-' + t.id + '" style="' + (t.id === 'diff' ? '' : 'display:none') + '"></div>'; }).join(''));

    OC.ui.wireTabs(page, function (id) {
      TABS.forEach(function (t) { OC.qs('#dt-' + t.id, page).style.display = t.id === id ? '' : 'none'; });
    });

    renderDiff(OC.qs('#dt-diff', page));
    renderAge(OC.qs('#dt-age', page));
    renderAdd(OC.qs('#dt-add', page));
    renderCountdown(OC.qs('#dt-count', page));
    renderWork(OC.qs('#dt-work', page));
    renderTz(OC.qs('#dt-tz', page));
  }

  function dateInput(id, value) {
    return '<div class="field"><label for="' + id + '">' + id.replace(/^d/, '') + '</label>' +
      '<input type="date" class="input mono" id="' + id + '" value="' + value + '"></div>';
  }

  /* ---------------- difference ---------------- */

  function renderDiff(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="dd1">From date</label><input type="date" class="input mono" id="dd1"></div>' +
      '    <div class="field"><label for="dd2">To date</label><input type="date" class="input mono" id="dd2"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Difference</div><div class="value" id="ddOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Total days</span><span class="kv-val" id="ddDays">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Weeks + days</span><span class="kv-val" id="ddWeeks">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Hours / minutes</span><span class="kv-val" id="ddHours">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Start / end weekday</span><span class="kv-val" id="ddWeekdays">—</span></div>' +
      '  </div>' +
      '</div>';

    OC.qs('#dd1', root).value = OC.todayISO();
    OC.qs('#dd2', root).value = OC.toISODate(OC.addDays(new Date(), 90));

    var a = OC.qs('#dd1', root), b = OC.qs('#dd2', root);

    function update() {
      var d1 = new Date(a.value + 'T00:00:00'), d2 = new Date(b.value + 'T00:00:00');
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { OC.qs('#ddOut', root).textContent = '—'; return; }
      var ymd = diffYMD(d1, d2);
      OC.qs('#ddOut', root).textContent = ymd.years + ' years, ' + ymd.months + ' months, ' + ymd.days + ' days';
      var ms = Math.abs(d2 - d1);
      var days = Math.round(ms / 86400000);
      OC.qs('#ddDays', root).textContent = OC.formatNumber(days, { decimals: 0 }) + ' days';
      OC.qs('#ddWeeks', root).textContent = Math.floor(days / 7) + ' weeks ' + (days % 7) + ' days';
      OC.qs('#ddHours', root).textContent = OC.formatNumber(days * 24, { decimals: 0 }) + ' h · ' + OC.formatNumber(days * 24 * 60, { decimals: 0 }) + ' min';
      OC.qs('#ddWeekdays', root).textContent = d1.toLocaleDateString(undefined, { weekday: 'long' }) + ' → ' + d2.toLocaleDateString(undefined, { weekday: 'long' });
    }
    a.addEventListener('input', update);
    b.addEventListener('input', update);
    update();
  }

  /* ---------------- age ---------------- */

  function renderAge(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="agBirth">Date of birth</label><input type="date" class="input mono" id="agBirth"></div>' +
      '    <div class="field"><label for="agAsOf">Age as of</label><input type="date" class="input mono" id="agAsOf"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Age</div><div class="value" id="agOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Born on a</span><span class="kv-val" id="agDay">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Total days alive</span><span class="kv-val" id="agDays">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Next birthday</span><span class="kv-val" id="agNext">—</span></div>' +
      '  </div>' +
      '</div>';

    var birth = OC.qs('#agBirth', root);
    var asOf = OC.qs('#agAsOf', root);
    birth.value = '1990-01-01';
    asOf.value = OC.todayISO();

    function update() {
      var b = new Date(birth.value + 'T00:00:00');
      var n = new Date(asOf.value + 'T00:00:00');
      if (isNaN(b.getTime()) || isNaN(n.getTime()) || n < b) { OC.qs('#agOut', root).textContent = '—'; return; }
      var ymd = diffYMD(b, n);
      OC.qs('#agOut', root).textContent = ymd.years + ' years ' + ymd.months + ' months ' + ymd.days + ' days';
      OC.qs('#agDay', root).textContent = b.toLocaleDateString(undefined, { weekday: 'long' });
      OC.qs('#agDays', root).textContent = OC.formatNumber(Math.floor((n - b) / 86400000), { decimals: 0 });
      var next = new Date(n.getFullYear(), b.getMonth(), b.getDate());
      if (next < n) next = new Date(n.getFullYear() + 1, b.getMonth(), b.getDate());
      var daysTo = Math.ceil((next - n) / 86400000);
      OC.qs('#agNext', root).textContent = next.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) + ' — in ' + daysTo + ' days';
    }
    birth.addEventListener('input', update);
    asOf.addEventListener('input', update);
    update();
  }

  /* ---------------- add / subtract ---------------- */

  function renderAdd(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="adStart">Start date</label><input type="date" class="input mono" id="adStart"></div>' +
      '    <div class="field"><label for="adDir">Operation</label><select class="select" id="adDir"><option value="1">Add</option><option value="-1">Subtract</option></select></div>' +
      '    <div class="field"><label for="adAmount">Amount</label><input class="input mono" id="adAmount" inputmode="numeric" value="45"></div>' +
      '    <div class="field"><label for="adUnit">Unit</label><select class="select" id="adUnit">' +
      '      <option value="days" selected>Days</option><option value="weeks">Weeks</option>' +
      '      <option value="months">Months</option><option value="years">Years</option>' +
      '      <option value="workdays">Working days (Mon–Fri)</option></select></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Result date</div><div class="value" id="adOut">—</div></div>' +
      '</div>';

    var start = OC.qs('#adStart', root), dir = OC.qs('#adDir', root),
      amount = OC.qs('#adAmount', root), unit = OC.qs('#adUnit', root);
    start.value = OC.todayISO();

    function addWorkdays(d, n) {
      var step = n >= 0 ? 1 : -1;
      n = Math.abs(n);
      var cur = new Date(d.getTime());
      while (n > 0) {
        cur = OC.addDays(cur, step);
        var dow = cur.getDay();
        if (dow !== 0 && dow !== 6) n--;
      }
      return cur;
    }

    function update() {
      var d = new Date(start.value + 'T00:00:00');
      var n = OC.parseNum(amount.value);
      var sign = parseInt(dir.value, 10);
      if (isNaN(d.getTime()) || !isFinite(n)) { OC.qs('#adOut', root).textContent = '—'; return; }
      var res;
      switch (unit.value) {
        case 'days': res = OC.addDays(d, sign * n); break;
        case 'weeks': res = OC.addDays(d, sign * n * 7); break;
        case 'months':
          res = new Date(d.getTime());
          res.setMonth(res.getMonth() + sign * n);
          break;
        case 'years':
          res = new Date(d.getTime());
          res.setFullYear(res.getFullYear() + sign * n);
          break;
        case 'workdays': res = addWorkdays(d, sign * n); break;
      }
      OC.qs('#adOut', root).textContent = fmtDate(res);
    }
    [start, dir, amount, unit].forEach(function (x) { x.addEventListener('input', update); x.addEventListener('change', update); });
    update();
  }

  /* ---------------- countdown ---------------- */

  function renderCountdown(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="cnDate">Target date</label><input type="date" class="input mono" id="cnDate"></div>' +
      '    <div class="field"><label for="cnTime">Target time</label><input type="time" class="input mono" id="cnTime" value="00:00"></div>' +
      '    <div class="field"><label for="cnLabel">Label (optional)</label><input class="input" id="cnLabel" placeholder="Trip to Tokyo"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3" style="padding:1.5rem"><div class="label" id="cnTitle">Countdown</div>' +
      '  <div class="value" id="cnOut" style="font-size:clamp(1.6rem,5vw,2.6rem)">—</div>' +
      '  <div class="small mono muted mt-1" id="cnSub">&nbsp;</div></div>' +
      '</div>';

    var dateEl = OC.qs('#cnDate', root), timeEl = OC.qs('#cnTime', root), label = OC.qs('#cnLabel', root);
    var out = OC.qs('#cnOut', root), sub = OC.qs('#cnSub', root), title = OC.qs('#cnTitle', root);
    var target = OC.addDays(new Date(), 30);
    dateEl.value = OC.toISODate(target);

    function tick() {
      if (!document.body.contains(out)) { clearInterval(timer); return; }
      var t = new Date(dateEl.value + 'T' + (timeEl.value || '00:00') + ':00');
      if (isNaN(t.getTime())) { out.textContent = '—'; return; }
      var diff = t - new Date();
      title.textContent = label.value.trim() || 'Countdown';
      if (diff <= 0) {
        out.textContent = 'Reached';
        sub.textContent = 'Target: ' + t.toLocaleString();
        return;
      }
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s %= 86400;
      var h = Math.floor(s / 3600); s %= 3600;
      var m = Math.floor(s / 60); s %= 60;
      out.textContent = d + 'd ' + String(h).padStart(2, '0') + 'h ' + String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
      sub.textContent = 'Target: ' + t.toLocaleString();
    }

    var timer = setInterval(tick, 1000);
    [dateEl, timeEl, label].forEach(function (x) { x.addEventListener('input', tick); });
    tick();
  }

  /* ---------------- work days ---------------- */

  function renderWork(root) {
    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="wk1">Start date</label><input type="date" class="input mono" id="wk1"></div>' +
      '    <div class="field"><label for="wk2">End date</label><input type="date" class="input mono" id="wk2"></div>' +
      '  </div>' +
      '  <div class="result-hero mt-3"><div class="label">Working days (Mon–Fri)</div><div class="value" id="wkOut">—</div></div>' +
      '  <div class="kv-list">' +
      '    <div class="kv"><span class="kv-key">Total days</span><span class="kv-val" id="wkTotal">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Weekend days</span><span class="kv-val" id="wkWeekend">—</span></div>' +
      '    <div class="kv"><span class="kv-key">Working hours (8 h/day)</span><span class="kv-val" id="wkHours">—</span></div>' +
      '  </div>' +
      '  <p class="keypad-hint">Public holidays are not excluded — regional holiday calendars vary.</p>' +
      '</div>';

    var a = OC.qs('#wk1', root), b = OC.qs('#wk2', root);
    a.value = OC.todayISO();
    b.value = OC.toISODate(OC.addDays(new Date(), 30));

    function update() {
      var d1 = new Date(a.value + 'T00:00:00'), d2 = new Date(b.value + 'T00:00:00');
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) { OC.qs('#wkOut', root).textContent = '—'; return; }
      if (d2 < d1) { var t = d1; d1 = d2; d2 = t; }
      var total = Math.floor((d2 - d1) / 86400000) + 1;
      var workdays = 0;
      for (var i = 0; i < total; i++) {
        var dow = OC.addDays(d1, i).getDay();
        if (dow !== 0 && dow !== 6) workdays++;
      }
      OC.qs('#wkOut', root).textContent = workdays + ' days';
      OC.qs('#wkTotal', root).textContent = total + ' days';
      OC.qs('#wkWeekend', root).textContent = (total - workdays) + ' days';
      OC.qs('#wkHours', root).textContent = OC.formatNumber(workdays * 8, { decimals: 0 }) + ' hours';
    }
    a.addEventListener('input', update);
    b.addEventListener('input', update);
    update();
  }

  /* ---------------- timezones ---------------- */

  var FALLBACK_ZONES = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Africa/Cairo', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Kolkata', 'Asia/Dhaka',
    'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Sydney', 'Pacific/Auckland'
  ];

  function renderTz(root) {
    var available = FALLBACK_ZONES;
    try {
      if (typeof Intl.supportedValuesOf === 'function') {
        available = Intl.supportedValuesOf('timeZone');
      }
    } catch (e) { /* keep fallback */ }

    var local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    var zones = OC.store.read('tz_zones', ['UTC', 'Europe/London', 'America/New_York', 'Asia/Kolkata', 'Asia/Tokyo']);
    if (zones.indexOf(local) === -1) zones.unshift(local);

    root.innerHTML = '' +
      '<div class="conv-card">' +
      '  <div class="row mb-3">' +
      '    <select class="select" id="tzPick" style="max-width:420px" aria-label="Add a time zone"></select>' +
      '    <button class="btn btn-primary" id="tzAdd" type="button">' + OC.iconHTML('add') + 'Add zone</button>' +
      '    <span class="tag tag-dark" id="tzUtc">UTC —</span>' +
      '  </div>' +
      '  <div class="grid-3" id="tzCards"></div>' +
      '</div>';
    OC.hydrateIcons(root);

    var pick = OC.qs('#tzPick', root);
    pick.innerHTML = available.map(function (z) {
      return '<option value="' + OC.esc(z) + '"' + (z === local ? ' selected' : '') + '>' + OC.esc(z) + (z === local ? ' (local)' : '') + '</option>';
    }).join('');

    var utcTag = OC.qs('#tzUtc', root);
    var cards = OC.qs('#tzCards', root);

    function offsetLabel(zone, date) {
      try {
        var fmt = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' });
        var parts = fmt.formatToParts(date);
        var tz = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
        return tz ? tz.value : '';
      } catch (e) { return ''; }
    }

    function draw() {
      cards.innerHTML = zones.map(function (z, i) {
        var now = new Date();
        var time, dateStr, day;
        try {
          time = new Intl.DateTimeFormat(undefined, { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
          dateStr = new Intl.DateTimeFormat(undefined, { timeZone: z, weekday: 'short', month: 'short', day: 'numeric' }).format(now);
          day = new Intl.DateTimeFormat('en-US', { timeZone: z, hour: 'numeric', hour12: false }).format(now);
        } catch (e) {
          time = '—'; dateStr = z; day = '';
        }
        var isNight = parseInt(day, 10) >= 20 || parseInt(day, 10) < 6;
        return '<div class="panel" style="box-shadow:var(--shadow-hard-sm);padding:1rem">' +
          '<div class="row spread"><strong class="small">' + OC.esc(z.replace(/_/g, ' ')) + '</strong>' +
          '<button class="icon-btn tz-del" data-zone="' + OC.esc(z) + '" aria-label="Remove zone" title="Remove">' + OC.iconHTML('close') + '</button></div>' +
          '<div class="mono" style="font-size:1.6rem;font-weight:600">' + time + '</div>' +
          '<div class="small muted">' + dateStr + ' · ' + OC.esc(offsetLabel(z, now)) + ' ' + (isNight ? '· night' : '· day') + '</div>' +
          '</div>';
      }).join('');
      OC.hydrateIcons(cards);
      utcTag.textContent = 'UTC ' + new Date().toISOString().slice(11, 19);
    }

    OC.qsa('.tz-del', root);
    cards.addEventListener('click', function (e) {
      var btn = e.target.closest('.tz-del');
      if (!btn) return;
      var z = btn.getAttribute('data-zone');
      zones = zones.filter(function (x) { return x !== z; });
      if (!zones.length) zones = [local];
      OC.store.write('tz_zones', zones);
      draw();
    });

    OC.qs('#tzAdd', root).addEventListener('click', function () {
      var z = pick.value;
      if (zones.indexOf(z) === -1) zones.push(z);
      OC.store.write('tz_zones', zones);
      draw();
    });

    var timer = setInterval(function () {
      if (!document.body.contains(cards)) { clearInterval(timer); return; }
      draw();
    }, 1000);
    draw();
  }

  OC.registerDatetimeCalculators = function () {
    OC.registerRoute({
      id: 'datetime',
      name: 'Date & Time',
      icon: 'event',
      group: 'calc',
      desc: 'Differences, ages, countdowns, time zones.',
      keywords: 'date time age countdown days between workday timezone clock calendar duration',
      render: renderDatetime
    });
  };
})();
