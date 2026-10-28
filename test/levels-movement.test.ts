import { describe, it, expect } from 'vitest';
import { LEVELS, findPath } from '../src/game/graph/tileGraph';
import { resolveMove } from '../src/game/logic/movement';
import { TILE_EFFECTS } from '../src/game/logic/rules';

const L1 = LEVELS[0];
const none = new Set<string>();

describe('levels', () => {
  it('every level has a route from start to exit', () => {
    for (const lv of LEVELS) expect(findPath(lv, lv.startId, lv.exitId)).not.toBeNull();
  });
});

describe('resolveMove', () => {
  it('steps onto a safe tile', () => {
    const r = resolveMove(L1, TILE_EFFECTS, none, '0,-6', '0,-5');
    expect(r).toEqual({ cells: ['0,-5'], falls: false, crumbleCell: null });
  });
  it('falls into a gap', () => {
    expect(resolveMove(L1, TILE_EFFECTS, none, '0,-6', '1,-6').falls).toBe(true);
  });
  it('bounce launches 2 cells', () => {
    const r = resolveMove(L1, { ...TILE_EFFECTS, safe: 'bounce' }, none, '0,-6', '0,-5');
    expect(r.cells).toEqual(['0,-4']);
    expect(r.falls).toBe(false);
  });
  it('slide carries until a non-slide tile', () => {
    const r = resolveMove(L1, { ...TILE_EFFECTS, safe: 'slide' }, none, '0,-6', '0,-5');
    expect(r.cells[r.cells.length - 1]).toBe('0,-2');
  });
  it('crumble marks the landing tile', () => {
    const r = resolveMove(L1, { ...TILE_EFFECTS, safe: 'crumble' }, none, '0,-6', '0,-5');
    expect(r.crumbleCell).toBe('0,-5');
  });
  it('a crumbled tile is a gap', () => {
    expect(resolveMove(L1, TILE_EFFECTS, new Set(['0,-5']), '0,-6', '0,-5').falls).toBe(true);
  });
});