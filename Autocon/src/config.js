// Centralized API configuration
// Uses Vite environment variable, falls back to localhost for development
export const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
