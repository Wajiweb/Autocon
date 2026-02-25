export default function Dashboard() {
  const stats = [
    { label: "Total Tokens Created", value: "12", icon: "💎", color: "text-blue-600" },
    { label: "Gas Saved (Est.)", value: "0.45 ETH", icon: "⛽", color: "text-green-600" },
    { label: "Network Status", value: "Sepolia Live", icon: "🌐", color: "text-cyan-600" },
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900">Project Overview</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your automated smart contract deployments.</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="text-3xl bg-slate-50 w-14 h-14 flex items-center justify-center rounded-2xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Recent Deployments</h2>
          <button className="text-cyan-600 font-bold text-sm hover:underline">View All</button>
        </div>
        
        <div className="space-y-4">
          {/* Example Item */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold">WJ</div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Wajirana Token (WJ)</p>
                <p className="text-xs text-slate-400">Deployed 2 hours ago</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Success</span>
          </div>

          <div className="text-center py-10">
            <p className="text-slate-400 text-sm italic">New tokens you create will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}