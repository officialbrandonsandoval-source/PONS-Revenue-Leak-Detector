import LeakAnalysisClient from './ui/LeakAnalysisClient';

export default function DashboardPage() {
  return (
    <div className="page">
      <div className="shell">
        <header className="header">
          <div>
            <h1 className="title">Revenue Leak Analysis</h1>
            <p className="subtitle">Executive view of where pipeline value is likely slipping and why.</p>
          </div>
        </header>
        <LeakAnalysisClient />
      </div>
    </div>
  );
}
