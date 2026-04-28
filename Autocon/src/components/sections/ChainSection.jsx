/**
 * ChainSection.jsx — Chain Comparison Matrix
 * 5-column grid: AutoCon vs Ethereum / Polygon / BNB / Avalanche
 * Horizontally scrollable on mobile
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Container from '../layout/Container';
import { fadeUp, staggerContainer, viewportConfig } from '../../lib/motionVariants';

const CHAINS = ['AutoCon', 'Ethereum Raw', 'Polygon Raw', 'BNB Raw', 'Avalanche Raw'];

const ROWS = [
  { feature: 'No-Code UI',         values: [true,  false, false, false, false] },
  { feature: 'AI Security Audit',  values: [true,  false, false, false, false] },
  { feature: 'Multi-Chain Deploy', values: [true,  false, true,  false, false] },
  { feature: 'Gas Optimization',   values: [true,  false, true,  true,  true]  },
  { feature: 'Template Library',   values: [true,  false, false, false, false] },
  { feature: 'Free Tier',          values: [true,  false, false, true,  false] },
  { feature: 'Instant Deploy',     values: [true,  false, true,  true,  true]  },
];

function CheckIcon({ val }) {
  return val
    ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={18} color="#34d399" strokeWidth={2.5} /></div>
    : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X    size={16} color="var(--lp-text-muted)" strokeWidth={2} /></div>;
}

export default function ChainSection() {
  return (
    <section
      id="chain"
      className="landing-section"
      aria-label="Chain comparison matrix"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow */}
      <div aria-hidden="true" style={{
        position:     'absolute',
        inset:        0,
        background:   'radial-gradient(ellipse 70% 50% at 50% 50%, hsla(14,100%,50%,0.05) 0%, transparent 70%)',
        pointerEvents:'none',
      }} />

      <Container>
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={staggerContainer}
          style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 72px)' }}
        >
          <motion.span
            variants={fadeUp}
            style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--lp-accent)', marginBottom: '12px' }}
          >
            Platform Comparison
          </motion.span>
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 900, color: 'var(--lp-text-primary)', marginBottom: '14px' }}
          >
            Why AutoCon Wins
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--lp-text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            Compare AutoCon against raw chain development. No contest.
          </motion.p>
        </motion.div>

        {/* Table wrapper — horizontally scrollable on mobile */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeUp}
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
          role="region"
          aria-label="Feature comparison table"
          tabIndex={0}
        >
          <table
            style={{
              width:           '100%',
              minWidth:        '600px',
              borderCollapse:  'collapse',
              background:      'var(--lp-surface)',
              borderRadius:    '20px',
              overflow:        'hidden',
              border:          '1px solid var(--lp-border-subtle)',
            }}
            aria-label="Chain comparison: AutoCon vs raw chain development"
          >
            {/* Column headers */}
            <thead>
              <tr style={{ borderBottom: '1px solid var(--lp-border-subtle)' }}>
                <th style={{ padding: '18px 22px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--lp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '34%' }}>
                  Feature
                </th>
                {CHAINS.map((chain, i) => (
                  <th
                    key={chain}
                    scope="col"
                    style={{
                      padding:     '18px 14px',
                      textAlign:   'center',
                      fontSize:    i === 0 ? '0.88rem' : '0.78rem',
                      fontWeight:  700,
                      color:       i === 0 ? 'var(--lp-accent)' : 'var(--lp-text-muted)',
                      background:  i === 0 ? 'var(--lp-accent-soft)' : 'transparent',
                      borderLeft:  '1px solid var(--lp-border-subtle)',
                    }}
                  >
                    {i === 0 && (
                      <span style={{
                        display:      'block',
                        fontSize:     '0.6rem',
                        marginBottom: '4px',
                        fontWeight:   700,
                        textTransform:'uppercase',
                        letterSpacing:'0.08em',
                        opacity:      0.7,
                      }}>
                        ✦ Recommended
                      </span>
                    )}
                    {chain}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows */}
            <tbody>
              {ROWS.map(({ feature, values }, rowIdx) => (
                <tr
                  key={feature}
                  style={{
                    borderBottom: rowIdx < ROWS.length - 1 ? '1px solid var(--lp-border-subtle)' : 'none',
                    transition:   'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--lp-surface-elevated)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '16px 22px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--lp-text-secondary)' }}>
                    {feature}
                  </td>
                  {values.map((val, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding:    '16px 14px',
                        textAlign:  'center',
                        background: colIdx === 0 ? 'var(--lp-accent-soft)' : 'transparent',
                        borderLeft: '1px solid var(--lp-border-subtle)',
                      }}
                    >
                      <CheckIcon val={val} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </Container>
    </section>
  );
}
