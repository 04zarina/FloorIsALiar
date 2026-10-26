import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { MirrorBall } from './MirrorBall';
import { SpeakerStack } from './SpeakerStacks';

export const DiscoHallEnvironment: React.FC = () => {
  // Generate a procedural 1970s checkered dance-floor canvas texture for the lower abyss floor
  const checkerTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const tileSize = 64;
      for (let x = 0; x < 512; x += tileSize) {
        for (let y = 0; y < 512; y += tileSize) {
          const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          ctx.fillStyle = isEven ? '#381645' : '#1c0a24';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }, []);

  return (
    <group>
      {/* 1. Distant Checkered Dance Floor far below (y = -14) so arena visibly floats */}
      {/* raycast={() => null} ensures clicks on background never intercept tile raycasts */}
      <mesh
        position={[0, -14, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={() => null}
      >
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial
          map={checkerTexture}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Curved Disco Hall Dome / Perimeter Enclosure */}
      <mesh position={[0, -5, 0]} raycast={() => null}>
        <cylinderGeometry args={[45, 45, 35, 32, 1, true]} />
        <meshStandardMaterial
          color="#220c2a"
          roughness={0.9}
          metalness={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. Ceiling Truss Ring holding the lighting & mirror balls */}
      <mesh position={[0, 13, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <torusGeometry args={[18, 0.2, 8, 32]} />
        <meshStandardMaterial color="#471D57" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 4. Giant Speaker Stacks at the 4 lower corners */}
      <SpeakerStack position={[-16, -14, -16]} rotation={[0, Math.PI / 4, 0]} />
      <SpeakerStack position={[16, -14, -16]} rotation={[0, -Math.PI / 4, 0]} />
      <SpeakerStack position={[-16, -14, 16]} rotation={[0, (3 * Math.PI) / 4, 0]} />
      <SpeakerStack position={[16, -14, 16]} rotation={[0, -(3 * Math.PI) / 4, 0]} />

      {/* 5. Multiple Hanging Faceted Mirror Balls */}
      <MirrorBall position={[0, 9.5, 0]} radius={1.6} rotationSpeed={0.3} />
      <MirrorBall position={[-9, 8.5, -4]} radius={1.0} rotationSpeed={-0.45} />
      <MirrorBall position={[9, 8.5, 4]} radius={1.1} rotationSpeed={0.4} />

      {/* 6. Drifting Golden & Pink Confetti Sparkles in the air */}
      <Sparkles
        count={80}
        scale={[28, 16, 28]}
        position={[0, 2, 0]}
        size={4}
        speed={0.5}
        color="#FFC83B"
        opacity={0.65}
      />
      <Sparkles
        count={50}
        scale={[28, 16, 28]}
        position={[0, 2, 0]}
        size={3.5}
        speed={0.4}
        color="#FF3377"
        opacity={0.6}
      />
    </group>
  );
};
