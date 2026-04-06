/**
 * useVerification — React hook for submitting and tracking Etherscan verification.
 * Calls the existing backend /api/verify route which now polls server-side.
 */
import { useState } from 'react';
import { ethers } from 'ethers';

export function useVerification() {
  const [status,  setStatus]  = useState('idle'); // idle | submitting | pass | fail | timeout
  const [reason,  setReason]  = useState(null);

  const verify = async ({
    contractAddress,
    contractName,
    sourceCode,
    compilerVersion,
    abi,
    constructorArgs,
    network = 'sepolia'
  }) => {
    setStatus('submitting');
    setReason(null);

    try {
      // ABI-encode constructor args if provided
      let encodedArgs = '';
      if (constructorArgs?.length && abi) {
        const iface   = new ethers.Interface(abi);
        const encoded = iface.encodeDeploy(constructorArgs);
        encodedArgs   = encoded.startsWith('0x') ? encoded.slice(2) : encoded;
      }

      const token = localStorage.getItem('token'); // AuthContext JWT
      const res   = await fetch('/api/verify', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          contractAddress,
          sourceCode,
          contractName,
          compilerVersion: compilerVersion || 'v0.8.20+commit.a1b79de6',
          network,
          constructorArguements: encodedArgs
        })
      });

      const data = await res.json();

      if (data.success) {
        // Backend returns guid — treat as submitted (pass state from receipt later)
        setStatus('pass');
      } else {
        setStatus('fail');
        setReason(data.error || 'Verification failed.');
      }
    } catch (err) {
      setStatus('fail');
      setReason(err.message);
    }
  };

  return { status, reason, verify };
}
