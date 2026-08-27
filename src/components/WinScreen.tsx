import React, { useEffect } from 'react';
import type { Player } from '../game/types';
import { soundEngine } from '../utils/soundEngine';
import './WinScreen.css';

interface WinScreenProps {
  winnerId: string | null;
  players: Player[];
  isTiedVictory: boolean;
  currentRound: number;
  onPlayAgain: () => void;
  onReset?: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({
  winnerId,
  players,
  isTiedVictory,
  currentRound,
  onPlayAgain,
  onReset,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.stack.length - a.stack.length);
  const totalCards = players.reduce((sum, p) => sum + p.stack.length, 0);

  // Play triumph fanfare
  useEffect(() => {
    soundEngine.playVictory();
  }, []);

  const topCount = sortedPlayers[0]?.stack.length ?? 0;
  const winner = players.find((p) => p.id === winnerId) || sortedPlayers[0];
  const tiedWinners = isTiedVictory
    ? sortedPlayers.filter((p) => p.stack.length === topCount)
    : [];

  return (
    <div className="win-screen">
      <div className="win-screen__backdrop" />

      <div className="win-screen__modal">
        {/* Top Spine Crease / Monograph Header Accent */}
        <div className="win-screen__plinth-top" />

        {/* Victory Emblem */}
        <div className="win-screen__emblem-wrap">
          <div className="win-screen__emblem-glow" />
          <div className="win-screen__emblem">
            <svg width="44" height="44" viewBox="0 0 80 80" fill="none">
              <polygon
                points="40,6 50,26 72,28 56,44 60,66 40,56 20,66 24,44 8,28 30,26"
                fill="var(--accent-gold)"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <circle cx="40" cy="40" r="12" fill="#ffffff" opacity="0.9" />
              <polygon
                points="40,24 45,34 56,35 48,43 50,54 40,49 30,54 32,43 24,35 35,34"
                fill="var(--accent-gold)"
              />
            </svg>
          </div>
        </div>

        {/* Header Metadata */}
        <div className="win-screen__header">
          <div className="win-screen__meta-tag">
            <span>TOURNAMENT RESULT</span>
            <span className="win-screen__meta-dot">•</span>
            <span>ROUND {currentRound}</span>
          </div>

          <h1 className="win-screen__title">
            {isTiedVictory
              ? 'Shared Victory!'
              : `${winner?.name || 'Player'} Triumphs!`}
          </h1>

          <p className="win-screen__subtitle">
            {isTiedVictory
              ? `${tiedWinners.map((p) => p.name).join(' & ')} tied with ${topCount} cards`
              : `Mastered the 40-Block Taxonomy with ${winner?.stack.length} cards across ${currentRound} rounds`}
          </p>
        </div>

        {/* Tactical Key Metrics */}
        <div className="win-screen__metrics">
          <div className="win-screen__metric-card">
            <span className="win-screen__metric-label">CARDS CAPTURED</span>
            <div className="win-screen__metric-val">
              <span className="win-screen__metric-num">{winner?.stack.length || 0}</span>
              <span className="win-screen__metric-denom">/ {totalCards}</span>
            </div>
            <div className="win-screen__metric-bar">
              <div
                className="win-screen__metric-fill"
                style={{
                  width: `${totalCards > 0 ? ((winner?.stack.length || 0) / totalCards) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="win-screen__metric-card">
            <span className="win-screen__metric-label">TOTAL ROUNDS</span>
            <div className="win-screen__metric-val">
              <span className="win-screen__metric-num">{currentRound}</span>
              <span className="win-screen__metric-denom">Duels</span>
            </div>
            <span className="win-screen__metric-note">Taxonomy Completed</span>
          </div>
        </div>

        {/* Architectural Standings Board */}
        <div className="win-screen__standings">
          <div className="win-screen__standings-header">
            <span className="win-screen__standings-title">FINAL STANDINGS</span>
            <span className="win-screen__standings-count">{sortedPlayers.length} PLAYERS</span>
          </div>

          <div className="win-screen__standings-list">
            {sortedPlayers.map((player, index) => {
              const isPlayerWinner = isTiedVictory
                ? tiedWinners.some((p) => p.id === player.id)
                : player.id === winner?.id;

              const percent = totalCards > 0 ? Math.round((player.stack.length / totalCards) * 100) : 0;

              return (
                <div
                  key={player.id}
                  className={`win-screen__player-row ${
                    isPlayerWinner ? 'win-screen__player-row--winner' : ''
                  }`}
                >
                  <div className="win-screen__player-rank">
                    {isPlayerWinner ? (
                      <span className="win-screen__crown">★</span>
                    ) : (
                      <span>#{index + 1}</span>
                    )}
                  </div>

                  <div className="win-screen__player-info">
                    <div className="win-screen__player-name-row">
                      <span className="win-screen__player-name">{player.name}</span>
                      {player.isAi && (
                        <span className="win-screen__ai-pill">AI</span>
                      )}
                      {isPlayerWinner && (
                        <span className="win-screen__winner-pill">CHAMPION</span>
                      )}
                      {player.isEliminated && !isPlayerWinner && (
                        <span className="win-screen__elim-pill">OUT</span>
                      )}
                    </div>
                    <div className="win-screen__player-subtrack">
                      <div className="win-screen__player-track">
                        <div
                          className="win-screen__player-fill"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="win-screen__player-pct">{percent}%</span>
                    </div>
                  </div>

                  <div className="win-screen__player-score">
                    <span className="win-screen__score-num">{player.stack.length}</span>
                    <span className="win-screen__score-label">cards</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="win-screen__actions">
          <button
            type="button"
            className="win-screen__play-again-btn"
            onClick={() => {
              soundEngine.playCardDeal();
              onPlayAgain();
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>Play Again</span>
          </button>

          {onReset && (
            <button
              type="button"
              className="win-screen__reset-btn"
              onClick={() => {
                soundEngine.playStatSelect();
                onReset();
              }}
            >
              <span>New Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
