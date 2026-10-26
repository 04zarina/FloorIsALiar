export type TileColorType = 'safe' | 'bounce' | 'slide' | 'crumble' | 'mystery' | 'entry' | 'exit';

export interface GraphTile {
  id: string;
  x: number; // Grid coordinate X (-3 to +3)
  z: number; // Grid coordinate Z (-6 to +7)
  type: TileColorType;
  label?: string;
  adjacentIds: string[]; // List of adjacent connected tile IDs
  staggerOffset: number; // Phase shift for floating animation
}

/**
 * 7x14 Floating Arena Tile Graph with gaps and THREE distinct routes of different lengths:
 * - Route 1 (Right branch): Direct & shorter (~13 steps), higher density of slide/crumble/bounce.
 * - Route 2 (Center branch): Balanced & winding (~15 steps), mix of mystery and bounce.
 * - Route 3 (Left-flank branch): Longest & safest (~17 steps), predominantly stable safe tiles.
 * - Cross-lane bridges connecting the routes mid-floor.
 */
export const ARENA_GRAPH: Record<string, GraphTile> = {
  // --- START HUB ---
  start: {
    id: 'start',
    x: 0,
    z: -6,
    type: 'entry',
    label: 'Start Pad',
    adjacentIds: ['hub_start'],
    staggerOffset: 0.0,
  },
  hub_start: {
    id: 'hub_start',
    x: 0,
    z: -5,
    type: 'safe',
    label: 'Start Junction',
    adjacentIds: ['start', 'r_1', 'c_1', 'l_1'],
    staggerOffset: 0.25,
  },

  // --- ROUTE 1: RIGHT BRANCH (Shortest / Riskier, ~13 hops) ---
  r_1: {
    id: 'r_1',
    x: 1,
    z: -4,
    type: 'slide',
    label: 'Right Slide 1',
    adjacentIds: ['hub_start', 'r_2'],
    staggerOffset: 0.5,
  },
  r_2: {
    id: 'r_2',
    x: 2,
    z: -3,
    type: 'crumble',
    label: 'Right Crumble 1',
    adjacentIds: ['r_1', 'r_3'],
    staggerOffset: 0.75,
  },
  r_3: {
    id: 'r_3',
    x: 2,
    z: -2,
    type: 'bounce',
    label: 'Right Bounce 1',
    adjacentIds: ['r_2', 'r_4'],
    staggerOffset: 1.0,
  },
  r_4: {
    id: 'r_4',
    x: 2,
    z: -1,
    type: 'slide',
    label: 'Right Slide 2',
    adjacentIds: ['r_3', 'r_5'],
    staggerOffset: 1.25,
  },
  r_5: {
    id: 'r_5',
    x: 2,
    z: 0,
    type: 'crumble',
    label: 'Right Crumble 2',
    adjacentIds: ['r_4', 'r_6', 'c_6'],
    staggerOffset: 1.5,
  },
  r_6: {
    id: 'r_6',
    x: 2,
    z: 1,
    type: 'bounce',
    label: 'Right Bounce 2',
    adjacentIds: ['r_5', 'r_7'],
    staggerOffset: 1.75,
  },
  r_7: {
    id: 'r_7',
    x: 2,
    z: 2,
    type: 'slide',
    label: 'Right Slide 3',
    adjacentIds: ['r_6', 'r_8'],
    staggerOffset: 2.0,
  },
  r_8: {
    id: 'r_8',
    x: 2,
    z: 3,
    type: 'crumble',
    label: 'Right Crumble 3',
    adjacentIds: ['r_7', 'r_9'],
    staggerOffset: 2.25,
  },
  r_9: {
    id: 'r_9',
    x: 1,
    z: 4,
    type: 'bounce',
    label: 'Right Bounce 3',
    adjacentIds: ['r_8', 'hub_exit_pre'],
    staggerOffset: 2.5,
  },

  // --- ROUTE 2: CENTER BRANCH (Medium Length, ~15 hops) ---
  c_1: {
    id: 'c_1',
    x: 0,
    z: -4,
    type: 'safe',
    label: 'Center Safe 1',
    adjacentIds: ['hub_start', 'c_2'],
    staggerOffset: 0.4,
  },
  c_2: {
    id: 'c_2',
    x: 0,
    z: -3,
    type: 'mystery',
    label: 'Center Mystery 1',
    adjacentIds: ['c_1', 'c_3'],
    staggerOffset: 0.65,
  },
  c_3: {
    id: 'c_3',
    x: 1,
    z: -3,
    type: 'bounce',
    label: 'Center Bounce 1',
    adjacentIds: ['c_2', 'c_4'],
    staggerOffset: 0.9,
  },
  c_4: {
    id: 'c_4',
    x: 1,
    z: -2,
    type: 'safe',
    label: 'Center Safe 2',
    adjacentIds: ['c_3', 'c_5'],
    staggerOffset: 1.15,
  },
  c_5: {
    id: 'c_5',
    x: 0,
    z: -1,
    type: 'mystery',
    label: 'Center Mystery 2',
    adjacentIds: ['c_4', 'c_6'],
    staggerOffset: 1.4,
  },
  c_6: {
    id: 'c_6',
    x: 0,
    z: 0,
    type: 'safe',
    label: 'Center Crossroads',
    adjacentIds: ['c_5', 'c_7', 'r_5', 'l_6'],
    staggerOffset: 1.65,
  },
  c_7: {
    id: 'c_7',
    x: -1,
    z: 1,
    type: 'bounce',
    label: 'Center Bounce 2',
    adjacentIds: ['c_6', 'c_8'],
    staggerOffset: 1.9,
  },
  c_8: {
    id: 'c_8',
    x: 0,
    z: 2,
    type: 'safe',
    label: 'Center Safe 3',
    adjacentIds: ['c_7', 'c_9'],
    staggerOffset: 2.15,
  },
  c_9: {
    id: 'c_9',
    x: 0,
    z: 3,
    type: 'mystery',
    label: 'Center Mystery 3',
    adjacentIds: ['c_8', 'c_10'],
    staggerOffset: 2.4,
  },
  c_10: {
    id: 'c_10',
    x: 0,
    z: 4,
    type: 'safe',
    label: 'Center Safe 4',
    adjacentIds: ['c_9', 'hub_exit_pre'],
    staggerOffset: 2.65,
  },

  // --- ROUTE 3: LEFT FLANK BRANCH (Longest / Safest, ~17 hops) ---
  l_1: {
    id: 'l_1',
    x: -1,
    z: -4,
    type: 'safe',
    label: 'Left Safe 1',
    adjacentIds: ['hub_start', 'l_2'],
    staggerOffset: 0.35,
  },
  l_2: {
    id: 'l_2',
    x: -2,
    z: -4,
    type: 'safe',
    label: 'Left Safe 2',
    adjacentIds: ['l_1', 'l_3'],
    staggerOffset: 0.55,
  },
  l_3: {
    id: 'l_3',
    x: -3,
    z: -3,
    type: 'bounce',
    label: 'Left Bounce 1',
    adjacentIds: ['l_2', 'l_4'],
    staggerOffset: 0.8,
  },
  l_4: {
    id: 'l_4',
    x: -3,
    z: -2,
    type: 'safe',
    label: 'Left Safe 3',
    adjacentIds: ['l_3', 'l_5'],
    staggerOffset: 1.05,
  },
  l_5: {
    id: 'l_5',
    x: -3,
    z: -1,
    type: 'safe',
    label: 'Left Safe 4',
    adjacentIds: ['l_4', 'l_6'],
    staggerOffset: 1.3,
  },
  l_6: {
    id: 'l_6',
    x: -3,
    z: 0,
    type: 'bounce',
    label: 'Left Bounce 2',
    adjacentIds: ['l_5', 'l_7', 'c_6'],
    staggerOffset: 1.55,
  },
  l_7: {
    id: 'l_7',
    x: -3,
    z: 1,
    type: 'safe',
    label: 'Left Safe 5',
    adjacentIds: ['l_6', 'l_8'],
    staggerOffset: 1.8,
  },
  l_8: {
    id: 'l_8',
    x: -3,
    z: 2,
    type: 'safe',
    label: 'Left Safe 6',
    adjacentIds: ['l_7', 'l_9'],
    staggerOffset: 2.05,
  },
  l_9: {
    id: 'l_9',
    x: -3,
    z: 3,
    type: 'bounce',
    label: 'Left Bounce 3',
    adjacentIds: ['l_8', 'l_10'],
    staggerOffset: 2.3,
  },
  l_10: {
    id: 'l_10',
    x: -2,
    z: 4,
    type: 'safe',
    label: 'Left Safe 7',
    adjacentIds: ['l_9', 'l_11'],
    staggerOffset: 2.55,
  },
  l_11: {
    id: 'l_11',
    x: -1,
    z: 5,
    type: 'safe',
    label: 'Left Safe 8',
    adjacentIds: ['l_10', 'hub_exit_pre'],
    staggerOffset: 2.8,
  },

  // --- EXIT JUNCTION & EXIT PAD ---
  hub_exit_pre: {
    id: 'hub_exit_pre',
    x: 0,
    z: 5,
    type: 'mystery',
    label: 'Pre-Exit Convergence',
    adjacentIds: ['r_9', 'c_10', 'l_11', 'hub_exit'],
    staggerOffset: 3.0,
  },
  hub_exit: {
    id: 'hub_exit',
    x: 0,
    z: 6,
    type: 'safe',
    label: 'Exit Approach',
    adjacentIds: ['hub_exit_pre', 'exit'],
    staggerOffset: 3.25,
  },
  exit: {
    id: 'exit',
    x: 0,
    z: 7,
    type: 'exit',
    label: 'Exit Portal',
    adjacentIds: ['hub_exit'],
    staggerOffset: 3.5,
  },
};

