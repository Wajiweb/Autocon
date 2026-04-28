/**
 * api.js — Landing Page API Service
 * Centralised wrappers for landing-specific backend endpoints.
 */
import { API_BASE } from '../config';

const get = async (endpoint) => {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${endpoint}`);
  return res.json();
};

export const landingApi = {
  getStats:        () => get('/api/landing/stats'),
  getFeatures:     () => get('/api/landing/features'),
  getTestimonials: () => get('/api/landing/testimonials'),
};
