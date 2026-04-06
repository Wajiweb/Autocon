/**
 * Particles.jsx
 * Two-tier particle system:
 *  - Background stars (thousands of tiny points)
 *  - Mid-field drifting dust (subtle, slow motion)
 * Uses InstancedMesh / BufferGeometry for GPU efficiency.
 * All on transform + opacity — no layout animation → 60fps safe.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

const COUNT = 2000;

export function StarField({ count = COUNT, spread = 40 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread; // eslint-disable-line react-hooks/purity
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread; // eslint-disable-line react-hooks/purity
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread; // eslint-disable-line react-hooks/purity
    }
    return pos;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    // Slowly drift/rotate the whole cloud
    ref.current.rotation.y = t * 0.01;
    ref.current.rotation.x = Math.sin(t * 0.005) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#a78bfa"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Smaller cyan dust cloud behind the main object
export function DustCloud({ count = 600, spread = 18 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread; // eslint-disable-line react-hooks/purity
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread; // eslint-disable-line react-hooks/purity
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.4; // eslint-disable-line react-hooks/purity
    }
    return pos;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = -t * 0.018;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#67e8f9"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
