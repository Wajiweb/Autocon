/**
 * TradingSection.jsx — Split layout: text left, visual right
 * Enhanced with cinematic Web3 aesthetic, tilt interactions, and depth
 */
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Coins, Image, Gavel, ArrowRight, CheckCircle2 } from 'lucide-react';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp, slideInRight, staggerContainer, viewportConfig } from '../../lib/motionVariants';

const ITEMS = [
  {
    icon:        Coins,
    title:       'ERC-20 Token Contracts',
    description: 'Mint fungible tokens with custom supply, decimals, and burn mechanics. Go live on any EVM chain.',
    color:       'var(--lp-accent)',
    bg:          'var(--lp-accent-soft)',
  },
  {
    icon:        Image,
    title:       'NFT Collections (ERC-721)',
    description: 'Launch unique digital collections with on-chain metadata, mint pricing, and max supply controls.',
    color:       '#a78bfa',
    bg:          'hsla(260,80%,65%,0.12)',
  },
  {
    icon:        Gavel,
    title:       'English Auction Contracts',
    description: 'Deploy time-limited auctions with automatic bid tracking, withdrawals, and settlement logic.',
    color:       '#34d399',
    bg:          'hsla(160,60%,55%,0.12)',
  },
];

// Tilt card component with 3D effect
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 25 });
  
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// Feature card with gradient and tilt
function FeatureCard({ icon: Icon, title, description, color, bg }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <TiltCard>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '16px',
          padding:      '20px 22px',
          borderRadius: '16px',
          background:   'linear-gradient(145deg, #111111, #0a0a0a)',
          border:       isHovered ? '1px solid rgba(255,107,0,0.35)' : '1px solid rgba(255,107,0,0.1)',
          transition:   'all 0.3s ease',
          transform:    isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow:    isHovered 
            ? '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(255,107,0,0.08)' 
            : '0 4px 20px rgba(0,0,0,0.2)',
          position:     'relative',
          overflow:     'hidden',
        }}
      >
        {/* Micro light reflection */}
        {isHovered && (
          <div style={{
            position:        'absolute',
            top:             '-50%',
            left:            '-50%',
            width:           '200%',
            height:          '200%',
            background:      'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.08), transparent 50%)',
            pointerEvents:   'none',
          }} />
        )}
        
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: isHovered 
              ? 'linear-gradient(135deg, rgba(255,107,0,0.3), rgba(255,140,0,0.2))' 
              : 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,107,0,0.08))',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexShrink: 0,
            transition: 'all 0.3s ease',
            boxShadow:  isHovered ? '0 0 20px rgba(255,107,0,0.3)' : 'none',
          }}
        >
          <Icon size={22} color={isHovered ? '#ff8c00' : color} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '6px' }}>{title}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>{description}</p>
        </div>
      </motion.div>
    </TiltCard>
  );
}

// Mini dashboard visual for right panel - glass-like code editor
function ContractVisual() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background:   'linear-gradient(145deg, #1a1a1a, #111111)',
        border:       '1px solid rgba(255,107,0,0.12)',
        borderRadius: '20px',
        overflow:     'hidden',
        boxShadow:    '0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,0,0.04), inset 0 1px 0 rgba(255,107,0,0.05)',
        transform:    isHovered ? 'scale(1.01)' : 'scale(1)',
        transition:   'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Code editor mock - top glow strip */}
      <div style={{
        height: '3px',
        background: 'linear-gradient(90deg, transparent, rgba(255,107,0,0.6), transparent)',
      }} />
      
      {/* Editor header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,120,0,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)', fontWeight: 600, marginLeft: 6 }}>contract.sol — AutoCon</span>
      </div>

      {/* Code content with subtle inner glow */}
      <div style={{ 
        padding: '20px 22px', 
        fontFamily: 'monospace', 
        fontSize: '0.8rem', 
        lineHeight: 1.8,
        background: 'linear-gradient(180deg, transparent, rgba(255,120,0,0.02) 50%, transparent)',
      }}>
        {[
          { c: '#a78bfa', t: '// SPDX-License-Identifier: MIT' },
          { c: 'var(--lp-text-muted)', t: 'pragma solidity ^0.8.20;' },
          { c: 'var(--lp-text-muted)', t: '' },
          { c: '#34d399', t: 'import "@openzeppelin/contracts/token/ERC20/ERC20.sol";' },
          { c: 'var(--lp-text-muted)', t: '' },
          { c: 'var(--lp-accent)', t: 'contract MyToken is ERC20 {' },
          { c: '#a78bfa', t: '  constructor() ERC20("MyToken", "MTK") {' },
          { c: 'var(--lp-text-secondary)', t: '    _mint(msg.sender, 1000000 * 10**18);' },
          { c: '#a78bfa', t: '  }' },
          { c: 'var(--lp-accent)', t: '}' },
        ].map(({ c, t }, i) => (
          <div key={i} style={{ color: c, whiteSpace: 'pre' }}>{t || ' '}</div>
        ))}
      </div>

      {/* Status bar with bottom accent */}
      <div style={{
        padding:    '12px 18px',
        background: 'linear-gradient(180deg, rgba(20,20,22,0.8), rgba(15,15,18,1))',
        borderTop:  '1px solid rgba(255,120,0,0.1)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCircle2 size={14} color="#34d399" />
          <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>AI Audit Passed · 0 Issues</span>
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--lp-accent)', fontWeight: 700 }}>Deploy →</span>
      </div>
    </motion.div>
  );
}

export default function TradingSection({ onGetStarted }) {
  return (
    <section
      id="trading"
      className="landing-section"
      aria-label="Contract types section"
      style={{ 
        position: 'relative',
        background: '#0a0a0a',
      }}
    >
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 30% 40%, rgba(255,107,0,0.08), transparent 60%)',
        pointerEvents: 'none',
      }} />
      
      {/* Vignette edges */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />
      
      <Container>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
          gap:                 'clamp(40px, 7vw, 96px)',
          alignItems:          'center',
        }}>
          {/* ── Left: Text + Bullets ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
            style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
          >
            <div>
              <motion.span
                variants={fadeUp}
                style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lp-accent)', marginBottom: '12px' }}
              >
                What You Can Build
              </motion.span>
              <motion.h2
                variants={fadeUp}
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.75rem)', fontWeight: 900, color: 'var(--lp-text-primary)', marginBottom: '14px' }}
              >
                Three Contract Types,<br />
                <span style={{ color: 'var(--lp-accent)' }}>One Unified Platform</span>
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: '0.97rem', color: 'var(--lp-text-secondary)', lineHeight: 1.7 }}>
                AutoCon gives you everything you need to build production-grade smart contracts — without writing a single line of Solidity.
              </motion.p>
            </div>

            {/* Bullet rows with tilt cards */}
            <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ITEMS.map(({ icon: Icon, title, description, color, bg }) => (
                <FeatureCard
                  key={title}
                  icon={Icon}
                  title={title}
                  description={description}
                  color={color}
                  bg={bg}
                />
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                variant="primary"
                onClick={onGetStarted}
                aria-label="Start building your smart contract"
                style={{ fontSize: '0.92rem' }}
              >
                Start Building
                <ArrowRight size={16} strokeWidth={2.5} />
              </Button>
            </motion.div>
          </motion.div>

          {/* ── Right: Code Visual ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={slideInRight}
          >
            <ContractVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}