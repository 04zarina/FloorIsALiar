import { describe, it, expect } from 'vitest';
import {
  createMovementQueue,
  canEnqueue,
  getExpectedOrigin,
  tryEnqueue,
  dequeue,
  clearQueue,
} from '../src/game/graph/movementQueue';

// Mock adjacency function for testing
const mockAdjacencyMap: Record<string, string[]> = {
  tile_A: ['tile_B', 'tile_X'],
  tile_B: ['tile_A', 'tile_C'],
  tile_C: ['tile_B', 'tile_D'],
  tile_D: ['tile_C', 'tile_E'],
  tile_E: ['tile_D'],
  tile_X: ['tile_A'],
  tile_Z: [],
};

const isAdj = (a: string, b: string) => mockAdjacencyMap[a]?.includes(b) ?? false;

describe('Movement Queue: Chaining & Capacity Limits', () => {
  it('creates an empty movement queue with default limit of 2', () => {
    const q = createMovementQueue();
    expect(q.pendingMoves).toEqual([]);
    expect(q.maxPending).toBe(2);
    expect(canEnqueue(q)).toBe(true);
  });

  it('enqueues a valid adjacent move when player is stationary', () => {
    const q = createMovementQueue(2);
    const result = tryEnqueue(q, 'tile_B', 'tile_A', null, isAdj);

    expect(result.success).toBe(true);
    expect(q.pendingMoves).toEqual(['tile_B']);
    expect(canEnqueue(q)).toBe(true);
  });

  it('rejects moves that are not adjacent to the current stationary tile', () => {
    const q = createMovementQueue(2);
    const result = tryEnqueue(q, 'tile_C', 'tile_A', null, isAdj);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('not_adjacent');
    expect(q.pendingMoves).toEqual([]);
  });

  it('rejects moves that are the same as the current tile', () => {
    const q = createMovementQueue(2);
    const result = tryEnqueue(q, 'tile_A', 'tile_A', null, isAdj);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('same_tile');
  });

  it('validates against the activeTargetId when mid-hop and queue is empty', () => {
    const q = createMovementQueue(2);
    // Player is hopping from tile_A towards tile_B (activeTargetId = 'tile_B')
    // Clicking tile_C (adjacent to tile_B) should succeed!
    const result = tryEnqueue(q, 'tile_C', 'tile_A', 'tile_B', isAdj);

    expect(result.success).toBe(true);
    expect(q.pendingMoves).toEqual(['tile_C']);
  });

  it('allows queuing up to 2 pending moves to chain hops without stopping', () => {
    const q = createMovementQueue(2);
    // Player is hopping from A to B (activeTargetId = 'tile_B')
    // 1st queued move: C (adjacent to B)
    const res1 = tryEnqueue(q, 'tile_C', 'tile_A', 'tile_B', isAdj);
    expect(res1.success).toBe(true);
    expect(canEnqueue(q)).toBe(true);

    // 2nd queued move: D (adjacent to C)
    const res2 = tryEnqueue(q, 'tile_D', 'tile_A', 'tile_B', isAdj);
    expect(res2.success).toBe(true);
    expect(q.pendingMoves).toEqual(['tile_C', 'tile_D']);
    expect(canEnqueue(q)).toBe(false);

    // 3rd move should be rejected because queue is at max capacity (2)
    const res3 = tryEnqueue(q, 'tile_E', 'tile_A', 'tile_B', isAdj);
    expect(res3.success).toBe(false);
    expect(res3.reason).toBe('full');
    expect(q.pendingMoves).toEqual(['tile_C', 'tile_D']);
  });

  it('dequeues moves in FIFO order and frees up queue capacity', () => {
    const q = createMovementQueue(2);
    tryEnqueue(q, 'tile_B', 'tile_A', null, isAdj);
    tryEnqueue(q, 'tile_C', 'tile_A', null, isAdj);

    expect(canEnqueue(q)).toBe(false);

    const first = dequeue(q);
    expect(first).toBe('tile_B');
    expect(canEnqueue(q)).toBe(true);

    const second = dequeue(q);
    expect(second).toBe('tile_C');
    expect(q.pendingMoves).toEqual([]);

    const empty = dequeue(q);
    expect(empty).toBeNull();
  });

  it('clears all pending moves when clearQueue is called', () => {
    const q = createMovementQueue(2);
    tryEnqueue(q, 'tile_B', 'tile_A', null, isAdj);
    tryEnqueue(q, 'tile_C', 'tile_A', null, isAdj);

    clearQueue(q);
    expect(q.pendingMoves).toEqual([]);
    expect(canEnqueue(q)).toBe(true);
  });
});
