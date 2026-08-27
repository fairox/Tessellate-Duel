import React from 'react';
import './QuarryPile.css';

interface QuarryPileProps {
  cardCount: number;
}

export const QuarryPile: React.FC<QuarryPileProps> = ({ cardCount }) => {
  return (
    <div className="quarry-pile" title="Used in Tessellation Fusion (Coming Soon)">
      <div className="quarry-pile__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <polygon points="12,6 18,9 18,15 12,18 6,15 6,9" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
        </svg>
      </div>
      <div className="quarry-pile__info">
        <span className="quarry-pile__label">Quarry</span>
        <span className="quarry-pile__count">{cardCount}</span>
      </div>
    </div>
  );
};
