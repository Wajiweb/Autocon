import { useWeb3 } from '../hooks/useWeb3';

export default function TokenGenerator() {
  const { formData, setFormData, generatedCode, connectWallet, generateContract, deployContract } = useWeb3();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <h1 className="text-3xl font-bold mb-6">ERC-20 Generator</h1>
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <form onSubmit={generateContract} className="space-y-6">
          {/* Reuse the form UI we built yesterday here */}
          <div>
            <label className="block text-sm font-bold mb-2">Token Name</label>
            <input name="name" className="w-full p-3 bg-gray-50 border rounded-lg" onChange={handleChange} required />
          </div>
          
          <div className="flex gap-4">
             <input name="symbol" placeholder="Symbol" className="flex-1 p-3 border rounded-lg" onChange={handleChange} />
             <input name="supply" type="number" className="flex-1 p-3 border rounded-lg" onChange={handleChange} value={formData.supply} />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Owner Address</label>
            <div className="flex gap-2">
              <input name="ownerAddress" value={formData.ownerAddress} className="flex-1 p-3 border rounded-lg font-mono text-sm" readOnly />
              <button type="button" onClick={connectWallet} className="bg-orange-500 text-white px-4 py-2 rounded-lg">Connect 🦊</button>
            </div>
          </div>

          <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold">Generate Code</button>
        <button 
  onClick={deployContract}
  disabled={!generatedCode} // This will grey out the button until code exists
  className={`mt-6 w-full font-black py-4 rounded-2xl transition-all ${
    !generatedCode 
      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
      : 'bg-white text-slate-900 hover:bg-cyan-400 hover:text-white transform hover:-translate-y-1'
  }`}
>
  DEPLOY TO SEPOLIA 🚀
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