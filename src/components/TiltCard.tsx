import {
  type CSSProperties,
  type PointerEventHandler,
  type PropsWithChildren,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { clamp } from "../utils/geom";

type TiltCardProps = PropsWithChildren<{
  className?: string;
}>;

function isTouchLikeDevice(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function TiltCard({ className = "", children }: TiltCardProps) {
  const reducedMotion = usePrefersReducedMotion();
  const elementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  const animate = () => {
    const node = elementRef.current;
    if (!node) return;

    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.14;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.14;

    const tx = currentRef.current.x;
    const ty = currentRef.current.y;

    node.style.setProperty("--tilt-x", `${tx.toFixed(3)}`);
    node.style.setProperty("--tilt-y", `${ty.toFixed(3)}`);

    if (Math.abs(tx - targetRef.current.x) < 0.001 && Math.abs(ty - targetRef.current.y) < 0.001) {
      rafRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (rafRef.current !== null || reducedMotion) return;
    rafRef.current = requestAnimationFrame(animate);
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (reducedMotion || isTouchLikeDevice()) return;
    const node = elementRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const nx = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const ny = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    targetRef.current.x = (ny - 0.5) * -1;
    targetRef.current.y = (nx - 0.5) * 1;
    node.style.setProperty("--mx", `${(nx * 100).toFixed(2)}%`);
    node.style.setProperty("--my", `${(ny * 100).toFixed(2)}%`);
    startAnimation();
  };

  const onPointerLeave: PointerEventHandler<HTMLDivElement> = () => {
    targetRef.current = { x: 0, y: 0 };
    startAnimation();
  };

  const style = {
    "--tilt-x": 0,
    "--tilt-y": 0,
    "--mx": "50%",
    "--my": "50%",
  } as CSSProperties;

  return (
    <div
      ref={elementRef}
      className={`tilt-card ${className}`.trim()}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}
