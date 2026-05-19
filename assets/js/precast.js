/* Precast Africa — shared interactions (dark redesign) */
(function () {
  // ── Nav scroll state ───────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    const setScrolled = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', setScrolled, { passive: true });
    setScrolled();
  }

  // ── Mobile menu toggle ─────────────────────────
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobile.addEventListener('click', e => {
      if (e.target.tagName === 'A') mobile.classList.remove('is-open');
    });
  }

  // ── Smooth in-page anchor scrolling ────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.length > 1 && href.indexOf('#') === 0) {
        const t = document.querySelector(href);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });

  // ── Letter splitting for .anim-letters ─────────
  // Walks the title preserving <em>/<br>/word boundaries
  function splitLetters(root) {
    if (root.dataset.split === '1') return;
    root.dataset.split = '1';
    let charCount = 0;

    function walk(node) {
      const frag = document.createDocumentFragment();
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const txt = child.textContent;
          // Split by spaces — words become spans of letters, keep spaces as a gap
          const words = txt.split(/(\s+)/);
          words.forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) {
              frag.appendChild(document.createTextNode(' '));
              return;
            }
            const wEl = document.createElement('span');
            wEl.className = 'word';
            [...w].forEach(ch => {
              const sp = document.createElement('span');
              sp.className = 'letter';
              sp.textContent = ch;
              sp.style.transitionDelay = (charCount * 22) + 'ms';
              charCount++;
              wEl.appendChild(sp);
            });
            frag.appendChild(wEl);
          });
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName === 'BR') {
            frag.appendChild(child.cloneNode());
          } else {
            // Recurse into <em>, <span>, etc — keep wrapper, split inside
            const wrap = child.cloneNode(false);
            const inner = walk(child);
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          }
        }
      });
      return frag;
    }

    const newContent = walk(root);
    root.innerHTML = '';
    root.appendChild(newContent);
  }

  document.querySelectorAll('.anim-letters').forEach(splitLetters);

  function revealLetters(root) {
    root.querySelectorAll('.letter').forEach(l => l.classList.add('in'));
  }

  // ── Stat counter animation ─────────────────────
  function runCounter(el) {
    if (el.dataset.ran === '1') return;
    el.dataset.ran = '1';
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const dur = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (eased * target).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ── In-view reveal (observer) ──────────────────
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      if (el.classList.contains('anim-letters')) revealLetters(el);
      el.querySelectorAll('.counter[data-target]:not([data-ran])').forEach(runCounter);
      io.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  // observe reveal targets and letter blocks
  document.querySelectorAll('.reveal, .anim-letters').forEach(el => io.observe(el));
  // standalone counters not inside a reveal
  document.querySelectorAll('.counter[data-target]').forEach(el => io.observe(el));

  // ── Hero letter animation fires immediately on load ─
  // page-hero titles are visible on load → reveal directly
  document.querySelectorAll('.page-hero .anim-letters').forEach(el => {
    requestAnimationFrame(() => {
      el.classList.add('in');
      revealLetters(el);
    });
  });


  // ── Scroll-driven 3D perspective list ──────────
  // Apply to any .anim-perspective inside a section: items get tilt/blur/opacity as you scroll
  function setupPerspective(list) {
    const section = list.closest('section, .section, [data-perspective-section]') || list.parentElement;
    const items = [...list.querySelectorAll('.anim-perspective__item')];
    if (!items.length) return;
    function tick() {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, section.offsetHeight - vh);
      let p = -rect.top / total;
      p = Math.max(0, Math.min(1, p));
      const n = items.length;
      items.forEach((el, i) => {
        const centre = i / Math.max(1, (n - 1));
        const d = (p - centre) * Math.max(1, (n - 1));
        const abs = Math.min(Math.abs(d), 2);
        const opacity = Math.max(0.08, 1 - abs * 0.55);
        const scale = 1 - abs * 0.18;
        const rotateX = d * 30;
        const blur = Math.min(8, abs * 4);
        const y = d * 14;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = 'blur(' + blur.toFixed(2) + 'px)';
        el.style.transform = 'perspective(1000px) translateY(' + y.toFixed(1) + 'px) rotateX(' + rotateX.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
      });
    }
    return tick;
  }

  const perspectiveTicks = [];
  document.querySelectorAll('.anim-perspective').forEach(list => {
    const tick = setupPerspective(list);
    if (tick) { perspectiveTicks.push(tick); tick(); }
  });
  if (perspectiveTicks.length) {
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => { perspectiveTicks.forEach(t => t()); ticking = false; });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => perspectiveTicks.forEach(t => t()));
  }

  // ── Demo-form submit (keeps existing behaviour) ─
  document.querySelectorAll('form.demo-form').forEach(f => {
    f.addEventListener('submit', e => {
      e.preventDefault();
      const btn = f.querySelector('.btn--primary span, .btn--accent span, .btn span');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Thank you — we’ll be in touch';
      setTimeout(() => { btn.textContent = original; f.reset(); }, 3400);
    });
  });
})();
