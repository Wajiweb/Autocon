import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('autocon_token'));
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

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
    }, []);

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
                    setUser(data.user);
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

    // MetaMask Sign-In Flow
    const login = async () => {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed. Please install it to continue.');
        }

        // 1. Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];

        // 2. Get nonce from server
        const nonceRes = await fetch(`${API_BASE}/api/auth/nonce/${walletAddress}`);
        const nonceData = await nonceRes.json();

        if (!nonceData.success) {
            throw new Error(nonceData.error || 'Failed to get nonce.');
        }

        // 3. Sign the nonce message with MetaMask
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(nonceData.message);

        // 4. Verify signature on server
        const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress, signature })
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            throw new Error(verifyData.error || 'Signature verification failed.');
        }

        // 5. Store JWT and user info
        localStorage.setItem('autocon_token', verifyData.token);
        setToken(verifyData.token);
        setUser(verifyData.user);

        return verifyData.user;
    };

    const logout = () => {
        localStorage.removeItem('autocon_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, authFetch }}>
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
