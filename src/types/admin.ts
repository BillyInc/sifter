// src/types/admin.ts
export interface AdminSubmission {
  id: string;
  caseId: string;
  entityName: string;
  entityType: string;
  projectName?: string;
  submittedBy: {
    userId: string;
    email: string;
    name?: string;
    mode: 'ea-vc' | 'researcher' | 'individual';
  };
  submittedAt: Date;
  
  // Auto-verification results
  autoVerification: {
    confidence: number;
    checks: Array<{
      check: string;
      result: 'match' | 'confirmed_bad' | 'accessible' | 'no_contradictions' | 'contradictions_found';
      detail?: string;
    }>;
    issues: string[];
  };
  
  evidence: Array<{
    url: string;
    type: string;
    accessible: boolean;
    verified: boolean;
    notes?: string;
  }>;
  
  status: 'pending' | 'auto-verified' | 'needs-verification' | 'flagged' | 'under-review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedReviewTime: string; // e.g., "18 hours"
  
  // Admin actions
  assignedTo?: string;
  lastReviewed?: Date;
  reviewNotes?: string[];
}

export interface AdminStats {
  totalPending: number;
  autoVerified: number;
  needsVerification: number;
  flagged: number;
  avgResponseTime: number;
  oldestUnreviewed: number; // hours
}

export interface AdminAction {
  type: 'approve' | 'reject' | 'request-info' | 'flag' | 'assign';
  submissionId: string;
  adminId: string;
  notes?: string;
  timestamp: Date;
}