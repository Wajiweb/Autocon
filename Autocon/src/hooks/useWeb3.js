import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import toast from 'react-hot-toast'; // 🍞 NEW: We import the toast library!

export const useWeb3 = () => {
  const [formData, setFormData] = useState({
    name: '', symbol: '', supply: '1000000', ownerAddress: ''
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [contractData, setContractData] = useState({ abi: null, bytecode: null });
  const [isDeploying, setIsDeploying] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData(prev => ({ ...prev, ownerAddress: accounts[0] }));
        toast.success("MetaMask Connected!"); // 🍞 Replaced alert
      } catch (err) { toast.error("Wallet connection failed."); }
    } else { toast.error("Please install MetaMask!"); }
  };

  const generateContract = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Compiling smart contract..."); // 🍞 Shows a spinner
    
    try {
      const res = await axios.post('http://localhost:5000/api/generate-token', formData);
      
      if (res.data.success) {
        setGeneratedCode(res.data.contractCode);
        setContractData({ abi: res.data.abi, bytecode: res.data.bytecode });
        toast.success("Contract Compiled & Ready! 🚀", { id: loadingToast }); // 🍞 Replaces spinner with checkmark
      }
    } catch (err) {
      console.error("Generation Error:", err);
      toast.error("Backend error. Make sure server is running.", { id: loadingToast });
    }
  };

  const deployContract = async () => {
    if (!contractData.abi || !contractData.bytecode) return toast.error("Generate code first!");
    
    setIsDeploying(true); 
    let deployedAddress;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (network.chainId !== 11155111n) {
        return toast.error("Please switch MetaMask to the Sepolia Network!");
      }

      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);
      
      toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });

      const contract = await factory.deploy(formData.ownerAddress, formData.supply);
      
      const deployToast = toast.loading("Deploying to blockchain. Please wait..."); // 🍞 Blockchain spinner!

      await contract.waitForDeployment();
      deployedAddress = await contract.getAddress(); 
      
      toast.success(`Token deployed successfully!`, { id: deployToast }); // 🍞 Replaces spinner on success

      // --- DATABASE SAVING ---
      try {
        const response = await fetch('http://localhost:5000/api/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name, symbol: formData.symbol,
            contractAddress: deployedAddress, ownerAddress: formData.ownerAddress, network: 'Sepolia'
          })
        });

        if (response.ok) {
          toast.success("Saved to Dashboard Registry!", { icon: '☁️' });
        }
      } catch (error) {
        toast.error("Failed to save to database.");
      }

      return deployedAddress;

    } catch (err) {
      console.error(err);
      toast.error("Deployment failed. Do you have enough Sepolia ETH?");
    } finally {
      setIsDeploying(false); 
    }
  };

  return { formData, setFormData, generatedCode, connectWallet, generateContract, deployContract, isDeploying };
};