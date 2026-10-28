import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { DiscoHallEnvironment } from './DiscoHallEnvironment';
import { ArenaGrid } from './ArenaGrid';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { disposeSceneResources, TILE_SPACING } from './materials';
import type { Level } from '../graph/tileGraph';
import type { EffectMap } from '../logic/rules';

export interface DiscoSceneProps {
  level: Level;
  effectMap: EffectMap;
  resetKey: string;
  inputEnabled: boolean;
  currentTileId: string;
  onTileChanged: (tileId: string) => void;
  onInvalidMove: (tileId: string) => void;
  onExitReached?: () => void;
  onFell?: () => void;
  isOverview: boolean;
}

export const DiscoScene: React.FC<DiscoSceneProps> = ({
  level, effectMap, resetKey, inputEnabled, currentTileId,
  onTileChanged, onInvalidMove, onExitReached, onFell, isOverview,
}) => {
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.45, -6 * TILE_SPACING));

  const handleCameraPlayerPosUpdate = useCallback((pos: [number, number, number]) => {
    playerPosRef.current.set(pos[0], pos[1], pos[2]);
  }, []);

  useEffect(() => {
    return () => {
      disposeSceneResources();
    };
  }, []);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        camera={{ position: [0, 3, -6 * TILE_SPACING - 4], fov: 52, near: 0.3, far: 140 }}
        className="w-full h-full"
      >
        <color attach="background" args={['#2A1033']} />
        <fog attach="fog" args={['#2A1033', 30, 75]} />

        <ThirdPersonCamera playerPosRef={playerPosRef} isOverview={isOverview} />
        <Lighting />
        <DiscoHallEnvironment />

        <ArenaGrid
          level={level}
          effectMap={effectMap}
          resetKey={resetKey}
          inputEnabled={inputEnabled}
          currentTileId={currentTileId}
          onTileChanged={onTileChanged}
          onCameraPlayerPosUpdate={handleCameraPlayerPosUpdate}
          onInvalidMove={onInvalidMove}
          onExitReached={onExitReached}
          onFell={onFell}
        />
      </Canvas>
    </div>
  );
};