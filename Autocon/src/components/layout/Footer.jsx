/**
 * Footer.jsx — Landing Page Footer
 * Multi-column link groups, social links, top border separation
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, MessageSquare, Linkedin, Zap, ExternalLink } from 'lucide-react';
import Container from '../layout/Container';
import { fadeIn, viewportConfig } from '../../lib/motionVariants';

const LINKS = {
  Product:  ['Features', 'Chain Support', 'Templates', 'AI Audit', 'Pricing'],
  Resources:['Documentation', 'Tutorials', 'API Reference', 'Changelog', 'Status'],
  Company:  ['About', 'Blog', 'Careers', 'Contact', 'Privacy Policy'],
};

const SOCIALS = [
  { icon: Twitter,      href: 'https://twitter.com/AutoCon',         label: 'Twitter'  },
  { icon: Github,       href: 'https://github.com/Wajiweb/Autocon',  label: 'GitHub'   },
  { icon: MessageSquare,href: 'https://discord.gg/autocon',          label: 'Discord'  },
  { icon: Linkedin,     href: 'https://linkedin.com/company/autocon',label: 'LinkedIn' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        borderTop:  '1px solid var(--lp-border-subtle)',
        paddingTop: 'clamp(48px, 7vw, 80px)',
        paddingBottom:'clamp(32px, 5vw, 56px)',
      }}
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={fadeIn}
        >
          {/* Top: Brand + Links */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
            gap:                 'clamp(32px, 5vw, 56px)',
            marginBottom:        'clamp(40px, 6vw, 64px)',
          }}>
            {/* Brand column */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{
                  width:         '32px',
                  height:        '32px',
                  borderRadius:  '9px',
                  background:    'var(--lp-accent)',
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                }}>
                  <Zap size={16} color="var(--surface)" strokeWidth={2.5} />
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--lp-text-primary)', letterSpacing: '-0.03em' }}>
                  Auto<span style={{ color: 'var(--lp-accent)' }}>Con</span>
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--lp-text-muted)', lineHeight: 1.7, maxWidth: '220px', marginBottom: '20px' }}>
                No-code Web3 smart contract platform. Deploy on any EVM chain.
              </p>
              {/* Socials */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow AutoCon on ${label}`}
                    style={{
                      width:         '34px',
                      height:        '34px',
                      borderRadius:  '9px',
                      background:    'var(--lp-surface)',
                      border:        '1px solid var(--lp-border-subtle)',
                      display:       'flex',
                      alignItems:    'center',
                      justifyContent:'center',
                      color:         'var(--lp-text-muted)',
                      transition:    'color 0.2s, background 0.2s, border-color 0.2s',
                      textDecoration:'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'var(--lp-accent)';
                      e.currentTarget.style.borderColor = 'var(--lp-accent)';
                      e.currentTarget.style.background = 'var(--lp-accent-soft)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'var(--lp-text-muted)';
                      e.currentTarget.style.borderColor = 'var(--lp-border-subtle)';
                      e.currentTarget.style.background = 'var(--lp-surface)';
                    }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([group, links]) => (
              <div key={group}>
                <p style={{
                  fontSize:     '0.72rem',
                  fontWeight:   700,
                  textTransform:'uppercase',
                  letterSpacing:'0.08em',
                  color:        'var(--lp-text-muted)',
                  marginBottom: '16px',
                }}>
                  {group}
                </p>
                <nav aria-label={`${group} links`}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {links.map(link => (
                      <li key={link}>
                        <a
                          href="#"
                          onClick={e => e.preventDefault()}
                          style={{
                            fontSize:       '0.88rem',
                            color:          'var(--lp-text-muted)',
                            textDecoration: 'none',
                            transition:     'color 0.2s',
                          }}
                          onMouseEnter={e => { e.target.style.color = 'var(--lp-text-primary)'; }}
                          onMouseLeave={e => { e.target.style.color = 'var(--lp-text-muted)'; }}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop:      '1px solid var(--lp-border-subtle)',
            paddingTop:     '24px',
            display:        'flex',
            flexWrap:       'wrap',
            justifyContent: 'space-between',
            alignItems:     'center',
            gap:            '12px',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--lp-text-muted)' }}>
              © {year} AutoCon. Built by{' '}
              <a
                href="https://github.com/Wajiweb"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--lp-accent)', textDecoration: 'none', fontWeight: 600 }}
              >
                Wajiweb
              </a>
              . All rights reserved.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--lp-text-muted)', fontWeight: 600 }}>All systems operational</span>
            </div>
          </div>
        </motion.div>
      </Container>
    </footer>
  );
}
