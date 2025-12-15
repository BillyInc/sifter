// components/LandingPage.tsx
'use client';

import React from 'react';
import { UserMode } from '@/types';

interface LandingPageProps {
  onSelectMode: (mode: UserMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const handleModeSelect = (mode: UserMode) => {
    onSelectMode(mode);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-sifter-dark to-gray-900">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-sifter-blue to-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white">SIFTER 1.2</h1>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Automated Project Due Diligence</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Analyze 13 key risk metrics across Twitter, Discord, GitHub, and more to detect scams and evaluate project legitimacy.
        </p>
        
        <div className="inline-flex items-center gap-3 bg-sifter-card border border-sifter-border rounded-full px-6 py-3 mb-8">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-gray-300">Trusted by investors, researchers, and venture capitalists</span>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-3">Choose Your Workflow</h3>
          <p className="text-gray-400">Select your primary mode to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* EA/VC Mode */}
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 hover:border-blue-500/50 hover:bg-sifter-card/50 transition-all duration-300 cursor-pointer group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🏢</div>
            <h4 className="text-xl font-bold text-white mb-4">VC/EA Mode</h4>
            <p className="text-gray-400 mb-6">Batch processing for deal flow. Quick Pass/Flag/Reject with volume-optimized UI.</p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Batch upload (100 projects)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Quick Pass/Flag/Reject</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Export for partner handoff</span>
              </div>
            </div>
            <button
              onClick={() => handleModeSelect(UserMode.EA_VC)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all group-hover:scale-105"
            >
              Select VC/EA Mode
            </button>
          </div>

          {/* Researcher Mode */}
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 hover:border-purple-500/50 hover:bg-sifter-card/50 transition-all duration-300 cursor-pointer group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🔬</div>
            <h4 className="text-xl font-bold text-white mb-4">Researcher Mode</h4>
            <p className="text-gray-400 mb-6">Deep analysis with data export, comparisons, and pattern library access.</p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Single deep dives</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Data export (CSV/JSON)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Historical comparisons</span>
              </div>
            </div>
            <button
              onClick={() => handleModeSelect(UserMode.RESEARCHER)}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all group-hover:scale-105"
            >
              Select Researcher Mode
            </button>
          </div>

          {/* Individual Investor Mode */}
          <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 hover:border-green-500/50 hover:bg-sifter-card/50 transition-all duration-300 cursor-pointer group">
            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">👤</div>
            <h4 className="text-xl font-bold text-white mb-4">Individual Investor Mode</h4>
            <p className="text-gray-400 mb-6">Mobile-friendly single project checks with simple yes/no/maybe results.</p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Mobile-first interface</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simple yes/no/maybe</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Saved watchlist</span>
              </div>
            </div>
            <button
              onClick={() => handleModeSelect(UserMode.INDIVIDUAL)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all group-hover:scale-105"
            >
              Select Individual Mode
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">13 Key Risk Metrics Analyzed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Team Identity</h4>
                <p className="text-gray-400 text-sm">Doxxed vs anonymous analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Team Competence</h4>
                <p className="text-gray-400 text-sm">Past experience & credentials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Contaminated Network</h4>
                <p className="text-gray-400 text-sm">Scam agency connections</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Mercenary Keywords</h4>
                <p className="text-gray-400 text-sm">Pump & dump language detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold">5</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Message Time Entropy</h4>
                <p className="text-gray-400 text-sm">Bot-like scheduling detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold">6</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Tweet Focus</h4>
                <p className="text-gray-400 text-sm">Topic consistency analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 font-bold">7</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">GitHub Authenticity</h4>
                <p className="text-gray-400 text-sm">Code originality & activity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">8</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Bus Factor</h4>
                <p className="text-gray-400 text-sm">Team dependency risk</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">9</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Artificial Hype</h4>
                <p className="text-gray-400 text-sm">Growth manipulation detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">10</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Founder Distraction</h4>
                <p className="text-gray-400 text-sm">Multiple project involvement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold">11</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Engagement Authenticity</h4>
                <p className="text-gray-400 text-sm">Bot participation detection</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold">12</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Tokenomics</h4>
                <p className="text-gray-400 text-sm">Supply distribution analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold">13</span>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Account Age Entropy</h4>
                <p className="text-gray-400 text-sm">Bulk account creation detection</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            Ready to start analyzing projects? Select your workflow mode above.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure & Private</span>
            </div>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Real-time Analysis</span>
            </div>
            <div className="h-4 w-px bg-gray-700"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Enterprise Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;