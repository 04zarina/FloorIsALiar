import { cellId, parseCellId, type Level } from '../graph/tileGraph';
import type { EffectMap, TileEffect } from './rules';

export interface MoveResult {
  cells: string[];            // hop destinations, in order
  falls: boolean;             // last cell is empty/crumbled: player falls there
  crumbleCell: string | null; // tile that starts crumbling when landed on
}

export function effectOf(level: Level, effectMap: EffectMap, id: string): TileEffect {
  const t = level.byId[id];
  return t ? effectMap[t.type] : 'safe';
}

/** Pure move resolution: no React, no Three.js. */
export function resolveMove(
  level: Level,
  effectMap: EffectMap,
  crumbled: ReadonlySet<string>,
  fromId: string,
  toId: string
): MoveResult {
  const from = parseCellId(fromId);
  const to = parseCellId(toId);
  const dx = Math.sign(to.x - from.x);
  const dz = Math.sign(to.z - from.z);
  const solid = (id: string) => Boolean(level.byId[id]) && !crumbled.has(id);
  const step = (id: string) => {
    const p = parseCellId(id);
    return cellId(p.x + dx, p.z + dz);
  };

  const first = cellId(from.x + dx, from.z + dz);
  if (!solid(first)) return { cells: [first], falls: true, crumbleCell: null };

  const effect = effectOf(level, effectMap, first);
  let cells: string[];

  if (effect === 'bounce') {
    cells = [step(first)]; // launched over the bounce tile
  } else if (effect === 'slide') {
    cells = [first];
    let cur = first;
    for (let i = 0; i < 8; i++) {
      if (effectOf(level, effectMap, cur) !== 'slide') break;
      const next = step(cur);
      cells.push(next);
      if (!solid(next)) break;
      cur = next;
    }
  } else {
    cells = [first];
  }

  const last = cells[cells.length - 1];
  const falls = !solid(last);
  return {
    cells,
    falls,
    crumbleCell: !falls && effectOf(level, effectMap, last) === 'crumble' ? last : null,
  };
}