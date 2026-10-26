import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { sharedTileBaseGeometry, tileMaterials } from '../src/game/scene/materials';

describe('Real THREE.Raycaster Headless Hit Detection', () => {
  it('detects a direct hit on a 3D tile mesh along the camera projection ray', () => {
    // Setup camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Setup tile mesh at origin
    const tileMesh = new THREE.Mesh(sharedTileBaseGeometry, tileMaterials.safe);
    tileMesh.position.set(0, 0, 0);
    tileMesh.updateMatrixWorld();

    // Setup raycaster aiming at center of screen (NDC (0, 0))
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(pointerNDC, camera);

    // Perform intersection check
    const intersects = raycaster.intersectObjects([tileMesh], false);

    expect(intersects.length).toBeGreaterThan(0);
    expect(intersects[0].object).toBe(tileMesh);
    expect(intersects[0].point.x).toBeCloseTo(0, 2);
    expect(intersects[0].point.z).toBeCloseTo(0, 2);
    // Distance from camera (0, 10, 0) to tile top surface (0, 0.14, 0) is ~9.86
    expect(intersects[0].distance).toBeLessThan(10);
  });

  it('returns zero intersections when a ray is fired into empty space (misses everything)', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Tile is positioned at origin
    const tileMesh = new THREE.Mesh(sharedTileBaseGeometry, tileMaterials.safe);
    tileMesh.position.set(0, 0, 0);
    tileMesh.updateMatrixWorld();

    const raycaster = new THREE.Raycaster();
    // Aim far off in corner of NDC where no tile exists
    const pointerNDC = new THREE.Vector2(0.95, 0.95);
    raycaster.setFromCamera(pointerNDC, camera);

    const intersects = raycaster.intersectObjects([tileMesh], false);
    expect(intersects.length).toBe(0);
  });

  it('demonstrates hit occlusion when a prop is positioned between the camera and a tile', () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 10, 0);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();

    // Target tile at bottom (y = 0)
    const tileMesh = new THREE.Mesh(sharedTileBaseGeometry, tileMaterials.safe);
    tileMesh.name = 'target_tile';
    tileMesh.position.set(0, 0, 0);
    tileMesh.updateMatrixWorld();

    // Decorative prop placed directly in front of the tile (y = 5)
    const propGeometry = new THREE.BoxGeometry(2, 2, 2);
    const propMesh = new THREE.Mesh(propGeometry, tileMaterials.crumble);
    propMesh.name = 'decorative_prop';
    propMesh.position.set(0, 5, 0);
    propMesh.updateMatrixWorld();

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(0, 0);
    raycaster.setFromCamera(pointerNDC, camera);

    // 1. When all scene meshes are tested: the prop is hit first (closest intersection)
    const allIntersects = raycaster.intersectObjects([tileMesh, propMesh], false);
    expect(allIntersects.length).toBe(2);
    expect(allIntersects[0].object.name).toBe('decorative_prop');
    expect(allIntersects[1].object.name).toBe('target_tile');

    // 2. Demonstrating our architecture solution: filtering candidate interactive targets
    // Only tile meshes are registered as raycast listeners, ensuring props never steal tile clicks!
    const filteredInteractiveTargets = [tileMesh];
    const tileOnlyIntersects = raycaster.intersectObjects(filteredInteractiveTargets, false);
    expect(tileOnlyIntersects.length).toBe(1);
    expect(tileOnlyIntersects[0].object.name).toBe('target_tile');

    propGeometry.dispose();
  });
});
