// colorful-geek (astro port) — main client-side behaviors.
// Ported from themes/colorful-geek/source/js/main.js with adjustments for
// Shiki code blocks and remark-github-blockquote-alert callouts.

(function () {
  const cfg = document.body.dataset;
  const opts = {
    copyCode: cfg.copyCode !== '0',
    externalLink: cfg.externalLink === '1',
    langBadge: cfg.langBadge !== '0',
    backTopEnable: cfg.backTopEnable !== '0',
    backTopThreshold: parseInt(cfg.backTopThreshold || '320', 10) || 320,
  };

  // ─── Theme toggle ───────────────────────────────────────────────────
  const root = document.documentElement;
  const STORAGE_KEY = 'theme-mode';

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
  }

  document.querySelectorAll('.js-toggle-theme').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cur = root.getAttribute('data-theme') || 'dark';
      setTheme(cur === 'dark' ? 'light' : 'dark');
      btn.classList.remove('is-switching');
      // force reflow so the animation restarts on rapid clicks
      void btn.offsetWidth;
      btn.classList.add('is-switching');
      setTimeout(function () { btn.classList.remove('is-switching'); }, 600);
      // Drop focus so the button doesn't stay highlighted after a click —
      // mouse/touch clicks don't need the focus ring, keyboard activation
      // still gets it via :focus-visible.
      try { btn.blur(); } catch (e) {}
    });
  });

  // ─── Copy code button (Expressive Code custom buttons) ─────────────
  // The button + SVG icons are rendered by the pluginCustomCopyButton EC
  // plugin (see src/plugins/expressive-code/custom-copy-button.ts). We
  // wire a single delegated listener that copies the code text of the
  // enclosing <pre>, then briefly toggles the .success class so the
  // checkmark icon shows.
  if (opts.copyCode) {
    document.addEventListener('click', function (e) {
      const target = e.target instanceof Element
        ? e.target.closest('.copy-btn')
        : null;
      if (!target) return;
      const pre = target.closest('pre');
      const codeEle = pre && pre.querySelector('code');
      if (!codeEle) return;
      const codeLines = Array.from(codeEle.querySelectorAll('.code:not(summary *)'));
      const text = (codeLines.length
        ? codeLines.map((el) => (el.textContent === '\n' ? '' : el.textContent)).join('\n')
        : codeEle.innerText).replace(/\n$/, '');
      const writePromise = (navigator.clipboard && navigator.clipboard.writeText)
        ? navigator.clipboard.writeText(text)
        : new Promise(function (resolve) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (_) {}
            document.body.removeChild(ta);
            resolve();
          });
      writePromise.finally(function () {
        const prev = target.getAttribute('data-timeout-id');
        if (prev) clearTimeout(parseInt(prev, 10));
        target.classList.add('success');
        const tid = setTimeout(function () {
          target.classList.remove('success');
        }, 1200);
        target.setAttribute('data-timeout-id', String(tid));
      });
    });
  }

  // ─── External link target=_blank ────────────────────────────────────
  if (opts.externalLink) {
    const host = location.host;
    document.querySelectorAll('.post-body a[href]').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (!/^https?:\/\//i.test(href)) return;
      try {
        const url = new URL(href, location.href);
        if (url.host && url.host !== host) {
          a.target = '_blank';
          const rel = (a.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
          if (rel.indexOf('noopener') === -1) rel.push('noopener');
          if (rel.indexOf('noreferrer') === -1) rel.push('noreferrer');
          a.setAttribute('rel', rel.join(' '));
        }
      } catch (e) {}
    });
  }

  // ─── Code block language badge ─────────────────────────────────────
  // Expressive Code renders this via pluginLanguageBadge using the
  // [data-language] attribute on the inner <pre>. Nothing to do here.

  // ─── Reading progress ───────────────────────────────────────────────
  const progress = document.querySelector('#reading-progress .reading-progress-bar');
  if (progress) {
    function updateProgress() {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
      progress.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ─── Back to top ────────────────────────────────────────────────────
  const backTop = document.getElementById('back-to-top');
  if (backTop && opts.backTopEnable) {
    const threshold = opts.backTopThreshold;
    function updateBackTop() {
      if (window.scrollY > threshold) backTop.classList.add('is-visible');
      else backTop.classList.remove('is-visible');
    }
    document.addEventListener('scroll', updateBackTop, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateBackTop();
  }

  // ─── Fancybox image lightbox ────────────────────────────────────────
  if (typeof window.Fancybox !== 'undefined') {
    document.querySelectorAll('.post-body img').forEach(function (img) {
      if (img.closest('a')) return;
      const src = img.getAttribute('src');
      if (!src) return;
      const a = document.createElement('a');
      a.href = src;
      a.setAttribute('data-fancybox', 'post-gallery');
      if (img.alt) a.setAttribute('data-caption', img.alt);
      img.parentNode.insertBefore(a, img);
      a.appendChild(img);
    });
    window.Fancybox.bind('[data-fancybox]', {
      Hash: false,
      animated: true,
      showClass: 'fancybox-fadeIn',
      hideClass: 'fancybox-fadeOut',
    });
  } else {
    // Fancybox is loaded with defer; bind after it's ready.
    window.addEventListener('load', function () {
      if (typeof window.Fancybox === 'undefined') return;
      document.querySelectorAll('.post-body img').forEach(function (img) {
        if (img.closest('a')) return;
        const src = img.getAttribute('src');
        if (!src) return;
        const a = document.createElement('a');
        a.href = src;
        a.setAttribute('data-fancybox', 'post-gallery');
        if (img.alt) a.setAttribute('data-caption', img.alt);
        img.parentNode.insertBefore(a, img);
        a.appendChild(img);
      });
      window.Fancybox.bind('[data-fancybox]', {
        Hash: false,
        animated: true,
        showClass: 'fancybox-fadeIn',
        hideClass: 'fancybox-fadeOut',
      });
    });
  }

  // ─── TOC scrollspy ──────────────────────────────────────────────────
  const tocLinks = document.querySelectorAll('.post-toc .toc-link');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const headingMap = new Map();
    tocLinks.forEach(function (link) {
      const id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
      const heading = document.getElementById(id);
      if (heading) headingMap.set(heading, link);
    });

    const visible = new Set();
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      tocLinks.forEach((l) => l.classList.remove('is-active'));
      if (visible.size) {
        const first = Array.from(visible).sort(function (a, b) {
          return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
        })[0];
        const link = headingMap.get(first);
        if (link) link.classList.add('is-active');
      }
    }, { rootMargin: '-80px 0px -70% 0px' });

    headingMap.forEach(function (_, heading) { observer.observe(heading); });
  }

  // ─── Search modal open/close ────────────────────────────────────────
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { searchInput && searchInput.focus(); }, 30);
  }
  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.hidden = true;
    document.documentElement.style.overflow = '';
  }

  document.querySelectorAll('.js-open-search').forEach(function (btn) {
    btn.addEventListener('click', openSearch);
  });
  document.querySelectorAll('.js-close-search').forEach(function (btn) {
    btn.addEventListener('click', closeSearch);
  });
  if (searchOverlay) {
    searchOverlay.addEventListener('click', function (e) {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // ─── Keybindings ────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const editing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    if (e.key === 'Escape' && searchOverlay && !searchOverlay.hidden) {
      closeSearch();
      return;
    }
    if (editing) return;

    if (e.key === '/' && searchOverlay) {
      e.preventDefault();
      openSearch();
    } else if (e.key === 'g') {
      window.location.href = (window.SITE_ROOT || '/');
    }
  });

  // ─── Post card cursor-follow glow ───────────────────────────────────
  // Updates --mx/--my custom properties on each post card so the
  // radial-gradient ::after layer tracks the cursor.
  document.querySelectorAll('.post-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });

  window.__terminalCloseSearch = closeSearch;
})();
