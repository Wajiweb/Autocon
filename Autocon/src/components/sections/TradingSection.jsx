/**
 * TradingSection.jsx — Split layout: text left, visual right
 * 3 icon bullet rows with staggered reveal animation
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Image, Gavel, ArrowRight, CheckCircle2 } from 'lucide-react';
import Container from '../layout/Container';
import Button from '../ui/Button';
import { fadeUp, slideInRight, slideInLeft, staggerContainer, viewportConfig } from '../../lib/motionVariants';

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

// Mini dashboard visual for right panel
function ContractVisual() {
  return (
    <div style={{
      background:   'var(--lp-surface)',
      border:       '1px solid var(--lp-border-subtle)',
      borderRadius: '20px',
      overflow:     'hidden',
      boxShadow:    '0 24px 60px rgba(0,0,0,0.4)',
    }}>
      {/* Code editor mock */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--lp-border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
        {['#ff5f57', '#ffbd2e', '#28ca41'].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--lp-text-muted)', fontWeight: 600, marginLeft: 6 }}>contract.sol — AutoCon</span>
      </div>

      <div style={{ padding: '20px 22px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.8 }}>
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

      {/* Status bar */}
      <div style={{
        padding:    '12px 18px',
        background: 'var(--lp-surface-elevated)',
        borderTop:  '1px solid var(--lp-border-subtle)',
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
    </div>
  );
}

export default function TradingSection({ onGetStarted }) {
  return (
    <section
      id="trading"
      className="landing-section"
      aria-label="Contract types section"
    >
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

            {/* Bullet rows */}
            <motion.div variants={staggerContainer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {ITEMS.map(({ icon: Icon, title, description, color, bg }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  style={{
                    display:      'flex',
                    alignItems:   'flex-start',
                    gap:          '16px',
                    padding:      '18px 20px',
                    borderRadius: '14px',
                    background:   'var(--lp-surface)',
                    border:       '1px solid var(--lp-border-subtle)',
                    transition:   'border-color 0.2s',
                  }}
                  whileHover={{ borderColor: color, transition: { duration: 0.2 } }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--lp-text-primary)', marginBottom: '4px' }}>{title}</p>
                    <p style={{ fontSize: '0.84rem', color: 'var(--lp-text-secondary)', lineHeight: 1.6 }}>{description}</p>
                  </div>
                </motion.div>
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
