'use client';

import { useEffect, useState } from 'react';

interface LoadingStateProps {
  projectName: string;
  onComplete: () => void;
  duration: number; // in milliseconds
  compact?: boolean;  // ✅ ADD THIS LINE
}

const analysisSteps = [
  'Initializing analysis engines...',
  'Scanning social media presence...',
  'Analyzing Twitter community...',
  'Checking Discord activity...',
  'Evaluating Telegram groups...',
  'Scanning GitHub repositories...',
  'Cross-referencing team identities...',
  'Detecting mod overlaps...',
  'Analyzing follower patterns...',
  'Checking for bot activity...',
  'Evaluating community authenticity...',
  'Calculating mercenary ratio...',
  'Analyzing tweet sentiment...',
  'Scanning for ghost admins...',
  'Checking code originality...',
  'Detecting farming patterns...',
  'Computing similarity scores...',
  'Analyzing mutual-follow networks...',
  'Aggregating risk signals...',
  'Generating final verdict...',
];

export default function LoadingState({
  projectName,
  onComplete,
  duration,
}: LoadingStateProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
      setElapsedTime(Math.floor(elapsed / 1000));

      // Update current step based on progress
      const stepIndex = Math.min(
        Math.floor((newProgress / 100) * analysisSteps.length),
        analysisSteps.length - 1
      );
      setCurrentStep(stepIndex);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sifter-blue/20 mb-4">
            <svg
              className="w-8 h-8 text-sifter-blue animate-spin-slow"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Analyzing Project
          </h2>
          <p className="text-gray-400 font-mono text-sm">{projectName}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{Math.round(progress)}% complete</span>
            <span>{formatTime(elapsedTime)} elapsed</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sifter-blue to-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-sifter-blue rounded-full animate-pulse" />
            <span className="text-gray-300 text-sm">
              {analysisSteps[currentStep]}
            </span>
          </div>
        </div>

        {/* Step Progress */}
        <div className="grid grid-cols-5 gap-1">
          {analysisSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-colors duration-300 ${
                index <= currentStep ? 'bg-sifter-blue' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Deep analysis typically takes 75-90 seconds to complete
        </p>
      </div>
    </div>
  );
}
