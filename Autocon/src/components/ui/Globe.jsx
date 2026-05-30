/**
 * Globe.jsx — Smart Contract Crypto Coin (Holographic 3D Component)
 *
 * This replaces the wireframe globe with a 3D spinning crypto-coin that
 * represents a smart contract ledger.
 * - Double-toned contrast: Brand orange/gold and glowing neon cyan/blue
 * - Engraved high-fidelity SVG Smart Contract Shield & Code Brackets
 * - Orbiting cyan blockchain ledger nodes
 * - Clean CSS 3D transforms (preserve-3d) and floating keyframes
 */
import React from 'react';

export default function Globe({ size = 420 }) {
  return (
    <div
      className="globe-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
      }}
      aria-hidden="true"
    >
      {/* Glow backlight (Cyan-Orange aura) */}
      <div className="globe-aura" />

      {/* 3D Spin Orbit for Cyan Node 1 */}
      <div className="globe-orbit-cyan">
        <div className="orbit-block" />
      </div>

      {/* 3D Spin Orbit for Orange Node 2 */}
      <div className="globe-orbit-orange">
        <div className="orbit-block-orange" />
      </div>

      {/* Spinning 3D Coin */}
      <div className="coin-3d">
        {/* Rim back (3D depth layer) */}
        <div className="coin-rim" />

        {/* Front Face */}
        <div className="coin-face">
          {/* Glass reflection overlay */}
          <div className="coin-reflect" />

          {/* Glowing code matrix grid */}
          <div className="coin-grid" />

          {/* Running laser scanner line */}
          <div className="coin-scan" />

          {/* AutoCon Logo — centered on coin face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {/* Soft orange glow behind logo */}
            <div
              style={{
                position: 'absolute',
                width: '55%',
                height: '55%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(25,100%,50%,0.18) 0%, transparent 70%)',
                filter: 'blur(12px)',
                pointerEvents: 'none',
              }}
            />
            <img
              src="/autocon-logo-new.png"
              alt="AutoCon"
              style={{
                width: '52%',
                height: '52%',
                objectFit: 'contain',
                /* mix-blend-mode:screen makes white background invisible
                   on the dark coin face, leaving only the orange logo */
                mixBlendMode: 'screen',
                filter: 'drop-shadow(0 0 14px hsla(25, 100%, 55%, 0.75)) brightness(1.15)',
                pointerEvents: 'none',
                position: 'relative',
                zIndex: 6,
              }}
            />
          </div>

          {/* Subtly glowing outer tech notches */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <div
              key={deg}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '6px',
                height: '2px',
                background: 'hsl(180, 100%, 50%)',
                boxShadow: '0 0 6px hsl(180, 100%, 50%)',
                transform: `translate(-50%, -50%) rotate(${deg}deg) translate(84px, 0)`,
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
