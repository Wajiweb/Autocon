import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Users, UserCheck, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import '../components/dashboard/styles/dashboard.css';

export default function AdminPage() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, admins: 0, regular: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await authFetch('/api/admin/users?page=1&limit=50');
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
        setStats({
          total: data.data.pagination?.total || 0,
          admins: (data.data.users || []).filter(u => u.role === 'admin').length,
          regular: (data.data.users || []).filter(u => u.role === 'user').length,
        });
      } else {
        toast.error(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (walletAddress, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    setIsUpdating(walletAddress);
    try {
      const res = await authFetch(`/api/admin/users/${walletAddress}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(`User ${action}d successfully`);
        fetchUsers(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      toast.error('Failed to update user role');
    } finally {
      setIsUpdating(null);
    }
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied');
  };

  if (isLoading) {
    return (
      <div className="pg-wrap">
        <div className="pg-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner spinner-md" />
          <p style={{ marginTop: 16, color: 'var(--db-t3)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pg-wrap">
      {/* Header */}
      <div className="pg-card db-enter db-enter-1" style={{ padding: '24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Shield size={24} color="var(--db-acc)" />
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--db-t3)', margin: 0, fontSize: 13 }}>Manage users and system permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="pg-mini-stats cols-3 db-enter db-enter-2" style={{ marginBottom: 16 }}>
        <div className="pg-stat-card">
          <Users size={22} color="var(--db-blue)" strokeWidth={2} />
          <div className="pg-stat-val" style={{ color: 'var(--db-blue)' }}>{stats.total}</div>
          <div className="pg-stat-lbl">Total Users</div>
        </div>
        <div className="pg-stat-card">
          <UserCheck size={22} color="var(--db-acc)" strokeWidth={2} />
          <div className="pg-stat-val" style={{ color: 'var(--db-acc)' }}>{stats.admins}</div>
          <div className="pg-stat-lbl">Admins</div>
        </div>
        <div className="pg-stat-card">
          <Users size={22} color="var(--db-t2)" strokeWidth={2} />
          <div className="pg-stat-val" style={{ color: 'var(--db-t2)' }}>{stats.regular}</div>
          <div className="pg-stat-lbl">Regular Users</div>
        </div>
      </div>

      {/* User List */}
      <div className="pg-card db-enter db-enter-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> User Management
          </h2>
          <button 
            onClick={fetchUsers} 
            className="pg-btn pg-btn-outline"
            style={{ padding: '10px 18px', fontSize: 12 }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh
          </button>
        </div>

        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--db-t3)' }}>
            No users found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--db-br)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--db-t3)', fontWeight: 600 }}>Wallet Address</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--db-t3)', fontWeight: 600 }}>Role</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--db-t3)', fontWeight: 600 }}>Joined</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', color: 'var(--db-t3)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.walletAddress} style={{ borderBottom: '1px solid var(--db-br)' }}>
                    <td style={{ padding: '12px 8px', fontFamily: 'var(--db-mono)', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-6)}</span>
                        <button 
                          onClick={() => copyAddress(user.walletAddress)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--db-t3)' }}
                          title="Copy address"
                        >
                          <Copy size={12} />
                        </button>
                        <a 
                          href={`https://sepolia.etherscan.io/address/${user.walletAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--db-t3)', textDecoration: 'none' }}
                          title="View on Etherscan"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span 
                        style={{ 
                          padding: '4px 10px', 
                          borderRadius: 6, 
                          fontSize: 11, 
                          fontWeight: 600,
                          background: user.role === 'admin' ? 'rgba(143,185,0,0.15)' : 'rgba(100,116,139,0.15)',
                          color: user.role === 'admin' ? 'var(--db-acc)' : 'var(--db-t2)',
                          border: `1px solid ${user.role === 'admin' ? 'rgba(143,185,0,0.3)' : 'rgba(100,116,139,0.3)'}`
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--db-t3)', fontSize: 12 }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleRoleToggle(user.walletAddress, user.role)}
                        disabled={isUpdating === user.walletAddress}
                        className="pg-btn pg-btn-outline"
                        style={{ 
                          padding: '8px 14px', 
                          fontSize: 11,
                          opacity: isUpdating === user.walletAddress ? 0.5 : 1,
                          cursor: isUpdating === user.walletAddress ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUpdating === user.walletAddress ? 'Updating...' : (user.role === 'admin' ? 'Demote' : 'Promote')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
