import { frame, motion, useSpring } from "motion/react";
import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const spring = { damping: 3, stiffness: 50, restDelta: 0.001 };

export function PointerFollower() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { x, y } = useFollowPointer(ref, prefersReducedMotion);

  return (
    <motion.div
      ref={ref}
      className="pointer-follower-ball"
      style={{ x, y }}
      aria-hidden="true"
    />
  );
}

function useFollowPointer(
  ref: RefObject<HTMLDivElement | null>,
  disabled: boolean,
) {
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const handlePointerMove = ({ clientX, clientY }: PointerEvent) => {
      const element = ref.current;
      if (!element) return;

      frame.read(() => {
        x.set(clientX - element.offsetLeft - element.offsetWidth / 2);
        y.set(clientY - element.offsetTop - element.offsetHeight / 2);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [disabled, ref, x, y]);

  return { x, y };
}
