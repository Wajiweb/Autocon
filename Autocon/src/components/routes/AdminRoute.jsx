import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminRoute({ children }) {
    const { isAdmin, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
                <div className="spinner spinner-md" />
                <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>Checking permissions...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin) {
        toast.error('Access denied. Admin privileges required.');
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
