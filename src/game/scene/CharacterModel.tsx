import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface CharacterModelProps {
  isHopping: boolean;
  hopProgress: number; // 0.0 to 1.0
  isExiting: boolean;
  exitProgress: number; // 0.0 to 1.0
  worldPosition?: [number, number, number];
}

/**
 * 1970s Retro Capsule Dancer - Fallback when GLB fails to load or during Suspense fetching.
 */
export const CapsuleCharacter: React.FC<{ isHopping?: boolean; hopProgress?: number }> = ({
  isHopping = false,
  hopProgress = 0,
}) => {
  const meshGroup = useRef<THREE.Group>(null);

  // Procedural squash & stretch for capsule
  useFrame(() => {
    if (!meshGroup.current) return;
    if (isHopping) {
      let sy = 1.0;
      let sxz = 1.0;
      if (hopProgress < 0.15) {
        // Takeoff squash
        const factor = Math.sin((hopProgress / 0.15) * Math.PI);
        sy = 1.0 - factor * 0.22;
        sxz = 1.0 + factor * 0.15;
      } else if (hopProgress < 0.85) {
        // Mid-air stretch
        const factor = Math.sin(((hopProgress - 0.15) / 0.7) * Math.PI);
        sy = 1.0 + factor * 0.22;
        sxz = 1.0 - factor * 0.12;
      } else {
        // Landing bounce
        const factor = Math.sin(((hopProgress - 0.85) / 0.15) * Math.PI);
        sy = 1.0 - factor * 0.15;
        sxz = 1.0 + factor * 0.1;
      }
      meshGroup.current.scale.set(sxz, sy, sxz);
    } else {
      meshGroup.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={meshGroup}>
      {/* Dancer Torso (Hot Pink Capsule) */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.3, 0.5, 8, 16]} />
        <meshStandardMaterial color="#FF3377" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Head (Warm Cream Sphere) */}
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#FFF4DC" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* 1970s Retro Sunglasses */}
      <mesh position={[0, 0.97, 0.22]} castShadow>
        <boxGeometry args={[0.34, 0.09, 0.08]} />
        <meshStandardMaterial color="#18091D" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Mustard Headband */}
      <mesh position={[0, 1.06, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 16]} />
        <meshStandardMaterial color="#FFC83B" roughness={0.35} metalness={0.3} />
      </mesh>

      {/* Floor Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#18091D" opacity={0.4} transparent />
      </mesh>
    </group>
  );
};

/**
 * Fuzzy action resolver helper to map idle/walk/run/jump/fall animation clips.
 */
function findAction(
  actions: Record<string, THREE.AnimationAction | null>,
  patterns: RegExp[]
): THREE.AnimationAction | null {
  for (const pattern of patterns) {
    for (const name of Object.keys(actions)) {
      if (pattern.test(name) && actions[name]) {
        return actions[name];
      }
    }
  }
  return null;
}

/**
 * GLTF Player Model loaded from public/models/player.glb.
 * Auto-normalizes bounding box to ~1 tile-width height, centers on X/Z, and puts feet on tile surface.
 */
const GLTFPlayerModel: React.FC<CharacterModelProps> = ({
  isHopping,
  hopProgress,
  isExiting,
  worldPosition,
}) => {
  const modelUrl = `${import.meta.env.BASE_URL || '/'}models/player.glb`.replace('//', '/');
  const gltf = useGLTF(modelUrl);
  const modelRootRef = useRef<THREE.Group>(null);
  const proceduralGroup = useRef<THREE.Group>(null);

  // Auto-normalize model: compute bounding box, scale to ~1.7 height, center X/Z, feet on ground
  const { clonedScene, computedScale, offset, hasClips } = useMemo(() => {
    // Clone scene with skeletons preserved
    const cloned = skeletonClone(gltf.scene);

    // CRITICAL: Update world matrices before calculating bounding box!
    // Without this, node rotations and scalings aren't composited, resulting in a false 63-unit box!
    cloned.updateMatrixWorld(true);

    // Enable castShadow & receiveShadow, and disable frustum culling on all child meshes
    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.frustumCulled = false; // Prevent skinned mesh culling artifacts
      }
    });

    // Compute bounding box with updated matrix world
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Target height: ~0.7 × tile-width (~1.19 units) so the character doesn't block the view
    const targetHeight = 1.19;
    const scale = size.y > 0.001 ? targetHeight / size.y : 1.0;

    // Offset in local space so feet sit at y = 0 and center is at (0, 0)
    const localOffset: [number, number, number] = [-center.x, -box.min.y, -center.z];

    // Log load success, bounds, scale, and world position
    const clipNames = gltf.animations.map((a) => a.name);
    console.log('Player GLB Load Success:', {
      status: 'success',
      rawBoundingBox: {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
        size: { x: size.x, y: size.y, z: size.z },
      },
      appliedScale: scale,
      normalizedHeight: targetHeight,
      localOffset: { x: localOffset[0], y: localOffset[1], z: localOffset[2] },
      worldPosition: worldPosition || [0, 0.45, -13.2],      animations: clipNames,
    });

    return {
      clonedScene: cloned,
      computedScale: scale,
      offset: localOffset,
      hasClips: gltf.animations.length > 0,
    };
  }, [gltf.scene, gltf.animations, worldPosition]);

  // Bind animation mixer to the model root
  const { actions } = useAnimations(gltf.animations, modelRootRef);

  // Map clips: idle / walk / jump
  useEffect(() => {
    if (!hasClips) return;

    const jumpAction = findAction(actions, [/jump/i, /hop/i, /leap/i]);
    const walkAction = findAction(actions, [/walk/i, /run/i]);
    const idleAction = findAction(actions, [/idle/i, /rest/i, /wait/i, /stand/i]);

    const activeHopAction = jumpAction || walkAction;

    if (isExiting) {
      activeHopAction?.fadeOut(0.2);
      idleAction?.fadeOut(0.2);
    } else if (isHopping) {
      if (activeHopAction) {
        activeHopAction.reset().fadeIn(0.08).play();
      }
      idleAction?.fadeOut(0.08);
    } else {
      if (idleAction) {
        idleAction.reset().fadeIn(0.2).play();
      }
      activeHopAction?.fadeOut(0.2);
    }
  }, [isHopping, isExiting, actions, hasClips]);

  // Code-based procedural squash, stretch & land bounce (used when no jump clips or as juicy juice)
  useFrame(() => {
    if (!proceduralGroup.current) return;

    if (isHopping) {
      let sy = 1.0;
      let sxz = 1.0;
      if (hopProgress < 0.15) {
        // Squash before hop
        const factor = Math.sin((hopProgress / 0.15) * Math.PI);
        sy = 1.0 - factor * 0.18;
        sxz = 1.0 + factor * 0.12;
      } else if (hopProgress < 0.85) {
        // Stretch in air
        const factor = Math.sin(((hopProgress - 0.15) / 0.7) * Math.PI);
        sy = 1.0 + factor * 0.18;
        sxz = 1.0 - factor * 0.1;
      } else {
        // Land bounce
        const factor = Math.sin(((hopProgress - 0.85) / 0.15) * Math.PI);
        sy = 1.0 - factor * 0.12;
        sxz = 1.0 + factor * 0.08;
      }
      proceduralGroup.current.scale.set(sxz, sy, sxz);
    } else {
      proceduralGroup.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={modelRootRef}>
      <group ref={proceduralGroup}>
        <group scale={[computedScale, computedScale, computedScale]}>
          <primitive object={clonedScene} position={offset} />
        </group>
      </group>

      {/* Floor contact shadow under feet */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#18091D" opacity={0.4} transparent />
      </mesh>
    </group>
  );
};

// Error boundary state and component
interface ErrorBoundaryState {
  hasError: boolean;
}

class CharacterErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    console.error('Player GLB Load Error (caught by CharacterErrorBoundary):', error);
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Player GLB Load Error details (rendering fallback capsule):', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Public CharacterModel component: Loads player.glb with Suspense and ErrorBoundary,
 * seamlessly falling back to CapsuleCharacter if anything fails or during initial fetch.
 */
export const CharacterModel: React.FC<CharacterModelProps> = (props) => {
  return (
    <CharacterErrorBoundary
      fallback={<CapsuleCharacter isHopping={props.isHopping} hopProgress={props.hopProgress} />}
    >
      <React.Suspense
        fallback={<CapsuleCharacter isHopping={props.isHopping} hopProgress={props.hopProgress} />}
      >
        <GLTFPlayerModel {...props} />
      </React.Suspense>
    </CharacterErrorBoundary>
  );
};

// Preload the model in browser
useGLTF.preload('/models/player.glb');
