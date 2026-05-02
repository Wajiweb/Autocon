import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useNetwork } from '../../context/NetworkContext';
import './styles/dashboard.css';

/* ══════════════════════════════════════════════════════
   NetworkSwitcher — compact dropdown chip for the Topbar
   Fits seamlessly inside the existing db-topbar design.
══════════════════════════════════════════════════════ */
export default function NetworkSwitcher() {
    const { network, networks, allNetworkKeys, setSelectedNetwork } = useNetwork();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = async (key) => {
        setOpen(false);
        await setSelectedNetwork(key);
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            {/* Trigger chip — same style as db-tb-chip */}
            <button
                onClick={() => setOpen(o => !o)}
                className="db-tb-chip"
                style={{
                    cursor: 'pointer',
                    background: open ? 'rgba(34,197,94,0.15)' : undefined,
                    border: `.5px solid ${network?.color || 'rgba(34,197,94,0.25)'}`,
                    color: network?.color || 'var(--db-acc)',
                    gap: 6,
                    userSelect: 'none',
                    transition: 'background .15s',
                    display: 'flex',
                    alignItems: 'center',
                }}
                title={`Current network: ${network?.name}. Click to switch.`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {/* Live dot */}
                <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: network?.color || 'var(--db-acc)',
                    boxShadow: `0 0 6px ${network?.color || 'var(--db-acc)'}`,
                    display: 'inline-block', flexShrink: 0,
                }} />
                {network?.name || 'Sepolia'}
                {/* Chevron */}
                <ChevronDown size={14} style={{ opacity: .6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    role="listbox"
                    style={{
                        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                        width: 230, zIndex: 999,
                        background: 'var(--db-s1)',
                        border: '.5px solid var(--db-br2)',
                        borderRadius: 'var(--db-r)',
                        boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                        overflow: 'hidden',
                        animation: 'db-enter .12s ease',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '10px 14px',
                        borderBottom: '.5px solid var(--db-br)',
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '.07em', color: 'var(--db-t3)',
                        fontFamily: 'var(--db-font)',
                    }}>
                        Select Network
                    </div>

                    {/* Network options */}
                    {allNetworkKeys.map((key) => {
                        const n = networks[key];
                        const isActive = n.key === network?.key;
                        return (
                            <button
                                key={key}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => handleSelect(key)}
                                style={{
                                    width: '100%', textAlign: 'left',
                                    padding: '11px 14px', border: 'none',
                                    background: isActive ? `${n.color}14` : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    transition: 'background .12s',
                                    borderBottom: '.5px solid var(--db-br)',
                                    fontFamily: 'var(--db-font)',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--db-s2)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {/* Color dot */}
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                    background: n.color,
                                    boxShadow: isActive ? `0 0 8px ${n.color}` : 'none',
                                }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? n.color : 'var(--db-t1)',
                                        lineHeight: 1.2, marginBottom: 2,
                                    }}>
                                        {n.name}
                                    </div>
                                    <div style={{
                                        fontSize: 10, color: 'var(--db-t3)',
                                        fontFamily: 'var(--db-mono)',
                                    }}>
                                        {n.layer} · {n.currencySymbol}
                                    </div>
                                </div>
                                {isActive && (
                                    <span style={{
                                        fontSize: 10, padding: '2px 7px', borderRadius: 20,
                                        background: `${n.color}20`,
                                        color: n.color,
                                        border: `.5px solid ${n.color}40`,
                                        fontWeight: 700, flexShrink: 0,
                                        fontFamily: 'var(--db-font)',
                                    }}>Active</span>
                                )}
                            </button>
                        );
                    })}

                    {/* Faucet link for active network */}
                    {network?.faucet && (
                        <a
                            href={network.faucet}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '10px 14px',
                                fontSize: 11, color: 'var(--db-t3)',
                                fontFamily: 'var(--db-font)',
                                textDecoration: 'none',
                                transition: 'color .12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--db-acc)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--db-t3)'}
                        >
                            <span style={{ fontSize: 12 }}>🚰</span> Get {network.currencySymbol} from faucet <ExternalLink size={10} style={{ marginLeft: 2 }} />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
