import * as THREE from 'three';

// Vertex shader: pass UVs and position
const portalVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader: swirling multi-armed spiral of Teal (#00A896), Hot Pink (#FF3377), and Mustard (#FFC83B)
// Additive blending, brighter at center, soft elliptical doorway border fade
const portalFragmentShader = `
uniform float uTime;
uniform float uPulse;
uniform float uSpeedMultiplier;
varying vec2 vUv;

void main() {
  // Center coordinates at (0.0, 0.0)
  vec2 p = vUv - vec2(0.5, 0.5);
  // Compensate for rectangular doorway aspect ratio (~1.72 wide x 2.62 tall)
  p.x *= 0.72;

  float r = length(p);
  float theta = atan(p.y, p.x);

  // Swirling logarithmic spiral
  float speed = uTime * uSpeedMultiplier;
  float spiral1 = sin(theta * 3.0 + r * 14.0 - speed * 2.4);
  float spiral2 = cos(theta * 5.0 - r * 18.0 + speed * 1.8);

  // 1970s Disco Palette: Teal, Hot Pink, Mustard, Cream core
  vec3 teal = vec3(0.0, 0.6588, 0.5882);
  vec3 pink = vec3(1.0, 0.2, 0.4667);
  vec3 mustard = vec3(1.0, 0.7843, 0.2314);
  vec3 cream = vec3(1.0, 0.96, 0.88);

  // Dynamic chromatic swirl mixing
  vec3 col = mix(teal, pink, 0.5 + 0.5 * spiral1);
  col = mix(col, mustard, 0.4 + 0.4 * spiral2);

  // Intense bright glow towards the center core
  float core = 1.0 - smoothstep(0.0, 0.42, r);
  core = pow(core, 1.8);
  col = mix(col, cream, core * 0.9);
  col += cream * pow(1.0 - smoothstep(0.0, 0.18, r), 2.5) * 1.4;

  // Gentle breathing pulse
  col *= (0.85 + 0.15 * uPulse);

  // Arched doorway vignette edge fade to blend smoothly into the arch frame
  vec2 d = abs(vUv - vec2(0.5, 0.5)) * 2.0;
  float edgeAlphaX = 1.0 - smoothstep(0.72, 0.98, d.x);
  float edgeAlphaY = 1.0 - smoothstep(0.78, 0.98, d.y);
  float doorwayMask = edgeAlphaX * edgeAlphaY;

  float alpha = doorwayMask * (0.88 + 0.12 * uPulse);
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

/**
 * Creates the single shared ShaderMaterial instance for the exit portal.
 */
export function createPortalShaderMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms: {
      uTime: { value: 0.0 },
      uPulse: { value: 0.0 },
      uSpeedMultiplier: { value: 1.0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

// Singleton shared instance for zero per-frame allocation
export const sharedPortalMaterial = createPortalShaderMaterial();

/**
 * Updates uniforms in useFrame with zero object allocation.
 */
export function updatePortalShader(
  material: THREE.ShaderMaterial,
  elapsedTime: number,
  reducedMotion: boolean
): void {
  material.uniforms.uSpeedMultiplier.value = reducedMotion ? 0.25 : 1.0;
  material.uniforms.uTime.value = elapsedTime;
  material.uniforms.uPulse.value = Math.sin(elapsedTime * (reducedMotion ? 1.0 : 2.5));
}

/**
 * Checks for prefers-reduced-motion media query.
 */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
