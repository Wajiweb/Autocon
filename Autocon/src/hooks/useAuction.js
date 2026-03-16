import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import { fireConfetti } from '../utils/confetti';

export const useAuction = () => {
    const { authFetch } = useAuth();
    const { network } = useNetwork();
    const [formData, setFormData] = useState({
        name: '', itemName: '', itemDescription: '',
        duration: '3600', minimumBid: '0.01', ownerAddress: ''
    });
    const [generatedCode, setGeneratedCode] = useState('');
    const [contractData, setContractData] = useState({ abi: null, bytecode: null });
    const [isDeploying, setIsDeploying] = useState(false);
    const [gasEstimate, setGasEstimate] = useState(null);
    const [isEstimating, setIsEstimating] = useState(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setFormData(prev => ({ ...prev, ownerAddress: accounts[0] }));
                toast.success("MetaMask Connected!");
            } catch (err) { toast.error("Wallet connection failed."); }
        } else { toast.error("Please install MetaMask!"); }
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

            if (data.success) {
                setGeneratedCode(data.contractCode);
                setContractData({ abi: data.abi, bytecode: data.bytecode });
                setGasEstimate(null);
                toast.success("Auction Contract Compiled! 🔨", { id: loadingToast });
            } else {
                toast.error(data.error || "Compilation failed.", { id: loadingToast });
            }
        } catch (err) {
            console.error("Auction Generation Error:", err);
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
        } catch (err) {
            console.error("Gas Error:", err);
            toast.error("Failed to estimate gas.");
        } finally { setIsEstimating(false); }
    };

    const deployAuction = async () => {
        if (!contractData.abi || !contractData.bytecode) return toast.error("Generate auction first!");
        setIsDeploying(true);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const currentNetwork = await provider.getNetwork();

            // Multi-chain: check against selected network
            if (Number(currentNetwork.chainId) !== network.chainIdDecimal) {
                toast.error(`Please switch MetaMask to ${network.name}!`);
                setIsDeploying(false);
                return;
            }

            const signer = await provider.getSigner();
            const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);

            toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });

            const minBidWei = ethers.parseEther(String(formData.minimumBid || '0'));
            const contract = await factory.deploy(
                formData.ownerAddress,
                parseInt(formData.duration),
                minBidWei,
                formData.itemName || 'Item',
                formData.itemDescription || ''
            );

            const deployToast = toast.loading(`Deploying Auction to ${network.name}...`);
            await contract.waitForDeployment();
            const deployedAddress = await contract.getAddress();

            toast.success(`Auction deployed on ${network.name}! 🎉`, { id: deployToast });
            fireConfetti();

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
                        minimumBid: formData.minimumBid
                    })
                });
                const saveData = await saveRes.json();
                if (saveData.success) toast.success("Saved to Registry!", { icon: '☁️' });
            } catch { toast.error("Failed to save to database."); }

            // Verify on Etherscan
            try {
                const verifyToast = toast.loading('Verifying contract on Etherscan...');
                
                // ABI Encode constructor arguments
                // constructor(address _owner, uint _biddingTime, uint _minBid, string memory _itemName, string memory _itemDescription)
                const abiCoder = new ethers.AbiCoder();
                const encodedArgs = abiCoder.encode(
                    ["address", "uint256", "uint256", "string", "string"], 
                    [
                        formData.ownerAddress, 
                        parseInt(formData.duration), 
                        minBidWei, 
                        formData.itemName || 'Item', 
                        formData.itemDescription || ''
                    ]
                );

                const verifyRes = await authFetch('/api/verify', {
                    method: 'POST',
                    body: JSON.stringify({
                        contractAddress: deployedAddress,
                        sourceCode: generatedCode,
                        contractName: formData.name.replace(/\s+/g, ''),
                        compilerVersion: 'v0.8.20+commit.a1b79de6',
                        network: network.name,
                        constructorArguements: encodedArgs
                    })
                });

                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    toast.success("Etherscan Verification Submitted! ✅", { id: verifyToast });
                } else {
                    toast.error("Etherscan verification failed: " + (verifyData.error || 'Unknown error'), { id: verifyToast });
                }
            } catch (error) {
                console.error("Verification error:", error);
                toast.error("Failed to request Etherscan verification.");
            }

            // Reset form after successful deployment
            setFormData(prev => ({ ...prev, name: '', itemName: '', itemDescription: '', duration: '3600', minimumBid: '0.01' }));
            setGeneratedCode('');
            setContractData({ abi: null, bytecode: null });
            setGasEstimate(null);

            return deployedAddress;
        } catch (err) {
            console.error(err);
            toast.error("Deployment failed.");
        } finally { setIsDeploying(false); }
    };

    return {
        formData, setFormData, generatedCode, contractData,
        connectWallet, generateAuction, deployAuction,
        estimateGas, gasEstimate, isEstimating, isDeploying
    };
};
