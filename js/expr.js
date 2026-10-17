/* OmniCalc - expr.js
   Expression engine: tokenizer + shunting-yard parser + RPN evaluator.
   Pure vanilla JS, no eval(). Supports:
   + - * / ^ % (mod) ! (factorial), parentheses, implicit multiplication,
   unary minus, functions (trig with DEG/RAD/GRAD awareness, logs, roots,
   rounding), constants (pi, e, tau, phi, c, g, avogadro) and nCr/nPr. */

(function () {
  'use strict';

  var FUNCTIONS = {
    sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1,
    sinh: 1, cosh: 1, tanh: 1, asinh: 1, acosh: 1, atanh: 1,
    log: 1, log10: 1, log2: 1, ln: 1, exp: 1, sqrt: 1, cbrt: 1,
    abs: 1, round: 1, floor: 1, ceil: 1, sign: 1, trunc: 1,
    fact: 1, gamma: 1, ncr: 2, npr: 2, gcd: 2, lcm: 2, mod: 2, atan2: 2, root: 2
  };

  var CONSTANTS = {
    pi: Math.PI, 'π': Math.PI, e: Math.E, tau: 2 * Math.PI,
    phi: (1 + Math.sqrt(5)) / 2, c: 299792458, g: 9.80665,
    avogadro: 6.02214076e23, na: 6.02214076e23
  };

  var PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, 'u-': 4, 'u+': 4, '^': 5 };
  var RIGHT_ASSOC = { '^': true };

  /* ---------------- gamma (Lanczos) & combinatorics ---------------- */

  function gamma(z) {
    var C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    var x = C[0];
    for (var i = 1; i < 9; i++) x += C[i] / (z + i);
    var t = z + 7.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  function factorial(n) {
    if (n < 0 && Math.abs(n - Math.round(n)) < 1e-12) return NaN;
    if (Math.abs(n - Math.round(n)) < 1e-12 && n >= 0 && n <= 170) {
      var r = 1;
      for (var i = 2; i <= n; i++) r *= i;
      return r;
    }
    return gamma(n + 1);
  }

  function nCr(n, r) {
    if (n !== Math.round(n) || r !== Math.round(r) || r < 0 || n < 0) return NaN;
    if (r > n) return 0;
    r = Math.min(r, n - r);
    var res = 1;
    for (var i = 1; i <= r; i++) res = res * (n - r + i) / i;
    return Math.round(res * 1e6) / 1e6;
  }

  function nPr(n, r) {
    if (n !== Math.round(n) || r !== Math.round(r) || r < 0 || n < 0) return NaN;
    if (r > n) return 0;
    var res = 1;
    for (var i = 0; i < r; i++) res *= (n - i);
    return res;
  }

  /* ---------------- angle helpers ---------------- */

  function angleMode() {
    var m = (OC.settings && OC.settings().angleMode) || 'deg';
    return m;
  }

  function toRadians(v) {
    var m = angleMode();
    if (m === 'deg') return v * Math.PI / 180;
    if (m === 'grad') return v * Math.PI / 200;
    return v;
  }

  function fromRadians(v) {
    var m = angleMode();
    if (m === 'deg') return v * 180 / Math.PI;
    if (m === 'grad') return v * 200 / Math.PI;
    return v;
  }

  var APPLY = {
    sin: function (x) { return roundTrig(Math.sin(toRadians(x))); },
    cos: function (x) { return roundTrig(Math.cos(toRadians(x))); },
    tan: function (x) { return roundTrig(Math.tan(toRadians(x))); },
    asin: function (x) { return fromRadians(Math.asin(x)); },
    acos: function (x) { return fromRadians(Math.acos(x)); },
    atan: function (x) { return fromRadians(Math.atan(x)); },
    atan2: function (y, x) { return fromRadians(Math.atan2(y, x)); },
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    log: Math.log10, log10: Math.log10, log2: Math.log2, ln: Math.log,
    exp: Math.exp, sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs,
    round: Math.round, floor: Math.floor, ceil: Math.ceil, trunc: Math.trunc,
    sign: Math.sign, fact: factorial, gamma: gamma,
    ncr: nCr, npr: nPr,
    gcd: function (a, b) {
      a = Math.abs(a); b = Math.abs(b);
      while (b) { var t = b; b = a % b; a = t; }
      return a;
    },
    lcm: function (a, b) {
      if (!a || !b) return 0;
      var g = APPLY.gcd(a, b);
      return Math.abs(a * b) / g;
    },
    mod: function (a, b) { return ((a % b) + b) % b; },
    root: function (n, x) { return Math.pow(x, 1 / n); }
  };

  /* Kill noise like sin(180°) = 1.2246e-16 -> 0 */
  function roundTrig(v) {
    return Math.abs(v) < 1e-12 ? 0 : v;
  }

  /* ---------------- tokenizer ---------------- */

  function tokenize(input) {
    var src = String(input)
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/√/g, 'sqrt')
      .replace(/π/g, 'pi')
      .replace(/·/g, '*');

    var tokens = [];
    var i = 0;
    var prev = null; /* previous meaningful token */

    function push(tok) { tokens.push(tok); prev = tok; }

    while (i < src.length) {
      var ch = src[i];

      if (ch === ' ' || ch === '\t') { i++; continue; }

      /* number */
      var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(src.slice(i));
      if (m) {
        var numTok = { type: 'num', value: parseFloat(m[0]) };
        if (prev && needsImplicitMul(prev, numTok)) push({ type: 'op', op: '*' });
        push(numTok);
        i += m[0].length;
        continue;
      }

      /* identifier */
      m = /^[a-zA-Z_][a-zA-Z0-9_]*/.exec(src.slice(i));
      if (m) {
        var name = m[0].toLowerCase();
        var idTok;
        if (Object.prototype.hasOwnProperty.call(FUNCTIONS, name)) {
          idTok = { type: 'func', name: name, arity: FUNCTIONS[name] };
        } else if (Object.prototype.hasOwnProperty.call(CONSTANTS, name)) {
          idTok = { type: 'const', name: name, value: CONSTANTS[name] };
        } else {
          idTok = { type: 'var', name: name };
        }
        if (prev && needsImplicitMul(prev, idTok)) push({ type: 'op', op: '*' });
        push(idTok);
        i += m[0].length;
        continue;
      }

      if (ch === '(') {
        var last = tokens[tokens.length - 1];
        if (last && needsImplicitMul(last, { type: 'paren', value: '(' })) {
          push({ type: 'op', op: '*' });
        }
        push({ type: 'paren', value: '(' });
        i++;
        continue;
      }

      if (ch === ')') {
        push({ type: 'paren', value: ')' });
        i++;
        continue;
      }

      if (ch === ',') {
        push({ type: 'comma' });
        i++;
        continue;
      }

      if (ch === '!') {
        push({ type: 'op', op: '!' });
        i++;
        continue;
      }

      if ('+-*/^%'.indexOf(ch) !== -1) {
        var isUnary = ch === '-' || ch === '+';
        var prevVal = tokens[tokens.length - 1];
        var unary = isUnary && (!prevVal ||
          prevVal.type === 'op' ||
          prevVal.type === 'comma' ||
          (prevVal.type === 'paren' && prevVal.value === '('));
        push({ type: 'op', op: unary ? ('u' + ch) : ch });
        i++;
        continue;
      }

      throw new Error('Unexpected character "' + ch + '"');
    }

    return tokens;
  }

  function needsImplicitMul(prev, next) {
    var prevEndsOperand = prev.type === 'num' || prev.type === 'const' ||
      (prev.type === 'paren' && prev.value === ')') ||
      (prev.type === 'op' && prev.op === '!');
    var nextStartsOperand = next.type === 'num' || next.type === 'const' ||
      next.type === 'func' || next.type === 'var' ||
      (next.type === 'paren' && next.value === '(');
    return prevEndsOperand && nextStartsOperand;
  }

  /* ---------------- shunting-yard ---------------- */

  function toRPN(tokens) {
    var output = [];
    var stack = [];

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];

      if (t.type === 'num' || t.type === 'const' || t.type === 'var') {
        output.push(t);
      } else if (t.type === 'func') {
        stack.push(t);
      } else if (t.type === 'comma') {
        while (stack.length && !(stack[stack.length - 1].type === 'paren')) {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error('Misplaced comma');
      } else if (t.type === 'op' && t.op === '!') {
        output.push(t); /* postfix binds immediately */
      } else if (t.type === 'op') {
        var prec = PRECEDENCE[t.op];
        if (prec === undefined) throw new Error('Unknown operator ' + t.op);
        while (stack.length) {
          var top = stack[stack.length - 1];
          if (top.type !== 'op') break;
          var topPrec = PRECEDENCE[top.op];
          if (topPrec > prec || (topPrec === prec && !RIGHT_ASSOC[t.op])) {
            output.push(stack.pop());
          } else break;
        }
        stack.push(t);
      } else if (t.type === 'paren') {
        if (t.value === '(') {
          stack.push(t);
        } else {
          var found = false;
          while (stack.length) {
            var s = stack.pop();
            if (s.type === 'paren' && s.value === '(') { found = true; break; }
            output.push(s);
          }
          if (!found) throw new Error('Mismatched parentheses');
          if (stack.length && stack[stack.length - 1].type === 'func') {
            output.push(stack.pop());
          }
        }
      }
    }

    while (stack.length) {
      var rest = stack.pop();
      if (rest.type === 'paren') throw new Error('Mismatched parentheses');
      output.push(rest);
    }

    return output;
  }

  /* ---------------- evaluator ---------------- */

  function evalRPN(rpn, vars) {
    var stack = [];

    for (var i = 0; i < rpn.length; i++) {
      var t = rpn[i];

      if (t.type === 'num') stack.push(t.value);
      else if (t.type === 'const') stack.push(t.value);
      else if (t.type === 'var') {
        if (vars && Object.prototype.hasOwnProperty.call(vars, t.name)) stack.push(vars[t.name]);
        else throw new Error('Unknown variable "' + t.name + '"');
      } else if (t.type === 'func') {
        if (stack.length < t.arity) throw new Error('Missing arguments for ' + t.name + '()');
        var args = stack.splice(stack.length - t.arity, t.arity);
        stack.push(APPLY[t.name].apply(null, args));
      } else if (t.type === 'op') {
        if (t.op === '!') {
          if (!stack.length) throw new Error('Missing operand for !');
          stack.push(factorial(stack.pop()));
        } else if (t.op === 'u-' || t.op === 'u+') {
          if (!stack.length) throw new Error('Missing operand');
          var v = stack.pop();
          stack.push(t.op === 'u-' ? -v : v);
        } else {
          if (stack.length < 2) throw new Error('Missing operand for ' + t.op);
          var b = stack.pop();
          var a = stack.pop();
          switch (t.op) {
            case '+': stack.push(a + b); break;
            case '-': stack.push(a - b); break;
            case '*': stack.push(a * b); break;
            case '/': stack.push(a / b); break;
            case '%': stack.push(a % b); break;
            case '^': stack.push(Math.pow(a, b)); break;
            default: throw new Error('Unknown operator ' + t.op);
          }
        }
      }
    }

    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
  }

  /* ---------------- public API ---------------- */

  OC.expr = {
    tokenize: tokenize,
    toRPN: toRPN,
    evalRPN: evalRPN,

    evaluate: function (str, vars) {
      if (str === null || str === undefined) throw new Error('Empty expression');
      var s = String(str).trim();
      if (s === '') throw new Error('Empty expression');
      return evalRPN(toRPN(tokenize(s)), vars || {});
    },

    tryEvaluate: function (str, vars) {
      try {
        return { ok: true, value: OC.expr.evaluate(str, vars) };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    },

    /* Variables used by an expression (for the graphing calculator). */
    variables: function (str) {
      try {
        var toks = tokenize(str);
        var names = {};
        toks.forEach(function (t) { if (t.type === 'var') names[t.name] = true; });
        return Object.keys(names);
      } catch (e) {
        return [];
      }
    },

    factorial: factorial,
    gamma: gamma,
    nCr: nCr,
    nPr: nPr,
    toRadians: toRadians,
    fromRadians: fromRadians,
    FUNCTIONS: FUNCTIONS,
    CONSTANTS: CONSTANTS
  };
})();
