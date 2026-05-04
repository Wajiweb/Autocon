/**
 * FAQ.jsx — Premium animated accordion with cinematic design
 * Enhanced with motion, depth, and AutoCon's premium theme
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
    <motion.div
      role="region"
      aria-label={q}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        background:   isOpen 
          ? 'linear-gradient(145deg, rgba(25,25,25,0.95), rgba(18,18,18,0.9))' 
          : 'linear-gradient(145deg, #111111, #0a0a0a)',
        border:       isOpen ? '1px solid rgba(255,107,0,0.25)' : '1px solid rgba(255,107,0,0.08)',
        borderRadius: '14px',
        overflow:     'hidden',
        marginBottom: '12px',
        transition:   'all 0.3s ease',
        transform:    isOpen ? 'scale(1.01)' : 'scale(1)',
        boxShadow:    isOpen 
          ? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(255,107,0,0.08)' 
          : '0 2px 12px rgba(0,0,0,0.15)',
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
          padding:        '20px 24px',
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
          color:      isOpen ? '#ff6b00' : 'var(--lp-text-primary)',
          lineHeight: 1.4,
          transition: 'color 0.25s',
          flex:       1,
        }}>
          {q}
        </span>
        <motion.span
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flexShrink:   0,
            width:        '28px',
            height:       '28px',
            borderRadius: '50%',
            background:   isOpen ? 'rgba(255,107,0,0.2)' : 'transparent',
            border:       `1px solid ${isOpen ? 'rgba(255,107,0,0.5)' : 'rgba(255,107,0,0.15)'}`,
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            color:        isOpen ? '#ff6b00' : 'rgba(255,255,255,0.4)',
            transition:   'all 0.25s ease',
            boxShadow:    isOpen ? '0 0 12px rgba(255,107,0,0.3)' : 'none',
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
              padding:      '0 24px 20px 24px',
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      style={{ 
        position: 'relative',
        background: '#0a0a0a',
      }}
    >
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(255,107,0,0.06), transparent 60%)',
        pointerEvents: 'none',
      }} />
      
      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.3) 100%)',
        pointerEvents: 'none',
      }} />
      
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