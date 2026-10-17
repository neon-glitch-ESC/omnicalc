/* OmniCalc - pages/home.js
   Dashboard: hero with universal search, favorites, and full tool directory. */

(function () {
  'use strict';

  function catCard(route) {
    return '<button class="cat-card" data-goto="' + OC.esc(route.id) + '" type="button">' +
      '  <span class="cat-card-icon">' + OC.iconHTML(route.icon) + '</span>' +
      '  <span class="cat-card-name">' + OC.esc(route.name) + '</span>' +
      '  <span class="cat-card-desc">' + OC.esc(route.desc || '') + '</span>' +
      '</button>';
  }

  function renderHome(el) {
    var favs = OC.favorites.list().filter(function (id) { return OC.routes[id]; });

    var calcRoutes = OC.routeList.map(function (id) { return OC.routes[id]; })
      .filter(function (r) { return r.group === 'calc'; });
    var convRoutes = OC.routeList.map(function (id) { return OC.routes[id]; })
      .filter(function (r) { return r.group === 'convert'; });

    /* match the sidebar ordering */
    function byOrder(order) {
      return function (a, b) {
        var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        return ia - ib;
      };
    }
    if (OC.NAV) {
      calcRoutes.sort(byOrder(OC.NAV.calc));
      convRoutes.sort(byOrder(OC.NAV.convert));
    }

    var page = OC.ui.mount(el, '' +
      '<section class="hero-home">' +
      '  <span class="hero-home-pill">' + OC.iconHTML('offline_bolt') + 'Offline-first · zero servers</span>' +
      '  <h1 class="hero-home-title">Convert anything. ' +
      '    <span class="highlight-lime">Calculate</span> <span class="italic-text">everything.</span></h1>' +
      '  <p class="hero-home-sub">One installable app for 300+ conversions and a full calculator suite — ' +
      '    currency, cooking, engineering, health, finance and more. Works with your Wi-Fi off.</p>' +
      '  <div class="search-wrap hero-search">' +
      '    <span class="msym search-icon" data-icon="search" aria-hidden="true"></span>' +
      '    <input type="search" class="search-input" id="homeSearch" placeholder="Try “10 km to miles”, “100 usd to eur”, “BMI”…" autocomplete="off" spellcheck="false" aria-label="Universal search">' +
      '    <div class="search-results" id="homeSearchResults" role="listbox"></div>' +
      '  </div>' +
      '  <div class="hero-search-examples">' +
      '    <span class="small faint">Try:</span>' +
      '    <button class="example-chip" data-example="10 km to miles">10 km to miles</button>' +
      '    <button class="example-chip" data-example="100 usd to eur">100 usd to eur</button>' +
      '    <button class="example-chip" data-example="350 f to c">350 f to c</button>' +
      '    <button class="example-chip" data-example="1 cup flour in grams">ingredient weights</button>' +
      '  </div>' +
      '</section>' +

      (favs.length ? '<div class="section-heading"><h2>' + OC.iconHTML('star', 'fill') + ' Favorites</h2></div>' +
        '<div class="fav-bar" id="homeFavs">' + favs.map(function (id) {
          var r = OC.routes[id];
          return '<button class="fav-chip" data-goto="' + OC.esc(id) + '" type="button">' + OC.iconHTML(r.icon) + OC.esc(r.name) + '</button>';
        }).join('') + '</div>' : '') +

      '<div class="section-heading"><h2>Calculators</h2><span class="faint small">' + calcRoutes.length + ' tools</span></div>' +
      '<div class="grid-3">' + calcRoutes.map(catCard).join('') + '</div>' +

      '<div class="section-heading"><h2>Converters</h2><span class="faint small">' + convRoutes.length + ' categories</span></div>' +
      '<div class="grid-3">' + convRoutes.map(catCard).join('') + '</div>' +

      '<div class="section-heading"><h2>About OmniCalc</h2></div>' +
      '<div class="panel">' +
      '  <p class="muted">OmniCalc is a <strong>static, client-side web app</strong> — pure HTML, CSS and JavaScript with no backend. ' +
      '  Static conversion tables ship with the app; live currency and crypto rates are fetched when online and cached for offline use. ' +
      '  Favorites, history and custom converters live only in your browser.</p>' +
      '  <div class="row mt-2">' +
      '    <span class="tag tag-lime">No accounts</span><span class="tag tag-lime">No tracking</span>' +
      '    <span class="tag tag-lime">Installable PWA</span><span class="tag tag-lime">No eval()</span>' +
      '  </div>' +
      '</div>');

    OC.hydrateIcons(page);

    /* navigation */
    page.addEventListener('click', function (e) {
      var go = e.target.closest('[data-goto]');
      if (go) { OC.router.go(go.getAttribute('data-goto')); return; }
      var ex = e.target.closest('[data-example]');
      if (ex) {
        var q = ex.getAttribute('data-example');
        var search = OC.qs('#homeSearch', page);
        search.value = q;
        var results = OC.search.search(q);
        if (results.length) results[0].go();
        return;
      }
    });

    OC.search.attach(OC.qs('#homeSearch', page), OC.qs('#homeSearchResults', page));
  }

  OC.registerHome = function () {
    OC.registerRoute({
      id: 'home',
      name: 'Home',
      icon: 'home',
      group: 'system',
      desc: 'Dashboard with search and favorites.',
      keywords: 'home dashboard start index main',
      render: renderHome
    });
  };
})();
