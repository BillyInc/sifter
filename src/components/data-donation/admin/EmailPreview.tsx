// src/components/admin/EmailPreview.tsx
'use client';

import React, { useState } from 'react';
import { Dispute } from '@/types/disputes';

interface EmailPreviewProps {
  dispute: Dispute;
  resolution?: 'accepted' | 'partial' | 'rejected';
  adminNotes?: string;
}

export default function EmailPreview({ dispute, resolution, adminNotes }: EmailPreviewProps) {
  const [previewType, setPreviewType] = useState<'confirmation' | 'verification' | 'resolution'>('resolution');
  
  const templates = {
    confirmation: {
      subject: `Dispute Confirmation: ${dispute.caseId}`,
      body: `Dear ${dispute.disputerName},

Thank you for submitting your dispute regarding ${dispute.entityName}.

Case ID: ${dispute.caseId}
Filed: ${new Date(dispute.filedAt).toLocaleDateString()}
Due Date: ${new Date(dispute.resolutionDueDate).toLocaleDateString()}

We will contact you within 24 hours to verify your identity via ${dispute.verificationMethod}.

You can track your dispute status at:
https://sifter.com/disputes/track?caseId=${dispute.caseId}

Sincerely,
The SIFTER Team`
    },
    
    verification: {
      subject: `Identity Verification Required: ${dispute.caseId}`,
      body: `Dear ${dispute.disputerName},

We need to verify your identity for dispute ${dispute.caseId}.

Verification Method: ${dispute.verificationMethod === 'call' ? 'Phone Call' : dispute.verificationMethod === 'email' ? 'Email Reply' : 'Document Upload'}

Please respond to this email to confirm your identity and proceed with the dispute review.

If you requested a phone call, we will call you at the number provided.

If you need to change your verification method, please reply to this email.

Sincerely,
The SIFTER Team`
    },
    
    resolution: {
      subject: `Dispute Resolution: ${dispute.caseId} - ${resolution ? resolution.charAt(0).toUpperCase() + resolution.slice(1) : 'Decision'}`,
      body: `Dear ${dispute.disputerName},

Your dispute ${dispute.caseId} regarding ${dispute.entityName} has been reviewed.

RESOLUTION: ${resolution ? resolution.toUpperCase() : 'PENDING'}

${
  resolution === 'accepted' 
    ? `Your dispute has been accepted. The following changes will be made to the entry:
       - ${adminNotes || 'Entry will be updated based on provided evidence'}

       The updated entry will be visible within 24 hours.`
  : resolution === 'partial'
    ? `Your dispute has been partially accepted. Some changes will be made:
       - ${adminNotes || 'Specific corrections will be applied to the entry'}

       The entity entry will be updated accordingly.`
  : resolution === 'rejected'
    ? `Your dispute has been rejected. The original entry will be maintained because:
       - ${adminNotes || 'Insufficient counter-evidence provided'}

       You may submit additional evidence for reconsideration within 30 days.`
  : 'A decision is pending. You will be notified once the review is complete.'
}

You can view the updated entry at:
https://sifter.com/entities/${dispute.entityId}

If you have questions about this decision, please reply to this email.

Sincerely,
The SIFTER Team`
    }
  };

  const currentTemplate = templates[previewType];

  return (
    <div className="border border-sifter-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-sifter-dark border-b border-sifter-border p-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-white">Email Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewType('confirmation')}
              className={`px-3 py-1 rounded text-sm ${
                previewType === 'confirmation' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Confirmation
            </button>
            <button
              onClick={() => setPreviewType('verification')}
              className={`px-3 py-1 rounded text-sm ${
                previewType === 'verification' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setPreviewType('resolution')}
              className={`px-3 py-1 rounded text-sm ${
                previewType === 'resolution' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Resolution
            </button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white text-black">
        {/* Email Header */}
        <div className="border-b p-4">
          <div className="text-sm text-gray-500">To: {dispute.disputerEmail}</div>
          <div className="text-sm text-gray-500">From: disputes@sifter.com</div>
          <div className="font-medium mt-2">{currentTemplate.subject}</div>
        </div>

        {/* Email Body */}
        <div className="p-4 font-sans whitespace-pre-wrap text-sm min-h-[300px]">
          {currentTemplate.body}
        </div>

        {/* Actions */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={() => {
                const emailWindow = window.open('', 'email-preview');
                if (emailWindow) {
                  emailWindow.document.write(`
                    <html>
                      <body style="font-family: sans-serif; padding: 20px;">
                        <h2>${currentTemplate.subject}</h2>
                        <pre style="white-space: pre-wrap; font-family: inherit;">${currentTemplate.body}</pre>
                      </body>
                    </html>
                  `);
                }
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              Open in New Window
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentTemplate.body);
                alert('Email content copied to clipboard!');
              }}
              className="px-4 py-2 border border-gray-300 rounded text-sm"
            >
              Copy Content
            </button>
            <button
              onClick={() => alert(`In production, this would send the email to ${dispute.disputerEmail}`)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}