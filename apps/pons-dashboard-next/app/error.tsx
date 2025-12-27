'use client';

export default function Error({ error }: { error: Error }) {
  return (
    <div className="page">
      <div className="shell">
        <div className="card">
          <div className="stat-label">Dashboard Error</div>
          <div className="stat-value">Something went wrong</div>
          <p className="subtitle">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
