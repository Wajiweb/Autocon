import JSZip from 'jszip';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

/**
 * Utility for exporting a single contract (PDF, CSV, Sol, ABI, ZIP)
 */

export const downloadSol = (contractName, generatedCode) => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contractName.replace(/\s+/g, '')}.sol`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded .sol file!');
};

export const downloadABI = (contractName, abi) => {
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
};

export const downloadMetadataTemplate = (contractName, nftMetadata) => {
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
};

export const downloadHardhat = async (contractName, generatedCode) => {
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
    } catch (error) {
        console.error("Zip Error:", error);
        toast.error('Failed to generate Hardhat project');
    }
};

export const downloadSingleContractPDF = ({ contractName, contractType, network, contractAddress, explorerUrl, generatedCode }) => {
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
    } catch(e) {
        console.error(e);
        toast.error("Failed to generate PDF");
    }
};

/**
 * Utility for exporting dashboard deployments
 */
export const exportDeploymentsCSV = (deployments) => {
    if (!deployments || !deployments.length) return toast.error('No deployments to export.');
    const headers = ['Name', 'Symbol', 'Type', 'Contract Address', 'Network', 'Date'];
    const rows = deployments.map(d => [d.name, d.symbol || '', d._type, d.contractAddress, d.network || 'Sepolia', new Date(d.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `autocon_${Date.now()}.csv` });
    a.click();
    toast.success('CSV exported!');
};

export const exportDeploymentsPDF = (deployments, walletAddress) => {
    if (!deployments || !deployments.length) return toast.error('No deployments to export.');
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>AutoCon Report</title>
      <style>body{font-family:sans-serif;padding:32px;color:#e2e8f0;background:#0f172a}h1{color:#5da9e9}table{width:100%;border-collapse:collapse}th,td{padding:10px;border:1px solid #1e293b;text-align:left}th{background:#1e293b;color:#94a3b8;font-size:12px}td{font-size:13px;color:#cbd5e1}</style></head>
      <body><h1>AutoCon Deployment Report</h1><p>Wallet: ${walletAddress || 'Unknown'}</p><p>Generated: ${new Date().toLocaleString()}</p>
      <table><tr>${['Name','Type','Address','Network','Date'].map(h=>`<th>${h}</th>`).join('')}</tr>
      ${deployments.map(d=>`<tr><td>${d.name}</td><td>${d._type}</td><td style="font-family:monospace;font-size:11px">${d.contractAddress}</td><td>${d.network||'Sepolia'}</td><td>${new Date(d.createdAt).toLocaleDateString()}</td></tr>`).join('')}
      </table></body></html>`);
    w.document.close(); 
    w.print();
    toast.success('PDF report generated!');
};
