import * as THREE from 'three';
import type { TileType } from './types';
import { sharedPortalMaterial } from './PortalShader';

// 1970s Disco Tile Palette Colors
export const TILE_COLORS: Record<TileType, string> = {
  safe: '#00A896',    // Retro Teal
  bounce: '#FFC83B',  // Mustard Yellow
  slide: '#FF6B35',   // Tangerine Orange
  crumble: '#FF3377', // Hot Pink
  mystery: '#9C41B3', // Groovy Grape
  entry: '#FFF4DC',   // Warm Cream Start Pad
  exit: '#FFC83B',    // Mustard Gold Exit Pad
};

// Slightly lighter top-inset dance floor colors for panel depth
export const TILE_TOP_COLORS: Record<TileType, string> = {
  safe: '#18BBA9',
  bounce: '#FFD360',
  slide: '#FF8152',
  crumble: '#FF528E',
  mystery: '#B254CB',
  entry: '#FFFFFF',
  exit: '#FFE073',
};

// Tile dimensions
export const TILE_WIDTH = 1.7;
export const TILE_HEIGHT = 0.28;
export const TILE_DEPTH = 1.7;
export const TILE_SPACING = 2.2; // Distance between tile centers

// Shared tile geometries
export const sharedTileBaseGeometry = new THREE.BoxGeometry(TILE_WIDTH, TILE_HEIGHT, TILE_DEPTH);
export const sharedTileTopGeometry = new THREE.BoxGeometry(TILE_WIDTH - 0.16, 0.04, TILE_DEPTH - 0.16);
export const sharedTileUnderPlate = new THREE.BoxGeometry(TILE_WIDTH + 0.08, 0.06, TILE_DEPTH + 0.08);

// Base tile materials (outer border / bevel)
export const tileMaterials: Record<TileType, THREE.MeshStandardMaterial> = {
  safe: new THREE.MeshStandardMaterial({ color: TILE_COLORS.safe, roughness: 0.35, metalness: 0.15 }),
  bounce: new THREE.MeshStandardMaterial({ color: TILE_COLORS.bounce, roughness: 0.3, metalness: 0.2 }),
  slide: new THREE.MeshStandardMaterial({ color: TILE_COLORS.slide, roughness: 0.25, metalness: 0.25 }),
  crumble: new THREE.MeshStandardMaterial({ color: TILE_COLORS.crumble, roughness: 0.45, metalness: 0.1 }),
  mystery: new THREE.MeshStandardMaterial({ color: TILE_COLORS.mystery, roughness: 0.35, metalness: 0.2 }),
  entry: new THREE.MeshStandardMaterial({ color: TILE_COLORS.entry, roughness: 0.35, metalness: 0.1 }),
  exit: new THREE.MeshStandardMaterial({ color: TILE_COLORS.exit, roughness: 0.25, metalness: 0.3 }),
};

// Lighter top dance-floor surface materials
export const tileTopMaterials: Record<TileType, THREE.MeshStandardMaterial> = {
  safe: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.safe, roughness: 0.2, metalness: 0.15 }),
  bounce: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.bounce, roughness: 0.18, metalness: 0.2 }),
  slide: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.slide, roughness: 0.12, metalness: 0.3 }),
  crumble: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.crumble, roughness: 0.35, metalness: 0.1 }),
  mystery: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.mystery, roughness: 0.2, metalness: 0.25 }),
  entry: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.entry, roughness: 0.25, metalness: 0.1 }),
  exit: new THREE.MeshStandardMaterial({ color: TILE_TOP_COLORS.exit, roughness: 0.18, metalness: 0.3 }),
};

// Dark rim under-plate material
export const underPlateMaterial = new THREE.MeshStandardMaterial({
  color: 0x18091D,
  roughness: 0.8,
  metalness: 0.1,
});

// Mirror Ball Material (Faceted 1970s chrome reflector)
export const mirrorBallMaterial = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  roughness: 0.05,
  metalness: 0.95,
  flatShading: true,
});

// Portal Arch Material (Deep plum structure)
export const archMaterial = new THREE.MeshStandardMaterial({
  color: 0x381645,
  roughness: 0.35,
  metalness: 0.25,
});

// Giant Speaker Stack Materials
export const speakerCabinetMaterial = new THREE.MeshStandardMaterial({
  color: 0x220c2a, // Dark retro wood
  roughness: 0.6,
  metalness: 0.1,
});

export const speakerWooferMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.4,
  metalness: 0.6,
});

export const speakerRimMaterial = new THREE.MeshStandardMaterial({
  color: 0xFFC83B, // 1970s Mustard rim
  roughness: 0.3,
  metalness: 0.4,
});

// Pulsing Ground Ring Geometry & Materials
export const pulsingRingGeometry = new THREE.RingGeometry(1.2, 1.45, 32);

// Shared Portal Arch Opening Plane Geometry (1.72 wide x 2.62 tall)
export const sharedPortalDoorGeometry = new THREE.PlaneGeometry(1.72, 2.62);

// Disposal helper to ensure zero memory leaks
export function disposeSceneResources() {
  sharedTileBaseGeometry.dispose();
  sharedTileTopGeometry.dispose();
  sharedTileUnderPlate.dispose();
  pulsingRingGeometry.dispose();
  sharedPortalDoorGeometry.dispose();

  Object.values(tileMaterials).forEach((mat) => mat.dispose());
  Object.values(tileTopMaterials).forEach((mat) => mat.dispose());
  underPlateMaterial.dispose();
  mirrorBallMaterial.dispose();
  archMaterial.dispose();
  speakerCabinetMaterial.dispose();
  speakerWooferMaterial.dispose();
  speakerRimMaterial.dispose();
  sharedPortalMaterial.dispose();
}
