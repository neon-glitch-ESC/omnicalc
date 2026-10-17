/* OmniCalc - components.js
   Shared UI builders used by every page. Pure DOM, template strings. */

(function () {
  'use strict';

  var ui = OC.ui = {};

  /* Mount a page: clears the app content, wraps markup in .page, scrolls top. */
  ui.mount = function (container, html) {
    container.innerHTML = '';
    var page = OC.el('<div class="page">' + html + '</div>');
    container.appendChild(page);
    OC.hydrateIcons(page);
    ui.bindFavorites(page);
    window.scrollTo({ top: 0 });
    return page;
  };

  /* Page header with kicker, title, description and optional favorite star. */
  ui.pageHead = function (opts) {
    var fav = '';
    if (opts.routeId) {
      var active = OC.favorites.has(opts.routeId);
      fav = '<button class="icon-btn fav-toggle ' + (active ? 'is-active' : '') + '" data-route="' + OC.esc(opts.routeId) + '" ' +
        'aria-pressed="' + (active ? 'true' : 'false') + '" aria-label="Pin to favorites" title="Pin to favorites">' +
        OC.iconHTML('star', active ? 'fill' : '') + '</button>';
    }
    return '' +
      '<div class="page-head">' +
      '  <div class="page-head-text">' +
      '    <span class="page-kicker">' + OC.esc(opts.kicker || 'OmniCalc') + '</span>' +
      '    <h1 class="page-title">' + (opts.icon ? OC.iconHTML(opts.icon) : '') + OC.esc(opts.title) + '</h1>' +
      (opts.desc ? '<p class="page-desc">' + opts.desc + '</p>' : '') +
      '  </div>' +
      '  <div class="page-actions">' + (opts.actions || '') + fav + '</div>' +
      '</div>';
  };

  /* Wire every .fav-toggle inside root. */
  ui.bindFavorites = function (root) {
    OC.qsa('.fav-toggle', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-route');
        var nowFav = OC.favorites.toggle(id);
        btn.classList.toggle('is-active', nowFav);
        btn.setAttribute('aria-pressed', String(nowFav));
        var icon = OC.qs('.msym', btn);
        if (icon) icon.classList.toggle('fill', nowFav);
      });
    });
  };

  /* Build <options> from [{id,label,symbol}] */
  ui.unitOptions = function (units, selectedId) {
    return units.map(function (u) {
      var label = u.label + (u.symbol ? ' · ' + u.symbol : '');
      return '<option value="' + OC.esc(u.id) + '"' + (u.id === selectedId ? ' selected' : '') + '>' + OC.esc(label) + '</option>';
    }).join('');
  };

  /* Simple select element markup */
  ui.selectHTML = function (options, selectedId, attrs) {
    return '<select class="select ' + ((attrs && attrs.cls) || '') + '" ' +
      'id="' + ((attrs && attrs.id) || '') + '" ' +
      ((attrs && attrs.label) ? 'aria-label="' + OC.esc(attrs.label) + '"' : '') + '>' +
      options + '</select>';
  };

  /* Generic key/value rows */
  ui.kv = function (label, value, big) {
    return '<div class="kv"><span class="kv-key">' + label + '</span><span class="kv-val' + (big ? ' big' : '') + '">' + value + '</span></div>';
  };

  /* Tabs markup. items: [{id, label, icon}] */
  ui.tabsHTML = function (items, activeId) {
    return '<div class="tabs" role="tablist">' + items.map(function (t) {
      return '<button class="chip ' + (t.id === activeId ? 'active' : '') + '" role="tab" ' +
        'aria-selected="' + (t.id === activeId) + '" data-tab="' + OC.esc(t.id) + '">' +
        (t.icon ? OC.iconHTML(t.icon) : '') + OC.esc(t.label) + '</button>';
    }).join('') + '</div>';
  };

  /* Wire tabs inside root; onChange(id). */
  ui.wireTabs = function (root, onChange) {
    OC.qsa('[data-tab]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { onChange(btn.getAttribute('data-tab')); });
    });
  };

  /* Banner */
  ui.banner = function (type, title, body, extra) {
    var icon = type === 'error' ? 'error' : (type === 'warn' ? 'warning' : 'info');
    return '<div class="banner ' + (type || '') + '">' + OC.iconHTML(icon) +
      '<div class="banner-body">' + (title ? '<div class="banner-title">' + OC.esc(title) + '</div>' : '') +
      '<div>' + (body || '') + '</div></div>' + (extra || '') + '</div>';
  };

  /* Copy to clipboard button */
  ui.copyBtn = function (getText, label) {
    var btn = OC.el('<button class="btn btn-sm" type="button">' + OC.iconHTML('content_copy') +
      '<span>' + OC.esc(label || 'Copy') + '</span></button>');
    btn.addEventListener('click', function () {
      var text = typeof getText === 'function' ? getText() : getText;
      ui.clipboard(text).then(function (ok) {
        var span = OC.qs('span:last-child', btn);
        if (!span) return;
        span.textContent = ok ? 'Copied' : 'Failed';
        setTimeout(function () { span.textContent = label || 'Copy'; }, 1400);
      });
    });
    return btn;
  };

  ui.clipboard = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return Promise.resolve(ok);
    } catch (e) {
      return Promise.resolve(false);
    }
  };

  /* Debounced live "flash" on result elements */
  ui.flash = function (node) {
    if (!node) return;
    node.classList.add('flash');
    setTimeout(function () { node.classList.remove('flash'); }, 260);
  };

  /* Human-friendly sample formatting used on home cards and search */
  ui.examples = {
    length: '10 km to miles',
    currency: '100 usd to eur',
    temperature: '20 c to f',
    mass: '5 kg to lb'
  };
})();
