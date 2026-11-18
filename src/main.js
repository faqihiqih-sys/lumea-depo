import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 1. LENIS SMOOTH SCROLL
const lenis = new Lenis({
  duration: 1.25,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// 2. AUTO-HIDE NAVBAR & MOBILE FULLSCREEN MENU
const header = document.getElementById('site-header');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
let lastScrollY = window.scrollY;

function setMobileMenu(open) {
  if (!mobileMenu || !mobileMenuToggle) return;
  mobileMenu.classList.toggle('is-open', open);
  header.classList.toggle('menu-open', open);
  header.classList.remove('nav-hidden');
  mobileMenuToggle.textContent = open ? 'CLOSE' : 'MENU';
  mobileMenuToggle.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-hidden', String(!open));

  if (open) {
    lenis.stop();
  } else {
    lenis.start();
  }
}

mobileMenuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('is-open');
  setMobileMenu(!isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    setMobileMenu(false);
    if (targetId && targetId.startsWith('#') && targetId.length > 1) {
      e.preventDefault();
      lenis.scrollTo(targetId, { duration: 1.2 });
    }
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 960 && mobileMenu?.classList.contains('is-open')) {
    setMobileMenu(false);
  }
});

window.addEventListener(
  'scroll',
  () => {
    if (mobileMenu?.classList.contains('is-open')) return;
    const currentScrollY = window.scrollY;
    if (currentScrollY <= 60) {
      header.classList.remove('nav-hidden', 'nav-scrolled');
    } else if (currentScrollY > lastScrollY && currentScrollY > 110) {
      header.classList.add('nav-hidden');
    } else if (currentScrollY < lastScrollY) {
      header.classList.remove('nav-hidden');
      header.classList.add('nav-scrolled');
    }
    lastScrollY = currentScrollY;
  },
  { passive: true }
);

// 3. CUSTOM MAGNETIC CURSOR & FLOATING PREVIEW
const cursor = document.getElementById('custom-cursor');
const cursorLabel = document.getElementById('cursor-label');
const floatingPreview = document.getElementById('floating-preview');
const floatingPreviewImg = document.getElementById('floating-preview-img');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.16;
  cursorY += (mouseY - cursorY) * 0.16;
  if (cursor) {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  }
  if (floatingPreview) {
    floatingPreview.style.left = `${cursorX}px`;
    floatingPreview.style.top = `${cursorY}px`;
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('[data-cursor]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    cursorLabel.textContent = el.dataset.cursor;
    cursor.classList.add('active');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('active');
  });
});

// ============================================================================
// 4. SHARED ORBITAL SYSTEM (LUMEA ELECTRIC LIME & STEEL WHITE)
// ============================================================================
const ORBIT_SEGMENTS = [
  { scale: 0.34, start: 0.35, len: 3.9, speed: 0.75, lime: false, alpha: 0.42 },
  { scale: 0.50, start: 2.10, len: 4.3, speed: -0.55, lime: true, alpha: 0.58 },
  { scale: 0.67, start: 4.20, len: 3.7, speed: 0.45, lime: false, alpha: 0.36 },
  { scale: 0.84, start: 1.05, len: 4.5, speed: -0.35, lime: true, alpha: 0.45 },
  { scale: 1.00, start: 3.30, len: 4.1, speed: 0.28, lime: false, alpha: 0.28 },
];

let sharedOrbitAngle = 0;

function drawOrbitalSystem(ctx, w, h, expandFactor, offsetX = 0, offsetY = 0) {
  const cx = w / 2 + offsetX;
  const cy = h * 0.50 + offsetY;
  const maxRx = Math.min(w * 0.44, 650);
  const maxRy = maxRx * 0.31;

  if (expandFactor > 0.05) {
    const glowRadius = maxRx * 0.55 * expandFactor;
    const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
    centerGlow.addColorStop(0, 'rgba(184, 230, 0, 0.11)');
    centerGlow.addColorStop(0.6, 'rgba(184, 230, 0, 0.03)');
    centerGlow.addColorStop(1, 'rgba(11, 14, 17, 0)');
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ORBIT_SEGMENTS.forEach((seg) => {
    const rx = maxRx * seg.scale * expandFactor;
    const ry = maxRy * seg.scale * expandFactor;
    if (rx <= 1) return;

    const rotOffset = sharedOrbitAngle * seg.speed;
    const arcStart = seg.start + rotOffset;
    const arcEnd = arcStart + seg.len;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.20);

    ctx.strokeStyle = seg.lime
      ? `rgba(184, 230, 0, ${seg.alpha})`
      : `rgba(244, 246, 248, ${seg.alpha})`;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, arcStart, arcEnd);
    ctx.stroke();

    const tipAngle = seg.speed >= 0 ? arcEnd : arcStart;
    const tx = Math.cos(tipAngle) * rx;
    const ty = Math.sin(tipAngle) * ry;
    const tipGlow = ctx.createRadialGradient(tx, ty, 0, tx, ty, 7);
    tipGlow.addColorStop(0, seg.lime ? 'rgba(184, 230, 0, 1)' : 'rgba(255, 255, 255, 0.95)');
    tipGlow.addColorStop(1, 'rgba(184, 230, 0, 0)');
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });
}

