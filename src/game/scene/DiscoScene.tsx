import React, { useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Lighting } from './Lighting';
import { DiscoHallEnvironment } from './DiscoHallEnvironment';
import { ArenaGrid } from './ArenaGrid';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { disposeSceneResources, TILE_SPACING } from './materials';

export interface DiscoSceneProps {
  currentTileId: string;
  onTileChanged: (tileId: string) => void;
  onInvalidMove: (tileId: string) => void;
  onExitReached?: () => void;
  isOverview: boolean;
}

export const DiscoScene: React.FC<DiscoSceneProps> = ({
  currentTileId,
  onTileChanged,
  onInvalidMove,
  onExitReached,
  isOverview,
}) => {
  // Mutable 3D world position of player for zero-re-render, vibration-free 60/120fps camera follow
  const playerPosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(0, 0.45, -6 * TILE_SPACING)
  );

  const handleCameraPlayerPosUpdate = useCallback((pos: [number, number, number]) => {
    playerPosRef.current.set(pos[0], pos[1], pos[2]);
  }, []);

  // Cleanup shared WebGL resources when unmounting
  useEffect(() => {
    return () => {
      disposeSceneResources();
    };
  }, []);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 2]} // Performance capped DPR
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        camera={{
          position: [0, 5, -6 * TILE_SPACING - 7], // Behind entry tile on 7x14 grid
          fov: 46,
          near: 0.1,
          far: 140,
        }}
        className="w-full h-full"
      >
        {/* Dark disco-hall plum backdrop & distance fog */}
        <color attach="background" args={['#2A1033']} />
        <fog attach="fog" args={['#2A1033', 30, 75]} />

        {/* Dynamic smooth Third-Person Follow Camera & Overview Toggle */}
        <ThirdPersonCamera playerPosRef={playerPosRef} isOverview={isOverview} />

        {/* 1970s Warm Disco Lighting System */}
        <Lighting />

        {/* Surrounding Disco Hall Environment (Distant floor, mirror balls, speaker stacks, sparkles) */}
        <DiscoHallEnvironment />

        {/* Interactive Floating Arena Grid with Real Raycasting & Hop Chaining */}
        <ArenaGrid
          currentTileId={currentTileId}
          onTileChanged={onTileChanged}
          onCameraPlayerPosUpdate={handleCameraPlayerPosUpdate}
          onInvalidMove={onInvalidMove}
          onExitReached={onExitReached}
        />
      </Canvas>
    </div>
  );
};
