"use client";

import { useEffect, useRef } from "react";

export function ParticleDonut({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const CHARS = ".,-~:;=!*#$@";
    const CHARS_LEN = CHARS.length;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 8;
    let cellH = 14;
    let zbuf: Float32Array | null = null;
    let cbuf: Uint8Array | null = null;

    function resize(): boolean {
      if (!canvas || !ctx || !container) return false;
      const cw = canvas.clientWidth || container.clientWidth || 0;
      const ch = canvas.clientHeight || container.clientHeight || 0;
      if (cw < 60 || ch < 60) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = cw;
      height = ch;
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = Math.max(8, Math.min(14, cw / 55));
      cellW = fontSize * 0.6;
      cellH = fontSize * 1.15;

      cols = Math.max(10, Math.floor(cw / cellW));
      rows = Math.max(10, Math.floor(ch / cellH));

      zbuf = new Float32Array(cols * rows);
      cbuf = new Uint8Array(cols * rows);

      ctx.font = fontSize + "px ui-monospace, Menlo, Consolas, monospace";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      return true;
    }

    resize();

    const mountTime = performance.now();
    const GROWTH_MS = 2200;

    let running = true;
    let rafId = 0;
    let A = -1.15;
    let B = 0;

    function render(now: number) {
      if (!running || !ctx) return;
      if (!zbuf || !cbuf || cols === 0 || rows === 0) {
        if (!resize()) {
          rafId = requestAnimationFrame(render);
          return;
        }
      }
      if (!zbuf || !cbuf) return;

      // Growth animation
      const elapsed = now - mountTime;
      const rawGrow = Math.min(1, elapsed / GROWTH_MS);
      const eased = 1 - Math.pow(1 - rawGrow, 3);
      const grow = 0.25 + 0.75 * eased;

      // Rotate
      if (!motionQuery.matches) {
        A += 0.012;
        B += 0.007;
      }
      const sinA = Math.sin(A), cosA = Math.cos(A);
      const sinB = Math.sin(B), cosB = Math.cos(B);

      zbuf.fill(0);
      cbuf.fill(255);

      const cx = cols / 2;
      const cy = rows / 2;

      // Scale in CHARACTER units
      // Classic donut.c uses 30 (x) and 15 (y) for 80x22 grid → ratios 0.375 and 0.68
      // We want pixel-correct aspect: cellW < cellH so scaleY should be < scaleX/2
      // Compute scale in CHARACTER units based on pixel dimensions.
      // 0.75 is the max projected radius of the torus (outer edge at z=0).
      // Multiply by cellW/cellH to keep the donut circular on screen.
      const radiusPx = Math.min(width, height) * 0.44;
      const scaleX = (radiusPx / cellW) * 1.333 * grow;
      const scaleY = (radiusPx / cellH) * 1.333 * grow;

      const thetaStep = 0.075;
      const phiStep = 0.022;

      for (let theta = 0; theta < Math.PI * 2; theta += thetaStep) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const cp = Math.cos(phi);
          const sp = Math.sin(phi);

          // --- Exact donut.c math ---
          const h = ct + 2;
          const D = 1 / (sp * h * sinA + st * cosA + 5);
          const t = sp * h * cosA - st * sinA;

          const xf = cx + scaleX * D * (cp * h * cosB - t * sinB);
          const yf = cy + scaleY * D * (cp * h * sinB + t * cosB);

          const xp = Math.round(xf);
          const yp = Math.round(yf);

          if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;

          const o = xp + yp * cols;
          if (D <= zbuf[o]) continue;

          zbuf[o] = D;

          // Luminance
          const N = (CHARS_LEN - 1) * (
            (st * sinA - sp * ct * cosA) * cosB
            - sp * ct * sinA
            - st * cosA
            - cp * ct * sinB
          );

          cbuf[o] = N > 0 ? Math.min(CHARS_LEN - 1, Math.floor(N)) : 0;
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 1;

      for (let y = 0; y < rows; y++) {
        const py = y * cellH;
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const ci = cbuf[idx];
          if (ci === 255) continue;
          const D = zbuf[idx];
          // Subtle depth fade
          const alpha = Math.min(1, Math.max(0.35, D * 3.5));
          ctx.globalAlpha = alpha;
          ctx.fillText(CHARS[ci], x * cellW, py);
        }
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    const ro = new ResizeObserver(() => { resize(); });
    ro.observe(container);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={"relative w-full h-full " + className}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}