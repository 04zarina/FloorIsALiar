import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Module-scoped reusable vectors — no per-frame allocation
const vTargetCam = new THREE.Vector3();
const vTargetLook = new THREE.Vector3();
const vCurrentLook = new THREE.Vector3();

export interface ThirdPersonCameraProps {
  playerPosRef?: React.RefObject<THREE.Vector3>;
  isOverview: boolean;
}

export const ThirdPersonCamera: React.FC<ThirdPersonCameraProps> = ({
  playerPosRef,
  isOverview,
}) => {
  const { camera, gl } = useThree();

  const dragOffset = useRef({ x: 0, y: 0, isDragging: false });
  const startPointer = useRef({ x: 0, y: 0 });
  const initialised = useRef(false);

  // Pointer drag for slight orbital tweak
  useEffect(() => {
    const dom = gl.domElement;
    const onDown = (e: PointerEvent) => {
      dragOffset.current.isDragging = true;
      startPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onMove = (e: PointerEvent) => {
      if (!dragOffset.current.isDragging) return;
      dragOffset.current.x = THREE.MathUtils.clamp(
        (e.clientX - startPointer.current.x) * 0.007, -2.0, 2.0
      );
      dragOffset.current.y = THREE.MathUtils.clamp(
        (e.clientY - startPointer.current.y) * 0.007, -1.2, 1.2
      );
    };
    const onUp = () => { dragOffset.current.isDragging = false; };

    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl.domElement]);

  useFrame((_state, delta) => {
    // Ease drag back to center when not dragging
    if (!dragOffset.current.isDragging) {
      dragOffset.current.x = THREE.MathUtils.damp(dragOffset.current.x, 0, 3.5, delta);
      dragOffset.current.y = THREE.MathUtils.damp(dragOffset.current.y, 0, 3.5, delta);
    }

    const px = playerPosRef?.current?.x ?? 0;
    const py = playerPosRef?.current?.y ?? 0.45;
    const pz = playerPosRef?.current?.z ?? -13.2;

    if (isOverview) {
      vTargetCam.set(0, 22, -8);
      vTargetLook.set(0, 0, 0);
      camera.position.lerp(vTargetCam, Math.min(1, delta * 3.0));
      vCurrentLook.lerp(vTargetLook, Math.min(1, delta * 3.5));
      camera.lookAt(vCurrentLook);
      return;
    }

    // Third-person: 3.5 behind, 2.5 above, look slightly ahead
    const BACK = 3.5;
    const UP = 2.5;
    const LOOK_AHEAD = 2.5;

    const desiredX = px * 0.4 + dragOffset.current.x * 1.5;
    const desiredY = py + UP - dragOffset.current.y * 0.8;
    const desiredZ = pz - BACK;

    vTargetCam.set(desiredX, desiredY, desiredZ);
    vTargetLook.set(px * 0.6 + dragOffset.current.x * 0.8, py + 0.6, pz + LOOK_AHEAD);

    // On first frame snap camera directly to avoid initial zoom-in sweep
    const lerpFactor = initialised.current ? Math.min(1, delta * 6.0) : 1.0;
    camera.position.lerp(vTargetCam, lerpFactor);
    vCurrentLook.lerp(vTargetLook, Math.min(1, delta * 7.0));
    camera.lookAt(vCurrentLook);
    initialised.current = true;
  });

  return null;
};
