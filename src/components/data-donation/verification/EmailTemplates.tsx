// src/components/data-donation/verification/EmailTemplates.tsx
'use client';

import React from 'react';

interface EmailTemplatesProps {
  submissionId: string;
  entityName: string;
  decision: 'approved' | 'rejected' | 'needs_info';
  userEmail?: string;
  adminNotes?: string;
}

export default function EmailTemplates({ submissionId, entityName, decision, userEmail, adminNotes }: EmailTemplatesProps) {
  const templates = {
    approved: {
      subject: `✅ Submission Approved: ${entityName}`,
      body: `Your submission #${submissionId} for "${entityName}" has been approved and added to our database. Thank you for contributing!`
    },
    rejected: {
      subject: `❌ Submission Rejected: ${entityName}`,
      body: `Your submission #${submissionId} for "${entityName}" was rejected. Reason: ${adminNotes || 'Insufficient evidence'}`
    },
    needs_info: {
      subject: `📝 More Information Needed: ${entityName}`,
      body: `We need more information about your submission #${submissionId} for "${entityName}". Please provide: ${adminNotes}`
    }
  };

  const template = templates[decision];

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">📧 Email Template</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">To:</div>
          <div className="text-white">{userEmail || 'user@example.com'}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Subject:</div>
          <div className="text-white font-medium">{template.subject}</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Body:</div>
          <div className="p-4 bg-sifter-dark border border-sifter-border rounded-lg text-gray-300 whitespace-pre-line">
            {template.body}
          </div>
        </div>
        
        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
          Send Email
        </button>
      </div>
    </div>
  );
}