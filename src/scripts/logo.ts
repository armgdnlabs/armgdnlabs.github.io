/**
 * The ARMGDN wordmark as a live surface: near the cursor the letters bulge, thicken and break
 * into pixels with a red/bone channel split. The SVG stays underneath for layout, accessibility and as the no-WebGL fallback.
 */
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uMouse; uniform float uHover; uniform float uTime;
uniform float uBurst; uniform float uSeed; uniform vec3 uInk; uniform vec3 uRed;
out vec4 o;
float h(float x) { return fract(sin(x * 91.17 + uSeed) * 43758.55); }
float ink(vec2 uv) { return texture(uTex, uv).a; }
void main() {
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1.0 - uv.y;
  vec2 px = gl_FragCoord.xy;
  vec2 m = uMouse;
  float aspect = uRes.x / uRes.y;
  float d = length((uv - m) * vec2(aspect, 1.0));
  // Lens around the cursor: bulge plus pixel blocks that grow towards the centre.
  float lens = uHover * smoothstep(0.32, 0.0, d);
  vec2 q = uv - (uv - m) * lens * 0.1;
  float block = max(1.0, floor(lens * 9.0 + uBurst * 10.0));
  vec2 cell = (floor(q * uRes / block) + 0.5) * block / uRes;
  // Burst: horizontal slices jump sideways.
  float row = floor(uv.y * 14.0);
  float slice = uBurst * (h(row + floor(uTime * 20.0)) - 0.5) * 0.12 * step(0.55, h(row * 3.1 + floor(uTime * 12.0)));
  vec2 s = cell + vec2(slice, 0.0);
  // Dilate (letters thicken) inside the lens, and split the red channel off.
  float spread = (lens * 3.0 + uBurst * 2.0) / uRes.y;
  float a = ink(s);
  for (int i = 0; i < 6; i++) { float an = float(i) * 1.047; a = max(a, ink(s + vec2(cos(an), sin(an)) * spread)); }
  float split = (lens * 0.012 + uBurst * 0.02);
  float r = ink(s + vec2(split, 0.0));
  vec3 col = uInk * a;
  float alpha = max(a, r * step(0.001, split));
  col = mix(col, uRed, clamp(r - a, 0.0, 1.0));
  o = vec4(col, alpha);
}`;
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export function mountLogo(canvas: HTMLCanvasElement, svg: SVGSVGElement, mouse: { x: number; y: number }): () => void {
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, alpha: true });
  if (!gl) return () => {};
  const sh = (t: number, s: string) => { const x = gl.createShader(t)!; gl.shaderSource(x, s); gl.compileShader(x); return x; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = { res: U("uRes"), mouse: U("uMouse"), hover: U("uHover"), time: U("uTime"), burst: U("uBurst"), seed: U("uSeed"), ink: U("uInk"), red: U("uRed") };

  // Rasterise the SVG wordmark (white) into a texture.
  const tex = gl.createTexture();
  let ready = false;
  const box = svg.viewBox.baseVal;
  const W = 2048, H = Math.round((W * box.height) / box.width);
  const markup = new XMLSerializer().serializeToString(svg).replace(/fill="currentColor"/g, 'fill="#fff"');
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d")!.drawImage(img, 0, 0, W, H);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    ready = true;
    canvas.classList.add("on");
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = (v: string) => { const n = parseInt(v.trim().slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
  let hover = 0, burst = 0, seed = 0, alive = true, visible = true;
  const sm = { x: 0.5, y: 0.5 };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }); io.observe(canvas);
  const frame = (t: number) => {
    if (!alive) return;
    if (ready && visible) {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
      const w = Math.round(r.width * dpr), hgt = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== hgt) { canvas.width = w; canvas.height = hgt; }
      const mx = (mouse.x - r.left) / r.width, my = (mouse.y - r.top) / r.height;
      const inside = mx > -0.05 && mx < 1.05 && my > -0.3 && my < 1.3;
      hover += ((inside && !reduce ? 1 : 0) - hover) * 0.08;
      sm.x += (mx - sm.x) * 0.3; sm.y += (my - sm.y) * 0.3;
      burst *= 0.9;
      const cs = getComputedStyle(document.documentElement);
      gl.viewport(0, 0, w, hgt); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.res, w, hgt); gl.uniform2f(u.mouse, sm.x, sm.y);
      gl.uniform1f(u.hover, hover); gl.uniform1f(u.time, t / 1000); gl.uniform1f(u.burst, burst > 0.02 ? burst : 0); gl.uniform1f(u.seed, seed);
      gl.uniform3fv(u.ink, hex(cs.getPropertyValue("--fg") || "#f7f2ec"));
      gl.uniform3fv(u.red, hex(cs.getPropertyValue("--signal") || "#d3202a"));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => { alive = false; io.disconnect(); };
}
