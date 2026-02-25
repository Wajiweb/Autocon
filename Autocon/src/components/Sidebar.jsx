export default function Sidebar({ activeTab, setActiveTab, status }) {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        <span className="text-cyan-400">⚡</span> AutoCon
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-cyan-600' : 'hover:bg-slate-800'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('token')}
          className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'token' ? 'bg-cyan-600' : 'hover:bg-slate-800'}`}
        >
          Token Generator
        </button>
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs">
        Server: {status.includes("Alive") ? "Online" : "Offline"}
      </div>
    </div>
  );
}