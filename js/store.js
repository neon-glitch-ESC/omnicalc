/* OmniCalc - store.js
   localStorage persistence: settings, favorites, history, custom converters, rate caches. */

(function () {
  'use strict';

  var PREFIX = 'omnicalc_';

  OC.store = {
    read: function (key, fallback) {
      try {
        var raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    write: function (key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    },
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(PREFIX) === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* ignore */ }
    },
    exportAll: function () {
      var out = {};
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(PREFIX) === 0; })
          .forEach(function (k) { out[k] = localStorage.getItem(k); });
      } catch (e) { /* ignore */ }
      return out;
    },
    importAll: function (data) {
      var count = 0;
      Object.keys(data || {}).forEach(function (k) {
        if (k.indexOf(PREFIX) === 0 && typeof data[k] === 'string') {
          localStorage.setItem(k, data[k]);
          count++;
        }
      });
      return count;
    }
  };

  /* ---------------- settings ---------------- */

  var DEFAULTS = {
    theme: 'light',            /* 'light' | 'dark' */
    decimals: 'auto',          /* 'auto' | 0..12 */
    grouping: true,            /* thousands separators */
    unitSystem: 'metric',      /* 'metric' | 'imperial' */
    autoRefreshRates: true,
    angleMode: 'deg',          /* 'deg' | 'rad' | 'grad' */
    premium: false             /* honor-system Pro unlock */
  };

  var settings = Object.assign({}, DEFAULTS, OC.store.read('settings', {}));

  OC.settings = function () { return settings; };

  OC.saveSettings = function (patch) {
    Object.assign(settings, patch);
    OC.store.write('settings', settings);
    OC.bus.emit('settings', settings);
    return settings;
  };

  OC.applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#12150a' : '#cbe376');
    var icon = document.getElementById('themeIcon');
    if (icon && OC.ICONS) {
      icon.textContent = theme === 'dark' ? OC.ICONS['light_mode'] : OC.ICONS['dark_mode'];
    }
  };

  /* ---------------- favorites ---------------- */

  OC.favorites = {
    list: function () {
      var f = OC.store.read('favorites', []);
      return Array.isArray(f) ? f : [];
    },
    has: function (id) { return OC.favorites.list().indexOf(id) !== -1; },
    toggle: function (id) {
      var list = OC.favorites.list();
      var i = list.indexOf(id);
      if (i === -1) list.push(id); else list.splice(i, 1);
      OC.store.write('favorites', list);
      OC.bus.emit('favorites', list);
      return i === -1; /* true when newly added */
    }
  };

  /* ---------------- calculator history ---------------- */

  OC.history = {
    list: function () {
      var h = OC.store.read('history', []);
      return Array.isArray(h) ? h : [];
    },
    add: function (expr, result) {
      var h = OC.history.list();
      h.unshift({ expr: expr, result: result, at: new Date().toISOString() });
      if (h.length > 120) h.length = 120;
      OC.store.write('history', h);
    },
    clear: function () {
      OC.store.write('history', []);
    }
  };

  /* ---------------- user custom converters ---------------- */

  OC.customs = {
    list: function () {
      var c = OC.store.read('custom_converters', []);
      return Array.isArray(c) ? c : [];
    },
    save: function (conv) {
      var list = OC.customs.list();
      if (conv.id) {
        var i = list.findIndex(function (c) { return c.id === conv.id; });
        if (i !== -1) { list[i] = conv; OC.store.write('custom_converters', list); return conv; }
      }
      conv.id = OC.uid();
      conv.createdAt = new Date().toISOString();
      list.push(conv);
      OC.store.write('custom_converters', list);
      return conv;
    },
    remove: function (id) {
      OC.store.write('custom_converters', OC.customs.list().filter(function (c) { return c.id !== id; }));
    }
  };

  /* ---------------- live rate caches ---------------- */

  OC.rateCache = {
    get: function (source) { return OC.store.read('rates_' + source, null); },
    set: function (source, payload) { OC.store.write('rates_' + source, payload); }
  };
})();
