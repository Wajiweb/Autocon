import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function useAISuggestion() {
  const { authFetch } = useAuth();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const generateSuggestions = async (contractType, setFormData, intent = '') => {
    setIsSuggesting(true);
    const toastId = toast.loading('🧠 AI is brainstorming parameters...');

    try {
      const res = await authFetch('/api/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ contractType, userDescription: intent })
      });

      const data = await res.json();

      if (data.success && data.data && data.data.suggestions) {
        setFormData(prev => ({ ...prev, ...data.data.suggestions }));
        toast.success(`AI: ${data.data.reasoning}`, { id: toastId, duration: 5000 });
      } else {
        toast.error(data.error || 'Failed to generate suggestions.', { id: toastId });
      }
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      toast.error('Network error. Failed to reach AI.', { id: toastId });
    } finally {
      setIsSuggesting(false);
    }
  };

  return { isSuggesting, generateSuggestions };
}
