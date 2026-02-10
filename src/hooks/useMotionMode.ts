import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export type MotionMode = "full" | "lite" | "off";

const STORAGE_KEY = "valentine.motionMode";

type InitialMotionMode = {
  mode: MotionMode;
  hasStoredValue: boolean;
};

function isMotionMode(value: string | null): value is MotionMode {
  return value === "full" || value === "lite" || value === "off";
}

function readInitialMotionMode(): InitialMotionMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (isMotionMode(raw)) {
      return { mode: raw, hasStoredValue: true };
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return { mode: "off", hasStoredValue: false };
    }
  } catch {
    // Keep defaults when storage is blocked.
  }

  return { mode: "full", hasStoredValue: false };
}

export function useMotionMode() {
  const reducedMotion = usePrefersReducedMotion();
  const initialRef = useRef<InitialMotionMode | null>(null);
  if (!initialRef.current) {
    initialRef.current = readInitialMotionMode();
  }

  const hasStoredValueRef = useRef(initialRef.current.hasStoredValue);
  const [mode, setModeState] = useState<MotionMode>(initialRef.current.mode);

  useEffect(() => {
    if (hasStoredValueRef.current) return;
    if (reducedMotion && mode === "full") {
      setModeState("off");
    }
  }, [mode, reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.motionMode = mode;
  }, [mode]);

  const setMode = useCallback((nextMode: MotionMode) => {
    hasStoredValueRef.current = true;
    setModeState(nextMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    } catch {
      // Ignore storage failures and keep in-memory state.
    }
  }, []);

  return { mode, setMode } as const;
}
