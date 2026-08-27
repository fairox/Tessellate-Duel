import { useReducer, useCallback, useEffect, useState } from 'react';
import { BLOCKS } from './data/blocks';
import type { BlockCard } from './data/blocks';
import { gameReducer, INITIAL_STATE } from './game/reducer';
import type { Stat, GameSettings } from './game/types';
import { chooseAiStat, getSprintThreshold, type PlayerSetupOption } from './game/engine';
import { soundEngine } from './utils/soundEngine';
import { SetupScreen } from './components/SetupScreen';
import { PlayerStack } from './components/PlayerStack';
import { BattleCard } from './components/BattleCard';
import { StatCallPanel } from './components/StatCallPanel';
import { ResonancePile } from './components/ResonancePile';
import { RoundLog } from './components/RoundLog';
import { QuarryPile } from './components/QuarryPile';
import { WinScreen } from './components/WinScreen';
import { RulebookModal } from './components/RulebookModal';
import { GameMatrix } from './components/GameMatrix';
import { DigitalArenaClock } from './components/DigitalArenaClock';
import './App.css';

const PLAYER_POSITIONS_2 = ['left', 'right'] as const;
const PLAYER_POSITIONS_3 = ['left', 'right', 'top'] as const;
const PLAYER_POSITIONS_4 = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

