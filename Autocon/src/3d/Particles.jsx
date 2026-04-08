import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export function StarField({ count = 5000, spread = 60 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * spread;
    }
    return pos;
  }, [count, spread]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.rotation.y = t * 0.01;
      ref.current.rotation.x = Math.sin(t * 0.005) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      {/* Reverted color to Hex because Three.js cannot parse CSS variables directly */}
      <pointsMaterial 
        size={0.07} 
        color="#a78bfa" 
        transparent 
        opacity={0.5} 
        sizeAttenuation 
        depthWrite={false} 
      />
    </points>
  );
}