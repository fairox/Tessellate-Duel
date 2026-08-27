import type { BlockCard } from '../data/blocks';

// ─── Stat Types ───────────────────────────────────────────────
export type Stat = 'complexity' | 'rarity' | 'symmetryPower' | 'structuralWeight';

export type StatMode = 'standard' | 'advanced';

// ─── Game Settings ────────────────────────────────────────────
export type GameLengthMode = 'sprint' | 'full-deck';
export type TieVariant = 'pattern-resonance' | 'split-resonance';

export interface GameSettings {
  gameMode: GameLengthMode;
  tieVariant: TieVariant;
  autoAdvance?: boolean;
  statMode?: StatMode;
}

// ─── Game Phases ──────────────────────────────────────────────
export type GamePhase =
  | 'setup'
  | 'reveal-off'
  | 'stat-call'
  | 'revealing'
  | 'resonance'
  | 'round-result'
  | 'game-over';

// ─── Player ───────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  /** Active deck — index 0 is the "top" card */
  stack: BlockCard[];
  isEliminated: boolean;
  /** Whether player is controlled by AI bot */
  isAi?: boolean;
  /** Personality / Difficulty descriptor */
  aiPersonality?: string;
}

// ─── Revealed Card Entry ──────────────────────────────────────
export interface RevealedCard {
  playerId: string;
  card: BlockCard;
}

// ─── Round Result ─────────────────────────────────────────────
export interface RoundResult {
  calledStat: Stat;
  revealedCards: RevealedCard[];
  winnerId: string | null;   // null → tie (resonance)
  tiedPlayerIds: string[];
  resonancePile: BlockCard[];
}

// ─── Log Entry ────────────────────────────────────────────────
export interface LogEntry {
  round: number;
  message: string;
  timestamp: number;
}

// ─── Game State ───────────────────────────────────────────────
export interface GameState {
  settings: GameSettings;
  players: Player[];
  quarry: BlockCard[];
  leadPlayerId: string;
  currentRound: number;
  phase: GamePhase;
  roundLog: LogEntry[];
  /** Cards at stake during a Pattern Resonance tie chain */
  resonancePile: BlockCard[];
  /** The stat that was called this round (persists through resonance) */
  calledStat: Stat | null;
  /** Cards revealed in the current battle */
  revealedCards: RevealedCard[];
  /** IDs of players currently tied (used during resonance) */
  tiedPlayerIds: string[];
  /** Winner of the entire game */
  winnerId: string | null;
  /** True if the game ended with a tied score (shared victory) */
  isTiedVictory: boolean;
  /** Detailed resonance steps for animation display */
  resonanceSteps?: RevealedCard[][];
}
