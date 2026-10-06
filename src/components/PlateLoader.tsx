import { useEffect, useState, type ReactNode } from 'react';
import { BLOCKS } from '../data/blocks';
import { allCardAssetUrls, preloadImages } from '../utils/cardAssets';
import './PlateLoader.css';

/** Never hold the player hostage to a slow network. */
const MAX_WAIT_MS = 9000;

/**
 * Presses all 40 plates (faces, backs, foil masks) into memory before the
 * table opens, so no flip ever reveals a blank face mid-duel.
 */
export function PlateLoader({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const finish = () => {
      if (cancelled) return;
      setProgress(1);
      setLeaving(true);
      setTimeout(() => !cancelled && setReady(true), 450);
    };
    const timeout = setTimeout(finish, MAX_WAIT_MS);
    preloadImages(allCardAssetUrls(BLOCKS), (loaded, total) => {
      if (!cancelled) setProgress(total ? loaded / total : 1);
    }).then(() => {
      clearTimeout(timeout);
      finish();
    });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  if (ready) return <>{children}</>;

  const pct = Math.round(progress * 100);
  const plates = Math.round(progress * 40);

  return (
    <div className={`plate-loader ${leaving ? 'plate-loader--leaving' : ''}`} role="status" aria-live="polite">
      <div className="plate-loader__mark" aria-hidden="true">
        {/* The game's own back-plate motif: rotated square inside a ring */}
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="44" />
          <rect x="29" y="29" width="62" height="62" transform="rotate(45 60 60)" />
          <rect x="39" y="39" width="42" height="42" className="plate-loader__accent" />
          <line x1="60" y1="8" x2="60" y2="112" />
          <line x1="8" y1="60" x2="112" y2="60" />
        </svg>
      </div>
      <p className="plate-loader__title">Tessellate Duel</p>
      <div className="plate-loader__row">
        <span>Pressing the plates</span>
        <span className="plate-loader__count">
          {String(plates).padStart(2, '0')} / 40
        </span>
      </div>
      <div className="plate-loader__track">
        <div className="plate-loader__fill" style={{ transform: `scaleX(${progress})` }} />
      </div>
      <span className="plate-loader__pct">{pct}%</span>
    </div>
  );
}
