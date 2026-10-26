import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  getAllTiles,
  getTile,
  isAdjacent,
  getReachableTiles,
} from '../graph/tileGraph';
import {
  createMovementQueue,
  tryEnqueue,
  dequeue,
  getExpectedOrigin,
  clearQueue,
  type MovementQueue,
} from '../graph/movementQueue';
import { TileMesh } from './TileMesh';
import { PortalDoor } from './PortalDoor';
import { StandInPlayer } from './StandInPlayer';
import { TILE_SPACING } from './materials';

export interface ArenaGridProps {
  currentTileId: string;
  onTileChanged: (newTileId: string) => void;
  onCameraPlayerPosUpdate: (pos: [number, number, number]) => void;
  onInvalidMove: (tileId: string) => void;
  onExitReached?: () => void;
}

export const ArenaGrid: React.FC<ArenaGridProps> = ({
  currentTileId,
  onTileChanged,
  onCameraPlayerPosUpdate,
  onInvalidMove,
  onExitReached,
}) => {
  const allTiles = useMemo(() => getAllTiles(), []);

  // Movement Queue (up to 2 pending moves queued)
  const queueRef = useRef<MovementQueue>(createMovementQueue(2));

  // Current active hop target
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [rejectedTileId, setRejectedTileId] = useState<string | null>(null);
  const [clickedTileId, setClickedTileId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  // Helper to compute 3D world position from tile ID
  const getTileWorldPos = useCallback((tileId: string): [number, number, number] => {
    const tile = getTile(tileId);
    if (!tile) return [0, 0.45, -6 * TILE_SPACING];
    return [tile.x * TILE_SPACING, 0.45, tile.z * TILE_SPACING];
  }, []);

  // Dynamic player coordinates
  const currentTileWorldPos = useMemo(
    () => getTileWorldPos(currentTileId),
    [currentTileId, getTileWorldPos]
  );
  const targetTileWorldPos = useMemo(
    () => (activeTargetId ? getTileWorldPos(activeTargetId) : null),
    [activeTargetId, getTileWorldPos]
  );

  // Reachable tiles: computed from the projected landing tile or current tile
  const expectedOrigin = useMemo(
    () => getExpectedOrigin(queueRef.current, currentTileId, activeTargetId),
    [currentTileId, activeTargetId]
  );

  const reachableIds = useMemo(
    () => getReachableTiles(expectedOrigin),
    [expectedOrigin]
  );

  // Raycast click handler for 3D tiles with move queuing
  const handleTileClick = useCallback(
    (tileId: string) => {
      // If stationary and clicking current tile, ignore
      if (!activeTargetId && tileId === currentTileId) return;

      if (!activeTargetId) {
        // Player is stationary: validate direct adjacency
        if (isAdjacent(currentTileId, tileId)) {
          setClickedTileId(tileId);
          setRejectedTileId(null);
          setActiveTargetId(tileId);
          setTimeout(() => setClickedTileId(null), 350);
        } else {
          setRejectedTileId(tileId);
          onInvalidMove(tileId);
          setTimeout(() => setRejectedTileId(null), 350);
        }
      } else {
        // Player is mid-hop: attempt to queue next move from projected destination
        const result = tryEnqueue(
          queueRef.current,
          tileId,
          currentTileId,
          activeTargetId,
          isAdjacent
        );

        if (result.success) {
          setClickedTileId(tileId);
          setRejectedTileId(null);
          setTimeout(() => setClickedTileId(null), 350);
        } else {
          setRejectedTileId(tileId);
          onInvalidMove(tileId);
          setTimeout(() => setRejectedTileId(null), 350);
        }
      }
    },
    [activeTargetId, currentTileId, onInvalidMove]
  );

  // Reset exit state and queued movement if currentTileId resets to start (e.g. playing again)
  React.useEffect(() => {
    if (currentTileId === 'start') {
      setIsExiting(false);
      setActiveTargetId(null);
      clearQueue(queueRef.current);
    }
  }, [currentTileId]);

  // Called when each hop completes
  const handleHopComplete = useCallback(() => {
    if (activeTargetId) {
      const landedTileId = activeTargetId;
      onTileChanged(landedTileId);

      // Check if exit tile was reached -> initiate exit portal vortex sequence
      if (landedTileId === 'exit') {
        setIsExiting(true);
        setActiveTargetId(null);
        return;
      }

      // Check if queue has a pending chained move
      const nextQueued = dequeue(queueRef.current);
      if (nextQueued) {
        // Chain immediately into next hop without stopping!
        setActiveTargetId(nextQueued);
      } else {
        setActiveTargetId(null);
      }
    }
  }, [activeTargetId, onTileChanged]);

  // Called when exit portal sucking animation (~0.8s) completes
  const handleExitSequenceComplete = useCallback(() => {
    onExitReached?.();
  }, [onExitReached]);

  // World coordinates of start and exit arches on 7x14 grid
  const startArchPos: [number, number, number] = [0, 0.2, -6 * TILE_SPACING];
  const exitArchPos: [number, number, number] = [0, 0.2, 7 * TILE_SPACING];
  const exitDoorwayCenterPos: [number, number, number] = [0, 1.35, 7 * TILE_SPACING];

  return (
    <group>
      {/* 3D Interactive Tiles with Raycast Event Handlers */}
      {allTiles.map((tile) => (
        <TileMesh
          key={tile.id}
          data={tile}
          isCurrent={tile.id === currentTileId}
          isReachable={reachableIds.includes(tile.id)}
          onTileClick={handleTileClick}
          rejectedTileId={rejectedTileId}
          clickedTileId={clickedTileId}
        />
      ))}

      {/* START Door Arch with START signboard */}
      <PortalDoor position={startArchPos} type="entry" />

      {/* EXIT Portal Arch with EXIT signboard */}
      <PortalDoor position={exitArchPos} type="exit" />

      {/* Player character that hops smoothly along chained hops and gets sucked into exit */}
      <StandInPlayer
        currentPos={currentTileWorldPos}
        targetPos={targetTileWorldPos}
        isExiting={isExiting}
        exitPortalPos={exitDoorwayCenterPos}
        onHopComplete={handleHopComplete}
        onExitSequenceComplete={handleExitSequenceComplete}
        onPositionUpdate={onCameraPlayerPosUpdate}
      />
    </group>
  );
};
