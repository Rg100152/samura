/* ============================================================
   SAMURA — interactions & 3D hero
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ------------------------------------------------------------
   Preloader
------------------------------------------------------------ */
const preloader = $("#preloader");
const loadFill = $("#loadFill");
const loadNum = $("#loadNum");
const LOADER_DURATION = 800;
const startTime = performance.now();
let preloaderDone = false;

function hidePreloader() {
  if (preloaderDone) return;
  preloaderDone = true;
  clearInterval(progressTimer);
  document.body.classList.remove("loading");
  document.body.classList.add("loaded");
  preloader?.classList.add("is-done");
  setTimeout(() => preloader?.setAttribute("aria-hidden", "true"), 700);
}

/*
 * The loader runs on a fixed clock — it never waits for textures or the
 * 3D engine. Those stream in behind the hero while it fades away.
 */
function updateLoader() {
  const t = Math.min(1, (performance.now() - startTime) / LOADER_DURATION);
  const shown = Math.round((1 - Math.pow(1 - t, 3)) * 100);
  if (loadFill) loadFill.style.width = `${shown}%`;
  if (loadNum) loadNum.textContent = String(shown).padStart(2, "0");
  if (t >= 1) hidePreloader();
}

const progressTimer = setInterval(updateLoader, 30);
updateLoader();
setTimeout(hidePreloader, 2200);

/* ------------------------------------------------------------
   Navigation
------------------------------------------------------------ */
const nav = $("#nav");
const burger = $("#burger");
const navLinks = $("#navLinks");

function onScrollNav() {
  nav?.classList.toggle("is-scrolled", window.scrollY > 40);
}
onScrollNav();
window.addEventListener("scroll", onScrollNav, { passive: true });

burger?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
});

$$("a", navLinks).forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav?.classList.contains("is-open")) {
    nav.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});

/* ------------------------------------------------------------
   Custom cursor
------------------------------------------------------------ */
const cursor = $("#cursor");
const cursorDot = $(".cursor__dot");
const cursorRing = $(".cursor__ring");
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;

if (finePointer && cursor && cursorDot && cursorRing) {
  window.addEventListener("pointermove", (e) => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    cursorDot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
  });

  const animateCursor = () => {
    ringX += (pointerX - ringX) * 0.16;
    ringY += (pointerY - ringY) * 0.16;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  document.addEventListener("mouseover", (e) => {
    const hit = e.target.closest("a, button, .card, [data-cursor]");
    cursor.classList.toggle("is-hover", Boolean(hit));
  });
  document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
  document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
  document.addEventListener("mouseleave", () => {
    cursorDot.style.opacity = "0";
    cursorRing.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "1";
  });
} else if (cursor) {
  cursor.style.display = "none";
}

/* ------------------------------------------------------------
   Scroll reveals
------------------------------------------------------------ */
const revealEls = $$("[data-reveal]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = Number(el.dataset.delay || 0);
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add("is-in");
        io.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

/* ------------------------------------------------------------
   Gallery 3D tilt
------------------------------------------------------------ */
const cards = $$(".card");
if (finePointer && !reduceMotion) {
  cards.forEach((card) => {
    const inner = $(".card__inner", card);
    if (!inner) return;
    let queued = false;
    let lastEvent = null;

    card.addEventListener("pointermove", (e) => {
      lastEvent = e;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (!lastEvent) return;
        const rect = card.getBoundingClientRect();
        const x = (lastEvent.clientX - rect.left) / rect.width - 0.5;
        const y = (lastEvent.clientY - rect.top) / rect.height - 0.5;
        inner.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
        inner.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
      });
    });

    card.addEventListener("pointerleave", () => {
      lastEvent = null;
      inner.style.setProperty("--rx", "0deg");
      inner.style.setProperty("--ry", "0deg");
    });
  });
}

/* ------------------------------------------------------------
   Lightbox
------------------------------------------------------------ */
const lightbox = $("#lightbox");
const lightboxImg = $("#lightboxImg");
const lightboxCaption = $("#lightboxCaption");
const lightboxClose = $("#lightboxClose");
const lightboxPrev = $("#lightboxPrev");
const lightboxNext = $("#lightboxNext");
let activeCard = 0;
let lightboxOpen = false;
let lightboxToken = 0;

function showCard(index) {
  if (!cards.length) return;
  activeCard = (index + cards.length) % cards.length;
  const card = cards[activeCard];
  const fullSrc = card.dataset.src;
  const previewSrc = $("img", card)?.src;
  const title = card.dataset.title || "";
  const no = $(".card__no", card)?.textContent || "";
  const token = ++lightboxToken;

  if (lightboxImg) {
    lightboxImg.alt = `SAMURA portrait ${no} — ${title}`;
    /* Show the small image instantly, upgrade to the original when ready. */
    if (previewSrc) lightboxImg.src = previewSrc;
    if (fullSrc && fullSrc !== previewSrc) {
      const preload = new Image();
      preload.onload = () => {
        if (token === lightboxToken && lightboxOpen) lightboxImg.src = fullSrc;
      };
      preload.src = fullSrc;
    }
  }
  if (lightboxCaption) lightboxCaption.textContent = `${no} — ${title}`;
}

