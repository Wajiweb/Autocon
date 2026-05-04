/**
 * SectionGlow.jsx — Optimized static side glow (no continuous animation)
 */
import React from 'react';

const SIZE_CONFIG = {
  sm: '150px',
  md: '200px',
  lg: '250px',
  xl: '300px',
};

export default function SectionGlow({ 
  intensity = 'medium', 
  position = 'both', 
  size = 'md',
  variations = {} 
}) {
  const { leftTop = '40%', rightTop = '50%' } = variations;
  const sizeValue = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  const opacityMap = { low: 0.08, medium: 0.12, high: 0.15 };
  const opacity = opacityMap[intensity] || 0.12;

  const showLeft = position === 'left' || position === 'both';
  const showRight = position === 'right' || position === 'both';

  const glowStyle = {
    position: 'absolute',
    width: sizeValue,
    height: sizeValue,
    borderRadius: '50%',
    background: `radial-gradient(
      ellipse at center,
      hsla(14, 100%, 50%, ${opacity}) 0%,
      hsla(14, 100%, 50%, ${opacity * 0.5}) 40%,
      transparent 70%
    )`,
    filter: 'blur(16px)',
    pointerEvents: 'none',
    zIndex: 0,
    willChange: 'opacity',
  };

  return (
    <>
      {showLeft && (
        <div style={{ ...glowStyle, left: '-12%', top: leftTop }} />
      )}
      {showRight && (
        <div style={{ ...glowStyle, right: '-12%', top: rightTop }} />
      )}
    </>
  );
}