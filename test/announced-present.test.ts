import { describe, it, expect } from 'vitest';
import { LEVELS, recolorLevel } from '../src/game/graph/tileGraph';
import { createRng } from '../src/game/logic/seededRng';
import type { TileType } from '../src/game/scene/types';

const COLORS: TileType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];

describe('announced color is on the map', () => {
  it('every level shows at least 3 tiles of the announced color', () => {
    for (const lv of LEVELS) {
      for (const c of COLORS) {
        for (let seed = 1; seed <= 20; seed++) {
          const r = recolorLevel(lv, c, createRng(seed));
          const n = r.tiles.filter((t) => t.type === c).length;
          expect(n, `${lv.name} / ${c} / seed ${seed}`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});