// 5. PRELOADER (DROP -> EXPANDING ORBITAL FRAGMENTS -> FADE DISSOLVE TO HERO)
const preloader = document.getElementById('preloader');
const preloaderCounter = document.getElementById('preloader-counter');
const preCanvas = document.getElementById('preloader-canvas');
const preCtx = preCanvas.getContext('2d');

function resizePreCanvas() {
  if (!preCanvas) return;
  preCanvas.width = window.innerWidth;
  preCanvas.height = window.innerHeight;
}
resizePreCanvas();
window.addEventListener('resize', resizePreCanvas);

let preProgress = 0;
let preActive = true;
let preAnimId;

function renderPreloaderCanvas() {
  if (!preActive || !preCanvas) return;
  const w = preCanvas.width;
  const h = preCanvas.height;
  const cx = w / 2;
  const cy = h * 0.50;

  preCtx.clearRect(0, 0, w, h);

  if (preProgress < 0.38) {
    // Phase 1: Vertical luminous droplet falling to center
    const t = preProgress / 0.38;
    const easeT = t * t;
    const dropY = cy * easeT;

    const grad = preCtx.createLinearGradient(cx, Math.max(0, dropY - 220), cx, dropY);
    grad.addColorStop(0, 'rgba(244, 246, 248, 0)');
    grad.addColorStop(1, 'rgba(244, 246, 248, 0.85)');
    preCtx.strokeStyle = grad;
    preCtx.lineWidth = 1.3;
    preCtx.beginPath();
    preCtx.moveTo(cx, Math.max(0, dropY - 220));
    preCtx.lineTo(cx, dropY);
    preCtx.stroke();

    const glow = preCtx.createRadialGradient(cx, dropY, 0, cx, dropY, 16);
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glow.addColorStop(0.45, 'rgba(184, 230, 0, 0.5)');
    glow.addColorStop(1, 'rgba(184, 230, 0, 0)');
    preCtx.fillStyle = glow;
    preCtx.beginPath();
    preCtx.arc(cx, dropY, 16, 0, Math.PI * 2);
    preCtx.fill();
  } else {
    // Phase 2: Expand to exact Hero orbital dimensions (expandFactor -> 1.0)
    const raw = (preProgress - 0.38) / 0.62;
    const expandFactor = 1 - Math.pow(1 - raw, 3);
    drawOrbitalSystem(preCtx, w, h, expandFactor, 0, 0);
  }

  preAnimId = requestAnimationFrame(renderPreloaderCanvas);
}
renderPreloaderCanvas();

// Hide hero text initially so it fades in smoothly as preloader dissolves
gsap.set('.hero-anim', { y: 24, opacity: 0 });

const counterObj = { val: 0 };
gsap.to(counterObj, {
  val: 100,
  duration: 2.2,
  ease: 'power2.inOut',
  onUpdate: () => {
    preProgress = counterObj.val / 100;
    preloaderCounter.textContent = String(Math.floor(counterObj.val)).padStart(3, '0');
  },
  onComplete: () => {
    // Fade out preloader in place so the exact same orbital lines stay behind Hero text
    gsap.to(preloader, {
      opacity: 0,
      duration: 1.15,
      ease: 'power2.inOut',
      onComplete: () => {
        preActive = false;
        cancelAnimationFrame(preAnimId);
        preloader.remove();
      },
    });

    gsap.to('.hero-anim', {
      y: 0,
      opacity: 1,
      duration: 1.15,
      stagger: 0.14,
      delay: 0.15,
      ease: 'power3.out',
    });
  },
});

// 6. HERO CANVAS (SEAMLESS CONTINUATION OF ORBITAL LINES + BOKEH PARTICLES)
const heroCanvas = document.getElementById('hero-canvas');
const hCtx = heroCanvas.getContext('2d');

