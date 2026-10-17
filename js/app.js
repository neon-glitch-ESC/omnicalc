/* OmniCalc - app.js
   Bootstrapper: route registration, sidebar, header controls, SW, search. */

(function () {
  'use strict';

  var CALC_ORDER = ['basic', 'scientific', 'programmer', 'graphing', 'matrix', 'financial', 'datetime'];

  var CONVERT_ORDER = [
    'currency', 'crypto', 'legacy', 'metals',
    'length', 'mass', 'volume', 'area', 'temperature', 'speed', 'time', 'fuel',
    'pressure', 'energy', 'power', 'force', 'torque', 'flow', 'viscosity', 'kinematicViscosity',
    'digital', 'transfer', 'typography', 'angle', 'radiationDose', 'radioactivity',
    'health', 'culinary', 'apparel', 'historical', 'numbers', 'custom'
  ];

  /* Exposed so the home page can use the same ordering as the sidebar. */
  OC.NAV = { calc: CALC_ORDER, convert: CONVERT_ORDER };

  function buildSidebar() {
    var nav = OC.qs('#sidebarNav');
    var bottom = OC.qs('#sidebarBottom');

    var convertIds = CONVERT_ORDER.filter(function (id) { return OC.routes[id]; });
    OC.routeList.forEach(function (id) {
      var r = OC.routes[id];
      if (r && r.group === 'convert' && convertIds.indexOf(id) === -1) convertIds.push(id);
    });

    var groups = [
      { title: '', items: ['home'] },
      { title: 'Calculators', items: CALC_ORDER.filter(function (id) { return OC.routes[id]; }) },
      { title: 'Converter', items: convertIds }
    ];

    nav.innerHTML = groups.map(function (g) {
      var items = g.items.map(function (id) {
        var r = OC.routes[id];
        return '<a class="sb-link" data-route="' + OC.esc(id) + '" href="#' + OC.esc(id) + '">' +
          OC.iconHTML(r.icon) + '<span>' + OC.esc(r.name) + '</span></a>';
      }).join('');
      if (!items) return '';
      return '<div class="sb-group">' +
        (g.title ? '<div class="sb-group-title">' + OC.esc(g.title) + '</div>' : '') +
        items + '</div>';
    }).join('');

    bottom.innerHTML = '<a class="sb-link" data-route="settings" href="#settings">' +
      OC.iconHTML('settings') + '<span>Settings</span></a>';

    OC.hydrateIcons(nav);
    OC.hydrateIcons(bottom);

    OC.bus.on('route', function (id) {
      OC.qsa('.sb-link').forEach(function (el) {
        el.classList.toggle('active', el.getAttribute('data-route') === id);
      });
    });
  }

  function wireHeader() {
    var sidebar = OC.qs('#sidebar');
    var overlay = OC.qs('#sidebarOverlay');
    var toggle = OC.qs('#sidebarToggle');
    var mobileQuery = window.matchMedia('(max-width: 1024px)');

    function isMobile() { return mobileQuery.matches; }

    /* Mobile/tablet: off-canvas drawer */
    function setDrawer(open) {
      sidebar.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      if (isMobile()) toggle.setAttribute('aria-expanded', String(open));
    }

    /* Desktop: collapse the fixed sidebar */
    function setCollapsed(collapsed, persist) {
      document.body.classList.toggle('sidebar-collapsed', collapsed);
      toggle.setAttribute('aria-expanded', String(!collapsed));
      if (persist) OC.uiState.setSidebarCollapsed(collapsed);
    }

    /* restore the desktop preference from a previous visit */
    if (!isMobile() && OC.uiState.sidebarCollapsed()) {
      setCollapsed(true, false);
    } else {
      toggle.setAttribute('aria-expanded', String(isMobile() ? 'false' : 'true'));
    }

    toggle.addEventListener('click', function () {
      if (isMobile()) {
        setDrawer(!sidebar.classList.contains('open'));
      } else {
        setCollapsed(!document.body.classList.contains('sidebar-collapsed'), true);
      }
    });

    overlay.addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('omnicalc:navigate', function () { setDrawer(false); });

    /* keep state sane when crossing the breakpoint (rotate / resize) */
    function onBreakpoint() {
      if (isMobile()) {
        toggle.setAttribute('aria-expanded', String(sidebar.classList.contains('open')));
      } else {
        setDrawer(false);
        toggle.setAttribute('aria-expanded', String(!document.body.classList.contains('sidebar-collapsed')));
      }
    }
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', onBreakpoint);
    else if (mobileQuery.addListener) mobileQuery.addListener(onBreakpoint);

    /* "/" focuses the search box */
    window.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        OC.qs('#globalSearch').focus();
      }
    });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return; /* file:// cannot register */
    navigator.serviceWorker.register('sw.js').then(function () {
      OC.bus.emit('sw-ready');
    }).catch(function (err) {
      console.warn('OmniCalc: service worker registration failed', err);
    });
  }

  function boot() {
    /* register every route group (order shapes the sidebar and home grids) */
    OC.registerHome();
    OC.registerGenericConverters();
    OC.registerLiveConverters();
    OC.registerCustomConverters();
    OC.registerNumberTools();
    OC.registerHealthTools();
    OC.registerCulinaryTools();
    OC.registerApparelTools();
    OC.registerBasicCalculator();
    OC.registerScientificCalculator();
    OC.registerProgrammerCalculator();
    OC.registerFinancialCalculators();
    OC.registerDatetimeCalculators();
    OC.registerGraphingCalculator();
    OC.registerMatrixCalculator();
    OC.registerSettings();

    OC.hydrateIcons(document.body);
    buildSidebar();
    wireHeader();

    OC.search.attach(OC.qs('#globalSearch'), OC.qs('#globalSearchResults'));

    OC.router.start();
    registerServiceWorker();

    OC.booted = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
