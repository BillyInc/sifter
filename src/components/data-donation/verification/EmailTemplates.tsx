// src/components/data-donation/verification/EmailTemplatePreview.tsx
'use client';

import React from 'react';

interface EmailTemplatePreviewProps {
  submissionId: string;
  entityName: string;
  decision: 'approved' | 'rejected' | 'needs_info';
  userEmail?: string;
  adminNotes?: string;
}

export default function EmailTemplatePreview({ 
  submissionId, 
  entityName, 
  decision, 
  userEmail, 
  adminNotes 
}: EmailTemplatePreviewProps) {
  
  const templates = {
    approved: {
      subject: `✅ Submission Approved: ${entityName}`,
      body: `Dear User,

Your submission #${submissionId} for "${entityName}" has been approved and added to our database.

Thank you for contributing to our community!

Best regards,
The Sifter Team`
    },
    rejected: {
      subject: `❌ Submission Rejected: ${entityName}`,
      body: `Dear User,

Your submission #${submissionId} for "${entityName}" was rejected.

Reason: ${adminNotes || 'Insufficient evidence or documentation provided.'}

You can submit again with additional information.

Best regards,
The Sifter Team`
    },
    needs_info: {
      subject: `📝 More Information Needed: ${entityName}`,
      body: `Dear User,

We need more information about your submission #${submissionId} for "${entityName}".

Additional information requested:
${adminNotes || 'Please provide more details and supporting documentation.'}

Please reply to this email with the requested information.

Best regards,
The Sifter Team`
    }
  };

  const template = templates[decision];

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">📧 Email Preview</h3>
      
      <div className="space-y-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">To:</div>
          <div className="text-white p-2 bg-sifter-dark rounded border border-sifter-border">
            {userEmail || 'user@example.com'}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Subject:</div>
          <div className="text-white font-medium p-2 bg-sifter-dark rounded border border-sifter-border">
            {template.subject}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-400 mb-1">Body:</div>
          <div className="p-4 bg-sifter-dark border border-sifter-border rounded-lg text-gray-300 whitespace-pre-line font-mono text-sm">
            {template.body}
          </div>
        </div>
        
        <div className="flex gap-2 pt-4">
          <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
            Send Email
          </button>
          <button className="px-4 py-2 bg-sifter-border hover:bg-sifter-border/80 text-gray-300 rounded-lg transition">
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}