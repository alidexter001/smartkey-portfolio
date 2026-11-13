/* ============================================================
   ALI ALAOUI — Portfolio Interactions
   ============================================================ */

(function () {
  "use strict";

  // ---------- LOADER ----------
  const loader = document.getElementById("loader");
  const progressEl = document.getElementById("loaderProgress");
  const statusEl = document.getElementById("loaderStatus");
  const statuses = [
    "Initializing systems…",
    "Loading profile…",
    "Calibrating metrics…",
    "Preparing charts…",
    "Almost ready…"
  ];
  let progress = 0;
  let statusIdx = 0;

  const loaderInterval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;
    progressEl.style.width = progress + "%";
    if (progress > statusIdx * 22 && statusIdx < statuses.length - 1) {
      statusIdx++;
      statusEl.textContent = statuses[statusIdx];
    }
    if (progress >= 100) {
      clearInterval(loaderInterval);
      statusEl.textContent = "Systems online";
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "";
        initAfterLoad();
      }, 400);
    }
  }, 160);
  document.body.style.overflow = "hidden";

  // ---------- AFTER LOAD ----------
  function initAfterLoad() {
    initNav();
    initReveal();
    initCounters();
    initCharts();
    initLogos();
    initParticles();
    initProfileTilt();
    document.getElementById("year").textContent = new Date().getFullYear();
  }

  // ---------- NAV SCROLL ----------
  function initNav() {
    const nav = document.getElementById("nav");
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- REVEAL ON SCROLL ----------
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  // ---------- ANIMATED COUNTERS ----------
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) {
      counters.forEach((el) => {
        el.textContent = el.dataset.count;
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.count);
          const duration = 1600;
          const start = performance.now();
          const isInt = Number.isInteger(target);
          function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = target * eased;
            el.textContent = isInt ? Math.round(val) : val.toFixed(1);
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => io.observe(el));
  }

  // ---------- CHARTS ----------
  function initCharts() {
    const gold = "#c9a227";
    const goldLight = "#f0d78c";
    const muted = "rgba(139,147,167,0.5)";
    const grid = "rgba(201,162,39,0.08)";

    // Radar — core competencies (from CV + role)
    const radarCtx = document.getElementById("radarChart");
    if (radarCtx && typeof Chart !== "undefined") {
      new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: [
            "Backend",
            "Systems",
            "Infrastructure",
            "Security",
            "Extensions",
            "Real-time",
            "Databases"
          ],
          datasets: [
            {
              label: "Proficiency",
              data: [92, 88, 90, 85, 87, 89, 82],
              fill: true,
              backgroundColor: "rgba(201,162,39,0.15)",
              borderColor: gold,
              pointBackgroundColor: goldLight,
              pointBorderColor: gold,
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: gold,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: { display: false, stepSize: 20 },
              grid: { color: grid },
              angleLines: { color: grid },
              pointLabels: {
                color: muted,
                font: { size: 11, family: "Inter" }
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }

    // Skill bars
    const skills = [
      { name: "Backend & APIs", value: 93 },
      { name: "Infrastructure & Linux", value: 90 },
      { name: "Security & Hardening", value: 86 },
      { name: "Browser Extensions (MV3)", value: 88 },
      { name: "Real-time Systems", value: 89 },
      { name: "Systems Programming", value: 82 }
    ];
    const barsEl = document.getElementById("skillBars");
    if (barsEl) {
      barsEl.innerHTML = skills
        .map(
          (s) => `
        <div class="skill-bar-item">
          <div class="skill-bar-head">
            <span>${s.name}</span>
            <span>${s.value}%</span>
          </div>
          <div class="skill-bar-track">
            <div class="skill-bar-fill" data-width="${s.value}"></div>
          </div>
        </div>`
        )
        .join("");

      const fills = barsEl.querySelectorAll(".skill-bar-fill");
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                const fill = e.target;
                fill.style.width = fill.dataset.width + "%";
                io.unobserve(fill);
              }
            });
          },
          { threshold: 0.3 }
        );
        fills.forEach((f) => io.observe(f));
      } else {
        fills.forEach((f) => (f.style.width = f.dataset.width + "%"));
      }
    }

    // Traffic-style chart for AK Streamers (illustrative monthly trend)
    const trafficCtx = document.getElementById("trafficChart");
    if (trafficCtx && typeof Chart !== "undefined") {
      new Chart(trafficCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
          datasets: [
            {
              label: "Requests (M)",
              data: [72, 78, 81, 85, 88, 91, 89, 92, 94, 90, 90.1],
              borderColor: gold,
              backgroundColor: "rgba(201,162,39,0.12)",
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointBackgroundColor: goldLight,
              pointBorderColor: gold,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "rgba(12,14,20,0.95)",
              titleColor: goldLight,
              bodyColor: "#e8e6e3",
              borderColor: "rgba(201,162,39,0.3)",
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: { color: grid },
              ticks: { color: muted, font: { size: 10 } }
            },
            y: {
              grid: { color: grid },
              ticks: { color: muted, font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  // ---------- SITE LOGOS (favicon / clearbit style) ----------
  function initLogos() {
    const logoMap = {
      "github.com": "https://github.githubassets.com/favicons/favicon.svg",
      "akstreamers.net": "https://www.google.com/s2/favicons?domain=akstreamers.net&sz=64"
    };
    document.querySelectorAll(".site-logo").forEach((img) => {
      const domain =
        img.dataset.domain ||
        img.closest("[data-domain]")?.dataset.domain ||
        "";
      const src = logoMap[domain];
      if (src) {
        img.src = src;
        img.onerror = () => {
          img.style.display = "none";
        };
      } else if (domain) {
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        img.onerror = () => {
          img.style.display = "none";
        };
      }
    });
  }

  // ---------- PARTICLES CANVAS ----------
  function initParticles() {
    const canvas = document.getElementById("particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const count = 48;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    function create() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.35 + 0.08
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,162,39,${p.a})`;
        ctx.fill();
      }
      // subtle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(201,162,39,${0.04 * (1 - d / 110)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    resize();
    create();
    draw();
    window.addEventListener("resize", () => {
      resize();
      create();
    });
  }

  // ---------- PROFILE CARD TILT (lightweight 3D) ----------
  function initProfileTilt() {
    const card = document.querySelector(".profile-card");
    if (!card) return;
    const max = 8;
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateY(${x * max * 2}deg) rotateX(${-y * max}deg) translateZ(6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }
})();
