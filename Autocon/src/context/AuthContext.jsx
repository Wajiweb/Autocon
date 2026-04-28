import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('autocon_token'));
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    const logout = useCallback(() => {
        localStorage.removeItem('autocon_token');
        setToken(null);
        setUser(null);
    }, []);

    const parseAuthResponse = async (response, fallbackMessage) => {
        let payload = {};

        try {
            payload = await response.json();
        } catch {
            // Use the fallback message for empty or non-JSON error responses.
        }

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || payload.error || fallbackMessage);
        }

        return payload.data;
    };

    const authRequest = async (url, options, fallbackMessage) => {
        try {
            return await fetch(url, options);
        } catch (err) {
            if (err instanceof TypeError) {
                throw new Error(`${fallbackMessage} Check that the backend is running and this app origin is allowed by CORS.`);
            }
            throw err;
        }
    };

    // Helper: fetch with auth header
    const authFetch = useCallback(async (url, options = {}) => {
        const currentToken = localStorage.getItem('autocon_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
            ...(options.headers || {})
        };
        const response = await fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, {
            ...options,
            headers
        });

        // If token expired, force logout
        if (response.status === 401) {
            logout();
            throw new Error('Session expired. Please sign in again.');
        }

        return response;
    }, [logout]);

    // Check existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const savedToken = localStorage.getItem('autocon_token');
            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${savedToken}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.data.user);
                    setToken(savedToken);
                } else {
                    localStorage.removeItem('autocon_token');
                    setToken(null);
                }
            } catch {
                localStorage.removeItem('autocon_token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    // MetaMask account changes invalidate the current app session.
    useEffect(() => {
        if (!window.ethereum) return;
        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                logout();
            } else if (user && accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
                logout();
            }
        };
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }, [logout, user]);

    const authenticateWithWallet = useCallback(async (mode) => {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install it to continue.');
        }

        if (!['login', 'signup'].includes(mode)) {
            throw new Error('Invalid authentication mode.');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts?.length) {
            throw new Error('No wallet account selected.');
        }

        const walletAddress = accounts[0];

        const nonceRes = await authRequest(
            `${API_BASE}/api/auth/nonce`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, mode })
            },
            'Failed to reach the authentication server.'
        );
        const nonceData = await parseAuthResponse(nonceRes, 'Failed to get authentication nonce.');

        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(nonceData.message);

        const authRes = await authRequest(
            `${API_BASE}/api/auth/${mode}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, signature })
            },
            'Failed to reach the authentication server.'
        );
        const authData = await parseAuthResponse(
            authRes,
            mode === 'signup' ? 'Failed to create account.' : 'Failed to sign in.'
        );

        localStorage.setItem('autocon_token', authData.token);
        setToken(authData.token);
        setUser(authData.user);

        return authData.user;
    }, []);

    const login = useCallback(() => authenticateWithWallet('login'), [authenticateWithWallet]);
    const signup = useCallback(() => authenticateWithWallet('signup'), [authenticateWithWallet]);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, signup, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
