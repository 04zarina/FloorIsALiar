import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterModel } from './CharacterModel';
import { getPrefersReducedMotion } from './PortalShader';

export interface StandInPlayerProps {
  currentPos: [number, number, number];
  targetPos: [number, number, number] | null;
  isExiting?: boolean;       // used for falling
  isCelebrating?: boolean;   // win dance
  exitPortalPos?: [number, number, number];
  onHopComplete: () => void;
  onExitSequenceComplete?: () => void;
  onPositionUpdate: (pos: [number, number, number]) => void;
}

export const StandInPlayer: React.FC<StandInPlayerProps> = ({
  currentPos,
  targetPos,
  isExiting = false,
  isCelebrating = false,
  exitPortalPos = [0, 1.35, 15.4],
  onHopComplete,
  onExitSequenceComplete,
  onPositionUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useMemo(() => getPrefersReducedMotion(), []);

  const isHopping = useRef(false);
  const hopStartTime = useRef(0);
  const startPos = useRef<[number, number, number]>([...currentPos]);
  const endPos = useRef<[number, number, number]>([...currentPos]);
  const HOP_DURATION = 0.24;

  const exitStartTime = useRef(0);
  const exitStartPos = useRef<[number, number, number]>([...currentPos]);
  const exitCompleted = useRef(false);
  const EXIT_DURATION = 0.8;

  const celebStart = useRef(0);

  const [hopState, setHopState] = useState<{ isHopping: boolean; progress: number }>({
    isHopping: false,
    progress: 0,
  });

  useEffect(() => {
    onPositionUpdate(currentPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset character when a round restarts or a celebration/fall ends
  useEffect(() => {
    if (!isExiting) {
      exitCompleted.current = false;
      exitStartTime.current = 0;
      isHopping.current = false;
      hopStartTime.current = 0;
      celebStart.current = 0;
      if (groupRef.current) {
        groupRef.current.scale.set(1, 1, 1);
        groupRef.current.rotation.set(0, 0, 0);
        groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      }
      setHopState({ isHopping: false, progress: 0 });
    } else if (!exitCompleted.current) {
      exitStartTime.current = 0;
      exitStartPos.current = [...currentPos];
    }
  }, [isExiting, isCelebrating, currentPos]);

  useEffect(() => {
    exitCompleted.current = false;
    exitStartTime.current = 0;
    isHopping.current = false;
    hopStartTime.current = 0;
    if (groupRef.current) {
      groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2]);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1, 1, 1);
    }
    setHopState({ isHopping: false, progress: 0 });
    onPositionUpdate(currentPos);
  }, [currentPos, onPositionUpdate]);

  useEffect(() => {
    if (
      !isExiting &&
      !isCelebrating &&
      targetPos &&
      (targetPos[0] !== currentPos[0] || targetPos[2] !== currentPos[2])
    ) {
      isHopping.current = true;
      hopStartTime.current = 0;
      startPos.current = [...currentPos];
      endPos.current = [...targetPos];
      setHopState({ isHopping: true, progress: 0 });
    }
  }, [targetPos, currentPos, isExiting, isCelebrating]);

  useFrame(({ clock }, delta) => {
    const g = groupRef.current;
    if (!g) return;

    // 1. Fall / exit sequence: spin, shrink, get pulled to a point
    if (isExiting) {
      if (exitCompleted.current) return;

      if (exitStartTime.current === 0) {
        exitStartTime.current = clock.getElapsedTime();
        exitStartPos.current = [g.position.x, g.position.y, g.position.z];
      }

      const elapsed = clock.getElapsedTime() - exitStartTime.current;
      const progress = Math.min(1.0, elapsed / EXIT_DURATION);
      const pull = Math.pow(progress, 1.8);
      const [sx, sy, sz] = exitStartPos.current;
      const [tx, ty, tz] = exitPortalPos;

      const curX = THREE.MathUtils.lerp(sx, tx, pull);
      const curY = THREE.MathUtils.lerp(sy, ty, pull);
      const curZ = THREE.MathUtils.lerp(sz, tz, pull);
      g.position.set(curX, curY, curZ);

      g.rotation.y += (reducedMotion ? 3.0 : 22.0) * delta;
      const s = Math.max(0.0001, 1.0 - Math.pow(progress, 1.4));
      g.scale.set(s, s, s);
      onPositionUpdate([curX, curY, curZ]);

      if (progress >= 1.0) {
        exitCompleted.current = true;
        g.scale.set(0, 0, 0);
        onExitSequenceComplete?.();
      }
      return;
    }

    // 2. Win dance: spin to face the camera, then jump and sway
    if (isCelebrating) {
      if (celebStart.current === 0) celebStart.current = clock.getElapsedTime();
      const t = clock.getElapsedTime() - celebStart.current;

      const spinT = Math.min(1, t / 0.7);
      const ease = 1 - Math.pow(1 - spinT, 3);
      // 1.5 turns ends facing the camera (the camera looks toward +z)
      const sway = spinT >= 1 && !reducedMotion ? Math.sin((t - 0.7) * 9) * 0.3 : 0;
      g.rotation.y = Math.PI * 3 * ease + sway;

      const jump = Math.abs(Math.sin(t * 6.5)) * (reducedMotion ? 0.3 : 0.95);
      g.position.set(currentPos[0], currentPos[1] + jump, currentPos[2]);

      g.rotation.z = reducedMotion ? 0 : Math.sin(t * 9) * 0.18;
      const squash = 1 + (jump / 0.95 - 0.5) * 0.12;
      g.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
      return;
    }

    // 3. Click/key hop (~0.24s with a small arc)
    if (isHopping.current) {
      if (hopStartTime.current === 0) hopStartTime.current = clock.getElapsedTime();

      const elapsed = clock.getElapsedTime() - hopStartTime.current;
      const progress = Math.min(1.0, elapsed / HOP_DURATION);
      setHopState({ isHopping: true, progress });

      const easeT = THREE.MathUtils.smoothstep(progress, 0, 1);
      const [x0, y0, z0] = startPos.current;
      const [x1, y1, z1] = endPos.current;

      const cx = THREE.MathUtils.lerp(x0, x1, easeT);
      const cz = THREE.MathUtils.lerp(z0, z1, easeT);
      const cy = THREE.MathUtils.lerp(y0, y1, easeT) + Math.sin(progress * Math.PI) * 0.85;
      g.position.set(cx, cy, cz);

      const dx = x1 - x0;
      const dz = z1 - z0;
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.atan2(dx, dz), 15, delta);
      }

      onPositionUpdate([cx, cy, cz]);

      if (progress >= 1.0) {
        isHopping.current = false;
        hopStartTime.current = 0;
        setHopState({ isHopping: false, progress: 0 });
        g.position.set(x1, y1, z1);
        onPositionUpdate([x1, y1, z1]);
        onHopComplete();
      }
    } else {
      // 4. Idle bob
      const t = clock.getElapsedTime();
      g.position.set(currentPos[0], currentPos[1] + Math.sin(t * 3.0) * 0.04, currentPos[2]);
    }
  });

  return (
    <group ref={groupRef} position={currentPos}>
      <CharacterModel
        isHopping={hopState.isHopping}
        hopProgress={hopState.progress}
        isExiting={isExiting}
        exitProgress={exitCompleted.current ? 1.0 : 0.0}
        worldPosition={currentPos}
      />
    </group>
  );
};