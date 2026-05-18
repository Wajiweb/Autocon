const { ethers } = require('ethers');

/**
 * BlockchainService - Manages blockchain RPC connections with automatic fallback
 * 
 * Features:
 * - Primary and fallback RPC URLs for each network
 * - Automatic failover if primary RPC fails
 * - Connection health monitoring
 * - Graceful degradation
 */
class BlockchainService {
  constructor() {
    // RPC configuration with fallbacks
    this.rpcConfig = {
      sepolia: {
        name: 'Ethereum Sepolia',
        chainId: 11155111,
        primary: process.env.SEPOLIA_RPC_URL,
        fallbacks: [
          'https://rpc.sepolia.org',
          'https://ethereum-sepolia.publicnode.com',
          'https://sepolia.drpc.org'
        ]
      },
      amoy: {
        name: 'Polygon Amoy',
        chainId: 80002,
        primary: process.env.AMOY_RPC_URL,
        fallbacks: [
          'https://rpc-amoy.polygon.technology',
          'https://polygon-amoy.drpc.org'
        ]
      },
      bnbTestnet: {
        name: 'BNB Smart Chain Testnet',
        chainId: 97,
        primary: process.env.BNB_TESTNET_RPC_URL,
        fallbacks: [
          'https://data-seed-prebsc-2-s1.binance.org:8545',
          'https://bsc-testnet.drpc.org'
        ]
      }
    };

    // Provider cache
    this.providers = {};
    this.currentRpc = {};
    this.healthStatus = {};
  }

  /**
   * Get or create a provider for the specified network
   * @param {string} network - Network name ('sepolia', 'amoy', 'bnbTestnet')
   * @returns {ethers.JsonRpcProvider}
   */
  async getProvider(network = 'sepolia') {
    const config = this.rpcConfig[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Return cached provider if it exists and is healthy
    if (this.providers[network]) {
      try {
        await this.providers[network].getNetwork();
        return this.providers[network];
      } catch (err) {
        console.warn(`Provider for ${network} is unhealthy, recreating...`);
        delete this.providers[network];
      }
    }

    // Try primary RPC first
    try {
      const provider = new ethers.JsonRpcProvider(config.primary, {
        chainId: config.chainId,
        name: config.name
      });
      await provider.getNetwork();
      
      this.providers[network] = provider;
      this.currentRpc[network] = 'primary';
      this.healthStatus[network] = { status: 'healthy', rpc: 'primary' };
      
      console.log(`✅ Connected to ${config.name} (primary RPC)`);
      return provider;
    } catch (err) {
      console.warn(`Primary RPC failed for ${network}: ${err.message}`);
    }

    // Try fallback RPCs
    for (let i = 0; i < config.fallbacks.length; i++) {
      const fallbackUrl = config.fallbacks[i];
      try {
        const provider = new ethers.JsonRpcProvider(fallbackUrl, {
          chainId: config.chainId,
          name: config.name
        });
        await provider.getNetwork();
        
        this.providers[network] = provider;
        this.currentRpc[network] = `fallback-${i + 1}`;
        this.healthStatus[network] = { 
          status: 'degraded', 
          rpc: `fallback-${i + 1}`,
          message: 'Using fallback RPC'
        };
        
        console.log(`⚠️  Connected to ${config.name} (fallback RPC ${i + 1})`);
        return provider;
      } catch (err) {
        console.warn(`Fallback ${i + 1} failed for ${network}: ${err.message}`);
      }
    }

    // All RPCs failed
    this.healthStatus[network] = { 
      status: 'error', 
      message: 'All RPC endpoints failed'
    };
    throw new Error(`Failed to connect to ${config.name}. All RPC endpoints are unavailable.`);
  }

  /**
   * Get provider health status
   * @param {string} network - Network name
   * @returns {object} Health status
   */
  getHealthStatus(network = 'sepolia') {
    return this.healthStatus[network] || { status: 'unknown' };
  }

  /**
   * Get all network health statuses
   * @returns {object} All health statuses
   */
  getAllHealthStatuses() {
    const statuses = {};
    for (const network of Object.keys(this.rpcConfig)) {
      statuses[network] = this.getHealthStatus(network);
    }
    return statuses;
  }

  /**
   * Reset provider for a network (force reconnection)
   * @param {string} network - Network name
   */
  resetProvider(network) {
    delete this.providers[network];
    delete this.currentRpc[network];
    console.log(`🔄 Reset provider for ${network}`);
  }

  /**
   * Get network configuration
   * @param {string} network - Network name
   * @returns {object} Network config
   */
  getNetworkConfig(network) {
    return this.rpcConfig[network];
  }

  /**
   * Get list of supported networks
   * @returns {string[]} Network names
   */
  getSupportedNetworks() {
    return Object.keys(this.rpcConfig);
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean}
 */
function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Estimate gas for contract deployment
 * @param {object} params - Deployment parameters
 * @returns {object} Gas estimation result
 */
async function estimateGas(params) {
  const { network = 'sepolia' } = params;
  const provider = await blockchainService.getProvider(network);
  
  // Basic gas estimation using provider
  const gasPrice = await provider.getFeeData();
  const estimatedGas = 3000000; // Default estimate for contract deployment
  
  return {
    estimatedGas,
    gasPrice: gasPrice.gasPrice?.toString() || '0',
    maxFeePerGas: gasPrice.maxFeePerGas?.toString() || '0',
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString() || '0',
    estimatedCost: '0.001', // Placeholder in ETH
    network,
  };
}

module.exports = {
  getProvider: blockchainService.getProvider.bind(blockchainService),
  getHealthStatus: blockchainService.getHealthStatus.bind(blockchainService),
  getAllHealthStatuses: blockchainService.getAllHealthStatuses.bind(blockchainService),
  resetProvider: blockchainService.resetProvider.bind(blockchainService),
  getNetworkConfig: blockchainService.getNetworkConfig.bind(blockchainService),
  getSupportedNetworks: blockchainService.getSupportedNetworks.bind(blockchainService),
  isValidAddress,
  estimateGas,
};
