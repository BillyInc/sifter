// src/pages/disputes/confirmation.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DisputeConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams?.get('caseId') || 'DISP-2024-089';
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationScheduled, setVerificationScheduled] = useState(false);

  useEffect(() => {
    // Simulate email sending
    const emailTimer = setTimeout(() => setEmailSent(true), 2000);
    const verificationTimer = setTimeout(() => setVerificationScheduled(true), 4000);
    
    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(emailTimer);
      clearTimeout(verificationTimer);
      clearInterval(countdown);
    };
  }, []);

  const steps = [
    { id: 1, status: 'complete', label: 'Dispute Filed', description: 'Your case has been submitted', time: 'Just now' },
    { id: 2, status: emailSent ? 'complete' : 'current', label: 'Confirmation Email', description: 'Email sent to your address', time: emailSent ? 'Sent' : 'Sending...' },
    { id: 3, status: verificationScheduled ? 'complete' : 'pending', label: 'Verification Scheduled', description: 'We\'ll contact you within 24 hours', time: verificationScheduled ? 'Scheduled' : 'Pending' },
    { id: 4, status: 'pending', label: 'Under Review', description: 'Our team will review your evidence', time: 'Within 2-3 days' },
    { id: 5, status: 'pending', label: 'Resolution', description: 'Final decision communicated', time: 'Within 10 business days' },
  ];

  return (
    <div className="min-h-screen bg-sifter-dark text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Dispute Filed Successfully!</h1>
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-full px-6 py-3 mb-4">
            <span className="font-mono text-blue-400 text-xl">{caseId}</span>
            <span className="text-gray-400">Save this Case ID</span>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your dispute has been submitted to our review team. We'll contact you within 24 hours to verify your identity.
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-sifter-card border border-sifter-border rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 text-center">What Happens Next</h2>
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${
                  step.status === 'complete' 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : step.status === 'current'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse'
                    : 'bg-gray-800 border-gray-700 text-gray-500'
                }`}>
                  {step.status === 'complete' ? '✓' : step.id}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium text-lg text-white">{step.label}</h3>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      step.status === 'complete' 
                        ? 'bg-green-500/20 text-green-400' 
                        : step.status === 'current'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {step.time}
                    </span>
                  </div>
                  <p className="text-gray-400">{step.description}</p>
                  
                  {/* Status-specific details */}
                  {step.id === 2 && !emailSent && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-400">
                      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Sending confirmation email... {timeLeft}s
                    </div>
                  )}
                  
                  {step.id === 3 && verificationScheduled && (
                    <div className="mt-2 text-sm text-green-400">
                      ✓ Verification call scheduled for tomorrow, 2 PM EST
                    </div>
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-800 ml-5"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="font-medium text-white mb-2">Track Your Dispute</h3>
            <p className="text-gray-400 text-sm mb-4">
              Check status anytime with your Case ID
            </p>
            <Link 
              href={`/disputes/track?caseId=${caseId}`}
              className="inline-block w-full text-center px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg"
            >
              Track Now
            </Link>
          </div>
          
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-3xl mb-4">📧</div>
            <h3 className="font-medium text-white mb-2">Email Confirmation</h3>
            <p className="text-gray-400 text-sm mb-4">
              Check your inbox for detailed receipt
            </p>
            <button 
              onClick={() => {
                const emailWindow = window.open('', 'email-preview');
                if (emailWindow) {
                  emailWindow.document.write(`
                    <html>
                      <body style="font-family: sans-serif; padding: 20px;">
                        <h2>SIFTER Dispute Confirmation</h2>
                        <p>Case ID: ${caseId}</p>
                        <p>Thank you for submitting your dispute.</p>
                      </body>
                    </html>
                  `);
                }
              }}
              className="w-full px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-lg"
            >
              Preview Email
            </button>
          </div>
          
          <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
            <div className="text-3xl mb-4">📄</div>
            <h3 className="font-medium text-white mb-2">Prepare Evidence</h3>
            <p className="text-gray-400 text-sm mb-4">
              Gather documents for verification call
            </p>
            <button 
              onClick={() => alert('Verification checklist:\n1. Company documents\n2. ID verification\n3. Supporting evidence')}
              className="w-full px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg"
            >
              View Checklist
            </button>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 mb-8">
          <h3 className="font-medium text-amber-400 mb-3">📋 Important Information</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>Keep your Case ID safe - you'll need it for all communications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>We'll contact you within 24 hours for identity verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>All disputes are reviewed within 10 business days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>You can submit additional evidence anytime via the tracking page</span>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/disputes"
            className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium text-center"
          >
            View Public Disputes
          </Link>
          <Link 
            href="/admin"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium text-center"
          >
            Go to Admin Dashboard
          </Link>
          <Link 
            href="/"
            className="px-6 py-3 border border-sifter-border text-gray-400 hover:text-white hover:border-blue-500/50 rounded-lg font-medium text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}