import { describe, it, expect } from 'vitest';
import {
  ARENA_GRAPH,
  getTile,
  getAllTiles,
  getNeighbors,
  isAdjacent,
  findPath,
  getReachableTiles,
} from '../src/game/graph/tileGraph';

describe('Enlarged 7x14 Tile Graph Adjacency & Pure Graph Logic', () => {
  it('loads all arena graph tiles within the 7x14 coordinate boundary', () => {
    const tiles = getAllTiles();
    expect(tiles.length).toBeGreaterThan(25);

    const ids = new Set<string>();
    for (const tile of tiles) {
      expect(ids.has(tile.id)).toBe(false);
      ids.add(tile.id);

      // Verify grid spans 7 columns (-3 to +3) and 14 rows (-6 to +7)
      expect(tile.x).toBeGreaterThanOrEqual(-3);
      expect(tile.x).toBeLessThanOrEqual(3);
      expect(tile.z).toBeGreaterThanOrEqual(-6);
      expect(tile.z).toBeLessThanOrEqual(7);
      expect(Array.isArray(tile.adjacentIds)).toBe(true);
    }
  });

  it('correctly checks adjacency between directly connected tiles', () => {
    expect(isAdjacent('start', 'hub_start')).toBe(true);
    expect(isAdjacent('hub_start', 'start')).toBe(true);
    expect(isAdjacent('hub_start', 'r_1')).toBe(true);
    expect(isAdjacent('hub_start', 'c_1')).toBe(true);
    expect(isAdjacent('hub_start', 'l_1')).toBe(true);
  });

  it('correctly rejects non-adjacent / invalid moves', () => {
    // Start cannot jump straight to exit or distant tiles
    expect(isAdjacent('start', 'exit')).toBe(false);
    expect(isAdjacent('start', 'r_2')).toBe(false);
    expect(isAdjacent('l_1', 'r_1')).toBe(false);

    // Same tile is not adjacent to itself
    expect(isAdjacent('start', 'start')).toBe(false);

    // Non-existent IDs return false
    expect(isAdjacent('unknown_tile', 'start')).toBe(false);
    expect(isAdjacent('start', 'unknown_tile')).toBe(false);
  });

  it('guarantees bidirectional edge symmetry across the entire 7x14 graph', () => {
    for (const tile of getAllTiles()) {
      for (const neighborId of tile.adjacentIds) {
        const neighbor = getTile(neighborId);
        expect(neighbor).toBeDefined();
        expect(
          neighbor!.adjacentIds,
          `Tile ${neighborId} must have reverse link to ${tile.id}`
        ).toContain(tile.id);
      }
    }
  });

  it('retrieves neighbor tiles properly', () => {
    const neighbors = getNeighbors('hub_start');
    const ids = neighbors.map((n) => n.id);
    expect(ids).toContain('start');
    expect(ids).toContain('r_1');
    expect(ids).toContain('c_1');
    expect(ids).toContain('l_1');

    const empty = getNeighbors('non_existent');
    expect(empty).toEqual([]);
  });

  it('retrieves reachable tiles for valid and invalid IDs', () => {
    const reachable = getReachableTiles('start');
    expect(reachable).toEqual(['hub_start']);

    const invalid = getReachableTiles('ghost_tile');
    expect(invalid).toEqual([]);
  });
});

describe('Pathfinding & Three Distinct Routes of Different Lengths', () => {
  it('finds shortest path from START to EXIT using findPath', () => {
    const path = findPath('start', 'exit');
    expect(path).not.toBeNull();
    expect(path![0]).toBe('start');
    expect(path![path!.length - 1]).toBe('exit');

    // Every step in the returned path must be strictly adjacent
    for (let i = 0; i < path!.length - 1; i++) {
      expect(isAdjacent(path![i], path![i + 1])).toBe(true);
    }
  });

  it('verifies that at least THREE distinct routes of different lengths exist between START and EXIT', () => {
    // Route 1 (Right branch: Shortest / Direct)
    const rightRoute = [
      'start',
      'hub_start',
      'r_1',
      'r_2',
      'r_3',
      'r_4',
      'r_5',
      'r_6',
      'r_7',
      'r_8',
      'r_9',
      'hub_exit_pre',
      'hub_exit',
      'exit',
    ];

    // Route 2 (Center branch: Medium / Balanced)
    const centerRoute = [
      'start',
      'hub_start',
      'c_1',
      'c_2',
      'c_3',
      'c_4',
      'c_5',
      'c_6',
      'c_7',
      'c_8',
      'c_9',
      'c_10',
      'hub_exit_pre',
      'hub_exit',
      'exit',
    ];

    // Route 3 (Left-flank branch: Longest / Safest)
    const leftRoute = [
      'start',
      'hub_start',
      'l_1',
      'l_2',
      'l_3',
      'l_4',
      'l_5',
      'l_6',
      'l_7',
      'l_8',
      'l_9',
      'l_10',
      'l_11',
      'hub_exit_pre',
      'hub_exit',
      'exit',
    ];

    // 1. Verify every step along each of the three routes is valid and adjacent
    for (let i = 0; i < rightRoute.length - 1; i++) {
      expect(isAdjacent(rightRoute[i], rightRoute[i + 1])).toBe(true);
    }
    for (let i = 0; i < centerRoute.length - 1; i++) {
      expect(isAdjacent(centerRoute[i], centerRoute[i + 1])).toBe(true);
    }
    for (let i = 0; i < leftRoute.length - 1; i++) {
      expect(isAdjacent(leftRoute[i], leftRoute[i + 1])).toBe(true);
    }

    // 2. Verify all three routes have visibly different lengths
    const rightLength = rightRoute.length;
    const centerLength = centerRoute.length;
    const leftLength = leftRoute.length;

    expect(rightLength).not.toBe(centerLength);
    expect(centerLength).not.toBe(leftLength);
    expect(rightLength).not.toBe(leftLength);
    expect(rightLength < centerLength && centerLength < leftLength).toBe(true);

    // 3. Verify intermediate route tiles are disjoint between the main branches
    const rightIntermediate = rightRoute.slice(2, 11);
    const centerIntermediate = centerRoute.slice(2, 12);
    const leftIntermediate = leftRoute.slice(2, 13);

    for (const rTile of rightIntermediate) {
      expect(leftIntermediate).not.toContain(rTile);
    }
  });

  it('returns single node path when start equals target', () => {
    expect(findPath('hub_start', 'hub_start')).toEqual(['hub_start']);
  });

  it('returns null when pathfinding with unknown tiles', () => {
    expect(findPath('start', 'nowhere')).toBeNull();
    expect(findPath('nowhere', 'exit')).toBeNull();
  });
});
