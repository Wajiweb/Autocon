import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Reveal, SectionHeading } from './Shared';

/* ══════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════ */
const testimonials = [
  { name: 'Yousuf A.', role: 'DeFi Developer',       text: 'AutoCon cut my contract deployment time from hours to seconds. The security audit caught an overflow bug I missed entirely.', stars: 5 },
  { name: 'Maria K.',  role: 'NFT Creator',           text: 'I launched my entire NFT collection without writing a single line of code. The MetaMask integration is seamless.', stars: 5 },
  { name: 'Zaid S.',   role: 'Blockchain Founder',    text: 'The AI assistant is genuinely helpful for understanding what each parameter does. Perfect for non-technical founders.', stars: 5 },
  { name: 'Aisha R.',  role: 'Web3 Educator',         q: 'I recommend AutoCon to all my students. It lets them see live contracts without getting bogged down in Solidity syntax.' },
  { name: 'Farhan Q.', role: 'Smart Contract Auditor',q: 'Impressive gas optimization on the generated code. The output is clean and follows current best practices.' },
  { name: 'Lena W.',   role: 'Startup CTO',           q: 'Saved us weeks of development time. We went from idea to deployed ERC-20 token in a single afternoon.' },
];

const Testimonials = () => (
  <section id="testimonials" style={{ background: 'var(--bg)', padding: '0 48px 100px' }}>
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <SectionHeading pre="What Our" highlight="Clients" after="Say" sub="Developers, creators, and founders building with AutoCon." />
      </div>
    </Reveal>
    <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="testimonials-grid">
      {testimonials.map((t, i) => (
        <Reveal key={t.name} delay={i * 0.07}>
          <motion.div>
            <div style={{
              padding: '36px 32px', borderRadius: '20px',
              border: '1px solid var(--border-color)', background: 'var(--surface-low)',
              cursor: 'default', transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary-glow)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="var(--primary)" style={{ color: 'var(--primary)' }} />)}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.7, marginBottom: '28px', fontStyle: 'italic' }}>"{t.q}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--surface-high)', border: '1px solid var(--border-color)' }}>
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${t.name}&backgroundColor=transparent`} alt={t.name} style={{ width: '100%', height: '100%' }} />
                </div>
                <div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.role}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      ))}
    </div>
  </section>
);

export default Testimonials;
