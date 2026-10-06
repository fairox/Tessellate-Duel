import { useCallback, useEffect, useRef } from 'react';

/**
 * Spring-driven holo tilt.
 *
 * Writes CSS custom properties straight onto the element so pointer movement
 * never re-renders React:
 *   --holo-rx / --holo-ry  tilt in degrees
 *   --holo-px / --holo-py  light position in % across the card
 *   --holo-o               0..1 how strongly the foil/glare is lit
 *   --holo-hyp             0..1 distance of the light from the centre
 *
 * The rAF loop only runs while the spring is moving and stops once it settles,
 * so a resting table costs nothing.
 */

interface Options {
  enabled?: boolean;
  /** Max tilt in degrees */
  maxTilt?: number;
  /** Follow device orientation on touch devices (no pointer hover there) */
  gyro?: boolean;
}

interface Axis {
  v: number;
  vel: number;
  target: number;
}

const STIFFNESS = 210;
const DAMPING = 22;
const REST = { rx: 0, ry: 0, px: 50, py: 50, o: 0 };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function useHoloTilt<T extends HTMLElement>({
  enabled = true,
  maxTilt = 14,
  gyro = false,
}: Options = {}) {
  const nodeRef = useRef<T | null>(null);
  const frame = useRef<number | null>(null);
  const last = useRef(0);
  const axes = useRef<Record<keyof typeof REST, Axis>>({
    rx: { v: 0, vel: 0, target: 0 },
    ry: { v: 0, vel: 0, target: 0 },
    px: { v: 50, vel: 0, target: 50 },
    py: { v: 50, vel: 0, target: 50 },
    o: { v: 0, vel: 0, target: 0 },
  });

  const write = useCallback(() => {
    const el = nodeRef.current;
    if (!el) return;
    const a = axes.current;
    const hyp = Math.min(1, Math.hypot(a.px.v - 50, a.py.v - 50) / 50);
    el.style.setProperty('--holo-rx', `${a.rx.v.toFixed(2)}deg`);
    el.style.setProperty('--holo-ry', `${a.ry.v.toFixed(2)}deg`);
    el.style.setProperty('--holo-px', `${a.px.v.toFixed(2)}%`);
    el.style.setProperty('--holo-py', `${a.py.v.toFixed(2)}%`);
    el.style.setProperty('--holo-o', a.o.v.toFixed(3));
    el.style.setProperty('--holo-hyp', hyp.toFixed(3));
  }, []);

  const step = useCallback(
    (now: number) => {
      // Cap dt so a backgrounded tab doesn't come back with a huge jump
      const dt = Math.min(0.032, (now - last.current) / 1000 || 0.016);
      last.current = now;
      let moving = false;
      for (const axis of Object.values(axes.current)) {
        const force = (axis.target - axis.v) * STIFFNESS - axis.vel * DAMPING;
        axis.vel += force * dt;
        axis.v += axis.vel * dt;
        if (Math.abs(axis.target - axis.v) > 0.01 || Math.abs(axis.vel) > 0.01) {
          moving = true;
        } else {
          axis.v = axis.target;
          axis.vel = 0;
        }
      }
      write();
      frame.current = moving ? requestAnimationFrame(step) : null;
    },
    [write],
  );

  const kick = useCallback(() => {
    if (frame.current !== null) return;
    last.current = performance.now();
    frame.current = requestAnimationFrame(step);
  }, [step]);

  const setTarget = useCallback(
    (px: number, py: number, o: number) => {
      const a = axes.current;
      const tilt = prefersReducedMotion() ? 0 : maxTilt;
      a.px.target = px;
      a.py.target = py;
      a.ry.target = ((px - 50) / 50) * tilt;
      a.rx.target = -((py - 50) / 50) * tilt;
      a.o.target = o;
      kick();
    },
    [kick, maxTilt],
  );

  const reset = useCallback(() => {
    const a = axes.current;
    a.rx.target = REST.rx;
    a.ry.target = REST.ry;
    a.px.target = REST.px;
    a.py.target = REST.py;
    a.o.target = REST.o;
    kick();
  }, [kick]);

  // Pointer tracking
  useEffect(() => {
    const el = nodeRef.current;
    if (!el || !enabled) return;
    write();

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.isPrimary) return;
      const r = el.getBoundingClientRect();
      const px = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const py = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      setTarget(px, py, 1);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onMove);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointercancel', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onMove);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('pointercancel', reset);
      reset();
    };
  }, [enabled, reset, setTarget, write]);

  // Device orientation (touch devices only; Android fires without a prompt)
  useEffect(() => {
    if (!enabled || !gyro || typeof window === 'undefined') return;
    if (!window.matchMedia?.('(hover: none)').matches) return;
    let base: { beta: number; gamma: number } | null = null;

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      if (!base) base = { beta: e.beta, gamma: e.gamma };
      const dx = Math.max(-25, Math.min(25, e.gamma - base.gamma)) / 25;
      const dy = Math.max(-25, Math.min(25, e.beta - base.beta)) / 25;
      setTarget(50 + dx * 50, 50 + dy * 50, 0.35 + Math.min(0.65, Math.hypot(dx, dy)));
    };

    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [enabled, gyro, setTarget]);

  // Never leave a frame scheduled after unmount
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    },
    [],
  );

  return nodeRef;
}
