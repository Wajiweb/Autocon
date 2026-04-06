import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { API_BASE } from '../config';
import { fireConfetti } from '../utils/confetti';
import { classifyError, deployWithTimeout } from '../utils/classifyError';

export const useWeb3 = () => {
  const { authFetch } = useAuth();
  const { network } = useNetwork();
  const [formData, setFormData] = useState({
    name: '', symbol: '', supply: '1000000', ownerAddress: ''
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [contractData, setContractData] = useState({ abi: null, bytecode: null });
  const [ast, setAst] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(-1);
  const [deployStepError, setDeployStepError] = useState({ step: -1, message: '' });
  const [deployedAddress, setDeployedAddress] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData(prev => ({ ...prev, ownerAddress: accounts[0] }));
        toast.success("MetaMask Connected!");
      } catch (_err) { toast.error("Wallet connection failed."); }
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
        setAst(data.ast ?? null);
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
    setDeployStep(0); // Step 0: Compiling
    let deployed;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const currentNetwork = await provider.getNetwork();

      if (Number(currentNetwork.chainId) !== network.chainIdDecimal) {
        toast.error(`Please switch MetaMask to ${network.name}!`);
        setIsDeploying(false);
        setDeployStep(-1);
        return;
      }

      const signer = await provider.getSigner();
      const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, signer);

      setDeployStep(1); // Step 1: Awaiting wallet signature
      toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });

      const contract = await deployWithTimeout(() => factory.deploy(formData.ownerAddress, formData.supply));

      setDeployStep(2); // Step 2: Broadcasting transaction
      const deployToast = toast.loading(`Deploying to ${network.name}...`);

      setDeployStep(3); // Step 3: Waiting for block confirmation
      await contract.waitForDeployment();
      deployed = await contract.getAddress();

      setDeployStep(4); // Step 4: Deployment successful!
      toast.success(`Token deployed on ${network.name}!`, { id: deployToast });
      fireConfetti();
      setDeployedAddress(deployed);

      // Save to database via authenticated endpoint
      try {
        const saveRes = await authFetch('/api/save-token', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name, symbol: formData.symbol,
            contractAddress: deployed, ownerAddress: formData.ownerAddress,
            network: network.name,
            abi: contractData.abi
          })
        });

        const saveData = await saveRes.json();
        if (saveData.success) {
          toast.success("Saved to Dashboard Registry!", { icon: '☁️' });
        }
      } catch (_error) {
        toast.error("Failed to save to database.");
      }

      // Verify on Etherscan
      try {
        const verifyToast = toast.loading('Verifying contract on Etherscan...');
        
        // ABI Encode constructor arguments
        const abiCoder = new ethers.AbiCoder();
        // The ERC20 template constructor expects (address initialOwner, uint256 initialSupply)
        // Supply passed to contract is already adjusted for decimals in the template? Wait, the template expects (address initialOwner, uint256 initialSupply)
        const encodedArgs = abiCoder.encode(["address", "uint256"], [formData.ownerAddress, formData.supply]);

        const verifyRes = await authFetch('/api/verify', {
          method: 'POST',
          body: JSON.stringify({
            contractAddress: deployed,
            sourceCode: generatedCode,
            contractName: formData.name.replace(/\s+/g, ''),
            compilerVersion: 'v0.8.20+commit.a1b79de6', // Default compiler version used in AutoCon templates
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
      setFormData(prev => ({ ...prev, name: '', symbol: '', supply: '1000000' }));
      setGeneratedCode('');
      setContractData({ abi: null, bytecode: null });
      setGasEstimate(null);

      // Show success modal
      setShowSuccessModal(true);

      return deployed;

    } catch (err) {
      console.error(err);
      const message = classifyError(err);
      setDeployStepError({ step: deployStep >= 0 ? deployStep : 0, message });
      toast.error(message);
    } finally {
      setIsDeploying(false);
      // Reset deploy step after a delay so user sees "complete" or error state
      setTimeout(() => { setDeployStep(-1); setDeployStepError({ step: -1, message: '' }); }, 3000);
    }
  };

  return {
    formData, setFormData, generatedCode, contractData, ast,
    connectWallet, generateContract, deployContract,
    estimateGas, gasEstimate, isEstimating,
    isDeploying, deployStep, deployStepError,
    deployedAddress, showSuccessModal, setShowSuccessModal
  };
};