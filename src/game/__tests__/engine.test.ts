import { describe, it, expect } from 'vitest';
import type { BlockCard } from '../../data/blocks';
import type { Player, GameState } from '../types';
import {
  shuffleDeck,
  dealCards,
  resolveRevealOff,
  resolveRound,
  resolveResonance,
  applyRoundResult,
  checkWinCondition,
  createInitialState,
  chooseAiStat,
} from '../engine';
import { BLOCKS } from '../../data/blocks';

// ─── Helpers ──────────────────────────────────────────────────

function makeCard(overrides: Partial<BlockCard> & { id: number }): BlockCard {
  return {
    name: `Card ${overrides.id}`,
    category: 'Test Category',
    complexity: 2,
    rarity: 3,
    symmetryPower: 3,
    structuralWeight: 3,
    ...overrides,
  };
}

function makePlayer(id: string, cards: BlockCard[]): Player {
  return { id, name: id, stack: cards, isEliminated: false };
}

// ─── Tests ────────────────────────────────────────────────────

describe('shuffleDeck', () => {
  it('returns a new array with the same cards', () => {
    const result = shuffleDeck(BLOCKS);
    expect(result).toHaveLength(BLOCKS.length);
    expect(new Set(result.map((c) => c.id))).toEqual(
      new Set(BLOCKS.map((c) => c.id))
    );
  });

  it('does not mutate the original array', () => {
    const original = [...BLOCKS];
    shuffleDeck(BLOCKS);
    expect(BLOCKS).toEqual(original);
  });
});

describe('dealCards', () => {
  it('deals evenly to 2 players with no quarry', () => {
    const { hands, quarry } = dealCards(BLOCKS, 2);
    expect(hands).toHaveLength(2);
    expect(hands[0]).toHaveLength(20);
    expect(hands[1]).toHaveLength(20);
    expect(quarry).toHaveLength(0);
  });

  it('deals to 3 players with 1 card in quarry', () => {
    const { hands, quarry } = dealCards(BLOCKS, 3);
    expect(hands).toHaveLength(3);
    expect(hands[0]).toHaveLength(13);
    expect(hands[1]).toHaveLength(13);
    expect(hands[2]).toHaveLength(13);
    expect(quarry).toHaveLength(1);
  });

  it('deals to 4 players with no quarry', () => {
    const { hands, quarry } = dealCards(BLOCKS, 4);
    expect(hands).toHaveLength(4);
    hands.forEach((h) => expect(h).toHaveLength(10));
    expect(quarry).toHaveLength(0);
  });
});

describe('resolveRound — normal resolution', () => {
  it('player with highest stat wins', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, complexity: 5, rarity: 1 })]),
      makePlayer('p2', [makeCard({ id: 2, complexity: 3, rarity: 3 })]),
    ];

    const result = resolveRound(players, 'complexity');
    expect(result.winnerId).toBe('p1');
    expect(result.tiedPlayerIds).toHaveLength(0);
  });

  it('compares rarity when rarity is called', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, complexity: 5, rarity: 1 })]),
      makePlayer('p2', [makeCard({ id: 2, complexity: 3, rarity: 5 })]),
    ];

    const result = resolveRound(players, 'rarity');
    expect(result.winnerId).toBe('p2');
  });

  it('compares symmetryPower when symmetryPower is called in advanced mode', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, symmetryPower: 5 })]),
      makePlayer('p2', [makeCard({ id: 2, symmetryPower: 2 })]),
    ];

    const result = resolveRound(players, 'symmetryPower');
    expect(result.winnerId).toBe('p1');
  });

  it('compares structuralWeight when structuralWeight is called', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, structuralWeight: 2 })]),
      makePlayer('p2', [makeCard({ id: 2, structuralWeight: 5 })]),
    ];

    const result = resolveRound(players, 'structuralWeight');
    expect(result.winnerId).toBe('p2');
  });

  it('skips eliminated players', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, complexity: 5, rarity: 1 })]),
      { ...makePlayer('p2', [makeCard({ id: 2, complexity: 3, rarity: 3 })]), isEliminated: true },
      makePlayer('p3', [makeCard({ id: 3, complexity: 4, rarity: 5 })]),
    ];

    const result = resolveRound(players, 'complexity');
    expect(result.winnerId).toBe('p1');
    expect(result.revealedCards).toHaveLength(2);
  });
});

