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

const hoverReachableMaterial = new THREE.MeshStandardMaterial({
  color: '#FFFFFF',
  roughness: 0.1,
  metalness: 0.4,
});

const hoverUnreachableMaterial = new THREE.MeshStandardMaterial({
  color: '#772244',
  roughness: 0.6,
  metalness: 0.1,
});

// Cracking tile warning look
const crumblingMaterial = new THREE.MeshStandardMaterial({
  color: '#4A1C12',
  roughness: 0.9,
  metalness: 0.0,
});

export interface TileMeshProps {
  data: GraphTile;
  isCurrent: boolean;
  isReachable: boolean;
  isCrumbling?: boolean;
  onTileClick: (tileId: string) => void;
  rejectedTileId: string | null;
  clickedTileId: string | null;
}

export const TileMesh: React.FC<TileMeshProps> = ({
  data,
  isCurrent,
  isReachable,
  isCrumbling = false,
  onTileClick,
  rejectedTileId,
  clickedTileId,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  const squashTime = useRef(0);
  const shakeTime = useRef(0);

  const posX = data.x * TILE_SPACING;
  const posZ = data.z * TILE_SPACING;
  const baseY = 0;

  useEffect(() => {
    if (clickedTileId === data.id) squashTime.current = 0.35;
  }, [clickedTileId, data.id]);

  useEffect(() => {
    if (rejectedTileId === data.id) shakeTime.current = 0.35;
  }, [rejectedTileId, data.id]);

  useEffect(() => {
    return () => {
      if (isHovered) document.body.style.cursor = 'auto';
    };
  }, [isHovered]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    let currentY = baseY + Math.sin(t * 1.5 + data.staggerOffset) * 0.08;
    let currentX = posX;

    if (isHovered && isReachable) currentY += 0.14;

    if (squashTime.current > 0) {
      squashTime.current -= delta;
      const progress = 1 - squashTime.current / 0.35;
      const squashY = 1.0 - Math.sin(progress * Math.PI) * 0.22;
      const stretchXZ = 1.0 + Math.sin(progress * Math.PI) * 0.08;
      groupRef.current.scale.set(stretchXZ, squashY, stretchXZ);
    } else {
      groupRef.current.scale.set(1, 1, 1);
    }

    if (shakeTime.current > 0) {
      shakeTime.current -= delta;
      const shakeProgress = shakeTime.current / 0.35;
      currentX += Math.sin(t * 40) * 0.12 * shakeProgress;
    }

    // Crumble warning: rattle and sink
    if (isCrumbling) {
      currentX += Math.sin(t * 55) * 0.07;
      currentY -= 0.1;
    }

    groupRef.current.position.y = currentY;
    groupRef.current.position.x = currentX;
    groupRef.current.position.z = posZ;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = isReachable ? 'pointer' : 'not-allowed';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onTileClick(data.id);
  };

  const topMaterial = isCrumbling
    ? crumblingMaterial
    : isHovered
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
      <mesh
        geometry={sharedTileBaseGeometry}
        material={tileMaterials[data.type]}
        castShadow
        receiveShadow
      />

      <mesh
        position={[0, 0.15, 0]}
        geometry={sharedTileTopGeometry}
        material={topMaterial}
        receiveShadow
      />

      <mesh
        position={[0, -0.16, 0]}
        geometry={sharedTileUnderPlate}
        material={underPlateMaterial}
        receiveShadow
      />

      {isCurrent && (
        <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.72, 24]} />
          <meshBasicMaterial color="#FFC83B" transparent opacity={0.8} />
        </mesh>
      )}

      {isReachable && !isHovered && !isCrumbling && (
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.72, 0.78, 4]} />
          <meshBasicMaterial color="#00A896" transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  );
};