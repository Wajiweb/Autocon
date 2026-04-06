/**
 * FloatingObjects.jsx
 * Blockchain-node constellation:
 *   - Instanced spheres as nodes
 *   - Line segments connecting them (InstancedMesh edges)
 *   - Scroll-depth movement on each layer
 * 3 depth layers → true parallax illusion.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Layer definitions ─────────────────────────────────────
const LAYERS = [
  { count: 6,  z: -2, scale: 0.18, speed: 0.18, color: '#a78bfa', spread: 8 },   // foreground
  { count: 10, z: -5, scale: 0.12, speed: 0.10, color: '#60a5fa', spread: 12 },  // mid
  { count: 14, z: -9, scale: 0.07, speed: 0.05, color: '#67e8f9', spread: 16 },  // background
];

// Pre-generate positions for a given layer
function generatePositions(count, spread) {
  return Array.from({ length: count }, () => [
    (Math.random() - 0.5) * spread,
    (Math.random() - 0.5) * spread * 0.6,
    0,
  ]);
}

// A single node sphere
function Node({ position, color, scale, speed, offset }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.4;
    ref.current.rotation.x = t * speed * 0.6;
    ref.current.rotation.y = t * speed;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[scale, 1]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.7}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// Edge lines between nodes using LineSegments
function NodeEdges({ positions, color }) {
  const lineRef = useRef();

  const geometry = useMemo(() => {
    const pts = [];
    for (let i = 0; i < positions.length - 1; i++) {
      // Connect each to the next two neighbours
      pts.push(new THREE.Vector3(...positions[i]));
      pts.push(new THREE.Vector3(...positions[(i + 1) % positions.length]));
      if (i < positions.length - 2) {
        pts.push(new THREE.Vector3(...positions[i]));
        pts.push(new THREE.Vector3(...positions[(i + 2) % positions.length]));
      }
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return geo;
  }, [positions]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      // Pulse opacity gently
      const t = clock.getElapsedTime();
      lineRef.current.material.opacity = 0.1 + Math.abs(Math.sin(t * 0.4)) * 0.15;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.15} depthWrite={false} />
    </lineSegments>
  );
}

// One full layer
function NodeLayer({ count, z, scale, speed, color, spread }) {
  const positions = useMemo(() => generatePositions(count, spread), [count, spread]);
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    // Scroll-depth movement: background moves more slowly
    groupRef.current.position.z = z;
  });

  return (
    <group ref={groupRef} position={[0, 0, z]}>
      {positions.map((pos, i) => (
        <Node
          key={i}
          position={pos}
          color={color}
          scale={scale}
          speed={speed}
          offset={i * 0.9}
        />
      ))}
      <NodeEdges positions={positions} color={color} />
    </group>
  );
}

// Master export — all three layers
export default function FloatingObjects({ isMobile = false }) {
  // On mobile, only render foreground layer
  const layers = isMobile ? LAYERS.slice(0, 1) : LAYERS;
  return (
    <>
      {layers.map((layer, i) => (
        <NodeLayer key={i} {...layer} />
      ))}
    </>
  );
}
