import React from 'react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal, SectionHeading } from './Shared';

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
    <section id="faq" style={{ background: 'var(--surface)', padding: '60px 48px 120px' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <SectionHeading pre="Frequently Asked" highlight="Questions" />
        </div>
      </Reveal>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', textAlign: 'left', padding: '24px 0', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <span style={{ fontSize: '0.97rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>{faq.q}</span>
                <ChevronDown size={18} style={{ color: 'var(--primary)', transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0s' }} />
              </button>
              {open === i && (
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.78, paddingBottom: '24px' }}>{faq.a}</p>
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
