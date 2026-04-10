import React, { lazy, Suspense } from 'react';
import TiltCard from '../animations/TiltCard';
import ParallaxScroll from '../animations/ParallaxScroll';
import { Twitter, Linkedin, Github, MessageSquare, NotepadTextDashed } from 'lucide-react';
import { Footer as AnimatedFooter } from '../components/ui/modem-animated-footer';

// Code-split the heavy Three.js bundle — won't block the main thread
const HeroCanvas = lazy(() => import('../components/3d/HeroCanvas'));

// Glowing CSS fallback while the WebGL assets load
const HeroCanvasFallback = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
      style={{ background: 'linear-gradient(135deg, #7C3AED, #2563EB, #06B6D4)' }}
    />
  </div>
);

// ─── NAV BAR ───
const NavBar = ({ onConnect }) => (
  <nav style={{
    position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
    background: 'rgba(8, 12, 20, 0.75)',
    backdropFilter: 'blur(24px) saturate(200%)',
    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 5%', zIndex: 1000,
    boxShadow: '0 1px 0 rgba(255,255,255,0.03)'
  }}>
    {/* Logo */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img src="/autocon-logo.png" alt="AutoCon" style={{
        width: '36px', height: '36px', borderRadius: '10px',
        objectFit: 'cover'
      }} />
      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.04em' }}>
        AutoCon
      </span>
    </div>

    {/* Links */}
    <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
      {['Features', 'About', 'Contact'].map(link => (
        <a key={link} href={`#${link.toLowerCase()}`} style={{
          color: '#94a3b8', textDecoration: 'none',
          fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.15s ease'
        }}
          onMouseOver={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
          {link}
        </a>
      ))}

      <button onClick={onConnect} style={{
        padding: '8px 20px', borderRadius: '10px', border: 'none',
        background: 'linear-gradient(135deg, #7C3AED, #2563EB)',
        color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 12px rgba(124,58,237,0.35)'
      }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.5)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.35)'; }}>
        Connect Wallet
      </button>
    </div>
  </nav>
);

// ─── HERO ───
const HeroSection = ({ onGetStarted }) => (
  <section id="home" style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'center', padding: '100px 5% 60px',
    position: 'relative', overflow: 'hidden'
  }}>
    <Suspense fallback={<HeroCanvasFallback />}>
      <HeroCanvas />
    </Suspense>

    {/* Animated grid */}
    <div style={{
      position: 'absolute', inset: 0, opacity: 0.025,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)',
      backgroundSize: '80px 80px', pointerEvents: 'none'
    }} />

    {/* Badge */}
    <div className="animate-fade-in-up" style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 16px 6px 10px', borderRadius: '99px', marginBottom: '32px',
      background: 'rgba(124,58,237,0.1)',
      border: '1px solid rgba(124,58,237,0.25)',
      fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa',
      letterSpacing: '0.05em', textTransform: 'uppercase', zIndex: 1
    }}>
      <span style={{
        display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
        background: '#a78bfa', boxShadow: '0 0 8px #a78bfa', animation: 'pulse-glow 2.5s infinite'
      }} />
      Web3 Smart Contract Platform
    </div>

    {/* Heading */}
    <h1 className="animate-fade-in-up delay-100" style={{
      fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em',
      lineHeight: 1.05, maxWidth: '820px', marginBottom: '24px', zIndex: 1,
      color: '#f1f5f9'
    }}>
      The Automated{' '}
      <span style={{
        background: 'linear-gradient(135deg,#a78bfa 0%,#60a5fa 50%,#67e8f9 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
      }}>
        Smart Contract
      </span>{' '}
      Generator
    </h1>

    {/* Sub */}
    <p className="animate-fade-in-up delay-200" style={{
      fontSize: 'clamp(1rem, 1.5vw, 1.2rem)', color: '#94a3b8',
      maxWidth: '580px', lineHeight: 1.65, marginBottom: '44px', zIndex: 1
    }}>
      Deploy ERC-20 tokens, NFT collections, and auction contracts in minutes — no Solidity expertise required.
    </p>

    {/* CTAs */}
    <div className="animate-fade-in-up delay-300" style={{
      display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', zIndex: 1
    }}>
      <button onClick={onGetStarted} style={{
        padding: '15px 36px', borderRadius: '12px', border: 'none',
        background: 'linear-gradient(135deg,#7C3AED,#2563EB,#06B6D4)',
        color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 20px rgba(124,58,237,0.4), 0 8px 40px rgba(6,182,212,0.2)'
      }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.55),0 12px 48px rgba(6,182,212,0.25)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4),0 8px 40px rgba(6,182,212,0.2)'; }}>
        🚀 Get Started Free
      </button>
      <a href="#features" style={{
        padding: '15px 32px', borderRadius: '12px', textDecoration: 'none',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#94a3b8', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.2s ease', display: 'inline-block',
        background: 'rgba(255,255,255,0.03)'
      }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
        See Features
      </a>
    </div>

    {/* Trust bar */}
    <div className="animate-fade-in-up delay-400" style={{
      display: 'flex', gap: '40px', marginTop: '72px', flexWrap: 'wrap',
      justifyContent: 'center', zIndex: 1
    }}>
      {[
        { label: '100+ Contracts Deployed', icon: '⚡' },
        { label: 'Sepolia Testnet', icon: '🔗' },
        { label: 'MetaMask Native', icon: '🦊' },
        { label: 'Gas Optimized', icon: '⛽' },
      ].map(stat => (
        <div key={stat.label} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#4b5563', fontSize: '0.82rem', fontWeight: 500
        }}>
          <span>{stat.icon}</span>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  </section>
);

// ─── FEATURE CARD ───
const FeatureCard = ({ icon, gradient, title, description, index }) => (
  <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}>
    <TiltCard className="h-full">
    <div className="card" style={{ padding: '32px', textAlign: 'left', height: '100%', cursor: 'default' }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: gradient, opacity: 0.8
      }} />

      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: gradient, opacity: 0.15,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', fontSize: '24px',
        position: 'relative', zIndex: 10
      }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', background: gradient, opacity: 1 }} />
        <span style={{ position: 'relative', zIndex: 1, fontSize: '22px' }}>{icon}</span>
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px', position: 'relative', zIndex: 10 }}>{title}</h3>
      <p style={{ color: '#64748b', lineHeight: 1.65, fontSize: '0.88rem', position: 'relative', zIndex: 10 }}>{description}</p>
    </div>
    </TiltCard>
  </div>
);

