import { useWeb3 } from '../hooks/useWeb3';
import { Toaster } from 'react-hot-toast';

export default function TokenGenerator() {
  // We added `isDeploying` to this line so the UI knows when to spin!
  const { formData, setFormData, generatedCode, connectWallet, generateContract, deployContract, isDeploying } = useWeb3();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
    <Toaster position="bottom-right" reverseOrder={false} /> {/* 🍞 THIS RENDERS THE POPUPS */}
      <h1 className="text-3xl font-bold mb-6">ERC-20 Generator</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <form onSubmit={generateContract} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold mb-2">Token Name</label>
            <input name="name" className="w-full p-3 bg-gray-50 border rounded-lg" onChange={handleChange} required />
          </div>
          
          <div className="flex gap-4">
             <input name="symbol" placeholder="Symbol" className="flex-1 p-3 border rounded-lg" onChange={handleChange} required />
             <input name="supply" type="number" className="flex-1 p-3 border rounded-lg" onChange={handleChange} value={formData?.supply || ''} required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Owner Address</label>
            <div className="flex gap-2">
              <input name="ownerAddress" value={formData?.ownerAddress || ''} className="flex-1 p-3 border rounded-lg font-mono text-sm" readOnly />
              <button type="button" onClick={connectWallet} className="bg-orange-500 text-white px-4 py-2 rounded-lg">Connect 🦊</button>
            </div>
          </div>

          <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold">Generate Code</button>
        
          {/* THE UPDATED BUTTON WITH THE LOADING ANIMATION */}
          <button 
            type="button"
            onClick={deployContract}
            disabled={!generatedCode || isDeploying} 
            className={`mt-6 w-full font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 ${
              (!generatedCode || isDeploying)
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-white text-slate-900 hover:bg-cyan-400 hover:text-white transform hover:-translate-y-1 shadow-sm'
            }`}
          >
            {isDeploying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                DEPLOYING TO BLOCKCHAIN...
              </>
            ) : (
              'DEPLOY TO SEPOLIA 🚀'
            )}
          </button>
        </form>
      </div>

      {generatedCode && (
        <div className="mt-8 bg-slate-900 p-6 rounded-xl border border-slate-700">
          <pre className="text-cyan-400 text-xs overflow-x-auto"><code>{generatedCode}</code></pre>
        </div>
      )}
    </div>
  );
}