describe('resolveRound — two-way tie', () => {
  it('returns null winnerId and tied player IDs', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, complexity: 3, rarity: 5 })]),
      makePlayer('p2', [makeCard({ id: 2, complexity: 3, rarity: 1 })]),
    ];

    const result = resolveRound(players, 'complexity');
    expect(result.winnerId).toBeNull();
    expect(result.tiedPlayerIds).toEqual(['p1', 'p2']);
    expect(result.resonancePile).toHaveLength(2);
  });
});

describe('resolveResonance — tie resolution', () => {
  it('resolves a two-way tie after one extra flip', () => {
    const players: Player[] = [
      makePlayer('p1', [
        makeCard({ id: 10, complexity: 3, rarity: 5 }),
        makeCard({ id: 11, complexity: 5, rarity: 1 }),
      ]),
      makePlayer('p2', [
        makeCard({ id: 20, complexity: 3, rarity: 3 }),
        makeCard({ id: 21, complexity: 2, rarity: 3 }),
      ]),
    ];

    const existingPile = [
      makeCard({ id: 10, complexity: 3, rarity: 5 }),
      makeCard({ id: 20, complexity: 3, rarity: 3 }),
    ];

    const result = resolveResonance(
      players,
      ['p1', 'p2'],
      'complexity',
      existingPile,
      { gameMode: 'sprint', tieVariant: 'pattern-resonance' }
    );

    expect(result.winnerId).toBe('p1');
    expect(result.totalPile).toHaveLength(6);
    expect(result.revealSteps).toHaveLength(2);
  });
});

describe('chooseAiStat', () => {
  it('picks complexity when card has complexity 5', () => {
    const card = makeCard({ id: 21, complexity: 5, rarity: 1 });
    const stat = chooseAiStat(card, 'standard');
    expect(stat).toBe('complexity');
  });

  it('picks rarity when card has rarity 5 and complexity 1', () => {
    const card = makeCard({ id: 3, complexity: 1, rarity: 5 });
    const stat = chooseAiStat(card, 'standard');
    expect(stat).toBe('rarity');
  });

  it('can pick advanced stats when advanced mode is active', () => {
    const card = makeCard({ id: 10, complexity: 2, rarity: 1, symmetryPower: 5, structuralWeight: 5 });
    const stat = chooseAiStat(card, 'advanced');
    expect(['symmetryPower', 'structuralWeight']).toContain(stat);
  });
});

describe('applyRoundResult', () => {
  it('moves won cards to the bottom of the winner stack', () => {
    const state: GameState = {
      settings: { gameMode: 'sprint', tieVariant: 'pattern-resonance' },
      players: [
        makePlayer('p1', [
          makeCard({ id: 1, complexity: 5, rarity: 1 }),
          makeCard({ id: 3, complexity: 2, rarity: 3 }),
        ]),
        makePlayer('p2', [
          makeCard({ id: 2, complexity: 3, rarity: 5 }),
          makeCard({ id: 4, complexity: 1, rarity: 1 }),
        ]),
      ],
      quarry: [],
      leadPlayerId: 'p1',
      currentRound: 1,
      phase: 'round-result',
      roundLog: [],
      resonancePile: [],
      calledStat: 'complexity',
      revealedCards: [
        { playerId: 'p1', card: makeCard({ id: 1, complexity: 5, rarity: 1 }) },
        { playerId: 'p2', card: makeCard({ id: 2, complexity: 3, rarity: 5 }) },
      ],
      tiedPlayerIds: [],
      winnerId: null,
      isTiedVictory: false,
    };

    const cardsWon = [
      makeCard({ id: 1, complexity: 5, rarity: 1 }),
      makeCard({ id: 2, complexity: 3, rarity: 5 }),
    ];

    const newState = applyRoundResult(state, 'p1', cardsWon);

    expect(newState.players[0].stack).toHaveLength(3);
    expect(newState.players[0].stack[0].id).toBe(3);
    expect(newState.players[0].stack[1].id).toBe(1);
    expect(newState.players[0].stack[2].id).toBe(2);

    expect(newState.players[1].stack).toHaveLength(1);
    expect(newState.players[1].stack[0].id).toBe(4);

    expect(newState.leadPlayerId).toBe('p1');
  });
});

