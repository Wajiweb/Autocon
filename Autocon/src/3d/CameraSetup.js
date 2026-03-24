/**
 * CameraSetup.js
 * Exports a hook for scroll-based parallax camera control.
 * Must be used inside a <Canvas> context.
 */
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';

export function useParallaxCamera() {
  const { camera } = useThree();
  const scroll = useScroll();
  const targetPos = useRef({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    const offset = scroll.offset; // 0 → 1 as user scrolls
    targetPos.current.z = offset * 2.0;   // drift camera slightly forward
    targetPos.current.y = -offset * 1.0;  // drift camera down a touch

    // Smooth damp — no jitter
    camera.position.z += (6 - targetPos.current.z - camera.position.z) * 0.05;
    camera.position.y += (targetPos.current.y - camera.position.y) * 0.05;
    camera.updateProjectionMatrix();
  });
}
