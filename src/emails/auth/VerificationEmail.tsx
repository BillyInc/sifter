// src/emails/auth/VerificationEmail.tsx
interface VerificationEmailProps {
  userName: string;
  submissionId: string;
  entityName: string;
  decision: 'approved' | 'rejected' | 'needs_info';
  notes?: string;
}

export default function VerificationEmail({
  userName,
  submissionId,
  entityName,
  decision,
  notes
}: VerificationEmailProps) {
  
  const getDecisionContent = () => {
    switch(decision) {
      case 'approved':
        return {
          title: 'Submission Approved',
          message: `Your submission #${submissionId} for "${entityName}" has been approved and added to our database.`
        };
      case 'rejected':
        return {
          title: 'Submission Rejected',
          message: `Your submission #${submissionId} for "${entityName}" was rejected. Reason: ${notes || 'Insufficient evidence'}`
        };
      case 'needs_info':
        return {
          title: 'More Information Needed',
          message: `We need more information about your submission #${submissionId} for "${entityName}". Please provide: ${notes}`
        };
    }
  };

  const content = getDecisionContent();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white' }}>
        <h1>Sifter Roles</h1>
      </div>
      
      <div style={{ padding: '30px', backgroundColor: '#2a2a2a', color: '#e0e0e0' }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>{content.title}</h2>
        
        <p>Hello {userName},</p>
        
        <p>{content.message}</p>
        
        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#3a3a3a', borderRadius: '5px' }}>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Submission ID: <strong>{submissionId}</strong><br />
            Entity: <strong>{entityName}</strong><br />
            Status: <strong>{decision.toUpperCase()}</strong>
          </p>
        </div>
        
        <p style={{ marginTop: '30px' }}>
          Best regards,<br />
          The Sifter Team
        </p>
      </div>
      
      <div style={{ padding: '15px', backgroundColor: '#1a1a1a', color: '#888', fontSize: '12px', textAlign: 'center' }}>
        © {new Date().getFullYear()} Sifter Roles. All rights reserved.
      </div>
    </div>
  );
}