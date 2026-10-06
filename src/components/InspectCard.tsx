import React, { useState } from 'react';
import type { BlockCard } from '../data/blocks';
import { useHoloTilt } from '../hooks/useHoloTilt';
import {
  archiveSerial,
  cardBack,
  cardFront,
  foilMaskCss,
  holoTier,
  TIER_LABEL,
} from '../utils/cardAssets';
import { soundEngine } from '../utils/soundEngine';
import { HoloLayers } from './HoloLayers';
import './InspectCard.css';

/**
 * The plate up close: tilt it under the light, tap to turn it over.
 * Follows device orientation on phones.
 */
export const InspectCard: React.FC<{ card: BlockCard }> = ({ card }) => {
  const [showBack, setShowBack] = useState(false);
  const tier = holoTier(card);
  const tiltRef = useHoloTilt<HTMLDivElement>({ maxTilt: 18, gyro: true });

  const flip = () => {
    soundEngine.playCardFlip();
    setShowBack((b) => !b);
  };

  return (
    <figure className="inspect-card">
      <figcaption className="inspect-card__plate-meta">
        <span className="inspect-card__archive">Litema Archive</span>
        <span className="inspect-card__serial">{archiveSerial(card.id)}</span>
      </figcaption>

      <div
        ref={tiltRef}
        className={`inspect-card__stage holo holo--${tier}`}
        style={{ '--foil-mask': foilMaskCss(card.id) } as React.CSSProperties}
        onClick={flip}
        role="button"
        tabIndex={0}
        aria-label={showBack ? 'Show front of plate' : 'Show back of plate'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flip();
          }
        }}
      >
        <div className="holo__shadow" />
        <div className="holo__tilt">
          <div className={`inspect-card__inner ${showBack ? 'is-back' : ''}`}>
            <div className="inspect-card__face inspect-card__face--front">
              <img src={cardFront(card.id)} alt={card.name} draggable={false} />
              <HoloLayers tier={tier} />
            </div>
            <div className="inspect-card__face inspect-card__face--back">
              <img src={cardBack(card.id)} alt={`${card.name} back`} draggable={false} />
              <HoloLayers tier="common" />
            </div>
          </div>
        </div>
      </div>

      <div className="inspect-card__finish">
        <span className={`inspect-card__finish-chip inspect-card__finish-chip--${tier}`}>
          {TIER_LABEL[tier]}
        </span>
        <span className="inspect-card__hint">Tilt to catch the light · tap to turn over</span>
      </div>
    </figure>
  );
};
