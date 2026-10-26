import React from 'react';
import { speakerCabinetMaterial, speakerWooferMaterial, speakerRimMaterial } from './materials';

interface SpeakerStackProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

const SingleCabinet: React.FC<{ y: number }> = ({ y }) => (
  <group position={[0, y, 0]}>
    {/* Wooden Cabinet Box - raycast disabled so it never intercepts tile clicks */}
    <mesh
      material={speakerCabinetMaterial}
      castShadow
      receiveShadow
      raycast={() => null}
    >
      <boxGeometry args={[3.0, 3.2, 2.0]} />
    </mesh>

    {/* Upper Woofer */}
    <mesh
      position={[0, 0.6, 1.02]}
      rotation={[Math.PI / 2, 0, 0]}
      material={speakerWooferMaterial}
      raycast={() => null}
    >
      <cylinderGeometry args={[0.8, 0.8, 0.08, 20]} />
    </mesh>
    <mesh
      position={[0, 0.6, 1.05]}
      rotation={[Math.PI / 2, 0, 0]}
      material={speakerRimMaterial}
      raycast={() => null}
    >
      <ringGeometry args={[0.78, 0.88, 20]} />
    </mesh>

    {/* Lower Woofer */}
    <mesh
      position={[0, -0.6, 1.02]}
      rotation={[Math.PI / 2, 0, 0]}
      material={speakerWooferMaterial}
      raycast={() => null}
    >
      <cylinderGeometry args={[0.8, 0.8, 0.08, 20]} />
    </mesh>
    <mesh
      position={[0, -0.6, 1.05]}
      rotation={[Math.PI / 2, 0, 0]}
      material={speakerRimMaterial}
      raycast={() => null}
    >
      <ringGeometry args={[0.78, 0.88, 20]} />
    </mesh>
  </group>
);

export const SpeakerStack: React.FC<SpeakerStackProps> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      <SingleCabinet y={1.6} />
      <SingleCabinet y={4.9} />
      <SingleCabinet y={8.2} />
    </group>
  );
};
