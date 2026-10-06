import { useEffect, useRef } from 'react';
import { setDustEmitter } from '../utils/dustBus';
import './DustField.css';

/**
 * Earth-pigment dust.
 *
 * Litema is worked by hand in clay, dung and ochre; this is the dust that hangs
 * in the low light of the courtyard. A few motes drift across the table, and a
 * round win kicks a burst of pigment off the winning plate (the analogue of the
 * embers in a holo-card shrine scene).
 *
 * Runs on one canvas. The loop pauses when the tab is hidden, skips ambient
 * motes under prefers-reduced-motion, and stops entirely when nothing moves.
 */

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  color: string;
  burst: boolean;
};

const PIGMENTS = ['#a85a2a', '#c98a0c', '#7a4a2e', '#ff4d12', '#3a3532'];
const AMBIENT_COUNT = 26;

export function DustField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let frame: number | null = null;
    let last = performance.now();
    const motes: Mote[] = [];

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ambient = (spawnAnywhere: boolean): Mote => ({
      x: Math.random() * w,
      y: spawnAnywhere ? Math.random() * h : h + 10,
      vx: (Math.random() - 0.5) * 6,
      vy: -(4 + Math.random() * 10),
      r: 0.6 + Math.random() * 1.6,
      life: spawnAnywhere ? Math.random() * 20 : 0,
      max: 18 + Math.random() * 16,
      color: PIGMENTS[Math.floor(Math.random() * 3)],
      burst: false,
    });

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        m.life += dt;
        if (m.burst) {
          m.vy += 60 * dt; // pigment is heavy; it settles
          m.vx *= 1 - 1.6 * dt;
          m.vy *= 1 - 1.2 * dt;
        } else {
          m.vx += Math.sin((m.life + i) * 0.7) * 2 * dt; // lazy courtyard air
        }
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        const t = m.life / m.max;
        if (t >= 1 || m.y < -20 || m.x < -20 || m.x > w + 20) {
          if (m.burst) motes.splice(i, 1);
          else motes[i] = ambient(false);
          continue;
        }
        // fade in, hold, fade out
        const alpha = m.burst ? 1 - t : Math.min(1, t * 4) * Math.min(1, (1 - t) * 3) * 0.32;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const hasWork = motes.length > 0;
      frame = hasWork && !document.hidden ? requestAnimationFrame(tick) : null;
      canvas.dataset.animationActive = String(frame !== null);
    };

    const start = () => {
      if (frame !== null || document.hidden || motes.length === 0) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        canvas.dataset.animationActive = 'false';
      } else {
        start();
      }
    };

    resize();
    if (!reduced) {
      for (let i = 0; i < AMBIENT_COUNT; i++) motes.push(ambient(true));
    }

    setDustEmitter((x, y, strength = 1) => {
      const count = Math.round((reduced ? 10 : 34) * strength);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = (reduced ? 30 : 70) + Math.random() * 140 * strength;
        motes.push({
          x: x + Math.cos(a) * 12,
          y: y + Math.sin(a) * 12,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 40,
          r: 0.8 + Math.random() * 2.2,
          life: 0,
          max: 0.9 + Math.random() * 0.9,
          color: PIGMENTS[Math.floor(Math.random() * PIGMENTS.length)],
          burst: true,
        });
      }
      start();
    });

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      setDustEmitter(null);
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="dust-field" aria-hidden="true" />;
}
