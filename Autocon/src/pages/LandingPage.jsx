import React, { useState } from 'react';

// --- Sub-Components ---

const NavBar = ({ onConnect }) => (
  <nav style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    backgroundColor: 'rgba(15, 23, 42, 0.9)', // Deep slate blue with transparency
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 5%',
    zIndex: 1000
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '32px', height: '32px',
        background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', color: 'white'
      }}>A</div>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
        Autocon
      </span>
    </div>

    {/* Desktop Links */}
    <div className="nav-links" style={{ display: 'none', gap: '32px' }}>
      {['Home', 'Features', 'About', 'Contact'].map(link => (
        <a key={link} href={`#${link.toLowerCase()}`} style={{
          color: '#94a3b8',
          textDecoration: 'none',
          fontSize: '0.95rem',
          fontWeight: 500,
          transition: 'color 0.2s ease'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#f8fafc'}
        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
        >
          {link}
        </a>
      ))}
    </div>

    <button
      onClick={onConnect}
      style={{
        backgroundColor: '#3b82f6', // Professional blue
        color: '#ffffff',
        border: 'none',
        borderRadius: '99px',
        padding: '10px 24px',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(59, 130, 246, 0.39)';
      }}
    >
      Connect Wallet
    </button>
  </nav>
);

const HeroSection = ({ onGetStarted }) => (
  <section id="home" style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '120px 5% 60px',
    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Abstract background elements */}
    <div style={{
      position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px',
      background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(80px)'
    }} />
    <div style={{
      position: 'absolute', bottom: '10%', right: '10%', width: '250px', height: '250px',
      background: 'rgba(14, 165, 233, 0.1)', borderRadius: '50%', filter: 'blur(80px)'
    }} />

    <h1 style={{
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: 900,
      color: '#f8fafc',
      marginBottom: '24px',
      lineHeight: 1.1,
      maxWidth: '800px',
      zIndex: 1
    }}>
      The Automated <br />
      <span style={{ 
        background: 'linear-gradient(135deg, #60a5fa, #38bdf8)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent' 
      }}>
        Construction Management
      </span><br />
      System
    </h1>
    
    <p style={{
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      color: '#94a3b8',
      marginBottom: '40px',
      maxWidth: '600px',
      lineHeight: 1.6,
      zIndex: 1
    }}>
      Streamline your projects from blueprint to reality. Autocon leverages on-chain automation, real-time analytics, and immutable reporting to keep your builds on time and under budget.
    </p>

    <button
      onClick={onGetStarted}
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        border: 'none',
        borderRadius: '99px',
        padding: '16px 40px',
        fontSize: '1.1rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        zIndex: 1
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.2)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Get Started
    </button>
  </section>
);

const FeatureCard = ({ icon, title, description }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '16px',
    padding: '32px',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    cursor: 'default'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.4)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.border = '1px solid rgba(148, 163, 184, 0.1)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    <div style={{ 
      fontSize: '2rem', 
      marginBottom: '20px',
      width: '56px', height: '56px',
      background: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#60a5fa'
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>{title}</h3>
    <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>{description}</p>
  </div>
);

const FeaturesSection = () => (
  <section id="features" style={{
    padding: '100px 5%',
    background: '#0f172a'
  }}>
    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
        Built for the Modern Site
      </h2>
      <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
        Powerful tools designed to eliminate bottlenecks, enforce compliance, and bring total transparency to construction management.
      </p>
    </div>

    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <FeatureCard 
        icon="⚙️" title="Smart Automation" 
        description="Automate milestone payouts and supply chain logistics directly on the blockchain, eliminating manual paperwork." 
      />
      <FeatureCard 
        icon="📡" title="Real-Time Monitoring" 
        description="IoT integration provides a live feed of structural integrity, worker safety, and equipment location." 
      />
      <FeatureCard 
        icon="📊" title="Predictive Analytics" 
        description="Machine learning algorithms analyze weather and supply data to forecast and prevent project delays before they happen." 
      />
      <FeatureCard 
        icon="📑" title="Immutable Reporting" 
        description="Every inspection, audit, and structural change is permanently recorded on-chain for total legal transparency." 
      />
    </div>
  </section>
);

const AboutSection = () => (
  <section id="about" style={{
    padding: '100px 5%',
    background: 'linear-gradient(to bottom, #0f172a, #162032)',
    display: 'flex',
    alignItems: 'center',
    gap: '64px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  }}>
    <div style={{ flex: '1 1 500px', maxWidth: '600px' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '24px' }}>
        Engineering the Future of Construction
      </h2>
      <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '24px', fontSize: '1.05rem' }}>
        The construction industry loses billions annually to inefficiencies, miscommunication, and delayed payments. Autocon was built to solve this by creating a single source of truth.
      </p>
      <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: '1.05rem' }}>
        By combining distributed ledger technology with automated execution environments, we provide project managers, contractors, and stakeholders with unparalleled oversight and security.
      </p>
    </div>
    
    {/* Image Placeholder */}
    <div style={{
      flex: '1 1 400px',
      maxWidth: '500px',
      height: '350px',
      background: 'rgba(30, 41, 59, 0.6)',
      borderRadius: '24px',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(14,165,233,0.1))'
      }} />
      <span style={{ color: '#64748b', fontSize: '1.2rem', fontWeight: 600, zIndex: 1 }}>
        [Dashboard Preview Image]
      </span>
    </div>
  </section>
);

const Footer = () => (
  <footer id="contact" style={{
    background: '#0b1120',
    padding: '60px 5% 40px',
    borderTop: '1px solid rgba(148, 163, 184, 0.1)'
  }}>
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: '40px',
      maxWidth: '1200px',
      margin: '0 auto',
      marginBottom: '40px'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#3b82f6', borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '0.8rem'
          }}>A</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>Autocon</span>
        </div>
        <p style={{ color: '#64748b', maxWidth: '300px', fontSize: '0.9rem', lineHeight: 1.6 }}>
          The premier platform for transparent, automated, and secure construction management on the blockchain.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map(social => (
          <a key={social} href="#" style={{
            color: '#64748b', textDecoration: 'none', fontSize: '0.9rem',
            transition: 'color 0.2s ease'
          }} onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'} onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}>
            {social}
          </a>
        ))}
      </div>
    </div>
    
    <div style={{
      textAlign: 'center',
      color: '#475569',
      fontSize: '0.85rem',
      paddingTop: '32px',
      borderTop: '1px solid rgba(148, 163, 184, 0.05)'
    }}>
      © {new Date().getFullYear()} Autocon Systems. All rights reserved.
    </div>
  </footer>
);

// --- Main Page Component ---

export default function LandingPage({ onLoginClick }) {
  // Setup CSS required for the desktop navigation media query (basic responsive handling without external CSS file)
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media (min-width: 768px) {
        .nav-links { display: flex !important; }
      }
      html { scroll-behavior: smooth; }
      body { margin: 0; font-family: 'Inter', system-ui, sans-serif; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
      <NavBar onConnect={onLoginClick} />
      <HeroSection onGetStarted={onLoginClick} />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </div>
  );
}
