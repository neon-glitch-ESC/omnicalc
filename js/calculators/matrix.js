/* OmniCalc - calculators/matrix.js
   Matrix algebra: add, subtract, multiply, transpose, determinant, inverse,
   and solving Ax = b via Gaussian elimination with partial pivoting. */

(function () {
  'use strict';

  /* ---------------- linear algebra core ---------------- */

  function eye(n) {
    var m = [];
    for (var i = 0; i < n; i++) {
      m.push([]);
      for (var j = 0; j < n; j++) m[i].push(i === j ? 1 : 0);
    }
    return m;
  }

  function transpose(a) {
    return a[0].map(function (_, j) { return a.map(function (row) { return row[j]; }); });
  }

  function add(a, b, sign) {
    return a.map(function (row, i) {
      return row.map(function (v, j) { return v + sign * b[i][j]; });
    });
  }

  function multiply(a, b) {
    var bt = transpose(b);
    return a.map(function (row) {
      return bt.map(function (col) {
        var s = 0;
        for (var k = 0; k < row.length; k++) s += row[k] * col[k];
        return s;
      });
    });
  }

  /* LU-style Gaussian elimination with partial pivoting; returns {det, mat, pivots} */
  function gauss(a) {
    var n = a.length;
    var m = a.map(function (row) { return row.slice(); });
    var det = 1;
    for (var col = 0; col < n; col++) {
      var pivot = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
      }
      if (Math.abs(m[pivot][col]) < 1e-12) return { singular: true, det: 0 };
      if (pivot !== col) {
        var t = m[pivot]; m[pivot] = m[col]; m[col] = t;
        det = -det;
      }
      det *= m[col][col];
      for (var rr = col + 1; rr < n; rr++) {
        var factor = m[rr][col] / m[col][col];
        for (var cc = col; cc < n; cc++) m[rr][cc] -= factor * m[col][cc];
      }
    }
    return { singular: false, det: det, mat: m };
  }

  function determinant(a) {
    if (a.length === 1) return a[0][0];
    if (a.length === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
    return gauss(a).det;
  }

  function inverse(a) {
    var n = a.length;
    var aug = a.map(function (row, i) {
      return row.concat(eye(n)[i]);
    });
    for (var col = 0; col < n; col++) {
      var pivot = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(aug[r][col]) > Math.abs(aug[pivot][col])) pivot = r;
      }
      if (Math.abs(aug[pivot][col]) < 1e-12) return null;
      if (pivot !== col) { var t = aug[pivot]; aug[pivot] = aug[col]; aug[col] = t; }
      var piv = aug[col][col];
      for (var c2 = 0; c2 < 2 * n; c2++) aug[col][c2] /= piv;
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 === col) continue;
        var f = aug[r2][col];
        for (var c3 = 0; c3 < 2 * n; c3++) aug[r2][c3] -= f * aug[col][c3];
      }
    }
    return aug.map(function (row) { return row.slice(n); });
  }

  function solve(a, b) {
    var n = a.length;
    var m = a.map(function (row, i) { return row.concat([b[i]]); });
    for (var col = 0; col < n; col++) {
      var pivot = col;
      for (var r = col + 1; r < n; r++) {
        if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
      }
      if (Math.abs(m[pivot][col]) < 1e-12) return null;
      if (pivot !== col) { var t = m[pivot]; m[pivot] = m[col]; m[col] = t; }
      for (var r2 = 0; r2 < n; r2++) {
        if (r2 === col) continue;
        var f = m[r2][col] / m[col][col];
        for (var c2 = col; c2 <= n; c2++) m[r2][c2] -= f * m[col][c2];
      }
    }
    return m.map(function (row, i) { return row[n] / row[i]; });
  }

  /* ---------------- UI ---------------- */

  function renderMatrix(el) {
    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'Calculators',
      title: 'Matrix Calculator',
      icon: 'grid_on',
      desc: 'Add, subtract, multiply, transpose, invert and get determinants — or solve a full linear system Ax = b.',
      routeId: 'matrix'
    }) + '' +
      '<div class="grid-2 mb-2">' +
      '  <div class="panel"><div class="row spread mb-2"><span class="panel-title" style="margin:0">Matrix A</span>' +
      '    <span class="row tight"><select class="select" id="maR" aria-label="A rows" style="width:auto"></select><span class="small">×</span><select class="select" id="maC" aria-label="A cols" style="width:auto"></select></span></div>' +
      '    <div id="maGrid" style="overflow-x:auto"></div></div>' +
      '  <div class="panel"><div class="row spread mb-2"><span class="panel-title" style="margin:0">Matrix B</span>' +
      '    <span class="row tight"><select class="select" id="mbR" aria-label="B rows" style="width:auto"></select><span class="small">×</span><select class="select" id="mbC" aria-label="B cols" style="width:auto"></select></span></div>' +
      '    <div id="mbGrid" style="overflow-x:auto"></div></div>' +
      '</div>' +
      '<div class="panel">' +
      '  <span class="panel-title">Operations</span>' +
      '  <div class="tabs" id="mxOps">' +
      '    <button class="chip" data-op="add" type="button">A + B</button>' +
      '    <button class="chip" data-op="sub" type="button">A − B</button>' +
      '    <button class="chip" data-op="mul" type="button">A × B</button>' +
      '    <button class="chip active" data-op="det" type="button">det(A)</button>' +
      '    <button class="chip" data-op="inv" type="button">A⁻¹</button>' +
      '    <button class="chip" data-op="tr" type="button">Aᵀ</button>' +
      '    <button class="chip" data-op="solve" type="button">Solve Ax = b</button>' +
      '  </div>' +
      '  <div id="mxExtra"></div>' +
      '  <div class="result-hero"><div class="label" id="mxLabel">Result</div><div class="value mono" id="mxOut">—</div></div>' +
      '  <div id="mxGridOut"></div>' +
      '</div>');

    var sizeOpts = function (sel, def) {
      for (var i = 1; i <= 6; i++) {
        var o = document.createElement('option');
        o.value = i;
        o.textContent = i;
        if (i === def) o.selected = true;
        sel.appendChild(o);
      }
    };

    var maR = OC.qs('#maR', page), maC = OC.qs('#maC', page);
    var mbR = OC.qs('#mbR', page), mbC = OC.qs('#mbC', page);
    sizeOpts(maR, 3); sizeOpts(maC, 3); sizeOpts(mbR, 3); sizeOpts(mbC, 3);

    var stateA = { rows: 3, cols: 3, vals: [[1, 2, 3], [4, 5, 6], [7, 8, 10]] };
    var stateB = { rows: 3, cols: 3, vals: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] };

    function buildGrid(container, state, idPrefix) {
      container.innerHTML = '<div class="matrix-grid" style="grid-template-columns:repeat(' + state.cols + ', minmax(52px, 1fr))">' +
        state.vals.map(function (row, i) {
          return row.map(function (v, j) {
            return '<input class="matrix-cell" data-m="' + idPrefix + '" data-i="' + i + '" data-j="' + j + '" value="' + v + '" inputmode="decimal" aria-label="' + idPrefix.toUpperCase() + ' row ' + (i + 1) + ' column ' + (j + 1) + '">';
          }).join('');
        }).join('') + '</div>';
      OC.qsa('.matrix-cell', container).forEach(function (inp) {
        inp.addEventListener('input', function () {
          var i = parseInt(inp.getAttribute('data-i'), 10);
          var j = parseInt(inp.getAttribute('data-j'), 10);
          var v = OC.parseNum(inp.value);
          state.vals[i][j] = isFinite(v) ? v : 0;
        });
      });
    }

    function resizeState(state, rows, cols) {
      var next = [];
      for (var i = 0; i < rows; i++) {
        next.push([]);
        for (var j = 0; j < cols; j++) {
          next[i].push(state.vals[i] && state.vals[i][j] !== undefined ? state.vals[i][j] : (i === j ? 1 : 0));
        }
      }
      state.rows = rows; state.cols = cols; state.vals = next;
    }

    maR.addEventListener('change', function () { resizeState(stateA, +maR.value, +maC.value); buildGrid(OC.qs('#maGrid', page), stateA, 'a'); });
    maC.addEventListener('change', function () { resizeState(stateA, +maR.value, +maC.value); buildGrid(OC.qs('#maGrid', page), stateA, 'a'); });
    mbR.addEventListener('change', function () { resizeState(stateB, +mbR.value, +mbC.value); buildGrid(OC.qs('#mbGrid', page), stateB, 'b'); });
    mbC.addEventListener('change', function () { resizeState(stateB, +mbR.value, +mbC.value); buildGrid(OC.qs('#mbGrid', page), stateB, 'b'); });

    function fmt(v) {
      if (Math.abs(v) < 1e-10) v = 0;
      var s = OC.formatNumber(OC.roundSig(v, 10), { decimals: 'auto' });
      return s;
    }

    function showMatrix(m) {
      var maxAbs = 0;
      m.forEach(function (row) { row.forEach(function (v) { maxAbs = Math.max(maxAbs, Math.abs(v)); }); });
      OC.qs('#mxGridOut', page).innerHTML = '<div class="table-wrap mt-2"><table class="data-table"><tbody>' +
        m.map(function (row) {
          return '<tr>' + row.map(function (v) {
            return '<td class="num' + (maxAbs > 0 && Math.abs(v) === maxAbs ? ' highlight-row' : '') + '">' + fmt(v) + '</td>';
          }).join('') + '</tr>';
        }).join('') +
        '</tbody></table></div>';
      OC.qs('#mxOut', page).textContent = 'matrix';
    }

    var currentOp = 'det';

    function run() {
      var a = stateA.vals, b = stateB.vals;
      var out = OC.qs('#mxOut', page);
      var label = OC.qs('#mxLabel', page);
      OC.qs('#mxGridOut', page).innerHTML = '';
      try {
        switch (currentOp) {
          case 'add':
          case 'sub':
            if (stateA.rows !== stateB.rows || stateA.cols !== stateB.cols) throw new Error('A and B must have identical dimensions');
            label.textContent = currentOp === 'add' ? 'A + B' : 'A − B';
            showMatrix(add(a, b, currentOp === 'add' ? 1 : -1));
            break;
          case 'mul':
            if (stateA.cols !== stateB.rows) throw new Error('A columns must equal B rows (' + stateA.cols + ' ≠ ' + stateB.rows + ')');
            label.textContent = 'A × B';
            showMatrix(multiply(a, b));
            break;
          case 'tr':
            label.textContent = 'A transposed';
            showMatrix(transpose(a));
            break;
          case 'det':
            if (stateA.rows !== stateA.cols) throw new Error('Determinant needs a square matrix');
            label.textContent = 'det(A)';
            out.textContent = fmt(determinant(a));
            break;
          case 'inv':
            if (stateA.rows !== stateA.cols) throw new Error('Inverse needs a square matrix');
            var inv = inverse(a);
            if (!inv) throw new Error('Matrix is singular — no inverse exists');
            label.textContent = 'A⁻¹';
            showMatrix(inv);
            break;
          case 'solve':
            if (stateA.rows !== stateA.cols) throw new Error('Ax = b needs a square A');
            var bvec = [];
            for (var i = 0; i < stateA.rows; i++) {
              var inp = OC.qs('#mxB' + i, page);
              var v = OC.parseNum(inp ? inp.value : 0);
              bvec.push(isFinite(v) ? v : 0);
            }
            var x = solve(a, bvec);
            if (!x) throw new Error('System has no unique solution');
            label.textContent = 'x = A⁻¹b';
            OC.qs('#mxGridOut', page).innerHTML = x.map(function (v, idx) {
              return '<div class="kv"><span class="kv-key mono">x' + (idx + 1) + '</span><span class="kv-val">' + fmt(v) + '</span></div>';
            }).join('');
            out.textContent = 'solved';
            break;
        }
      } catch (e) {
        out.textContent = 'Error';
        OC.qs('#mxGridOut', page).innerHTML = OC.ui.banner('error', 'Cannot compute', OC.esc(e.message));
        OC.hydrateIcons(OC.qs('#mxGridOut', page));
      }
    }

    function renderExtra() {
      var extra = OC.qs('#mxExtra', page);
      if (currentOp === 'solve') {
        extra.innerHTML = '<div class="row mb-2" style="align-items:flex-end"><span class="tag">b =</span>' +
          new Array(stateA.rows).fill(0).map(function (_, i) {
            return '<input class="matrix-cell" id="mxB' + i + '" value="0" inputmode="decimal" style="width:84px" aria-label="b' + (i + 1) + '">';
          }).join('') + '</div>';
      } else {
        extra.innerHTML = '';
      }
    }

    OC.qsa('#mxOps .chip', page).forEach(function (chip) {
      chip.addEventListener('click', function () {
        OC.qsa('#mxOps .chip', page).forEach(function (c) { c.classList.toggle('active', c === chip); });
        currentOp = chip.getAttribute('data-op');
        renderExtra();
        run();
      });
    });

    buildGrid(OC.qs('#maGrid', page), stateA, 'a');
    buildGrid(OC.qs('#mbGrid', page), stateB, 'b');
    renderExtra();
    run();
  }

  OC.registerMatrixCalculator = function () {
    OC.registerRoute({
      id: 'matrix',
      name: 'Matrix',
      icon: 'grid_on',
      group: 'calc',
      desc: 'Matrix algebra and linear systems.',
      keywords: 'matrix determinant inverse transpose multiply solve linear algebra gaussian',
      render: renderMatrix
    });
  };
})();
