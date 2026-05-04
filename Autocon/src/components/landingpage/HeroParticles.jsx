import { useEffect, useRef, useState } from 'react';

export default function HeroParticles() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    
    const timeout = setTimeout(updateDimensions, 100);
    const timeout2 = setTimeout(updateDimensions, 500);
    
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
      clearTimeout(timeout2);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    canvas.style.width = dimensions.width + 'px';
    canvas.style.height = dimensions.height + 'px';
    ctx.scale(dpr, dpr);
    
    // Initialize particles
    particlesRef.current = [];
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.4,
      });
    }

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw connections first (behind particles)
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 100, 30, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      
      // Draw particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = dimensions.width;
        if (p.x > dimensions.width) p.x = 0;
        if (p.y < 0) p.y = dimensions.height;
        if (p.y > dimensions.height) p.y = 0;
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 120, 40, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 80, 20, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 100, 30, 0.12) 0%, transparent 60%)',
        }}
      />
      
      {/* Canvas */}
      {dimensions.width > 0 && (
        <canvas 
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: dimensions.width + 'px',
            height: dimensions.height + 'px',
          }}
        />
      )}
      
      {/* Vignette */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}