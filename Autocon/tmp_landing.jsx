import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Twitter, Linkedin, Github, MessageSquare, Menu, X,
  ChevronRight, ChevronDown, Shield, Zap, Globe,
  Code2, BarChart3, Lock, Cpu, Wallet, FileCode2,
  ArrowRight, Star, Check
} from 'lucide-react';
import { Footer as AnimatedFooter } from '../components/ui/modem-animated-footer';

/* ─── Reusable scroll-reveal wrapper ─── */
const Reveal = ({ children, delay = 0, y = 30, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Pill Badge ─── */
const PillBadge = ({ children }) => (
  <span style={{
    display: 'inline-block', padding: '6px 18px', borderRadius: '99px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    fontSize: '0.82rem', fontWeight: 400, color: 'rgba(255,255,255,0.6)',
    letterSpacing: '0.01em', marginBottom: '24px',
  }}>{children}</span>
);

/* ─── Section heading ─── */
const SectionHeading = ({ pre, highlight, after, sub, center = true }) => (
  <div style={{ textAlign: center ? 'center' : 'left' }}>
    <h2 style={{
      fontSize: 'clamp(1.9rem, 4vw, 3.2rem)', fontWeight: 700,
      color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1,
      marginBottom: sub ? '20px' : 0,
    }}>
      {pre}{' '}
      {highlight && (
        <span style={{
          background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{highlight}</span>
      )}
      {after && <> {after}</>}
    </h2>
    {sub && (
      <p style={{
        color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.7,
        maxWidth: center ? '560px' : '100%', margin: center ? '0 auto' : '0',
      }}>{sub}</p>
    )}
  </div>
);

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
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '0.8rem', color: '#fff',
          boxShadow: '0 4px 16px rgba(79,70,229,0.5)',
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
          background: '#4f46e5', color: '#fff', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
        }}
          onMouseOver={e => { e.currentTarget.style.background = '#4338ca'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#4f46e5'; e.currentTarget.style.transform = ''; }}>
          Get Started
        </button>
      </div>

      {/* Mobile toggle */}
      <div className="flex md:hidden items-center gap-3">
        <button onClick={onConnect} style={{
          padding: '8px 16px', borderRadius: '8px', border: 'none',
          background: '#4f46e5', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
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

/* ══════════════════════════════════════════════════════
   HERO SECTION  ── Inno Exact Replica
   ─ Large planet sphere (fills viewport BG)
   ─ Bottom-up converging light beam (spotlight cone UP)
   ─ Side pylons (thick rods) with warm amber glowing tips
   ─ Heavy animated grain overlay
   ─ Twinkling stars
══════════════════════════════════════════════════════ */
const HeroSection = ({ onGetStarted }) => {
  const avatarInitials = ['YA', 'MK', 'ZS', 'AR', 'FQ'];
  const avatarColors   = ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'];

  /* Stable pylon positions: left + right columns, tallest on outside */
  const pylons = [
    { left: '3%',   width: 10, height: 440, glowH: 42, delay: 0   },
    { left: '10%',  width: 7,  height: 330, glowH: 30, delay: 0.4 },
    { left: '16%',  width: 5,  height: 270, glowH: 22, delay: 0.8 },
    { left: '85%',  width: 10, height: 440, glowH: 42, delay: 0   },
    { left: '91%',  width: 7,  height: 330, glowH: 30, delay: 0.4 },
    { left: '97%',  width: 5,  height: 270, glowH: 22, delay: 0.8 },
  ];

  const stars = [
    { top: '7%',  left: '18%', s: 1.6 }, { top: '13%', left: '72%', s: 1   },
    { top: '20%', left: '41%', s: 2   }, { top: '5%',  left: '60%', s: 1.2 },
    { top: '29%', left: '84%', s: 1   }, { top: '17%', left: '7%',  s: 1.8 },
    { top: '39%', left: '4%',  s: 1   }, { top: '34%', left: '91%', s: 1.5 },
    { top: '44%', left: '27%', s: 1   }, { top: '49%', left: '77%', s: 1.2 },
    { top: '11%', left: '51%', s: 1.5 }, { top: '25%', left: '32%', s: 1   },
  ];

  return (
    <section id="home" style={{
      minHeight: '100vh', background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      paddingTop: '80px', paddingBottom: '60px',
    }}>

      {/* ── GRAIN OVERLAY ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
        backgroundSize: '300px 300px', mixBlendMode: 'overlay', opacity: 0.85,
      }} />

      {/* ── LARGE PLANET / SPHERE ──
          Center anchored at bottom of the hero, showing the upper hemisphere.
          The curved equatorial base arc is visible at the hero's bottom edge.
      ── */}
      {/* Main sphere body */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        /* Sphere diameter: span wider than viewport so side arcs are visible */
        width: '130vw', height: '130vw',
        maxWidth: '1750px', maxHeight: '1750px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 50% 20%, #10091e 0%, #080516 25%, #040210 55%, #010006 80%, #000000 100%)',
        border: '1px solid rgba(190,160,100,0.13)',
        zIndex: 0, pointerEvents: 'none',
        boxShadow: `
          inset 0 60px 200px rgba(80,50,130,0.12),
          0 0 0 1px rgba(200,170,90,0.06),
          0 -40px 120px rgba(40,20,80,0.6)
        `,
      }} />

      {/* Glowing atmospheric rim — amber/warm ring visible at the equator  */}
      <motion.div
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '130vw', height: '130vw',
          maxWidth: '1750px', maxHeight: '1750px',
          borderRadius: '50%',
          background: 'transparent',
          /* Box-shadow acts as the glowing rim visible at the equator */
          boxShadow: `
            0 0 0 1.5px rgba(210,175,90,0.18),
            0 0 30px 8px  rgba(200,150,60,0.10),
            0 0 80px 20px rgba(130,90,35,0.07),
            inset 0 0 120px rgba(90,60,20,0.04)
          `,
          zIndex: 1, pointerEvents: 'none',
        }}
      />

      {/* Equatorial glow at the very base — extra warm arc where sphere meets viewport bottom */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute',
          bottom: '-10px', left: '50%',
          transform: 'translateX(-50%)',
          width: '110vw', height: '80px',
          maxWidth: '1500px',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(180,130,50,0.22) 0%, rgba(120,80,30,0.1) 50%, transparent 100%)',
          filter: 'blur(18px)',
          zIndex: 2, pointerEvents: 'none',
          borderRadius: '50%',
        }}
      />

      {/* ── BOTTOM-UP LIGHT BEAM ──
          Anchored at bottom-center (the sphere's north pole / light source) */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2, pointerEvents: 'none',
      }}>
        {/* Widest outer haze */}
        <motion.div
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '200px solid transparent',
            borderRight: '200px solid transparent',
            borderBottom: '750px solid rgba(100,85,180,0.10)',
            filter: 'blur(28px)',
          }}
        />
        {/* Mid cone */}
        <motion.div
          animate={{ opacity: [0.45, 0.80, 0.45] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '80px solid transparent',
            borderRight: '80px solid transparent',
            borderBottom: '640px solid rgba(140,120,210,0.18)',
            filter: 'blur(12px)',
          }}
        />
        {/* Tight bright core */}
        <motion.div
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '22px solid transparent',
            borderRight: '22px solid transparent',
            borderBottom: '540px solid rgba(210,200,255,0.55)',
            filter: 'blur(3.5px)',
          }}
        />
        {/* Brilliant white point of convergence (bright tip) */}
        <motion.div
          animate={{ opacity: [0.65, 1, 0.65], scaleY: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', bottom: '530px', left: '50%',
            transform: 'translateX(-50%)',
            width: '44px', height: '70px',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.92) 0%, rgba(210,195,255,0.55) 50%, transparent 100%)',
            filter: 'blur(5px)',
          }}
        />
        {/* Floor / source glow */}
        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          style={{
            position: 'absolute', bottom: '-40px', left: '50%',
            transform: 'translateX(-50%)',
            width: '560px', height: '130px',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(100,80,200,0.4) 0%, rgba(70,50,140,0.18) 55%, transparent 100%)',
            filter: 'blur(28px)',
          }}
        />
      </div>

      {/* ── SIDE PYLONS (thick glowing rods with amber tips) ── */}
      {pylons.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: 0, left: p.left,
          width: `${p.width}px`, height: `${p.height}px`,
          zIndex: 2, pointerEvents: 'none',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          {/* Glowing amber tip */}
          <motion.div
            animate={{
              opacity: [0.55, 1, 0.55],
              boxShadow: [
                `0 -${p.glowH * 0.5}px ${p.glowH * 1.2}px rgba(200,160,80,0.35)`,
                `0 -${p.glowH}px ${p.glowH * 2}px rgba(240,200,110,0.7)`,
                `0 -${p.glowH * 0.5}px ${p.glowH * 1.2}px rgba(200,160,80,0.35)`,
              ],
            }}
            transition={{ duration: 2.6 + i * 0.35, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
            style={{
              width: `${p.width + 6}px`, height: `${p.glowH}px`,
              borderRadius: '4px 4px 0 0', flexShrink: 0,
              background: 'linear-gradient(to bottom, rgba(255,230,150,0.95) 0%, rgba(210,170,90,0.6) 60%, rgba(150,110,50,0.2) 100%)',
            }}
          />
          {/* Pylon body — dim brown rod */}
          <div style={{
            flex: 1, width: '100%',
            background: 'linear-gradient(to bottom, rgba(80,60,35,0.65), rgba(35,25,12,0.4), rgba(10,8,4,0.2))',
            borderLeft: '1px solid rgba(120,90,45,0.18)',
            borderRight: '1px solid rgba(120,90,45,0.18)',
          }} />
        </div>
      ))}

      {/* ── TWINKLING STARS ── */}
      {stars.map((s, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2.2 + (i % 5) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          style={{
            position: 'absolute', top: s.top, left: s.left,
            width: `${s.s}px`, height: `${s.s}px`,
            borderRadius: '50%', background: '#ffffff',
            zIndex: 1, pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── MAIN CONTENT ── */}
      <div style={{
        textAlign: 'center', padding: '0 24px',
        position: 'relative', zIndex: 5,
        maxWidth: '860px', width: '100%',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <PillBadge>Innovative Web3 Solutions</PillBadge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)', fontWeight: 700, color: '#ffffff',
            lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '24px',
            textShadow: '0 2px 40px rgba(0,0,0,0.9)',
          }}
        >
          Revolutionizing Web3<br />
          with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>AutoCon</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.08rem)', color: 'rgba(255,255,255,0.48)',
            maxWidth: '520px', margin: '0 auto 44px', lineHeight: 1.75,
            textShadow: '0 1px 12px rgba(0,0,0,0.9)',
          }}
        >
          Experience the future of blockchain development with our no-code smart contract platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' }}
        >
          <motion.button
            onClick={onGetStarted}
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 36px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 6px 28px rgba(79,70,229,0.5)', letterSpacing: '-0.01em',
            }}
          >
            Get Started Free
          </motion.button>

          <motion.a
            href="#features" whileHover={{ scale: 1.04, y: -2 }}
            style={{
              padding: '14px 32px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)',
              fontSize: '0.95rem', fontWeight: 500,
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', textDecoration: 'none',
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}
          >
            See Features <ArrowRight size={16} />
          </motion.a>
        </motion.div>

        {/* Avatar trust row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}
        >
          <div style={{ display: 'flex' }}>
            {avatarInitials.map((init, i) => (
              <div key={i} style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${avatarColors[i]}, ${avatarColors[i]}88)`,
                border: '2px solid rgba(0,0,0,0.7)',
                marginLeft: i === 0 ? 0 : '-10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 700, color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.7)', zIndex: avatarInitials.length - i,
              }}>{init}</div>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>
            Trusted already by <strong style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>100+ developers</strong>
          </span>
        </motion.div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════ */
const StatsSection = () => {
  const stats = [
    { label: 'Contracts Deployed', value: '+100', sub: 'Smart contracts live on-chain' },
    { label: 'Gas Cost Reduction', value: '+40%', sub: 'Compared to manual deployment' },
    { label: 'Deploy Success Rate', value: '99%',  sub: 'Successful transaction rate'   },
  ];
  return (
    <section style={{ background: '#000', padding: '0 48px 80px' }}>
      <Reveal>
        <div style={{
          maxWidth: '1160px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px',
          overflow: 'hidden', background: 'rgba(255,255,255,0.015)',
          boxShadow: '0 0 60px rgba(79,70,229,0.06)',
        }} className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: '52px 40px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100px', height: '2px',
                background: 'linear-gradient(90deg, transparent, #4f46e5, transparent)', opacity: 0.6,
              }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '14px' }}>{s.label}</p>
              <div style={{
                fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', fontWeight: 300, lineHeight: 1, marginBottom: '12px',
                background: 'linear-gradient(135deg, #ffffff 20%, #818cf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{s.value}</div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   SUB-HEADING BRIDGE
══════════════════════════════════════════════════════ */
const SimplifyingSection = () => (
  <section style={{ background: '#000', padding: '20px 48px 80px', textAlign: 'center' }}>
    <Reveal>
      <SectionHeading pre="Simplifying Smart Contract" highlight="Development" after="for Everyone" />
    </Reveal>
  </section>
);

/* ══════════════════════════════════════════════════════
   ALTERNATING FEATURES — blueprint SVG boards
══════════════════════════════════════════════════════ */
const BlueprintDiamond = () => (
  <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs><pattern id="g1" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(79,70,229,0.14)" strokeWidth="0.5"/></pattern></defs>
    <rect width="460" height="360" fill="rgba(10,10,15,0.7)" rx="16"/>
    <rect width="460" height="360" fill="url(#g1)" rx="16"/>
    <polygon points="230,55 395,180 230,305 65,180" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
    <polygon points="230,95 355,180 230,265 105,180" fill="none" stroke="rgba(79,70,229,0.5)" strokeWidth="1" strokeDasharray="6 4"/>
    {[[230,55],[395,180],[230,305],[65,180]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="5" fill="white" opacity="0.85"/>)}
    <circle cx="230" cy="180" r="55" fill="none" stroke="rgba(79,70,229,0.4)" strokeWidth="1" strokeDasharray="4 3"/>
    <circle cx="230" cy="180" r="5" fill="rgba(79,70,229,0.9)"/>
    <circle cx="230" cy="180" r="65" fill="rgba(79,70,229,0.05)"/>
  </svg>
);
const BlueprintCircles = () => (
  <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs><pattern id="g2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(79,70,229,0.14)" strokeWidth="0.5"/></pattern></defs>
    <rect width="460" height="360" fill="rgba(10,10,15,0.7)" rx="16"/>
    <rect width="460" height="360" fill="url(#g2)" rx="16"/>
    <circle cx="230" cy="180" r="125" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
    <circle cx="188" cy="153" r="68" fill="none" stroke="rgba(79,70,229,0.5)" strokeWidth="1" strokeDasharray="5 3"/>
    <circle cx="272" cy="153" r="68" fill="none" stroke="rgba(79,70,229,0.5)" strokeWidth="1" strokeDasharray="5 3"/>
    <circle cx="230" cy="218" r="68" fill="none" stroke="rgba(79,70,229,0.5)" strokeWidth="1" strokeDasharray="5 3"/>
    {[[230,55],[118,122],[342,122],[180,300],[280,300]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="4.5" fill="white" opacity="0.8"/>)}
    <circle cx="230" cy="180" r="75" fill="rgba(79,70,229,0.05)"/>
  </svg>
);
const BlueprintHex = () => (
  <svg viewBox="0 0 460 360" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <defs><pattern id="g3" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(79,70,229,0.14)" strokeWidth="0.5"/></pattern></defs>
    <rect width="460" height="360" fill="rgba(10,10,15,0.7)" rx="16"/>
    <rect width="460" height="360" fill="url(#g3)" rx="16"/>
    <polygon points="230,55 318,107 318,207 230,259 142,207 142,107" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
    <polygon points="230,87 302,130 302,197 230,240 158,197 158,130" fill="none" stroke="rgba(79,70,229,0.5)" strokeWidth="1" strokeDasharray="5 3"/>
    <line x1="230" y1="55" x2="230" y2="259" stroke="rgba(79,70,229,0.3)" strokeWidth="0.5" strokeDasharray="4 3"/>
    <line x1="142" y1="107" x2="318" y2="207" stroke="rgba(79,70,229,0.3)" strokeWidth="0.5" strokeDasharray="4 3"/>
    <line x1="318" y1="107" x2="142" y2="207" stroke="rgba(79,70,229,0.3)" strokeWidth="0.5" strokeDasharray="4 3"/>
    {[[230,55],[318,107],[318,207],[230,259],[142,207],[142,107]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="4.5" fill="white" opacity="0.85"/>)}
    <circle cx="230" cy="157" r="5" fill="rgba(79,70,229,0.9)"/>
    <circle cx="230" cy="157" r="48" fill="rgba(79,70,229,0.06)"/>
  </svg>
);

const features = [
  {
    icon: '⚙️', title: 'Future-Forward Contract Generation',
    desc: 'Our no-code platform simplifies complex smart contract creation for everyone. With AI-powered templates and one-click deployment, we make the blockchain future accessible — no Solidity expertise required.',
    illustration: <BlueprintDiamond />,
  },
  {
    icon: '🛡️', title: 'Efficient Smart Contract Security',
    desc: 'Our platform ensures your smart contracts are audited before deployment, automatically detecting reentrancy attacks, integer overflows, and access control vulnerabilities before they reach mainnet.',
    illustration: <BlueprintCircles />,
  },
  {
    icon: '🤖', title: 'Intelligent Web3 Assistance',
    desc: 'Chat with an AI trained on Solidity and Ethereum architecture. Get real-time guidance on contract configurations, gas optimization strategies, and deployment best practices.',
    illustration: <BlueprintHex />,
  },
];

const AlternatingFeatures = ({ onLearnMore }) => (
  <section id="features" style={{ background: '#000', padding: '0 48px 40px' }}>
    {features.map((f, i) => (
      <Reveal key={f.title} delay={0.1}>
        <div style={{
          maxWidth: '1160px', margin: '0 auto 80px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '80px', alignItems: 'center',
        }} className="feature-row">
          <div style={{ order: i % 2 !== 0 ? 2 : 1 }}>
            <div style={{
              width: '50px', height: '50px', borderRadius: '13px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', marginBottom: '22px',
            }}>{f.icon}</div>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 700, color: '#fff',
              lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '18px',
            }}>{f.title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.78, fontSize: '0.95rem', marginBottom: '30px' }}>
              {f.desc}
            </p>
            <motion.button
              onClick={onLearnMore} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 28px', borderRadius: '10px', border: 'none',
                background: '#4f46e5', color: '#fff', fontSize: '0.87rem', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
              }}
            >Learn More <ChevronRight size={15} /></motion.button>
          </div>
          <div style={{
            order: i % 2 !== 0 ? 1 : 2,
            borderRadius: '18px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)', aspectRatio: '460 / 360',
          }}>
            {f.illustration}
          </div>
        </div>
      </Reveal>
    ))}
  </section>
);

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
    <section style={{ background: '#000', padding: '40px 48px 100px' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <PillBadge>Revolutionize Smart Contract Operations</PillBadge><br />
          <SectionHeading pre="Revolutionizing the Way" highlight="You Deploy" />
        </div>
      </Reveal>
      <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.25 }}
              style={{
                padding: '36px 32px', borderRadius: '18px', position: 'relative', overflow: 'hidden',
                gridColumn: card.span, cursor: 'default',
                background: card.highlight ? 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.1))' : 'rgba(255,255,255,0.02)',
                border: card.highlight ? '1px solid rgba(79,70,229,0.4)' : '1px solid rgba(255,255,255,0.06)',
              }}>
              {card.highlight && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, #4f46e5, transparent)' }} />}
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '10px', letterSpacing: '-0.02em' }}>{card.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.875rem', lineHeight: 1.7 }}>{card.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   ICON GRID
══════════════════════════════════════════════════════ */
const iconFeatures = [
  { icon: <Wallet size={22} />,    title: 'MetaMask Native',     desc: 'Connect wallets instantly with MetaMask integration.' },
  { icon: <Code2 size={22} />,     title: 'ABI & Source Export', desc: 'Download verified ABI, bytecode, and source for any contract.' },
  { icon: <BarChart3 size={22} />, title: 'Real-Time Analytics', desc: 'Track deployments, gas costs, and contract events.' },
  { icon: <Shield size={22} />,    title: 'Vulnerability Scanner', desc: 'AI-powered Solidity security audits before deployment.' },
  { icon: <Cpu size={22} />,       title: 'Gas Optimizer',       desc: 'Automatically minimize gas usage on every generated contract.' },
  { icon: <Globe size={22} />,     title: 'Multi-Chain Ready',   desc: 'Deploy on Ethereum, Polygon, BSC, and any EVM chain.' },
];

const IconGrid = () => (
  <section style={{ background: '#000', padding: '0 48px 100px' }}>
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}><PillBadge>Unlock the Potential of Web3 Finance</PillBadge></div>
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <SectionHeading pre="Everything You Need to" highlight="Deploy" after="On-Chain" />
      </div>
    </Reveal>
    <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1px', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden',
      }} className="icon-grid">
        {iconFeatures.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.07}>
            <motion.div whileHover={{ background: 'rgba(79,70,229,0.08)' }}
              style={{ padding: '40px 36px', background: '#000', cursor: 'default', transition: 'background 0.25s ease' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px', marginBottom: '18px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8',
              }}>{f.icon}</div>
              <h3 style={{ fontSize: '0.97rem', fontWeight: 600, color: '#fff', marginBottom: '10px', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.37)', fontSize: '0.855rem', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   SECURITY SECTION
══════════════════════════════════════════════════════ */
const SecuritySection = () => (
  <section id="security" style={{ background: '#000', padding: '80px 48px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(79,70,229,0.08) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
      backgroundSize: '100% 100%, 60px 60px, 60px 60px',
    }} />
    <Reveal>
      <PillBadge>Enterprise Grade Security</PillBadge>
      <SectionHeading highlight="Security" sub="Your smart contracts are protected by multi-layer audits, formal verification, and real-time monitoring." />
    </Reveal>
    <Reveal delay={0.2}>
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '60px' }}>
        {[200, 280, 360].map((size, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.04, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              border: '1px solid rgba(79,70,229,0.35)', pointerEvents: 'none',
            }}
          />
        ))}
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '120px', height: '120px', borderRadius: '50%', position: 'relative', zIndex: 1,
            background: 'linear-gradient(135deg, rgba(79,70,229,0.3), rgba(124,58,237,0.2))',
            border: '1px solid rgba(79,70,229,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 60px rgba(79,70,229,0.3), 0 0 120px rgba(79,70,229,0.1)',
          }}>
          <Shield size={52} style={{ color: '#818cf8' }} />
        </motion.div>
      </div>
    </Reveal>
    <Reveal delay={0.3}>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '60px', maxWidth: '900px', margin: '60px auto 0' }}>
        {[
          { title: 'Reentrancy Protection', desc: 'Guards against recursive call exploits.' },
          { title: 'Overflow Checks', desc: 'Safe math operations on all arithmetic.' },
          { title: 'Access Control', desc: 'Owner-only function enforcement.' },
          { title: 'Gas Limit Safety', desc: 'Prevents out-of-gas transaction failures.' },
        ].map(p => (
          <div key={p.title} style={{
            padding: '22px 28px', borderRadius: '14px', flex: '1 1 200px', maxWidth: '240px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Check size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', margin: 0 }}>{p.title}</h4>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </Reveal>
  </section>
);

/* ══════════════════════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════════════════════ */
const faqs = [
  { q: 'Do I need to know Solidity to use AutoCon?', a: 'No. AutoCon is fully no-code. Fill a form with your parameters and we generate, audit, and deploy the Solidity for you.' },
  { q: 'Which blockchains are supported?', a: 'Ethereum mainnet and Sepolia testnet. Polygon, BSC, and Arbitrum are coming soon.' },
  { q: 'How long does deployment take?', a: 'Under 30 seconds from form to on-chain contract once you confirm the MetaMask transaction.' },
  { q: 'Are the generated contracts audited?', a: 'Yes. Every contract runs through our AI security scanner checking for reentrancy, overflow, and access control issues.' },
  { q: 'Can I export the Solidity source code?', a: 'Absolutely. Download the full ABI, bytecode, and verified Solidity source for any contract you generate.' },
  { q: 'Is AutoCon free to use?', a: 'Generation and auditing are free. You only pay the Ethereum network gas fee when you deploy, directly via MetaMask.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ background: '#000', padding: '80px 48px 100px' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <SectionHeading pre="Frequently Asked" highlight="Questions" />
        </div>
      </Reveal>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', textAlign: 'left', padding: '24px 0', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <span style={{ fontSize: '0.97rem', fontWeight: 500, color: '#fff', lineHeight: 1.5 }}>{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
                  <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                    <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.9rem', lineHeight: 1.78, paddingBottom: '24px' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════ */
const testimonials = [
  { name: 'Yousuf A.', role: 'DeFi Developer',       text: 'AutoCon cut my contract deployment time from hours to seconds. The security audit caught an overflow bug I missed entirely.', stars: 5 },
  { name: 'Maria K.',  role: 'NFT Creator',           text: 'I launched my entire NFT collection without writing a single line of code. The MetaMask integration is seamless.', stars: 5 },
  { name: 'Zaid S.',   role: 'Blockchain Founder',    text: 'The AI assistant is genuinely helpful for understanding what each parameter does. Perfect for non-technical founders.', stars: 5 },
  { name: 'Aisha R.',  role: 'Web3 Educator',         text: 'I recommend AutoCon to all my students. It lets them see live contracts without getting bogged down in Solidity syntax.', stars: 5 },
  { name: 'Farhan Q.', role: 'Smart Contract Auditor',text: 'Impressive gas optimization on the generated code. The output is clean and follows current best practices.', stars: 5 },
  { name: 'Lena W.',   role: 'Startup CTO',           text: 'Saved us weeks of development time. We went from idea to deployed ERC-20 token in a single afternoon.', stars: 5 },
];

const Testimonials = () => (
  <section style={{ background: '#000', padding: '40px 48px 100px' }}>
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <SectionHeading pre="What Our" highlight="Clients" after="Say" sub="Developers, creators, and founders building with AutoCon." />
      </div>
    </Reveal>
    <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="testimonials-grid">
      {testimonials.map((t, i) => (
        <Reveal key={t.name} delay={i * 0.07}>
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }}
            style={{ padding: '28px 26px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
              {Array(t.stars).fill(0).map((_, si) => <Star key={si} size={13} fill="#4f46e5" style={{ color: '#4f46e5' }} />)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '20px' }}>"{t.text}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: '#fff',
              }}>{t.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ══════════════════════════════════════════════════════
   FINAL CTA BANNER
══════════════════════════════════════════════════════ */
const FinalCTA = ({ onGetStarted }) => (
  <section style={{ background: '#000', padding: '0 48px 120px' }}>
    <Reveal>
      <div style={{
        maxWidth: '1160px', margin: '0 auto', borderRadius: '24px', overflow: 'hidden',
        padding: '90px 40px', textAlign: 'center',
        background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
      }}>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', fontWeight: 700, color: '#fff',
            lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: '20px',
          }}>Empower Your Web3 Journey<br />with AutoCon</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.75 }}>
            Join developers worldwide and deploy production-ready smart contracts today — no Solidity expertise required.
          </p>
          <motion.button onClick={onGetStarted} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 44px', borderRadius: '12px', border: 'none',
              background: '#4f46e5', color: '#fff', fontSize: '0.97rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 8px 40px rgba(79,70,229,0.55)', letterSpacing: '-0.01em',
            }}>
            Get Started Free
          </motion.button>
        </div>
      </div>
    </Reveal>
  </section>
);

