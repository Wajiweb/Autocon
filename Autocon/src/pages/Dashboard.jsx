import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [deployments, setDeployments] = useState([]);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    // This function automatically runs when the Dashboard loads
    const fetchMyTokens = async () => {
      try {
        // 1. See if MetaMask is connected
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts.length > 0) {
            const myAddress = accounts[0];
            setWallet(myAddress);

            // 2. Ask our Node.js backend for this wallet's tokens!
            const response = await fetch(`http://localhost:5000/api/my-tokens/${myAddress}`);
            const data = await response.json();

            if (data.success) {
              setDeployments(data.tokens); // 3. Save them to the table!
            }
          }
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      }
    };

    fetchMyTokens();
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Executive Overview</h1>
        <p className="text-slate-500 mt-2 text-lg">Real-time monitoring of your blockchain assets.</p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Assets</p>
          <p className="text-3xl font-black text-slate-900">{deployments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Network</p>
          <p className="text-3xl font-black text-cyan-600 font-mono">Sepolia</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <p className="text-3xl font-black text-green-500">Database Connected</p>
        </div>
      </div>

      {/* PROFESSIONAL DEPLOYMENT TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Deployment Registry</h2>
          <span className="text-xs bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-bold">
            {wallet ? `Connected: ${wallet.substring(0,6)}...` : 'Wallet Disconnected'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-50">
                <th className="px-8 py-4 font-bold">Token Identity</th>
                <th className="px-8 py-4 font-bold">Contract Address</th>
                <th className="px-8 py-4 font-bold">Timestamp</th>
                <th className="px-8 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {deployments.length > 0 ? deployments.map((token) => (
                <tr key={token._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan-100 text-cyan-700 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                        {token.symbol.substring(0,3)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{token.name}</p>
                        <p className="text-xs text-slate-400">{token.network} Network</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-500">
                    {token.contractAddress.substring(0, 8)}...{token.contractAddress.substring(36)}
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-500">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => navigator.clipboard.writeText(token.contractAddress)}
                      className="text-slate-500 hover:text-slate-700 font-bold text-xs bg-slate-100 px-3 py-2 rounded-lg transition-all"
                    >
                      Copy
                    </button>
                    <a 
                      href={`https://sepolia.etherscan.io/address/${token.contractAddress}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-600 hover:text-cyan-700 font-bold text-xs bg-cyan-50 px-4 py-2 rounded-lg transition-all"
                    >
                      Explorer ↗
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center text-slate-400 italic">
                    {wallet ? 'No deployments found for this wallet.' : 'Please connect MetaMask to view your tokens.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}