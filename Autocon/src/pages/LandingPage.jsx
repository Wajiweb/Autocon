/**
 * LandingPage.jsx — Public Route Entry Point
 *
 * Page wrapper that imports and exposes the self-contained LandingPage UI coordinator
 * located in the client components folder. Maintains clean separation between page routes
 * and modular feature components.
 */
import React from 'react';
import LandingPageContainer from '../components/landing/LandingPage';

export default function LandingPage({ onLoginClick }) {
  return <LandingPageContainer onLoginClick={onLoginClick} />;
}

