import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; // Make sure you ran 'npm install ethers'

export const useWeb3 = () => {
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
      // 1. Save the text for the preview window
      setGeneratedCode(res.data.contractCode);
      
      // 2. Save the ABI and Bytecode for the deployment logic
      setContractData({ 
        abi: res.data.abi, 
        bytecode: res.data.bytecode 
      });

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
      // 1. Connect to MetaMask as a Provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
    if (network.chainId !== 11155111n) { // 11155111 is the ID for Sepolia
      return alert("Please switch your MetaMask to the Sepolia Test Network!");
    }
    const signer = await provider.getSigner();
    const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);
      
      // 2. Create the Contract Factory
     
      
      alert("Confirm the transaction in MetaMask to deploy to Sepolia.");

      // 3. Deploy (Passing the constructor arguments)
      const contract = await factory.deploy(formData.ownerAddress, formData.supply);
      
      console.log("Deployment Sent! Hash:", contract.deploymentTransaction().hash);
      
      // 4. Wait for the block to be mined
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      alert(`🚀 SUCCESS! Token deployed at: ${address}`);
      return address;
    } catch (err) {
      console.error(err);
      alert("Deployment failed. Do you have enough Sepolia ETH?");
    }
  };

  return { formData, setFormData, generatedCode, connectWallet, generateContract, deployContract };
};