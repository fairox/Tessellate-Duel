import type { BlockCard } from '../data/blocks';
import type {
  GameState,
  Player,
  RevealedCard,
  RoundResult,
  Stat,
  LogEntry,
  GameSettings,
  StatMode,
} from './types';
import { MAX_ROUNDS } from './constants';

// ─── Utility ──────────────────────────────────────────────────

/**
 * Fisher-Yates shuffle. Returns a new array; does not mutate input.
 */
export function shuffleDeck(cards: readonly BlockCard[]): BlockCard[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deal cards evenly to `playerCount` players.
 * Remainder goes into the Quarry pile.
 */
export function dealCards(
  cards: readonly BlockCard[],
  playerCount: number
): { hands: BlockCard[][]; quarry: BlockCard[] } {
  const perPlayer = Math.floor(cards.length / playerCount);
  const hands: BlockCard[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push(cards.slice(i * perPlayer, (i + 1) * perPlayer) as BlockCard[]);
  }
  const quarry = cards.slice(playerCount * perPlayer) as BlockCard[];
  return { hands, quarry };
}

// ─── AI Stat Decision Engine ──────────────────────────────────

/**
 * Evaluates the best stat to call based on the Rulebook Strategy Guide (Section 7)
 * Takes into account card probabilities across the 40-block taxonomy.
 */
export function chooseAiStat(card: BlockCard, statMode: StatMode = 'standard'): Stat {
  const availableStats: Stat[] =
    statMode === 'advanced'
      ? ['complexity', 'rarity', 'symmetryPower', 'structuralWeight']
      : ['complexity', 'rarity'];

  // Calculate estimated strength rating (0 - 100) for each stat
  const scores: Record<Stat, number> = {
    complexity: 0,
    rarity: 0,
    symmetryPower: 0,
    structuralWeight: 0,
  };

  // Complexity (values 1..5: only 2 cards are 5, 6 cards are 4, 10 cards are 3)
  switch (card.complexity) {
    case 5: scores.complexity = 98; break; // Almost guaranteed win
    case 4: scores.complexity = 82; break; // Strong call
    case 3: scores.complexity = 52; break; // Coin-flip
    case 2: scores.complexity = 24; break;
    case 1: scores.complexity = 8; break;
  }

  // Rarity (1, 3, 5: 18 cards are 5, 10 are 3, 12 are 1)
  switch (card.rarity) {
    case 5: scores.rarity = 80; break; // High chance of win or tie
    case 3: scores.rarity = 46; break; // Average
    case 1: scores.rarity = 10; break; // Avoid calling
  }

  // Advanced Stats
  if (statMode === 'advanced') {
    // Symmetry Power (1..5)
    switch (card.symmetryPower) {
      case 5: scores.symmetryPower = 94; break;
      case 4: scores.symmetryPower = 78; break;
      case 3: scores.symmetryPower = 50; break;
      case 2: scores.symmetryPower = 25; break;
      case 1: scores.symmetryPower = 10; break;
    }

    // Structural Weight (2, 3, 5)
    switch (card.structuralWeight) {
      case 5: scores.structuralWeight = 90; break; // Structural frame
      case 3: scores.structuralWeight = 55; break; // Hybrid vector
      default: scores.structuralWeight = 15; break; // Ornamental skin / infill
    }
  }

  // Find the stat with the highest score
  let bestStat: Stat = availableStats[0];
  let maxScore = -1;

  for (const stat of availableStats) {
    const score = scores[stat];
    if (score > maxScore) {
      maxScore = score;
      bestStat = stat;
    } else if (score === maxScore && Math.random() > 0.5) {
      // Break ties organically
      bestStat = stat;
    }
  }

  return bestStat;
}

// ─── Reveal-Off ───────────────────────────────────────────────

export interface RevealOffResult {
  leadPlayerId: string;
  reveals: RevealedCard[];
  players: Player[];
}

/**
 * Reveal-off to determine starting lead player.
 * Each player flips their top card; highest Complexity leads.
 * On tie, tied players re-flip. Consumed cards go to bottom of each player's stack.
 */
export function resolveRevealOff(players: Player[]): RevealOffResult {
  let contenders = players.filter((p) => p.stack.length > 0);
  const allReveals: RevealedCard[] = [];
  const updatedPlayers = players.map((p) => ({
    ...p,
    stack: [...p.stack],
  }));

  while (contenders.length > 1) {
    const reveals: RevealedCard[] = [];
    for (const contender of contenders) {
      const player = updatedPlayers.find((p) => p.id === contender.id)!;
      if (player.stack.length === 0) continue;
      const card = player.stack.shift()!;
      reveals.push({ playerId: player.id, card });
      player.stack.push(card);
    }

    allReveals.push(...reveals);

    const maxComplexity = Math.max(...reveals.map((r) => r.card.complexity));
    const winners = reveals.filter((r) => r.card.complexity === maxComplexity);

    if (winners.length === 1) {
      return {
        leadPlayerId: winners[0].playerId,
        reveals: allReveals,
        players: updatedPlayers,
      };
    }

    // Tie — only tied players continue
    contenders = updatedPlayers.filter(
      (p) => winners.some((w) => w.playerId === p.id) && p.stack.length > 0
    );

    if (contenders.length === 0) {
      return {
        leadPlayerId: winners[0].playerId,
        reveals: allReveals,
        players: updatedPlayers,
      };
    }
    if (contenders.length === 1) {
      return {
        leadPlayerId: contenders[0].id,
        reveals: allReveals,
        players: updatedPlayers,
      };
    }
  }

  return {
    leadPlayerId: contenders[0]?.id ?? players[0].id,
    reveals: allReveals,
    players: updatedPlayers,
  };
}

// ─── Round Resolution ─────────────────────────────────────────

/**
 * Resolve a normal round: each active player reveals their top card,
 * compare on `calledStat`. Returns the result including possible tie info.
 */
export function resolveRound(
  players: Player[],
  calledStat: Stat,
  participatingIds?: string[]
): RoundResult {
  const activePlayers = players.filter(
    (p) =>
      !p.isEliminated &&
      p.stack.length > 0 &&
      (participatingIds ? participatingIds.includes(p.id) : true)
  );

  const revealedCards: RevealedCard[] = [];
  for (const player of activePlayers) {
    if (player.stack.length === 0) continue;
    const card = player.stack[0]; // peek
    revealedCards.push({ playerId: player.id, card });
  }

  if (revealedCards.length === 0) {
    return {
      calledStat,
      revealedCards,
      winnerId: null,
      tiedPlayerIds: [],
      resonancePile: [],
    };
  }

  const maxValue = Math.max(...revealedCards.map((r) => r.card[calledStat]));
  const winners = revealedCards.filter((r) => r.card[calledStat] === maxValue);

  if (winners.length === 1) {
    return {
      calledStat,
      revealedCards,
      winnerId: winners[0].playerId,
      tiedPlayerIds: [],
      resonancePile: [],
    };
  }

  // Tie — Pattern Resonance triggered
  return {
    calledStat,
    revealedCards,
    winnerId: null,
    tiedPlayerIds: winners.map((w) => w.playerId),
    resonancePile: revealedCards.map((r) => r.card),
  };
}

// ─── Pattern Resonance (Tie Resolution) ───────────────────────

export interface ResonanceResult {
  winnerId: string | null;
  totalPile: BlockCard[];
  revealSteps: RevealedCard[][];
  players: Player[];
}

/**
 * Resolve a Pattern Resonance chain.
 * Tied players repeatedly flip their next card until one wins,
 * or until players run out of cards.
 */
export function resolveResonance(
  players: Player[],
  tiedPlayerIds: string[],
  calledStat: Stat,
  existingPile: BlockCard[],
  settings: GameSettings
): ResonanceResult {
  const updatedPlayers = players.map((p) => ({
    ...p,
    stack: [...p.stack],
  }));

  const pile = [...existingPile];
  const revealSteps: RevealedCard[][] = [];
  let contenderIds = [...tiedPlayerIds];

  while (contenderIds.length > 1) {
    contenderIds = contenderIds.filter((id) => {
      const player = updatedPlayers.find((p) => p.id === id)!;
      return player && player.stack.length > 0;
    });

    if (contenderIds.length <= 1) break;

    const reveals: RevealedCard[] = [];

    // In Variant B (split-resonance), every non-eliminated player flips a card into the pile
    if (settings.tieVariant === 'split-resonance') {
      for (const player of updatedPlayers) {
        if (!player.isEliminated && player.stack.length > 0) {
          const card = player.stack.shift()!;
          pile.push(card);
          if (contenderIds.includes(player.id)) {
            reveals.push({ playerId: player.id, card });
          }
        }
      }
    } else {
      // Variant A (pattern-resonance): only tied players flip and add to pile
      for (const id of contenderIds) {
        const player = updatedPlayers.find((p) => p.id === id)!;
        const card = player.stack.shift()!;
        reveals.push({ playerId: id, card });
        pile.push(card);
      }
    }

    revealSteps.push(reveals);

    const maxValue = Math.max(...reveals.map((r) => r.card[calledStat]));
    const winners = reveals.filter((r) => r.card[calledStat] === maxValue);

    if (winners.length === 1) {
      return {
        winnerId: winners[0].playerId,
        totalPile: pile,
        revealSteps,
        players: updatedPlayers,
      };
    }

    // Still tied — narrow to tied players only
    contenderIds = winners.map((w) => w.playerId);
  }

  // One player left by default
  if (contenderIds.length === 1) {
    return {
      winnerId: contenderIds[0],
      totalPile: pile,
      revealSteps,
      players: updatedPlayers,
    };
  }

  return {
    winnerId: null,
    totalPile: pile,
    revealSteps,
    players: updatedPlayers,
  };
}

// ─── Apply Round Result ───────────────────────────────────────

/**
 * Apply the result of a round (or resonance) to the game state.
 */
export function applyRoundResult(
  state: GameState,
  winnerId: string,
  cardsWon: BlockCard[]
): GameState {
  const players = state.players.map((p) => {
    const revealedForPlayer = state.revealedCards.find((r) => r.playerId === p.id);
    let newStack = [...p.stack];

    // Remove the top card that was revealed
    if (revealedForPlayer && newStack.length > 0 && newStack[0].id === revealedForPlayer.card.id) {
      newStack = newStack.slice(1);
    }

    // Add all won cards to the bottom of the winner's stack
    if (p.id === winnerId) {
      newStack = [...newStack, ...cardsWon];
    }

    return {
      ...p,
      stack: newStack,
      isEliminated: p.isEliminated || newStack.length === 0,
    };
  });

  return {
    ...state,
    players,
    leadPlayerId: winnerId,
    resonancePile: [],
    revealedCards: [],
    tiedPlayerIds: [],
    calledStat: null,
  };
}

// ─── Win Condition Check ──────────────────────────────────────

export interface WinCheck {
  isGameOver: boolean;
  winnerId: string | null;
  isTiedVictory: boolean;
}

export function getSprintThreshold(playerCount: number): number {
  return playerCount === 2 ? 25 : playerCount === 3 ? 20 : 18;
}

/**
 * Check if the game has ended
 */
export function checkWinCondition(state: GameState): WinCheck {
  const activePlayers = state.players.filter((p) => !p.isEliminated && p.stack.length > 0);

  // Only one player left with cards
  if (activePlayers.length <= 1) {
    return {
      isGameOver: true,
      winnerId: activePlayers[0]?.id ?? null,
      isTiedVictory: false,
    };
  }

  // Sprint Mode
  if (state.settings.gameMode === 'sprint') {
    const sprintThreshold = getSprintThreshold(state.players.length);

    const thresholdWinner = activePlayers.find((p) => p.stack.length >= sprintThreshold);
    if (thresholdWinner) {
      return {
        isGameOver: true,
        winnerId: thresholdWinner.id,
        isTiedVictory: false,
      };
    }

    // Round limit reached (15 rounds)
    if (state.currentRound >= MAX_ROUNDS) {
      const maxCards = Math.max(...activePlayers.map((p) => p.stack.length));
      const topPlayers = activePlayers.filter((p) => p.stack.length === maxCards);

      if (topPlayers.length === 1) {
        return {
          isGameOver: true,
          winnerId: topPlayers[0].id,
          isTiedVictory: false,
        };
      }

      // Shared victory
      return {
        isGameOver: true,
        winnerId: topPlayers[0].id,
        isTiedVictory: true,
      };
    }
  } else {
    // Full Deck Mode: must hold all cards in play
    const totalCardsInPlay = 40 - state.quarry.length;
    const allCardsWinner = activePlayers.find((p) => p.stack.length >= totalCardsInPlay);
    if (allCardsWinner) {
      return {
        isGameOver: true,
        winnerId: allCardsWinner.id,
        isTiedVictory: false,
      };
    }
  }

  return { isGameOver: false, winnerId: null, isTiedVictory: false };
}

// ─── State Creation ───────────────────────────────────────────

export interface PlayerSetupOption {
  name: string;
  isAi?: boolean;
  aiPersonality?: string;
}

/**
 * Create a fresh initial game state from player configs and a shuffled deck.
 */
export function createInitialState(
  playerConfigs: (string | PlayerSetupOption)[],
  allCards: readonly BlockCard[],
  settings: GameSettings
): GameState {
  const shuffled = shuffleDeck(allCards);
  const { hands, quarry } = dealCards(shuffled, playerConfigs.length);

  const players: Player[] = playerConfigs.map((cfg, i) => {
    const name = typeof cfg === 'string' ? cfg : cfg.name;
    const isAi = typeof cfg === 'object' ? cfg.isAi ?? false : false;
    const aiPersonality = typeof cfg === 'object' ? cfg.aiPersonality : undefined;

    return {
      id: `player-${i + 1}`,
      name,
      stack: hands[i],
      isEliminated: false,
      isAi,
      aiPersonality,
    };
  });

  return {
    settings: {
      ...settings,
      statMode: settings.statMode ?? 'standard',
    },
    players,
    quarry,
    leadPlayerId: players[0].id,
    currentRound: 0,
    phase: 'reveal-off',
    roundLog: [],
    resonancePile: [],
    calledStat: null,
    revealedCards: [],
    tiedPlayerIds: [],
    winnerId: null,
    isTiedVictory: false,
  };
}

// ─── Logging Helpers ──────────────────────────────────────────

export function createLogEntry(round: number, message: string): LogEntry {
  return { round, message, timestamp: Date.now() };
}
