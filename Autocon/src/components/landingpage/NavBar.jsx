import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════ */
const NavBar = ({ onConnect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = ['Features', 'About', 'Security', 'FAQ'];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 48px',
      background: scrolled ? 'rgba(0,0,0,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      transition: 'all 0.35s ease',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '9px',
          background: '#c6f100',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '0.8rem', color: '#000',
          boxShadow: '0 4px 16px rgba(198,241,0,0.35)',
        }}>AC</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>AutoCon</span>
      </div>

      {/* Center pill nav */}
      <div className="hidden md:flex" style={{
        alignItems: 'center', background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.09)', borderRadius: '99px',
        padding: '5px 6px', gap: '2px',
      }}>
        {links.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} style={{
            color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
            fontSize: '0.84rem', fontWeight: 500, padding: '7px 20px',
            borderRadius: '99px', transition: 'all 0.2s ease',
          }}
            onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'transparent'; }}>
            {link}
          </a>
        ))}
      </div>

      {/* Right CTA */}
      <div className="hidden md:flex" style={{ alignItems: 'center' }}>
        <button onClick={onConnect} style={{
          padding: '10px 26px', borderRadius: '10px', border: 'none',
          background: '#c6f100', color: '#000', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(198,241,0,0.3)',
        }}
          onMouseOver={e => { e.currentTarget.style.background = '#d2f300'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#c6f100'; e.currentTarget.style.transform = ''; }}>
          Get Started
        </button>
      </div>

      {/* Mobile toggle */}
      <div className="flex md:hidden items-center gap-3">
        <button onClick={onConnect} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#c6f100', color: '#000', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
        }}>Get Started</button>
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute', top: '64px', left: 0, right: 0,
              background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              padding: '24px 48px', display: 'flex', flexDirection: 'column', gap: '18px',
            }}>
            {links.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setIsOpen(false)}
                style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
                {link}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavBar;
