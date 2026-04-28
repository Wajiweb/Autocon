/**
 * FAQ.jsx — Accessible accordion with keyboard navigation
 * Single item open at a time.
 * Height animation via Framer Motion AnimatePresence.
 * Full aria: role="region", aria-expanded, aria-controls.
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import Container from '../layout/Container';
import { fadeUp, staggerContainer, accordionContent, viewportConfig } from '../../lib/motionVariants';

const FAQS = [
  {
    q: 'Do I need to know Solidity to use AutoCon?',
    a: 'No. AutoCon generates production-ready Solidity contracts automatically based on your inputs. You configure parameters like name, supply, and chain — AutoCon handles the code.',
  },
  {
    q: 'Which blockchains are supported?',
    a: 'Currently AutoCon supports Sepolia (Ethereum testnet), Polygon Amoy, and BNB testnet. Mainnet support is on the roadmap.',
  },
  {
    q: 'How does the AI audit work?',
    a: 'Before deployment, AutoCon\'s Gemini-powered AI engine scans your contract for common vulnerabilities: reentrancy, integer overflow, missing access controls, and more. You get a detailed audit report instantly.',
  },
  {
    q: 'Can I export or download my contract code?',
    a: 'Yes. Every generated contract can be downloaded as a .sol file, exported as a PDF report, or zipped for local development. You own your code.',
  },
  {
    q: 'Is AutoCon free to use?',
    a: 'AutoCon offers a free tier with full access to all three contract types on testnets. Mainnet deployments and advanced features are available on paid plans.',
  },
  {
    q: 'What happens if my contract fails the AI audit?',
    a: 'AutoCon shows you exactly which issues were found, with suggested fixes. You can regenerate the contract with corrected parameters or modify it manually before deploying.',
  },
];

function FAQItem({ q, a, index, isOpen, onToggle }) {
  const answerId = `faq-answer-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div
      role="region"
      aria-label={q}
      style={{
        borderBottom: '1px solid var(--lp-border-subtle)',
        overflow:     'hidden',
      }}
    >
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => onToggle(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(index);
          }
        }}
        style={{
          width:          '100%',
          background:     'none',
          border:         'none',
          cursor:         'pointer',
          padding:        '22px 0',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '16px',
          textAlign:      'left',
          fontFamily:     '"Inter", sans-serif',
        }}
      >
        <span style={{
          fontSize:   '1rem',
          fontWeight: 700,
          color:      isOpen ? 'var(--lp-accent)' : 'var(--lp-text-primary)',
          lineHeight: 1.4,
          transition: 'color 0.2s',
          flex:       1,
        }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flexShrink:   0,
            width:        '28px',
            height:       '28px',
            borderRadius: '50%',
            background:   isOpen ? 'var(--lp-accent-soft)' : 'var(--lp-surface)',
            border:       `1px solid ${isOpen ? 'var(--lp-accent)' : 'var(--lp-border-subtle)'}`,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            color:        isOpen ? 'var(--lp-accent)' : 'var(--lp-text-muted)',
            transition:   'background 0.2s, border-color 0.2s',
          }}
          aria-hidden="true"
        >
          <Plus size={14} strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={buttonId}
            key="content"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={accordionContent}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize:     '0.92rem',
              color:        'var(--lp-text-secondary)',
              lineHeight:   1.75,
              paddingBottom:'22px',
              paddingRight: '44px',
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = useCallback((index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  }, []);

  return (
    <section
      id="faq"
      className="landing-section"
      aria-label="Frequently asked questions"
    >
      <Container>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap:                 'clamp(40px, 7vw, 96px)',
          alignItems:          'start',
        }}>
          {/* Left: heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={staggerContainer}
          >
            <motion.span
              variants={fadeUp}
              style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lp-accent)', marginBottom: '12px' }}
            >
              Have Questions?
            </motion.span>
            <motion.h2
              variants={fadeUp}
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--lp-text-primary)', marginBottom: '16px' }}
            >
              Frequently<br />Asked Questions
            </motion.h2>
            <motion.p
              variants={fadeUp}
              style={{ fontSize: '0.97rem', color: 'var(--lp-text-secondary)', lineHeight: 1.7, maxWidth: '380px' }}
            >
              Everything you need to know about AutoCon. Can't find what you're looking for? Reach out on Discord.
            </motion.p>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
            variants={fadeUp}
          >
            {FAQS.map((item, index) => (
              <FAQItem
                key={index}
                {...item}
                index={index}
                isOpen={openIndex === index}
                onToggle={handleToggle}
              />
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
