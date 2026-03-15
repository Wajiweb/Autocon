import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import { fireConfetti } from '../utils/confetti';

export const useNFT = () => {
    const { authFetch } = useAuth();
    const { network } = useNetwork();
    const [formData, setFormData] = useState({
        name: '', symbol: '', maxSupply: '10000',
        baseURI: '', mintPrice: '0', ownerAddress: ''
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

    const generateNFT = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Compiling NFT contract...");

        try {
            const res = await authFetch('/api/nft/generate', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setGeneratedCode(data.contractCode);
                setContractData({ abi: data.abi, bytecode: data.bytecode });
                setGasEstimate(null);
                toast.success("NFT Contract Compiled & Ready! 🎨", { id: loadingToast });
            } else {
                toast.error(data.error || "Compilation failed.", { id: loadingToast });
            }
        } catch (err) {
            console.error("NFT Generation Error:", err);
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
        } catch (err) {
            console.error("Gas Error:", err);
            toast.error("Failed to estimate gas.");
        } finally {
            setIsEstimating(false);
        }
    };

    const deployNFT = async () => {
        if (!contractData.abi || !contractData.bytecode) return toast.error("Generate NFT code first!");

        setIsDeploying(true);
        let deployedAddress;

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

            // Deploy with constructor args: (initialOwner, maxSupply, baseURI, mintPrice)
            const mintPriceWei = ethers.parseEther(String(formData.mintPrice || '0'));
            const contract = await factory.deploy(
                formData.ownerAddress,
                formData.maxSupply,
                formData.baseURI || '',
                mintPriceWei
            );

            const deployToast = toast.loading(`Deploying NFT to ${network.name}...`);

            await contract.waitForDeployment();
            deployedAddress = await contract.getAddress();

            toast.success(`NFT Collection deployed on ${network.name}! 🎉`, { id: deployToast });
            fireConfetti();

            // Save to database
            try {
                const saveRes = await authFetch('/api/nft/save', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: formData.name,
                        symbol: formData.symbol,
                        contractAddress: deployedAddress,
                        ownerAddress: formData.ownerAddress,
                        network: network.name,
                        maxSupply: parseInt(formData.maxSupply),
                        mintPrice: formData.mintPrice,
                        baseURI: formData.baseURI
                    })
                });
                const saveData = await saveRes.json();
                if (saveData.success) {
                    toast.success("Saved to NFT Registry!", { icon: '☁️' });
                }
            } catch (error) {
                toast.error("Failed to save to database.");
            }

            // Reset form after successful deployment
            setFormData(prev => ({ ...prev, name: '', symbol: '', maxSupply: '10000', baseURI: '', mintPrice: '0' }));
            setGeneratedCode('');
            setContractData({ abi: null, bytecode: null });
            setGasEstimate(null);

            return deployedAddress;

        } catch (err) {
            console.error(err);
            toast.error("Deployment failed. Do you have enough testnet ETH?");
        } finally {
            setIsDeploying(false);
        }
    };

    return {
        formData, setFormData, generatedCode, contractData,
        connectWallet, generateNFT, deployNFT,
        estimateGas, gasEstimate, isEstimating,
        isDeploying
    };
};