describe('checkWinCondition', () => {
  it('does NOT trigger prematurely in 4-player game after winning just 1 round (13 cards)', () => {
    const state: GameState = {
      settings: { gameMode: 'sprint', tieVariant: 'pattern-resonance' },
      players: [
        makePlayer('p1', Array.from({ length: 13 }, (_, i) => makeCard({ id: i + 1 }))),
        makePlayer('p2', Array.from({ length: 9 }, (_, i) => makeCard({ id: i + 20 }))),
        makePlayer('p3', Array.from({ length: 9 }, (_, i) => makeCard({ id: i + 30 }))),
        makePlayer('p4', Array.from({ length: 9 }, (_, i) => makeCard({ id: i + 40 }))),
      ],
      quarry: [],
      leadPlayerId: 'p1',
      currentRound: 1,
      phase: 'round-result',
      roundLog: [],
      resonancePile: [],
      calledStat: null,
      revealedCards: [],
      tiedPlayerIds: [],
      winnerId: null,
      isTiedVictory: false,
    };

    const result = checkWinCondition(state);
    expect(result.isGameOver).toBe(false);
  });

  it('triggers game-over in 4-player game when a player reaches the 18-card sprint threshold', () => {
    const bigStack = Array.from({ length: 18 }, (_, i) => makeCard({ id: i + 1 }));
    const state: GameState = {
      settings: { gameMode: 'sprint', tieVariant: 'pattern-resonance' },
      players: [
        makePlayer('p1', bigStack),
        makePlayer('p2', [makeCard({ id: 99 })]),
        makePlayer('p3', [makeCard({ id: 98 })]),
        makePlayer('p4', [makeCard({ id: 97 })]),
      ],
      quarry: [],
      leadPlayerId: 'p1',
      currentRound: 5,
      phase: 'round-result',
      roundLog: [],
      resonancePile: [],
      calledStat: null,
      revealedCards: [],
      tiedPlayerIds: [],
      winnerId: null,
      isTiedVictory: false,
    };

    const result = checkWinCondition(state);
    expect(result.isGameOver).toBe(true);
    expect(result.winnerId).toBe('p1');
    expect(result.isTiedVictory).toBe(false);
  });

  it('falls back to most cards after MAX_ROUNDS', () => {
    const state: GameState = {
      settings: { gameMode: 'sprint', tieVariant: 'pattern-resonance' },
      players: [
        makePlayer('p1', [makeCard({ id: 1 }), makeCard({ id: 2 })]),
        makePlayer('p2', [makeCard({ id: 3 })]),
      ],
      quarry: [],
      leadPlayerId: 'p1',
      currentRound: 15,
      phase: 'round-result',
      roundLog: [],
      resonancePile: [],
      calledStat: null,
      revealedCards: [],
      tiedPlayerIds: [],
      winnerId: null,
      isTiedVictory: false,
    };

    const result = checkWinCondition(state);
    expect(result.isGameOver).toBe(true);
    expect(result.winnerId).toBe('p1');
    expect(result.isTiedVictory).toBe(false);
  });
});

describe('createInitialState', () => {
  it('creates a valid initial state for 2 players', () => {
    const state = createInitialState(['Alice', 'Bob'], BLOCKS, {
      gameMode: 'sprint',
      tieVariant: 'pattern-resonance',
    });
    expect(state.players).toHaveLength(2);
    expect(state.players[0].name).toBe('Alice');
    expect(state.players[1].name).toBe('Bob');
    expect(state.players[0].stack.length + state.players[1].stack.length + state.quarry.length).toBe(40);
    expect(state.phase).toBe('reveal-off');
    expect(state.currentRound).toBe(0);
  });
});

describe('resolveRevealOff', () => {
  it('picks the player with the highest complexity', () => {
    const players: Player[] = [
      makePlayer('p1', [makeCard({ id: 1, complexity: 2 }), makeCard({ id: 10 })]),
      makePlayer('p2', [makeCard({ id: 2, complexity: 5 }), makeCard({ id: 20 })]),
    ];

    const result = resolveRevealOff(players);
    expect(result.leadPlayerId).toBe('p2');
  });
});

