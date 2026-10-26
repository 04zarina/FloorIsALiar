import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GraphTile } from '../graph/tileGraph';
import {
  sharedTileBaseGeometry,
  sharedTileTopGeometry,
  sharedTileUnderPlate,
  tileMaterials,
  tileTopMaterials,
  underPlateMaterial,
  TILE_SPACING,
} from './materials';

// Reusable material for reachable hover highlight
const hoverReachableMaterial = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  roughness: 0.1,
  metalness: 0.4,
});

// Reusable material for unreachable hover warning
const hoverUnreachableMaterial = new THREE.MeshStandardMaterial({
  color: '#772244',
  roughness: 0.6,
  metalness: 0.1,
});

export interface TileMeshProps {
  data: GraphTile;
  isCurrent: boolean;
  isReachable: boolean;
  onTileClick: (tileId: string) => void;
  rejectedTileId: string | null;
  clickedTileId: string | null;
}

export const TileMesh: React.FC<TileMeshProps> = ({
  data,
  isCurrent,
  isReachable,
  onTileClick,
  rejectedTileId,
  clickedTileId,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation timers for squash and nope-shake feedback
  const squashTime = useRef(0);
  const shakeTime = useRef(0);

  const posX = data.x * TILE_SPACING;
  const posZ = data.z * TILE_SPACING;
  const baseY = 0;

  // Trigger squash animation when clicked validly
  useEffect(() => {
    if (clickedTileId === data.id) {
      squashTime.current = 0.35; // duration in seconds
    }
  }, [clickedTileId, data.id]);

  // Trigger nope shake when clicked invalidly
  useEffect(() => {
    if (rejectedTileId === data.id) {
      shakeTime.current = 0.35; // duration in seconds
    }
  }, [rejectedTileId, data.id]);

  // Clean cursor on unmount
  useEffect(() => {
    return () => {
      if (isHovered) {
        document.body.style.cursor = 'auto';
      }
    };
  }, [isHovered]);

  // Unified Frame Loop: Handles staggered bob, hover lift, squash pop, and nope shake
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // 1. Base staggered floating bob
    let currentY = baseY + Math.sin(t * 1.5 + data.staggerOffset) * 0.08;
    let currentX = posX;

    // 2. Hover lift (reachable tiles float slightly higher on inspection)
    if (isHovered && isReachable) {
      currentY += 0.14;
    }

    // 3. Squash-and-pop bounce on valid click
    if (squashTime.current > 0) {
      squashTime.current -= delta;
      const progress = 1 - squashTime.current / 0.35;
      // Parabolic squash: dips to 0.78 scale then pops back
      const squashY = 1.0 - Math.sin(progress * Math.PI) * 0.22;
      const stretchXZ = 1.0 + Math.sin(progress * Math.PI) * 0.08;
      groupRef.current.scale.set(stretchXZ, squashY, stretchXZ);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }

    // 4. "Nope" horizontal wiggle shake on invalid click
    if (shakeTime.current > 0) {
      shakeTime.current -= delta;
      const shakeProgress = shakeTime.current / 0.35;
      currentX += Math.sin(t * 40) * 0.12 * shakeProgress;
    }

    groupRef.current.position.y = currentY;
    groupRef.current.position.x = currentX;
    groupRef.current.position.z = posZ;
  });

  // --- Real Raycasting Pointer Handlers ---

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // Only the topmost tile gets this raycast event
    setIsHovered(true);
    document.body.style.cursor = isReachable ? 'pointer' : 'not-allowed';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // Stop propagation to avoid bubbling and click-through
    onTileClick(data.id);
  };

  // Determine top surface material based on state
  const topMaterial = isHovered
    ? isReachable
      ? hoverReachableMaterial
      : hoverUnreachableMaterial
    : tileTopMaterials[data.type];

  return (
    <group
      ref={groupRef}
      position={[posX, baseY, posZ]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {/* 1. Base Tile Body */}
      <mesh
        geometry={sharedTileBaseGeometry}
        material={tileMaterials[data.type]}
        castShadow
        receiveShadow
      />

      {/* 2. Top Dance-Floor Surface Inset (Highlights on hover) */}
      <mesh
        position={[0, 0.15, 0]}
        geometry={sharedTileTopGeometry}
        material={topMaterial}
        receiveShadow
      />

      {/* 3. Dark Under-rim Outline */}
      <mesh
        position={[0, -0.16, 0]}
        geometry={sharedTileUnderPlate}
        material={underPlateMaterial}
        receiveShadow
      />

      {/* 4. Active Current Player Indicator Ring */}
      {isCurrent && (
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.72, 24]} />
          <meshBasicMaterial color="#FFC83B" transparent opacity={0.8} />
        </mesh>
      )}

      {/* 5. Reachable Glowing Border Hint (subtle dotted outline for reachable tiles) */}
      {isReachable && !isHovered && (
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.78, 4]} />
          <meshBasicMaterial color="#00A896" transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
};
