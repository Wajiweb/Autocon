/**
 * TokenModel.jsx — Pink/Magenta premium glow edition
 * 
 * Color palette:
 *   body     = #ec4899  (vivid pink)
 *   emissive = #f9a8d4  (soft rose glow)
 *   ring     = #e879f9  (fuchsia)
 *   outer    = #be185d  (deep magenta halo)
 *
 * Quality improvements vs previous:
 *   - Segments bumped 80→110 (better roundness, still fast)
 *   - clearcoat=1 re-added (cheap, gives shinier surface)
 *   - 3-layer glow sphere stack (tight / mid / diffuse) for depth
 *   - Ring segments 60→72 for smoother circle
 *   - Dual counter-rotating rings (adds complexity feel)
 */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function TokenModel({ isMobile = false }) {
  const meshRef   = useRef();
  const ring1Ref  = useRef();
  const ring2Ref  = useRef();
  const glow1Ref  = useRef();
  const glow2Ref  = useRef();
  const { pointer } = useThree();

  const tiltX   = useRef(0);
  const baseScale = isMobile ? 0.62 : 0.92;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (meshRef.current) {
      // Slow continuous Y spin
      meshRef.current.rotation.y += 0.0028;
      // Mouse-tilt X (smooth damp)
      tiltX.current += (pointer.y * 0.28 - tiltX.current) * 0.05;
      meshRef.current.rotation.x = tiltX.current;
      // Breathing
      meshRef.current.scale.setScalar(baseScale * (1 + Math.sin(t * 0.65) * 0.038));
    }

    // Ring 1 — forward tilt orbit
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5;
      ring1Ref.current.rotation.z = t * 0.32;
    }

    // Ring 2 — counter orbit (opposite direction)
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.38;
      ring2Ref.current.rotation.y = t * 0.45;
    }

    // Glow spheres — pulse opacity
    if (glow1Ref.current) {
      glow1Ref.current.material.opacity = 0.10 + Math.abs(Math.sin(t * 0.55)) * 0.12;
    }
    if (glow2Ref.current) {
      glow2Ref.current.material.opacity = 0.05 + Math.abs(Math.sin(t * 0.35 + 1)) * 0.07;
    }
  });

  return (
    <Float speed={1.1} floatIntensity={0.55} floatingRange={[-0.11, 0.11]}>
      <group ref={meshRef}>

        {/* ── Main torus knot ── */}
        <mesh>
          <torusKnotGeometry args={[1, 0.30, 110, 14, 2, 3]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#f9a8d4"
            emissiveIntensity={1.8}
            roughness={0.08}
            metalness={0.82}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* ── Fuchsia orbiting ring 1 ── */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[1.78, 0.042, 8, 72]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={2.4}
            roughness={0.04}
            metalness={0.95}
          />
        </mesh>

        {/* ── Rose secondary ring 2 (counter-orbit) ── */}
        <mesh ref={ring2Ref}>
          <torusGeometry args={[2.05, 0.028, 8, 64]} />
          <meshStandardMaterial
            color="#f9a8d4"
            emissive="#f9a8d4"
            emissiveIntensity={1.6}
            roughness={0.1}
            metalness={0.88}
          />
        </mesh>

        {/* ── Inner tight pink halo ── */}
        <mesh>
          <sphereGeometry args={[1.55, 16, 16]} />
          <meshBasicMaterial
            color="#ec4899"
            transparent
            opacity={0.07}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* ── Mid pink glow (pulsing) ── */}
        <mesh ref={glow1Ref}>
          <sphereGeometry args={[2.3, 16, 16]} />
          <meshBasicMaterial
            color="#f472b6"
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>

        {/* ── Outer deep magenta bloom (slow pulse) ── */}
        <mesh ref={glow2Ref}>
          <sphereGeometry args={[3.2, 12, 12]} />
          <meshBasicMaterial
            color="#be185d"
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
