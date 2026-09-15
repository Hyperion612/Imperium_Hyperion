import { useCallback, useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/** Callback-ref based in-view detector (fires once). */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.15 },
): [(node: T | null) => void, boolean] {
  const [inView, setInView] = useState(false);
  const obsRef = useRef<IntersectionObserver | null>(null);
  const setRef = useCallback(
    (node: T | null) => {
      obsRef.current?.disconnect();
      if (!node) return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        },
        options,
      );
      obsRef.current = obs;
      obs.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => () => obsRef.current?.disconnect(), []);
  return [setRef, inView];
}

export const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Scroll progress 0..1 of an element taller than the viewport (for sticky scenes). */
export function useSceneProgress<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [progress, setProgress] = useState(0);
  const nodeRef = useRef<T | null>(null);
  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node;
  }, []);
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = nodeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setProgress(total > 0 ? clamp01(-rect.top / total) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return [setRef, progress];
}

/** Animated counter that runs once `active` becomes true. */
export function useCountUp(target: number, active: boolean, duration = 1600, decimals = 0): string {
  const [val, setVal] = useState(0);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration, reduced]);
  return val.toLocaleString("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

const GLYPHS = "▓▒░#<>/\\+=*HYPER0123456789";

/** Decode/scramble text effect. */
export function useScramble(text: string, active: boolean, speed = 26): string {
  const [out, setOut] = useState(text);
  const reduced = usePrefersReducedMotion();
  const done = useRef(false);
  useEffect(() => {
    if (!active || done.current) return;
    done.current = true;
    if (reduced) {
      setOut(text);
      return;
    }
    setOut(
      text
        .split("")
        .map((ch) => (ch === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join(""),
    );
    let frame = 0;
    const total = text.length;
    const id = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor(frame / 2.2);
      let s = "";
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        if (ch === " " || i < revealed) s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (revealed >= total) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [active, text, speed, reduced]);
  return out;
}

/** Pointer parallax — writes transforms directly to avoid re-renders. */
export function useParallax<T extends HTMLElement>(strength = 12, disabled = false): [(node: T | null) => void] {
  const nodeRef = useRef<T | null>(null);
  const onMove = useCallback(
    (e: MouseEvent) => {
      const el = nodeRef.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      el.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
    },
    [strength],
  );
  useEffect(() => {
    if (disabled) return;
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove, disabled]);
  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node;
  }, []);
  return [setRef];
}

/** Deterministic pseudo-random grid (QR-like) from a string seed. */
export function hashMatrix(seed: string, size = 21): boolean[][] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
  const m: boolean[][] = [];
  for (let y = 0; y < size; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < size; x++) row.push(rand() > 0.52);
    m.push(row);
  }
  const finder = (ox: number, oy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const border = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        m[oy + y][ox + x] = border || core;
      }
  };
  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);
  return m;
}
