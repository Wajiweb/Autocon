/**
 * FAQ.jsx — Premium animated accordion with cinematic design
 * Two sections: Current Features Q&A + Planned Future Features
 */
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import Container from '../layout/Container';
import { fadeUp, staggerContainer, accordionContent, viewportConfig } from '../../lib/motionVariants';

// ── Current Features FAQs ─────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Do I need to know Solidity to use AutoCon?',
    a: [
      'No — and that is the entire point of AutoCon. You do not need to write a single line of Solidity. The platform provides a guided, form-based interface where you fill in parameters such as the token name, symbol, total supply, and whether minting or burning should be enabled. AutoCon then generates a complete, production-ready Solidity smart contract from a battle-tested template behind the scenes.',
      'All generated contracts follow established Solidity standards (ERC-20 for fungible tokens, ERC-721 for NFTs) and include safety patterns such as ownership-gated access control and overflow protection. Even if you are a developer already familiar with Solidity, AutoCon saves significant time by eliminating boilerplate and letting you focus on deploying and testing.',
    ],
    bullets: [],
  },
  {
    q: 'Which blockchains are currently supported?',
    a: [
      'AutoCon currently supports two EVM-compatible testnets:',
    ],
    bullets: [
      'Sepolia (Ethereum Testnet) — the primary Ethereum test network used by most developers and auditors. Gas is funded via free public faucets.',
      'BNB Smart Chain Testnet — the Binance-compatible testnet, useful for projects targeting the BNB ecosystem.',
    ],
    footer: 'Both chains are free to use and widely supported by MetaMask. AutoCon automatically detects your connected network and prompts you to switch if needed — no manual RPC configuration required. Mainnet support is planned for a future release.',
  },
  {
    q: 'How does the AI security audit work?',
    a: [
      'Before any contract is deployed, AutoCon runs it through an AI-powered security analysis using the Google Gemini API. The audit process works in three steps:',
    ],
    bullets: [
      'Contract Analysis — The generated Solidity source code is sent to the Gemini model with a structured security prompt that instructs it to evaluate the contract for known vulnerability classes.',
      'Vulnerability Detection — The model checks for reentrancy attacks, integer overflow/underflow, unprotected ownership functions, missing access control modifiers, unchecked external calls, and gas limit issues.',
      'Report Generation — You receive a detailed report listing any issues found, their severity level (Critical / High / Medium / Low), and a plain-English explanation with suggested fixes.',
    ],
    footer: 'If the contract passes, you see a clean audit badge before deployment. If issues are found, you can adjust parameters and regenerate before proceeding. The audit runs in seconds — not hours.',
  },
  {
    q: 'What types of smart contracts can I generate?',
    a: [
      'AutoCon currently supports three contract types, each with its own configuration form and template:',
    ],
    bullets: [
      'ERC-20 Token — The standard for fungible tokens. Configure name, symbol, decimal precision, total supply, and toggle minting (owner-only) and burning (any holder). Ideal for utility tokens or governance tokens.',
      'ERC-721 NFT — The standard for non-fungible tokens. Set the collection name, symbol, base URI for metadata, and maximum supply. Suitable for digital art, certificates, or collectibles.',
      'English Auction — A time-locked auction contract. The owner lists an NFT, bidders place increasing bids within the auction window, and the highest bidder receives the NFT automatically at settlement.',
    ],
    footer: 'Each contract is compiled from a secure, tested Solidity template and customised with your parameters before deployment.',
  },
  {
    q: 'Can I view or download my contract source code?',
    a: [
      'Yes — you have full ownership and access to everything AutoCon generates. From the Deployments dashboard, each contract gives you:',
    ],
    bullets: [
      'Full Solidity source code — viewable inline and copyable to clipboard.',
      '"View on Explorer" link — opens the contract directly on the Sepolia or BNB testnet block explorer to inspect transactions, state, and ABI.',
      'Mini-site — a publicly shareable interactive page where anyone can check live token supply, connect a wallet, and interact with the contract without needing access to the dashboard.',
    ],
    footer: 'You own every contract you deploy. AutoCon does not retain custody of your contracts or private keys.',
  },
  {
    q: 'Is AutoCon free to use?',
    a: [
      'Yes, AutoCon is currently free during its development and evaluation phase. Since all deployments target testnets, there are no real gas costs — you only need testnet ETH or BNB, which is available for free from public faucets.',
    ],
    bullets: [
      'Sepolia ETH: sepoliafaucet.com or the Alchemy Sepolia faucet.',
      'BNB Testnet: testnet.bnbchain.org/faucet-smart.',
    ],
    footer: 'Your MetaMask wallet covers all deployment costs using this free testnet balance. AutoCon itself charges nothing for the current tier.',
  },
  {
    q: 'What happens if my contract fails the AI audit?',
    a: [
      'If the AI audit detects issues, AutoCon will:',
    ],
    bullets: [
      'Display a detailed audit report showing each vulnerability, its severity rating, and a plain-English description of what it means.',
      'Block deployment by default — you cannot proceed until issues are resolved or explicitly acknowledged (for low-severity warnings only).',
      'Offer a "Regenerate" option — adjust your parameters and re-run the generation and audit cycle without leaving the page.',
    ],
    footer: 'Critical and High severity findings always block deployment. Medium and Low severity findings generate an acknowledgement prompt. This ensures every deployed contract has been reviewed for the most dangerous vulnerability classes.',
  },
  {
    q: 'How do I interact with my deployed contract?',
    a: [
      'After deployment, every contract gets its own interactive mini-site accessible from the Deployments dashboard. The mini-site allows anyone with the link to:',
    ],
    bullets: [
      'View live contract state — token name, symbol, total supply, owner address, and mint/burn status — without connecting a wallet.',
      'Connect MetaMask — unlocks additional actions based on your role: token holders can check balance and transfer tokens; contract owners can access mint and burn functions.',
      'Network guard — if your wallet is on the wrong network, the mini-site detects this and prompts you to switch to the correct chain before allowing any write operations.',
    ],
    footer: 'This makes it easy to share your contract with a supervisor or evaluator so they can interact with it directly from a browser, without needing access to the AutoCon dashboard.',
  },
];

