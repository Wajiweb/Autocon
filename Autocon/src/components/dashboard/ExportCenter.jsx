import { useState } from 'react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { useContractStore } from '../../store/useContractStore';
import { useNetwork } from '../../context/NetworkContext';
import { useTransactionStore, selectContractUrl } from '../../store/useTransactionStore';

export default function ExportCenter({ contractName = 'Contract', abi = null, nftMetadata = null }) {
    const { generatedCode, isEditingEnabled, contractType } = useContractStore();
    const { network } = useNetwork();
    const contractAddress = useTransactionStore(s => s.contractAddress);
    const explorerUrl = useTransactionStore(selectContractUrl);
    const [isOpen, setIsOpen] = useState(false);

    if (!generatedCode || !isEditingEnabled) return null; // Hidden for beginners

    const openInRemix = () => {
        const encoded = btoa(unescape(encodeURIComponent(generatedCode)));
        const remixUrl = `https://remix.ethereum.org/#code=${encoded}&lang=file-sol-registry`;
        window.open(remixUrl, '_blank');
        toast.success('Opening Remix IDE...');
        setIsOpen(false);
    };

    const downloadSol = () => {
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractName.replace(/\s+/g, '')}.sol`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded .sol file!');
        setIsOpen(false);
    };

    const downloadABI = () => {
        if (!abi) {
            toast.error('ABI not available yet. Please generate the contract first.');
            return;
        }
        const blob = new Blob([JSON.stringify(abi, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractName.replace(/\s+/g, '')}_ABI.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded ABI!');
        setIsOpen(false);
    };

    const downloadHardhat = async () => {
        try {
            const zip = new JSZip();
            const safeName = contractName.replace(/\s+/g, '');
            
            // Hardhat config
            zip.file("hardhat.config.js", `require("@nomicfoundation/hardhat-toolbox");\n\n/** @type import('hardhat/config').HardhatUserConfig */\nmodule.exports = {\n  solidity: "0.8.20",\n};\n`);
            
            // Package.json
            zip.file("package.json", JSON.stringify({
                name: `${safeName.toLowerCase()}-hardhat-project`,
                version: "1.0.0",
                scripts: {
                    "compile": "hardhat compile",
                    "test": "hardhat test",
                    "deploy": "hardhat run scripts/deploy.js"
                },
                devDependencies: {
                    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
                    "hardhat": "^2.19.0"
                }
            }, null, 2));

            // Contract
            zip.file(`contracts/${safeName}.sol`, generatedCode);

            // Deploy Script
            const deployScript = `const hre = require("hardhat");\n\nasync function main() {\n  const Contract = await hre.ethers.getContractFactory("${safeName}");\n  const contract = await Contract.deploy(/* args */);\n  await contract.waitForDeployment();\n  console.log("${safeName} deployed to:", await contract.getAddress());\n}\n\nmain().catch((error) => {\n  console.error(error);\n  process.exitCode = 1;\n});`;
            zip.file("scripts/deploy.js", deployScript);

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeName}_Hardhat.zip`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded Hardhat Project!');
            setIsOpen(false);
        } catch (error) {
            console.error("Zip Error:", error);
            toast.error('Failed to generate Hardhat project');
        }
    };

    const downloadMetadataTemplate = () => {
        const metadata = nftMetadata || {
            name: `${contractName} #1`,
            description: `Auto-generated metadata description for ${contractName}`,
            image: "ipfs://<YOUR_IMAGE_CID>",
            attributes: [
                { trait_type: "Background", value: "Default" },
                { trait_type: "Rarity", value: "Common" }
            ]
        };
        const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractName.replace(/\s+/g, '')}_Metadata.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded Metadata JSON!');
        setIsOpen(false);
    };

    const downloadPDF = () => {
        try {
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129); // Green
            doc.text("AutoCon Smart Contract Report", 14, 20);
            
            // Overview
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("Contract Overview", 14, 35);
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 38, 196, 38);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            doc.text(`Name: ${contractName}`, 14, 46);
            doc.text(`Type: ${contractType || 'Custom Smart Contract'}`, 14, 53);
            doc.text(`Target Network: ${network?.name || 'Ethereum'}`, 14, 60);
            doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 67);

            if (contractAddress) {
                doc.text(`Deployed Address: ${contractAddress}`, 14, 74);
            }
            if (explorerUrl) {
                doc.text(`Explorer URL: ${explorerUrl}`, 14, 81);
            }

            let nextY = contractAddress ? 94 : 82;

            // Usage Instructions
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("Usage Instructions", 14, nextY);
            doc.line(14, nextY + 3, 196, nextY + 3);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            const instructions = [
                "1. Keep this document safe. It contains critical structural info about your contract.",
                "2. If you deploy using Hardhat or Foundry, use the attached ABI.",
                "3. Ensure your wallet is sufficiently funded with native tokens for gas fees.",
                "4. Warning: The source code may contain manual developer edits."
            ];
            doc.text(instructions, 14, nextY + 11);

            nextY += 40;

            // Source Code Snippet
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text("Source Code Snippet", 14, nextY);
            doc.line(14, nextY + 3, 196, nextY + 3);
            doc.setFontSize(8);
            doc.setFont("courier", "normal");
            const codeLines = doc.splitTextToSize(generatedCode.substring(0, 2000) + (generatedCode.length > 2000 ? '\n\n// ... Code truncated for PDF ...' : ''), 180);
            doc.text(codeLines, 14, nextY + 11);

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.setFont("helvetica", "italic");
            doc.text("Generated by AutoCon", 105, 290, null, null, "center");

            doc.save(`${contractName.replace(/\s+/g, '')}_Report.pdf`);
            toast.success('Generated PDF Report! ✅');
            setIsOpen(false);
        } catch(e) {
            console.error(e);
            toast.error("Failed to generate PDF");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            <button 
                onClick={downloadSol}
                className="pg-btn pg-btn-outline" 
                style={{ padding: '4px 10px', fontSize: 11, background: 'var(--bg-input)' }}
                title="Quick download .sol file"
            >
                💾 Download .sol
            </button>
            <div style={{ position: 'relative' }}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="pg-btn pg-btn-outline" 
                    style={{ padding: '4px 10px', fontSize: 11, background: 'var(--bg-input)' }}
                >
                    ⬇️ Export Center {isOpen ? '▲' : '▼'}
                </button>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: '110%', right: 0,
                    background: '#0a0a0f', border: '1px solid var(--border-color)',
                    borderRadius: '8px', padding: '8px', zIndex: 100,
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    minWidth: '200px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                }}>
                    <button onClick={downloadSol} style={menuBtnStyle}>💾 Download .sol</button>
                    <button onClick={downloadABI} style={menuBtnStyle}>📄 Export ABI</button>
                    {contractType === 'NFT' && (
                        <button onClick={downloadMetadataTemplate} style={{...menuBtnStyle, color: '#38bdf8'}}>📝 Download JSON Metadata</button>
                    )}
                    <button onClick={downloadHardhat} style={{...menuBtnStyle, color: '#f59e0b'}}>🔧 Hardhat Project (Zip)</button>
                    <button onClick={downloadPDF} style={{...menuBtnStyle, color: '#ef4444'}}>📊 Export PDF Report</button>
                    <button onClick={openInRemix} style={{...menuBtnStyle, color: '#a78bfa'}}>🔗 Open in Remix</button>
                </div>
            )}
            </div>
        </div>
    );
}

const menuBtnStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '11px',
    padding: '6px 12px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background 0.2s ease',
    width: '100%',
    fontFamily: 'var(--db-font)',
    fontWeight: 600
};
