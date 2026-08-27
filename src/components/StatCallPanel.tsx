import React, { useState, useEffect } from 'react';
import type { Stat, StatMode } from '../game/types';
import type { BlockCard } from '../data/blocks';
import { soundEngine } from '../utils/soundEngine';
import './StatCallPanel.css';

interface StatCallPanelProps {
  leadPlayerName: string;
  isLeadPlayer: boolean;
  isAiTurn?: boolean;
  statMode?: StatMode;
  onCallStat: (stat: Stat) => void;
  disabled?: boolean;
  leadCard?: BlockCard;
}

export const StatCallPanel: React.FC<StatCallPanelProps> = ({
  leadPlayerName,
  isLeadPlayer,
  isAiTurn = false,
  statMode = 'standard',
  onCallStat,
  disabled = false,
  leadCard,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    setTimeLeft(15);
  }, [leadPlayerName, isLeadPlayer]);

  useEffect(() => {
    if (!isLeadPlayer || disabled || isAiTurn) return;

    if (timeLeft <= 0) {
      onCallStat('complexity');
      return;
    }

    if (timeLeft <= 4) {
      soundEngine.playTick(true);
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isLeadPlayer, disabled, isAiTurn, onCallStat]);

  const handleSelectStat = (stat: Stat) => {
    soundEngine.playStatSelect();
    onCallStat(stat);
  };

  if (!isLeadPlayer) {
    return (
      <div className="stat-call-panel stat-call-panel--waiting">
        <div className="stat-call-panel__waiting-indicator">
          <span className="stat-call-panel__pulse-ring" />
          <span className="stat-call-panel__pulse-dot" />
        </div>
        <p className="stat-call-panel__waiting-text">
          Waiting for <strong>{leadPlayerName}</strong> to call a stat…
        </p>
      </div>
    );
  }

  if (isAiTurn) {
    return (
      <div className="stat-call-panel stat-call-panel--ai">
        <div className="stat-call-panel__ai-header">
          <span className="stat-call-panel__ai-badge">🤖 AI TACTICIAN</span>
          <span className="stat-call-panel__ai-name">{leadPlayerName}</span>
        </div>
        <div className="stat-call-panel__ai-thinking">
          <div className="stat-call-panel__ai-radar">
            <span className="stat-call-panel__ai-sweep" />
          </div>
          <p className="stat-call-panel__ai-msg">
            Evaluating taxonomy matrix & symmetry odds…
          </p>
        </div>
      </div>
    );
  }

  const complexityRating = leadCard?.complexity || 1;
  const rarityRating = leadCard?.rarity || 1;
  const symmetryRating = leadCard?.symmetryPower || 1;
  const structuralRating = leadCard?.structuralWeight || 2;

  const getComplexityLabel = (val: number) => {
    switch (val) {
      case 1: return 'LOW (1)';
      case 2: return 'MODERATE (2)';
      case 3: return 'MODERATE+ (3)';
      case 4: return 'INTENSE (4)';
      case 5: return 'INTENSE+ (5)';
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

  const getSymmetryLabel = (val: number) => {
    switch (val) {
      case 1: return 'TRANSLATION (1)';
      case 2: return 'MIRROR (2)';
      case 3: return 'C2 ROTATE (3)';
      case 4: return 'C4 ROTATE (4)';
      case 5: return 'C4+D4 PINWHEEL (5)';
      default: return `${val}`;
    }
  };

  const getStructuralLabel = (val: number) => {
    switch (val) {
      case 2: return 'SKIN / INFILL (2)';
      case 3: return 'HYBRID VECTOR (3)';
      case 5: return 'STRUCTURAL FRAME (5)';
      default: return `${val}`;
    }
  };

  return (
    <div className={`stat-call-panel ${statMode === 'advanced' ? 'stat-call-panel--advanced' : ''}`}>
      <div className="stat-call-panel__header">
        <div className="stat-call-panel__header-left">
          <span className="stat-call-panel__tag">LEAD CALL</span>
          {statMode === 'advanced' && (
            <span className="stat-call-panel__mode-tag">4 STATS</span>
          )}
        </div>
        <h3 className="stat-call-panel__prompt">Select Battle Stat</h3>
      </div>

      <div className="stat-call-panel__buttons">
        {/* Complexity Button */}
        <button
          type="button"
          className="stat-call-panel__btn stat-call-panel__btn--complexity"
          onClick={() => handleSelectStat('complexity')}
          disabled={disabled}
        >
          <div className="stat-call-panel__btn-header">
            <div className="stat-call-panel__btn-badge">
              <span className="stat-call-panel__btn-key">1</span>
              <span className="stat-call-panel__btn-icon">◆</span>
              <span className="stat-call-panel__btn-label">COMPLEXITY</span>
            </div>
            {leadCard && (
              <span className="stat-call-panel__btn-card-val">
                {complexityRating}/5
              </span>
            )}
          </div>

          <div className="stat-call-panel__btn-body">
            <div className="stat-call-panel__btn-meter">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`stat-call-panel__meter-bar ${
                    leadCard && lvl <= complexityRating ? 'active' : ''
                  }`}
                />
              ))}
            </div>
            <span className="stat-call-panel__btn-desc">
              {leadCard ? getComplexityLabel(complexityRating) : 'Range 1 – 5'}
            </span>
          </div>
        </button>

        {/* Rarity Button */}
        <button
          type="button"
          className="stat-call-panel__btn stat-call-panel__btn--rarity"
          onClick={() => handleSelectStat('rarity')}
          disabled={disabled}
        >
          <div className="stat-call-panel__btn-header">
            <div className="stat-call-panel__btn-badge">
              <span className="stat-call-panel__btn-key">2</span>
              <span className="stat-call-panel__btn-icon">★</span>
              <span className="stat-call-panel__btn-label">RARITY GRADE</span>
            </div>
            {leadCard && (
              <span className="stat-call-panel__btn-card-val">
                {rarityRating}/5
              </span>
            )}
          </div>

          <div className="stat-call-panel__btn-body">
            <div className="stat-call-panel__btn-meter">
              {[1, 3, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`stat-call-panel__meter-bar stat-call-panel__meter-bar--rarity ${
                    leadCard && lvl <= rarityRating ? 'active' : ''
                  }`}
                />
              ))}
            </div>
            <span className="stat-call-panel__btn-desc">
              {leadCard ? getRarityLabel(rarityRating) : 'Tier 1 · 3 · 5'}
            </span>
          </div>
        </button>

        {/* Advanced Mode: Symmetry Power */}
        {statMode === 'advanced' && (
          <button
            type="button"
            className="stat-call-panel__btn stat-call-panel__btn--symmetry"
            onClick={() => handleSelectStat('symmetryPower')}
            disabled={disabled}
          >
            <div className="stat-call-panel__btn-header">
              <div className="stat-call-panel__btn-badge">
                <span className="stat-call-panel__btn-key">3</span>
                <span className="stat-call-panel__btn-icon">❖</span>
                <span className="stat-call-panel__btn-label">SYMMETRY</span>
              </div>
              {leadCard && (
                <span className="stat-call-panel__btn-card-val">
                  {symmetryRating}/5
                </span>
              )}
            </div>

            <div className="stat-call-panel__btn-body">
              <div className="stat-call-panel__btn-meter">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`stat-call-panel__meter-bar stat-call-panel__meter-bar--symmetry ${
                      leadCard && lvl <= symmetryRating ? 'active' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="stat-call-panel__btn-desc">
                {leadCard ? getSymmetryLabel(symmetryRating) : 'Mechanic Order 1 – 5'}
              </span>
            </div>
          </button>
        )}

        {/* Advanced Mode: Structural Weight */}
        {statMode === 'advanced' && (
          <button
            type="button"
            className="stat-call-panel__btn stat-call-panel__btn--structure"
            onClick={() => handleSelectStat('structuralWeight')}
            disabled={disabled}
          >
            <div className="stat-call-panel__btn-header">
              <div className="stat-call-panel__btn-badge">
                <span className="stat-call-panel__btn-key">4</span>
                <span className="stat-call-panel__btn-icon">▲</span>
                <span className="stat-call-panel__btn-label">STRUCTURAL</span>
              </div>
              {leadCard && (
                <span className="stat-call-panel__btn-card-val">
                  {structuralRating}/5
                </span>
              )}
            </div>

            <div className="stat-call-panel__btn-body">
              <div className="stat-call-panel__btn-meter">
                {[2, 3, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`stat-call-panel__meter-bar stat-call-panel__meter-bar--structure ${
                      leadCard && lvl <= structuralRating ? 'active' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="stat-call-panel__btn-desc">
                {leadCard ? getStructuralLabel(structuralRating) : 'Assembly Role 2 · 3 · 5'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Precision Linear Rule Timer */}
      <div className="stat-call-panel__timer-wrapper">
        <div className="stat-call-panel__timer-track">
          <div
            className="stat-call-panel__timer-bar"
            style={{
              width: `${(timeLeft / 15) * 100}%`,
              backgroundColor:
                timeLeft <= 4 ? '#ff3b30' : timeLeft <= 8 ? '#ff9500' : 'var(--accent-orange)',
            }}
          />
        </div>
        <div className="stat-call-panel__timer-meta">
          <span className="stat-call-panel__timer-ticks">| · · · · | · · · · |</span>
          <span className="stat-call-panel__timer-text">{timeLeft}s remaining</span>
        </div>
      </div>
    </div>
  );
};
