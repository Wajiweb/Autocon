/**
 * Navbar.jsx — Landing Page Navigation
 * - Sticky, blur-on-scroll
 * - Mobile collapse at md (768px) breakpoint
 * - Slide-down entrance animation (0.4s)
 * - Smooth-scroll anchor links
 * - Full keyboard + aria accessibility
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';
import Button from '../ui/Button';
import { navbarSlideDown } from '../../lib/motionVariants';

const NAV_LINKS = [
  { label: 'Features',    href: 'features'  },
  { label: 'Contracts',   href: 'chain'     },
  { label: 'Templates',   href: 'trading'   },
  { label: 'Testimonials', href: 'testimonials' },
  { label: 'FAQs',        href: 'faq'        },
];

const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Navbar({ onConnect }) {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLink = useCallback((id) => {
    scrollTo(id);
    setMobileOpen(false);
  }, []);

  const handleKeyLink = useCallback((e, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLink(id);
    }
  }, [handleLink]);

  return (
    <>
      <motion.header
        role="banner"
        {...navbarSlideDown}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          right:         0,
          zIndex:        999,
          transition:    'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
          background:    scrolled ? 'hsla(0, 0%, 8%, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
          borderBottom:  scrolled ? '1px solid var(--lp-border-subtle)' : '1px solid transparent',
        }}
      >
        <div
          style={{
            maxWidth:      '1350px',
            margin:        '0 auto',
            padding:       '0 clamp(16px, 4vw, 60px)',
            height:        '72px',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
            gap:           '24px',
          }}
        >
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            aria-label="Go to top — AutoCon"
            style={{
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              display:       'flex',
              alignItems:    'center',
              gap:           '10px',
              padding:       0,
              flexShrink:    0,
            }}
          >
            <span
              style={{
                width:         '36px',
                height:        '36px',
                borderRadius:  '10px',
                background:    'var(--lp-accent)',
                display:       'flex',
                alignItems:    'center',
                justifyContent:'center',
              }}
            >
              <Zap size={20} color="var(--surface)" strokeWidth={2.5} />
            </span>
            <span
              style={{
                fontSize:    '1.15rem',
                fontWeight:  800,
                color:       'var(--lp-text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Auto<span style={{ color: 'var(--lp-accent)' }}>Con</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <nav
            role="navigation"
            aria-label="Main navigation"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            className="lp-desktop-nav"
          >
            {NAV_LINKS.map(({ label, href }) => (
              <button
                key={href}
                onClick={() => handleLink(href)}
                onKeyDown={(e) => handleKeyLink(e, href)}
                aria-label={`Navigate to ${label} section`}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  padding:       '8px 16px',
                  borderRadius:  '8px',
                  color:         'var(--lp-text-secondary)',
                  fontSize:      '0.9rem',
                  fontWeight:    600,
                  fontFamily:    '"Inter", sans-serif',
                  transition:    'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.target.style.color = 'var(--lp-text-primary)'; e.target.style.background = 'var(--lp-border-subtle)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--lp-text-secondary)'; e.target.style.background = 'transparent'; }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="lp-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Button
              variant="ghost"
              onClick={onConnect}
              aria-label="Connect Wallet"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              Connect Wallet
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="lp-mobile-nav"
            style={{
              background:  'none',
              border:      '1.5px solid var(--lp-border)',
              borderRadius: '10px',
              cursor:      'pointer',
              padding:     '8px',
              color:       'var(--lp-text-primary)',
              display:     'flex',
              alignItems:  'center',
              justifyContent: 'center',
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Full-Screen Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-nav"
              role="navigation"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
              style={{
                background:   'hsla(0, 0%, 8%, 0.97)',
                backdropFilter: 'blur(24px)',
                borderTop:    '1px solid var(--lp-border-subtle)',
                overflow:     'hidden',
              }}
            >
              <div style={{ padding: '20px clamp(16px, 4vw, 60px) 28px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {NAV_LINKS.map(({ label, href }) => (
                  <button
                    key={href}
                    onClick={() => handleLink(href)}
                    style={{
                      background:    'none',
                      border:        'none',
                      cursor:        'pointer',
                      padding:       '14px 16px',
                      borderRadius:  '10px',
                      color:         'var(--lp-text-secondary)',
                      fontSize:      '1rem',
                      fontWeight:    600,
                      fontFamily:    '"Inter", sans-serif',
                      textAlign:     'left',
                      transition:    'color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={e => { e.target.style.color = 'var(--lp-text-primary)'; e.target.style.background = 'var(--lp-border-subtle)'; }}
                    onMouseLeave={e => { e.target.style.color = 'var(--lp-text-secondary)'; e.target.style.background = 'transparent'; }}
                  >
                    {label}
                  </button>
                ))}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button variant="secondary" onClick={() => { onConnect(); setMobileOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>Connect Wallet</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Responsive style rules */}
      <style>{`
        @media (min-width: 768px) {
          .lp-desktop-nav { display: flex !important; }
          .lp-mobile-nav  { display: none  !important; }
        }
        @media (max-width: 767px) {
          .lp-desktop-nav { display: none  !important; }
          .lp-mobile-nav  { display: flex  !important; }
        }
      `}</style>
    </>
  );
}
