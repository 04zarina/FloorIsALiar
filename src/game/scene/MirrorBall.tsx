import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mirrorBallMaterial } from './materials';

interface MirrorBallProps {
  position?: [number, number, number];
  radius?: number;
  rotationSpeed?: number;
}

export const MirrorBall: React.FC<MirrorBallProps> = ({
  position = [0, 9, 0],
  radius = 1.3,
  rotationSpeed = 0.35,
}) => {
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (ballRef.current) {
      ballRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group position={position}>
      {/* Hanging metallic cable */}
      <mesh position={[0, 4, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.03, 0.03, 8, 8]} />
        <meshStandardMaterial color="#471D57" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Faceted Mirror Ball - raycast disabled so rays pass cleanly to tiles */}
      <mesh
        ref={ballRef}
        material={mirrorBallMaterial}
        castShadow
        raycast={() => null}
      >
        <sphereGeometry args={[radius, 22, 14]} />
      </mesh>

      {/* Internal warm spotlight beam */}
      <pointLight color="#FFF4DC" intensity={0.9} distance={14} decay={2} position={[0, -0.4, 0]} />
    </group>
  );
};
