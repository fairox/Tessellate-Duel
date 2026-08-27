import type { BlockCard } from '../data/blocks';
import type { GameState, Stat, RevealedCard, GameSettings } from './types';
import {
  resolveRound,
  resolveResonance,
  applyRoundResult,
  checkWinCondition,
  resolveRevealOff,
  createLogEntry,
  createInitialState,
  type PlayerSetupOption,
} from './engine';

// ─── Action Types ─────────────────────────────────────────────

export type GameAction =
  | {
      type: 'START_GAME';
      playerConfigs: (string | PlayerSetupOption)[];
      cards: readonly BlockCard[];
      settings: GameSettings;
    }
  | { type: 'RESET_GAME' }
  | { type: 'COMPLETE_REVEAL_OFF' }
  | { type: 'CALL_STAT'; stat: Stat }
  | { type: 'RESOLVE_ROUND' }
  | { type: 'RESOLVE_RESONANCE' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'PLAY_AGAIN'; cards: readonly BlockCard[] }
  | { type: 'DISMISS_PASS_SCREEN' };

// ─── Reducer ──────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return createInitialState(action.playerConfigs, action.cards, action.settings);
    }

    case 'RESET_GAME': {
      return INITIAL_STATE;
    }

    case 'COMPLETE_REVEAL_OFF': {
      const result = resolveRevealOff(state.players);
      const leadPlayer = state.players.find((p) => p.id === result.leadPlayerId);
      const logMsg = `Reveal-off: ${result.reveals
        .map(
          (r) =>
            `${state.players.find((p) => p.id === r.playerId)?.name} flipped ${r.card.name} (Complexity ${r.card.complexity})`
        )
        .join(', ')}. ${leadPlayer?.name} takes lead!`;

      return {
        ...state,
        players: result.players,
        leadPlayerId: result.leadPlayerId,
        phase: 'stat-call',
        currentRound: 1,
        roundLog: [...state.roundLog, createLogEntry(0, logMsg)],
      };
    }

    case 'CALL_STAT': {
      const activePlayers = state.players.filter(
        (p) => !p.isEliminated && p.stack.length > 0
      );
      const revealedCards: RevealedCard[] = activePlayers.map((p) => ({
        playerId: p.id,
        card: p.stack[0],
      }));

      return {
        ...state,
        calledStat: action.stat,
        revealedCards,
        phase: 'revealing',
      };
    }

    case 'RESOLVE_ROUND': {
      if (!state.calledStat) return state;

      const result = resolveRound(state.players, state.calledStat);
      const callerName = state.players.find((p) => p.id === state.leadPlayerId)?.name;

      if (result.winnerId) {
        // Clear win — apply result
        const cardsWon = result.revealedCards.map((r) => r.card);
        const winnerName = state.players.find((p) => p.id === result.winnerId)?.name;
        const statValues = result.revealedCards
          .map((r) => {
            const pName = state.players.find((p) => p.id === r.playerId)?.name;
            return `${pName}: ${r.card[state.calledStat!]}`;
          })
          .join(', ');

        const statLabel =
          state.calledStat === 'complexity'
            ? 'Complexity'
            : state.calledStat === 'rarity'
            ? 'Rarity Grade'
            : state.calledStat === 'symmetryPower'
            ? 'Symmetry Power'
            : 'Structural Weight';

        const logMsg = `Round ${state.currentRound}: ${callerName} called ${statLabel} — ${winnerName} wins ${cardsWon.length} cards! (${statValues})`;

        const newState = applyRoundResult(state, result.winnerId, cardsWon);
        const winCheck = checkWinCondition(newState);

        if (winCheck.isGameOver) {
          return {
            ...newState,
            phase: 'game-over',
            winnerId: winCheck.winnerId,
            isTiedVictory: winCheck.isTiedVictory,
            roundLog: [...state.roundLog, createLogEntry(state.currentRound, logMsg)],
          };
        }

        return {
          ...newState,
          phase: 'round-result',
          roundLog: [...state.roundLog, createLogEntry(state.currentRound, logMsg)],
        };
      } else {
        // Tie — enter resonance
        const tiedNames = result.tiedPlayerIds
          .map((id) => state.players.find((p) => p.id === id)?.name)
          .join(' & ');
        const statVal = result.revealedCards[0]?.card[state.calledStat!];
        const logMsg = `Round ${state.currentRound}: Pattern Resonance! ${tiedNames} tied on ${state.calledStat} (${statVal}). Stakes accumulating!`;

        return {
          ...state,
          phase: 'resonance',
          tiedPlayerIds: result.tiedPlayerIds,
          resonancePile: result.resonancePile,
          roundLog: [...state.roundLog, createLogEntry(state.currentRound, logMsg)],
        };
      }
    }

    case 'RESOLVE_RESONANCE': {
      if (!state.calledStat || state.tiedPlayerIds.length === 0) return state;

      // Remove the already-revealed top cards from all participating players before resonance step
      const playersReady = state.players.map((p) => {
        const wasRevealed = state.revealedCards.some((r) => r.playerId === p.id);
        if (wasRevealed && p.stack.length > 0) {
          return { ...p, stack: p.stack.slice(1) };
        }
        return p;
      });

      const result = resolveResonance(
        playersReady,
        state.tiedPlayerIds,
        state.calledStat,
        state.resonancePile,
        state.settings
      );

      if (result.winnerId) {
        const winnerName = state.players.find((p) => p.id === result.winnerId)?.name;
        const logMsg = `⚡ Pattern Resonance resolved: ${winnerName} takes the ${result.totalPile.length}-card stake!`;

        // Place won cards at the bottom of winner's stack
        const finalPlayers = result.players.map((p) => {
          if (p.id === result.winnerId) {
            return { ...p, stack: [...p.stack, ...result.totalPile] };
          }
          return { ...p, isEliminated: p.isEliminated || p.stack.length === 0 };
        });

        // Last revealed cards in resonance to display on table
        const lastStepReveals =
          result.revealSteps.length > 0
            ? result.revealSteps[result.revealSteps.length - 1]
            : state.revealedCards;

        const newState: GameState = {
          ...state,
          players: finalPlayers,
          leadPlayerId: result.winnerId,
          resonancePile: [],
          revealedCards: lastStepReveals,
          resonanceSteps: result.revealSteps,
          tiedPlayerIds: [],
          calledStat: null,
          roundLog: [...state.roundLog, createLogEntry(state.currentRound, logMsg)],
          phase: 'round-result',
        };

        const winCheck = checkWinCondition(newState);
        if (winCheck.isGameOver) {
          return {
            ...newState,
            phase: 'game-over',
            winnerId: winCheck.winnerId,
            isTiedVictory: winCheck.isTiedVictory,
          };
        }

        return newState;
      }

      // Edge case: all tied players ran out
      const quarryReturn = [...state.quarry, ...result.totalPile];
      return {
        ...state,
        players: result.players.map((p) => ({
          ...p,
          isEliminated: p.isEliminated || p.stack.length === 0,
        })),
        quarry: quarryReturn,
        resonancePile: [],
        revealedCards: [],
        tiedPlayerIds: [],
        calledStat: null,
        phase: 'round-result',
        roundLog: [
          ...state.roundLog,
          createLogEntry(
            state.currentRound,
            'Pattern Resonance: All tied players exhausted their cards! Stake returned to Quarry.'
          ),
        ],
      };
    }

    case 'ADVANCE_ROUND': {
      if (state.phase !== 'round-result') return state;

      const nextRound = state.currentRound + 1;
      const newState: GameState = {
        ...state,
        currentRound: nextRound,
        phase: 'stat-call',
        revealedCards: [],
        resonancePile: [],
        tiedPlayerIds: [],
        calledStat: null,
        resonanceSteps: undefined,
      };

      const winCheck = checkWinCondition(newState);
      if (winCheck.isGameOver) {
        return {
          ...newState,
          phase: 'game-over',
          winnerId: winCheck.winnerId,
          isTiedVictory: winCheck.isTiedVictory,
        };
      }

      return newState;
    }

    case 'PLAY_AGAIN': {
      return createInitialState(
        state.players.map((p) => ({
          name: p.name,
          isAi: p.isAi,
          aiPersonality: p.aiPersonality,
        })),
        action.cards,
        state.settings
      );
    }

    case 'DISMISS_PASS_SCREEN': {
      return state;
    }

    default:
      return state;
  }
}

// ─── Initial State ────────────────────────────────────────────

export const INITIAL_STATE: GameState = {
  settings: {
    gameMode: 'sprint',
    tieVariant: 'pattern-resonance',
    statMode: 'standard',
  },
  players: [],
  quarry: [],
  leadPlayerId: '',
  currentRound: 0,
  phase: 'setup',
  roundLog: [],
  resonancePile: [],
  calledStat: null,
  revealedCards: [],
  tiedPlayerIds: [],
  winnerId: null,
  isTiedVictory: false,
};
