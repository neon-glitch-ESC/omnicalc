/* OmniCalc - tools/run-tests.js
   Runs js/tests.js in Node with minimal window/document stubs (no browser needed).
   Usage: node tools/run-tests.js */

'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

/* ---- minimal browser stubs ---- */
global.window = globalThis;
const fakeEls = {};
global.document = {
  getElementById: (id) => (fakeEls[id] = fakeEls[id] || { innerHTML: '' }),
  createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }),
  querySelector: () => null,
  querySelectorAll: () => [],
  body: { appendChild() {} },
  addEventListener() {},
  documentElement: { setAttribute() {} }
};
const mem = new Map();
global.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  get length() { return mem.size; }
};
Object.defineProperty(global.localStorage, 'keys', { value: () => [...mem.keys()] });
/* store.js uses Object.keys(localStorage) — emulate index access */
global.localStorage = new Proxy(global.localStorage, {
  ownKeys: () => [...mem.keys()],
  getOwnPropertyDescriptor: (t, p) => ({ enumerable: true, configurable: true, value: t[p] })
});

const files = [
  'js/icons.js',
  'js/utils.js',
  'js/store.js',
  'js/data/units-core.js',
  'js/data/units-eng.js',
  'js/data/finance.js',
  'js/data/culinary.js',
  'js/data/apparel.js',
  'js/expr.js',
  'js/converters/generic.js',
  'js/converters/live.js',
  'js/converters/custom.js',
  'js/tools/numbers.js',
  'js/search.js'
];

let failed = 0;
const realLog = console.log;
for (const f of files) {
  const code = fs.readFileSync(path.join(root, f), 'utf8');
  try {
    new Function(code).call(globalThis);
  } catch (e) {
    realLog('LOAD FAIL ' + f + ': ' + e.message);
    process.exitCode = 1;
  }
}

let summary = '';
console.log = (...args) => { summary += args.join(' ') + '\n'; };

try {
  const code = fs.readFileSync(path.join(root, 'js/tests.js'), 'utf8');
  new Function(code).call(globalThis);
} catch (e) {
  realLog('TESTS THREW: ' + e.stack);
  process.exitCode = 1;
}

const m = /(\d+) passed, (\d+) failed/.exec(summary);
if (m) {
  realLog(summary.trim());
  const resultsHTML = fakeEls['results'] ? fakeEls['results'].innerHTML : '';
  if (resultsHTML) {
    realLog('--- details ---');
    realLog(resultsHTML.replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').trim());
  }
  process.exitCode = Number(m[2]) > 0 ? 1 : 0;
} else {
  realLog('Could not parse test summary. Output:\n' + summary);
  process.exitCode = 1;
}
