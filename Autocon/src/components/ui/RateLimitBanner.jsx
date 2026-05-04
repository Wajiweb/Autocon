import React, { useState, useEffect } from 'react';
import './RateLimitBanner.css';

export const RateLimitBanner = ({
  retryAfter,
  message = "Rate limit reached. Try again in {seconds} seconds",
  onCountdownComplete,
}) => {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (countdown <= 0) {
      onCountdownComplete?.();
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onCountdownComplete]);

  if (countdown <= 0) return null;

  const displayMessage = message.replace('{seconds}', countdown.toString());

  return (
    <div className="rate-limit-banner">
      <div className="rate-limit-icon">⏱️</div>
      <div className="rate-limit-message">{displayMessage}</div>
      <div className="rate-limit-countdown">{countdown}s</div>
    </div>
  );
};