function resizeHeroCanvas() {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeHeroCanvas);
resizeHeroCanvas();

const bokehMotes = Array.from({ length: 34 }, () => {
  const isBokeh = Math.random() > 0.68;
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -Math.random() * 0.32 - 0.08,
    radius: isBokeh ? Math.random() * 14 + 7 : Math.random() * 2.1 + 0.9,
    isBokeh,
    isLime: Math.random() > 0.52,
    alpha: isBokeh ? Math.random() * 0.2 + 0.07 : Math.random() * 0.5 + 0.18,
  };
});

function drawHeroCanvas() {
  const w = heroCanvas.width;
  const h = heroCanvas.height;

  // Advance shared orbital rotation continuously
  sharedOrbitAngle += 0.003;

  // Subtle mouse parallax only after preloader finishes so handoff aligns 1:1
  const parallaxFactor = preActive ? 0 : 0.015;
  const parallaxX = (cursorX - w / 2) * parallaxFactor;
  const parallaxY = (cursorY - h / 2) * parallaxFactor;

  hCtx.clearRect(0, 0, w, h);

  // Draw the exact same 5 orbital line fragments behind Hero text
  drawOrbitalSystem(hCtx, w, h, 1, parallaxX, parallaxY);

  // Soft floating bokeh & mist particles
  bokehMotes.forEach((m) => {
    m.x += m.vx;
    m.y += m.vy;
    if (m.y < -20) m.y = h + 20;
    if (m.x < -20) m.x = w + 20;
    if (m.x > w + 20) m.x = -20;

    if (m.isBokeh) {
      const grad = hCtx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
      if (m.isLime) {
        grad.addColorStop(0, `rgba(184, 230, 0, ${m.alpha})`);
        grad.addColorStop(1, 'rgba(184, 230, 0, 0)');
      } else {
        grad.addColorStop(0, `rgba(244, 246, 248, ${m.alpha})`);
        grad.addColorStop(1, 'rgba(244, 246, 248, 0)');
      }
      hCtx.fillStyle = grad;
      hCtx.beginPath();
      hCtx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      hCtx.fill();
    } else {
      hCtx.fillStyle = m.isLime
        ? `rgba(184, 230, 0, ${m.alpha})`
        : `rgba(244, 246, 248, ${m.alpha})`;
      hCtx.beginPath();
      hCtx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      hCtx.fill();
    }
  });

  requestAnimationFrame(drawHeroCanvas);
}
drawHeroCanvas();

// Hero Dual-Layer Scroll Blur & Parallax
gsap.to('#hero-img-blur', {
  opacity: 1,
  scrollTrigger: {
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

gsap.to('#hero-content', {
  y: -90,
  opacity: 0.2,
  scrollTrigger: {
    trigger: '#hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

// 7. MANIFESTO WORD-BY-WORD SCROLL REVEAL
const manifestoEl = document.getElementById('manifesto-text');
if (manifestoEl) {
  manifestoEl.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (part.trim()) {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.replaceWith(frag);
    }
  });

  const words = manifestoEl.querySelectorAll('.word');
  ScrollTrigger.create({
    trigger: '#manifesto',
    start: 'top 75%',
    end: 'bottom 55%',
    scrub: true,
    onUpdate: (self) => {
      const litCount = Math.floor(self.progress * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i <= litCount));
    },
  });
}

// 8. PINNED HORIZONTAL GALLERY (SECTION 03)
const pinnedSection = document.getElementById('services');
const pinnedTrack = document.getElementById('pinned-track');
const pinnedCounter = document.getElementById('pinned-counter');
const pinnedLineFill = document.getElementById('pinned-line-fill');

if (pinnedSection && pinnedTrack) {
  // Hanya aktifkan pin dan auto-scroll horizontal jika lebar layar di atas 960px (Desktop)
  if (window.innerWidth > 960) {
    const getScrollAmount = () => -(pinnedTrack.scrollWidth - window.innerWidth * 0.62);

    gsap.to(pinnedTrack, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: pinnedSection,
        start: 'top top',
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(5, Math.floor(self.progress * 5) + 1);
          if (pinnedCounter) pinnedCounter.textContent = `0${idx} / 05`;
          if (pinnedLineFill) pinnedLineFill.style.width = `${Math.max(20, self.progress * 100)}%`;
        },
      },
    });
  }
}
// 9. STICKY ORBITAL ANATOMY (SECTION 04)
const orbitalStages = [
  {
    num: '01',
    title: 'Gate-In & Survey',
    sub: 'TAHAP INSPEKSI AWAL',
    desc: 'Setiap unit yang tiba diperiksa kondisinya secara menyeluruh oleh surveyor bersertifikat dan dicatat ke dalam laporan EIR digital.',
    nodes: ['EIR Digital', 'Cek Fisik', 'Estimasi Biaya'],
  },
  {
    num: '02',
    title: 'Wash & IICL Repair',
    sub: 'TAHAP SANITASI & RESTORASI',
    desc: 'Pencucian tekanan tinggi dan perbaikan struktur baja corten dilakukan sesuai standar kelayakan pelayaran internasional.',
    nodes: ['High-Pressure', 'Corten Welding', 'Light Test'],
  },
  {
    num: '03',
    title: 'Ready Stack & Release',
    sub: 'TAHAP PENYIMPANAN & DISPATCH',
    desc: 'Penempatan di blok siap muat untuk mempercepat proses pengambilan unit oleh armada truk trailer tanpa antrean.',
    nodes: ['Available Block', 'Fast Dispatch', 'Zero Delay'],
  },
];

