/**
 * Pure TypeScript Movement Queue for chaining hops in FloorIsALiar.
 * Allows queuing up to 2 pending moves so hops chain seamlessly without stopping.
 */

export interface MovementQueue {
  pendingMoves: string[];
  maxPending: number;
}

export function createMovementQueue(maxPending = 2): MovementQueue {
  return {
    pendingMoves: [],
    maxPending,
  };
}

/**
 * Returns true if the queue can accept another pending move.
 */
export function canEnqueue(queue: MovementQueue): boolean {
  return queue.pendingMoves.length < queue.maxPending;
}

/**
 * Determines the origin tile ID that the next queued move must be adjacent to:
 * - If there are already queued moves, it must be adjacent to the last move in the queue.
 * - Otherwise, if the player is currently mid-hop, it must be adjacent to the landing target.
 * - Otherwise, it must be adjacent to the player's current stationary tile.
 */
export function getExpectedOrigin(
  queue: MovementQueue,
  currentTileId: string,
  activeTargetId: string | null
): string {
  if (queue.pendingMoves.length > 0) {
    return queue.pendingMoves[queue.pendingMoves.length - 1];
  }
  if (activeTargetId) {
    return activeTargetId;
  }
  return currentTileId;
}

/**
 * Attempts to enqueue a tile move. Validates:
 * 1. Queue capacity (max 2 pending moves)
 * 2. Next tile is strictly adjacent to the expected origin tile
 * 3. Next tile is not a duplicate of the expected origin
 */
export function tryEnqueue(
  queue: MovementQueue,
  nextTileId: string,
  currentTileId: string,
  activeTargetId: string | null,
  isAdjacentFn: (a: string, b: string) => boolean
): { success: boolean; reason?: 'full' | 'not_adjacent' | 'same_tile' } {
  if (!canEnqueue(queue)) {
    return { success: false, reason: 'full' };
  }

  const expectedOrigin = getExpectedOrigin(queue, currentTileId, activeTargetId);

  if (nextTileId === expectedOrigin) {
    return { success: false, reason: 'same_tile' };
  }

  if (!isAdjacentFn(expectedOrigin, nextTileId)) {
    return { success: false, reason: 'not_adjacent' };
  }

  queue.pendingMoves.push(nextTileId);
  return { success: true };
}

/**
 * Dequeues and returns the next pending tile ID, or null if empty.
 */
export function dequeue(queue: MovementQueue): string | null {
  return queue.pendingMoves.shift() ?? null;
}

/**
 * Returns the current queue length.
 */
export function getQueueLength(queue: MovementQueue): number {
  return queue.pendingMoves.length;
}

/**
 * Clears all pending moves.
 */
export function clearQueue(queue: MovementQueue): void {
  queue.pendingMoves = [];
}