/**
 * Returns a tile by its unique ID.
 */
export function getTile(id: string): GraphTile | undefined {
  return ARENA_GRAPH[id];
}

/**
 * Returns all tile objects in the graph.
 */
export function getAllTiles(): GraphTile[] {
  return Object.values(ARENA_GRAPH);
}

/**
 * Returns all immediate neighbor tiles for a given tile ID.
 */
export function getNeighbors(id: string): GraphTile[] {
  const tile = ARENA_GRAPH[id];
  if (!tile) return [];
  return tile.adjacentIds
    .map((adjId) => ARENA_GRAPH[adjId])
    .filter((n): n is GraphTile => n !== undefined);
}

/**
 * Pure adjacency check: returns true if tile B is directly adjacent to tile A.
 */
export function isAdjacent(aId: string, bId: string): boolean {
  if (aId === bId) return false;
  const tileA = ARENA_GRAPH[aId];
  if (!tileA) return false;
  return tileA.adjacentIds.includes(bId);
}

/**
 * Returns list of tile IDs reachable in 1 hop from the current tile.
 */
export function getReachableTiles(currentId: string): string[] {
  const tile = ARENA_GRAPH[currentId];
  return tile ? [...tile.adjacentIds] : [];
}

/**
 * Pure BFS pathfinder: finds the shortest sequence of tile IDs from start to target.
 * Returns array of tile IDs [start, ..., target], or null if unreachable.
 */
export function findPath(startId: string, targetId: string): string[] | null {
  if (startId === targetId) return [startId];
  if (!ARENA_GRAPH[startId] || !ARENA_GRAPH[targetId]) return null;

  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parentMap = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      // Reconstruct path
      const path: string[] = [targetId];
      let curr = targetId;
      while (parentMap.has(curr)) {
        const parent = parentMap.get(curr)!;
        path.unshift(parent);
        curr = parent;
      }
      return path;
    }

    const currentTile = ARENA_GRAPH[current];
    if (!currentTile) continue;

    for (const neighborId of currentTile.adjacentIds) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parentMap.set(neighborId, current);
        queue.push(neighborId);
      }
    }
  }

  return null;
}
