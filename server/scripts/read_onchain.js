const { ethers } = require('ethers');

async function main() {
  const rpc = 'https://ethereum-sepolia-rpc.publicnode.com';
  const address = '0xac19286905aee0ba87534db03cdfda7f2391c644';
  const abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];
  
  const provider = new ethers.JsonRpcProvider(rpc);
  const contract = new ethers.Contract(address, abi, provider);
  
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply()
    ]);
    
    console.log('Contract Details:');
    console.log('Name:', name);
    console.log('Symbol:', symbol);
    console.log('Decimals:', decimals.toString());
    console.log('Total Supply (raw):', totalSupply.toString());
    console.log('Total Supply (formatted):', ethers.formatUnits(totalSupply, decimals));
  } catch (e) {
    console.error('Error reading contract:', e);
  }
}

main();
