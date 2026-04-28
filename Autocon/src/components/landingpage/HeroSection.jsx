import React from 'react';
import { ChevronRight } from 'lucide-react';

const partnerNames = ['Ethereum', 'Polygon', 'Binance', 'OpenZeppelin', 'Chainlink', 'MetaMask'];

const PartnerBanner = () => (
  <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ zIndex: 20 }}>
    <span className="sr-only">Our trusted partners include: {partnerNames.join(', ')}</span>
    <div
      className="w-full h-[72px] md:h-[88px] flex items-center border-t"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border-dark)',
      }}
    >
      <div className="flex items-center justify-around w-full px-8 md:px-16 gap-6 md:gap-12">
        {partnerNames.map((name) => (
          <span
            key={name}
            className="text-sm md:text-base font-bold tracking-tight"
            style={{ color: 'var(--text-secondary)' }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const DashboardMockup = () => {
  const mockDeployments = [
    { name: 'MyToken', symbol: 'MTK', type: 'ERC-20', network: 'Sepolia' },
    { name: 'ArtCollection', symbol: 'ART', type: 'ERC-721', network: 'Sepolia' },
    { name: 'BidAuction', symbol: 'AUC', type: 'Auction', network: 'Sepolia' },
  ];
  const mockStats = [
    { label: 'Total Assets', value: '3', subtext: 'All contract types' },
    { label: 'ERC-20 Tokens', value: '1', subtext: 'Fungible tokens deployed' },
    { label: 'NFT Collections', value: '1', subtext: 'ERC-721 collections' },
    { label: 'Status', value: 'Online', subtext: 'All services operational' },
  ];

  return (
    <div className="w-full max-w-[950px] mx-auto mt-8 relative z-10 pointer-events-auto cursor-default">
      <div
        className="w-full rounded-[20px] border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border-dark)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'var(--primary-subtle)', border: '1px solid var(--accent)', fontSize: '0.66rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              Live Dashboard
            </div>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>Executive <span style={{ color: 'var(--primary)' }}>Overview</span></h2>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['CSV', 'PDF'].map((label) => (
              <div key={label} style={{ padding: '6px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, padding: '18px 24px' }}>
          {mockStats.map((stat) => (
            <div key={stat.label} style={{ padding: 16, borderRadius: 14, background: 'var(--surface-elevated)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>{stat.label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.value === 'Online' ? 'var(--primary)' : 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', marginTop: 4 }}>{stat.subtext}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '13px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>Deployment Registry</h3>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600, background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--accent)', fontFamily: 'monospace' }}>0x7a2...f3e1</span>
          </div>
          <div style={{ display: 'grid' }}>
            {mockDeployments.map((item) => (
              <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr', gap: 12, padding: '13px 24px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 33, height: 33, borderRadius: 9, background: 'var(--primary-subtle)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {item.symbol}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.78rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.58rem', color: 'var(--text-secondary)' }}>{item.network}</p>
                  </div>
                </div>
                <span style={{ width: 'fit-content', padding: '3px 9px', borderRadius: 20, fontSize: '0.58rem', fontWeight: 700, background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{item.type}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-secondary)', textAlign: 'right' }}>0x742d...f6</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HeroSection({ onGetStarted }) {
  return (
    <section
      id="home"
      className="relative w-full min-h-screen flex flex-col items-center pt-28 pb-32 md:pb-40 overflow-hidden font-inter"
      style={{ background: 'var(--surface)' }}
    >
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-6 text-center flex flex-col items-center">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] md:text-sm font-semibold tracking-wide" style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
            No-Code Smart Contract Platform on Web3
          </span>
        </div>

        <h1 className="text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[1.1] tracking-tight mb-6 max-w-[900px]" style={{ color: 'var(--text-primary)' }}>
          Deploy Smart Contracts <br className="hidden sm:block" />
          <span style={{ color: 'var(--primary)' }}>Without Writing Code</span>
        </h1>

        <p className="text-sm md:text-[1.1rem] max-w-[620px] mb-10 leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
          Generate, audit, and deploy ERC-20 tokens, NFT collections, and auctions on Sepolia in minutes, powered by AI.
        </p>

        <div className="flex flex-row gap-4 justify-center items-center">
          <button onClick={onGetStarted} className="group flex items-center justify-between gap-3 px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base" style={{ background: 'var(--primary)', color: 'var(--surface)' }}>
            <span>Get Started</span>
            <span className="rounded-full p-1" style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--surface)' }}>
              <ChevronRight size={16} strokeWidth={3} />
            </span>
          </button>
          <a href="#features" className="group flex items-center justify-between gap-3 border px-5 py-3 md:px-7 md:py-3.5 rounded-[14px] font-bold text-sm md:text-base" style={{ borderColor: 'var(--border-dark)', color: 'var(--text-primary)', background: 'transparent' }}>
            <span>Explore</span>
            <span className="rounded-full p-1" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              <ChevronRight size={16} strokeWidth={3} />
            </span>
          </a>
        </div>

        <div className="mt-20">
          <DashboardMockup />
        </div>
      </div>

      <PartnerBanner />
    </section>
  );
}
