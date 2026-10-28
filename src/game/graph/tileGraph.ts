import type { TileType } from '../scene/types';
import { LEVEL_DEFS } from './levels';

export type TileColorType = TileType;

export interface GraphTile {
  id: string;
  x: number;
  z: number;
  type: TileColorType;
  label?: string;
  adjacentIds: string[]; // 4-direction neighbours that are real tiles
  staggerOffset: number;
}

export interface Level {
  index: number;
  name: string;
  timerSeconds: number;
  width: number;
  height: number;
  tiles: GraphTile[];
  byId: Record<string, GraphTile>;
  startId: string;
  exitId: string;
}

const CHAR_TYPES: Record<string, TileType> = {
  S: 'entry', E: 'exit', T: 'safe', B: 'bounce', O: 'slide', P: 'crumble', M: 'mystery',
};
const Z_MIN = -6; // start row is always z = -6
const DIRS: ReadonlyArray<readonly [number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const COLOR_POOL: TileType[] = ['safe', 'bounce', 'slide', 'crumble', 'mystery'];

export const cellId = (x: number, z: number): string => `${x},${z}`;

export function parseCellId(id: string): { x: number; z: number } {
  const [x, z] = id.split(',').map(Number);
  return { x, z };
}

export function buildLevel(index: number): Level {
  const def = LEVEL_DEFS[index];
  const height = def.rows.length;
  const width = def.rows[0].length;
  const half = Math.floor(width / 2);
  const byId: Record<string, GraphTile> = {};
  let startId = '';
  let exitId = '';

  def.rows.forEach((row, r) => {
    const z = Z_MIN + (height - 1 - r);
    [...row].forEach((ch, c) => {
      const type = CHAR_TYPES[ch];
      if (!type) return;
      const x = half - c; // left column = +x so the map reads as drawn from behind the player
      const id = cellId(x, z);
      byId[id] = {
        id, x, z, type,
        adjacentIds: [],
        staggerOffset: (((x * 0.37 + z * 0.61) % 6.28) + 6.28) % 6.28,
      };
      if (type === 'entry') startId = id;
      if (type === 'exit') exitId = id;
    });
  });

  const tiles = Object.values(byId);
  for (const t of tiles) {
    t.adjacentIds = DIRS.map(([dx, dz]) => cellId(t.x + dx, t.z + dz)).filter((id) => byId[id]);
  }
  return { index, name: def.name, timerSeconds: def.timerSeconds, width, height, tiles, byId, startId, exitId };
}

export const LEVELS: Level[] = LEVEL_DEFS.map((_, i) => buildLevel(i));

export function getTile(level: Level, id: string): GraphTile | undefined {
  return level.byId[id];
}

export function getAllTiles(level: Level): GraphTile[] {
  return level.tiles;
}

export function getNeighbors(level: Level, id: string): GraphTile[] {
  const t = level.byId[id];
  return t ? t.adjacentIds.map((n) => level.byId[n]) : [];
}

/** Grid adjacency (works for empty cells too). */
export function isAdjacent(aId: string, bId: string): boolean {
  const a = parseCellId(aId);
  const b = parseCellId(bId);
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z) === 1;
}

/** The 4 grid cells around a cell, whether or not a tile exists there. */
export function getAdjacentCellIds(id: string): string[] {
  const { x, z } = parseCellId(id);
  return DIRS.map(([dx, dz]) => cellId(x + dx, z + dz));
}

/** Neighbouring cells that are real tiles. */
export function getReachableTiles(level: Level, id: string): string[] {
  const t = level.byId[id];
  return t ? [...t.adjacentIds] : [];
}

/** BFS over real tiles. Optional filter limits which tiles may be walked. */
export function findPath(
  level: Level,
  startId: string,
  targetId: string,
  canUse: (tile: GraphTile) => boolean = () => true
): string[] | null {
  if (!level.byId[startId] || !level.byId[targetId]) return null;
  if (startId === targetId) return [startId];
  const queue = [startId];
  const parent = new Map<string, string>();
  const seen = new Set([startId]);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === targetId) {
      const path = [cur];
      let p = cur;
      while (parent.has(p)) { p = parent.get(p)!; path.unshift(p); }
      return path;
    }
    for (const n of level.byId[cur].adjacentIds) {
      if (!seen.has(n) && canUse(level.byId[n])) {
        seen.add(n);
        parent.set(n, cur);
        queue.push(n);
      }
    }
  }
  return null;
}

/**
 * Randomly recolors a BASE level for one round (pass LEVELS[i], never a recolored level).
 * - Protected cells never get the announced color, so a safe route always exists.
 *   Protected = all base 'safe' (T) cells if they connect start to exit,
 *   otherwise the shortest start-to-exit path (works even for a badly drawn map).
 * - All other cells get any of the 5 colors.
 * - Start and exit keep their colors.
 */
export function recolorLevel(level: Level, announcedColor: TileType, rng: () => number): Level {
  const routeColors = COLOR_POOL.filter((c) => c !== announcedColor);

  const isRouteTile = (t: GraphTile) =>
    t.type === 'safe' || t.type === 'entry' || t.type === 'exit';
  const tRoute = findPath(level, level.startId, level.exitId, isRouteTile);

  const protectedIds = new Set<string>(
    tRoute
      ? level.tiles.filter((t) => t.type === 'safe').map((t) => t.id)
      : findPath(level, level.startId, level.exitId) ?? []
  );

  const byId: Record<string, GraphTile> = {};
  const tiles = level.tiles.map((t) => {
    let type = t.type;
    if (t.type !== 'entry' && t.type !== 'exit') {
      const pool = protectedIds.has(t.id) ? routeColors : COLOR_POOL;
      type = pool[Math.floor(rng() * pool.length)];
    }
    byId[t.id] = { ...t, type };
    return byId[t.id];
  });

  // The announced color must actually exist on the floor: force at least 3 free cells to it.
  const MIN_ANNOUNCED = 3;
  const have = tiles.filter((t) => t.type === announcedColor).length;
  const free = tiles.filter(
    (t) =>
      t.type !== 'entry' && t.type !== 'exit' &&
      !protectedIds.has(t.id) && t.type !== announcedColor
  );
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  free.slice(0, Math.max(0, MIN_ANNOUNCED - have)).forEach((t) => {
    t.type = announcedColor;
  });

  return { ...level, tiles, byId };
}