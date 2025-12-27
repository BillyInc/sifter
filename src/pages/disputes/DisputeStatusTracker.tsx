'use client';

import { useGamification } from '@/contexts/GamificationContext';
import { useSearchParams } from 'next/navigation';

// Prevent static prerendering
export const dynamic = 'force-dynamic';

const DisputeStatusTracker = () => {
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') || 'DISP-2024-089';
  
  // SIMPLE FIX: Direct optional chaining
  const gamification = useGamification?.();
  const userProfile = gamification?.userProfile || null;
  
  const hasPremiumAccess = userProfile
    ? ['platinum', 'diamond', 'vc-elite', 'research-fellow'].includes(userProfile.currentTier)
    : false;

  const steps = [
    { status: 'complete' as const, label: 'Filed', date: 'Jan 15' },
    { status: 'complete' as const, label: 'Verified', date: 'Jan 16' },
    { status: 'current' as const, label: 'Under Review', date: 'Jan 17' },
    { status: 'upcoming' as const, label: 'Resolution', date: 'Jan 25' },
  ];

  return (
    <div className="min-h-screen bg-sifter-dark text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Dispute Status Tracker</h1>
        <p className="text-center text-2xl mb-12">
          Case ID: <span className="font-mono text-blue-400">{caseId}</span>
        </p>

        {hasPremiumAccess && (
          <div className="mb-12 p-6 bg-purple-900/30 border border-purple-500 rounded-xl text-center">
            <div className="text-3xl mb-2">Premium Tracking Enabled</div>
            <p className="text-purple-300 text-lg">+20% bonus XP on resolution</p>
          </div>
        )}

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-8">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold
                  ${step.status === 'complete' ? 'bg-green-600' : 
                    step.status === 'current' ? 'bg-blue-600 animate-pulse' : 
                    'bg-gray-700'}`}
              >
                {step.status === 'complete' ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-semibold">{step.label}</h3>
                <p className="text-xl text-gray-400 mt-2">{step.date}</p>
              </div>
            </div>
          ))}
        </div>

        {userProfile && (
          <div className="mt-16 text-center text-2xl text-green-400">
            Earn 50 XP for completing this dispute!
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeStatusTracker;