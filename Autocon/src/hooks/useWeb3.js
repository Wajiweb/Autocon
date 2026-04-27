import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { fireConfetti } from '../utils/confetti';
import { classifyError, deployWithTimeout } from '../utils/classifyError';
import { useWallet } from './useWallet';
import { useContractStore } from '../store/useContractStore';
import { useTransactionStore, selectIsDeploying } from '../store/useTransactionStore';

export const useWeb3 = () => {
  const { authFetch } = useAuth();
  const { network } = useNetwork();
  const location = useLocation();
  const prefill = location.state?.prefill || {};
  const [formData, setFormData] = useState({
    name: prefill.name || '', symbol: prefill.symbol || '',
    supply: prefill.supply || '1000000', ownerAddress: ''
  });
  const { generatedCode, setGeneratedCode, isEditingEnabled, contractData, setContractData } = useContractStore();
  const { resetTransaction, setStatus, setTxHash, setConfirmed, setError, setNetwork, setStep, setErrorStep } = useTransactionStore();
  const txInFlight = useTransactionStore(selectIsDeploying);
  const [ast, setAst] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);

  const { connectWallet: baseConnectWallet } = useWallet();

  const connectWallet = async () => {
    const address = await baseConnectWallet();
    if (address) {
      setFormData(prev => ({ ...prev, ownerAddress: address }));
    }
  };

  const generateContract = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Compiling smart contract...");

    try {
      const res = await authFetch('/api/token/generate-token', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success && data.data) {
        setGeneratedCode(data.data.contractCode, 'Token', { abi: data.data.abi, bytecode: data.data.bytecode });
        setAst(data.data.ast ?? null);
        toast.success("Contract Compiled & Ready! 🚀", { id: loadingToast });
        await calculateGas(data.data.abi, data.data.bytecode); // ⛽ Fetch dynamic estimate
      } else {
        toast.error(data.error || "Compilation failed.", { id: loadingToast });
      }
    } catch (err) {
      const msg = err.message || "Backend error. Make sure server is running.";
      toast.error(msg, { id: loadingToast });
    }
  };

  // --- NEW: Dynamic Backend Gas Estimator ---
  const calculateGas = async (abiToUse, bytecodeToUse) => {
    if (!abiToUse || !bytecodeToUse) return;
    try {
      // We pass the actual constructor arguments needed by the ERC20 template
      const res = await authFetch('/api/estimate-gas', {
        method: 'POST',
        body: JSON.stringify({
          abi: abiToUse,
          bytecode: bytecodeToUse,
          ownerAddress: formData.ownerAddress,
          constructorArgs: [formData.ownerAddress, formData.supply],
          network: network.name
        })
      });
      const data = await res.json();
      if (data.success && data.estimatedCostEth) {
        setEstimatedCost(parseFloat(data.estimatedCostEth).toFixed(4));
      }
    } catch {
      // Non-critical — gas estimate failure is silently skipped
    }
  };

  const deployContract = async () => {
    if (!contractData?.abi || !contractData?.bytecode) return toast.error("Generate code first!");
    if (!generatedCode || !generatedCode.trim()) return toast.error("Contract code is empty. Generate first.");
    if (txInFlight) return; // Prevent duplicate deploy clicks

    // Reset tx store before every new deploy
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
          body: JSON.stringify({ sourceCode: generatedCode, contractName: formData.name.replace(/\s+/g, '') || 'TokenContract' })
        });
        const compData = await compRes.json();
        if (!compData.success) {
          setErrorStep(-1, "Compilation Failed: " + compData.error);
          return toast.error("Compilation Failed: " + compData.error, { id: 'recompile' });
        }
        finalAbi = compData.abi;
        finalBytecode = compData.bytecode;
        setContractData({ abi: finalAbi, bytecode: finalBytecode });
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

      setStep(1); // Step 1: Awaiting wallet signature
      setStatus('pending');
      toast('Confirm transaction in MetaMask 🦊', { icon: '👆' });

      const contract = await deployWithTimeout(() => factory.deploy(formData.ownerAddress, formData.supply));

      // Tx submitted — capture hash immediately
      const submittedHash = contract.deploymentTransaction()?.hash;
      if (submittedHash) setTxHash(submittedHash);

      setStep(2); // Step 2: Broadcasting transaction
      const deployToast = toast.loading(`Deploying to ${network.name}...`);

      setStep(3); // Step 3: Waiting for block confirmation
      await contract.waitForDeployment();
      const receipt = await contract.deploymentTransaction().wait();
      deployed = await contract.getAddress();

      setStep(4); // Step 4: Deployment successful!
      setConfirmed(deployed, receipt, provider);
      toast.success(`Token deployed on ${network.name}!`, { id: deployToast });
      fireConfetti();

      // Save to database via authenticated endpoint
      try {
        const saveRes = await authFetch('/api/token/save-token', {
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
            constructorArguments: encodedArgs
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          toast.success("Etherscan Verification Submitted! ✅", { id: verifyToast });
        } else {
          toast.error("Etherscan verification failed: " + (verifyData.error || 'Unknown error'), { id: verifyToast });
        }
      } catch {
        toast.error("Failed to request Etherscan verification.");
      }

      // Reset form after successful deployment
      setFormData(prev => ({ ...prev, name: '', symbol: '', supply: '1000000' }));
      setGeneratedCode('');
      setEstimatedCost(null);

      // Show success modal
      setShowSuccessModal(true);

      return deployed;

    } catch (err) {
      console.error('[useWeb3] deploy:', err.message);
      const message = classifyError(err);
      const currentStep = useTransactionStore.getState().step;
      setErrorStep(currentStep >= 0 ? currentStep : 0, message);
      toast.error(message);
    } finally {
      // Reset deploy step after a delay so user sees "complete" or error state
      setTimeout(() => { setStep(-1); setErrorStep(-1, ''); }, 3000);
    }
  };

  return {
    formData, setFormData, generatedCode, contractData, ast,
    connectWallet, generateContract, deployContract,
    estimatedCost,
    showSuccessModal, setShowSuccessModal
  };
};