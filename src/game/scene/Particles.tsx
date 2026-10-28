import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getPrefersReducedMotion } from './PortalShader';

const MAX = 600;
const PALETTE = ['#FFC83B', '#FF3377', '#FF6B35', '#00A896', '#9C41B3', '#FFF4DC'].map(
  (c) => new THREE.Color(c)
);
const DUST = new THREE.Color('#FFF4DC');
const dummy = new THREE.Object3D();

export type ParticleKind = 'confetti' | 'dust';
export type ParticleVec3 = [number, number, number];

export interface ParticlesHandle {
  burst: (kind: ParticleKind, pos: ParticleVec3, count?: number) => void;
}

export const Particles = forwardRef<ParticlesHandle>(function Particles(_props, ref) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const reduced = useMemo(() => getPrefersReducedMotion(), []);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 0.65), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }),
    []
  );
  const p = useMemo(
    () => ({
      pos: new Float32Array(MAX * 3),
      vel: new Float32Array(MAX * 3),
      rot: new Float32Array(MAX * 3),
      spin: new Float32Array(MAX * 3),
      life: new Float32Array(MAX),
      size: new Float32Array(MAX),
      grav: new Float32Array(MAX),
      next: 0,
    }),
    []
  );

  // Hide every instance until used
  useEffect(() => {
    const m = meshRef.current;
    if (!m) return;
    dummy.position.set(0, -100, 0);
    dummy.scale.setScalar(0);
    dummy.updateMatrix();
    for (let i = 0; i < MAX; i++) {
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, DUST);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useImperativeHandle(
    ref,
    () => ({
      burst(kind, pos, count = 60) {
        const m = meshRef.current;
        if (!m) return;
        const n = Math.max(1, Math.round(reduced ? count * 0.4 : count));
        for (let k = 0; k < n; k++) {
          const i = p.next;
          p.next = (p.next + 1) % MAX;
          const i3 = i * 3;
          const a = Math.random() * Math.PI * 2;

          p.pos[i3] = pos[0] + (Math.random() - 0.5) * 0.4;
          p.pos[i3 + 1] = pos[1];
          p.pos[i3 + 2] = pos[2] + (Math.random() - 0.5) * 0.4;
          p.rot[i3] = Math.random() * 6;
          p.rot[i3 + 1] = Math.random() * 6;
          p.rot[i3 + 2] = Math.random() * 6;
          p.spin[i3] = (Math.random() - 0.5) * 16;
          p.spin[i3 + 1] = (Math.random() - 0.5) * 16;
          p.spin[i3 + 2] = (Math.random() - 0.5) * 16;

          if (kind === 'confetti') {
            const sp = 1.5 + Math.random() * 3.5;
            p.vel[i3] = Math.cos(a) * sp;
            p.vel[i3 + 1] = 5 + Math.random() * 5;
            p.vel[i3 + 2] = Math.sin(a) * sp;
            p.life[i] = 1.6 + Math.random() * 1.2;
            p.size[i] = 0.16 + Math.random() * 0.12;
            p.grav[i] = -9;
            m.setColorAt(i, PALETTE[Math.floor(Math.random() * PALETTE.length)]);
          } else {
            const sp = 0.6 + Math.random();
            p.vel[i3] = Math.cos(a) * sp;
            p.vel[i3 + 1] = 0.4 + Math.random() * 0.8;
            p.vel[i3 + 2] = Math.sin(a) * sp;
            p.life[i] = 0.35 + Math.random() * 0.3;
            p.size[i] = 0.12 + Math.random() * 0.1;
            p.grav[i] = -1.5;
            m.setColorAt(i, DUST);
          }
        }
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      },
    }),
    [p, reduced]
  );

  useFrame((_state, delta) => {
    const m = meshRef.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    const drag = Math.exp(-1.2 * dt);
    let any = false;

    for (let i = 0; i < MAX; i++) {
      if (p.life[i] <= 0) continue;
      any = true;
      p.life[i] -= dt;
      const i3 = i * 3;

      if (p.life[i] <= 0) {
        dummy.position.set(0, -100, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0);
      } else {
        p.vel[i3] *= drag;
        p.vel[i3 + 2] *= drag;
        p.vel[i3 + 1] += p.grav[i] * dt;
        p.pos[i3] += p.vel[i3] * dt;
        p.pos[i3 + 1] += p.vel[i3 + 1] * dt;
        p.pos[i3 + 2] += p.vel[i3 + 2] * dt;
        p.rot[i3] += p.spin[i3] * dt;
        p.rot[i3 + 1] += p.spin[i3 + 1] * dt;
        p.rot[i3 + 2] += p.spin[i3 + 2] * dt;

        dummy.position.set(p.pos[i3], p.pos[i3 + 1], p.pos[i3 + 2]);
        dummy.rotation.set(p.rot[i3], p.rot[i3 + 1], p.rot[i3 + 2]);
        dummy.scale.setScalar(p.size[i] * Math.min(1, p.life[i] / 0.3));
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    if (any) m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, MAX]} frustumCulled={false} />;
});