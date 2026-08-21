import { useEffect, useState } from "react";

const DEFAULT_DURATION_MS = 1800;
const DEFAULT_DECIMALS = 0;

function easeOutQuart(progress: number) {
  return 1 - Math.pow(1 - progress, 4);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useCountUp(
  target: number,
  options?: { durationMs?: number; decimals?: number; start?: boolean },
) {
  const {
    durationMs = DEFAULT_DURATION_MS,
    decimals = DEFAULT_DECIMALS,
    start = true,
  } = options ?? {};
  const [animatedValue, setAnimatedValue] = useState<number | null>(null);

  const skipAnimation =
    target <= 0 || durationMs <= 0 || prefersReducedMotion();

  useEffect(() => {
    if (!start || skipAnimation) return;

    let frame = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      setAnimatedValue(target * easeOutQuart(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, start, skipAnimation]);

  const value = !start ? 0 : skipAnimation ? target : (animatedValue ?? 0);

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
