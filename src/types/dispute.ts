export type DisputeStatus = 'pending' | 'under_review' | 'needs_info' | 'resolved_accepted' | 'resolved_partial' | 'resolved_rejected';
export type DisputeCategory = 'factually_incorrect' | 'associations_incorrect' | 'incorrect_information'  | 'outcomes_mischaracterized' | 'outdated_information' | 'wrong_risk_score'
  | 'wrong_legal_status'
  | 'wrong_ownership'| 'missing_context' | 'evidence_unreliable' | 'other';

export interface Dispute {
  id: string;
  caseId: string;  // DISP-2024-089
  entityId: string;
  entityType?: string;  // ✅ ADD THIS
  createdAt: string;
  updatedAt: string;

  entityName: string;  // ✅ ADD THIS - The name of the entity being disputed
   entityEmail?: string;
     allegations?: any[]; // Define proper type
  evidence?: any[]; // Define proper type
  disputerName: string;
  disputerEmail: string;
  disputerTitle: string;
    companyDomain?: string;  // ✅ ADD THIS if missing

  disputerRelationship: 'representative' | 'individual' | 'other';
  categories: DisputeCategory[];
  explanation: string;
  requestedResolution?: DisputeResolution;  // ✅ ADD THIS
       resolutionExplanation?: string;           // ✅ ADD THIS if missing
  counterEvidence: Array<{
    id?: string;           // ✅ ADD THIS
    type: string;
    url?: string;
    description: string;
     uploadedAt?: string;   // ✅ ADD THIS
     title?: string;          // ✅ Make sure this exists
  }>;
    allegationResponses?: Array<{  // ✅ ADD THIS
    allegationId: string;
    allegationText: string;
    response: string;
    evidenceIds: string[];
  }>;

  status: DisputeStatus;
  filedAt: string;
    resolutionDueDate: string;  // ✅ ADD THIS - Deadline for resolving the dispute
  resolvedAt?: string;
  verificationMethod: 'call' | 'email' | 'document';  // ✅ ADD THIS - How to verify disputer's identity
   verificationNotes?: string;  // ✅ ADD THIS - User's notes for verification
    isVerified?: boolean;  // ✅ ADD THIS
      adminNotes?: string;  // ✅ KEEP THIS - Admin's notes during review (separate)
  

  resolution?: {
    decision: 'accepted' | 'partial' | 'rejected';
    changesMade: string[];
    riskScoreChange?: number;
    notes: string;
      updatedEntryPreview?: string;  // ✅ ADD THIS
  };
}


export type DisputeResolution = 
  | 'remove_entry' 
  | 'update_entry' 
  | 'add_context' 
  | 'reduce_risk_score';

  

export interface DisputeData {
  id: string;
  entityEmail?: string;
    caseId: string;
  // ... other properties
}

export interface EvidenceVaultItem {
  id: string;
  // ... properties
}