const orbitalBgs = document.querySelectorAll('.orbital-bg');
const orbitalTabs = document.querySelectorAll('#orbital-tabs li');
const orbitDot = document.getElementById('orbit-dot');
let currentOrbitalStep = -1;

function setOrbitalStep(step) {
  if (step === currentOrbitalStep) return;
  currentOrbitalStep = step;
  const data = orbitalStages[step];

  orbitalBgs.forEach((bg, i) => bg.classList.toggle('active', i === step));
  orbitalTabs.forEach((tab, i) => tab.classList.toggle('active', i === step));

  document.getElementById('orbital-num').textContent = data.num;
  document.getElementById('orbital-title').textContent = data.title;
  document.getElementById('orbital-sub').textContent = data.sub;
  document.getElementById('orbital-desc').textContent = data.desc;
  document.getElementById('node-tag-1').textContent = data.nodes[0];
  document.getElementById('node-tag-2').textContent = data.nodes[1];
  document.getElementById('node-tag-3').textContent = data.nodes[2];
}

ScrollTrigger.create({
  trigger: '#anatomy',
  start: 'top top',
  end: 'bottom bottom',
  scrub: true,
  onUpdate: (self) => {
    const step = Math.min(2, Math.floor(self.progress * 3));
    setOrbitalStep(step);
    if (orbitDot) {
      orbitDot.parentElement.style.transform = `translate(-50%, -50%) rotate(${self.progress * 360}deg)`;
    }
  },
});

// 10. HOVER FLOATING PREVIEW IN CATEGORIES LIST (SECTION 05)
document.querySelectorAll('.category-row').forEach((row) => {
  row.addEventListener('mouseenter', () => {
    if (row.dataset.img) floatingPreviewImg.src = row.dataset.img;
    floatingPreview.classList.add('visible');
    cursor.style.opacity = '0';
  });
  row.addEventListener('mouseleave', () => {
    floatingPreview.classList.remove('visible');
    cursor.style.opacity = '1';
  });
});

// 11. EXPANDING PILL MASK + COUNT-UP METRICS (SECTION 06)
const isMobileView = window.innerWidth <= 960;
const expandTl = gsap.timeline({
  scrollTrigger: {
    trigger: '#expand-stage',
    start: 'top top',
    end: '+=130%',
    pin: true,
    scrub: 0.7,
    invalidateOnRefresh: true,
  },
});

expandTl
  .to('#expand-frame', { width: '100vw', height: '100vh', borderRadius: '0px', ease: 'none' }, 0)
  .to('#side-left', { x: isMobileView ? -150 : -260, opacity: 0, ease: 'none' }, 0)
  .to('#side-right', { x: isMobileView ? 150 : 260, opacity: 0, ease: 'none' }, 0)
  .to('#expand-tint', { opacity: 1, ease: 'none' }, 0.3)
  .to('#expand-copy', { opacity: 1, y: -10, ease: 'none' }, 0.45);

// Count-up metrics
let metricsCounted = false;
ScrollTrigger.create({
  trigger: '#metrics-grid',
  start: 'top 80%',
  onEnter: () => {
    if (metricsCounted) return;
    metricsCounted = true;
    document.querySelectorAll('.count-num').forEach((el) => {
      const target = Number(el.dataset.target);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString('id-ID');
        },
      });
    });
  },
});