// ── Future Features ───────────────────────────────────────────────────────
const FUTURE_FAQS = [
  {
    q: 'Will AutoCon replace the Gemini API with a custom trained model?',
    a: [
      'Yes — this is one of the most significant improvements on the roadmap. Currently AutoCon uses the Google Gemini API as a general-purpose large language model for smart contract security audits. While effective, relying on a third-party API has real limitations: it requires a live API key, incurs per-request costs at scale, and is a general model not specifically trained on smart contract security patterns.',
      'The planned replacement is a custom fine-tuned model trained specifically on:',
    ],
    bullets: [
      'Thousands of real-world Solidity smart contracts — both secure and vulnerable.',
      'Known CVEs and exploit databases from major DeFi hacks (Ronin Bridge, DAO hack, Parity Wallet, etc.).',
      'OpenZeppelin security advisories and professional audit reports.',
      'The SWC (Smart Contract Weakness Classification) registry — the industry standard for categorising smart contract vulnerabilities.',
    ],
    footer: 'This custom model will be self-hosted, eliminating API key dependency, reducing latency, and producing more accurate and context-aware vulnerability reports with fewer false positives. It will also enable offline auditing — critical for enterprise users who cannot send proprietary contract code to an external API.',
  },
  {
    q: 'Will mainnet deployment be supported?',
    a: [
      'Mainnet deployment is planned as the next major milestone after the testnet platform is fully stable and tested. The roadmap targets:',
    ],
    bullets: [
      'Ethereum Mainnet — the primary production EVM chain.',
      'BNB Smart Chain Mainnet — for the Binance ecosystem.',
      'Polygon (MATIC) — for low-cost, high-throughput use cases.',
    ],
    footer: 'Mainnet deployment will include additional safety gates: mandatory AI audit passes, a real-time gas cost estimator showing actual ETH/BNB fees, and a final confirmation step clearly labelling the action as irreversible. The audit engine will run in a stricter mode with zero tolerance for High and Critical severity findings before any mainnet transaction is signed.',
  },
  {
    q: 'Is multi-wallet and team collaboration support planned?',
    a: [
      'Yes. The current version ties each deployment to the individual MetaMask wallet that deployed it. A planned future release will introduce team workspaces, allowing multiple wallet addresses to be added to a project with role-based permissions:',
    ],
    bullets: [
      'Owner — full access including deployment, configuration, and team management.',
      'Auditor — can view contract code and audit reports, cannot deploy or modify settings.',
      'Viewer — read-only access to the deployment dashboard and mini-sites.',
    ],
    footer: 'This is particularly useful for academic projects with multiple team members, or small startups where a technical co-founder handles deployment but a non-technical founder needs visibility into contract status.',
  },
  {
    q: 'Will contract upgradeability and version history be supported?',
    a: [
      'Contract upgradeability is a complex but important planned feature. Ethereum smart contracts are immutable by default — once deployed, the code cannot be changed. The industry solution is the Proxy Pattern (EIP-1967), which separates contract logic from its storage so logic can be upgraded while the address and on-chain state remain unchanged.',
      'AutoCon plans to support:',
    ],
    bullets: [
      'Transparent Proxy Pattern — the most widely used upgrade pattern, compatible with OpenZeppelin\'s upgrade tooling.',
      'Contract versioning — tracking which template version was used for each deployment, with diffs between versions.',
      'Re-audit on upgrade — automatically re-running the AI audit whenever a new version is generated, showing a diff of what changed.',
    ],
    footer: 'This feature is deferred to a later release due to the complexity of proxy storage layout management and the need for careful testing to avoid upgrade-induced vulnerabilities.',
  },
  {
    q: 'Are analytics, audit history, and PDF reports planned?',
    a: [
      'Yes. A full analytics and reporting suite is planned to give developers and project owners a deeper view of their contract portfolio over time. Planned additions include:',
    ],
    bullets: [
      'Audit History Timeline — a log of every AI audit run for a contract, with timestamps, findings, and resolution status.',
      'Deployment Analytics — gas used, transaction hash, block number, and contract size for every deployment.',
      'Portfolio Overview — aggregated stats across all contracts showing total deployments, chains used, contract types, and audit pass/fail rates.',
      'Exportable PDF Reports — downloadable audit reports suitable for submission to supervisors, clients, or academic evaluators.',
    ],
    footer: 'These features are aimed at making AutoCon a complete contract lifecycle management tool rather than just a one-time code generator.',
  },
];