function getPlayerPositions(count: number) {
  switch (count) {
    case 2: return PLAYER_POSITIONS_2;
    case 3: return PLAYER_POSITIONS_3;
    case 4: return PLAYER_POSITIONS_4;
    default: return PLAYER_POSITIONS_2;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [showPassScreen, setShowPassScreen] = useState(false);
  const [revealTimeout, setRevealTimeout] = useState(false);
  const [showRulebook, setShowRulebook] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  // ─── Callbacks ────────────────────────────────────────────

  const handleStart = useCallback((playerConfigs: PlayerSetupOption[], settings: GameSettings) => {
    setAutoAdvance(settings.autoAdvance ?? true);
    soundEngine.playCardDeal();
    dispatch({ type: 'START_GAME', playerConfigs, cards: BLOCKS, settings });
  }, []);

  const handleCallStat = useCallback((stat: Stat) => {
    soundEngine.playStatSelect();
    soundEngine.playCardFlip();
    dispatch({ type: 'CALL_STAT', stat });
    setRevealTimeout(true);
  }, []);

  const handleAdvanceNow = useCallback(() => {
    soundEngine.playCardDeal();
    setShowPassScreen(false);
    dispatch({ type: 'ADVANCE_ROUND' });
  }, []);

  const handlePlayAgain = useCallback(() => {
    soundEngine.playCardDeal();
    dispatch({ type: 'PLAY_AGAIN', cards: BLOCKS });
    setShowPassScreen(false);
    setRevealTimeout(false);
  }, []);

  const handleReset = useCallback(() => {
    soundEngine.playStatSelect();
    dispatch({ type: 'RESET_GAME' });
    setShowPassScreen(false);
    setRevealTimeout(false);
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  // ─── AI Turn Execution ────────────────────────────────────

  useEffect(() => {
    if (state.phase !== 'stat-call' || showPassScreen) return;

    const leadPlayer = state.players.find((p) => p.id === state.leadPlayerId);
    if (leadPlayer && leadPlayer.isAi && leadPlayer.stack.length > 0) {
      const bestStat = chooseAiStat(leadPlayer.stack[0], state.settings.statMode ?? 'standard');
      const timer = setTimeout(() => {
        handleCallStat(bestStat);
      }, 1400);

      return () => clearTimeout(timer);
    }
  }, [state.phase, state.leadPlayerId, state.players, state.settings.statMode, showPassScreen, handleCallStat]);

  // ─── Auto-advance: reveal-off ─────────────────────────────

  useEffect(() => {
    if (state.phase === 'reveal-off') {
      const timer = setTimeout(() => {
        soundEngine.playCardDeal();
        dispatch({ type: 'COMPLETE_REVEAL_OFF' });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // ─── Auto-advance: revealing → resolve ────────────────────

  useEffect(() => {
    if (state.phase === 'revealing' && revealTimeout) {
      const timer = setTimeout(() => {
        dispatch({ type: 'RESOLVE_ROUND' });
        setRevealTimeout(false);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [state.phase, revealTimeout]);

  // ─── Sound on Phase Changes ──────────────────────────────

  useEffect(() => {
    if (state.phase === 'resonance') {
      soundEngine.playResonance();
      const timer = setTimeout(() => {
        dispatch({ type: 'RESOLVE_RESONANCE' });
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.resonancePile.length]);

  useEffect(() => {
    if (state.phase === 'round-result') {
      soundEngine.playCardCapture();
    }
  }, [state.phase, state.currentRound]);

  // ─── Round Result → Auto-Advance OR Show Pass Screen ──────

  useEffect(() => {
    if (state.phase === 'round-result') {
      const nextLead = state.players.find((p) => p.id === state.leadPlayerId);
      const isNextLeadAi = nextLead?.isAi ?? false;

      if (autoAdvance || isNextLeadAi) {
        // Automatically transition directly to next round's stat-call
        const timer = setTimeout(() => {
          dispatch({ type: 'ADVANCE_ROUND' });
        }, 2400);
        return () => clearTimeout(timer);
      } else if (!showPassScreen) {
        // Show manual hot-seat pass modal
        const timer = setTimeout(() => {
          setShowPassScreen(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    }
  }, [state.phase, state.currentRound, state.leadPlayerId, state.players, autoAdvance, showPassScreen]);

  // ─── Keyboard Shortcuts ───────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing inside input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        setShowRulebook((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowRulebook(false);
        setShowPassScreen(false);
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        if (showPassScreen) {
          e.preventDefault();
          setShowPassScreen(false);
          dispatch({ type: 'ADVANCE_ROUND' });
          return;
        }
        if (state.phase === 'round-result') {
          e.preventDefault();
          handleAdvanceNow();
          return;
        }
      }

      // Stat Calling keys (1, 2, 3, 4)
      if (state.phase === 'stat-call' && !showPassScreen) {
        const lead = state.players.find((p) => p.id === state.leadPlayerId);
        if (lead && !lead.isAi) {
          if (e.key === '1') {
            handleCallStat('complexity');
          } else if (e.key === '2') {
            handleCallStat('rarity');
          } else if (e.key === '3' && state.settings.statMode === 'advanced') {
            handleCallStat('symmetryPower');
          } else if (e.key === '4' && state.settings.statMode === 'advanced') {
            handleCallStat('structuralWeight');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, state.leadPlayerId, state.players, state.settings.statMode, showPassScreen, handleAdvanceNow, handleCallStat, handleToggleMute]);

  // ─── Dismiss pass screen ──────────────────────────────────

  const handleDismissPass = useCallback(() => {
    setShowPassScreen(false);
    dispatch({ type: 'ADVANCE_ROUND' });
  }, []);

  // ─── Render ───────────────────────────────────────────────

  if (state.phase === 'setup') {
    return <SetupScreen onStart={handleStart} />;
  }

  const positions = getPlayerPositions(state.players.length);
  const leadPlayer = state.players.find((p) => p.id === state.leadPlayerId);
  const targetThreshold =
    state.settings.gameMode === 'sprint'
      ? getSprintThreshold(state.players.length)
      : 40 - state.quarry.length;

  // Find the winner of the current round for highlighting
  const roundWinnerId =
    state.phase === 'round-result' || state.phase === 'revealing'
      ? (() => {
          if (!state.calledStat || state.revealedCards.length === 0) return null;
          const maxVal = Math.max(...state.revealedCards.map((r) => r.card[state.calledStat!]));
          const winners = state.revealedCards.filter((r) => r.card[state.calledStat!] === maxVal);
          return winners.length === 1 ? winners[0].playerId : null;
        })()
      : null;

  // Compute table cards
  interface TableCardItem {
    playerId: string;
    name: string;
    card: BlockCard;
    isRevealed: boolean;
    isWinner: boolean;
    highlightStat?: Stat | null;
  }

  let tableCards: TableCardItem[] = [];

  if (state.phase === 'stat-call' && !showPassScreen) {
    tableCards = state.players
      .filter((p) => !p.isEliminated && p.stack.length > 0)
      .map((p) => ({
        playerId: p.id,
        name: p.name,
        card: p.stack[0],
        isRevealed: p.id === state.leadPlayerId && !p.isAi, // Human lead sees card, opponent/AI hidden
        isWinner: false,
        highlightStat: null,
      }));
  } else if (
    state.phase === 'revealing' ||
    state.phase === 'round-result' ||
    state.phase === 'resonance'
  ) {
    tableCards = state.revealedCards.map((rc) => ({
      playerId: rc.playerId,
      name: state.players.find((p) => p.id === rc.playerId)?.name || '',
      card: rc.card,
      isRevealed: true,
      isWinner: rc.playerId === roundWinnerId && state.phase === 'round-result',
      highlightStat: state.calledStat,
    }));
  }

  return (
    <div className="app">
      {/* Background Matrix Pattern */}
      <GameMatrix />

      {/* Header */}
      <header className="app__header">
        <div className="app__title">
          <span className="app__title-main">TESSELLATE DUEL</span>
          <span className="app__title-badge">
            {state.settings.statMode === 'advanced' ? '4-STAT ADVANCED' : 'LITEMA TAXONOMY'}
          </span>
          <span className="app__title-round">
            {state.phase !== 'reveal-off' ? `ROUND ${state.currentRound}` : 'REVEAL-OFF'}
          </span>
        </div>

        {/* ─── Center Digital Arena LED Clock Plinth ───────── */}
        <div className="app__header-clock-center">
          <DigitalArenaClock
            currentRound={state.currentRound}
            phase={state.phase}
            totalCards={40 - state.quarry.length}
            isLeadTurn={state.phase === 'stat-call'}
          />
        </div>

        <div className="app__header-meta">
          {/* Sound Toggle Button */}
          <button
            type="button"
            className={`app__header-btn app__header-btn--sound ${isMuted ? 'muted' : 'active'}`}
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound (Press M)' : 'Mute Sound (Press M)'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Auto-Advance Toggle Pill */}
          <button
            type="button"
            className={`app__header-btn app__header-btn--autoadvance ${autoAdvance ? 'active' : ''}`}
            onClick={() => setAutoAdvance((prev) => !prev)}
            title={autoAdvance ? 'Auto-Advance active' : 'Manual Pause active'}
          >
            <span>{autoAdvance ? '⚡ Auto' : '✋ Pause'}</span>
          </button>

          <button
            type="button"
            className="app__header-btn"
            onClick={() => setShowRulebook(true)}
            title="Open Rulebook (Press R)"
          >
            Rules
          </button>

          <button
            type="button"
            className="app__header-btn app__header-btn--reset"
            onClick={handleReset}
            title="Reset match and return to opening setup page"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '5px' }}
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            <span>Reset</span>
          </button>

          <QuarryPile cardCount={state.quarry.length} />
        </div>
      </header>

      {/* Main 3-Column Arena Grid */}
      <main className="app__arena-grid">
        {/* ─── TOP LEFT: Battle Log & Resonance Pile ─────── */}
        <aside className="app__column app__column--left">
          <RoundLog entries={state.roundLog} />

          {(state.phase === 'resonance' || state.resonancePile.length > 0) && (
            <ResonancePile
              cardCount={state.resonancePile.length}
              isActive={state.phase === 'resonance'}
            />
          )}
        </aside>

        {/* ─── CENTER: Matrix Arena Canvas (Centered Battle Cards) ─── */}
        <section className="app__column app__column--center">
          {/* Player stacks with Target threshold meter */}
          <div className="app__players">
            {state.players.map((player, i) => (
              <PlayerStack
                key={player.id}
                player={player}
                isLeader={player.id === state.leadPlayerId}
                position={positions[i] as any}
                targetCount={targetThreshold}
              />
            ))}
          </div>

          {/* Reveal-off phase */}
          {state.phase === 'reveal-off' && (
            <div className="app__reveal-off">
              <div className="app__reveal-off-spinner" />
              <p className="app__reveal-off-text">Determining Starting Lead Player…</p>
            </div>
          )}

          {/* Elevated Battle Arena Canvas */}
          <div className="app__arena-canvas">
            <div className="app__canvas-seam" />

            {state.calledStat && (
              <div className="app__battle-status-bar">
                <span className="app__battle-status-tag">ACTIVE CONFLICT</span>
                <span className="app__battle-status-stat">
                  CALL: <strong>{state.calledStat.toUpperCase()}</strong>
                </span>
              </div>
            )}

            {/* Resonance Tie Alert */}
            {state.phase === 'resonance' && (
              <div className="app__resonance-banner">
                <span className="app__resonance-beacon" />
                <span>⚡ PATTERN RESONANCE TIE! ACCUMULATING STAKES…</span>
              </div>
            )}

            {tableCards.length > 0 ? (
              <div className="app__table-cards-row">
                {tableCards.map((tc, i) => {
                  const isLead = tc.playerId === state.leadPlayerId;
                  return (
                    <div
                      key={tc.playerId}
                      className={`app__table-slot ${
                        isLead ? 'app__table-slot--active' : 'app__table-slot--opponent'
                      }`}
                    >
                      <div className="app__table-owner-badge">
                        <span className="app__table-owner-dot" />
                        <span className="app__table-owner">{tc.name}</span>
                      </div>

                      <BattleCard
                        card={tc.card}
                        isRevealed={tc.isRevealed}
                        isWinner={tc.isWinner}
                        highlightStat={tc.highlightStat}
                        animationDelay={i * 80}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="app__table-placeholder">
                <div className="app__table-placeholder-card" />
                <span className="app__table-placeholder-text">Awaiting Battle Cards…</span>
              </div>
            )}

            {/* Quick Action Button in Round Result Phase */}
            {state.phase === 'round-result' && (
              <div className="app__round-result-action">
                <button
                  type="button"
                  className="app__continue-btn"
                  onClick={handleAdvanceNow}
                  title="Advance to next round immediately (Press Space)"
                >
                  <span>Next Round</span>
                  <kbd className="app__kbd-hint">SPACE</kbd>
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── TOP RIGHT: Lead Call Controls & Status ────── */}
        <aside className="app__column app__column--right">
          {state.phase === 'stat-call' && !showPassScreen && leadPlayer ? (
            <div className="app__stat-call-container">
              <StatCallPanel
                leadPlayerName={leadPlayer.name}
                isLeadPlayer={true}
                isAiTurn={leadPlayer.isAi}
                statMode={state.settings.statMode ?? 'standard'}
                leadCard={leadPlayer.stack[0]}
                onCallStat={handleCallStat}
              />
            </div>
          ) : (
            <div className="app__lead-status-card">
              <div className="app__lead-status-header">
                <span className="app__lead-status-tag">ROUND LEADER</span>
                <span className="app__lead-status-name">{leadPlayer?.name || 'Player'}</span>
              </div>
              <p className="app__lead-status-desc">
                {state.phase === 'revealing' || state.phase === 'round-result'
                  ? `Called ${state.calledStat?.toUpperCase()} for this battle resolution.`
                  : state.phase === 'resonance'
                  ? 'Resonance Tie! Battle stat continues into sudden death tiebreak.'
                  : 'Leading the taxonomy duel this turn.'}
              </p>
            </div>
          )}
        </aside>
      </main>

      {/* Pass Screen (hot-seat interstitial if manual mode active) */}
      {showPassScreen && state.phase !== 'game-over' && (
        <div className="app__pass-screen" onClick={handleDismissPass}>
          <div className="app__pass-content">
            <span className="app__pass-tag">HOT SEAT ROTATION</span>
            <p className="app__pass-text">
              Pass device to <strong>{leadPlayer?.name}</strong>
            </p>
            <div className="app__pass-actions">
              <button className="app__pass-btn" onClick={handleDismissPass}>
                Ready for Round {state.currentRound + 1} (Space)
              </button>
              <button
                className="app__pass-btn app__pass-btn--subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoAdvance(true);
                  handleDismissPass();
                }}
              >
                ⚡ Switch to Auto-Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Screen */}
      {state.phase === 'game-over' && (
        <WinScreen
          winnerId={state.winnerId}
          players={state.players}
          isTiedVictory={state.isTiedVictory}
          currentRound={state.currentRound}
          onPlayAgain={handlePlayAgain}
          onReset={handleReset}
        />
      )}

      {/* Rulebook Modal */}
      {showRulebook && <RulebookModal onClose={() => setShowRulebook(false)} />}
    </div>
  );
}
