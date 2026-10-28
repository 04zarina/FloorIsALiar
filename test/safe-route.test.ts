import { describe, it, expect } from 'vitest';
import { LEVELS, recolorLevel, findPath } from '../src/game/graph/tileGraph';
import { createRng } from '../src/game/logic/seededRng';
import type { TileType } from '../src/game/scene/types';

const COLORS: TileType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];

describe('levels', () => {
  it('every level has a route from start to exit', () => {
    for (const lv of LEVELS) expect(findPath(lv, lv.startId, lv.exitId)).not.toBeNull();
  });
});

describe('fair floor after random recoloring', () => {
  it('a route avoiding the announced color always exists', () => {
    for (const lv of LEVELS) {
      for (const target of COLORS) {
        for (let seed = 1; seed <= 20; seed++) {
          const r = recolorLevel(lv, target, createRng(seed));
          const seen = new Set([r.startId]);
          const queue = [r.startId];
          while (queue.length) {
            const cur = queue.shift()!;
            for (const n of r.byId[cur].adjacentIds) {
              if (r.byId[n].type !== target && !seen.has(n)) {
                seen.add(n);
                queue.push(n);
              }
            }
          }
          expect(seen.has(r.exitId), `${lv.name} / ${target} / seed ${seed}`).toBe(true);
        }
      }
    }
  });

  it('start and exit keep their colors and colors really shuffle', () => {
    const lv = LEVELS[1];
    const a = recolorLevel(lv, 'bounce', createRng(1));
    const b = recolorLevel(lv, 'bounce', createRng(2));
    expect(a.byId[a.startId].type).toBe('entry');
    expect(a.byId[a.exitId].type).toBe('exit');
    expect(a.tiles.map((t) => t.type)).not.toEqual(b.tiles.map((t) => t.type));
  });
});