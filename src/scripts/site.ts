import Lenis from "lenis";
import { mountField } from "./field";

/*
 * Site-wide motion. Things that live across page transitions (scroll, cursor, background,
 * loader, theme) start once; page bits re-bind on every astro:page-load.
 */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const root = document.documentElement;
const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; }, { passive: true });

/* ── Smooth scroll + progress bar + scroll velocity (feeds the tickers) ── */
const lenis = reduce ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
let velocity = 0;
const progress = document.getElementById("progress");
const hdr = document.querySelector<HTMLElement>(".hdr");
let lastY = 0;
const raf = (t: number) => {
  lenis?.raf(t);
  // Header tucks away while scrolling down and returns on the way up.
  const y = scrollY;
  if (hdr && Math.abs(y - lastY) > 4) { hdr.classList.toggle("hdr--away", y > lastY && y > 140); lastY = y; }
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  velocity += ((lenis?.velocity ?? 0) - velocity) * 0.1;
  requestAnimationFrame(raf);
};
requestAnimationFrame(raf);
document.addEventListener("astro:after-swap", () => { lenis?.scrollTo(0, { immediate: true }); });

/* ── Loader: once per visit, counts to 100 while fonts and the first paint settle ── */
(() => {
  const n = document.getElementById("loader-n"), bar = document.getElementById("loader-bar");
  try { sessionStorage.setItem("armgdn-loaded", "1"); } catch { /* private mode */ }
  if (root.classList.contains("loaded")) return;
  const start = performance.now(), min = 1500;
  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / min);
    const eased = 1 - Math.pow(1 - p, 3);
    if (n) n.textContent = String(Math.round(eased * 100)).padStart(3, "0");
    if (bar) bar.style.width = `${eased * 100}%`;
    if (p < 1) requestAnimationFrame(tick);
    else document.fonts.ready.then(() => setTimeout(() => root.classList.add("loaded"), 120));
  };
  requestAnimationFrame(tick);
})();

/* ── Theme toggle ── */
document.getElementById("theme")?.addEventListener("click", () => {
  const light = root.dataset.theme !== "light";
  if (light) root.dataset.theme = "light"; else delete root.dataset.theme;
  try { localStorage.setItem("armgdn-theme", light ? "light" : "dark"); } catch { /* ignore */ }
});

