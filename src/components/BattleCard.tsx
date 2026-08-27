import React, { useState } from 'react';
import type { BlockCard } from '../data/blocks';
import type { Stat } from '../game/types';
import { soundEngine } from '../utils/soundEngine';
import './BattleCard.css';

interface BattleCardProps {
  card: BlockCard;
  isRevealed: boolean;
  isWinner?: boolean;
  highlightStat?: Stat | null;
  playerName?: string;
  animationDelay?: number;
  size?: 'normal' | 'compact' | 'large';
  interactive?: boolean;
}

export const BattleCard: React.FC<BattleCardProps> = ({
  card,
  isRevealed,
  isWinner = false,
  highlightStat = null,
  playerName,
  animationDelay = 0,
  size = 'normal',
  interactive = true,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getComplexityLabel = (val: number) => {
    switch (val) {
      case 1: return 'LOW';
      case 2: return 'MODERATE';
      case 3: return 'MODERATE +';
      case 4: return 'INTENSE';
      case 5: return 'INTENSE +';
      default: return `${val}`;
    }
  };

  const getRarityLabel = (val: number) => {
    switch (val) {
      case 1: return 'COMMON (1)';
      case 3: return 'RARE (3)';
      case 5: return 'LIMITED (5)';
      default: return `${val}`;
    }
  };

  const getSymmetryLabel = (val?: number) => {
    switch (val) {
      case 1: return 'Linear Translation';
      case 2: return 'Mirror Symmetry';
      case 3: return 'C2 Rotational';
      case 4: return 'C4 Rotational';
      case 5: return 'C4 + D4 Pinwheel';
      default: return 'Standard Order';
    }
  };

  const getStructuralLabel = (val?: number) => {
    switch (val) {
      case 2: return 'Ornamental Skin';
      case 3: return 'Hybrid Vector';
      case 5: return 'Structural Frame';
      default: return 'Architectural Element';
    }
  };

  const getStatCalloutIcon = (stat: Stat) => {
    switch (stat) {
      case 'complexity': return '◆';
      case 'rarity': return '★';
      case 'symmetryPower': return '❖';
      case 'structuralWeight': return '▲';
    }
  };

  const getStatCalloutLabel = (stat: Stat) => {
    switch (stat) {
      case 'complexity': return 'COMPLEXITY';
      case 'rarity': return 'RARITY GRADE';
      case 'symmetryPower': return 'SYMMETRY';
      case 'structuralWeight': return 'STRUCTURAL';
    }
  };

  const getStatCalloutValue = (stat: Stat) => {
    switch (stat) {
      case 'complexity':
        return `${card.complexity} · ${getComplexityLabel(card.complexity)}`;
      case 'rarity':
        return `${card.rarity} · ${getRarityLabel(card.rarity)}`;
      case 'symmetryPower':
        return `${card.symmetryPower ?? 3} · ${getSymmetryLabel(card.symmetryPower)}`;
      case 'structuralWeight':
        return `${card.structuralWeight ?? 3} · ${getStructuralLabel(card.structuralWeight)}`;
    }
  };

  return (
    <>
      <div
        className={`battle-card battle-card--${size} ${isRevealed ? 'revealed' : ''} ${
          isWinner ? 'winner' : ''
        } ${interactive ? 'interactive' : ''}`}
        style={{ animationDelay: `${animationDelay}ms` } as React.CSSProperties}
      >
        <div className="battle-card__inner">
          {/* Back Face */}
          <div className="battle-card__face battle-card__back">
            <img
              src={`/cards/${card.id}_back.png`}
              alt={`${card.name} Back`}
              className="battle-card__image"
              loading="eager"
            />
            {playerName && (
              <div className="battle-card__player-tag">
                <span className="battle-card__player-dot" />
                <span className="battle-card__player-name">{playerName}</span>
              </div>
            )}
          </div>

          {/* Front Face */}
          <div className="battle-card__face battle-card__front">
            <img
              src={`/cards/${card.id}_front.png`}
              alt={`${card.name} Front`}
              className="battle-card__image"
              loading="eager"
            />

            {/* Architectural Stat Highlight Badge (when stat is called) */}
            {highlightStat && (
              <div className={`battle-card__stat-callout battle-card__stat-callout--${highlightStat}`}>
                <div className="battle-card__stat-header">
                  <span className="battle-card__stat-icon">
                    {getStatCalloutIcon(highlightStat)}
                  </span>
                  <span className="battle-card__stat-name">
                    {getStatCalloutLabel(highlightStat)}
                  </span>
                </div>
                <div className="battle-card__stat-value">
                  {getStatCalloutValue(highlightStat)}
                </div>
              </div>
            )}

            {/* Winner Badge Stamp */}
            {isWinner && (
              <div className="battle-card__winner-stamp">
                <span>ROUND WINNER</span>
              </div>
            )}

            {/* Inspect / Zoom Button */}
            {interactive && (
              <button
                type="button"
                className="battle-card__inspect-btn"
                title="Inspect Card Details"
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playStatSelect();
                  setShowModal(true);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Inspection Modal */}
      {showModal && (
        <div className="battle-card__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="battle-card__modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="battle-card__modal-close"
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="battle-card__modal-grid">
              <div className="battle-card__modal-visual">
                <img
                  src={`/cards/${card.id}_front.png`}
                  alt={card.name}
                  className="battle-card__modal-image"
                />
              </div>

              <div className="battle-card__modal-details">
                <div className="battle-card__modal-meta">
                  <span className="battle-card__modal-id">BLOCK #{String(card.id).padStart(2, '0')}</span>
                  <span className="battle-card__modal-category">{card.category}</span>
                </div>

                <h2 className="battle-card__modal-title">{card.name}</h2>

                <div className="battle-card__modal-stats">
                  {/* Complexity */}
                  <div className="battle-card__modal-stat-box">
                    <span className="battle-card__modal-stat-label">COMPLEXITY</span>
                    <div className="battle-card__modal-stat-val">
                      <span className="battle-card__modal-stat-num">{card.complexity}</span>
                      <span className="battle-card__modal-stat-sub">/ 5 · {getComplexityLabel(card.complexity)}</span>
                    </div>
                    <div className="battle-card__modal-meter">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`battle-card__modal-meter-seg ${lvl <= card.complexity ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Rarity */}
                  <div className="battle-card__modal-stat-box">
                    <span className="battle-card__modal-stat-label">RARITY GRADE</span>
                    <div className="battle-card__modal-stat-val">
                      <span className="battle-card__modal-stat-num">{card.rarity}</span>
                      <span className="battle-card__modal-stat-sub">{getRarityLabel(card.rarity)}</span>
                    </div>
                    <div className="battle-card__modal-meter">
                      {[1, 3, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`battle-card__modal-meter-seg battle-card__modal-meter-seg--rarity ${
                            lvl <= card.rarity ? 'active' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Symmetry Power */}
                  <div className="battle-card__modal-stat-box">
                    <span className="battle-card__modal-stat-label">SYMMETRY POWER</span>
                    <div className="battle-card__modal-stat-val">
                      <span className="battle-card__modal-stat-num">{card.symmetryPower ?? 3}</span>
                      <span className="battle-card__modal-stat-sub">/ 5 · {getSymmetryLabel(card.symmetryPower)}</span>
                    </div>
                    <div className="battle-card__modal-meter">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`battle-card__modal-meter-seg battle-card__modal-meter-seg--symmetry ${
                            lvl <= (card.symmetryPower ?? 3) ? 'active' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Structural Weight */}
                  <div className="battle-card__modal-stat-box">
                    <span className="battle-card__modal-stat-label">STRUCTURAL WEIGHT</span>
                    <div className="battle-card__modal-stat-val">
                      <span className="battle-card__modal-stat-num">{card.structuralWeight ?? 3}</span>
                      <span className="battle-card__modal-stat-sub">{getStructuralLabel(card.structuralWeight)}</span>
                    </div>
                    <div className="battle-card__modal-meter">
                      {[2, 3, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`battle-card__modal-meter-seg battle-card__modal-meter-seg--structure ${
                            lvl <= (card.structuralWeight ?? 3) ? 'active' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="battle-card__modal-taxonomy">
                  {card.mechanics && (
                    <div className="battle-card__modal-spec">
                      <span className="battle-card__modal-spec-label">MECHANIC:</span>
                      <span className="battle-card__modal-spec-val">{card.mechanics}</span>
                    </div>
                  )}
                  {card.role && (
                    <div className="battle-card__modal-spec">
                      <span className="battle-card__modal-spec-label">WALL ROLE:</span>
                      <span className="battle-card__modal-spec-val">{card.role}</span>
                    </div>
                  )}
                  <p className="battle-card__modal-desc">
                    Authentic 40-Block Pattern Taxonomy plate from the <strong>Litema Architecture Archive</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
