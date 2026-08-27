import React from 'react';
import './GameMatrix.css';

interface GameMatrixProps {
  children?: React.ReactNode;
}

export const GameMatrix: React.FC<GameMatrixProps> = ({ children }) => {
  // A 5x5 grid layout with 16 perimeter embossed tiles and 1 center elevated plinth
  const perimeterTiles = Array.from({ length: 16 });

  return (
    <div className="game-matrix-wrapper">
      <div className="game-matrix-board">
        {/* Central 3x3 elevated folio plinth */}
        <div className="game-matrix__center-slab">
          <div className="game-matrix__slab-seam" />
          <div className="game-matrix__slab-content">
            {children}
          </div>
        </div>

        {/* 16 perimeter embossed tiles */}
        {perimeterTiles.map((_, i) => (
          <div 
            key={i} 
            className={`game-matrix__tile game-matrix__tile--${i}`}
            data-tile-index={i}
          >
            <div className="game-matrix__tile-inner" />
          </div>
        ))}
      </div>
    </div>
  );
};
