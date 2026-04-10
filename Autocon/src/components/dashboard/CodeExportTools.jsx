import toast from 'react-hot-toast';

/**
 * CodeExportTools — Adds "Copy", "Open in Remix", and "Download as .sol" buttons
 * to any code preview section.
 * 
 * Props:
 *   - code: string — the Solidity source code
 *   - contractName: string — used for filename
 */
export default function CodeExportTools({ code, contractName = 'Contract' }) {
    if (!code) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast.success('Copied to clipboard!');
    };

    const openInRemix = () => {
        // Remix IDE accepts base64-encoded code via URL
        const encoded = btoa(unescape(encodeURIComponent(code)));
        const remixUrl = `https://remix.ethereum.org/#code=${encoded}&lang=file-sol-registry`;
        window.open(remixUrl, '_blank');
        toast.success('Opening Remix IDE...');
    };

    const downloadSol = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractName.replace(/\s+/g, '')}.sol`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded .sol file!');
    };

    const downloadHardhat = () => {
        // Generate a Hardhat-compatible deployment script alongside the contract
        const deployScript = `const hre = require("hardhat");

async function main() {
  const Contract = await hre.ethers.getContractFactory("${contractName.replace(/\s+/g, '')}");
  
  // Update constructor arguments as needed
  const contract = await Contract.deploy(/* constructor args */);
  await contract.waitForDeployment();
  
  console.log("${contractName} deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`;

        const content = `// ─── ${contractName} ───\n// Place this file in: contracts/${contractName.replace(/\s+/g, '')}.sol\n// Deploy script below goes in: scripts/deploy.js\n\n// ═══════════════════ CONTRACT ═══════════════════\n\n${code}\n\n// ═══════════════════ DEPLOY SCRIPT (scripts/deploy.js) ═══════════════════\n/*\n${deployScript}\n*/`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractName.replace(/\s+/g, '')}_hardhat.sol`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Hardhat bundle downloaded!');
    };

    return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={copyToClipboard} style={btnStyle}>📋 Copy</button>
            <button onClick={downloadSol} style={btnStyle}>💾 .sol</button>
            <button onClick={downloadHardhat} style={{ ...btnStyle, background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}>
                🔧 Hardhat
            </button>
            <button onClick={openInRemix} style={{ ...btnStyle, background: 'rgba(139,92,246,0.08)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.15)' }}>
                🔗 Remix IDE
            </button>
        </div>
    );
}

const btnStyle = {
    padding: '5px 12px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-input)', color: 'var(--text-muted)',
    fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', gap: '4px',
    transition: 'all 0.2s ease'
};
