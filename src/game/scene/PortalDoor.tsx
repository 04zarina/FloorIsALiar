import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import {
  archMaterial,
  pulsingRingGeometry,
  sharedPortalDoorGeometry,
} from './materials';
import {
  sharedPortalMaterial,
  updatePortalShader,
  getPrefersReducedMotion,
} from './PortalShader';

interface PortalDoorProps {
  position: [number, number, number];
  type: 'entry' | 'exit';
}

export const PortalDoor: React.FC<PortalDoorProps> = ({ position, type }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const isExit = type === 'exit';
  const label = isExit ? 'EXIT' : 'START';
  const accentColor = isExit ? '#FFC83B' : '#00A896';

  // Detect reduced-motion preference once at mount
  const reducedMotion = useMemo(() => getPrefersReducedMotion(), []);

  // Animate the subtle pulsing ring and swirling portal shader without per-frame allocations
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (ringRef.current) {
      const pulseSpeed = reducedMotion ? 1.5 : 3.0;
      const s = 1.0 + Math.sin(t * pulseSpeed) * 0.12;
      ringRef.current.scale.set(s, s, s);
    }

    if (isExit) {
      updatePortalShader(sharedPortalMaterial, t, reducedMotion);
    }
  });

  return (
    <group position={position}>
      {/* 1. Left Arch Pillar */}
      <mesh position={[-1.0, 1.4, 0]} material={archMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.26, 2.8, 0.26]} />
      </mesh>

      {/* 2. Right Arch Pillar */}
      <mesh position={[1.0, 1.4, 0]} material={archMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.26, 2.8, 0.26]} />
      </mesh>

      {/* 3. Arch Top Crossbar */}
      <mesh position={[0, 2.85, 0]} material={archMaterial} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.35, 0.3]} />
      </mesh>

      {/* 4. Swirling Spiral Glowing Doorway (Exit Portal Only) */}
      {isExit && (
        <>
          <mesh
            position={[0, 1.35, 0]}
            geometry={sharedPortalDoorGeometry}
            material={sharedPortalMaterial}
          />
          {/* Rising sparkles drifting upward through doorway */}
          <Sparkles
            count={28}
            scale={[1.6, 2.5, 0.5]}
            position={[0, 1.35, 0]}
            color="#FFC83B"
            speed={reducedMotion ? 0.3 : 0.75}
            size={2.5}
            noise={0.4}
          />
        </>
      )}

      {/* 5. Colorful Gate Signboard Plate */}
      <mesh position={[0, 2.85, 0.18]}>
        <boxGeometry args={[1.6, 0.3, 0.06]} />
        <meshStandardMaterial color={accentColor} roughness={0.25} metalness={0.2} />
      </mesh>

      {/* 6. 3D Text Label on Signboard */}
      <Text
        position={[0, 2.85, 0.22]}
        fontSize={0.16}
        color="#18091D"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* 7. Subtle Pulsing Dance-Floor Target Ring on the floor in front of portal */}
      <mesh
        ref={ringRef}
        position={[0, 0.21, 0.35]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={pulsingRingGeometry}
      >
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 8. Soft Point Light inside the portal */}
      <pointLight
        position={[0, 1.4, 0.05]}
        color={accentColor}
        intensity={isExit ? 2.8 : 2.0}
        distance={isExit ? 8 : 6}
        decay={2}
      />
    </group>
  );
};
