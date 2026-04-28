import { useNetwork } from '../../context/NetworkContext';

export default function NetworkSelector() {
    const { selectedNetwork, setSelectedNetwork, networks, allNetworkKeys } = useNetwork();

    return (
        <div style={{
            display: 'flex', gap: '6px', alignItems: 'center',
            padding: '4px', borderRadius: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--surface)'
        }}>
            {allNetworkKeys.map(key => {
                const net = networks[key];
                const isActive = key === selectedNetwork;
                return (
                    <button
                        key={key}
                        onClick={() => setSelectedNetwork(key)}
                        style={{
                            padding: '6px 12px', borderRadius: '8px',
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: isActive ? 700 : 500,
                            fontFamily: 'Inter, sans-serif',
                            background: isActive
                                ? `${net.color}20`
                                : 'transparent',
                            color: isActive ? net.color : '#64748b',
                            transition: 'all 0.2s ease',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <span style={{ fontSize: '0.8rem' }}>{net.icon}</span>
                        {net.name}
                    </button>
                );
            })}
        </div>
    );
}