/* ── Cursor: dot + lagging ring; grows on links, shows a label on [data-cursor] ── */
(() => {
  const el = document.getElementById("cursor");
  if (!el || !fine) return;
  const dot = el.querySelector<HTMLElement>(".cursor__dot")!, ring = el.querySelector<HTMLElement>(".cursor__ring")!, label = el.querySelector<HTMLElement>(".cursor__label")!;
  const r = { x: mouse.x, y: mouse.y };
  const loop = () => {
    r.x += (mouse.x - r.x) * 0.18; r.y += (mouse.y - r.y) * 0.18;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ring.style.transform = `translate3d(${r.x}px, ${r.y}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener("pointerover", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-cursor], input");
    const text = t?.dataset.cursor ?? "";
    el.classList.toggle("is-label", !!text);
    el.classList.toggle("is-link", !!t && !text);
    label.textContent = text;
  });
  document.addEventListener("pointerleave", () => el.classList.add("is-hidden"));
  document.addEventListener("pointerenter", () => el.classList.remove("is-hidden"));
})();

/* ── Background: drifting glows (one follows the cursor) under live film grain ── */
(() => {
  const c = document.getElementById("bg") as HTMLCanvasElement | null;
  const ctx = c?.getContext("2d");
  if (!c || !ctx) return;
  const scale = 0.5;
  const grain = document.createElement("canvas"); grain.width = grain.height = 160;
  const gctx = grain.getContext("2d")!;
  const gdata = gctx.createImageData(160, 160);
  const g = { x: innerWidth * 0.7, y: innerHeight * 0.3 };
  let frame = 0;
  const resize = () => { c.width = Math.ceil(innerWidth * scale); c.height = Math.ceil(innerHeight * scale); };
  resize(); addEventListener("resize", resize);
  const draw = (t: number) => {
    const w = c.width, h = c.height, light = root.dataset.theme === "light";
    ctx.clearRect(0, 0, w, h);
    g.x += (mouse.x - g.x) * 0.03; g.y += (mouse.y - g.y) * 0.03;
    const blob = (x: number, y: number, r: number, col: string) => {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, col); grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    };
    const s = t * 0.00006;
    blob(w * (0.2 + 0.1 * Math.sin(s * 3)), h * (0.25 + 0.1 * Math.cos(s * 2)), w * 0.45, light ? "#d3202a10" : "#d3202a16");
    blob(w * (0.8 + 0.08 * Math.cos(s * 2.3)), h * (0.85 + 0.06 * Math.sin(s * 1.7)), w * 0.5, light ? "#0a0a0a08" : "#f7f2ec08");
    blob(g.x * scale, g.y * scale, w * 0.22, light ? "#d3202a0c" : "#d3202a12");
    // Grain: a new random tile every other frame, tiled over the screen.
    if (!reduce && frame++ % 2 === 0) {
      const d = gdata.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      gctx.putImageData(gdata, 0, 0);
    }
    ctx.globalAlpha = light ? 0.05 : 0.07;
    ctx.globalCompositeOperation = light ? "multiply" : "screen";
    ctx.fillStyle = ctx.createPattern(grain, "repeat")!;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();

/* ── Per page ── */
const scrambleChars = "!<>-_\\/[]{}—=+*^?#01ARMGDN";
function scramble(el: HTMLElement) {
  const final = el.dataset.text ?? el.textContent ?? "";
  el.dataset.text = final;
  let f = 0;
  const step = () => {
    el.textContent = final.split("").map((ch, i) => (ch === " " || i < f / 2 ? ch : scrambleChars[(Math.random() * scrambleChars.length) | 0])).join("");
    if (f++ < final.length * 2) requestAnimationFrame(step); else el.textContent = final;
  };
  step();
}

let cleanups: (() => void)[] = [];
document.addEventListener("astro:page-load", () => {
  cleanups.forEach((f) => f()); cleanups = [];
  const section = root.dataset.section;
  document.querySelectorAll<HTMLAnchorElement>("[data-nav]").forEach((a) => a.classList.toggle("on", a.dataset.nav === section));

  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  // Hold reveals until the loader has lifted on the first visit.
  const startReveals = () => document.querySelectorAll("[data-reveal], .lines").forEach((el) => io.observe(el));
  if (root.classList.contains("loaded")) startReveals();
  else { const mo = new MutationObserver(() => { if (root.classList.contains("loaded")) { mo.disconnect(); setTimeout(startReveals, 250); } }); mo.observe(root, { attributes: true }); }
  cleanups.push(() => io.disconnect());

  if (!reduce && fine) {
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
        el.style.setProperty("--gx", `${(x + 0.5) * 100}%`); el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
      };
      const leave = () => { el.style.transform = ""; };
      el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    });
    document.querySelectorAll<HTMLElement>("[data-magnet]").forEach((el) => {
      el.style.transition = "transform 0.5s cubic-bezier(0.2,0.9,0.25,1)";
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`; });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
    document.querySelectorAll<HTMLElement>("[data-pan]").forEach((el) => {
      el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.backgroundPosition = `${50 - ((e.clientX - r.left) / r.width - 0.5) * 30}% ${50 - ((e.clientY - r.top) / r.height - 0.5) * 30}%`; });
    });
  }
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const host = el.closest("a, button") ?? el;
    host.addEventListener("pointerenter", () => scramble(el));
  });

  // Tickers drift on their own and speed up (or reverse) with scroll.
  const tracks = [...document.querySelectorAll<HTMLElement>(".ticker__track")];
  if (tracks.length && !reduce) {
    let x = 0, alive = true;
    const loop = () => {
      if (!alive) return;
      x -= 0.6 + Math.abs(velocity) * 0.35;
      tracks.forEach((t) => { const half = t.scrollWidth / 2; t.style.transform = `translate3d(${((x % half) + half) % half - half}px,0,0)`; });
      requestAnimationFrame(loop);
    };
    loop();
    cleanups.push(() => { alive = false; });
  }

  // Parallax: [data-speed] drifts against the scroll.
  const par = [...document.querySelectorAll<HTMLElement>("[data-speed]")];
  if (par.length && !reduce) {
    let alive = true;
    const loop = () => { if (!alive) return; par.forEach((el) => { el.style.transform = `translate3d(0, ${scrollY * Number(el.dataset.speed)}px, 0)`; }); requestAnimationFrame(loop); };
    loop();
    cleanups.push(() => { alive = false; });
  }

  document.querySelectorAll<HTMLCanvasElement>("canvas[data-field]").forEach((c) => { const stop = mountField(c, mouse); cleanups.push(stop); });

  // Mailing list: posts to the provider when one is configured.
  document.querySelectorAll<HTMLFormElement>("form[data-signup]").forEach((f) => {
    f.addEventListener("submit", (e) => {
      const msg = f.querySelector<HTMLElement>("[data-msg]");
      if (!f.getAttribute("action")) { e.preventDefault(); if (msg) msg.textContent = "The list opens soon. Check back in a few weeks."; }
    });
  });
});
