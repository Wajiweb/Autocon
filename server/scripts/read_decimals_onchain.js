'use strict';
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const contractAddress = '0x3Db608F17651Cf9329f84f0A0a2fdf8be111737e';
const rpcUrl = 'https://ethereum-sepolia.publicnode.com'; // Sepolia public RPC

const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
];

async function checkOnChain() {
    console.log(`📡 Connecting to Sepolia via ${rpcUrl}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check if code exists at this address
    console.log(`🔍 Checking code at address: ${contractAddress}`);
    const code = await provider.getCode(contractAddress);
    if (code === '0x' || code === '') {
        console.log('❌ NO CONTRACT CODE FOUND AT THIS ADDRESS ON SEPOLIA!');
        console.log('This means the contract is NOT deployed on Sepolia, or was deployed on a different network.');
        await mongoose.disconnect();
        return;
    }
    
    console.log('✅ Contract code exists!');
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        console.log(`\n🎉 Success! Retrieved details from Sepolia on-chain:`);
        console.log(`📌 Name: ${name}`);
        console.log(`🔤 Symbol: ${symbol}`);
        console.log(`🔢 Decimals: ${decimals}`);
        console.log(`📦 Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
    } catch (err) {
        console.error('❌ Failed to call contract functions:', err.message);
    }
}

checkOnChain().catch(console.error);
