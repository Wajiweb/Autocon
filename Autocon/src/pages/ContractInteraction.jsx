import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

export default function ContractInteraction() {
    const [contractAddress, setContractAddress] = useState('');
    const [abiInput, setAbiInput] = useState('');
    const [abi, setAbi] = useState(null);
    const [connected, setConnected] = useState(false);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [results, setResults] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [isLoading, setIsLoading] = useState({});

    const connectToContract = async () => {
        try {
            if (!contractAddress || !abiInput) {
                return toast.error('Enter both contract address and ABI.');
            }

            let parsedAbi;
            try {
                parsedAbi = JSON.parse(abiInput);
            } catch {
                return toast.error('Invalid ABI JSON.');
            }

            if (!window.ethereum) {
                return toast.error('Please install MetaMask!');
            }

            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            await browserProvider.send("eth_requestAccounts", []);
            const browserSigner = await browserProvider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, parsedAbi, browserSigner);

            setProvider(browserProvider);
            setSigner(browserSigner);
            setContract(contractInstance);
            setAbi(parsedAbi);
            setConnected(true);
            setResults({});
            setInputValues({});
            toast.success('Connected to contract!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to connect to contract.');
        }
    };

    // Get functions from ABI
    const readFunctions = abi?.filter(item =>
        item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
    ) || [];

    const writeFunctions = abi?.filter(item =>
        item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
    ) || [];

    const callFunction = async (func) => {
        const funcKey = func.name;
        setIsLoading(prev => ({ ...prev, [funcKey]: true }));

        try {
            const args = (func.inputs || []).map((input, idx) => {
                const val = inputValues[`${funcKey}_${idx}`] || '';
                if (input.type.includes('uint') || input.type.includes('int')) {
                    return val;
                }
                if (input.type === 'bool') return val === 'true';
                return val;
            });

            const result = await contract[func.name](...args);

            let displayResult;
            if (typeof result === 'bigint') {
                displayResult = result.toString();
            } else if (Array.isArray(result)) {
                displayResult = result.map(r => typeof r === 'bigint' ? r.toString() : String(r)).join(', ');
            } else {
                displayResult = String(result);
            }

            setResults(prev => ({ ...prev, [funcKey]: { success: true, value: displayResult } }));
            toast.success(`${func.name}() executed!`);
        } catch (err) {
            console.error(err);
            setResults(prev => ({ ...prev, [funcKey]: { success: false, value: err.reason || err.message || 'Transaction failed' } }));
            toast.error(`${func.name}() failed`);
        } finally {
            setIsLoading(prev => ({ ...prev, [funcKey]: false }));
        }
    };

    const handleInputChange = (funcName, idx, value) => {
        setInputValues(prev => ({ ...prev, [`${funcName}_${idx}`]: value }));
    };

    const renderFunctionCard = (func, isWrite) => {
        const funcKey = func.name;
        const bgColor = isWrite ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)';
        const borderColor = isWrite ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)';
        const accentColor = isWrite ? '#f59e0b' : '#10b981';

        return (
            <div key={funcKey} style={{
                padding: '18px', borderRadius: '14px',
                background: bgColor,
                border: `1px solid ${borderColor}`,
                marginBottom: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: func.inputs?.length ? '12px' : '0' }}>
                    <span style={{
                        padding: '3px 8px', borderRadius: '6px',
                        fontSize: '0.6rem', fontWeight: 700,
                        background: `${accentColor}20`, color: accentColor,
                        textTransform: 'uppercase'
                    }}>
                        {isWrite ? (func.stateMutability === 'payable' ? '💰 payable' : '✏️ write') : '👁️ read'}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'monospace' }}>
                        {func.name}
                    </span>
                    {func.inputs?.length === 0 && (
                        <button
                            onClick={() => callFunction(func)}
                            disabled={isLoading[funcKey]}
                            style={{
                                marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px',
                                border: 'none', background: accentColor, color: 'white',
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', opacity: isLoading[funcKey] ? 0.6 : 1
                            }}
                        >{isLoading[funcKey] ? '...' : 'Call'}</button>
                    )}
                </div>

                {/* Inputs */}
                {func.inputs?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {func.inputs.map((input, idx) => (
                            <div key={idx} style={{ flex: 1, minWidth: '120px' }}>
                                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--outline)', marginBottom: '4px', fontWeight: 600 }}>
                                    {input.name || `arg${idx}`} <span style={{ opacity: 0.6 }}>({input.type})</span>
                                </label>
                                <input
                                    value={inputValues[`${funcKey}_${idx}`] || ''}
                                    onChange={(e) => handleInputChange(funcKey, idx, e.target.value)}
                                    placeholder={input.type}
                                    className="input"
                                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => callFunction(func)}
                            disabled={isLoading[funcKey]}
                            style={{
                                padding: '8px 18px', borderRadius: '8px',
                                border: 'none', background: accentColor, color: 'white',
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                                height: 'fit-content', opacity: isLoading[funcKey] ? 0.6 : 1
                            }}
                        >{isLoading[funcKey] ? '...' : isWrite ? 'Send TX' : 'Query'}</button>
                    </div>
                )}

                {/* Result */}
                {results[funcKey] && (
                    <div style={{
                        marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                        background: results[funcKey].success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${results[funcKey].success ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                        fontSize: '0.8rem', fontFamily: 'monospace',
                        color: results[funcKey].success ? 'var(--success)' : 'var(--danger)',
                        wordBreak: 'break-all'
                    }}>
                        {results[funcKey].success ? '✅ ' : '❌ '}{results[funcKey].value}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <Toaster position="bottom-right" reverseOrder={false} />

            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '22px', boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
                    }}>🔗</div>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px',
                        color: 'var(--on-surface)', marginBottom: '0'
                    }}>
                        Contract <span className="gradient-text">Explorer</span>
                    </h1>
                </div>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                    Connect to any deployed Ethereum smart contract to read its state and execute transactions.
                </p>
            </div>

            {/* Input Card */}
            {!connected ? (
                <div className="card glass-strong animate-fade-in-up delay-100" style={{
                    padding: '28px', maxWidth: '600px',
                    borderTop: '2px solid rgba(6,182,212,0.4)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(6,182,212,0.1)'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--on-surface-variant)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Contract Address</label>
                        <input
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            placeholder="0x..."
                            className="input"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 700,
                            color: 'var(--on-surface-variant)', textTransform: 'uppercase',
                            letterSpacing: '1px', marginBottom: '10px'
                        }}>Contract ABI (JSON)</label>
                        <textarea
                            value={abiInput}
                            onChange={(e) => setAbiInput(e.target.value)}
                            placeholder='[{"type":"function","name":"balanceOf",...}]'
                            className="input"
                            style={{
                                minHeight: '120px', fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '0.78rem', lineHeight: 1.6, resize: 'vertical'
                            }}
                        />
                    </div>

                    <button onClick={connectToContract} className="btn-primary" style={{
                        width: '100%', padding: '16px',
                        background: 'linear-gradient(135deg, #10b981, #06b6d4)'
                    }}>
                        🔗 Connect to Contract
                    </button>
                </div>
            ) : (
                <>
                    {/* Connected badge */}
                    <div className="animate-fade-in-up" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 18px', marginBottom: '20px', borderRadius: '14px',
                        background: 'rgba(16,185,129,0.06)',
                        border: '1px solid rgba(16,185,129,0.15)'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)' }}>Connected</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--outline)', fontFamily: 'monospace' }}>
                            {contractAddress.substring(0, 10)}...{contractAddress.substring(36)}
                        </span>
                        <button onClick={() => { setConnected(false); setContract(null); setAbi(null); setResults({}); }}
                            style={{
                                marginLeft: 'auto', padding: '4px 12px', borderRadius: '8px',
                                border: '1px solid var(--outline-variant)', background: 'transparent',
                                color: 'var(--outline)', fontSize: '0.72rem', fontWeight: 600,
                                cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                            }}>Disconnect</button>
                    </div>

                    {/* Read Functions */}
                    {readFunctions.length > 0 && (
                        <div className="animate-fade-in-up delay-100" style={{ marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '12px' }}>
                                👁️ Read Functions ({readFunctions.length})
                            </h3>
                            {readFunctions.map(f => renderFunctionCard(f, false))}
                        </div>
                    )}

                    {/* Write Functions */}
                    {writeFunctions.length > 0 && (
                        <div className="animate-fade-in-up delay-200">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '12px' }}>
                                ✏️ Write Functions ({writeFunctions.length})
                            </h3>
                            {writeFunctions.map(f => renderFunctionCard(f, true))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
