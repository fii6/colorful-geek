// colorful-geek (astro port) — search via Pagefind.
// Pagefind is invoked at build time (see package.json `build` script) and
// drops a JS bundle at /pagefind/pagefind.js inside the static output.
//
// During `astro dev` Pagefind has not yet indexed anything, so the search
// input will load the runtime lazily on first input and report no results.

(function () {
  const input = document.getElementById('search-input');
  const resultsEl = document.getElementById('search-results');
  if (!input || !resultsEl) return;

  let pagefind = null;
  let loading = null;
  let unavailable = false;
  let activeIndex = -1;

  async function loadPagefind() {
    if (pagefind) return pagefind;
    if (unavailable) return null;
    if (loading) return loading;

    // Skip entirely in `astro dev` — Pagefind is a post-build step against
    // `dist/`, so the bundle never exists during development.
    if (import.meta.env.DEV) {
      unavailable = true;
      return null;
    }

    // Probe with HEAD first so we don't log a noisy 404 when the index hasn't
    // been generated yet (e.g. previewing a build without the index step).
    const pagefindUrl = new URL('/pagefind/pagefind.js', window.location.origin).href;
    loading = fetch(pagefindUrl, { method: 'HEAD' })
      .then(function (res) {
        if (!res.ok) {
          unavailable = true;
          return null;
        }
        return import(/* @vite-ignore */ pagefindUrl).then(function (mod) {
          pagefind = mod;
          if (mod.options) mod.options({ excerptLength: 30 });
          if (mod.init) mod.init();
          return mod;
        });
      })
      .catch(function () {
        unavailable = true;
        return null;
      });
    return loading;
  }

  function highlightWrap(html) {
    // Pagefind's excerpt already includes <mark> tags around hits.
    return html;
  }

  async function render(query) {
    const q = query.trim();
    if (!q) {
      resultsEl.innerHTML = '';
      return;
    }
    const pf = await loadPagefind();
    if (!pf) {
      resultsEl.innerHTML = '';
      return;
    }
    const search = await pf.search(q);
    if (!search || !search.results || !search.results.length) {
      resultsEl.innerHTML = '<div class="empty">no matches</div>';
      activeIndex = -1;
      return;
    }
    const top = search.results.slice(0, 20);
    const datas = await Promise.all(top.map(function (r) { return r.data(); }));
    resultsEl.innerHTML = datas
      .map(function (d, i) {
        const title = (d.meta && d.meta.title) || d.url;
        return (
          '<a class="result" href="' + d.url + '" data-idx="' + i + '">' +
          '<span class="result-title">' + escapeHtml(title) + '</span>' +
          '<span class="result-snippet">' + highlightWrap(d.excerpt) + '</span>' +
          '</a>'
        );
      })
      .join('');
    activeIndex = 0;
    setActive(0);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function setActive(i) {
    const items = resultsEl.querySelectorAll('.result');
    items.forEach(function (el, idx) {
      el.classList.toggle('is-active', idx === i);
      if (idx === i) el.scrollIntoView({ block: 'nearest' });
    });
  }

  let debounce;
  input.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(function () { render(input.value); }, 80);
  });

  input.addEventListener('keydown', function (e) {
    const items = resultsEl.querySelectorAll('.result');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = Math.min(items.length - 1, activeIndex + 1);
      setActive(activeIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      activeIndex = Math.max(0, activeIndex - 1);
      setActive(activeIndex);
    } else if (e.key === 'Enter') {
      const target = items[activeIndex];
      if (target) {
        e.preventDefault();
        window.location.href = target.getAttribute('href');
      }
    }
  });

  // Preload pagefind on first focus.
  input.addEventListener('focus', loadPagefind, { once: true });
})();
