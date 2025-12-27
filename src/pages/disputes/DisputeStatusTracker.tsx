'use client';

import { useSearchParams } from 'next/navigation';

// No gamification needed for disputes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const DisputeStatusTracker = () => {
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') || 'DISP-2024-089';

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

        {/* No premium banner - disputes are serious, not gamified */}

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

        {/* No XP rewards - disputes aren't games */}
        
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-400">
            This is a serious dispute resolution process. All cases are reviewed impartially.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisputeStatusTracker;