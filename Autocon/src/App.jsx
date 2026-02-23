import { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    axios.get('http://localhost:5000/api/health')
      .then(res => setStatus(res.data.message))
      .catch(err => setStatus("Error: Backend not connected"));
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* ⬅️ SIDEBAR */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        {/* Logo Area */}
        <div className="p-6 text-2xl font-bold border-b border-slate-700 flex items-center gap-2">
          <span className="text-cyan-400">⚡</span> AutoCon
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 text-sm font-medium">
          <button className="w-full text-left px-4 py-3 bg-cyan-600 text-white rounded-lg shadow-md">
            Dashboard
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
            Token Generator
          </button>
          <button className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-all">
            NFT Generator
          </button>
        </nav>

        {/* Server Status Indicator */}
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.includes("Alive") ? "bg-green-500" : "bg-red-500"}`}></div>
          Server: {status.includes("Alive") ? "Online" : "Offline"}
        </div>
      </div>

      {/* ➡️ MAIN CONTENT AREA */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, Developer!</h1>
          <p className="text-slate-500 mt-1">Here is your AutoCon workspace overview.</p>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-semibold mb-1">Total Contracts</h3>
            <p className="text-3xl font-bold text-slate-800">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-semibold mb-1">Network</h3>
            <p className="text-3xl font-bold text-slate-800">Sepolia</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-slate-500 text-sm font-semibold mb-1">System Status</h3>
            <p className="text-sm font-medium text-green-600 mt-2">{status}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;