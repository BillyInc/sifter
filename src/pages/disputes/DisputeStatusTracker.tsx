'use client';

import { useGamification } from '@/contexts/GamificationContext';

const DisputeStatusTracker = ({ caseId }: { caseId: string }) => {
  const { userProfile } = useGamification();

  // Define what counts as "premium" access in your system
  const hasPremiumAccess = userProfile
    ? ['platinum', 'diamond', 'vc-elite', 'research-fellow'].includes(userProfile.currentTier)
    : false;

  const steps = [
    { status: 'complete', label: 'Filed', date: 'Jan 15' },
    { status: 'complete', label: 'Verified', date: 'Jan 16' },
    { status: 'current', label: 'Under Review', date: 'Jan 17' },
    { status: 'upcoming', label: 'Resolution', date: 'Jan 25' },
  ] as const;

  return (
    <div className="status-tracker" data-case-id={caseId}>
      {hasPremiumAccess && (
        <div className="premium-badge">
          Premium Tracking Enabled
        </div>
      )}

      {steps.map((step, index) => (
        <div key={`step-${caseId}-${index}`} className={`step ${step.status}`}>
          <div className="dot">
            {step.status === 'complete' ? '✓' : index + 1}
          </div>
          <div className="label">{step.label}</div>
          <div className="date">{step.date}</div>
        </div>
      ))}

      <div className="case-info">
        <small>Case ID: {caseId}</small>
      </div>

      {userProfile && (
        <div className="gamification-info">
          <small>Earn 50 XP for completing this dispute</small>
          {hasPremiumAccess && (
            <span className="bonus"> — +20% bonus for premium tier!</span>
          )}
        </div>
      )}
    </div>
  );
};

export const dynamic = 'force-dynamic';
// Optional, but safe on Netlify:
export const runtime = 'nodejs';

export default DisputeStatusTracker;