/* OmniCalc - calculators/graphing.js
   Canvas graphing: multi-function overlay, wheel zoom, drag pan, pinch zoom, value table. */

(function () {
  'use strict';

  var COLORS = ['#cbe376', '#2d6cdf', '#e2574c'];

  function renderGraphing(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Graphing Calculator',
      icon: 'show_chart',
      desc: 'Plot y = f(x) with up to three functions. Scroll to zoom, drag to pan, pinch on touch.',
      routeId: 'graphing'
    }) +
      '<div class="conv-card">' +
      '  <div class="calc-badges" id="grAngles" title="Trig angle unit used when plotting">' +
      '    <span class="tag" data-mode="deg">DEG</span>' +
      '    <span class="tag" data-mode="rad">RAD</span>' +
      '    <span class="tag" data-mode="grad">GRAD</span>' +
      '  </div>' +
      '  <div id="grFns"></div>' +
      '  <div class="row mt-2 mb-3">' +
      '    <button class="btn btn-sm" id="grAdd" type="button">' + OC.iconHTML('add') + 'Add function</button>' +
      '    <button class="btn btn-sm" id="grReset" type="button">' + OC.iconHTML('restart_alt') + 'Reset view</button>' +
      '    <span class="small faint mono" id="grView"></span>' +
      '  </div>' +
      '  <div class="graph-wrap">' +
      '    <canvas class="graph-canvas" id="grCanvas" aria-label="Function plot"></canvas>' +
      '    <span class="graph-hint">scroll = zoom · drag = pan</span>' +
      '  </div>' +
      '</div>' +
      '<div class="panel">' +
      '  <span class="panel-title">Table of values</span>' +
      '  <div class="form-grid">' +
      '    <div class="field"><label for="tabFrom">x from</label><input class="input mono" id="tabFrom" value="-5"></div>' +
      '    <div class="field"><label for="tabTo">x to</label><input class="input mono" id="tabTo" value="5"></div>' +
      '    <div class="field"><label for="tabStep">Step</label><input class="input mono" id="tabStep" value="1"></div>' +
      '  </div>' +
      '  <div class="table-wrap mt-2" style="max-height:320px;overflow-y:auto"><table class="data-table" id="grTable">' +
      '  <thead><tr><th>x</th><th class="num">f₁(x)</th></tr></thead><tbody></tbody></table></div>' +
      '  <p class="keypad-hint">Uses the first enabled function. Variables: x only.</p>' +
      '</div>');
    OC.hydrateIcons(page);

    var canvas = OC.qs('#grCanvas', page);
    var fnsEl = OC.qs('#grFns', page);
    var viewEl = OC.qs('#grView', page);

    var fns = [
      { expr: 'sin(x)', color: COLORS[0], on: true },
      { expr: '', color: COLORS[1], on: true },
      { expr: '', color: COLORS[2], on: true }
    ];

    var view = { xmin: -10, xmax: 10, ymin: -6, ymax: 6 };

    function setAspect() {
      var w = canvas.clientWidth || 600;
      var h = canvas.clientHeight || 420;
      var ySpan = (view.xmax - view.xmin) * h / w;
      var cy = (view.ymin + view.ymax) / 2;
      view.ymin = cy - ySpan / 2;
      view.ymax = cy + ySpan / 2;
    }

    function drawFns() {
      fnsEl.innerHTML = fns.map(function (f, i) {
        return '<div class="fn-row">' +
          '<span class="fn-swatch" style="background:' + f.color + '"></span>' +
          '<span class="mono small">y' + (i + 1) + ' =</span>' +
          '<input class="input mono" data-fn="' + i + '" value="' + OC.esc(f.expr) + '" placeholder="' + (i === 0 ? 'sin(x)' : 'expression in x') + '" spellcheck="false" aria-label="Function ' + (i + 1) + '">' +
          '<label class="row tight small" style="gap:.3rem"><input type="checkbox" data-on="' + i + '"' + (f.on ? ' checked' : '') + '> on</label>' +
          (i > 0 && fns.length > 1 ? '<button class="icon-btn" data-del="' + i + '" aria-label="Remove function" title="Remove">' + OC.iconHTML('close') + '</button>' : '') +
          '</div>';
      }).join('');
      OC.hydrateIcons(fnsEl);

      OC.qsa('[data-fn]', fnsEl).forEach(function (inp) {
        inp.addEventListener('input', function () {
          var i = parseInt(inp.getAttribute('data-fn'), 10);
          fns[i].expr = inp.value;
          fns[i].on = inp.value.trim() !== '';
          scheduleDraw();
          scheduleTable();
        });
      });
      OC.qsa('[data-on]', fnsEl).forEach(function (cb) {
        cb.addEventListener('change', function () {
          var i = parseInt(cb.getAttribute('data-on'), 10);
          fns[i].on = cb.checked;
          scheduleDraw();
        });
      });
      OC.qsa('[data-del]', fnsEl).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.getAttribute('data-del'), 10);
          fns.splice(i, 1);
          drawFns();
          scheduleDraw();
        });
      });
    }

    /* ---------------- drawing ---------------- */

    function niceStep(span) {
      var raw = span / 8;
      var mag = Math.pow(10, Math.floor(Math.log10(raw)));
      var norm = raw / mag;
      var step = norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10;
      return step * mag;
    }

    function draw() {
      var dpr = window.devicePixelRatio || 1;
      var w = canvas.clientWidth;
      var h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      var ink = dark ? '#eef3dd' : '#14170a';
      var grid = dark ? 'rgba(238,243,221,0.15)' : 'rgba(20,23,10,0.12)';
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = dark ? '#1a1f0e' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      var x2px = function (x) { return (x - view.xmin) / (view.xmax - view.xmin) * w; };
      var y2px = function (y) { return h - (y - view.ymin) / (view.ymax - view.ymin) * h; };

      /* grid */
      var xStep = niceStep(view.xmax - view.xmin);
      var yStep = niceStep(view.ymax - view.ymin);
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      ctx.font = '11px Fira Code, monospace';
      ctx.fillStyle = dark ? 'rgba(238,243,221,0.7)' : 'rgba(20,23,10,0.6)';

      for (var gx = Math.ceil(view.xmin / xStep) * xStep; gx <= view.xmax; gx += xStep) {
        var px = x2px(gx);
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
        if (Math.abs(gx) > xStep / 2) {
          ctx.fillText('' + parseFloat(gx.toFixed(6)), px + 3, Math.min(h - 4, Math.max(12, y2px(0) + 14)));
        }
      }
      for (var gy = Math.ceil(view.ymin / yStep) * yStep; gy <= view.ymax; gy += yStep) {
        var py = y2px(gy);
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
        if (Math.abs(gy) > yStep / 2) {
          ctx.fillText('' + parseFloat(gy.toFixed(6)), Math.min(w - 42, Math.max(4, x2px(0) + 5)), py - 4);
        }
      }

      /* axes */
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      if (view.ymin < 0 && view.ymax > 0) {
        ctx.beginPath(); ctx.moveTo(0, y2px(0)); ctx.lineTo(w, y2px(0)); ctx.stroke();
      }
      if (view.xmin < 0 && view.xmax > 0) {
        ctx.beginPath(); ctx.moveTo(x2px(0), 0); ctx.lineTo(x2px(0), h); ctx.stroke();
      }

      /* functions */
      fns.forEach(function (f) {
        if (!f.on || !f.expr.trim()) return;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        var started = false;
        var prevPy = null;
        var samples = Math.min(1200, Math.max(240, Math.floor(w)));
        for (var s = 0; s <= samples; s++) {
          var x = view.xmin + (view.xmax - view.xmin) * (s / samples);
          var res = OC.expr.tryEvaluate(f.expr, { x: x });
          if (res.ok && isFinite(res.value)) {
            var fy = (res.value - view.ymin) / (view.ymax - view.ymin);
            /* clamp extreme values to keep the path drawable */
            if (fy > 4 || fy < -3) { started = false; prevPy = null; continue; }
            var pyv = h - fy * h;
            if (!started || (prevPy !== null && Math.abs(pyv - prevPy) > h * 0.5)) {
              ctx.moveTo(x2px(x), pyv);
              started = true;
            } else {
              ctx.lineTo(x2px(x), pyv);
            }
            prevPy = pyv;
          } else {
            started = false;
            prevPy = null;
          }
        }
        ctx.stroke();
      });

      viewEl.textContent = 'x ∈ [' + OC.fmtAxis(view.xmin) + ', ' + OC.fmtAxis(view.xmax) + ']  y ∈ [' +
        OC.fmtAxis(view.ymin) + ', ' + OC.fmtAxis(view.ymax) + ']';
    }

    var rafPending = false;
    function scheduleDraw() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () { rafPending = false; draw(); });
    }

    /* ---------------- interactions ---------------- */

    function zoomAt(px, py, factor) {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      var x = view.xmin + (px / w) * (view.xmax - view.xmin);
      var y = view.ymax - (py / h) * (view.ymax - view.ymin);
      view.xmin = x + (view.xmin - x) * factor;
      view.xmax = x + (view.xmax - x) * factor;
      view.ymin = y + (view.ymin - y) * factor;
      view.ymax = y + (view.ymax - y) * factor;
      scheduleDraw();
    }

    canvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var factor = e.deltaY > 0 ? 1.12 : 1 / 1.12;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, factor);
    }, { passive: false });

    var pointers = {};
    var lastSingle = null;
    var lastPinch = null;

    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 1) lastSingle = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      var ids = Object.keys(pointers);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

      if (ids.length === 1 && lastSingle) {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        var dx = (e.clientX - lastSingle.x) / w * (view.xmax - view.xmin);
        var dy = (e.clientY - lastSingle.y) / h * (view.ymax - view.ymin);
        view.xmin -= dx; view.xmax -= dx;
        view.ymin += dy; view.ymax += dy;
        lastSingle = { x: e.clientX, y: e.clientY };
        scheduleDraw();
      } else if (ids.length === 2) {
        var pts = ids.map(function (id) { return pointers[id]; });
        var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var midX = (pts[0].x + pts[1].x) / 2 - canvas.getBoundingClientRect().left;
        var midY = (pts[0].y + pts[1].y) / 2 - canvas.getBoundingClientRect().top;
        if (lastPinch) {
          var factor = lastPinch.dist / dist;
          zoomAt(midX, midY, factor);
        }
        lastPinch = { dist: dist };
        lastSingle = null;
      }
    });

    function endPointer(e) {
      delete pointers[e.pointerId];
      if (Object.keys(pointers).length === 0) { lastSingle = null; lastPinch = null; }
      else if (Object.keys(pointers).length === 1) {
        var id = Object.keys(pointers)[0];
        lastSingle = { x: pointers[id].x, y: pointers[id].y };
        lastPinch = null;
      }
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', function (e) { if (!canvas.hasPointerCapture || !canvas.hasPointerCapture(e.pointerId)) endPointer(e); });

    OC.qs('#grReset', page).addEventListener('click', function () {
      view = { xmin: -10, xmax: 10, ymin: -6, ymax: 6 };
      setAspect();
      scheduleDraw();
    });

    function syncAngleChips() {
      OC.qsa('#grAngles .tag', page).forEach(function (tag) {
        tag.classList.toggle('active', tag.getAttribute('data-mode') === OC.settings().angleMode);
      });
    }

    OC.qsa('#grAngles .tag', page).forEach(function (tag) {
      tag.addEventListener('click', function () {
        OC.saveSettings({ angleMode: tag.getAttribute('data-mode') });
        syncAngleChips();
        scheduleDraw();
        scheduleTable();
      });
    });

    OC.qs('#grAdd', page).addEventListener('click', function () {
      if (fns.length >= 6) return;
      fns.push({ expr: '', color: COLORS[fns.length % COLORS.length], on: false });
      drawFns();
    });

    /* ---------------- table ---------------- */

    var tableInputs = ['#tabFrom', '#tabTo', '#tabStep'].map(function (sel) { return OC.qs(sel, page); });

    function computeTable() {
      var x0 = OC.parseNum(tableInputs[0].value);
      var x1 = OC.parseNum(tableInputs[1].value);
      var step = OC.parseNum(tableInputs[2].value);
      var tbody = OC.qs('#grTable tbody', page);
      var f = fns.filter(function (x) { return x.on && x.expr.trim(); })[0];
      if (!isFinite(x0) || !isFinite(x1) || !isFinite(step) || step === 0 || !f) {
        tbody.innerHTML = '<tr><td colspan="2" class="faint">No enabled function</td></tr>';
        return;
      }
      if (step < 0) step = -step;
      var rows = [];
      var count = 0;
      for (var x = x0; (step > 0 ? x <= x1 + 1e-9 : x >= x1 - 1e-9) && count < 500; x += step, count++) {
        var res = OC.expr.tryEvaluate(f.expr, { x: x });
        rows.push('<tr><td class="num">' + OC.formatNumber(OC.roundSig(x, 6), { decimals: 'auto' }) + '</td><td class="num">' +
          (res.ok && isFinite(res.value) ? OC.formatNumber(OC.roundSig(res.value, 6), { decimals: 'auto' }) : '—') + '</td></tr>');
      }
      tbody.innerHTML = rows.join('') || '<tr><td colspan="2" class="faint">Empty range</td></tr>';
    }

    var tableTimer = null;
    function scheduleTable() {
      clearTimeout(tableTimer);
      tableTimer = setTimeout(computeTable, 250);
    }
    tableInputs.forEach(function (i) { i.addEventListener('input', scheduleTable); });

    /* ---------------- init ---------------- */

    setAspect();
    drawFns();
    syncAngleChips();
    computeTable();
    scheduleDraw();

    /* redraw on resize (element remains in DOM only while route active) */
    window.addEventListener('resize', OC.debounce(function () {
      if (document.body.contains(canvas)) { setAspect(); scheduleDraw(); }
    }, 200));
  }

  OC.registerGraphingCalculator = function () {
    OC.registerRoute({
      id: 'graphing',
      name: 'Graphing',
      icon: 'show_chart',
      group: 'calc',
      desc: 'Plot functions with zoom and pan.',
      keywords: 'graph plot chart function curve canvas plotter equation',
      render: renderGraphing
    });
  };
})();
