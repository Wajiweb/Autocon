/**
 * Scene.jsx — Optimized Hero 3D scene
 * 
 * Perf fixes vs v1:
 *  - Removed EffectComposer/Bloom (full-screen pass was killing FPS)
 *  - Removed Environment HDR load (blocked network + GPU)
 *  - Reduced star count, disabled DustCloud on desktop too
 *  - All lights kept but simplified
 *  - Canvas DPR hard-capped at 1 on mobile, 1.2 on desktop
 *  - frameloop="demand" on mobile → only renders on changes
 */
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroLights } from './Lights.jsx';
import TokenModel from './TokenModel';
import FloatingObjects from './FloatingObjects';
import { StarField } from './Particles';
import { useWindowSize } from '../hooks/useWindowSize';

function SceneContents({ isMobile }) {
  return (
    <>
      <HeroLights />
      {/* Lean particle starfield — no HDR, no bloom needed */}
      <StarField count={isMobile ? 400 : 900} spread={40} />
      {/* Mid-layer node constellation (mobile: 1 layer only) */}
      <FloatingObjects isMobile={isMobile} />
      {/* Hero centrepiece */}
      <TokenModel isMobile={isMobile} />
    </>
  );
}

export default function Scene() {
  const { width } = useWindowSize();
  const isMobile = width < 768;

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 7], fov: isMobile ? 65 : 48 }}
        gl={{
          antialias: false,           // off globally — saves ~20% GPU
          powerPreference: 'high-performance',
          alpha: true,
          stencil: false,             // unused — free saving
          depth: true,
        }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 1.2)}
        frameloop={isMobile ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContents isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  );
}
