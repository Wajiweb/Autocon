import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function useAISuggestion() {
  const { authFetch } = useAuth();
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [reasoning, setReasoning] = useState('');

  const generateSuggestions = async (contractType, setFormData, intent = '', suppressToast = false) => {
    setIsSuggesting(true);
    setSuggestions(null);
    setReasoning('');
    
    const toastId = suppressToast ? null : toast.loading('🧠 AI is brainstorming parameters...');

    try {
      const res = await authFetch('/api/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ contractType, userDescription: intent })
      });

      const data = await res.json();

      if (data.success && data.data && data.data.suggestions) {
        setFormData(prev => ({ ...prev, ...data.data.suggestions }));
        setSuggestions(data.data.suggestions);
        setReasoning(data.data.reasoning || '');
      } else {
        toast.error(data.message || data.error || 'Failed to generate suggestions.', { id: toastId, duration: 3000 });
      }
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      if (!suppressToast) {
        toast.error('Network error. Failed to reach AI.', { id: toastId, duration: 3000 });
      }
    } finally {
      setIsSuggesting(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
    setReasoning('');
  };

  return { isSuggesting, generateSuggestions, suggestions, reasoning, clearSuggestions };
}
