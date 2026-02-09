import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { pickOne, randomInRange } from "../utils/rand";

type HeartParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  size: number;
  icon: string;
};

type HeartsCanvasOverlayProps = {
  durationMs?: number;
  variant?: "celebrate" | "ambient";
};

const HEARTS = ["❤", "💗", "💖", "💘", "💕", "💝"] as const;

export function HeartsCanvasOverlay({
  durationMs = 9000,
  variant = "celebrate",
}: HeartsCanvasOverlayProps) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let running = true;
    let lastTs = performance.now();
    let spawnAccumulator = 0;
    let elapsed = 0;
    const particles: HeartParticle[] = [];
    const isAmbient = variant === "ambient";
    const maxHearts = reducedMotion ? 8 : isAmbient ? 22 : 80;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const spawn = (burst = false) => {
      if (particles.length >= maxHearts) return;
      const x = randomInRange(30, window.innerWidth - 30);
      const y = window.innerHeight + randomInRange(10, 60);
      const speedY = isAmbient
        ? burst
          ? randomInRange(-230, -150)
          : randomInRange(-220, -130)
        : burst
          ? randomInRange(-560, -320)
          : randomInRange(-520, -280);

      particles.push({
        x,
        y,
        vx: isAmbient ? randomInRange(-40, 40) : randomInRange(-80, 80),
        vy: speedY,
        rot: randomInRange(0, Math.PI * 2),
        rotSpeed: randomInRange(-2.2, 2.2),
        life: 0,
        maxLife: isAmbient ? randomInRange(4.8, 7.2) : randomInRange(4.5, 7.0),
        size: isAmbient ? randomInRange(14, 22) : randomInRange(18, 34),
        icon: pickOne(HEARTS),
      });
    };

    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      for (let i = 0; i < 8; i += 1) spawn(true);
    }

    const loop = (ts: number) => {
      if (!running) return;
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;
      elapsed += dt * 1000;

      if (!reducedMotion && elapsed <= durationMs) {
        spawnAccumulator += dt * 1000;
        const targetInterval = isAmbient ? randomInRange(420, 820) : randomInRange(90, 150);
        if (spawnAccumulator >= targetInterval) {
          spawn();
          spawnAccumulator = 0;
        }
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const heart = particles[i];
        heart.life += dt;
        heart.x += heart.vx * dt;
        heart.y += heart.vy * dt;
        heart.rot += heart.rotSpeed * dt;
        heart.vx *= 0.995;
        const alpha = 1 - heart.life / heart.maxLife;

        if (heart.life >= heart.maxLife || heart.y < -80) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate(heart.rot);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = `${heart.size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.fillText(heart.icon, 0, 0);
        ctx.restore();
      }

      if (elapsed <= durationMs + 2200 || particles.length > 0) {
        rafId = requestAnimationFrame(loop);
      }
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      particles.length = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [durationMs, reducedMotion, variant]);

  return <canvas className="hearts-canvas-overlay" ref={canvasRef} aria-hidden="true" />;
}
