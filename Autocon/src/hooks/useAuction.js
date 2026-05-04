import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { fireConfetti } from '../utils/confetti';
import { useWallet } from './useWallet';
import { useContractStore } from '../store/useContractStore';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';

export const useAuction = () => {
    const { authFetch } = useAuth();
    const { network } = useNetwork();
    const location = useLocation();
    const prefill = location.state?.prefill || {};
const [formData, setFormData] = useState({
        name: prefill.name || '',
        itemName: prefill.itemName || '',
        itemDescription: prefill.itemDescription || '',
        duration: prefill.duration || '3600',
        minimumBid: prefill.minimumBid || '0.01',
        reservePrice: prefill.reservePrice || '',
        ownerAddress: '',
        hasExtension: false, extensionPeriod: '300',
        hasAntiSnipe: false, antiSnipePeriod: '300'
      });
    const { generatedCode, setGeneratedCode, isEditingEnabled, contractData, setContractData } = useContractStore();
    const { resetTransaction, setStatus, setTxHash, setConfirmed, setError, setNetwork, setStep, setErrorStep } = useTransactionStore();
    const txInFlight = useTransactionStore(selectIsDeploying);
    const [gasEstimate, setGasEstimate] = useState(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const { connectWallet: baseConnectWallet } = useWallet();

    const connectWallet = async () => {
        const address = await baseConnectWallet();
        if (address) {
            setFormData(prev => ({ ...prev, ownerAddress: address }));
        }
    };

    const generateAuction = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Compiling Auction contract...");

        try {
            const res = await authFetch('/api/auction/generate', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success && data.data) {
                setGeneratedCode(data.data.contractCode, 'Auction', { abi: data.data.abi, bytecode: data.data.bytecode });
                setGasEstimate(null);
                toast.success("Auction Contract Compiled! 🔨", { id: loadingToast });
            } else {
                toast.error(data.error || "Compilation failed.", { id: loadingToast });
            }
        } catch (_err) {
            toast.error("Backend error.", { id: loadingToast });
        }
    };

    const estimateGas = async () => {
        if (!contractData.abi || !contractData.bytecode) {
            return toast.error("Generate an auction contract first!");
        }
        setIsEstimating(true);
        try {
            const minBidWei = ethers.parseEther(String(formData.minimumBid || '0'));

            const res = await authFetch('/api/estimate-gas', {
                method: 'POST',
                body: JSON.stringify({
                    network: network.key,
                    abi: contractData.abi,
                    bytecode: contractData.bytecode,
                    ownerAddress: formData.ownerAddress,
                    constructorArgs: [
                        formData.ownerAddress,
                        parseInt(formData.duration),
                        minBidWei.toString(),
                        formData.itemName || 'Item',
                        formData.itemDescription || ''
                    ]
                })
            });
            const data = await res.json();
            if (data.success) {
                setGasEstimate(data);
                toast.success("Gas estimated!");
            } else { toast.error(data.error || "Gas estimation failed."); }
        } catch {
            toast.error("Failed to estimate gas.");
        } finally { setIsEstimating(false); }
    };

    const deployAuction = async () => {
        if (!contractData?.abi || !contractData?.bytecode) return toast.error("Generate auction first!");
        if (!generatedCode || !generatedCode.trim()) return toast.error("Contract code is empty.");
        if (txInFlight) return;

        resetTransaction();
        setNetwork(network.name);
        setStatus('pending');

        setStep(0);
        let finalAbi = contractData.abi;
        let finalBytecode = contractData.bytecode;

        try {
            if (isEditingEnabled) {
                toast.loading("Recompiling custom code...", { id: 'recompile' });
                const compRes = await authFetch('/api/compile', {
                    method: 'POST',
                    body: JSON.stringify({ sourceCode: generatedCode, contractName: formData.name.replace(/\s+/g, '') || 'AuctionContract' })
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

            // Multi-chain: check against selected network
            if (Number(currentNetwork.chainId) !== network.chainIdDecimal) {
                toast.error(`Please switch MetaMask to ${network.name}!`);
                setErrorStep(-1, `Wrong network: expected ${network.name}`);
                return;
            }

            const signer = await provider.getSigner();
            const factory = new ethers.ContractFactory(finalAbi, finalBytecode, signer);

            setStep(1); // Awaiting wallet signature
            toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });
            setStatus('pending');

            const minBidWei = ethers.parseEther(String(formData.minimumBid || '0'));
            const contract = await factory.deploy(
                formData.ownerAddress,
                parseInt(formData.duration),
                minBidWei,
                formData.itemName || 'Item',
                formData.itemDescription || ''
            );

            // Capture tx hash immediately on submit
            const submittedHash = contract.deploymentTransaction()?.hash;
            if (submittedHash) setTxHash(submittedHash);

            setStep(2); // Broadcasting
            const deployToast = toast.loading(`Deploying Auction to ${network.name}...`);
            
            setStep(3); // Waiting for confirmation
            await contract.waitForDeployment();
            const receipt = await contract.deploymentTransaction().wait();
            const deployedAddress = await contract.getAddress();
            
            setStep(4); // Success!
            setConfirmed(deployedAddress, receipt, provider);

            toast.success(`Auction deployed on ${network.name}! 🎉`, { id: deployToast });
            fireConfetti();

            // Encode constructor arguments
            const iface = new ethers.Interface(finalAbi);
            const constructorArgsArr = [
                formData.ownerAddress, 
                parseInt(formData.duration), 
                minBidWei, 
                formData.itemName || 'Item', 
                formData.itemDescription || ''
            ];
            const encodedArgs = iface.encodeDeploy(constructorArgsArr);
            const constructorArgsHex = encodedArgs.startsWith('0x') ? encodedArgs.slice(2) : encodedArgs;

            // Save to database with source code artifacts
            try {
                const saveRes = await authFetch('/api/auction/save', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: formData.name,
                        itemName: formData.itemName,
                        itemDescription: formData.itemDescription,
                        contractAddress: deployedAddress,
                        ownerAddress: formData.ownerAddress,
                        network: network.name,
                        duration: parseInt(formData.duration),
                        minimumBid: formData.minimumBid,
                        sourceCode: generatedCode,
                        compilerVersion: 'v0.8.20+commit.a1b79de6',
                        constructorArgs: constructorArgsHex
                    })
                });
                const saveData = await saveRes.json();
                if (saveData.success) toast.success("Saved to Registry!", { icon: '☁️' });
            } catch { toast.error("Failed to save to database."); }

            // Queue background verification job
            try {
                const verifyToast = toast.loading('Queuing verification job...');

                const verifyRes = await authFetch('/api/jobs/create', {
                    method: 'POST',
                    body: JSON.stringify({
                        type: 'verification',
                        payload: {
                            contractAddress: deployedAddress,
                            sourceCode: generatedCode,
                            contractName: formData.name.replace(/\s+/g, '') || 'AuctionContract',
                            compilerVersion: 'v0.8.20+commit.a1b79de6',
                            network: network.name,
                            constructorArgs: constructorArgsHex
                        }
                    })
                });

                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    toast.success("Verification job queued! ✅", { id: verifyToast });
                } else {
                    toast.error("Verification failed: " + (verifyData.error || 'Unknown error'), { id: verifyToast });
                }
            } catch {
                toast.error("Failed to queue verification.");
            }

            // Reset form after successful deployment
            setFormData(prev => ({ ...prev, name: '', itemName: '', itemDescription: '', duration: '3600', minimumBid: '0.01' }));
            setGeneratedCode('');
            setGasEstimate(null);
            
            setShowSuccessModal(true);

            return deployedAddress;
        } catch (_err) {
            console.error('[useAuction] deploy:', _err.message);
            const msg = _err?.reason || _err?.message || 'Deployment failed.';
            const currentStep = useTransactionStore.getState().step;
            setErrorStep(currentStep >= 0 ? currentStep : 0, msg);
            toast.error(msg);
        } finally {
            setTimeout(() => { setStep(-1); setErrorStep(-1, ''); }, 3000);
        }
    };

    return {
        formData, setFormData, generatedCode, contractData,
        connectWallet, generateAuction, deployAuction,
        estimateGas, gasEstimate, isEstimating,
        showSuccessModal, setShowSuccessModal
    };
};
