"use client";

import { useEffect, useRef } from "react";

export function ParticleDonut({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const CHARS = ".,-~:;=!*#$@";
    const CHARS_LEN = CHARS.length;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 8;
    let cellH = 14;
    let fontSize = 11;
    let zbuf: Float32Array | null = null;
    let cbuf: Uint8Array | null = null;

    function resize(): boolean {
      if (!canvas || !ctx || !container) return false;
      const cw = canvas.clientWidth || container.clientWidth || 0;
      const ch = canvas.clientHeight || container.clientHeight || 0;
      if (cw < 40 || ch < 40) return false;

      // Cap DPR aggressively on mobile for performance
      const maxDpr = isMobile ? 1 : 1.5;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

      width = cw;
      height = ch;
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Larger font on mobile = fewer cells = faster
      fontSize = isMobile
        ? Math.max(9, Math.min(14, cw / 32))
        : Math.max(8, Math.min(14, cw / 55));

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

    // Frame throttle for mobile (cap at ~30 fps)
    let lastFrame = 0;
    const MIN_FRAME_MS = isMobile ? 33 : 0;

    function render(now: number) {
      if (!running || !ctx) return;

      // Throttle frames on mobile
      if (MIN_FRAME_MS > 0 && now - lastFrame < MIN_FRAME_MS) {
        rafId = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;

      if (!zbuf || !cbuf || cols === 0 || rows === 0) {
        if (!resize()) {
          rafId = requestAnimationFrame(render);
          return;
        }
      }
      if (!zbuf || !cbuf) return;

      const elapsed = now - mountTime;
      const rawGrow = Math.min(1, elapsed / GROWTH_MS);
      const eased = 1 - Math.pow(1 - rawGrow, 3);
      const grow = 0.25 + 0.75 * eased;

      // Slower rotation on mobile to reduce CPU
      const rotateSpeed = isMobile ? 0.9 : 1;
      if (!motionQuery.matches) {
        A += 0.012 * rotateSpeed;
        B += 0.007 * rotateSpeed;
      }
      const sinA = Math.sin(A), cosA = Math.cos(A);
      const sinB = Math.sin(B), cosB = Math.cos(B);

      zbuf.fill(0);
      cbuf.fill(255);

      const cx = cols / 2;
      const cy = rows / 2;

      const radiusPx = Math.min(width, height) * 0.44;
      const scaleX = (radiusPx / cellW) * 1.333 * grow;
      const scaleY = (radiusPx / cellH) * 1.333 * grow;

      // Wider sampling steps on mobile (fewer points to project)
      const thetaStep = isMobile ? 0.11 : 0.075;
      const phiStep = isMobile ? 0.035 : 0.022;

      for (let theta = 0; theta < Math.PI * 2; theta += thetaStep) {
        const ct = Math.cos(theta);
        const st = Math.sin(theta);

        for (let phi = 0; phi < Math.PI * 2; phi += phiStep) {
          const cp = Math.cos(phi);
          const sp = Math.sin(phi);

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

          const N =
            (CHARS_LEN - 1) *
            ((st * sinA - sp * ct * cosA) * cosB -
              sp * ct * sinA -
              st * cosA -
              cp * ct * sinB);

          cbuf[o] = N > 0 ? Math.min(CHARS_LEN - 1, Math.floor(N)) : 0;
        }
      }

      // Draw
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";

      // On mobile, skip the alpha blending (it's expensive)
      const useAlpha = !isMobile;

      for (let y = 0; y < rows; y++) {
        const py = y * cellH;
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const ci = cbuf[idx];
          if (ci === 255) continue;

          if (useAlpha) {
            const D = zbuf[idx];
            ctx.globalAlpha = Math.min(1, Math.max(0.35, D * 3.5));
          }

          ctx.fillText(CHARS[ci], x * cellW, py);
        }
      }

      if (useAlpha) ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);

    // Pause when the tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else {
        running = true;
        lastFrame = 0;
        if (!rafId) rafId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
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