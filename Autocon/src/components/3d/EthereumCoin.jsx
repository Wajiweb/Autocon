import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function EthereumCoin(props) {
  const meshRef  = useRef();
  const ringRef  = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Crystal spin
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }

    // Orbiting ring — counter-tilted rotation
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.6;
      ringRef.current.rotation.z = t * 0.4;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={1.5} floatingRange={[-0.2, 0.2]}>
      <group {...props}>

        {/* ── Octahedron crystal (original) ── */}
        <mesh ref={meshRef} scale={1.8}>
          <octahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            emissive="#67e8f9"
            emissiveIntensity={0.35}
            roughness={0.15}
            metalness={0.9}
            transmission={0.95}
            thickness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* ── Orbiting cyan ring (from first TokenModel) ── */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.85, 0.04, 16, 80]} />
          <meshStandardMaterial
            color="#06B6D4"
            emissive="#0891b2"
            emissiveIntensity={1.4}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* ── Outer purple glow sphere ── */}
        <mesh>
          <sphereGeometry args={[2.2, 16, 16]} />
          <meshBasicMaterial
            color="#7C3AED"
            transparent
            opacity={0.06}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

      </group>
    </Float>
  );
}
