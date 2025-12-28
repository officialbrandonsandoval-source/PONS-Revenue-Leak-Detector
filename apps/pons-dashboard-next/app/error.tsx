'use client';

import { useEffect } from 'react';

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Dashboard error:', error);
    }
  }, [error]);

  const errorId = (error as Error & { errorId?: string }).errorId;
  const baseMessage =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : error.message || 'Something went wrong.';
  const message = errorId ? `${baseMessage} Error ID: ${errorId}` : baseMessage;

  return (
    <div className="page">
      <div className="shell">
        <div className="card">
          <div className="stat-label">Dashboard Error</div>
          <div className="stat-value">Something went wrong</div>
          <p className="subtitle">{message}</p>
        </div>
      </div>
    </div>
  );
}