// 12. INTERACTIVE FINDER + DYNAMIC SLANTED RAIN CANVAS (SECTION 07)
const finderCanvas = document.getElementById('finder-canvas');
const fCtx = finderCanvas.getContext('2d');

function resizeFinderCanvas() {
  finderCanvas.width = finderCanvas.offsetWidth;
  finderCanvas.height = finderCanvas.offsetHeight;
}
window.addEventListener('resize', resizeFinderCanvas);
resizeFinderCanvas();

let weatherState = { speedMult: 1, slant: -3.2, opacity: 0.16 };

const rainDrops = Array.from({ length: 75 }, () => ({
  x: Math.random() * finderCanvas.width,
  y: Math.random() * finderCanvas.height,
  len: Math.random() * 24 + 12,
  speed: Math.random() * 3.8 + 2.4,
}));

function drawFinderRain() {
  fCtx.clearRect(0, 0, finderCanvas.width, finderCanvas.height);
  fCtx.strokeStyle = `rgba(244, 246, 248, ${weatherState.opacity})`;
  fCtx.lineWidth = 1;

  rainDrops.forEach((d) => {
    fCtx.beginPath();
    fCtx.moveTo(d.x, d.y);
    fCtx.lineTo(d.x + weatherState.slant, d.y + d.len);
    fCtx.stroke();

    d.y += d.speed * weatherState.speedMult;
    d.x += weatherState.slant * 0.18 * weatherState.speedMult;
    if (d.y > finderCanvas.height) {
      d.y = -d.len;
      d.x = Math.random() * (finderCanvas.width + 100);
    }
  });
  requestAnimationFrame(drawFinderRain);
}
drawFinderRain();

const serviceRecommendations = [
  {
    match: 'REKOMENDASI · LAYANAN 01',
    title: 'Empty Container Storage',
    desc: 'Penataan peti kemas kosong di blok terkomputerisasi dengan pemantauan inventaris real-time serta layanan lift-on/lift-off cepat.',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    weather: { speedMult: 0.9, slant: -2.8, opacity: 0.14 },
  },
  {
    match: 'REKOMENDASI · LAYANAN 02',
    title: 'Container Washing & Sanitation',
    desc: 'Pencucian tekanan tinggi dan uap panas menggunakan chemical ramah lingkungan untuk menghilangkan residu kargo serta bau.',
    img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80',
    weather: { speedMult: 1.7, slant: -5.2, opacity: 0.24 },
  },
  {
    match: 'REKOMENDASI · LAYANAN 03',
    title: 'IICL-6 Structural Repair',
    desc: 'Pengelasan panel baja corten, pelurusan dinding penyok, penggantian karet pintu, hingga perbaikan lantai plywood bersertifikat.',
    img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=900&q=80',
    weather: { speedMult: 1.2, slant: -3.5, opacity: 0.18 },
  },
  {
    match: 'REKOMENDASI · LAYANAN 04',
    title: 'Reefer Pre-Trip Inspection',
    desc: 'Kalibrasi suhu, pengecekan kompresor, dan suplai listrik yard 24/7 untuk memastikan unit berpendingin siap muat.',
    img: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80',
    weather: { speedMult: 0.65, slant: -1.5, opacity: 0.15 },
  },
];

document.querySelectorAll('.finder-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.finder-option').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const item = serviceRecommendations[Number(btn.dataset.idx)];
    gsap.to(weatherState, {
      speedMult: item.weather.speedMult,
      slant: item.weather.slant,
      opacity: item.weather.opacity,
      duration: 0.6,
    });

    gsap.to('#finder-card', {
      opacity: 0,
      y: 8,
      duration: 0.2,
      onComplete: () => {
        document.getElementById('finder-img').src = item.img;
        document.getElementById('finder-match').textContent = item.match;
        document.getElementById('finder-title').textContent = item.title;
        document.getElementById('finder-desc').textContent = item.desc;
        gsap.to('#finder-card', { opacity: 1, y: 0, duration: 0.35 });
      },
    });
  });
});

// 13. FOOTER FORM & BACK TO TOP
document.getElementById('email-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('form-feedback').textContent = 'Terima kasih. Tim operasional LUMEA akan segera menghubungi Anda.';
  e.target.reset();
});

document.getElementById('back-to-top')?.addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.5 });
});

// 14. STAGGERED JOURNAL REVEAL (SECTION 08 / 07)
gsap.utils.toArray('.journal-card').forEach((card, i) => {
  gsap.from(card, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
});