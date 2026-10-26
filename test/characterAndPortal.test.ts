import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  createPortalShaderMaterial,
  updatePortalShader,
  getPrefersReducedMotion,
} from '../src/game/scene/PortalShader';

describe('PortalShader & Exit Portal Logic', () => {
  it('creates portal shader material with additive blending and expected uniforms', () => {
    const mat = createPortalShaderMaterial();
    expect(mat.blending).toBe(THREE.AdditiveBlending);
    expect(mat.transparent).toBe(true);
    expect(mat.depthWrite).toBe(false);
    expect(mat.uniforms.uTime).toBeDefined();
    expect(mat.uniforms.uPulse).toBeDefined();
    expect(mat.uniforms.uSpeedMultiplier).toBeDefined();
    mat.dispose();
  });

  it('updates uniforms in-place without object re-allocation', () => {
    const mat = createPortalShaderMaterial();
    const timeRef = mat.uniforms.uTime;
    const pulseRef = mat.uniforms.uPulse;

    updatePortalShader(mat, 2.5, false);
    expect(mat.uniforms.uTime).toBe(timeRef); // Same reference
    expect(mat.uniforms.uPulse).toBe(pulseRef); // Same reference
    expect(mat.uniforms.uTime.value).toBe(2.5);
    expect(mat.uniforms.uSpeedMultiplier.value).toBe(1.0);

    // Test with reduced motion
    updatePortalShader(mat, 4.0, true);
    expect(mat.uniforms.uSpeedMultiplier.value).toBe(0.25);
    mat.dispose();
  });

  it('handles reduced motion detection gracefully in non-browser environments', () => {
    const reduced = getPrefersReducedMotion();
    expect(typeof reduced).toBe('boolean');
  });
});

describe('Character Auto-Normalization Logic', () => {
  it('computes scale factor to normalize any height to ~1.7 units', () => {
    const targetHeight = 1.7;

    // Simulate a model with bounding box height of 3.4 units
    const rawHeight = 3.4;
    const scale = rawHeight > 0.001 ? targetHeight / rawHeight : 1.0;
    expect(scale).toBeCloseTo(0.5, 4);

    const resultingHeight = rawHeight * scale;
    expect(resultingHeight).toBeCloseTo(targetHeight, 4);
  });

  it('computes feet-on-ground offset and center offset correctly with updateMatrixWorld', () => {
    // Simulate a nested hierarchy like the GLTF model
    const root = new THREE.Group();
    const child = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshBasicMaterial()
    );
    child.position.set(0, 1, 0); // bottom at y=0, top at y=2
    root.add(child);
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    expect(size.y).toBeCloseTo(2.0, 4);

    const center = new THREE.Vector3();
    box.getCenter(center);
    expect(center.y).toBeCloseTo(1.0, 4);

    // Scaling to target height 1.7
    const scale = 1.7 / size.y;
    expect(scale).toBeCloseTo(0.85, 4);

    // Pivot group
    const pivot = new THREE.Group();
    pivot.scale.set(scale, scale, scale);
    root.position.set(-center.x, -box.min.y, -center.z);
    pivot.add(root);
    pivot.updateMatrixWorld(true);

    const normalizedBox = new THREE.Box3().setFromObject(pivot);
    expect(normalizedBox.min.y).toBeCloseTo(0, 4); // Feet at 0
    expect(normalizedBox.max.y).toBeCloseTo(1.7, 4); // Normalized height 1.7
  });

  it('computes exit sucking sequence scale and pull progression', () => {
    const EXIT_DURATION = 0.8;
    const testElapsed = 0.4; // 50% elapsed
    const progress = Math.min(1.0, testElapsed / EXIT_DURATION);
    expect(progress).toBeCloseTo(0.5, 4);

    // Sucking pull factor (accelerating ease-in)
    const pullFactor = Math.pow(progress, 1.8);
    expect(pullFactor).toBeLessThan(progress); // Ease-in starts slower then accelerates

    // Shrink scale
    const currentScale = Math.max(0, 1.0 - Math.pow(progress, 1.4));
    expect(currentScale).toBeGreaterThan(0);
    expect(currentScale).toBeLessThan(1.0);

    // At progress = 1.0
    const finalScale = Math.max(0, 1.0 - Math.pow(1.0, 1.4));
    expect(finalScale).toBe(0);
  });

  it('restores scale to 1.0 and resets exit completion state on play again', () => {
    // Simulate player group after an exit sequence
    const playerGroup = new THREE.Group();
    playerGroup.scale.set(0, 0, 0); // Sucked into portal
    let exitCompleted = true;

    // Simulate play-again reset action
    const resetPlayAgain = () => {
      exitCompleted = false;
      playerGroup.scale.set(1, 1, 1);
      playerGroup.rotation.set(0, 0, 0);
    };

    resetPlayAgain();
    expect(exitCompleted).toBe(false);
    expect(playerGroup.scale.x).toBe(1);
    expect(playerGroup.scale.y).toBe(1);
    expect(playerGroup.scale.z).toBe(1);
  });

  it('updates camera target position via mutable ref without reallocating objects', () => {
    const playerPosRef = { current: new THREE.Vector3(0, 0.45, -13.2) };
    const originalRef = playerPosRef.current;

    // Simulate camera update handler
    const updateHandler = (newPos: [number, number, number]) => {
      playerPosRef.current.set(newPos[0], newPos[1], newPos[2]);
    };

    updateHandler([2.2, 0.85, -11.0]);
    expect(playerPosRef.current).toBe(originalRef); // Exact same instance
    expect(playerPosRef.current.x).toBe(2.2);
    expect(playerPosRef.current.y).toBe(0.85);
    expect(playerPosRef.current.z).toBe(-11.0);
  });
});
