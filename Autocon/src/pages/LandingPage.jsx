import React from 'react';
import { Twitter, Linkedin, Github, MessageSquare } from 'lucide-react';
import { Footer as AnimatedFooter } from '../components/ui/modem-animated-footer';

import NavBar from '../components/landingpage/NavBar';
import HeroSection from '../components/landingpage/HeroSection';
import StatsSection from '../components/landingpage/StatsSection';
import SimplifyingSection from '../components/landingpage/SimplifyingSection';
import AlternatingFeatures from '../components/landingpage/AlternatingFeatures';
import BentoGrid from '../components/landingpage/BentoGrid';
import IconGrid from '../components/landingpage/IconGrid';
import SecuritySection from '../components/landingpage/SecuritySection';
import FAQ from '../components/landingpage/FAQ';
import Testimonials from '../components/landingpage/Testimonials';
import FinalCTA from '../components/landingpage/FinalCTA';

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
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{`
        body { background: var(--bg) !important; }

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

        {/* Top-glow overlay */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '320px',
          pointerEvents: 'none',
          zIndex: 10,
          background: 'radial-gradient(ellipse 70% 180px at 50% 0%, rgba(34,197,94,0.15) 0%, rgba(15,61,46,0.4) 40%, transparent 100%)',
        }} />

        {/* Secondary soft haze just below the line */}
        <div style={{
          position: 'absolute',
          top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '60%', height: '90px',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(34,197,94,0.2) 0%, transparent 100%)',
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