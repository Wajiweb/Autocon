import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp } from '../../lib/motionVariants';

function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      
      ctx.scale(dpr, dpr);
      
      const particles = [];
      for (let i = 0; i < 56; i++) {
        particles.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: 2 + Math.random() * 2.5,
          opacity: 0.5 + Math.random() * 0.4,
        });
      }
      particlesRef.current = particles;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw connections with glow
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            const alpha = (1 - dist / 150) * 0.4;
            
            // Glow effect for connections
            ctx.shadowColor = 'rgba(255, 140, 30, 0.8)';
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 160, 60, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          }
        }
      }
      
      // Draw particles with glow
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        
        // Outer glow
        ctx.shadowColor = 'rgba(255, 150, 40, 1)';
        ctx.shadowBlur = 15;
        
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(255, 200, 100, ${p.opacity})`);
        gradient.addColorStop(0.4, `rgba(255, 150, 50, ${p.opacity * 0.8})`);
        gradient.addColorStop(1, 'rgba(255, 100, 20, 0)');
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div 
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        background: '#0a0a0f',
      }}
    >
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 140, 40, 0.25) 0%, rgba(255, 100, 20, 0.1) 40%, transparent 70%)',
        }}
      />
      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
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

const USER_AVATARS = [
  'hsl(25,100%,50%)',
  'hsl(180,100%,45%)',
  'hsl(270,100%,55%)',
  'hsl(150,100%,45%)',
];

export default function Hero({ onGetStarted }) {
  return (
    <section
      id="hero"
      aria-label="Hero section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '100px',
        paddingBottom: '80px',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground />
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <motion.div variants={fadeUp}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '99px',
                background: 'var(--lp-accent-soft)',
                border: '1px solid hsla(14,100%,50%,0.25)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--lp-accent)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              <Zap size={12} strokeWidth={2.5} />
              Web3 Smart Contract Generator
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 5.25rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.04em',
              color: 'var(--lp-text-primary)',
            }}
          >
            Deploy Smart Contracts
            <br />
            <span style={{ color: 'var(--lp-accent)' }}>Without Writing Code</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--lp-text-secondary)',
              maxWidth: '540px',
              lineHeight: 1.7,
            }}
          >
            Generate production-ready Solidity contracts with AI. 
            No Solidity knowledge required. Deploy to multiple chains in minutes.
          </motion.p>

          <motion.div
            variants={fadeUp}
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '8px',
            }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              style={{ gap: '8px' }}
            >
              Start Building Free
              <ArrowRight size={18} />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            <div style={{ display: 'flex', marginLeft: '-8px' }}>
              {USER_AVATARS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: c,
                    border: '2px solid var(--lp-bg)',
                    marginLeft: i ? '-8px' : 0,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)', fontWeight: 500 }}>
              Trusted by <strong style={{ color: 'var(--lp-text-secondary)' }}>2,500+</strong> developers
            </span>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}