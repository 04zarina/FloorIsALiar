import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Lighting: React.FC = () => {
  const spotMustardRef = useRef<THREE.SpotLight>(null);
  const spotPinkRef = useRef<THREE.SpotLight>(null);

  // Gentle, slow pan of the soft disco spotlights
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.4;
    if (spotMustardRef.current) {
      spotMustardRef.current.position.x = Math.sin(t) * 8;
      spotMustardRef.current.position.z = Math.cos(t) * 8;
    }
    if (spotPinkRef.current) {
      spotPinkRef.current.position.x = -Math.sin(t + 1) * 8;
      spotPinkRef.current.position.z = -Math.cos(t + 1) * 8;
    }
  });

  return (
    <>
      {/* Bright warm-white ambient fill: keeps the white character readable */}
      <ambientLight color="#FFF4DC" intensity={1.7} />

      {/* Sky/ground fill: cream from above, grape bounce light from below */}
      <hemisphereLight args={['#FFF4DC', '#9C41B3', 1.1]} />

      {/* Warm cream key light with soft shadows */}
      <directionalLight
        position={[10, 16, 12]}
        intensity={1.8}
        color="#FFF4DC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />

      {/* Front fill: lights the side of the character that faces the camera */}
      <directionalLight position={[0, 6, -12]} intensity={1.2} color="#FFFFFF" />

      {/* Gentle teal fill from the opposite flank */}
      <directionalLight position={[-10, 8, -10]} intensity={0.5} color="#00A896" />

      {/* Soft moving disco spotlight: Mustard Gold */}
      <spotLight
        ref={spotMustardRef}
        position={[6, 11, 6]}
        target-position={[0, 0, 0]}
        color="#FFC83B"
        intensity={2.2}
        angle={0.55}
        penumbra={0.7}
        distance={25}
      />

      {/* Soft moving disco spotlight: Hot Pink */}
      <spotLight
        ref={spotPinkRef}
        position={[-6, 11, -6]}
        target-position={[0, 0, 0]}
        color="#FF3377"
        intensity={1.8}
        angle={0.55}
        penumbra={0.7}
        distance={25}
      />

      {/* Soft overhead teal dance floor wash */}
      <pointLight position={[0, 7, 0]} color="#00A896" intensity={1.2} distance={20} decay={2} />
    </>
  );
};