import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import EthereumCoin from './EthereumCoin';

export default function HeroCanvas() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth < 768 ? 0.65 : 1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-80">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: false,
          alpha: true,
          stencil: false,
          powerPreference: 'high-performance',
        }}
        dpr={Math.min(window.devicePixelRatio, 1.5)}
        style={{ background: 'transparent' }}
      >
        {/* Lighting — purple/cyan to complement the crystal */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-10, -5, -5]} intensity={1.2} color="#a78bfa" />
        <pointLight position={[0, -6, 4]} intensity={2.0} color="#67e8f9" />

        <Suspense fallback={null}>
          <EthereumCoin position={[0, -0.2, 0]} scale={[scale, scale, scale]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
