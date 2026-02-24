import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // --- 1. STATE MANAGEMENT ---
  const [status, setStatus] = useState("Loading...");
  const [activeTab, setActiveTab] = useState('dashboard');
  const [generatedCode, setGeneratedCode] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '1000000',
    ownerAddress: ''
  });

  // --- 2. BACKEND HEALTH CHECK ---
  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(res => setStatus(res.data.message))
      .catch(err => setStatus("Error: Backend not connected"));
  }, []);

  // --- 3. LOGIC FUNCTIONS ---
  
  // Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Connect MetaMask and auto-fill address
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setFormData({ ...formData, ownerAddress: accounts[0] });
      } catch (error) {
        alert("MetaMask connection denied.");
      }
    } else {
      alert("Please install MetaMask extension!");
    }
  };

  // Send data to Node.js backend to get Solidity code
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-token', formData);
      if (response.data.success) {
        setGeneratedCode(response.data.contractCode);
        alert("Contract Generated Successfully!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate contract. Check if your backend is running on port 5000.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900">
      
      {/* ⬅️ SIDEBAR NAVIGATION */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 flex items-center gap-2">
          <span className="text-cyan-400">⚡</span> AutoCon
        </div>
        
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('token')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === 'token' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Token Generator
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.includes("Alive") ? "bg-green-500" : "bg-red-500"}`}></div>
          {status.includes("Alive") ? "System Online" : "System Offline"}
        </div>
      </div>

      {/* ➡️ MAIN CONTENT AREA */}
      <div className="flex-1 p-10 overflow-y-auto">
        
        {/* VIEW 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-bold">Project Overview</h1>
              <p className="text-slate-500 mt-1">Welcome back to your AutoCon workspace.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-semibold">Total Contracts</h3>
                <p className="text-3xl font-bold text-slate-800">0</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-sm font-semibold">Network</h3>
                <p className="text-3xl font-bold text-slate-800">Sepolia Testnet</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TOKEN GENERATOR */}
        {activeTab === 'token' && (
          <div className="animate-in fade-in duration-500">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-800">ERC-20 Generator</h1>
              <p className="text-slate-500 mt-1">Fill in the details to create your custom Smart Contract.</p>
            </header>

            <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <form onSubmit={handleGenerate} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Token Name</label>
                  <input type="text" name="name" placeholder="e.g. Bitcoin" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500" onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Symbol</label>
                    <input type="text" name="symbol" placeholder="BTC" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500" onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Initial Supply</label>
                    <input type="number" name="supply" value={formData.supply} className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-cyan-500" onChange={handleChange} required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Owner Wallet Address</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" name="ownerAddress" value={formData.ownerAddress} 
                      placeholder="0x..." className="flex-1 p-3 bg-slate-50 border rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-cyan-500"
                      onChange={handleChange} required 
                    />
                    <button type="button" onClick={connectWallet} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-all">
                      Connect 🦊
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-4 rounded-xl hover:bg-cyan-700 transition-all shadow-lg">
                  Generate Smart Contract Code
                </button>
              </form>
            </div>

            {/* PREVIEW AREA */}
            {generatedCode && (
              <div className="mt-8 animate-in slide-in-from-bottom-5 duration-700">
                <h3 className="text-slate-800 font-bold mb-4">Generated Solidity Code</h3>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 relative group">
                  <pre className="text-cyan-400 text-xs overflow-x-auto font-mono">
                    <code>{generatedCode}</code>
                  </pre>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(generatedCode); alert("Copied!"); }}
                    className="absolute top-4 right-4 bg-slate-700 text-white px-2 py-1 rounded text-[10px]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;