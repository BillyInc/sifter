export type DisputeStatus = 'pending' | 'under_review' | 'needs_info' | 'resolved_accepted' | 'resolved_partial' | 'resolved_rejected';
export type DisputeCategory = 'factually_incorrect' | 'associations_incorrect' | 'outcomes_mischaracterized' | 'missing_context' | 'evidence_unreliable' | 'other';

export interface Dispute {
  id: string;
  caseId: string;  // DISP-2024-089
  entityId: string;
  disputerName: string;
  disputerEmail: string;
  disputerTitle: string;
  disputerRelationship: 'representative' | 'individual' | 'other';
  categories: DisputeCategory[];
  explanation: string;
  counterEvidence: Array<{
    type: string;
    url: string;
    description: string;
  }>;
  status: DisputeStatus;
  filedAt: string;
  resolvedAt?: string;
  resolution?: {
    decision: 'accepted' | 'partial' | 'rejected';
    changesMade: string[];
    riskScoreChange?: number;
    notes: string;
  };
}