/* ══════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════ */
export default function LandingPage({ onLoginClick }) {
  const socialLinks = [
    { icon: <Twitter className="w-6 h-6" />,       href: 'https://twitter.com/AutoCon',              label: 'Twitter'  },
    { icon: <Linkedin className="w-6 h-6" />,       href: 'https://linkedin.com/company/autocon',     label: 'LinkedIn' },
    { icon: <Github className="w-6 h-6" />,         href: 'https://github.com/Wajiweb/Autocon',       label: 'GitHub'   },
    { icon: <MessageSquare className="w-6 h-6" />,  href: 'https://discord.gg/autocon',               label: 'Discord'  },
  ];
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About',    href: '#about'    },
    { label: 'Security', href: '#security' },
    { label: 'FAQ',      href: '#faq'      },
  ];

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        body { background: #000000 !important; }

        @media (max-width: 900px) {
          .feature-row { grid-template-columns: 1fr !important; gap: 40px !important; }
          .feature-row > * { order: unset !important; }
        }
        @media (max-width: 720px) {
          .stats-grid         { grid-template-columns: 1fr !important; }
          .stats-grid > *     { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          .icon-grid          { grid-template-columns: 1fr !important; }
          .testimonials-grid  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .hidden.md\\:flex  { display: none !important; }
          .flex.md\\:hidden  { display: flex !important; }
          section            { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (min-width: 601px) {
          .flex.md\\:hidden  { display: none !important; }
          .hidden.md\\:flex  { display: flex !important; }
        }
      `}</style>

      <NavBar onConnect={onLoginClick} />
      <HeroSection onGetStarted={onLoginClick} />
      <StatsSection />
      <SimplifyingSection />
      <AlternatingFeatures onLearnMore={onLoginClick} />
      <BentoGrid onGetStarted={onLoginClick} />
      <IconGrid />
      <SecuritySection />
      <FAQ />
      <Testimonials />
      <FinalCTA onGetStarted={onLoginClick} />

      {/* ── FOOTER with top atmospheric glow ── */}
      <div id="contact" style={{ position: 'relative' }}>

        {/* Top-glow overlay: indigo/purple light beam from the border line downward */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '320px',
          pointerEvents: 'none',
          zIndex: 10,
          background: 'radial-gradient(ellipse 70% 180px at 50% 0%, rgba(79,70,229,0.28) 0%, rgba(124,58,237,0.13) 40%, transparent 100%)',
        }} />



        {/* Secondary soft haze just below the line */}
        <div style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '60%', height: '90px',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 10,
          filter: 'blur(8px)',
        }} />

        <AnimatedFooter
          brandName="AutoCon"
          brandDescription="No-code Web3 smart contract platform. Deploy on any EVM chain."
          socialLinks={socialLinks}
          navLinks={navLinks}
          creatorName="Wajiweb"
          creatorUrl="https://github.com/Wajiweb"
        />
      </div>
    </div>
  );
}
