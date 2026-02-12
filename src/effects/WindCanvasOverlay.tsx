import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { HeroRenderTier } from "./hero/types";

type WindStreak = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  opacity: number;
};

type WindCanvasOverlayProps = {
  vNorm: number; // 0-1 normalized scroll velocity
  tier: HeroRenderTier;
  isVisible: boolean;
};

const TIER_CONFIG = {
  high: { dpr: 2.0, streakCount: 40 },
  medium: { dpr: 1.5, streakCount: 26 },
  low: { dpr: 1.0, streakCount: 12 },
} as const;

const WIND_PARAMS = {
  lambda: 14, // damping factor for intensity smoothing
  spawnRate: 0.08, // base spawn probability per frame
  streakLifetime: 1.2, // seconds
  baseSpeed: 180, // pixels per second
  lengthVariation: 0.4, // 40% variation
  opacityDecay: 0.85,
};

export function WindCanvasOverlay({ vNorm, tier, isVisible }: WindCanvasOverlayProps) {
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const intensityRef = useRef(0);
  const streaksRef = useRef<WindStreak[]>([]);
  const spawnAccumulatorRef = useRef(0);

  const [documentVisible, setDocumentVisible] = useState(() => !document.hidden);
  const config = TIER_CONFIG[tier];

  useEffect(() => {
    const onVisibilityChange = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    lastTimeRef.current = performance.now();
    intensityRef.current = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, config.dpr);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawnStreak = () => {
      const x = -20; // spawn off-screen left
      const y = Math.random() * window.innerHeight;
      const speedMultiplier = 0.8 + Math.random() * 0.6; // 0.8-1.4
      const length = 60 + Math.random() * 80; // 60-140px

      streaksRef.current.push({
        x,
        y,
        vx: WIND_PARAMS.baseSpeed * speedMultiplier,
        vy: (Math.random() - 0.5) * 40, // slight vertical drift
        life: 0,
        maxLife: WIND_PARAMS.streakLifetime,
        length,
        opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7
      });
    };

    const updateStreak = (streak: WindStreak, dt: number) => {
      streak.life += dt;
      streak.x += streak.vx * dt;
      streak.y += streak.vy * dt;

      // Fade out near end of life
      const lifeRatio = streak.life / streak.maxLife;
      const fadeStart = 0.7;
      if (lifeRatio > fadeStart) {
        streak.opacity *= WIND_PARAMS.opacityDecay;
      }
    };

    const renderStreak = (streak: WindStreak) => {
      const alpha = streak.opacity * intensityRef.current;
      if (alpha < 0.01) return;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      const endX = streak.x + streak.length;
      const endY = streak.y + (streak.vy / streak.vx) * streak.length;

      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Add subtle gradient effect
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(streak.x, streak.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.restore();
    };

    const loop = (now: number) => {
      if (!running) return;

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      // Smooth intensity with damping
      const targetIntensity = vNorm;
      const alpha = 1 - Math.exp(-WIND_PARAMS.lambda * dt);
      intensityRef.current += (targetIntensity - intensityRef.current) * alpha;

      // Spawn new streaks based on intensity
      if (isVisible && documentVisible && intensityRef.current > 0.01) {
        spawnAccumulatorRef.current += dt * WIND_PARAMS.spawnRate * intensityRef.current;
        while (spawnAccumulatorRef.current >= 1 && streaksRef.current.length < config.streakCount) {
          spawnStreak();
          spawnAccumulatorRef.current -= 1;
        }
      }

      // Update and render streaks
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = streaksRef.current.length - 1; i >= 0; i--) {
        const streak = streaksRef.current[i];
        updateStreak(streak, dt);

        if (streak.life >= streak.maxLife || streak.opacity < 0.01 || streak.x > window.innerWidth + 50) {
          streaksRef.current.splice(i, 1);
        } else {
          renderStreak(streak);
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      streaksRef.current.length = 0;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [vNorm, tier, isVisible, documentVisible, reducedMotion, config]);

  if (reducedMotion) return null;

  return <canvas className="wind-canvas-overlay" ref={canvasRef} aria-hidden="true" />;
}