import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterModel } from './CharacterModel';
import { getPrefersReducedMotion } from './PortalShader';

export interface StandInPlayerProps {
  currentPos: [number, number, number];
  targetPos: [number, number, number] | null;
  isExiting?: boolean;
  exitPortalPos?: [number, number, number];
  onHopComplete: () => void;
  onExitSequenceComplete?: () => void;
  onPositionUpdate: (pos: [number, number, number]) => void;
}

export const StandInPlayer: React.FC<StandInPlayerProps> = ({
  currentPos,
  targetPos,
  isExiting = false,
  exitPortalPos = [0, 1.35, 15.4],
  onHopComplete,
  onExitSequenceComplete,
  onPositionUpdate,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useMemo(() => getPrefersReducedMotion(), []);

  // Hop animation states: fast, snappy ~0.24s hop
  const isHopping = useRef(false);
  const hopStartTime = useRef(0);
  const startPos = useRef<[number, number, number]>([...currentPos]);
  const endPos = useRef<[number, number, number]>([...currentPos]);
  const HOP_DURATION = 0.24;

  // Exit portal sucking sequence states: ~0.8s spin, shrink, pull
  const exitStartTime = useRef(0);
  const exitStartPos = useRef<[number, number, number]>([...currentPos]);
  const exitCompleted = useRef(false);
  const EXIT_DURATION = 0.8;

  // React state mirrors for child presentation components
  const [hopState, setHopState] = useState<{ isHopping: boolean; progress: number }>({
    isHopping: false,
    progress: 0,
  });

  // Initial mount log for position verification
  useEffect(() => {
    console.log('Player Character Mounted at World Position:', currentPos);
    onPositionUpdate(currentPos);
  }, []);

  // Reset character completely when playing again (currentPos resets or isExiting turns false)
  useEffect(() => {
    if (!isExiting) {
      exitCompleted.current = false;
      exitStartTime.current = 0;
      isHopping.current = false;
      hopStartTime.current = 0;
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
  }, [isExiting, currentPos]);

  // When current position changes (e.g. restart to start pad), restore scale and orientation immediately
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

  // Trigger hop when targetPos changes
  useEffect(() => {
    if (
      !isExiting &&
      targetPos &&
      (targetPos[0] !== currentPos[0] || targetPos[2] !== currentPos[2])
    ) {
      isHopping.current = true;
      hopStartTime.current = 0;
      startPos.current = [...currentPos];
      endPos.current = [...targetPos];
      setHopState({ isHopping: true, progress: 0 });
    }
  }, [targetPos, currentPos, isExiting]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    // 1. Exit Portal Sucking Sequence: spin, shrink, and get pulled into doorway over ~0.8s
    if (isExiting) {
      if (exitCompleted.current) return;

      if (exitStartTime.current === 0) {
        exitStartTime.current = clock.getElapsedTime();
        exitStartPos.current = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z,
        ];
      }

      const elapsed = clock.getElapsedTime() - exitStartTime.current;
      const progress = Math.min(1.0, elapsed / EXIT_DURATION);

      // Accelerating ease-in pull toward the portal center
      const pullFactor = Math.pow(progress, 1.8);
      const [sx, sy, sz] = exitStartPos.current;
      const [tx, ty, tz] = exitPortalPos;

      const curX = THREE.MathUtils.lerp(sx, tx, pullFactor);
      const curY = THREE.MathUtils.lerp(sy, ty, pullFactor);
      const curZ = THREE.MathUtils.lerp(sz, tz, pullFactor);

      groupRef.current.position.set(curX, curY, curZ);

      // Sucking spin: rapid rotation into vortex (or gentle roll if reduced motion)
      const spinSpeed = reducedMotion ? 3.0 : 22.0;
      groupRef.current.rotation.y += spinSpeed * delta;

      // Sucking shrink: scale drops smoothly from 1.0 to 0
      const currentScale = Math.max(0.0001, 1.0 - Math.pow(progress, 1.4));
      groupRef.current.scale.set(currentScale, currentScale, currentScale);

      // Camera trailing
      onPositionUpdate([curX, curY, curZ]);

      if (progress >= 1.0) {
        exitCompleted.current = true;
        groupRef.current.scale.set(0, 0, 0);
        onExitSequenceComplete?.();
      }
      return;
    }

    // 2. Click-to-Move Hop Animation (~0.24s with small parabolic arc)
    if (isHopping.current) {
      if (hopStartTime.current === 0) {
        hopStartTime.current = clock.getElapsedTime();
      }

      const elapsed = clock.getElapsedTime() - hopStartTime.current;
      const progress = Math.min(1.0, elapsed / HOP_DURATION);

      setHopState({ isHopping: true, progress });

      // Smooth step easing curve
      const easeT = THREE.MathUtils.smoothstep(progress, 0, 1);

      const [x0, y0, z0] = startPos.current;
      const [x1, y1, z1] = endPos.current;

      const currentX = THREE.MathUtils.lerp(x0, x1, easeT);
      const currentZ = THREE.MathUtils.lerp(z0, z1, easeT);
      // Small, snappy parabolic jump arc peaking at ~0.85 units
      const jumpY =
        THREE.MathUtils.lerp(y0, y1, easeT) + Math.sin(progress * Math.PI) * 0.85;

      groupRef.current.position.set(currentX, jumpY, currentZ);

      // Face travel direction with smooth rotation
      const dx = x1 - x0;
      const dz = z1 - z0;
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        const targetAngle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = THREE.MathUtils.damp(
          groupRef.current.rotation.y,
          targetAngle,
          15,
          delta
        );
      }

      // Smooth camera trailing during active hops
      onPositionUpdate([currentX, jumpY, currentZ]);

      if (progress >= 1.0) {
        isHopping.current = false;
        hopStartTime.current = 0;
        setHopState({ isHopping: false, progress: 0 });
        groupRef.current.position.set(x1, y1, z1);
        onPositionUpdate([x1, y1, z1]);
        onHopComplete();
      }
    } else {
      // 3. Stationary Dancing Bob (dancer mesh bobs gently, ground anchor remains stable)
      const t = clock.getElapsedTime();
      const idleY = currentPos[1] + Math.sin(t * 3.0) * 0.04;
      groupRef.current.position.set(currentPos[0], idleY, currentPos[2]);
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
