// components/LandingPage.tsx
'use client';

import React from 'react';

// Add the onGetStarted prop to the interface
interface LandingPageProps {
  onGetStarted: () => void; // Add this line
  // ... other props if you have them
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sifter-dark to-sifter-card">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-sifter-blue to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">SIFTER 1.0</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6">
            Automated Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-sifter-blue to-purple-600">Due Diligence</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Analyze any crypto project using 13 risk metrics. Enter a Twitter handle, Discord, Telegram, 
            GitHub repo, website URL, or just the project name.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-sifter-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105"
            >
              Get Started →
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-white mb-2">Deep Analysis</h3>
              <p className="text-gray-400">13 comprehensive risk metrics covering team, code, and community</p>
            </div>
            
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Detection</h3>
              <p className="text-gray-400">Pattern matching against known scam techniques and red flags</p>
            </div>
            
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Fast Results</h3>
              <p className="text-gray-400">Complete analysis in seconds, not hours of manual research</p>
            </div>
          </div>
          
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">1</span>
                </div>
                <h4 className="font-bold text-white mb-2">Enter Project</h4>
                <p className="text-gray-400 text-sm">Twitter, Discord, GitHub, website, or name</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">2</span>
                </div>
                <h4 className="font-bold text-white mb-2">Automated Analysis</h4>
                <p className="text-gray-400 text-sm">13 metrics analyzed in parallel</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">3</span>
                </div>
                <h4 className="font-bold text-white mb-2">Get Verdict</h4>
                <p className="text-gray-400 text-sm">Pass/Flag/Reject with detailed breakdown</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
