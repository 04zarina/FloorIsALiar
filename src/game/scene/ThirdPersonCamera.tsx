import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Module-scoped reusable Vector3 instances to avoid garbage collection in useFrame
const vTargetCam = new THREE.Vector3();
const vTargetLook = new THREE.Vector3();
const vCurrentLook = new THREE.Vector3(0, 0, 0);

export interface ThirdPersonCameraProps {
  playerPos?: [number, number, number];
  playerPosRef?: React.RefObject<THREE.Vector3>;
  isOverview: boolean;
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  playerPos,
  playerPosRef,
  isOverview,
}) => {
  const { camera, gl } = useThree();

  // Drag offset for subtle player-controlled angle tweaks (eases back smoothly)
  const dragOffset = useRef({ x: 0, y: 0, isDragging: false });
  const startPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dom = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      dragOffset.current.isDragging = true;
      startPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragOffset.current.isDragging) return;
      const dx = (e.clientX - startPointer.current.x) * 0.008;
      const dy = (e.clientY - startPointer.current.y) * 0.008;
      // Restrict drag range to gentle orbit adjustments
      dragOffset.current.x = THREE.MathUtils.clamp(dx, -2.5, 2.5);
      dragOffset.current.y = THREE.MathUtils.clamp(dy, -1.5, 1.5);
    };

    const onPointerUp = () => {
      dragOffset.current.isDragging = false;
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl.domElement]);

  // Set initial camera position & look-at ONCE on mount (prevents per-frame look-at snapping vibration)
  useEffect(() => {
    const px = playerPosRef?.current ? playerPosRef.current.x : (playerPos?.[0] ?? 0);
    const py = playerPosRef?.current ? playerPosRef.current.y : (playerPos?.[1] ?? 0.45);
    const pz = playerPosRef?.current ? playerPosRef.current.z : (playerPos?.[2] ?? -13.2);

    camera.position.set(px * 0.35, py + 4.5, pz - 7.0);
    vCurrentLook.set(px * 0.7, py + 1.2, pz + 4.0);
    camera.lookAt(vCurrentLook);

    console.log('ThirdPersonCamera Diagnostics:', {
      nearPlane: camera.near,
      farPlane: camera.far,
      followDistance: { back: 7.0, up: 4.5, total: Math.hypot(7.0, 4.5).toFixed(2) },
      isOverview,
    });
  }, [camera]); // Only on mount

  useFrame((_state, delta) => {
    // Return drag offset gradually to center if user stopped dragging
    if (!dragOffset.current.isDragging) {
      dragOffset.current.x = THREE.MathUtils.damp(dragOffset.current.x, 0, 3.5, delta);
      dragOffset.current.y = THREE.MathUtils.damp(dragOffset.current.y, 0, 3.5, delta);
    }

    if (isOverview) {
      // OVERVIEW MODE: Elevated wide-angle camera showing whole floating arena
      vTargetCam.set(0, 21, -8);
      vTargetLook.set(0, 0, 0);

      camera.position.lerp(vTargetCam, Math.min(1, delta * 3.0));
      vCurrentLook.lerp(vTargetLook, Math.min(1, delta * 3.5));
      camera.lookAt(vCurrentLook);
    } else {
      // THIRD-PERSON FOLLOW MODE (Fall Guys style):
      // Read directly from mutable playerPosRef for zero-re-render, vibration-free tracking
      const px = playerPosRef?.current ? playerPosRef.current.x : (playerPos?.[0] ?? 0);
      const py = playerPosRef?.current ? playerPosRef.current.y : (playerPos?.[1] ?? 0.45);
      const pz = playerPosRef?.current ? playerPosRef.current.z : (playerPos?.[2] ?? -13.2);

      const desiredX = px * 0.35 + dragOffset.current.x * 2.0;
      const desiredY = py + 4.5 - dragOffset.current.y;
      const desiredZ = pz - 7.0; // Behind player on the negative Z axis

      vTargetCam.set(desiredX, desiredY, desiredZ);

      // Look slightly ahead of player toward exit (+Z)
      const lookX = px * 0.7 + dragOffset.current.x * 1.0;
      const lookY = py + 1.2;
      const lookZ = pz + 4.0; // Look ahead toward the next tiles
      vTargetLook.set(lookX, lookY, lookZ);

      // Smooth damped trailing lerp without snap oscillations
      camera.position.lerp(vTargetCam, Math.min(1, delta * 4.0));
      vCurrentLook.lerp(vTargetLook, Math.min(1, delta * 5.0));
      camera.lookAt(vCurrentLook);
    }
  });

  return null;
};
