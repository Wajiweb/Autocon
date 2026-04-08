/**
 * DashboardScene.jsx — Ultra-lightweight dashboard background
 * Reduced from 400 → 250 particles, shapes pushed further back,
 * alpha: true, no AA, DPR: 1 hard-fixed, low opacity wrapper.
 */
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DashboardLights } from './Lights.jsx';
import * as THREE from 'three';

// Generated once at module load — stable reference, satisfies react-hooks/purity
const STAR_POSITIONS = (() => {
  const pos = new Float32Array(250 * 3);
  for (let i = 0; i < 250; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  return pos;
})();

// 250 background particles — pure BufferGeometry, no JS per-particle
function TinyStarField() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={STAR_POSITIONS} count={250} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// 3 minimal wireframe shapes at far z-depth
// Exact change for CSS Variable support in 3D
const colors = {
  primary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#7C3AED',
  secondary: getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim() || '#0891b2'
};

// Refactored FarShapes for conciseness
function FarShapes() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015;
  });

  return (
    <group ref={ref}>
      {[[-5, 2, -14], [7, -3, -16], [-3, -4, -18]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <octahedronGeometry args={[0.5, 0]} />
          {/* Use CSS Variable based colors here */}
          <meshBasicMaterial 
            color={i === 0 ? "var(--color-primary)" : "var(--color-secondary)"} 
            wireframe 
            transparent 
            opacity={0.18} 
          />
        </mesh>
      ))}
    </group>
  );
}
export default function DashboardScene() {
  return (
    <div 
      // z-0 keeps it visible; pointer-events-none lets scroll pass through
      className="fixed inset-0 z-0 pointer-events-none select-none opacity-35"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, stencil: false, powerPreference: 'low-power' }}
        dpr={1}
        frameloop="always"
        // Style ensures the Canvas element itself doesn't trap the cursor
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <Suspense fallback={null}>
          <DashboardLights />
          <TinyStarField />
          <FarShapes />
        </Suspense>
      </Canvas>
    </div>
  );
}