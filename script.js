(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Restore the saved appearance before the main interface initializes.
  initThemeToggle();

  /* ---------- LOADER ---------- */
  const loader = document.getElementById("loader");
  const progressEl = document.getElementById("loaderProgress");
  const statusEl = document.getElementById("loaderStatus");
  const statuses = ["Booting interface", "Loading identity", "Mapping capabilities", "Finalizing interface", "Systems online"];
  let progress = 0, si = 0;
  document.body.style.overflow = "hidden";

  const bootTimer = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 16 + 7);
    if (progressEl) progressEl.style.width = progress + "%";
    if (progress > (si + 1) * 20 && si < statuses.length - 1) {
      si++;
      if (statusEl) statusEl.textContent = statuses[si];
    }
    if (progress >= 100) {
      clearInterval(bootTimer);
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "";
        start();
      }, 420);
    }
  }, 140);

  function start() {
    document.getElementById("year").textContent = new Date().getFullYear();
    initLenis();
    initCursor();
    initMagnetic();
    initNav();
    initScrollProgress();
    initMobileNav();
    initProjectFilters();
    initCommandPalette();
    initSystemExplorer();
    initGsap();
    initCounters();
    initLogos();
    initParticles();
    initHeroCanvas();
    initConstellation();
    initCapabilityVisuals();
    initProfileTilt();
  }

  /* ---------- LENIS ---------- */
  let lenisInstance = null;
  function initLenis() {
    if (reduced || typeof Lenis === "undefined") return;

    lenisInstance = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true
    });

    // Single RAF loop — prefer GSAP ticker when available for frame sync
    if (typeof gsap !== "undefined") {
      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
      if (typeof ScrollTrigger !== "undefined") {
        lenisInstance.on("scroll", ScrollTrigger.update);
      }
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Anchor links scroll via Lenis for consistent easing
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenisInstance.scrollTo(target, {
          offset: -80,
          duration: 1.5,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      });
    });
  }

  /* ---------- CURSOR ---------- */
  function initCursor() {
    if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
    const c = document.getElementById("cursor");
    const g = document.getElementById("cursor-glow");
    if (!c || !g) return;
    let x = 0, y = 0, gx = 0, gy = 0, frame = 0;
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      c.style.left = x + "px"; c.style.top = y + "px";
      if (!frame) frame = requestAnimationFrame(follow);
    };
    function follow() {
      gx += (x - gx) * .19; gy += (y - gy) * .19;
      g.style.left = gx + "px"; g.style.top = gy + "px";
      if (Math.abs(x - gx) + Math.abs(y - gy) > .5 && !document.hidden) frame = requestAnimationFrame(follow);
      else frame = 0;
    }
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } });
    document.querySelectorAll("a, button, .btn, .magnetic, .glass-card, .project-card, .lab-node").forEach((el) => {
      el.addEventListener("mouseenter", () => { c.classList.add("hover"); g.classList.add("hover"); });
      el.addEventListener("mouseleave", () => { c.classList.remove("hover"); g.classList.remove("hover"); });
    });
  }

  /* ---------- MAGNETIC ---------- */
  function initMagnetic() {
    if (reduced) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---------- NAV ---------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("active", active);
            if (active) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      sections.forEach((section) => observer.observe(section));
    }
  }

  /* ---------- SCROLL PROGRESS ---------- */
  function initScrollProgress() {
    const bar = document.getElementById("scrollProgress");
    if (!bar) return;
    let scheduled = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
      scheduled = false;
    };
    window.addEventListener("scroll", () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- MOBILE NAVIGATION ---------- */
  function initMobileNav() {
    const toggle = document.getElementById("mobileNavToggle");
    const panel = document.getElementById("mobileNavPanel");
    if (!toggle || !panel) return;
    const close = () => {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      toggle.textContent = "☰";
    };
    toggle.addEventListener("click", () => {
      const opening = !panel.classList.contains("open");
      panel.classList.toggle("open", opening);
      panel.setAttribute("aria-hidden", String(!opening));
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.setAttribute("aria-label", opening ? "Close navigation" : "Open navigation");
      toggle.textContent = opening ? "×" : "☰";
    });
    panel.querySelectorAll("a[href^='#']").forEach((link) => link.addEventListener("click", close));
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
    document.addEventListener("click", (event) => {
      if (panel.classList.contains("open") && !panel.contains(event.target) && !toggle.contains(event.target)) close();
    });
  }

  /* ---------- GSAP ---------- */
  function initGsap() {
    if (typeof gsap === "undefined" || reduced) return;
    if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    gsap.from(".hero-badge", { y: 20, opacity: 0, duration: 0.7, delay: 0.1 });
    gsap.from(".hero-title .line", { y: 60, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.15 });
    gsap.from(".hero-lead", { y: 24, opacity: 0, duration: 0.8, delay: 0.45 });
    gsap.from(".hero-actions", { y: 20, opacity: 0, duration: 0.7, delay: 0.55 });
    gsap.from(".hero-metrics .metric", { y: 24, opacity: 0, duration: 0.6, stagger: 0.08, delay: 0.65 });
    gsap.from(".profile-card", { scale: 0.92, opacity: 0, duration: 1, ease: "power3.out", delay: 0.35 });
    gsap.from(".metrics-strip", { y: 30, opacity: 0, duration: 0.8, delay: 0.85 });

    if (typeof ScrollTrigger === "undefined" || reduced) return;

    gsap.utils.toArray(".section-header").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
      });
    });
    gsap.utils.toArray(".glass-card, .chart-card, .timeline-item, .project-card, .flagship").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 36, opacity: 0, duration: 0.75, ease: "power2.out"
      });
    });
  }

  /* ---------- COUNTERS ---------- */
  function initCounters() {
    const nodes = document.querySelectorAll("[data-count]");
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const start = performance.now();
      const dur = 1500;
      const isInt = Number.isInteger(target);
      (function frame(now) {
        const t = Math.min(1, (now - start) / dur);
        const v = target * (1 - Math.pow(1 - t, 3));
        el.textContent = isInt ? Math.round(v) : v.toFixed(1);
        if (t < 1) requestAnimationFrame(frame);
      })(start);
    };
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          run(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- PROJECT FILTERS ---------- */
  function initProjectFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".project-card[data-category], .flagship[data-category]");
    buttons.forEach((button) => button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      cards.forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    }));
  }

  /* ---------- THEME TOGGLE ---------- */
  function initThemeToggle() {
    const button = document.getElementById("themeToggle");
    if (!button) return;
    let stored = "dark";
    try { stored = localStorage.getItem("smartkey-theme") || "dark"; } catch (_) {}
    const apply = (theme, persist) => {
      const safeTheme = theme === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = safeTheme;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", safeTheme === "light" ? "#f4f3ef" : "#07080c");
      button.setAttribute("aria-label", safeTheme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      button.textContent = safeTheme === "dark" ? "☼" : "◐";
      if (persist) { try { localStorage.setItem("smartkey-theme", safeTheme); } catch (_) {} }
      document.dispatchEvent(new CustomEvent("smartkey:themechange", { detail: { theme: safeTheme } }));
    };
    apply(stored, false);
    button.addEventListener("click", () => {
      apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
    });
    document.addEventListener("smartkey:theme-toggle", () => {
      apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
    });
  }

  /* ---------- COMMAND PALETTE ---------- */
  function initCommandPalette() {
    const overlay = document.getElementById("commandOverlay");
    const trigger = document.getElementById("commandTrigger");
    const closeButton = document.getElementById("commandClose");
    const search = document.getElementById("commandSearch");
    const list = document.getElementById("commandList");
    const empty = document.getElementById("commandEmpty");
    if (!overlay || !trigger || !closeButton || !list) return;
    const options = Array.from(list.querySelectorAll(".command-option"));
    let previousFocus = null;
    const open = () => {
      previousFocus = document.activeElement;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      if (search) { search.value = ""; filterOptions(""); search.focus(); }
    };
    const shut = () => {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      if (previousFocus && previousFocus.focus) previousFocus.focus();
      else trigger.focus();
    };
    const filterOptions = (query) => {
      const q = query.trim().toLowerCase();
      let count = 0;
      options.forEach((option) => {
        const visible = !q || option.textContent.toLowerCase().includes(q);
        option.hidden = !visible;
        if (visible) count++;
      });
      if (empty) empty.hidden = count > 0;
    };
    trigger.addEventListener("click", open);
    closeButton.addEventListener("click", shut);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) shut(); });
    if (search) search.addEventListener("input", () => filterOptions(search.value));
    options.forEach((option) => option.addEventListener("click", () => {
      if (option.tagName === "A") { shut(); return; }
      if (option.dataset.action === "theme") { document.dispatchEvent(new CustomEvent("smartkey:theme-toggle")); shut(); return; }
      const target = option.dataset.target ? document.querySelector(option.dataset.target) : null;
      shut();
      if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }));
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        overlay.classList.contains("open") ? shut() : open();
      }
      if (event.key === "Escape" && overlay.classList.contains("open")) shut();
      if (event.key === "Tab" && overlay.classList.contains("open")) {
        const focusables = Array.from(overlay.querySelectorAll('button:not([hidden]), a[href]:not([hidden]), input:not([hidden])')).filter((el) => !el.disabled && el.offsetParent !== null);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Enter" && overlay.classList.contains("open") && search && document.activeElement === search) {
        const first = options.find((option) => !option.hidden);
        if (first) first.click();
      }
    });
  }

  /* ---------- LOGOS ---------- */
  function initLogos() {
    const map = {
      "github.com": "https://github.githubassets.com/favicons/favicon.svg",
      "akstreamers.net": "https://www.google.com/s2/favicons?domain=akstreamers.net&sz=64"
    };
    document.querySelectorAll(".site-logo").forEach((img) => {
      const d = img.dataset.domain || img.closest("[data-domain]")?.dataset.domain || "";
      if (!d) return;
      img.src = map[d] || `https://www.google.com/s2/favicons?domain=${d}&sz=64`;
      img.onerror = () => { img.style.display = "none"; };
    });
  }

  /* ---------- PARTICLES ---------- */
  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, pts = [], frame = 0, visible = true;
    const N = window.innerWidth < 700 ? 26 : 42;
    function resize() {
      w = window.innerWidth; h = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.1 + .25, a: Math.random() * .24 + .06
      }));
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const lightTheme = document.documentElement.dataset.theme === "light";
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -2) p.x = w + 2; if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2; if (p.y > h + 2) p.y = -2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? `rgba(145,105,24,${p.a * 0.8})` : `rgba(201,162,39,${p.a})`; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < 105) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = lightTheme ? `rgba(89,101,111,${.045 * (1 - d / 105)})` : `rgba(201,162,39,${.035 * (1 - d / 105)})`; ctx.stroke();
        }
      }
    }
    function animate() {
      if (!visible || document.hidden) { frame = 0; return; }
      draw(); frame = requestAnimationFrame(animate);
    }
    function start() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(animate); }
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start(); else if (frame) { cancelAnimationFrame(frame); frame = 0; }
      }, { threshold: 0.01 });
      observer.observe(canvas.parentElement);
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else start(); });
    window.addEventListener("resize", resize, { passive: true });
    resize(); start();
  }

  /* ---------- HERO CANVAS (3D system core) ---------- */
  function initHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, t = 0, frame = 0, visible = true;
    let pointerX = 0, pointerY = 0;
    const pointCount = 150;
    const dust = Array.from({ length: pointCount }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + .25,
      phase: Math.random() * Math.PI * 2, speed: Math.random() * .5 + .2
    }));
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function project(x, y, z, cx, cy, radius, ry, rx) {
      const x1 = x * Math.cos(ry) - z * Math.sin(ry);
      const z1 = x * Math.sin(ry) + z * Math.cos(ry);
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      const perspective = 3.2 / (3.2 + z2 / radius);
      return { x: cx + x1 * radius * perspective, y: cy + y1 * radius * perspective, z: z2 };
    }
    function drawCurve(points, color, alpha, width) {
      if (!points.length) return;
      ctx.beginPath();
      points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke();
    }
    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      const lightTheme = document.documentElement.dataset.theme === "light";
      const mobile = w < 700;
      const cx = w * (mobile ? .73 : .755);
      const cy = h * (mobile ? .46 : .44);
      const radius = Math.min(w * (mobile ? .31 : .185), h * .255, mobile ? 138 : 190);
      const ry = t * .19 + pointerX * .2;
      const rx = .22 + Math.sin(t * .27) * .08 + pointerY * .11;
      const glow = ctx.createRadialGradient(cx, cy, radius * .12, cx, cy, radius * 2.25);
      glow.addColorStop(0, lightTheme ? "rgba(169,126,31,.10)" : "rgba(201,162,39,.12)");
      glow.addColorStop(.42, lightTheme ? "rgba(20,126,118,.035)" : "rgba(100,214,195,.035)");
      glow.addColorStop(1, "rgba(7,8,12,0)");
      ctx.fillStyle = glow; ctx.fillRect(cx - radius * 2.4, cy - radius * 2.4, radius * 4.8, radius * 4.8);

      // Fine orbital rings give the scene depth before the sphere is drawn.
      for (let ring = 0; ring < 3; ring++) {
        const angle = t * (.1 + ring * .035) + ring * 1.1;
        const rxr = radius * (1.42 + ring * .23);
        const ryr = radius * (.26 + ring * .06);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
        ctx.beginPath(); ctx.ellipse(0, 0, rxr, ryr, 0, 0, Math.PI * 2);
        ctx.strokeStyle = lightTheme
          ? (ring === 1 ? "rgba(18,119,112,.24)" : "rgba(140,102,22,.22)")
          : (ring === 1 ? "rgba(100,214,195,.22)" : "rgba(240,215,140,.18)");
        ctx.lineWidth = 1; ctx.setLineDash(ring === 2 ? [2, 7] : []); ctx.stroke(); ctx.restore();
      }

      // Rotating latitude and longitude wireframe, projected as a 3D sphere.
      for (let lat = -1.25; lat <= 1.26; lat += .25) {
        const points = []; let depth = 0;
        for (let step = 0; step <= 90; step++) {
          const lon = step / 90 * Math.PI * 2;
          const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
          const p = project(x, y, z, cx, cy, radius, ry, rx); points.push(p); depth += p.z;
        }
        const a = .10 + .13 * ((depth / points.length / radius + 1) / 2);
        drawCurve(points, lightTheme ? (lat === 0 ? "#9b741e" : "#b58b2c") : (lat === 0 ? "#f0d78c" : "#c9a227"), a, lat === 0 ? 1.3 : .75);
      }
      for (let lon = 0; lon < Math.PI * 2; lon += Math.PI / 9) {
        const points = []; let depth = 0;
        for (let step = 0; step <= 54; step++) {
          const lat = -Math.PI / 2 + step / 54 * Math.PI;
          const x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
          const p = project(x, y, z, cx, cy, radius, ry, rx); points.push(p); depth += p.z;
        }
        const a = .08 + .16 * ((depth / points.length / radius + 1) / 2);
        drawCurve(points, lightTheme
          ? (lon % (Math.PI / 3) < .01 ? "#167c75" : "#a8842a")
          : (lon % (Math.PI / 3) < .01 ? "#64d6c3" : "#e7ca7a"), a, .7);
      }

      // Highlighted data nodes, always on the visible hemisphere.
      for (let i = 0; i < 17; i++) {
        const lat = -1.15 + ((i * 7) % 16) / 15 * 2.3;
        const lon = (i / 17) * Math.PI * 2 + t * .16;
        const p = project(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon), cx, cy, radius, ry, rx);
        if (p.z < -radius * .1) continue;
        const r = i % 4 === 0 ? 2.4 : 1.4;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? (i % 4 === 0 ? "#167c75" : "#a8842a") : (i % 4 === 0 ? "#64d6c3" : "#f0d78c"); ctx.globalAlpha = .48 + .3 * Math.sin(t + i);
        ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = i % 4 === 0 ? 12 : 5; ctx.fill(); ctx.shadowBlur = 0;
      }

      // A few orbital beacons and a soft center.
      for (let i = 0; i < 4; i++) {
        const a = t * (.13 + i * .018) + i * Math.PI / 2;
        const orbit = radius * (1.5 + (i % 2) * .2);
        const bx = cx + Math.cos(a) * orbit; const by = cy + Math.sin(a) * orbit * .3;
        ctx.beginPath(); ctx.arc(bx, by, i === 1 ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? (i === 1 ? "#167c75" : "#9b741e") : (i === 1 ? "#64d6c3" : "#f0d78c"); ctx.globalAlpha = .72; ctx.fill();
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(cx + Math.cos(a) * radius * 1.04, cy + Math.sin(a) * radius * .25);
        ctx.strokeStyle = lightTheme ? "rgba(140,102,22,.2)" : "rgba(240,215,140,.14)"; ctx.lineWidth = .7; ctx.stroke();
      }

      // Atmospheric dust, restrained so typography stays dominant.
      dust.forEach((p, i) => {
        const x = p.x * w + Math.sin(t * p.speed + p.phase) * 8;
        const y = p.y * h + Math.cos(t * p.speed + p.phase) * 5;
        ctx.beginPath(); ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? (i % 7 === 0 ? "#167c75" : "#a8842a") : (i % 7 === 0 ? "#64d6c3" : "#e5c56e"); ctx.globalAlpha = (lightTheme ? .09 : .12) + .12 * Math.sin(t + p.phase); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    function animate() {
      if (!visible || document.hidden || reduced) { frame = 0; return; }
      t += .009; draw(); frame = requestAnimationFrame(animate);
    }
    function start() { if (!frame && visible && !document.hidden && !reduced) frame = requestAnimationFrame(animate); }
    document.addEventListener("smartkey:themechange", draw);
    window.addEventListener("pointermove", (event) => {
      pointerX = (event.clientX / Math.max(1, window.innerWidth) - .5) * .7;
      pointerY = (event.clientY / Math.max(1, window.innerHeight) - .5) * .7;
    }, { passive: true });
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start(); else if (frame) { cancelAnimationFrame(frame); frame = 0; }
      }, { threshold: 0.01 });
      observer.observe(canvas);
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else start(); });
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas.parentElement);
    else window.addEventListener("resize", resize, { passive: true });
    resize();
    if (reduced) draw(); else start();
  }

  /* ---------- CONSTELLATION CANVAS ---------- */
  function initConstellation() {
    const canvas = document.getElementById("constellation");
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    const labels = ["Backend", "Systems", "Infra", "Security", "MV3", "Realtime", "Data", "Linux"];
    const nodes = labels.map((label, i) => {
      const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      return {
        label,
        ox: 200 + Math.cos(a) * 95,
        oy: 140 + Math.sin(a) * 95,
        x: 0, y: 0, phase: Math.random() * Math.PI * 2
      };
    });
    let t = 0;
    function draw() {
      t += 0.016;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 280 * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = rect.width;
      const scaleX = W / 400;
      ctx.clearRect(0, 0, W, 280);
      const lightTheme = document.documentElement.dataset.theme === "light";

      nodes.forEach((n) => {
        n.x = n.ox * scaleX + Math.sin(t + n.phase) * 4;
        n.y = n.oy + Math.cos(t * 0.8 + n.phase) * 3;
      });

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160 * scaleX) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = lightTheme
              ? `rgba(92,105,115,${0.13 * (1 - dist / (160 * scaleX))})`
              : `rgba(201,162,39,${0.12 * (1 - dist / (160 * scaleX))})`;
            ctx.stroke();
          }
        }
      }

      // center
      ctx.beginPath();
      ctx.arc(200 * scaleX, 140, 6, 0, Math.PI * 2);
      ctx.fillStyle = lightTheme ? "rgba(151,111,26,0.95)" : "rgba(240,215,140,0.9)";
      ctx.fill();

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? "#9b741e" : "#c9a227";
        ctx.fill();
        ctx.font = "11px Inter, sans-serif";
        ctx.fillStyle = lightTheme ? "rgba(48,58,68,0.82)" : "rgba(232,230,227,0.75)";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y - 12);
      });

      requestAnimationFrame(draw);
    }
    draw();
  }


  /* ---------- INTERACTIVE CAPABILITY NETWORK ---------- */
  function initCapabilityVisuals() {
    const canvas = document.getElementById("skillsCanvas");
    const controls = Array.from(document.querySelectorAll("[data-capability]"));
    const title = document.getElementById("capabilityDetailTitle");
    const text = document.getElementById("capabilityDetailText");
    const index = document.getElementById("capabilityDetailIndex");
    const count = document.getElementById("capabilityDetailCount");
    const items = document.getElementById("capabilityDetailItems");
    if (!canvas) return;

    const groups = {
      languages: {
        label: "Languages", index: "DOMAIN / 01", count: "8 technologies",
        description: "The programming and scripting layer used to shape application logic, automation, and systems-level work.",
        items: ["C", "C++", "C#", "Python", "JavaScript", "TypeScript", "Bash", "PowerShell"],
        color: "#d7b65d", satellites: ["C / C++", "Python", "JS / TS", "Shell"]
      },
      backend: {
        label: "Backend & real-time", index: "DOMAIN / 02", count: "12 technologies",
        description: "Service architecture, API development, data stores, and the communication patterns behind live applications.",
        items: ["Node.js", "Express", "Fastify", ".NET APIs", "FastAPI", "Flask", "PostgreSQL", "Redis", "MongoDB", "WebSockets", "Server-Sent Events", "REST APIs"],
        color: "#64d6c3", satellites: ["Node / .NET", "FastAPI / Flask", "SQL / NoSQL", "WebSockets"]
      },
      infrastructure: {
        label: "Infrastructure & data", index: "DOMAIN / 03", count: "10 technologies",
        description: "The production environment: operating systems, containers, edge delivery, networking, architecture, and operational security.",
        items: ["Linux", "Windows Server", "Docker", "Nginx", "Cloudflare", "Git", "WireGuard", "ARM64 / x86-64", "Hardening & security", "Monitoring & logs"],
        color: "#a89af4", satellites: ["Linux / Windows", "Docker / Nginx", "Edge / VPN", "ARM64 / x86-64"]
      }
    };
    const colorsDark = { languages: "#d7b65d", backend: "#64d6c3", infrastructure: "#a89af4" };
    const colorsLight = { languages: "#987018", backend: "#147a73", infrastructure: "#6b59a7" };
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, dpr = 1, time = 0, active = "all", hovered = "", pointer = null;
    let visible = false, frame = 0, paused = reduced;
    let positions = {};

    function setActive(key) {
      active = key in groups ? key : "all";
      controls.forEach((button) => {
        const selected = button.dataset.capability === active;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      const data = groups[active];
      if (title) title.textContent = data ? data.label : "Production engineering";
      if (text) text.textContent = data ? data.description : "The work sits across code, services, infrastructure, and operations. Choose a domain to see the technologies used within it.";
      if (index) index.textContent = data ? data.index : "SYSTEM / 00";
      if (count) count.textContent = data ? data.count : "3 domains";
      if (items) {
        const labels = data ? data.items : ["Languages", "Backend & real-time", "Infrastructure & data"];
        items.innerHTML = labels.map((label) => `<span>${label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`).join("");
      }
      draw();
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width || 640);
      height = Math.max(320, rect.height || 410);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      positions = {
        center: { x: width * 0.5, y: height * 0.51 },
        languages: { x: width * 0.2, y: height * 0.29 },
        backend: { x: width * 0.8, y: height * 0.29 },
        infrastructure: { x: width * 0.5, y: height * 0.82 }
      };
      draw();
    }

    function roundedRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function draw() {
      if (!ctx || !width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const lightTheme = document.documentElement.dataset.theme === "light";
      const colors = lightTheme ? colorsLight : colorsDark;
      // Fine coordinate field.
      ctx.save();
      ctx.strokeStyle = lightTheme ? "rgba(56,67,78,0.065)" : "rgba(201,162,39,0.055)";
      ctx.lineWidth = 1;
      for (let x = 24; x < width; x += 34) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 20; y < height; y += 34) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      ctx.restore();

      const center = positions.center;
      Object.keys(groups).forEach((key) => {
        const p = positions[key], color = colors[key];
        const isActive = active === "all" || active === key;
        const isHot = hovered === key;
        const opacity = isActive ? 1 : 0.2;
        // Connection line from the production core to each discipline.
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = isHot ? 2.2 : 1.15;
        ctx.setLineDash([4, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Moving signal travelling along the connection.
        const travel = (time * 0.12 + (key === "languages" ? 0 : key === "backend" ? 0.34 : 0.67)) % 1;
        const px = center.x + (p.x - center.x) * travel;
        const py = center.y + (p.y - center.y) * travel;
        ctx.beginPath(); ctx.arc(px, py, isHot ? 4 : 2.7, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;

        // Orbit of small satellites around the domain node.
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i / 8) + time * (key === "backend" ? -0.08 : 0.08);
          const radius = 39 + (i % 2) * 5;
          const sx = p.x + Math.cos(a) * radius;
          const sy = p.y + Math.sin(a) * radius;
          ctx.beginPath(); ctx.arc(sx, sy, i % 2 ? 1.6 : 2.1, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.globalAlpha = opacity * (isHot ? 0.95 : 0.55); ctx.fill();
        }
        // Domain node and pulse ring.
        const pulse = 43 + (Math.sin(time * 1.7 + (key === "backend" ? 2 : key === "infrastructure" ? 4 : 0)) + 1) * 2.5;
        ctx.globalAlpha = opacity * (isHot ? 0.42 : 0.17);
        ctx.beginPath(); ctx.arc(p.x, p.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();
        ctx.globalAlpha = opacity;
        ctx.beginPath(); ctx.arc(p.x, p.y, isHot ? 30 : 27, 0, Math.PI * 2);
        ctx.fillStyle = lightTheme ? "rgba(255,255,255,0.98)" : "rgba(12,15,22,0.96)"; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = isHot ? 2.5 : 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.font = "700 9px Orbitron, Inter, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(key === "languages" ? "01" : key === "backend" ? "02" : "03", p.x, p.y - 1);
        ctx.font = "600 11px Inter, sans-serif";
        ctx.fillStyle = lightTheme ? "rgba(34,38,45,0.94)" : "rgba(244,241,234,0.92)";
        ctx.fillText(groups[key].label.toUpperCase(), p.x, p.y + 52);
        ctx.restore();
      });

      // Core node.
      ctx.save();
      ctx.beginPath(); ctx.arc(center.x, center.y, 40 + Math.sin(time * 1.2) * 1.5, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(center.x, center.y, 4, center.x, center.y, 43);
      gradient.addColorStop(0, lightTheme ? "rgba(201,159,61,0.17)" : "rgba(240,215,140,0.22)");
      gradient.addColorStop(1, lightTheme ? "rgba(201,159,61,0.015)" : "rgba(201,162,39,0.025)");
      ctx.fillStyle = gradient; ctx.fill();
      ctx.strokeStyle = lightTheme ? "rgba(145,105,24,0.72)" : "rgba(240,215,140,0.7)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(center.x, center.y, 4, 0, Math.PI * 2); ctx.fillStyle = lightTheme ? "#987018" : "#f0d78c"; ctx.fill();
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "700 10px Orbitron, Inter, sans-serif"; ctx.fillStyle = lightTheme ? "#75540e" : "#f0d78c";
      ctx.fillText("PRODUCTION", center.x, center.y - 12);
      ctx.fillText("SYSTEMS", center.x, center.y + 3);
      ctx.font = "500 8px Inter, sans-serif"; ctx.fillStyle = lightTheme ? "rgba(48,57,67,0.78)" : "rgba(232,230,227,0.58)";
      ctx.fillText("CODE  /  RUNTIME  /  OPS", center.x, center.y + 18);
      ctx.restore();
      if (!paused && visible && !reduced) time += 0.012;
    }

    function animate() {
      if (!visible || paused || reduced || document.hidden) { frame = 0; return; }
      draw();
      frame = requestAnimationFrame(animate);
    }
    function startAnimation() {
      if (!frame && visible && !paused && !reduced && !document.hidden) frame = requestAnimationFrame(animate);
    }
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) startAnimation(); else if (frame) { cancelAnimationFrame(frame); frame = 0; }
        if (!visible) draw();
      }, { threshold: 0.08 });
      observer.observe(canvas);
    } else {
      visible = true;
    }

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      let nearest = "", nearestDistance = 54;
      Object.keys(groups).forEach((key) => {
        const p = positions[key];
        const distance = Math.hypot(pointer.x - p.x, pointer.y - p.y);
        if (distance < nearestDistance) { nearest = key; nearestDistance = distance; }
      });
      hovered = nearest;
      canvas.style.cursor = hovered ? "pointer" : "default";
      draw();
    });
    canvas.addEventListener("pointerleave", () => { hovered = ""; pointer = null; canvas.style.cursor = "default"; draw(); });
    canvas.addEventListener("click", () => { if (hovered) setActive(hovered); });
    document.addEventListener("smartkey:themechange", draw);
    controls.forEach((button) => button.addEventListener("click", () => setActive(button.dataset.capability)));

    const motionButton = document.getElementById("capabilityMotionToggle");
    if (motionButton) {
      motionButton.hidden = reduced;
      motionButton.addEventListener("click", () => {
        paused = !paused;
        motionButton.setAttribute("aria-pressed", String(paused));
        motionButton.textContent = paused ? "Resume motion" : "Pause motion";
        if (paused) { if (frame) cancelAnimationFrame(frame); frame = 0; draw(); }
        else startAnimation();
      });
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
      else startAnimation();
    });
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize, { passive: true });
    resize();
    setActive("all");
    if (reduced) draw();
    else startAnimation();
  }

  /* ---------- INTERACTIVE ARCHITECTURE CONSOLE ---------- */
  function initSystemExplorer() {
    const modeButtons = Array.from(document.querySelectorAll("[data-system-mode]"));
    const flows = Array.from(document.querySelectorAll("[data-lab-flow]"));
    const stageName = document.getElementById("labStageName");
    const stageType = document.getElementById("labStageType");
    const inspectorMode = document.getElementById("labInspectorMode");
    const inspectorIndex = document.getElementById("labInspectorIndex");
    const inspectorTitle = document.getElementById("labInspectorTitle");
    const inspectorCopy = document.getElementById("labInspectorCopy");
    const inspectorTags = document.getElementById("labInspectorTags");
    const inspectorNumber = document.getElementById("labInspectorNumber");
    if (!modeButtons.length || !flows.length) return;

    const modes = {
      ak: { label: "AK STREAMERS / PLATFORM TOPOLOGY", type: "PRODUCTION SYSTEM", inspector: "AK STREAMERS / PLATFORM" },
      triage: { label: "TRIAGEKIT / SECURITY SCANNING PIPELINE", type: "PRIVATE DEVELOPMENT · IN PROGRESS", inspector: "TRIAGEKIT / SECURITY TOOLING" },
      infra: { label: "INFRASTRUCTURE / OPERATIONS TOPOLOGY", type: "MULTI-ARCH ENVIRONMENTS", inspector: "INFRASTRUCTURE / OPERATIONS" }
    };

    function inspect(node, mode) {
      if (!node) return;
      const flow = node.closest("[data-lab-flow]");
      flow?.querySelectorAll(".lab-node").forEach((button) => {
        const active = button === node;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const titleText = node.dataset.labTitle || "System layer";
      const copyText = node.dataset.labCopy || "";
      const tags = (node.dataset.labTags || "").split("|").filter(Boolean);
      if (inspectorIndex) inspectorIndex.textContent = node.dataset.labIndex || "LAYER";
      if (inspectorTitle) inspectorTitle.textContent = titleText;
      if (inspectorCopy) inspectorCopy.textContent = copyText;
      if (inspectorTags) inspectorTags.innerHTML = tags.map((tag) => `<span>${tag.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`).join("");
      if (inspectorNumber) inspectorNumber.textContent = (node.dataset.labIndex || "01").slice(-2);
      if (inspectorMode) inspectorMode.textContent = modes[mode].inspector;
    }

    function setMode(mode) {
      const safeMode = modes[mode] ? mode : "ak";
      modeButtons.forEach((button) => {
        const active = button.dataset.systemMode === safeMode;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      flows.forEach((flow) => {
        const active = flow.dataset.labFlow === safeMode;
        flow.hidden = !active;
        flow.classList.toggle("active", active);
      });
      if (stageName) stageName.textContent = modes[safeMode].label;
      if (stageType) stageType.textContent = modes[safeMode].type;
      const first = document.querySelector(`[data-lab-flow="${safeMode}"] .lab-node`);
      inspect(first, safeMode);
    }

    modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.systemMode)));
    flows.forEach((flow) => flow.querySelectorAll(".lab-node").forEach((node) => {
      node.addEventListener("click", () => inspect(node, flow.dataset.labFlow));
      node.addEventListener("focus", () => inspect(node, flow.dataset.labFlow));
    }));
    setMode("ak");
  }

  /* ---------- PROFILE TILT ---------- */
  function initProfileTilt() {
    const card = document.getElementById("profileCard");
    if (!card || reduced) return;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }
})();
