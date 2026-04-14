import React from 'react';
import { motion } from 'framer-motion';
import { Reveal, PillBadge, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   BENTO GRID
══════════════════════════════════════════════════════ */
const BentoGrid = ({ onGetStarted }) => {
  const cards = [
    { span: 'col-span-1', icon: '🪙', title: 'ERC-20 Tokens',     desc: 'Fungible tokens with custom supply, decimals, and governance.' },
    { span: 'col-span-2', icon: '🎨', title: 'NFT Collections',    desc: 'Full ERC-721 collections with IPFS metadata, royalties, and mint controls.', highlight: true },
    { span: 'col-span-2', icon: '🔨', title: 'Auction Contracts',  desc: 'Decentralized English auctions with time-locks and automatic payouts.' },
    { span: 'col-span-1', icon: '⚡', title: 'One-Click Deploy',   desc: 'From form to blockchain in under 30 seconds.' },
  ];
  return (
    <section style={{ background: 'var(--bg)', padding: '32px 48px 60px' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <PillBadge>Revolutionize Smart Contract Operations</PillBadge><br />
          <SectionHeading pre="Revolutionizing the Way" highlight="You Deploy" />
        </div>
      </Reveal>
      <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <motion.div whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.25 }}
              className={card.span}
              style={{
                padding: '24px 20px', borderRadius: '16px', position: 'relative', overflow: 'hidden',
                cursor: 'default',
                background: card.highlight ? 'linear-gradient(135deg, rgba(22,32,12,0.8), rgba(16,25,8,0.6))' : 'linear-gradient(145deg, var(--surface-low) 0%, var(--bg) 100%)',
                border: card.highlight ? '1px solid var(--primary-glow)' : '1px solid var(--border-color)',
                boxShadow: card.highlight ? 'var(--shadow-glow)' : 'var(--shadow-md)',
              }}>
              {card.highlight && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />}
              <div style={{ fontSize: '20px', marginBottom: '12px' }}>{card.icon}</div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>{card.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>{card.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;
