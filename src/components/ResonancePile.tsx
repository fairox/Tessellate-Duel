import React from 'react';
import './ResonancePile.css';

interface ResonancePileProps {
  cardCount: number;
  isActive: boolean;
}

export const ResonancePile: React.FC<ResonancePileProps> = ({
  cardCount,
  isActive,
}) => {
  if (!isActive && cardCount === 0) return null;

  return (
    <div className={`resonance-pile ${isActive ? 'resonance-pile--active' : ''}`}>
      <div className="resonance-pile__glow" />
      <div className="resonance-pile__cards">
        {Array.from({ length: Math.min(cardCount, 6) }, (_, i) => (
          <div
            key={i}
            className="resonance-pile__card"
            style={{
              transform: `rotate(${(i - 2.5) * 8}deg) translateY(${-i * 2}px)`,
              zIndex: i,
            }}
          />
        ))}
      </div>
      <div className="resonance-pile__label">
        <span className="resonance-pile__title">Pattern Resonance!</span>
        <span className="resonance-pile__count">{cardCount} cards at stake</span>
      </div>
    </div>
  );
};
