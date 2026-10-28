import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import {
  cellId,
  getAdjacentCellIds,
  getReachableTiles,
  isAdjacent,
  parseCellId,
  type Level,
} from '../graph/tileGraph';
import {
  createMovementQueue,
  tryEnqueue,
  dequeue,
  getExpectedOrigin,
  clearQueue,
  type MovementQueue,
} from '../graph/movementQueue';
import { effectOf, resolveMove } from '../logic/movement';
import type { EffectMap } from '../logic/rules';
import { play } from '../audio/sound';
import { TileMesh } from './TileMesh';
import { PortalDoor } from './PortalDoor';
import { StandInPlayer } from './StandInPlayer';
import { Particles, type ParticlesHandle } from './Particles';
import { TILE_SPACING, TILE_WIDTH } from './materials';

export interface ArenaGridProps {
  level: Level;
  effectMap: EffectMap;
  resetKey: string;
  inputEnabled: boolean;
  currentTileId: string;
  onTileChanged: (newTileId: string) => void;
  onCameraPlayerPosUpdate: (pos: [number, number, number]) => void;
  onInvalidMove: (tileId: string) => void;
  onExitReached?: () => void;
  onFell?: () => void;
}

type Vec3 = [number, number, number];

const CELEBRATION_MS = 2600;
const CRUMBLE_DELAY_MS = 1000;
const HOP_WATCHDOG_MS = 900;

// Camera looks toward +z, so screen-left = +x.
const KEY_DIRS: Record<string, readonly [number, number]> = {
  ArrowUp: [0, 1], w: [0, 1], W: [0, 1],
  ArrowDown: [0, -1], s: [0, -1], S: [0, -1],
  ArrowLeft: [1, 0], a: [1, 0], A: [1, 0],
  ArrowRight: [-1, 0], d: [-1, 0], D: [-1, 0],
};

const worldPos = (id: string): Vec3 => {
  const { x, z } = parseCellId(id);
  return [x * TILE_SPACING, 0.45, z * TILE_SPACING];
};

