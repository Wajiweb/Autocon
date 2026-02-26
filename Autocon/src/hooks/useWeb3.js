import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

export const useWeb3 = () => { // 🐛 FIX 1: Removed 'async' from here!
  const [formData, setFormData] = useState({
    name: '', symbol: '', supply: '1000000', ownerAddress: ''
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [contractData, setContractData] = useState({ abi: null, bytecode: null });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData(prev => ({ ...prev, ownerAddress: accounts[0] }));
      } catch (err) { alert("Wallet connection failed."); }
    } else { alert("Install MetaMask!"); }
  };

  const generateContract = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/generate-token', formData);
      
      if (res.data.success) {
        setGeneratedCode(res.data.contractCode);
        setContractData({ abi: res.data.abi, bytecode: res.data.bytecode });
        alert("Contract Compiled & Ready for Deployment! 🚀");
      }
    } catch (err) {
      console.error("Generation Error:", err);
      alert("Backend error. Make sure server is running.");
    }
  };

  const deployContract = async () => {
    if (!contractData.abi || !contractData.bytecode) return alert("Generate code first!");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        return alert("Please switch your MetaMask to the Sepolia Test Network!");
      }
      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);
      
      alert("Confirm the transaction in MetaMask to deploy to Sepolia.");

      const contract = await factory.deploy(formData.ownerAddress, formData.supply);
      console.log("Deployment Sent! Hash:", contract.deploymentTransaction().hash);
      
      await contract.waitForDeployment();
      
      // 🐛 FIX 2: We get the address here and immediately use it to save to the database!
      const address = await contract.getAddress(); 
      alert(`🚀 SUCCESS! Token deployed at: ${address}`);

      // --- SAVE TO DATABASE ---
      try {
        const response = await fetch('http://localhost:5000/api/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            symbol: formData.symbol,
            contractAddress: address, // Saved directly from the blockchain
            ownerAddress: formData.ownerAddress,
            network: 'Sepolia'
          })
        });

        if (response.ok) {
          console.log("✅ Token successfully saved to MongoDB Atlas!");
        }
      } catch (error) {
        console.error("❌ Failed to save to database:", error);
      }
      // ------------------------

      return address;
    } catch (err) {
      console.error(err);
      alert("Deployment failed. Do you have enough Sepolia ETH?");
    }
  };

  return { formData, setFormData, generatedCode, connectWallet, generateContract, deployContract };
};