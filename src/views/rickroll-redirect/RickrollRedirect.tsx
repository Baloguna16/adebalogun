import { useEffect } from 'react';
import './RickrollRedirect.css';

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const REDIRECT_DELAY_MS = 3000;

export const RickrollRedirect = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = RICKROLL_URL;
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rr-page">
      <div className="rr-content">
        <div className="rr-spinner" />
        <p className="rr-text">Redirecting you to your content...</p>
      </div>
    </div>
  );
};