// ── Render rich answer content ─────────────────────────────────────────────
function RichAnswer({ paragraphs = [], bullets = [], footer }) {
  return (
    <div style={{ fontSize: '0.91rem', color: 'var(--lp-text-secondary)', lineHeight: 1.8, padding: '0 24px 22px 24px' }}>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: bullets.length && i === paragraphs.length - 1 ? '10px' : '12px' }}>{p}</p>
      ))}
      {bullets.length > 0 && (
        <div style={{ marginBottom: footer ? '12px' : 0 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '7px', alignItems: 'flex-start' }}>
              <span style={{ color: '#ff6b00', flexShrink: 0, marginTop: '3px', fontSize: '0.8rem', lineHeight: 1 }}>▸</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      )}
      {footer && (
        <p style={{
          marginTop: '12px', paddingTop: '12px',
          borderTop: '1px solid rgba(255,107,0,0.1)',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.85rem',
        }}>{footer}</p>
      )}
    </div>
  );
}

// ── FAQ Item ───────────────────────────────────────────────────────────────
function FAQItem({ q, a, bullets, footer, index, isOpen, onToggle, idPrefix = 'faq' }) {
  const answerId = `${idPrefix}-answer-${index}`;
  const buttonId = `${idPrefix}-button-${index}`;

  return (
    <motion.div
      role="region"
      aria-label={q}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      style={{
        background:   isOpen
          ? 'linear-gradient(145deg, rgba(25,25,25,0.95), rgba(18,18,18,0.9))'
          : 'linear-gradient(145deg, #111111, #0a0a0a)',
        border:       isOpen ? '1px solid rgba(255,107,0,0.25)' : '1px solid rgba(255,107,0,0.08)',
        borderRadius: '14px',
        overflow:     'hidden',
        marginBottom: '12px',
        transition:   'all 0.3s ease',
        transform:    isOpen ? 'scale(1.01)' : 'scale(1)',
        boxShadow:    isOpen
          ? '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(255,107,0,0.08)'
          : '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      <button
        id={buttonId}
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => onToggle(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(index); }
        }}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '20px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px', textAlign: 'left',
          fontFamily: '"Inter", sans-serif',
        }}
      >
        <span style={{
          fontSize: '1rem', fontWeight: 700,
          color: isOpen ? '#ff6b00' : 'var(--lp-text-primary)',
          lineHeight: 1.4, transition: 'color 0.25s', flex: 1,
        }}>
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, scale: isOpen ? 1.1 : 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%',
            background: isOpen ? 'rgba(255,107,0,0.2)' : 'transparent',
            border: `1px solid ${isOpen ? 'rgba(255,107,0,0.5)' : 'rgba(255,107,0,0.15)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isOpen ? '#ff6b00' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.25s ease',
            boxShadow: isOpen ? '0 0 12px rgba(255,107,0,0.3)' : 'none',
          }}
          aria-hidden="true"
        >
          <Plus size={14} strokeWidth={2.5} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={buttonId}
            key="content"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={accordionContent}
            style={{ overflow: 'hidden' }}
          >
            <RichAnswer paragraphs={a} bullets={bullets} footer={footer} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, description, icon: Icon }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      variants={staggerContainer}
      style={{ position: 'relative' }}
    >
      <div style={{
        position: 'absolute', width: '550px', height: '220px',
        background: 'radial-gradient(circle, hsla(25,100%,50%,0.33) 0%, hsla(25,100%,50%,0.1) 35%, transparent 70%)',
        top: '50%', left: '40%', transform: 'translate(-50%,-50%)',
        pointerEvents: 'none', filter: 'blur(50px)', zIndex: 0,
      }} />
      <motion.span variants={fadeUp} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'var(--lp-accent)',
        marginBottom: '12px', position: 'relative', zIndex: 1,
      }}>
        {Icon && <Icon size={13} strokeWidth={2.5} />}
        {eyebrow}
      </motion.span>
      <motion.h2 variants={fadeUp} style={{
        fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 900,
        color: 'var(--lp-text-primary)', marginBottom: '16px',
        position: 'relative', zIndex: 1, lineHeight: 1.2,
      }}>
        {title}
      </motion.h2>
      <motion.p variants={fadeUp} style={{
        fontSize: '0.97rem', color: 'var(--lp-text-secondary)',
        lineHeight: 1.7, maxWidth: '380px', position: 'relative', zIndex: 1,
      }}>
        {description}
      </motion.p>
    </motion.div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function FAQ() {
  const [openIndex,       setOpenIndex]       = useState(null);
  const [openFutureIndex, setOpenFutureIndex] = useState(null);

  const handleToggle       = useCallback((i) => setOpenIndex(p       => p === i ? null : i), []);
  const handleFutureToggle = useCallback((i) => setOpenFutureIndex(p => p === i ? null : i), []);

  return (
    <section
      id="faq"
      className="landing-section"
      aria-label="Frequently asked questions"
      style={{ position: 'relative', background: '#0a0a0a' }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 30%, rgba(255,107,0,0.06), transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.3) 100%)',
        pointerEvents: 'none',
      }} />

      <Container>

        {/* ── Section 1: Current FAQs ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(40px, 7vw, 96px)',
          alignItems: 'start',
          marginBottom: 'clamp(64px, 10vw, 120px)',
        }}>
          <SectionHeader
            eyebrow="Have Questions?"
            title={<>Frequently<br />Asked Questions</>}
            description="Everything you need to know about AutoCon. Can't find what you're looking for? Reach out on Discord."
          />
          <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeUp}>
            {FAQS.map((item, i) => (
              <FAQItem
                key={i} {...item} index={i}
                isOpen={openIndex === i}
                onToggle={handleToggle}
                idPrefix="faq"
              />
            ))}
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(255,107,0,0.3), rgba(255,107,0,0.5), rgba(255,107,0,0.3), transparent)',
            marginBottom: 'clamp(64px, 10vw, 120px)',
            transformOrigin: 'center',
          }}
        />

        {/* ── Section 2: Future Features ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: 'clamp(40px, 7vw, 96px)',
          alignItems: 'start',
        }}>
          <SectionHeader
            eyebrow="What's Coming Next"
            title={<>Planned<br />Future Features</>}
            description="AutoCon is actively evolving. Here is a transparent look at what is on the roadmap and why each feature matters."
            icon={Sparkles}
          />
          <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeUp}>
            {/* Roadmap pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', borderRadius: '99px', marginBottom: '20px',
                background: 'linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,107,0,0.06))',
                border: '1px solid rgba(255,107,0,0.2)',
                fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)',
              }}
            >
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#ff6b00', flexShrink: 0,
                boxShadow: '0 0 6px rgba(255,107,0,0.6)',
              }} />
              These features are not yet available — planned for future releases
            </motion.div>

            {FUTURE_FAQS.map((item, i) => (
              <FAQItem
                key={i} {...item} index={i}
                isOpen={openFutureIndex === i}
                onToggle={handleFutureToggle}
                idPrefix="future-faq"
              />
            ))}
          </motion.div>
        </div>

      </Container>
    </section>
  );
}