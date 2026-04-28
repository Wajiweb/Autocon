import React from 'react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

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
      background: scrolled ? 'var(--surface)' : 'transparent',
      borderBottom: scrolled ? '1px solid #ddd' : 'none',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '9px',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '0.8rem', color: 'var(--surface)',
        }}>AC</div>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em' }}>AutoCon</span>
      </div>

      {/* Center pill nav */}
      <div className="hidden md:flex" style={{
        alignItems: 'center', background: 'var(--surface-elevated)',
        border: '1px solid #eee', borderRadius: '99px',
        padding: '5px 6px', gap: '2px',
      }}>
        {links.map(link => (
          <a key={link} href={`#${link.toLowerCase()}`} style={{
            color: '#666', textDecoration: 'none',
            fontSize: '0.84rem', fontWeight: 500, padding: '7px 20px',
            borderRadius: '99px',
          }}>
            {link}
          </a>
        ))}
      </div>

      {/* Right CTA */}
      <div className="hidden md:flex" style={{ alignItems: 'center' }}>
        <button onClick={onConnect} style={{
          padding: '10px 26px', borderRadius: '10px', border: 'none',
          background: 'var(--primary)', color: 'var(--surface)', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
        }}>
          Get Started
        </button>
      </div>

      {/* Mobile toggle */}
      <div className="flex md:hidden items-center gap-3">
        <button onClick={onConnect} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: 'var(--primary)', color: 'var(--surface)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
        }}>Get Started</button>
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          background: 'var(--surface)', borderBottom: '1px solid #ddd',
          padding: '24px 48px', display: 'flex', flexDirection: 'column', gap: '18px',
        }}>
          {links.map(link => (
            <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setIsOpen(false)}
              style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
