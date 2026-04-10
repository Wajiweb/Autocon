import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function EthereumCoin(props) {
  const meshRef  = useRef();
  const innerRingRef = useRef();
  const outerRingRef = useRef();

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    // Crystal spin & float
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
      meshRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }

    // Orbiting rings (counter-rotating)
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = t * 0.2;
      innerRingRef.current.rotation.y = t * 0.15;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = -(t * 0.1);
      outerRingRef.current.rotation.y = -(t * 0.25);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
      <group {...props}>

        {/* ── Minimal Octahedron Core ── */}
        <mesh ref={meshRef} scale={1.5}>
          <octahedronGeometry args={[1, 0]} />
          
          {/* Ultra-Shiny Physical Glass Core */}
          <meshPhysicalMaterial
            color="#ffffff"
            emissive="#7b61ff"
            emissiveIntensity={1.8}
            transmission={1}
            opacity={1}
            metalness={0.0}
            roughness={0}
            clearcoat={1}
            clearcoatRoughness={0}
            ior={1.8}
            thickness={1.5}
            specularIntensity={4}
            specularColor="#ff8ce6"
          />
          
          {/* Elegant wireframe edges overlay */}
          <mesh>
            <octahedronGeometry args={[1.003, 0]} />
            <meshBasicMaterial
              color="#ff8ce6"
              wireframe={true}
              transparent={true}
              opacity={1}
            />
          </mesh>
        </mesh>

        {/* ── Orbiting Torus Rings ── */}
        {/* Inner Ring - Bright Purplish Blue */}
        <mesh ref={innerRingRef}>
          <torusGeometry args={[1.7, 0.008, 16, 100]} />
          <meshBasicMaterial
            color="#7b61ff"
            transparent={true}
            opacity={1}
          />
        </mesh>

        {/* Outer Ring - Bright Light Pink */}
        <mesh ref={outerRingRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.0, 0.006, 16, 100]} />
          <meshBasicMaterial
            color="#ff8ce6"
            transparent={true}
            opacity={0.95}
          />
        </mesh>
      </group>
    </Float>
  );
}
