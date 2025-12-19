// src/components/disputes/DisputeStatusTracker.tsx
export default function DisputeStatusTracker({ caseId }) {
  const steps = [
    { status: 'complete', label: 'Filed', date: 'Jan 15' },
    { status: 'complete', label: 'Verified', date: 'Jan 16' },
    { status: 'current', label: 'Under Review', date: 'Jan 17' },
    { status: 'upcoming', label: 'Resolution', date: 'Jan 25' },
  ];
  
  return (
    <div className="status-tracker">
      {steps.map((step, i) => (
        <div key={i} className={`step ${step.status}`}>
          <div className="dot">{step.status === 'complete' ? '✓' : i + 1}</div>
          <div className="label">{step.label}</div>
          <div className="date">{step.date}</div>
        </div>
      ))}
    </div>
  );
}