export const ArenaGrid: React.FC<ArenaGridProps> = ({
  level, effectMap, resetKey, inputEnabled, currentTileId,
  onTileChanged, onCameraPlayerPosUpdate, onInvalidMove, onExitReached, onFell,
}) => {
  const queueRef = useRef<MovementQueue>(createMovementQueue(2));
  const pathRef = useRef<string[]>([]);
  const crumbleCellRef = useRef<string | null>(null);
  const crumbledRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<number[]>([]);
  const busyRef = useRef(false);
  const fallingRef = useRef(false);
  const clickRef = useRef<(id: string) => void>(() => {});
  const hopCompleteRef = useRef<() => void>(() => {});
  const particlesRef = useRef<ParticlesHandle>(null);

  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [rejectedTileId, setRejectedTileId] = useState<string | null>(null);
  const [clickedTileId, setClickedTileId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [crumbled, setCrumbled] = useState<string[]>([]);
  const [crumbling, setCrumbling] = useState<string[]>([]);
  const [fallPos, setFallPos] = useState<Vec3>([0, -14, 0]);

  const currentRef = useRef(currentTileId);
  const activeRef = useRef<string | null>(activeTargetId);
  const enabledRef = useRef(inputEnabled);
  currentRef.current = currentTileId;
  activeRef.current = activeTargetId;
  enabledRef.current = inputEnabled;

  const isSolid = useCallback(
    (id: string) => Boolean(level.byId[id]) && !crumbledRef.current.has(id),
    [level]
  );

  const flash = (set: (v: string | null) => void, id: string) => {
    set(id);
    timersRef.current.push(window.setTimeout(() => set(null), 350));
  };

  const startMove = useCallback(
    (from: string, to: string) => {
      const res = resolveMove(level, effectMap, crumbledRef.current, from, to);
      pathRef.current = res.cells.slice(1);
      crumbleCellRef.current = res.crumbleCell;

      const f = parseCellId(from);
      const t = parseCellId(to);
      const first = cellId(f.x + Math.sign(t.x - f.x), f.z + Math.sign(t.z - f.z));
      const eff =
        level.byId[first] && !crumbledRef.current.has(first)
          ? effectOf(level, effectMap, first)
          : 'safe';
      play(eff === 'bounce' ? 'bounce' : eff === 'slide' ? 'slide' : 'hop');

      setActiveTargetId(res.cells[0]);
    },
    [level, effectMap]
  );

  const startFall = useCallback((id: string) => {
    const [x, , z] = worldPos(id);
    busyRef.current = true;
    fallingRef.current = true;
    pathRef.current = [];
    clearQueue(queueRef.current);
    play('fall');
    setFallPos([x, -14, z]);
    setActiveTargetId(null);
    setIsExiting(true);
  }, []);

  const handleTileClick = useCallback(
    (tileId: string) => {
      if (!enabledRef.current || busyRef.current) return;
      const cur = currentRef.current;

      if (!activeTargetId) {
        if (tileId === cur) return;
        if (isAdjacent(cur, tileId)) {
          flash(setClickedTileId, tileId);
          startMove(cur, tileId);
        } else {
          flash(setRejectedTileId, tileId);
          onInvalidMove(tileId);
        }
      } else {
        const r = tryEnqueue(queueRef.current, tileId, cur, activeTargetId, isAdjacent);
        if (r.success) {
          flash(setClickedTileId, tileId);
        } else if (r.reason === 'not_adjacent') {
          flash(setRejectedTileId, tileId);
          onInvalidMove(tileId);
        }
        // 'full' / 'same_tile': ignore silently (no misleading message)
      }
    },
    [activeTargetId, startMove, onInvalidMove]
  );
  clickRef.current = handleTileClick;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const d = KEY_DIRS[e.key];
      if (!d) return;
      e.preventDefault();
      const origin = parseCellId(
        getExpectedOrigin(queueRef.current, currentRef.current, activeRef.current)
      );
      clickRef.current(cellId(origin.x + d[0], origin.z + d[1]));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // New round / level / restart: reset everything
  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    crumbledRef.current = new Set();
    setCrumbled([]);
    setCrumbling([]);
    pathRef.current = [];
    crumbleCellRef.current = null;
    busyRef.current = false;
    fallingRef.current = false;
    clearQueue(queueRef.current);
    setActiveTargetId(null);
    setIsExiting(false);
    setCelebrating(false);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      document.body.style.cursor = 'auto';
    };
  }, []);

  const startCelebration = useCallback(
    (exitId: string) => {
      busyRef.current = true;
      setActiveTargetId(null);
      setCelebrating(true);
      play('win');

      const [x, , z] = worldPos(exitId);
      const burst = () => particlesRef.current?.burst('confetti', [x, 1.3, z], 90);
      burst();
      [500, 1100, 1700].forEach((ms) => timersRef.current.push(window.setTimeout(burst, ms)));
      timersRef.current.push(window.setTimeout(() => onExitReached?.(), CELEBRATION_MS));
    },
    [onExitReached]
  );

  const handleHopComplete = useCallback(() => {
    if (!activeTargetId) return;
    const landed = activeTargetId;

    if (!isSolid(landed)) {
      startFall(landed);
      return;
    }

    onTileChanged(landed);
    currentRef.current = landed;

    const [lx, , lz] = worldPos(landed);
    particlesRef.current?.burst('dust', [lx, 0.35, lz], 6);

    if (pathRef.current.length > 0) {
      setActiveTargetId(pathRef.current.shift()!);
      return;
    }

    if (landed === level.exitId) {
      startCelebration(landed);
      return;
    }

    if (crumbleCellRef.current === landed) {
      const id = landed;
      // Warning phase: tile rattles and darkens for 1 second
      setCrumbling((c) => (c.includes(id) ? c : [...c, id]));
      timersRef.current.push(
        window.setTimeout(() => {
          crumbledRef.current.add(id);
          setCrumbled(Array.from(crumbledRef.current));
          setCrumbling((c) => c.filter((x) => x !== id));
          play('crumble');
          const [cx, , cz] = worldPos(id);
          particlesRef.current?.burst('dust', [cx, 0.3, cz], 14);
          if (currentRef.current === id && !activeRef.current && !busyRef.current) {
            startFall(id);
          }
        }, CRUMBLE_DELAY_MS)
      );
    }
    crumbleCellRef.current = null;

    const next = dequeue(queueRef.current);
    if (next && isAdjacent(landed, next)) {
      startMove(landed, next);
    } else {
      clearQueue(queueRef.current);
      setActiveTargetId(null);
    }
  }, [activeTargetId, isSolid, level.exitId, onTileChanged, startCelebration, startFall, startMove]);
  hopCompleteRef.current = handleHopComplete;

  // Watchdog: if a hop never finishes, finish it ourselves so movement can never freeze
  useEffect(() => {
    if (!activeTargetId) return;
    const target = activeTargetId;
    const id = window.setTimeout(() => {
      if (activeRef.current === target && !busyRef.current) {
        console.warn('[FloorIsALiar] hop watchdog recovered a stuck move to', target);
        hopCompleteRef.current();
      }
    }, HOP_WATCHDOG_MS);
    return () => window.clearTimeout(id);
  }, [activeTargetId]);

  const handleExitSequenceComplete = useCallback(() => {
    if (fallingRef.current) onFell?.();
  }, [onFell]);

  const visibleTiles = useMemo(
    () => level.tiles.filter((t) => !crumbled.includes(t.id)),
    [level, crumbled]
  );

  const expectedOrigin = getExpectedOrigin(queueRef.current, currentTileId, activeTargetId);
  const reachableIds = getReachableTiles(level, expectedOrigin).filter(
    (id) => !crumbled.includes(id)
  );
  const voidCells = inputEnabled
    ? getAdjacentCellIds(expectedOrigin).filter((id) => !isSolid(id))
    : [];

  const startTile = level.byId[level.startId];
  const exitTile = level.byId[level.exitId];
  const startArchPos: Vec3 = [startTile.x * TILE_SPACING, 0.2, startTile.z * TILE_SPACING];
  const exitArchPos: Vec3 = [exitTile.x * TILE_SPACING, 0.2, exitTile.z * TILE_SPACING];

  const currentPos = useMemo(() => worldPos(currentTileId), [currentTileId]);
  const targetPos = useMemo(
    () => (activeTargetId ? worldPos(activeTargetId) : null),
    [activeTargetId]
  );

  return (
    <group>
      {visibleTiles.map((tile) => (
        <TileMesh
          key={`${level.index}-${tile.id}`}
          data={tile}
          isCurrent={tile.id === currentTileId}
          isReachable={reachableIds.includes(tile.id)}
          isCrumbling={crumbling.includes(tile.id)}
          onTileClick={handleTileClick}
          rejectedTileId={rejectedTileId}
          clickedTileId={clickedTileId}
        />
      ))}

      {/* Clickable empty cells next to the player: stepping in means falling */}
      {voidCells.map((id) => {
        const [x, , z] = worldPos(id);
        return (
          <mesh
            key={`void-${id}`}
            position={[x, 0, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              handleTileClick(id);
            }}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <planeGeometry args={[TILE_WIDTH, TILE_WIDTH]} />
            <meshBasicMaterial color="#FF3377" transparent opacity={0.1} depthWrite={false} />
          </mesh>
        );
      })}

      <PortalDoor position={startArchPos} type="entry" />
      <PortalDoor position={exitArchPos} type="exit" />

      <Particles ref={particlesRef} />

      <StandInPlayer
        currentPos={currentPos}
        targetPos={targetPos}
        isExiting={isExiting}
        isCelebrating={celebrating}
        exitPortalPos={fallPos}
        onHopComplete={handleHopComplete}
        onExitSequenceComplete={handleExitSequenceComplete}
        onPositionUpdate={onCameraPlayerPosUpdate}
      />
    </group>
  );
};