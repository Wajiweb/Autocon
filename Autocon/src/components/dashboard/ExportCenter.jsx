import { useState } from 'react';
import toast from 'react-hot-toast';
import { useContractStore } from '../../store/useContractStore';
import { useNetwork } from '../../context/NetworkContext';
import { useTransactionStore, selectContractUrl } from '../../store/useTransactionStore';
import { 
    downloadSol, downloadABI, downloadMetadataTemplate, 
    downloadHardhat, downloadSingleContractPDF 
} from '../../utils/exportUtils';
import { Button } from '../ui/Button';
import { Save, Download, FileCode, FileJson, Hammer, FileBarChart, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function ExportCenter({ contractName = 'Contract', abi = null, nftMetadata = null }) {
    const { generatedCode, isEditingEnabled, contractType } = useContractStore();
    const { network } = useNetwork();
    const contractAddress = useTransactionStore(s => s.contractAddress);
    const explorerUrl = useTransactionStore(selectContractUrl);
    const [isOpen, setIsOpen] = useState(false);

    if (!generatedCode || !isEditingEnabled) return null; // Hidden for beginners

    const openInRemix = () => {
        const encoded = btoa(unescape(encodeURIComponent(generatedCode)));
        const remixUrl = `https://remix.ethereum.org/#code=${encoded}&lang=file-sol-registry`;
        window.open(remixUrl, '_blank');
        toast.success('Opening Remix IDE...');
        setIsOpen(false);
    };

    const handleAction = (actionFn) => {
        actionFn();
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-2 relative">
            <Button 
                variant="secondary"
                size="sm"
                onClick={() => handleAction(() => downloadSol(contractName, generatedCode))}
                title="Quick download .sol file"
                className="flex items-center gap-2"
            >
                <Save size={14} /> Download .sol
            </Button>
            <div className="relative">
                <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2"
                >
                    <Download size={14} /> Export Center {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </Button>

                {isOpen && (
                    <div className="absolute top-[110%] right-0 bg-[#0a0a0f] border border-[var(--outline-variant)] rounded-xl p-2 z-[100] flex flex-col gap-1 min-w-[200px] shadow-2xl">
                        <button onClick={() => handleAction(() => downloadSol(contractName, generatedCode))} className="text-left px-3 py-2 text-xs font-semibold text-[var(--outline)] hover:bg-[color:var(--surface)] hover:text-[var(--on-surface)] rounded-md transition-colors w-full flex items-center gap-2">
                            <Save size={13} /> Download .sol
                        </button>
                        <button onClick={() => handleAction(() => downloadABI(contractName, abi))} className="text-left px-3 py-2 text-xs font-semibold text-[var(--outline)] hover:bg-[color:var(--surface)] hover:text-[var(--on-surface)] rounded-md transition-colors w-full flex items-center gap-2">
                            <FileCode size={13} /> Export ABI
                        </button>
                        {contractType === 'NFT' && (
                            <button onClick={() => handleAction(() => downloadMetadataTemplate(contractName, nftMetadata))} className="text-left px-3 py-2 text-xs font-semibold text-sky-400 hover:bg-[color:var(--surface)] rounded-md transition-colors w-full flex items-center gap-2">
                                <FileJson size={13} /> Download JSON Metadata
                            </button>
                        )}
                        <button onClick={() => handleAction(() => downloadHardhat(contractName, generatedCode))} className="text-left px-3 py-2 text-xs font-semibold text-amber-500 hover:bg-[color:var(--surface)] rounded-md transition-colors w-full flex items-center gap-2">
                            <Hammer size={13} /> Hardhat Project (Zip)
                        </button>
                        <button onClick={() => handleAction(() => downloadSingleContractPDF({ contractName, contractType, network, contractAddress, explorerUrl, generatedCode }))} className="text-left px-3 py-2 text-xs font-semibold text-red-500 hover:bg-[color:var(--surface)] rounded-md transition-colors w-full flex items-center gap-2">
                            <FileBarChart size={13} /> Export PDF Report
                        </button>
                        <button onClick={openInRemix} className="text-left px-3 py-2 text-xs font-semibold text-purple-400 hover:bg-[color:var(--surface)] rounded-md transition-colors w-full flex items-center gap-2">
                            <ExternalLink size={13} /> Open in Remix
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
