// src/pages/disputes/index.tsx - Public Disputes List
'use client';

import React from 'react';

const demoDisputes = [
  {
    id: 'dispute-1',
    caseId: 'DISP-2024-001',
    entityName: 'CryptoScam Inc',
    status: 'resolved_accepted',
    filedAt: '2024-01-15',
    resolvedAt: '2024-01-25',
    resolution: 'Entry updated - corrected project involvement dates'
  },
  {
    id: 'dispute-2',
    caseId: 'DISP-2024-002',
    entityName: 'Blockchain Builders LLC',
    status: 'resolved_rejected',
    filedAt: '2024-02-01',
    resolvedAt: '2024-02-10',
    resolution: 'Dispute rejected - insufficient counter-evidence'
  }
];

export default function PublicDisputesPage() {
  return (
    <div className="min-h-screen bg-sifter-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Public Dispute Registry</h1>
          <p className="text-gray-400 mt-2">
            Transparent record of all resolved disputes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-2xl font-bold text-green-400">24</div>
            <div className="text-gray-400">Resolved Disputes</div>
          </div>
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-2xl font-bold text-blue-400">18</div>
            <div className="text-gray-400">Entries Corrected</div>
          </div>
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-2xl font-bold">10 Days</div>
            <div className="text-gray-400">Avg Resolution Time</div>
          </div>
        </div>

        <div className="bg-sifter-card border border-sifter-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-sifter-border">
            <h2 className="text-xl font-bold">Recently Resolved Disputes</h2>
          </div>
          
          <div className="divide-y divide-sifter-border">
            {demoDisputes.map((dispute) => (
              <div key={dispute.id} className="p-6 hover:bg-sifter-dark/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-blue-400">{dispute.caseId}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        dispute.status === 'resolved_accepted' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {dispute.status === 'resolved_accepted' ? 'Accepted' : 'Rejected'}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg">{dispute.entityName}</h3>
                    <p className="text-gray-400 mt-2">{dispute.resolution}</p>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <div>Filed: {new Date(dispute.filedAt).toLocaleDateString()}</div>
                    <div>Resolved: {new Date(dispute.resolvedAt).toLocaleDateString()}</div>
                    <button className="mt-3 px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          Showing 2 of 24 resolved disputes • All disputes are reviewed within 10 business days
        </div>
      </div>
    </div>
  );
}