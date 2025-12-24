// src/components/disputes/DisputeStatusTracker.tsx
import { useGamification } from '@/contexts/GamificationContext';

interface Step {
  status: 'complete' | 'current' | 'upcoming';
  label: string;
  date: string;
}

interface GamificationContextType {
  userProfile?: {
    tier?: 'premium' | 'basic' | 'free';
    // Add other user profile properties as needed
  };
  // Add other context properties as needed
}

const DisputeStatusTracker = ({ caseId }: { caseId: string }) => {
  const { userProfile } = useGamification() as GamificationContextType; // Type assertion for context
  
  // Actually use the caseId to avoid the "never read" warning
  // In a real app, you might fetch data based on this ID
  const caseData = {
    id: caseId,
    // You could fetch steps data based on caseId
  };
  
  console.log('Tracking case:', caseId);
  
  const steps: Step[] = [
    { status: 'complete', label: 'Filed', date: 'Jan 15' },
    { status: 'complete', label: 'Verified', date: 'Jan 16' },
    { status: 'current', label: 'Under Review', date: 'Jan 17' },
    { status: 'upcoming', label: 'Resolution', date: 'Jan 25' },
  ];
  
  // Check premium status
  const hasPremiumAccess = userProfile?.tier === 'premium';
  
  // Add a data attribute for the case ID in the DOM
  return (
    <div className="status-tracker" data-case-id={caseId}>
      {hasPremiumAccess && (
        <div className="premium-badge">
          Premium Tracking Enabled
        </div>
      )}
      
      {steps.map((step, index) => (
        <div 
          key={`step-${caseId}-${index}`} 
          className={`step ${step.status}`}
          data-step-index={index}
        >
          <div className="dot">
            {step.status === 'complete' ? '✓' : index + 1}
          </div>
          <div className="label">{step.label}</div>
          <div className="date">{step.date}</div>
        </div>
      ))}
      
      {/* Optional: Display case ID somewhere useful */}
      <div className="case-info">
        <small>Case ID: {caseId}</small>
      </div>
      
      {/* Optional: Add gamification elements */}
      {userProfile && (
        <div className="gamification-info">
          <small>Earn 50 XP for completing this dispute</small>
        </div>
      )}
    </div>
  );
};

export default DisputeStatusTracker;