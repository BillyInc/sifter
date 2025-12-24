// src/pages/entities/[id].tsx - Entity Profile
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DisputeFilingForm from '@/components/disputes/DisputeFilingForm';
import { EntityEntry, EntityType } from '@/types/dataDonation';  // ✅ ADD THIS

// Mock entity data for demo
const demoEntity: EntityEntry = {  // ✅ Explicit type
  id: 'entity-123',
  name: 'CryptoScam Inc',
    type: 'company' as EntityType,  // ✅ Cast to EntityType

  riskScore: 85,
  description: 'Multiple rug pull allegations across 3 projects in 2023.',
  allegations: [
    {
      id: 'alg-1',
      description: 'Rug pulled "MoonToken" project in March 2023, stealing $2.4M'
    },
    {
      id: 'alg-2',
      description: 'Failed to deliver on "SafeDeFi" platform promises'
    }
  ],
  evidenceCount: 12,
  lastUpdated: '2024-01-20'
};

export default function EntityProfilePage() {
  const router = useRouter();
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-sifter-dark text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4"
            >
              ← Back to Search
            </button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{demoEntity.name}</h1>
                <p className="text-gray-400">{demoEntity.type.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDisputeForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                🛡️ File Dispute
              </button>
            </div>
          </div>

          {/* Risk Score & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Risk Score</div>
              <div className="text-3xl font-bold text-red-400">{demoEntity.riskScore}/100</div>
              <div className="text-sm text-gray-400 mt-2">High Risk</div>
            </div>
            
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Evidence Items</div>
              <div className="text-3xl font-bold">{demoEntity.evidenceCount}</div>
              <div className="text-sm text-gray-400 mt-2">Verified links</div>
            </div>
            
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Last Updated</div>
              <div className="text-2xl font-bold">
                {new Date(demoEntity.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-400 mt-2">After dispute resolution</div>
            </div>
            
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <div className="text-sm text-gray-400 mb-2">Previous Disputes</div>
              <div className="text-2xl font-bold">1</div>
              <div className="text-sm text-gray-400 mt-2">1 accepted, 0 rejected</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Allegations */}
            <div className="lg:col-span-2">
              <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Allegations</h2>
                <div className="space-y-4">
{demoEntity.allegations?.map((allegation: { id: string; description: string }, idx: number) => (
                    <div key={allegation.id} className="border border-sifter-border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                          {idx + 1}
                        </div>
                        <h3 className="font-medium">Allegation #{idx + 1}</h3>
                      </div>
                      <p className="text-gray-300">{allegation.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence Preview */}
              <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Evidence Preview</h2>
                <div className="text-gray-400 mb-4">
                  {demoEntity.evidenceCount} evidence items • All archived in 4 locations
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-sifter-border rounded-lg p-4">
                    <div className="text-green-400 mb-2">✓ Original Link</div>
                    <div className="text-sm text-gray-400">12/12 accessible</div>
                  </div>
                  <div className="border border-sifter-border rounded-lg p-4">
                    <div className="text-green-400 mb-2">✓ Archive.org</div>
                    <div className="text-sm text-gray-400">12/12 archived</div>
                  </div>
                  <div className="border border-sifter-border rounded-lg p-4">
                    <div className="text-green-400 mb-2">✓ Screenshots</div>
                    <div className="text-sm text-gray-400">12/12 saved</div>
                  </div>
                  <div className="border border-sifter-border rounded-lg p-4">
                    <div className="text-amber-400 mb-2">⚠️ IPFS</div>
                    <div className="text-sm text-gray-400">8/12 pinned</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Dispute History & Actions */}
            <div>
              <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Dispute History</h2>
                <div className="space-y-4">
                  <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5">
                    <div className="text-sm text-green-400 mb-1">DISP-2024-001 • Accepted</div>
                    <div className="text-sm text-gray-300">Corrected project involvement dates</div>
                    <div className="text-xs text-gray-500 mt-2">Resolved Jan 25, 2024</div>
                  </div>
                  <button className="w-full py-3 border-2 border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500/50 transition-colors">
                    View All Disputes →
                  </button>
                </div>
              </div>

              <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">About This Entry</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Source</div>
                    <div className="text-white">Community submissions + verified evidence</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Last Verified</div>
                    <div className="text-white">January 15, 2024</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Transparency</div>
                    <div className="text-green-400">All evidence publicly available</div>
                  </div>
                  <div className="pt-4 border-t border-sifter-border">
                    <p className="text-sm text-gray-400">
                      Found an error? File a dispute with counter-evidence.
                      We review all disputes within 10 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Form Modal */}
      {showDisputeForm && (
        <DisputeFilingForm
          entity={demoEntity}
          onClose={() => setShowDisputeForm(false)}
        />
      )}
    </>
  );
}