// ─── FEATURES SECTION ───
const FeaturesSection = () => (
  <section id="features" style={{ padding: '120px 5%', background: 'rgba(13,17,23,0.95)', position: 'relative' }}>
    {/* glow */}
    <div style={{
      position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
      width: '800px', height: '400px',
      background: 'radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)',
      filter: 'blur(40px)', pointerEvents: 'none'
    }} />

    <div style={{ textAlign: 'center', marginBottom: '72px', position: 'relative', zIndex: 1 }}>
      <div style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: '99px', marginBottom: '20px',
        background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
        fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa',
        textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>Platform Features</div>
      <h2 style={{
        fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, color: '#f1f5f9',
        marginBottom: '16px', letterSpacing: '-0.03em'
      }}>
        Built for Modern{' '}
        <span style={{
          background: 'linear-gradient(135deg,#60a5fa,#67e8f9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Web3</span>
      </h2>
      <p style={{ color: '#64748b', maxWidth: '540px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.65 }}>
        Professional tools to launch, manage, and interact with smart contracts — without writing a single line of Solidity.
      </p>
    </div>

    <ParallaxScroll offset={[-60, 60]}>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
      gap: '24px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1
    }}>
      <FeatureCard index={0} icon="⚙️"
        gradient="linear-gradient(135deg,#7C3AED,#4F46E5)"
        title="Token Generator"
        description="Create fully-featured ERC-20 tokens with custom supply, decimal precision, and owner controls. Deploy to mainnet or testnets in one click." />
      <FeatureCard index={1} icon="🎨"
        gradient="linear-gradient(135deg,#8B5CF6,#EC4899)"
        title="NFT Collections"
        description="Launch ERC-721 NFT collections with IPFS metadata, mint pricing, max supply caps, and automatic royalty structures." />
      <FeatureCard index={2} icon="🔨"
        gradient="linear-gradient(135deg,#F59E0B,#EF4444)"
        title="Auction Contracts"
        description="Deploy decentralized English auctions with timed bidding, automatic refunds, and beneficiary payouts — fully on-chain." />
      <FeatureCard index={3} icon="🛡️"
        gradient="linear-gradient(135deg,#2563EB,#06B6D4)"
        title="Security Audits"
        description="Automated Solidity vulnerability scanning powered by AI. Detect reentrancy, overflow, access control issues before deployment." />
      <FeatureCard index={4} icon="🤖"
        gradient="linear-gradient(135deg,#10B981,#3B82F6)"
        title="Web3 AI Assistant"
        description="Chat with an advanced AI companion trained specifically on Solidity and Ethereum architecture to guide your configurations and deployments." />

    </div>
    </ParallaxScroll>
  </section>
);

// ─── ABOUT SECTION ───
const AboutSection = () => (
  <section id="about" style={{
    padding: '120px 5%', background: 'var(--bg)',
    display: 'flex', alignItems: 'center', gap: '80px',
    justifyContent: 'center', flexWrap: 'wrap', position: 'relative', overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute', bottom: '-100px', left: '-100px', width: '600px', height: '600px',
      background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%)',
      filter: 'blur(60px)', pointerEvents: 'none'
    }} />

    <div style={{ flex: '1 1 480px', maxWidth: '580px', position: 'relative', zIndex: 1 }}>
      <div style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: '99px', marginBottom: '20px',
        background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
        fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa',
        textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>About AutoCon</div>
      <h2 style={{
        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#f1f5f9',
        marginBottom: '24px', letterSpacing: '-0.02em', lineHeight: 1.1
      }}>
        No-Code Web3<br />
        <span style={{
          background: 'linear-gradient(135deg,#a78bfa,#67e8f9)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>Development</span>
      </h2>
      <p style={{ color: '#64748b', lineHeight: 1.75, marginBottom: '20px', fontSize: '0.97rem' }}>
        AutoCon bridges the gap between traditional developers and blockchain. Generate production-ready smart contracts that have been security-tested and gas-optimized.
      </p>
      <p style={{ color: '#64748b', lineHeight: 1.75, fontSize: '0.97rem' }}>
        Connect MetaMask, fill a form, and deploy. Your contract goes live on the blockchain in under 30 seconds.
      </p>

      <div style={{ display: 'flex', gap: '40px', marginTop: '40px', flexWrap: 'wrap' }}>
        {[
          { value: '30s', label: 'Time to Deploy' },
          { value: '3+', label: 'Contract Types' },
          { value: '100%', label: 'On-Chain' },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{
              fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg,#a78bfa,#67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>{stat.value}</div>
            <div style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 500, marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Visual card */}
    <div style={{ flex: '1 1 360px', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
      <div className="card-glow" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 10 }}>
          <img src="/autocon-logo.png" alt="AutoCon" style={{
            width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover',
            boxShadow: '0 4px 16px rgba(6,182,212,0.25)'
          }} />
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>AutoCon</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            {['', '', ''].map((_, i) => (
              <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: ['#ef4444', '#f59e0b', '#10b981'][i] }} />
            ))}
          </div>
        </div>

        {/* Mock code block */}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.8 }}>
          {[
            { color: '#67e8f9', text: '// ERC-20 Token Contract' },
            { color: '#a78bfa', text: 'contract MyToken is ERC20 {' },
            { color: '#94a3b8', text: '  string public name = "MyToken";' },
            { color: '#94a3b8', text: '  uint256 public supply = 1000000;' },
            { color: '#10b981', text: '  // ✅ Gas optimized' },
            { color: '#a78bfa', text: '}' },
          ].map((line, i) => (
            <div key={i} style={{ color: line.color }}>{line.text}</div>
          ))}
        </div>

        <div style={{
          display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end'
        }}>
          <div style={{
            padding: '8px 18px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
            background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: '#fff',
            boxShadow: '0 4px 12px rgba(124,58,237,0.4)'
          }}> Deploy to Sepolia</div>
        </div>
      </div>
    </div>
  </section>
);

// ─── FOOTER ───
const Footer = () => {
  const socialLinks = [
    { icon: <Twitter className="w-6 h-6" />, href: "https://twitter.com/AutoCon", label: "Twitter" },
    { icon: <Linkedin className="w-6 h-6" />, href: "https://linkedin.com/company/autocon", label: "LinkedIn" },
    { icon: <Github className="w-6 h-6" />, href: "https://github.com/Wajiweb/Autocon", label: "GitHub" },
    { icon: <MessageSquare className="w-6 h-6" />, href: "https://discord.gg/autocon", label: "Discord" },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div id="contact">
      <AnimatedFooter
        brandName="AutoCon"
        brandDescription="No-code Web3 smart contract platform. Deploy on any EVM chain."
        socialLinks={socialLinks}
        navLinks={navLinks}
        creatorName="Wajiweb"
        creatorUrl="https://github.com/Wajiweb"
        brandIcon={<img src="/autocon-logo.png" alt="AutoCon Logo" className="w-full h-full object-cover rounded-2xl drop-shadow-lg" />}
      />
    </div>
  );
};

// ─── MAIN ───
export default function LandingPage({ onLoginClick }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--on-surface)' }}>
      <NavBar onConnect={onLoginClick} />
      <HeroSection onGetStarted={onLoginClick} />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
