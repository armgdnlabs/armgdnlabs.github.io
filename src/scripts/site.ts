// Motion for every page: scroll reveals, tilt cards, photo-filled type, pack builder, preview players.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Reveal anything marked [data-reveal] (or .lines headings) as it enters view.
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll("[data-reveal], .lines").forEach((el) => io.observe(el));

// Tilt: cards lean a few degrees towards the cursor, with a glare that follows it.
if (!reduce) document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
});

// Photo-filled headings: the picture inside the letters drifts against the cursor.
if (!reduce) document.querySelectorAll<HTMLElement>("[data-pan]").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.backgroundPosition = `${50 + ((e.clientX - r.left) / r.width - 0.5) * -24}% ${50 + ((e.clientY - r.top) / r.height - 0.5) * -24}%`;
  });
});

// Labs pack builder: picking items fills the pack meter and updates the total.
document.querySelectorAll<HTMLElement>("[data-builder]").forEach((root) => {
  const meter = root.querySelector<HTMLElement>("[data-meter]");
  const count = root.querySelector<HTMLElement>("[data-count]");
  const update = () => {
    const picked = root.querySelectorAll("[data-pick][aria-pressed=true]").length;
    const total = root.querySelectorAll("[data-pick]").length;
    if (meter) meter.style.setProperty("--fill", `${total ? (picked / total) * 100 : 0}%`);
    if (count) count.textContent = `${picked} / ${total}`;
  };
  root.querySelectorAll<HTMLButtonElement>("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    update();
  }));
  update();
});

// Preview players: one plays at a time; the waveform bars light up as it plays.
let current: { audio: HTMLAudioElement; btn: HTMLElement } | null = null;
document.querySelectorAll<HTMLButtonElement>("[data-play]").forEach((btn) => {
  const src = btn.dataset.play;
  btn.addEventListener("click", () => {
    if (!src) { btn.classList.add("nudge"); setTimeout(() => btn.classList.remove("nudge"), 400); return; }
    if (current?.btn === btn) { current.audio.pause(); btn.classList.remove("on"); current = null; return; }
    current?.audio.pause();
    current?.btn.classList.remove("on");
    const audio = new Audio(src);
    audio.play().catch(() => {});
    audio.addEventListener("ended", () => { btn.classList.remove("on"); current = null; });
    btn.classList.add("on");
    current = { audio, btn };
  });
});
