/**
 * DashboardScene.jsx — Ultra-lightweight dashboard background
 * Reduced from 400 → 250 particles, shapes pushed further back,
 * alpha: true, no AA, DPR: 1 hard-fixed, low opacity wrapper.
 */
import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { DashboardLights } from './Lights.jsx';
import * as THREE from 'three';

// 250 background particles — pure BufferGeometry, no JS per-particle
function TinyStarField() {
  const ref = useRef();
  const positions = new Float32Array(250 * 3);
  for (let i = 0; i < 250; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.008;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={250} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a78bfa" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// 3 minimal wireframe shapes at far z-depth
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
          <meshBasicMaterial color={['#7C3AED', '#0891b2', '#2563EB'][i]} wireframe transparent opacity={0.18} />
        </mesh>
      ))}
    </group>
  );
}

export default function DashboardScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-35">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: false, alpha: true, stencil: false, powerPreference: 'default' }}
        dpr={1}
        frameloop="always"
        style={{ background: 'transparent' }}
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
