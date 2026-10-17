/* OmniCalc - pages/settings.js
   Settings: theme, precision, unit system, angle mode, rate refresh, data
   export/import/clear, storage & offline status, Pro unlock (honor system). */

(function () {
  'use strict';

  function switchRow(id, label, desc, on) {
    return '<div class="row spread" style="padding:.7rem 0;border-bottom:1px dashed var(--line-soft)">' +
      '  <div><div style="font-weight:600">' + label + '</div>' +
      '  <div class="small muted">' + (desc || '') + '</div></div>' +
      '  <button class="switch ' + (on ? 'on' : '') + '" id="' + id + '" role="switch" aria-checked="' + on + '" aria-label="' + label + '"></button>' +
      '</div>';
  }

  function selectRow(id, label, options, value) {
    return '<div class="row spread" style="padding:.7rem 0;border-bottom:1px dashed var(--line-soft)">' +
      '  <div style="font-weight:600">' + label + '</div>' +
      '  <select class="select" id="' + id + '" style="width:auto;min-width:180px">' +
      options.map(function (o) {
        return '<option value="' + o[0] + '"' + (String(o[0]) === String(value) ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>';
  }

  function renderSettings(el) {
    var s = OC.settings();
    var swState = ('serviceWorker' in navigator) && /^https?:$/.test(location.protocol);
    var fiatCache = OC.rateCache.get('fiat');
    var cryptoCache = OC.rateCache.get('crypto');
    var storageBytes = JSON.stringify(OC.store.exportAll()).length;

    var page = OC.ui.mount(el, OC.ui.pageHead({
      kicker: 'OmniCalc',
      title: 'Settings',
      icon: 'settings',
      desc: 'Preferences, data management and offline status.',
      routeId: 'settings'
    }) + '' +
      '<div class="grid-2">' +
      '  <div class="panel">' +
      '    <span class="panel-title">Appearance & format</span>' +
      switchRow('setDark', 'Dark mode', 'Paper turns to night-ink with lime accents.', s.theme === 'dark') +
      selectRow('setDecimals', 'Decimal precision',
      [['auto', 'Auto (smart)'], ['2', '2 decimals'], ['3', '3 decimals'], ['4', '4 decimals'], ['6', '6 decimals'], ['8', '8 decimals'], ['0', 'Integer']], s.decimals) +
      switchRow('setGrouping', 'Thousands separators', 'Show 1,000,000 instead of 1000000.', s.grouping) +
      selectRow('setUnits', 'Default unit system', [['metric', 'Metric (m, kg, °C)'], ['imperial', 'Imperial (ft, lb, °F)']], s.unitSystem) +
      selectRow('setAngle', 'Calculator angle mode', [['deg', 'Degrees'], ['rad', 'Radians'], ['grad', 'Gradians']], s.angleMode) +
      '  </div>' +

      '  <div class="panel">' +
      '    <span class="panel-title">Live data</span>' +
      switchRow('setAutoRates', 'Auto-refresh rates', 'Fetch fresh currency/crypto rates when online (max once per hour).', s.autoRefreshRates) +
      '    <div class="kv-list mt-2">' +
      '      <div class="kv"><span class="kv-key">Fiat rates cache</span><span class="kv-val">' +
      (fiatCache && fiatCache.updated ? OC.timeAgo(fiatCache.updated) + (fiatCache.provider ? ' · ' + OC.esc(fiatCache.provider) : '') : 'none') +
      '</span></div>' +
      '      <div class="kv"><span class="kv-key">Crypto prices cache</span><span class="kv-val">' + (cryptoCache && cryptoCache.updated ? OC.timeAgo(cryptoCache.updated) + ' · CoinGecko' : 'none') + '</span></div>' +
      '    </div>' +
      '    <div class="row mt-2">' +
      '      <button class="btn btn-sm" id="clearRates" type="button">' + OC.iconHTML('refresh') + 'Clear rate caches</button>' +
      '    </div>' +
      '  </div>' +
      '</div>' +

      '<div class="grid-2 mt-3">' +
      '  <div class="panel">' +
      '    <span class="panel-title">Your data</span>' +
      '    <p class="small muted mb-2">Everything OmniCalc stores lives in this browser only (localStorage). Export gives you a JSON backup; importing merges it back.</p>' +
      '    <div class="row">' +
      '      <button class="btn btn-sm" id="exportData" type="button">' + OC.iconHTML('download') + 'Export JSON</button>' +
      '      <button class="btn btn-sm" id="importData" type="button">' + OC.iconHTML('upload') + 'Import JSON</button>' +
      '      <button class="btn btn-sm" id="clearData" type="button">' + OC.iconHTML('delete') + 'Clear all data</button>' +
      '    </div>' +
      '    <input type="file" id="importFile" accept="application/json,.json" style="display:none">' +
      '    <div class="kv-list mt-3">' +
      '      <div class="kv"><span class="kv-key">Stored size</span><span class="kv-val">' + OC.formatNumber(storageBytes / 1024, { decimals: 1 }) + ' KB</span></div>' +
      '      <div class="kv"><span class="kv-key">Favorites</span><span class="kv-val">' + OC.favorites.list().length + '</span></div>' +
      '      <div class="kv"><span class="kv-key">History entries</span><span class="kv-val">' + OC.history.list().length + '</span></div>' +
      '      <div class="kv"><span class="kv-key">Custom converters</span><span class="kv-val">' + OC.customs.list().length + '</span></div>' +
      '    </div>' +
      '  </div>' +

      '  <div class="panel">' +
      '    <span class="panel-title">Offline & install</span>' +
      '    <div class="kv-list">' +
      '      <div class="kv"><span class="kv-key">Served from</span><span class="kv-val">' + OC.esc(location.protocol.replace(':', '')) + '</span></div>' +
      '      <div class="kv"><span class="kv-key">Service worker</span><span class="kv-val">' + (swState ? 'supported' : 'unavailable (file:// or unsupported)') + '</span></div>' +
      '      <div class="kv"><span class="kv-key">Install as app</span><span class="kv-val">' + (swState ? 'via browser “Install”' : 'serve over http(s) first') + '</span></div>' +
      '    </div>' +
      '    <p class="small muted mt-2">Tip: open this folder with any static server (or VS Code Live Server) to enable the PWA service worker, offline caching and install-to-home-screen.</p>' +
      '  </div>' +
      '</div>' +

      '<div class="panel mt-3">' +
      '    <span class="panel-title">OmniCalc Pro (honor system)</span>' +
      '    <p class="small muted mb-2">This static build has no backend to verify purchases — the Pro unlock is a light client-side gesture: ad-free, and a thank-you. ' +
      'Enter a license key in the format <span class="mono">OC-XXXX-XXXX</span> to toggle it.</p>' +
      '    <div class="row">' +
      '      <input class="input mono" id="proKey" placeholder="OC-XXXX-XXXX" style="max-width:240px" aria-label="License key">' +
      '      <button class="btn btn-primary btn-sm" id="proApply" type="button">' + OC.iconHTML('key') + 'Apply key</button>' +
      '      <span class="tag ' + (s.premium ? 'tag-lime' : '') + '" id="proState">' + (s.premium ? 'Pro active' : 'Free tier') + '</span>' +
      '    </div>' +
      '</div>' +

      '<div class="panel mt-3">' +
      '    <span class="panel-title">About & privacy</span>' +
      '    <p class="small muted">OmniCalc v1.0 — pure HTML/CSS/JS PWA. All calculations run locally; no accounts, no analytics, no server. ' +
      'Live fiat rates come from the open exchangerate-api endpoint and crypto prices from CoinGecko; if both are unreachable, bundled reference values are used and clearly labelled. ' +
      'Conversion factors use NIST/ISO reference values. Nothing you type is ever uploaded.</p>' +
      '</div>');

    OC.hydrateIcons(page);

    /* ---------------- wiring ---------------- */

    OC.qs('#setDark', page).addEventListener('click', function () {
      var dark = OC.settings().theme !== 'dark';
      OC.saveSettings({ theme: dark ? 'dark' : 'light' });
      OC.applyTheme(OC.settings().theme);
      this.classList.toggle('on', dark);
      this.setAttribute('aria-checked', String(dark));
      OC.qs('#themeToggle') && OC.qs('#themeToggle').blur();
    });

    OC.qs('#setGrouping', page).addEventListener('click', function () {
      var on = !OC.settings().grouping;
      OC.saveSettings({ grouping: on });
      this.classList.toggle('on', on);
      this.setAttribute('aria-checked', String(on));
    });

    OC.qs('#setAutoRates', page).addEventListener('click', function () {
      var on = !OC.settings().autoRefreshRates;
      OC.saveSettings({ autoRefreshRates: on });
      this.classList.toggle('on', on);
      this.setAttribute('aria-checked', String(on));
    });

    OC.qs('#setDecimals', page).addEventListener('change', function () {
      var v = this.value === 'auto' ? 'auto' : parseInt(this.value, 10);
      OC.saveSettings({ decimals: v });
    });

    OC.qs('#setUnits', page).addEventListener('change', function () {
      OC.saveSettings({ unitSystem: this.value });
    });

    OC.qs('#setAngle', page).addEventListener('change', function () {
      OC.saveSettings({ angleMode: this.value });
    });

    OC.qs('#clearRates', page).addEventListener('click', function () {
      OC.store.remove('rates_fiat');
      OC.store.remove('rates_crypto');
      this.textContent = 'Cleared';
      var self = this;
      setTimeout(function () { self.textContent = 'Clear rate caches'; }, 1200);
    });

    OC.qs('#exportData', page).addEventListener('click', function () {
      var payload = { app: 'OmniCalc', version: 1, exportedAt: new Date().toISOString(), data: OC.store.exportAll() };
      OC.downloadTextFile('omnicalc-backup-' + OC.todayISO() + '.json', JSON.stringify(payload, null, 2), 'application/json');
    });

    OC.qs('#importData', page).addEventListener('click', function () {
      OC.qs('#importFile', page).click();
    });

    OC.qs('#importFile', page).addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file) return;
      OC.readFile(file).then(function (text) {
        try {
          var parsed = JSON.parse(text);
          var data = parsed && parsed.data ? parsed.data : parsed;
          var n = OC.store.importAll(data);
          alert('Imported ' + n + ' settings entries. Reloading…');
          location.reload();
        } catch (e) {
          alert('Could not import: ' + e.message);
        }
      });
    });

    OC.qs('#clearData', page).addEventListener('click', function () {
      if (confirm('Delete ALL OmniCalc data in this browser (favorites, history, custom converters, settings, caches)?')) {
        OC.store.clearAll();
        location.hash = 'home';
        location.reload();
      }
    });

    OC.qs('#proApply', page).addEventListener('click', function () {
      var key = OC.qs('#proKey', page).value.trim().toUpperCase();
      var ok = /^OC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
      var state = OC.qs('#proState', page);
      if (ok) {
        OC.saveSettings({ premium: true });
        state.textContent = 'Pro active';
        state.classList.add('tag-lime');
        alert('Pro unlocked — thank you!');
      } else {
        state.textContent = 'Invalid key format';
        state.classList.remove('tag-lime');
      }
    });
  }

  OC.registerSettings = function () {
    OC.registerRoute({
      id: 'settings',
      name: 'Settings',
      icon: 'settings',
      group: 'system',
      desc: 'Preferences, data and offline status.',
      keywords: 'settings preferences theme dark mode decimals units export import clear data privacy',
      render: renderSettings
    });
  };
})();
