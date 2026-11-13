(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- LOADER ---------- */
  const loader = document.getElementById("loader");
  const progressEl = document.getElementById("loaderProgress");
  const statusEl = document.getElementById("loaderStatus");
  const statuses = ["Booting interface", "Loading identity", "Mounting metrics", "Calibrating charts", "Systems online"];
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
    initGsap();
    initCounters();
    initCharts();
    initBars();
    initLogos();
    initParticles();
    initHeroCanvas();
    initConstellation();
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
    let x = 0, y = 0, gx = 0, gy = 0;
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      c.style.left = x + "px";
      c.style.top = y + "px";
    });
    (function follow() {
      gx += (x - gx) * 0.15;
      gy += (y - gy) * 0.15;
      g.style.left = gx + "px";
      g.style.top = gy + "px";
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll("a, button, .btn, .magnetic, .glass-card, .project-card").forEach((el) => {
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
  }

  /* ---------- GSAP ---------- */
  function initGsap() {
    if (typeof gsap === "undefined") return;
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

  /* ---------- CHARTS ---------- */
  function initCharts() {
    if (typeof Chart === "undefined") return;
    const gold = "#c9a227";
    const goldLight = "#f0d78c";
    const muted = "rgba(139,147,167,0.55)";
    const grid = "rgba(201,162,39,0.08)";

    const radar = document.getElementById("radarChart");
    if (radar) {
      new Chart(radar, {
        type: "radar",
        data: {
          labels: ["Backend", "Systems", "Infra", "Security", "Extensions", "Real-time", "Data"],
          datasets: [{
            data: [93, 89, 91, 86, 88, 90, 84],
            fill: true,
            backgroundColor: "rgba(201,162,39,0.14)",
            borderColor: gold,
            pointBackgroundColor: goldLight,
            pointBorderColor: gold,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          scales: {
            r: {
              beginAtZero: true, max: 100,
              ticks: { display: false },
              grid: { color: grid },
              angleLines: { color: grid },
              pointLabels: { color: muted, font: { size: 11, family: "Inter" } }
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    const traffic = document.getElementById("trafficChart");
    if (traffic) {
      new Chart(traffic, {
        type: "line",
        data: {
          labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"],
          datasets: [{
            data: [72, 78, 81, 85, 88, 91, 89, 92, 94, 90, 90.1],
            borderColor: gold,
            backgroundColor: "rgba(201,162,39,0.12)",
            fill: true, tension: 0.35,
            pointRadius: 3, pointBackgroundColor: goldLight, borderWidth: 2
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(12,14,20,0.95)",
              titleColor: goldLight, bodyColor: "#e8e6e3",
              borderColor: "rgba(201,162,39,0.3)", borderWidth: 1
            }
          },
          scales: {
            x: { grid: { color: grid }, ticks: { color: muted, font: { size: 10 } } },
            y: { grid: { color: grid }, ticks: { color: muted, font: { size: 10 } } }
          }
        }
      });
    }

    const mix = document.getElementById("mixChart");
    if (mix) {
      new Chart(mix, {
        type: "doughnut",
        data: {
          labels: ["Extension", "API / RT", "Infra", "Data", "Ops"],
          datasets: [{
            data: [28, 26, 20, 14, 12],
            backgroundColor: [
              "rgba(201,162,39,0.9)",
              "rgba(240,215,140,0.75)",
              "rgba(201,162,39,0.5)",
              "rgba(240,215,140,0.35)",
              "rgba(139,147,167,0.35)"
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: muted, boxWidth: 10, font: { size: 10, family: "Inter" } }
            }
          },
          cutout: "62%"
        }
      });
    }

    const stack = document.getElementById("stackChart");
    if (stack) {
      new Chart(stack, {
        type: "bar",
        data: {
          labels: ["Lang", "Backend", "Client", "Infra", "Security", "Data"],
          datasets: [{
            data: [90, 93, 87, 91, 86, 84],
            backgroundColor: "rgba(201,162,39,0.65)",
            borderRadius: 6,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          indexAxis: "y",
          plugins: { legend: { display: false } },
          scales: {
            x: { max: 100, grid: { color: grid }, ticks: { color: muted, font: { size: 10 } } },
            y: { grid: { display: false }, ticks: { color: muted, font: { size: 11, family: "Inter" } } }
          }
        }
      });
    }
  }

  function initBars() {
    const skills = [
      { name: "Backend & APIs", value: 93 },
      { name: "Infrastructure & Linux", value: 91 },
      { name: "Real-time systems", value: 90 },
      { name: "Browser extensions (MV3)", value: 88 },
      { name: "Security & hardening", value: 86 },
      { name: "Systems programming", value: 83 }
    ];
    const root = document.getElementById("skillBars");
    if (!root) return;
    root.innerHTML = skills.map((s) => `
      <div class="skill-bar-item">
        <div class="skill-bar-head"><span>${s.name}</span><span>${s.value}%</span></div>
        <div class="skill-bar-track"><div class="skill-bar-fill" data-w="${s.value}"></div></div>
      </div>`).join("");
    const fills = root.querySelectorAll(".skill-bar-fill");
    const animate = () => fills.forEach((f) => { f.style.width = f.dataset.w + "%"; });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          animate();
          io.disconnect();
        }
      }, { threshold: 0.2 });
      io.observe(root);
    } else animate();
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
    let w, h, pts;
    const N = 50;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function seed() {
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.3 + 0.3, a: Math.random() * 0.35 + 0.08
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${p.a})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 115) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(201,162,39,${0.045 * (1 - d / 115)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    resize(); seed(); draw();
    window.addEventListener("resize", () => { resize(); seed(); });
  }

  /* ---------- HERO CANVAS (geometric field) ---------- */
  function initHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    let w, h, t = 0;
    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width;
      h = canvas.height = r.height;
    }
    function draw() {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.72, cy = h * 0.42;
      for (let i = 0; i < 5; i++) {
        const rad = 60 + i * 38 + Math.sin(t + i) * 6;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,162,39,${0.06 - i * 0.008})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const a = t * 0.4 + (i / 12) * Math.PI * 2;
        const rr = 90 + (i % 3) * 28;
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(240,215,140,0.35)";
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener("resize", resize);
  }

  /* ---------- CONSTELLATION CANVAS ---------- */
  function initConstellation() {
    const canvas = document.getElementById("constellation");
    if (!canvas) return;
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
            ctx.strokeStyle = `rgba(201,162,39,${0.12 * (1 - dist / (160 * scaleX))})`;
            ctx.stroke();
          }
        }
      }

      // center
      ctx.beginPath();
      ctx.arc(200 * scaleX, 140, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,215,140,0.9)";
      ctx.fill();

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#c9a227";
        ctx.fill();
        ctx.font = "11px Inter, sans-serif";
        ctx.fillStyle = "rgba(232,230,227,0.75)";
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y - 12);
      });

      requestAnimationFrame(draw);
    }
    draw();
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
