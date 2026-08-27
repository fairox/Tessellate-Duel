import React from 'react';
import type { Player } from '../game/types';
import './PlayerStack.css';

interface PlayerStackProps {
  player: Player;
  isLeader: boolean;
  position: 'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  targetCount?: number;
}

export const PlayerStack: React.FC<PlayerStackProps> = ({
  player,
  isLeader,
  position,
  targetCount,
}) => {
  const percent = targetCount && targetCount > 0 ? Math.min(100, Math.round((player.stack.length / targetCount) * 100)) : 0;

  return (
    <div
      className={`player-stack player-stack--${position} ${
        isLeader ? 'player-stack--leader' : ''
      } ${player.isEliminated ? 'player-stack--eliminated' : ''}`}
    >
      <div className="player-stack__deck-wrapper">
        {/* Layered physical card stack */}
        <div className="player-stack__deck">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="player-stack__card-layer"
              style={{
                transform: `translateY(${-i * 3}px) rotate(${(i - 1) * 2.5}deg)`,
                opacity: player.stack.length > i ? 1 : 0.2,
                zIndex: i,
              }}
            >
              <div className="player-stack__card-motif" />
            </div>
          ))}
        </div>

        <span className="player-stack__count-badge">
          {player.isEliminated ? '0' : player.stack.length}
        </span>
      </div>

      <div className="player-stack__meta">
        <div className="player-stack__header">
          <span className="player-stack__name">{player.name}</span>
          {player.isAi && (
            <span className="player-stack__ai-tag" title="AI Bot Opponent">AI</span>
          )}
          {isLeader && !player.isEliminated && (
            <span className="player-stack__lead-tag">LEAD</span>
          )}
        </div>

        <div className="player-stack__sub-row">
          <span className="player-stack__status">
            {player.isEliminated ? 'Eliminated' : `${player.stack.length} ${player.stack.length === 1 ? 'card' : 'cards'}`}
          </span>
          {targetCount && !player.isEliminated && (
            <span className="player-stack__target-label">
              Goal: {targetCount}
            </span>
          )}
        </div>

        {targetCount && !player.isEliminated && (
          <div className="player-stack__progress-track" title={`${player.stack.length} / ${targetCount} cards (${percent}%)`}>
            <div
              className="player-stack__progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
