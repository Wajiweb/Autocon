import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import { fireConfetti } from '../utils/confetti';

export const useWeb3 = () => {
  const { authFetch, user } = useAuth();
  const { network } = useNetwork();
  const [formData, setFormData] = useState({
    name: '', symbol: '', supply: '1000000', ownerAddress: ''
  });
  const [generatedCode, setGeneratedCode] = useState("");
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

  const generateContract = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Compiling smart contract...");

    try {
      const res = await authFetch('/api/generate-token', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setGeneratedCode(data.contractCode);
        setContractData({ abi: data.abi, bytecode: data.bytecode });
        setGasEstimate(null);
        toast.success("Contract Compiled & Ready! 🚀", { id: loadingToast });
      } else {
        toast.error(data.error || "Compilation failed.", { id: loadingToast });
      }
    } catch (err) {
      console.error("Generation Error:", err);
      const msg = err.message || "Backend error. Make sure server is running.";
      toast.error(msg, { id: loadingToast });
    }
  };

  const estimateGas = async () => {
    if (!contractData.abi || !contractData.bytecode) {
      return toast.error("Generate a contract first!");
    }

    setIsEstimating(true);
    try {
      const res = await authFetch('/api/estimate-gas', {
        method: 'POST',
        body: JSON.stringify({
          abi: contractData.abi,
          bytecode: contractData.bytecode,
          ownerAddress: formData.ownerAddress,
          supply: formData.supply
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
      toast.error("Failed to estimate gas. Check RPC connection.");
    } finally {
      setIsEstimating(false);
    }
  };

  const deployContract = async () => {
    if (!contractData.abi || !contractData.bytecode) return toast.error("Generate code first!");

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

      const contract = await factory.deploy(formData.ownerAddress, formData.supply);

      const deployToast = toast.loading(`Deploying to ${network.name}...`);

      await contract.waitForDeployment();
      deployedAddress = await contract.getAddress();

      toast.success(`Token deployed on ${network.name}!`, { id: deployToast });
      fireConfetti();

      // Save to database via authenticated endpoint
      try {
        const saveRes = await authFetch('/api/save-token', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name, symbol: formData.symbol,
            contractAddress: deployedAddress, ownerAddress: formData.ownerAddress,
            network: network.name
          })
        });

        const saveData = await saveRes.json();
        if (saveData.success) {
          toast.success("Saved to Dashboard Registry!", { icon: '☁️' });
        }
      } catch (error) {
        toast.error("Failed to save to database.");
      }

      // Reset form after successful deployment
      setFormData(prev => ({ ...prev, name: '', symbol: '', supply: '1000000' }));
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
    connectWallet, generateContract, deployContract,
    estimateGas, gasEstimate, isEstimating,
    isDeploying
  };
};