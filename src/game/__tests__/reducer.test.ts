import { describe, it, expect } from 'vitest';
import { gameReducer, INITIAL_STATE } from '../reducer';
import type { GameState } from '../types';
import { BLOCKS } from '../../data/blocks';

function startedAtStatCall(): GameState {
  let s = gameReducer(INITIAL_STATE, {
    type: 'START_GAME',
    playerConfigs: [
      { name: 'A', isAi: false },
      { name: 'B', isAi: true },
    ],
    cards: BLOCKS,
    settings: { gameMode: 'sprint', tieVariant: 'pattern-resonance', statMode: 'standard' },
  });
  s = gameReducer(s, { type: 'COMPLETE_REVEAL_OFF' });
  return s;
}

describe('round result keeps the battle on the table', () => {
  it('a clear win leaves revealed cards and the called stat until ADVANCE_ROUND', () => {
    // Retry deals until one produces a clear (non-tied) win on complexity
    for (let attempt = 0; attempt < 50; attempt++) {
      let s = startedAtStatCall();
      expect(s.phase).toBe('stat-call');
      s = gameReducer(s, { type: 'CALL_STAT', stat: 'complexity' });
      s = gameReducer(s, { type: 'RESOLVE_ROUND' });
      if (s.phase !== 'round-result') continue;

      expect(s.calledStat).toBe('complexity');
      expect(s.revealedCards).toHaveLength(2);
      // the winner leads next round and is among the revealed plates
      expect(s.revealedCards.some((r) => r.playerId === s.leadPlayerId)).toBe(true);

      const next = gameReducer(s, { type: 'ADVANCE_ROUND' });
      expect(next.revealedCards).toHaveLength(0);
      expect(next.calledStat).toBeNull();
      return;
    }
    throw new Error('no clear win produced in 50 deals');
  });
});