function openLightbox(index) {
  if (!lightbox) return;
  showCard(index);
  lightboxOpen = true;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightboxOpen = false;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

cards.forEach((card, i) => {
  card.addEventListener("click", () => openLightbox(i));
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `View portrait ${card.dataset.title || ""}`);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openLightbox(i);
    }
  });
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => showCard(activeCard - 1));
lightboxNext?.addEventListener("click", () => showCard(activeCard + 1));
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* Swipe between portraits on touch screens. */
let swipeStartX = 0;
lightbox?.addEventListener(
  "touchstart",
  (e) => {
    swipeStartX = e.changedTouches[0].clientX;
  },
  { passive: true }
);
lightbox?.addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(dx) < 50) return;
    showCard(dx > 0 ? activeCard - 1 : activeCard + 1);
  },
  { passive: true }
);

document.addEventListener("keydown", (e) => {
  if (!lightboxOpen) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showCard(activeCard - 1);
  if (e.key === "ArrowRight") showCard(activeCard + 1);
});

/* ------------------------------------------------------------
   Feature parallax + footer year
------------------------------------------------------------ */
const feature = $(".feature");
const featureBg = $(".feature__bg");
let featureTick = false;

function updateFeature() {
  featureTick = false;
  if (!feature || !featureBg) return;
  const rect = feature.getBoundingClientRect();
  if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
  const centerOffset =
    (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
  featureBg.style.transform = `translate3d(0, ${(centerOffset * 12).toFixed(2)}%, 0) scale(1.06)`;
}

if (feature && featureBg) {
  updateFeature();
  window.addEventListener(
    "scroll",
    () => {
      if (!featureTick) {
        featureTick = true;
        requestAnimationFrame(updateFeature);
      }
    },
    { passive: true }
  );
}

const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ------------------------------------------------------------
   3D hero — Three.js carousel
------------------------------------------------------------ */
async function initHero() {
  const canvas = $("#hero-canvas");
  if (!canvas) return;

  let THREE;
  try {
    THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js"
    );
  } catch (err) {
    console.warn("Three.js could not be loaded — showing static hero.", err);
    canvas.style.display = "none";
    hidePreloader();
    return;
  }

  const isMobile = window.innerWidth < 760;
  const dpr = () => Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    console.warn("WebGL unavailable — showing static hero.", err);
    canvas.style.display = "none";
    hidePreloader();
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0908, 0.028);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    120
  );
  camera.position.set(0, 0.3, 17);

  renderer.setPixelRatio(dpr());
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const textureLoader = new THREE.TextureLoader();
  const maxAniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

  /* ---------- sun ---------- */
  function makeSunTexture() {
    const size = 256;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255, 240, 210, 0.95)");
    g.addColorStop(0.18, "rgba(255, 170, 110, 0.9)");
    g.addColorStop(0.36, "rgba(220, 50, 40, 0.65)");
    g.addColorStop(0.62, "rgba(150, 18, 22, 0.28)");
    g.addColorStop(1, "rgba(120, 10, 14, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const sunMaterial = new THREE.MeshBasicMaterial({
    map: makeSunTexture(),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    opacity: 0.85,
  });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), sunMaterial);
  sun.position.set(0, 2.4, -30);
  scene.add(sun);

  /* ---------- glow sprite texture for embers ---------- */
  function makeEmberTexture() {
    const size = 64;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255, 235, 200, 1)");
    g.addColorStop(0.4, "rgba(255, 170, 90, 0.7)");
    g.addColorStop(1, "rgba(255, 100, 40, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /* ---------- image carousel ---------- */
  const imageSources = [
    "images/opt/01.webp",
    "images/opt/02.webp",
    "images/opt/03.webp",
    "images/opt/04.webp",
    "images/opt/05.webp",
    "images/opt/06.webp",
    "images/opt/07.webp",
    "images/opt/08.webp",
    "images/opt/09.webp",
  ];

  const ring = new THREE.Group();
  ring.position.y = -0.2;
  scene.add(ring);

  const RADIUS = 9.2;
  const CARD_W = 2.2;
  const CARD_H = CARD_W * 1.78;
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const edgeGeometry = new THREE.EdgesGeometry(geometry);
  const cardMeshes = [];

  imageSources.forEach((src, i) => {
    const angle = (i / imageSources.length) * Math.PI * 2;
    const texture = textureLoader.load(src);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAniso;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.96,
      side: THREE.FrontSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
    mesh.rotation.y = angle;
    mesh.userData.baseY = 0;
    mesh.userData.phase = i * 1.7;
    mesh.userData.angle = angle;

    const edges = new THREE.LineSegments(
      edgeGeometry,
      new THREE.LineBasicMaterial({
        color: 0xc9a227,
        transparent: true,
        opacity: 0.4,
      })
    );
    edges.position.z = 0.006;
    mesh.add(edges);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W + 0.16, CARD_H + 0.16),
      new THREE.MeshBasicMaterial({
        color: 0x2a0c0c,
        transparent: true,
        opacity: 0.55,
      })
    );
    glow.position.z = -0.02;
    mesh.add(glow);

    ring.add(mesh);
    cardMeshes.push(mesh);
  });

  /* ---------- orbit guides ---------- */
  const guideMaterial = new THREE.LineBasicMaterial({
    color: 0xc9a227,
    transparent: true,
    opacity: 0.14,
  });
  [CARD_H / 2 + 0.7, -CARD_H / 2 - 0.7].forEach((y) => {
    const points = [];
    const segments = 180;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.sin(a) * RADIUS, y, Math.cos(a) * RADIUS));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    scene.add(new THREE.LineLoop(geo, guideMaterial));
  });

  /* ---------- embers ---------- */
  const EMBER_COUNT = isMobile ? 70 : 170;
  const emberPositions = new Float32Array(EMBER_COUNT * 3);
  const emberSpeeds = new Float32Array(EMBER_COUNT);
  const emberDrift = new Float32Array(EMBER_COUNT);

  for (let i = 0; i < EMBER_COUNT; i++) {
    emberPositions[i * 3] = (Math.random() - 0.5) * 34;
    emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 34;
    emberSpeeds[i] = 0.25 + Math.random() * 0.75;
    emberDrift[i] = Math.random() * Math.PI * 2;
  }

  const emberGeo = new THREE.BufferGeometry();
  emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));
  const emberMaterial = new THREE.PointsMaterial({
    map: makeEmberTexture(),
    color: 0xffb066,
    size: 0.085,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const embers = new THREE.Points(emberGeo, emberMaterial);
  scene.add(embers);

  /* ---------- pointer ---------- */
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true }
  );

  /* ---------- visibility ---------- */
  const hero = $(".hero");
  let heroVisible = true;
  if ("IntersectionObserver" in window && hero) {
    new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    ).observe(hero);
  }

  /* ---------- resize ---------- */
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
  }
  window.addEventListener("resize", onResize);

  /* ---------- animation ---------- */
  const clock = new THREE.Clock();
  let ringRotation = 0;
  let canvasReady = false;
  let lastOpacity = "0";
  const camTarget = new THREE.Vector3(0, 0.3, 17);

  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.elapsedTime;

    if (!heroVisible || document.hidden) return;

    const scrollProgress = clamp(window.scrollY / window.innerHeight, 0, 1);
    if (canvasReady) {
      const nextOpacity = Math.max(0, 1 - scrollProgress * 1.25).toFixed(3);
      if (nextOpacity !== lastOpacity) {
        canvas.style.opacity = nextOpacity;
        lastOpacity = nextOpacity;
      }
    }

    if (!reduceMotion) ringRotation += delta * 0.075;
    ring.rotation.y = ringRotation + mouseX * 0.1;
    ring.rotation.x = scrollProgress * 0.16 + mouseY * 0.03;
    ring.position.y = -0.2 + scrollProgress * 4.2;

    cardMeshes.forEach((mesh) => {
      mesh.position.y = Math.sin(elapsed * 0.8 + mesh.userData.phase) * 0.09;
    });

    camTarget.set(mouseX * 0.9, 0.3 + mouseY * 0.55, 17 + scrollProgress * 3);
    camera.position.lerp(camTarget, 0.045);
    camera.lookAt(0, 0, 0);

    sunMaterial.opacity = 0.78 + Math.sin(elapsed * 0.55) * 0.08;

    if (!reduceMotion) {
      const pos = emberGeo.attributes.position.array;
      for (let i = 0; i < EMBER_COUNT; i++) {
        pos[i * 3 + 1] -= emberSpeeds[i] * delta;
        pos[i * 3] += Math.sin(elapsed * 0.5 + emberDrift[i]) * 0.06 * delta;
        if (pos[i * 3 + 1] < -10) {
          pos[i * 3 + 1] = 10;
          pos[i * 3] = (Math.random() - 0.5) * 34;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 34;
        }
      }
      emberGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);

    if (!canvasReady) {
      canvasReady = true;
      lastOpacity = "1";
      canvas.style.opacity = "1";
    }
  }

  animate();
}

initHero();

/* ------------------------------------------------------------
   Fallback: if scripts fail, reveal the page anyway
------------------------------------------------------------ */
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!document.body.classList.contains("loaded")) {
      document.body.classList.remove("loading");
      document.body.classList.add("loaded");
      preloader?.classList.add("is-done");
    }
  }, 3000);
});
