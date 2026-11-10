/**
 * The Labs field: a slow noise field pushed around by the cursor, ordered-dithered into the
 * site palette (the same trick as MONITOR's Dither effect). One WebGL quad, paused offscreen.
 */
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec2 uMouse; uniform float uTime; uniform float uLight; uniform float uPx; uniform float uMode;
out vec4 o;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += n(p) * a; p *= 2.03; a *= 0.5; } return s; }
float bayer(vec2 p) { // 4×4 ordered threshold
  ivec2 q = ivec2(mod(p, 4.0)); int i = q.x + q.y * 4;
  int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
  return (float(m[i]) + 0.5) / 16.0; }
void main() {
  vec2 cell = floor(gl_FragCoord.xy / uPx);
  vec2 uv = cell * uPx / uRes.y;
  vec2 m = uMouse / uRes.y;
  float d = length(uv - m);
  vec2 warp = (uv - m) / (d + 0.08) * 0.06 * exp(-d * 3.0);
  float t = uTime * 0.05;
  float v = fbm(uv * 2.2 + warp * 6.0 + vec2(t, -t * 0.7) + fbm(uv * 1.3 - t) * 1.5);
  v = smoothstep(0.25, 0.85, v) + exp(-d * 6.0) * 0.35;
  if (uMode > 0.5) {
    // Speaker cone: rings pumping out from the centre, bent by the cursor.
    vec2 c = vec2(uRes.x / uRes.y * 0.5, 0.5);
    vec2 p = uv - c + warp * 2.0;
    float r = length(p), a = atan(p.y, p.x);
    float pump = 0.5 + 0.5 * sin(uTime * 2.4);
    v = (0.5 + 0.5 * sin(r * 46.0 - uTime * 3.0 + sin(a * 3.0 + uTime) * 1.2)) * smoothstep(0.62, 0.05, r) * (0.75 + pump * 0.25) + exp(-d * 6.0) * 0.3;
  }
  float on = step(bayer(cell), v);
  float accent = step(0.86, v) * step(bayer(cell + 7.0), (v - 0.86) * 3.0);
  vec3 bg = mix(vec3(0.031), vec3(0.969, 0.949, 0.925), uLight);
  vec3 fg = mix(vec3(0.16), vec3(0.78, 0.76, 0.72), uLight);
  vec3 col = mix(bg, fg, on);
  col = mix(col, vec3(0.827, 0.125, 0.165), accent);
  o = vec4(col, 1.0);
}`;
const VERT = `#version 300 es
in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

export function mountField(canvas: HTMLCanvasElement, mouse: { x: number; y: number }): () => void {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false });
  if (!gl) return () => {};
  const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return () => {};
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uMouse = u("uMouse"), uTime = u("uTime"), uLight = u("uLight"), uPx = u("uPx"), uMode = u("uMode");
  const mode = canvas.dataset.field === "cone" ? 1 : 0;
  const sm = { x: 0, y: 0 };
  let visible = true, alive = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = (t: number) => {
    if (!alive) return;
    if (visible) {
      const dpr = Math.min(devicePixelRatio, 2), r = canvas.getBoundingClientRect();
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      sm.x += ((mouse.x - r.left) * dpr - sm.x) * 0.08;
      sm.y += ((r.bottom - mouse.y) * dpr - sm.y) * 0.08;
      gl.uniform2f(uRes, w, h); gl.uniform2f(uMouse, sm.x, sm.y);
      gl.uniform1f(uTime, reduce ? 0 : t / 1000);
      gl.uniform1f(uLight, document.documentElement.dataset.theme === "light" ? 1 : 0);
      gl.uniform1f(uPx, 3 * dpr);
      gl.uniform1f(uMode, mode);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return () => { alive = false; io.disconnect(); };
}
