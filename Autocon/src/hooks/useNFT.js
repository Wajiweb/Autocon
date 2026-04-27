import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useWallet } from './useWallet';
import { fireConfetti } from '../utils/confetti';
import { useContractStore } from '../store/useContractStore';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';

export const useNFT = () => {
    const { authFetch } = useAuth();
    const { network } = useNetwork();
    const location = useLocation();
    const prefill = location.state?.prefill || {};
    const [formData, setFormData] = useState({
        name: prefill.name || '', symbol: prefill.symbol || '',
        maxSupply: prefill.maxSupply || '10000',
        baseURI: prefill.baseURI || '',
        mintPrice: prefill.mintPrice ?? '0', ownerAddress: ''
    });
    const { generatedCode, setGeneratedCode, isEditingEnabled, contractData, setContractData } = useContractStore();
    const { resetTransaction, setStatus, setTxHash, setConfirmed, setError, setNetwork, setStep, setErrorStep } = useTransactionStore();
    const txInFlight = useTransactionStore(selectIsDeploying);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [gasEstimate, setGasEstimate] = useState(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const { connectWallet: baseConnectWallet } = useWallet();

    const connectWallet = async () => {
        const address = await baseConnectWallet();
        if (address) {
            setFormData(prev => ({ ...prev, ownerAddress: address }));
        }
    };

    const generateNFT = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Compiling NFT contract...");

        try {
            const res = await authFetch('/api/nft/generate', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success && data.data) {
                setGeneratedCode(data.data.contractCode, 'NFT', { 
                    abi: data.data.abi, 
                    bytecode: data.data.bytecode, 
                    compilerVersion: data.data.compilerVersion || 'v0.8.20+commit.a1b79de6',
                    constructorArgs: null 
                });
                setGasEstimate(null);
                toast.success("NFT Contract Compiled & Ready! 🎨", { id: loadingToast });
            } else {
                toast.error(data.error || "Compilation failed.", { id: loadingToast });
            }
        } catch (_err) {
            toast.error("Backend error. Make sure server is running.", { id: loadingToast });
        }
    };

    const estimateGas = async () => {
        if (!contractData.abi || !contractData.bytecode) {
            return toast.error("Generate an NFT contract first!");
        }

        setIsEstimating(true);
        try {
            const mintPriceWei = ethers.parseEther(String(formData.mintPrice || '0'));

            const res = await authFetch('/api/estimate-gas', {
                method: 'POST',
                body: JSON.stringify({
                    network: network.key,
                    abi: contractData.abi,
                    bytecode: contractData.bytecode,
                    ownerAddress: formData.ownerAddress,
                    supply: formData.maxSupply,
                    constructorArgs: [
                        formData.ownerAddress,
                        formData.maxSupply,
                        formData.baseURI || '',
                        mintPriceWei.toString()
                    ]
                })
            });
            const data = await res.json();

            if (data.success) {
                setGasEstimate(data);
                toast.success("Gas estimated successfully!");
            } else {
                toast.error(data.error || "Failed to estimate gas.");
            }
        } catch {
            toast.error("Failed to estimate gas.");
        } finally {
            setIsEstimating(false);
        }
    };

    const deployNFT = async () => {
        if (!contractData?.abi || !contractData?.bytecode) return toast.error("Generate NFT code first!");
        if (!generatedCode || !generatedCode.trim()) return toast.error("Contract code is empty.");
        if (!formData.baseURI || !formData.baseURI.startsWith('ipfs://')) return toast.error("Valid IPFS Token URI is required before deployment. Please upload an image first.");
        if (txInFlight) return;

        resetTransaction();
        setNetwork(network.name);
        setStatus('pending');

        setStep(0);
        let deployed;
        let finalAbi = contractData.abi;
        let finalBytecode = contractData.bytecode;

        try {
            if (isEditingEnabled) {
                toast.loading("Recompiling custom code...", { id: 'recompile' });
                const compRes = await authFetch('/api/compile', {
                    method: 'POST',
                    body: JSON.stringify({ sourceCode: generatedCode, contractName: formData.name.replace(/\s+/g, '') || 'NFTCollection' })
                });
                const compData = await compRes.json();
                if (!compData.success) {
                    setErrorStep(-1, "Compilation Failed: " + compData.error);
                    return toast.error("Compilation Failed: " + compData.error, { id: 'recompile' });
                }
                finalAbi = compData.abi;
                finalBytecode = compData.bytecode;
                setContractData(prev => ({ ...prev, abi: finalAbi, bytecode: finalBytecode }));
                toast.success("Compiled successfully!", { id: 'recompile' });
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const currentNetwork = await provider.getNetwork();

            if (Number(currentNetwork.chainId) !== network.chainIdDecimal) {
                toast.error(`Please switch MetaMask to ${network.name}!`);
                setErrorStep(-1, `Wrong network: expected ${network.name}`);
                return;
            }

            const signer = await provider.getSigner();
            const factory = new ethers.ContractFactory(finalAbi, finalBytecode, signer);

            setStep(1); // Awaiting wallet signature
            setStatus('pending');
            toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });

            const mintPriceWei = ethers.parseEther(String(formData.mintPrice || '0'));
            const contract = await factory.deploy(
                formData.ownerAddress,
                formData.maxSupply,
                formData.baseURI || '',
                mintPriceWei
            );

            // Capture tx hash immediately on submit
            const submittedHash = contract.deploymentTransaction()?.hash;
            if (submittedHash) setTxHash(submittedHash);

            // Encode args for Etherscan Verification later
            const abiCoder = new ethers.AbiCoder();
            const encodedArgs = abiCoder.encode(
                ["address", "uint256", "string", "uint256"], 
                [formData.ownerAddress, formData.maxSupply, formData.baseURI || '', mintPriceWei]
            );
            setContractData({ constructorArgs: encodedArgs });

            setStep(2); // Broadcasting
            const deployToast = toast.loading(`Deploying NFT to ${network.name}...`);

            setStep(3); // Waiting for confirmation
            await contract.waitForDeployment();
            const receipt = await contract.deploymentTransaction().wait();
            deployed = await contract.getAddress();

            setStep(4); // Success!
            setConfirmed(deployed, receipt, provider);
            toast.success(`NFT Collection deployed on ${network.name}! 🎉`, { id: deployToast });
            fireConfetti();

            // Save to database
            try {
                const saveRes = await authFetch('/api/nft/save', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: formData.name,
                        symbol: formData.symbol,
                        contractAddress: deployed,
                        ownerAddress: formData.ownerAddress,
                        network: network.name,
                        maxSupply: parseInt(formData.maxSupply),
                        mintPrice: formData.mintPrice,
                        baseURI: formData.baseURI,
                        abi: contractData.abi
                    })
                });
                const saveData = await saveRes.json();
                if (saveData.success) {
                    toast.success("Saved to NFT Registry!", { icon: '☁️' });
                }
            } catch (_error) {
                toast.error("Failed to save to database.");
            }


            setShowSuccessModal(true);
            return deployed;

        } catch (_err) {
            console.error('[useNFT] deploy:', _err.message);
            const msg = _err?.reason || _err?.message || 'Deployment failed. Do you have enough testnet ETH?';
            const currentStep = useTransactionStore.getState().step;
            setErrorStep(currentStep >= 0 ? currentStep : 0, msg);
            toast.error(msg);
        } finally {
            setTimeout(() => { setStep(-1); setErrorStep(-1, ''); }, 3000);
        }
    };

    return {
        formData, setFormData, generatedCode, contractData,
        connectWallet, generateNFT, deployNFT,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal
    };
};
