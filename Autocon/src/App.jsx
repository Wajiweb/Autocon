import { useState } from 'react';
import Sidebar from './components/sidebar';
import TokenGenerator from './pages/TokenGenerator';
import Dashboard from './pages/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} status="Alive" />
      <main className="flex-1 p-10 overflow-y-auto">
  {activeTab === 'dashboard' && <Dashboard />}
  {activeTab === 'token' && <TokenGenerator />}
</main>
    </div>
  );
}

export default App;