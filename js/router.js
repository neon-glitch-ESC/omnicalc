/* OmniCalc - router.js
   Hash-based SPA router (~80 lines). Routes register themselves onto OC.routes. */

(function () {
  'use strict';

  OC.routes = {};
  OC.routeList = [];

  OC.registerRoute = function (route) {
    if (!OC.routes[route.id]) OC.routeList.push(route.id);
    OC.routes[route.id] = route;
    return route;
  };

  OC.router = {
    current: null,
    lastParams: {},

    parse: function () {
      var hash = location.hash.replace(/^#\/?/, '');
      var qIndex = hash.indexOf('?');
      var id = qIndex === -1 ? hash : hash.slice(0, qIndex);
      var params = {};
      if (qIndex !== -1) {
        hash.slice(qIndex + 1).split('&').forEach(function (pair) {
          if (!pair) return;
          var eq = pair.indexOf('=');
          var k = eq === -1 ? pair : pair.slice(0, eq);
          var v = eq === -1 ? '' : pair.slice(eq + 1);
          try {
            params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
          } catch (e) { /* ignore malformed */ }
        });
      }
      id = id.replace(/\/+$/, '') || 'home';
      return { id: id, params: params };
    },

    go: function (id, params) {
      var qs = '';
      if (params) {
        qs = Object.keys(params)
          .filter(function (k) { return params[k] !== undefined && params[k] !== null && params[k] !== ''; })
          .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
          .join('&');
      }
      var next = '#' + id + (qs ? '?' + qs : '');
      if (location.hash === next) {
        OC.router.render();
      } else {
        location.hash = next;
      }
    },

    render: function () {
      var parsed = OC.router.parse();
      var route = OC.routes[parsed.id];
      var container = document.getElementById('app-content');
      if (!container) return;

      if (!route) {
        route = OC.routes['home'];
        parsed = { id: 'home', params: {} };
        if (OC.routes['home']) {
          /* fall through: render home, and note the unknown route via console for devs */
          console.warn('OmniCalc: unknown route "' + parsed.id + '", showing home.');
        } else return;
      }

      OC.router.current = route.id;
      OC.router.lastParams = parsed.params;

      try {
        route.render(container, parsed.params);
        document.title = route.name + ' — OmniCalc';
      } catch (e) {
        console.error('Route render failed:', e);
        container.innerHTML = '<div class="page">' +
          '<div class="banner error">' + OC.iconHTML('error') +
          '<div class="banner-body"><div class="banner-title">Something went wrong rendering this page</div>' +
          '<div>' + OC.esc(e.message || String(e)) + '</div></div></div>' +
          '<p><a class="btn btn-primary" href="#home">' + OC.iconHTML('home') + ' Back to home</a></p>' +
          '</div>';
        OC.hydrateIcons(container);
      }

      OC.bus.emit('route', route.id);
    },

    start: function () {
      window.addEventListener('hashchange', function () {
        OC.router.render();
        /* Close the mobile sidebar on navigation */
        document.dispatchEvent(new CustomEvent('omnicalc:navigate'));
      });
      OC.router.render();
    }
  };
})();
