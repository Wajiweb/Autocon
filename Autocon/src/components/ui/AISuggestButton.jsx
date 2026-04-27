import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contractType,
          userDescription: description,
          partialInputs,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to get AI suggestions');

      onSuggest(data.data.suggestions, data.data.reasoning);
      setIsOpen(false);
      setDescription('');
      toast.success('Configuration suggestions applied.');
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
          className="btn-ai"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(14,165,233,0.18)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            width: 'fit-content',
          }}
        >
          <Sparkles size={16} data-ai-icon="true" />
          Suggest for Me
        </button>
      ) : (
        <div
          style={{
            padding: '16px',
            background: 'linear-gradient(145deg, var(--card), var(--card-elevated))',
            border: '1px solid var(--border-dark)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} color="var(--ai-accent)" />
              AI Configuration Assistant
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dark-muted)', cursor: 'pointer' }}
              aria-label="Close AI assistant"
            >
              x
            </button>
          </div>

          <input
            type="text"
            placeholder="E.g. I want a community memecoin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
            autoFocus
          />

          <button
            type="button"
            onClick={handleSuggest}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)',
              border: 'none',
              color: '#ECFDF5',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} />
                Generating Config...
              </>
            ) : (
              'Auto-Fill Configuration'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
