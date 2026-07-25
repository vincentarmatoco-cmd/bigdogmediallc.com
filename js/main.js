/* ═══════════════════════════════════════════════════════════
   BIG DOG MEDIA — main.js · v4 (cinematic)
   No libraries. One motion system, transform/opacity only,
   easing cubic-bezier(0.22,1,0.36,1), IntersectionObserver triggers.
     · scroll-scrub canvas hero
     · reveals + stagger
     · navbar blur on scroll
     · subtle parallax
     · counters, mailto form, portfolio manifest loader
   Without JS the site stays readable (reveal-hiding is under html.js).
   ═══════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasIO = 'IntersectionObserver' in window;

  /* ───────── Broken-image fallbacks (delegated, capture-phase) ─────────
     `error` doesn't bubble, so listen in capture. Keeps behaviour out of
     inline onerror attrs (CSP-friendly). */
  document.addEventListener('error', e => {
    const t = e.target;
    if (!(t instanceof HTMLImageElement)) return;
    if (t.closest('.workscene__media')) t.style.display = 'none';
    else if (t.closest('.duo__media')) t.classList.add('is-missing');
  }, true);

  /* ───────── Reveals + stagger ───────── */
  const revealables = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (prefersReduced || !hasIO) {
    revealables.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    revealables.forEach(el => io.observe(el));
  }

  /* ───────── Navbar blur on scroll ───────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    let navTick = false;
    const onNav = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 8);
      navTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!navTick) { navTick = true; requestAnimationFrame(onNav); }
    }, { passive: true });
    onNav();
  }

  /* ───────── Subtle parallax ───────── */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !prefersReduced) {
    let pTick = false;
    const onParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const strength = parseFloat(el.dataset.parallax) || 0.1;
        // -1 (below) → 1 (above) across the viewport
        const rel = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        el.style.transform = `translate3d(0, ${(-rel * strength * 100).toFixed(1)}px, 0) scale(1.06)`;
      });
      pTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!pTick) { pTick = true; requestAnimationFrame(onParallax); }
    }, { passive: true });
    window.addEventListener('resize', onParallax);
    onParallax();
  }

  /* ───────── Cinematic scroll-scrub hero ─────────
     Scroll position → sequence progress (0–1), rendered on a sticky canvas.
     Light interpolation (currentProgress toward target) gives a buttery scrub
     with no video-decode stutter.

     TO USE A REAL REEL INSTEAD:
       1. Add <video data-cine-video muted playsinline preload="auto"
             src="assets/videos/reel.mp4"> inside .cine__stage (replace canvas).
       2. Replace render(p) below with:  video.currentTime = p * video.duration;
       3. Keep the same progress()/rAF loop — scrubbing logic is identical. */
  const cine = document.querySelector('[data-cine]');
  const canvas = cine && cine.querySelector('[data-cine-canvas]');
  if (cine && canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const fill = cine.querySelector('[data-cine-fill]');
    const hint = cine.querySelector('[data-cine-hint]');

    const beats = [
      { at: 0.10, sub: 'VIDEO · SOCIAL · PAID', lines: [{ t: 'BIG DOG' }, { t: 'MEDIA' }] },
      { at: 0.46, lines: [{ t: 'WE MAKE' }, { t: 'BRANDS' }] },
      { at: 0.82, lines: [{ t: 'IMPOSSIBLE' }, { t: 'TO IGNORE.', gold: true }] }
    ];

    let W = 0, H = 0, dpr = 1;
    let target = 0, current = 0, running = false, visible = false, fontsReady = false;
    let vignette = null, lastW = -1;

    // Pre-rendered grain tile (drawn once, stamped cheaply each frame)
    const grain = document.createElement('canvas');
    grain.width = grain.height = 140;
    const gctx = grain.getContext('2d');
    const gimg = gctx.createImageData(140, 140);
    for (let i = 0; i < gimg.data.length; i += 4) {
      const v = 235 + Math.random() * 20;
      gimg.data[i] = gimg.data[i + 1] = gimg.data[i + 2] = v;
      gimg.data[i + 3] = Math.random() * 26;
    }
    gctx.putImageData(gimg, 0, 0);
    const grainPattern = ctx.createPattern(grain, 'repeat');

    function resize() {
      // Mobile address-bar show/hide fires resize on height only; skip the
      // expensive backing-store realloc unless the width actually changed.
      if (canvas.clientWidth === lastW) { render(current); return; }
      lastW = canvas.clientWidth;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Vignette only changes with size — build it once here, not every frame.
      vignette = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
      vignette.addColorStop(0, 'rgba(20,19,16,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      render(current);
    }

    function smooth(x) { return x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x); }

    function drawText(beat, alpha, offY) {
      const cx = W / 2;
      const mainSize = Math.min(W * 0.13, 148);
      const lh = mainSize * 0.9;
      const lines = beat.lines;
      const totalH = lh * lines.length;
      let y = H / 2 - totalH / 2 + lh / 2 + offY;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (beat.sub) {
        ctx.font = `600 ${Math.min(W * 0.021, 20)}px 'Archivo', sans-serif`;
        ctx.fillStyle = '#8F8B83';
        ctx.save();
        // letterspaced sub — approximate with manual tracking
        const sub = beat.sub;
        ctx.globalAlpha = alpha;
        ctx.fillText(sub.split('').join('  '), cx, y - lh * 0.85);
        ctx.restore();
      }

      ctx.font = `900 ${mainSize}px 'Archivo', sans-serif`;
      lines.forEach(line => {
        ctx.fillStyle = line.gold ? '#CF9A4A' : '#F4F1EA';
        ctx.fillText(line.t, cx, y);
        y += lh;
      });
      ctx.restore();
    }

    function render(p) {
      if (!W || !H) return;
      // Ink field
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, W, H);

      // Vignette (prebuilt in resize — no per-frame gradient allocation)
      if (vignette) { ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H); }

      // Type beats (crossfade by proximity)
      if (fontsReady) {
        beats.forEach(beat => {
          const a = smooth(1 - Math.abs(p - beat.at) / 0.26);
          if (a > 0.01) drawText(beat, a, (p - beat.at) * -120);
        });
      }

      // Grain
      if (grainPattern && !prefersReduced) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.translate((Math.random() * 140) | 0, (Math.random() * 140) | 0);
        ctx.fillStyle = grainPattern;
        ctx.fillRect(-140, -140, W + 280, H + 280);
        ctx.restore();
      }

      if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
      if (hint) hint.style.opacity = String(Math.max(0, 1 - p / 0.05));
    }

    function progress() {
      const total = cine.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      const p = -cine.getBoundingClientRect().top / total;
      return p < 0 ? 0 : p > 1 ? 1 : p;
    }

    function loop() {
      if (!running) return;
      if (prefersReduced) {
        current = target;
      } else {
        current += (target - current) * 0.12;
        if (Math.abs(target - current) < 0.0005) current = target;
      }
      render(current);
      if (!prefersReduced && Math.abs(target - current) >= 0.0005) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }
    function kick() {
      target = progress();
      if (!running && visible) { running = true; requestAnimationFrame(loop); }
    }

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', resize);

    if (hasIO) {
      new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) kick();
      }, { rootMargin: '10% 0px' }).observe(cine);
    } else {
      visible = true;
    }

    resize();
    target = current = progress();
    render(current);
    const markReady = () => { fontsReady = true; render(current); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markReady);
    else markReady();
  }

  /* ───────── Counters ───────── */
  const counters = document.querySelectorAll('[data-count]');
  if (!prefersReduced && hasIO && counters.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        const el = entry.target;
        const targetV = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now();
        (function tick(t) {
          const p = Math.min((t - t0) / 1400, 1);
          el.textContent = Math.round(targetV * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  /* ───────── Contact form ─────────
     Submits to Web3Forms (no server needed) and emails the inquiry to us.
     If the access key hasn't been set yet, it falls back to opening the
     visitor's email client so a submission is never silently lost. */
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    const EMAIL = 'vincentarmato.co@gmail.com';

    const mailtoFallback = (name, biz, budget, msg) => {
      const body = encodeURIComponent(`Name: ${name}\nBusiness: ${biz}\nBudget: ${budget}\n\n${msg}`);
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project inquiry — ' + biz)}&body=${body}`;
      status.textContent = 'Opening your email client — talk soon.';
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const biz = (data.get('business') || '').toString().trim();
      const msg = (data.get('message') || '').toString().trim();
      const budget = (data.get('budget') || '').toString();
      if (!name || !biz || !msg) {
        status.textContent = 'Fill in every field. Big dogs finish the job.';
        return;
      }

      const key = (data.get('access_key') || '').toString().trim();
      if (!key || key.startsWith('YOUR_')) {
        mailtoFallback(name, biz, budget, msg);
        return;
      }

      data.set('subject', 'Project inquiry — ' + biz);
      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      status.textContent = 'Sending…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          status.textContent = "Got it — we'll reply within a day.";
          form.reset();
        } else {
          status.textContent = (out && out.message) ? out.message
            : `Something went wrong. Email us directly at ${EMAIL}.`;
        }
      } catch (err) {
        status.textContent = `Network hiccup — email us directly at ${EMAIL}.`;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  }

  /* ───────── Portfolio manifest loader (work page) ─────────
     Reels render as vertical poster cards; the heavy MP4 loads only when
     tapped (preload none), then plays with sound + controls. Photos render
     as images. Relative paths survive GitHub Pages sub-path hosting. */
  const tierGrids = document.querySelectorAll('[data-tier-grid]');
  const carousels = document.querySelectorAll('[data-reel-carousel]');
  const esc = s => String(s || '').replace(/"/g, '&quot;');
  const isVideo = item => item.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(item.src || '');

  // One tile's markup — reused by the grids and the reel carousel so styling
  // and tap-to-play behave identically in both.
  function tileMarkup(item) {
    const vid = isVideo(item);
    const media = vid
      ? `<button class="tile__play" type="button" aria-label="Play ${esc(item.title) || 'reel'}" data-video="${esc(item.src)}">
           ${item.poster ? `<img loading="lazy" decoding="async" src="${esc(item.poster)}" alt="${esc(item.title) || 'Reel'}">` : ''}
           <span class="tile__playbtn" aria-hidden="true"></span>
         </button>`
      : (item.src
          ? `<img loading="lazy" decoding="async" src="${esc(item.src)}" alt="${esc(item.title) || 'Portfolio piece'}">`
          : `<span class="meta">${esc(item.label) || 'Reel / case film'}</span>`);
    return `<article class="tile${vid ? ' tile--reel' : ''}">
      <div class="tile__media">${media}</div>
      <div class="tile__body">
        <span class="tile__client">${esc(item.title)}</span>
        <span class="tile__metric">${esc(item.result)}</span>
      </div>
    </article>`;
  }

  function renderManifest(man) {
    if (!man) return;
    tierGrids.forEach(grid => {
      const items = man[grid.dataset.tierGrid];
      if (!Array.isArray(items) || !items.length) return;
      grid.innerHTML = items.map(tileMarkup).join('');
    });
    carousels.forEach(car => {
      const items = man[car.dataset.reelCarousel];
      if (!Array.isArray(items) || !items.length) return;
      buildCarousel(car, items);
    });
  }

  /* ───────── Center-focused reel carousel ─────────
     Clone-buffered infinite loop: [clones][reals][clones]. The active index
     walks the full list; when it crosses into a clone band we snap (transition
     off) back to the matching real slide, so next/prev loop seamlessly. The
     centered slide gets .is-center (scales up); neighbors peek in scaled down.
     Slide inner markup is the same reel tile, so the shared tap-to-play
     delegation below plays a reel with zero extra wiring. */
  function buildCarousel(car, items) {
    const track = car.querySelector('[data-reel-track]');
    const viewport = car.querySelector('.reelousel__viewport');
    if (!track || !viewport) return;

    const n = items.length;
    const slideHTML = item => `<div class="reelousel__slide">${tileMarkup(item)}</div>`;
    // Clone the whole set on each side so the peeking neighbors are always real.
    const seq = items.concat(items, items); // [clones][reals][clones]
    track.innerHTML = seq.map(slideHTML).join('');
    const slides = Array.from(track.children);

    let index = n;          // first real slide
    let step = 0;           // slide width + gap, measured from the DOM
    let slideW = 0;
    let animating = false;

    function measure() {
      slideW = slides[0].getBoundingClientRect().width;
      step = slides.length > 1
        ? slides[1].offsetLeft - slides[0].offsetLeft
        : slideW;
    }

    function place(animate) {
      const vpW = viewport.clientWidth;
      const x = vpW / 2 - (index * step + slideW / 2);
      track.style.transition = (animate && !prefersReduced)
        ? 'transform 0.5s cubic-bezier(0.22,1,0.36,1)'
        : 'none';
      track.style.transform = `translate3d(${x}px,0,0)`;
      slides.forEach((s, i) => s.classList.toggle('is-center', i === index));
    }

    // Pause a reel that's playing when it leaves the center.
    function pauseOthers() {
      slides.forEach((s, i) => {
        if (i === index) return;
        const v = s.querySelector('video');
        if (v && !v.paused) v.pause();
      });
    }

    function step_(dir) {
      if (animating && !prefersReduced) return;
      index += dir;
      animating = true;
      pauseOthers();
      place(true);
      if (prefersReduced) { normalize(); animating = false; }
    }

    // After the animation, if we've walked into a clone band, jump (no
    // transition) to the equivalent real slide so the loop never runs out.
    function normalize() {
      if (index < n) index += n;
      else if (index >= 2 * n) index -= n;
      place(false);
    }

    track.addEventListener('transitionend', e => {
      if (e.propertyName !== 'transform') return;
      normalize();
      animating = false;
    });

    // Click a peeking side slide → slide it to the center. Runs before the
    // document-level tap-to-play delegation, so a click on an off-center reel
    // re-centers it instead of playing; the centered slide plays as normal.
    track.addEventListener('click', e => {
      const slide = e.target.closest('.reelousel__slide');
      if (!slide) return;
      const i = slides.indexOf(slide);
      if (i === -1 || i === index) return; // centered slide → let it play
      e.stopPropagation();
      e.preventDefault();
      step_(i - index);
    });

    const prev = car.querySelector('.reelousel__nav--prev');
    const next = car.querySelector('.reelousel__nav--next');
    if (prev) prev.addEventListener('click', () => step_(-1));
    if (next) next.addEventListener('click', () => step_(1));

    // Keyboard: arrows move the carousel when it holds focus.
    car.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step_(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step_(1); }
    });

    // Touch / pointer swipe on the viewport.
    let startX = null;
    viewport.addEventListener('pointerdown', e => { startX = e.clientX; });
    viewport.addEventListener('pointerup', e => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) step_(dx < 0 ? 1 : -1);
    });
    viewport.addEventListener('pointercancel', () => { startX = null; });

    let rTick = false;
    window.addEventListener('resize', () => {
      if (rTick) return;
      rTick = true;
      requestAnimationFrame(() => { measure(); place(false); rTick = false; });
    });

    // Wait for poster images to settle so the first measure is accurate.
    measure();
    place(false);
    requestAnimationFrame(() => { measure(); place(false); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { measure(); place(false); });
    }
  }

  if (tierGrids.length || carousels.length) {
    // Embedded manifest (self-contained builds) wins; else fetch the file.
    if (window.__PORTFOLIO_MANIFEST__) renderManifest(window.__PORTFOLIO_MANIFEST__);
    else if (window.fetch) {
      fetch('portfolio/manifest.json')
        .then(r => (r.ok ? r.json() : null))
        .then(renderManifest)
        .catch(() => { /* no manifest yet — placeholder tiles stay */ });
    }

    // Tap a reel poster → swap in the real video and play it
    document.addEventListener('click', e => {
      const btn = e.target.closest('.tile__play');
      if (!btn || !btn.dataset.video) return;
      const v = document.createElement('video');
      v.className = 'tile__video';
      v.src = btn.dataset.video;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.preload = 'auto';
      btn.replaceWith(v);
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    });
  }

  /* ───────── Testimonials carousel ─────────
     One quote at a time, crossfading. Auto-advances every few seconds and
     loops; pauses while hovered/focused; a click on a dot or arrow takes manual
     control and stops the auto-play for the rest of the visit. Height is pinned
     to the tallest quote so the crossfade never jolts the layout. Reduced
     motion → no auto-play (arrows/dots still work). */
  const tcar = document.querySelector('[data-testimonials]');
  if (tcar) {
    const viewport = tcar.querySelector('.tcarousel__viewport');
    const slides = Array.from(tcar.querySelectorAll('.tcarousel__slide'));
    const dotsWrap = tcar.querySelector('.tcarousel__dots');
    const prev = tcar.querySelector('.tcarousel__nav--prev');
    const next = tcar.querySelector('.tcarousel__nav--next');
    const DELAY = 5500;

    if (slides.length) {
      let index = slides.findIndex(s => s.classList.contains('is-active'));
      if (index < 0) index = 0;
      let timer = null;
      let userControlled = false;

      // Dots
      const dots = slides.map((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'tcarousel__dot';
        d.setAttribute('role', 'tab');
        d.setAttribute('aria-label', `Testimonial ${i + 1}`);
        d.addEventListener('click', () => { stopAuto(); go(i); });
        dotsWrap && dotsWrap.appendChild(d);
        return d;
      });

      function go(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, k) => {
          const on = k === index;
          s.classList.toggle('is-active', on);
          s.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        dots.forEach((d, k) => {
          const on = k === index;
          d.classList.toggle('is-active', on);
          d.setAttribute('aria-selected', on ? 'true' : 'false');
        });
      }

      function startAuto() {
        if (prefersReduced || userControlled || timer) return;
        timer = setInterval(() => go(index + 1), DELAY);
      }
      function pauseAuto() { if (timer) { clearInterval(timer); timer = null; } }
      function stopAuto() { pauseAuto(); userControlled = true; }

      // Pin the viewport height to the tallest quote so crossfading (the slides
      // are absolutely stacked) never collapses or clips the section. Measure
      // the inner .tquote — the slides themselves are position:absolute and
      // would report a collapsed height.
      function fitHeight() {
        let h = 0;
        slides.forEach(s => {
          const q = s.querySelector('.tquote');
          if (q) h = Math.max(h, q.getBoundingClientRect().height);
        });
        const cs = getComputedStyle(slides[0]);
        const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
        if (h) viewport.style.minHeight = Math.ceil(h + pad) + 'px';
      }

      if (prev) prev.addEventListener('click', () => { stopAuto(); go(index - 1); });
      if (next) next.addEventListener('click', () => { stopAuto(); go(index + 1); });

      // Pause on hover / keyboard focus so a quote never slips away mid-read.
      tcar.addEventListener('mouseenter', pauseAuto);
      tcar.addEventListener('mouseleave', startAuto);
      tcar.addEventListener('focusin', pauseAuto);
      tcar.addEventListener('focusout', startAuto);

      let hTick = false;
      window.addEventListener('resize', () => {
        if (hTick) return;
        hTick = true;
        requestAnimationFrame(() => { fitHeight(); hTick = false; });
      });

      go(index);
      fitHeight();
      requestAnimationFrame(fitHeight);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeight);
      startAuto();
    }
  }

})();
