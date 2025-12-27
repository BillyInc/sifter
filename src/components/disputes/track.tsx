// src/pages/disputes/track.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Mock dispute data
const mockDispute = {
  caseId: 'DISP-2024-089',
  entityName: 'CryptoScam Inc',
  filedAt: '2024-01-15T10:30:00Z',
  resolutionDueDate: '2024-01-29T23:59:59Z',
  status: 'under_review',
  assignedAdmin: 'Alex Chen',
  lastUpdated: '2024-01-17T14:20:00Z',
  verificationMethod: 'call',
  verificationScheduled: '2024-01-18T14:00:00Z',
  evidenceSubmitted: 5,
  adminNotes: 'Reviewing counter-evidence. Need to verify company documents.',
  nextSteps: ['Complete identity verification call', 'Review additional evidence', 'Make resolution decision']
};

export const dynamic = 'force-dynamic';
// Optional, but safe on Netlify:
export const runtime = 'nodejs';

export default function DisputeStatusTrackerPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') || mockDispute.caseId;
  
  const [dispute, setDispute] = useState(mockDispute);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('');

  useEffect(() => {
    // Calculate time since last update
    const updateTime = new Date(dispute.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - updateTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      setTimeSinceUpdate('Just now');
    } else if (diffHours < 24) {
      setTimeSinceUpdate(`${diffHours} hours ago`);
    } else {
      setTimeSinceUpdate(`${Math.floor(diffHours / 24)} days ago`);
    }

    // Simulate status check
    const interval = setInterval(() => {
      setCheckingStatus(true);
      setTimeout(() => setCheckingStatus(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, [dispute.lastUpdated]);

  const timeline = [
    { 
      status: 'complete', 
      label: 'Dispute Filed', 
      description: 'Initial submission received',
      date: 'Jan 15, 10:30 AM',
      details: '7-step wizard completed with 5 evidence items'
    },
    { 
      status: 'complete', 
      label: 'Email Confirmation', 
      description: 'Confirmation email sent',
      date: 'Jan 15, 10:32 AM',
      details: 'Receipt sent to provided email address'
    },
    { 
      status: 'complete', 
      label: 'Identity Verification', 
      description: 'Verification call completed',
      date: 'Jan 16, 2:00 PM',
      details: 'Successfully verified company representative'
    },
    { 
      status: 'current', 
      label: 'Under Review', 
      description: 'Being reviewed by admin team',
      date: 'Jan 17, 9:15 AM',
      details: 'Assigned to Alex Chen. Reviewing counter-evidence.'
    },
    { 
      status: 'pending', 
      label: 'Resolution Decision', 
      description: 'Final decision pending',
      date: 'By Jan 29',
      details: 'Expected within 10 business days of filing'
    },
    { 
      status: 'pending', 
      label: 'Notification Sent', 
      description: 'Resolution email to be sent',
      date: 'After resolution',
      details: 'Detailed explanation of decision'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'current': return 'text-blue-400 bg-blue-500/20 border-blue-500/30 animate-pulse';
      case 'pending': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const checkStatus = () => {
    setCheckingStatus(true);
    setTimeout(() => {
      // Simulate status update
      setDispute(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        adminNotes: checkingStatus ? prev.adminNotes : 'Review completed. Preparing resolution...'
      }));
      setCheckingStatus(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-sifter-dark text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dispute Status Tracker</h1>
              <div className="flex items-center gap-4">
                <span className="font-mono text-2xl text-blue-400">{caseId}</span>
                <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor('current')}`}>
                  Under Review
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={checkStatus}
                disabled={checkingStatus}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {checkingStatus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <span>⟳</span>
                    Refresh Status
                  </>
                )}
              </button>
              <Link 
                href="/disputes"
                className="px-4 py-2 border border-sifter-border text-gray-400 hover:text-white hover:border-blue-500/50 rounded-lg"
              >
                View All Disputes
              </Link>
            </div>
          </div>

          {/* Entity Info */}
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Entity</div>
                <div className="text-xl font-medium text-white">{dispute.entityName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Assigned Admin</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    AC
                  </div>
                  <span className="text-white">{dispute.assignedAdmin}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Resolution Due</div>
                <div className="text-xl text-white">
                  {new Date(dispute.resolutionDueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <div className="text-sm text-amber-400">
                  {Math.ceil((new Date(dispute.resolutionDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Case Timeline</h2>
              
              <div className="space-y-8">
                {timeline.map((step, index) => (
                  <div key={step.label} className="relative">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                        step.status === 'complete' 
                          ? 'bg-green-500/20 border-green-500 text-green-400' 
                          : step.status === 'current'
                          ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}>
                        {step.status === 'complete' ? '✓' : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-medium text-white">{step.label}</h3>
                            <p className="text-gray-400 text-sm">{step.description}</p>
                          </div>
                          <span className="text-sm text-gray-500 whitespace-nowrap">{step.date}</span>
                        </div>
                        <p className="text-gray-300 text-sm mt-2">{step.details}</p>
                      </div>
                    </div>
                    
                    {index < timeline.length - 1 && (
                      <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-800 ml-0.5"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Admin Notes</h2>
                <span className="text-sm text-gray-500">Last updated: {timeSinceUpdate}</span>
              </div>
              <div className="bg-sifter-dark border border-sifter-border rounded-lg p-4">
                <p className="text-gray-300">{dispute.adminNotes}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-white mb-2">Next Steps:</h3>
                <ul className="space-y-2">
                  {dispute.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Status Summary */}
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mb-6">
              <h2 className="font-medium text-white mb-4">Case Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Filed On</div>
                  <div className="text-white">
                    {new Date(dispute.filedAt).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Evidence Submitted</div>
                  <div className="text-white">{dispute.evidenceSubmitted} items</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Verification Method</div>
                  <div className="flex items-center gap-2 text-white">
                    {dispute.verificationMethod === 'call' ? '📞 Phone Call' : 
                     dispute.verificationMethod === 'email' ? '✉️ Email' : '📄 Document'}
                    <span className="text-green-400 text-sm">✓ Verified</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400">Time in Review</div>
                  <div className="text-white">
                    {Math.floor((new Date().getTime() - new Date(dispute.filedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6 mb-6">
              <h2 className="font-medium text-white mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const emailWindow = window.open('', 'email-preview');
                    if (emailWindow) {
                      emailWindow.document.write(`
                        <html>
                          <body style="font-family: sans-serif; padding: 20px;">
                            <h2>SIFTER Dispute Update</h2>
                            <p>Case ID: ${caseId}</p>
                            <p>Status: Under Review</p>
                            <p>Your dispute is currently being reviewed by our team.</p>
                          </body>
                        </html>
                      `);
                    }
                  }}
                  className="w-full px-4 py-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-left flex items-center gap-3"
                >
                  <span>📧</span>
                  <span>View Latest Email</span>
                </button>
                
                <button
                  onClick={() => alert('Evidence upload modal would open here')}
                  className="w-full px-4 py-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-left flex items-center gap-3"
                >
                  <span>📎</span>
                  <span>Add More Evidence</span>
                </button>
                
                <button
                  onClick={() => alert('Contact form would open here')}
                  className="w-full px-4 py-3 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-left flex items-center gap-3"
                >
                  <span>💬</span>
                  <span>Contact Admin</span>
                </button>
                
                <Link 
                  href={`/entities/entity-123`}
                  className="block w-full px-4 py-3 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-left flex items-center gap-3"
                >
                  <span>🏢</span>
                  <span>View Entity Page</span>
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
              <h2 className="font-medium text-white mb-4">Need Help?</h2>
              <div className="space-y-3 text-sm text-gray-400">
                <p>Email: disputes@sifter.com</p>
                <p>Hours: Mon-Fri, 9AM-5PM EST</p>
                <p>Response time: 24 hours</p>
              </div>
              <div className="mt-4 pt-4 border-t border-sifter-border">
                <p className="text-xs text-gray-500">
                  This is a public transparency page. Anyone with the Case ID can view this status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}