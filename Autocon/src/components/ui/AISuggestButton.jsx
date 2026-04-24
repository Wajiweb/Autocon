import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../config';

export default function AISuggestButton({ contractType, partialInputs, onSuggest }) {
    const [isOpen, setIsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSuggest = async () => {
        if (!description.trim()) return toast.error('Please enter a short description first.');

        setIsLoading(true);
        try {
            const token = localStorage.getItem('autocon_token');
            const res = await fetch(`${API_BASE}/api/ai/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contractType,
                    userDescription: description,
                    partialInputs
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to get AI suggestions');

            onSuggest(data.data.suggestions, data.data.reasoning);
            setIsOpen(false);
            setDescription('');
        } catch (err) {
            console.error('AI Suggest Error:', err);
            toast.error(err.message || 'AI request failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ marginBottom: '24px', position: 'relative' }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    type="button"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 16px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399', fontWeight: 600, fontSize: '0.85rem',
                        cursor: 'pointer', transition: 'all 0.2s', width: 'fit-content'
                    }}
                >
                    <Sparkles size={16} /> ✨ Suggest for Me
                </button>
            ) : (
                <div style={{
                    padding: '16px', background: 'var(--surface-highest)',
                    border: '1px solid var(--primary-muted)', borderRadius: '16px',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sparkles size={14} /> AI Configuration Assistant
                        </h4>
                        <button 
                            type="button"
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    <input
                        type="text"
                        placeholder={`E.g. I want a community memecoin...`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid var(--outline-variant)',
                            color: 'white', fontSize: '0.85rem'
                        }}
                        autoFocus
                    />
                    
                    <button
                        type="button"
                        onClick={handleSuggest}
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '12px', borderRadius: '8px',
                            background: 'var(--primary)', border: 'none',
                            color: 'white', fontWeight: 700, fontSize: '0.9rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                            cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? <><Loader2 size={16} style={{animation: 'spin-slow 1s linear infinite'}} /> Generating Config...</> : 'Auto-Fill Configuration'}
                    </button>
                </div>
            )}
        </div>
    );
}
