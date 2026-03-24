import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Input from '../components/ui/Input';
import GradientButton from '../components/GradientButton';

export default function ContractInteraction() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authFetch } = useAuth();
    
    const [contractAddress, setContractAddress] = useState('');
    const [abiInput, setAbiInput] = useState('');
    const [abi, setAbi] = useState(null);
    const [readFunctions, setReadFunctions] = useState([]);
    const [writeFunctions, setWriteFunctions] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [results, setResults] = useState({});
    const [isLoading, setIsLoading] = useState({});
    const [isPageLoading, setIsPageLoading] = useState(false);
    
    // Auto-fetch ABI on mount if ID is present
    useEffect(() => {
        if (!id) return;
        
        let isMounted = true;
        const fetchDetails = async () => {
            setIsPageLoading(true);
            try {
                // Fetch from deploying backend db
                const res = await authFetch(`/api/deployments/${id}`);
                const data = await res.json();
                
                if (data.success && isMounted) {
                    const parsedAbi = typeof data.deployment.abi === 'string' 
                        ? JSON.parse(data.deployment.abi) 
                        : data.deployment.abi;
                    
                    setContractAddress(data.deployment.contractAddress);
                    setAbi(parsedAbi);
                    
                    // Filter and Categorize ABI
                    const reads = parsedAbi.filter(item =>
                        item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
                    );
                    const writes = parsedAbi.filter(item =>
                        item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
                    );
                    
                    setReadFunctions(reads);
                    setWriteFunctions(writes);
                } else if (!data.success) {
                    toast.error('Failed to load contract details');
                }
            } catch (err) {
                console.error("X-Ray Fetch Error:", err);
                toast.error('Error fetching contract ABI.');
            } finally {
                if (isMounted) setIsPageLoading(false);
            }
        };
        fetchDetails();
        
        return () => { isMounted = false; };
    }, [id, authFetch]);

    const handleInputChange = (funcName, idx, value) => {
        setInputValues(prev => ({ ...prev, [`${funcName}_${idx}`]: value }));
    };

    const executeFunction = async (func, isWrite) => {
        const funcName = func.name;
        setIsLoading(prev => ({ ...prev, [funcName]: true }));

        try {
            if (!window.ethereum) throw new Error('MetaMask is not installed!');

            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            let targetContract;
            
            if (isWrite) {
                await browserProvider.send("eth_requestAccounts", []);
                const browserSigner = await browserProvider.getSigner();
                targetContract = new ethers.Contract(contractAddress, abi, browserSigner);
            } else {
                targetContract = new ethers.Contract(contractAddress, abi, browserProvider);
            }

            // Map user input values to exact arguments formatting
            const args = (func.inputs || []).map((input, idx) => {
                const val = inputValues[`${funcName}_${idx}`] || '';
                if (input.type.includes('uint') || input.type.includes('int')) return val; // Passed as string to ethers for bigints
                if (input.type === 'bool') return val === 'true';
                if (input.type.includes('[]')) {
                    try {
                        return JSON.parse(val); // parse array "[1,2,3]"
                    } catch {
                        return val.split(',').map(s => s.trim());
                    }
                }
                return val;
            });

            // If payable, we could check for an ETH value input (hardcoded 0 here for non-payable specifics)
            // But we will stick to basic execution for all args first
            const txResponse = await targetContract[funcName](...args);

            // Wait for tx confirmation if it's a write
            let finalResult;
            if (isWrite) {
                toast.success(`Transaction sent! Waiting for confirmation...`);
                const receipt = await txResponse.wait();
                finalResult = `Tx Hash: ${receipt.hash}`;
            } else {
                // Formatting read responses
                if (typeof txResponse === 'bigint') {
                    finalResult = txResponse.toString();
                } else if (Array.isArray(txResponse)) {
                    finalResult = txResponse.map(r => typeof r === 'bigint' ? r.toString() : String(r)).join(', ');
                } else {
                    finalResult = String(txResponse);
                }
            }

            setResults(prev => ({ ...prev, [funcName]: { success: true, value: finalResult } }));
            toast.success(`${funcName} executed successfully!`);
            
        } catch (err) {
            console.error("Execution Error:", err);
            const errReason = err.reason || err.shortMessage || err.message || 'Transaction failed';
            setResults(prev => ({ ...prev, [funcName]: { success: false, value: errReason } }));
            toast.error(errReason);
        } finally {
            setIsLoading(prev => ({ ...prev, [funcName]: false }));
        }
    };

    const handleManualConnect = () => {
        if (!contractAddress || !abiInput) {
            return toast.error('Enter both contract address and ABI.');
        }
        try {
            const parsedAbi = typeof abiInput === 'string' ? JSON.parse(abiInput) : abiInput;
            setAbi(parsedAbi);
            
            const reads = parsedAbi.filter(item =>
                item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')
            );
            const writes = parsedAbi.filter(item =>
                item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure'
            );
            
            setReadFunctions(reads);
            setWriteFunctions(writes);
            toast.success('Connected automatically via Input!');
        } catch (err) {
            toast.error('Invalid ABI JSON format.');
        }
    };

    if (!id && !abi) {
        return (
            <div className="max-w-[860px] mx-auto pb-20">

                
                {/* Header */}
                <div className="mb-10 pt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                            Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#06B6D4]">Explorer</span>
                        </h1>
                        <p className="text-gray-400 max-w-lg">
                            If you deploy via AutoCon, launch this page from your Dashboard to instantly auto-fetch your ABI. Otherwise, manually paste your deployed contract details below.
                        </p>
                    </div>
                </div>

                <GlassCard className="max-w-[600px]">
                    <div className="mb-4">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 pl-1 uppercase tracking-wider">
                            Contract Address
                        </label>
                        <Input
                            placeholder="0x..."
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                            className="font-mono"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs text-gray-400 font-semibold mb-1 pl-1 uppercase tracking-wider">
                            Contract ABI (JSON)
                        </label>
                        <textarea
                            value={abiInput}
                            onChange={(e) => setAbiInput(e.target.value)}
                            placeholder='[{"type":"function","name":"balanceOf",...}]'
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm font-mono text-white placeholder-gray-500 min-h-[140px] focus:outline-none focus:border-[#a78bfa]/50 transition-colors"
                        />
                    </div>
                    <GradientButton onClick={handleManualConnect} className="w-full py-3 text-base">
                        🔗 Connect to Contract
                    </GradientButton>
                </GlassCard>
            </div>
        );
    }

    if (isPageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-[#a78bfa]" size={40} />
                <p className="text-[#a78bfa] font-medium tracking-wide animate-pulse">Running ABI X-Ray...</p>
            </div>
        );
    }

    const renderFunctionCard = (func, isWrite) => {
        const funcKey = func.name;
        
        return (
            <GlassCard key={funcKey} className="mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-md text-[0.65rem] font-bold uppercase tracking-wider border ${isWrite ? 'text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/10' : 'text-[#67e8f9] border-[#67e8f9]/30 bg-[#67e8f9]/10'}`}>
                            {isWrite ? (func.stateMutability === 'payable' ? 'payable' : 'write') : 'read'}
                        </span>
                        <h4 className="font-mono text-[1rem] font-bold text-white">{func.name}</h4>
                    </div>
                    {/* Render button inline if no inputs */}
                    {func.inputs?.length === 0 && (
                        <div>
                            {isWrite ? (
                                <GradientButton onClick={() => executeFunction(func, true)} disabled={isLoading[funcKey]} className="py-1.5 px-6 text-sm">
                                    {isLoading[funcKey] ? <Loader2 className="animate-spin" size={16}/> : 'Execute'}
                                </GradientButton>
                            ) : (
                                <button
                                    onClick={() => executeFunction(func, false)}
                                    disabled={isLoading[funcKey]}
                                    className="px-6 py-1.5 rounded-lg border border-[#67e8f9]/50 text-[#67e8f9] font-bold text-sm bg-transparent hover:bg-[#67e8f9]/10 transition-colors flex items-center justify-center min-w-[100px]"
                                >
                                    {isLoading[funcKey] ? <Loader2 className="animate-spin" size={16}/> : 'Query'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Inputs List */}
                {func.inputs?.length > 0 && (
                    <div className="flex flex-col gap-3 mb-4">
                        {func.inputs.map((input, idx) => (
                            <div key={idx}>
                                <label className="block text-xs text-gray-400 font-semibold mb-1 pl-1">
                                    {input.name || `arg${idx}`} <span className="opacity-60 text-[0.65rem]">({input.type})</span>
                                </label>
                                <Input
                                    placeholder={`${input.name || `arg${idx}`} (${input.type})`}
                                    value={inputValues[`${funcKey}_${idx}`] || ''}
                                    onChange={(e) => handleInputChange(funcKey, idx, e.target.value)}
                                    className="w-full text-sm font-mono"
                                />
                            </div>
                        ))}
                        
                        <div className="flex justify-end mt-2">
                            {isWrite ? (
                                <GradientButton onClick={() => executeFunction(func, true)} disabled={isLoading[funcKey]} className="py-2 px-8">
                                    {isLoading[funcKey] ? <Loader2 className="animate-spin" size={18}/> : 'Execute Transaction'}
                                </GradientButton>
                            ) : (
                                <button
                                    onClick={() => executeFunction(func, false)}
                                    disabled={isLoading[funcKey]}
                                    className="px-8 py-2 rounded-xl border-2 border-[#67e8f9]/50 text-[#67e8f9] font-bold bg-black/20 hover:bg-[#67e8f9]/10 transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    {isLoading[funcKey] ? <Loader2 className="animate-spin" size={18}/> : 'Query Info'}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Results block */}
                {results[funcKey] && (
                    <div className={`mt-2 p-3 rounded-lg border font-mono text-sm break-all ${results[funcKey].success ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'}`}>
                        <span className="font-bold mr-2">{results[funcKey].success ? 'RESULT:' : 'ERROR:'}</span> 
                        {results[funcKey].value}
                    </div>
                )}
            </GlassCard>
        );
    };

    return (
        <div className="max-w-[1000px] mx-auto pb-20">

            
            <div className="mb-10 pt-4 flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Contract <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#06B6D4]">X-Ray</span>
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-mono text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                            {contractAddress}
                        </div>
                        <div className="flex items-center gap-1 text-[0.65rem] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                            Connected via ABI
                        </div>
                    </div>
                </div>
                {!id && (
                    <button 
                        onClick={() => { setAbi(null); setContractAddress(''); setAbiInput(''); setResults({}); }} 
                        className="px-4 py-2 text-xs font-bold border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        Disconnect
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Read Column */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                        Read Contract <span className="text-gray-500 text-sm font-medium ml-2">({readFunctions.length})</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                        {readFunctions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No read functions found.</p>
                        ) : readFunctions.map(f => renderFunctionCard(f, false))}
                    </div>
                </div>

                {/* Write Column */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                        Write Contract <span className="text-gray-500 text-sm font-medium ml-2">({writeFunctions.length})</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                        {writeFunctions.length === 0 ? (
                            <p className="text-gray-500 text-sm">No write functions found.</p>
                        ) : writeFunctions.map(f => renderFunctionCard(f, true))}
                    </div>
                </div>
            </div>
        </div>
    );
}
