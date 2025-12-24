// src/types/verification.ts
export interface VerificationCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  details?: string;
  timestamp: Date;
  weight: number; // 0-100, how much this check contributes to confidence
}

export interface VerificationResult {
  submissionId: string;
  tier: 'quick' | 'standard' | 'full';
  mode: 'ea-vc' | 'researcher' | 'individual';
  confidenceScore: number; // 0-100
  checks: VerificationCheck[];
  status: 'pending' | 'auto-verified' | 'needs-review' | 'rejected' | 'approved';
  autoDecision?: 'auto_approved' | 'auto_rejected' | 'needs_manual_review';
  nextStep?: 'admin_review' | 'peer_review' | 'legal_review' | 'community_review';
  estimatedReviewTime?: string; // e.g., "12-24h"
  createdAt: Date;
  updatedAt: Date;
}

// From PDF Stage 1: Auto-Verification checks
export interface AutoVerificationData {
  confidence: number; // 0-100
  checks: Array<{
    check: string;
    result: 'match' | 'confirmed_bad' | 'accessible' | 'no_contradictions' | 'contradictions_found';
    detail?: string;
    points?: number; // Contribution to confidence
    

  }>;
  autoDecision: 'auto_approved' | 'auto_rejected' | 'needs_manual_review';  // ✅ Parent level

}

// From PDF: Manual verification data
export interface ManualVerificationData {
  googleResults: any[];
  socialProfiles: any[];
  portfolioMentions: any[];
  evidenceVerification: Array<{
    link: string;
    verified: boolean;
    notes: string;
  }>;
  adminNotes: string;
  decision: 'approve' | 'reject' | 'request_more_info';
}

// ============= NEW TYPES FROM PDF =============

// Dispute System Types (from PDF section 7)
export type DisputeStatus = 
  | 'pending' 
  | 'under_review' 
  | 'needs_info' 
  | 'resolved_accepted' 
  | 'resolved_partial' 
  | 'resolved_rejected';

export type DisputeResolution = 
  | 'remove_entry'
  | 'update_entry'
  | 'add_context'
  | 'reduce_risk_score'
  | 'other';

export type DisputeCategory = 
  | 'factually_incorrect'
  | 'associations_incorrect'
  | 'outcomes_mischaracterized'
  | 'missing_context'
  | 'evidence_unreliable'
  | 'other';

export interface Dispute {
  id: string;
  caseId: string; // e.g., DISP-2024-089
  entityId: string;
  entityName: string;
  entityType: string;
  
  // Disputer Information (from PDF Step 1)
  disputerName: string;
  disputerEmail: string;
  disputerTitle: string;
  disputerRelationship: 'representative' | 'individual' | 'other';
  companyDomain?: string;
  
  // Dispute Details (from PDF Steps 2-3)
  categories: DisputeCategory[];
  explanation: string;
  requestedResolution: DisputeResolution;
  resolutionExplanation?: string;
  
  // Counter Evidence (from PDF Step 4)
  counterEvidence: Array<{
    id: string;
    type: string;
    title: string;
    url?: string;
    fileUrl?: string;
    description: string;
    uploadedAt: string;
  }>;
  
  // Allegation Responses (from PDF Step 5)
  allegationResponses: Array<{
    allegationId: string;
    allegationText: string;
    response: string;
    evidenceIds: string[];
  }>;
  
  // Status & Timeline (from PDF "What Happens Next")
  status: DisputeStatus;
  filedAt: string;
  reviewedAt?: string;
  resolvedAt?: string;
  resolutionDueDate: string; // 5-10 business days from filing
  
  // Admin Tracking
  assignedAdmin?: string;
  adminNotes?: string;
  verificationMethod?: 'email' | 'document' | 'call';
  isVerified: boolean;
  
  // Resolution (from PDF Resolution Notification)
  resolution?: {
    decision: 'accepted' | 'partial' | 'rejected';
    changesMade: string[];
    riskScoreChange?: number;
    updatedEntryPreview?: string;
    notes: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Evidence Architecture Types (from PDF section 8)
export type EvidenceType = 
  | 'twitter_post'
  | 'reddit_thread'
  | 'blockchain_transaction'
  | 'news_article'
  | 'archived_website'
  | 'portfolio_page'
  | 'linkedin_profile'
  | 'discord_export'
  | 'telegram_export'
  | 'email_correspondence'
  | 'legal_document'
  | 'press_release'
  | 'audit_report'
  | 'github_commit'
  | 'other';

export type EvidenceSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EvidenceVaultItem {
  id: string;
  entityId: string;
  projectName?: string;
  
  // Evidence Classification (PDF database schema)
  evidenceType: EvidenceType;
  originalUrl: string;
  archivedUrl?: string;      // archive.org or archive.today
  screenshotUrl?: string;    // Our screenshot backup
  ipfsHash?: string;        // Decentralized storage (optional)
  
  // Content
  evidenceTitle: string;
  evidenceDescription: string;
  evidenceTextContent?: string; // Extracted text for search
  evidenceMetadata?: Record<string, any>;
  
  // Temporal Data
  evidenceDate?: string;     // When event occurred
  capturedDate: string;      // When we captured evidence
  lastVerified?: string;     // Last time we checked URL still works
  
  // Severity & Relevance (from PDF)
  severity: EvidenceSeverity;
  relevanceScore: number;    // 0.00 to 1.00
  
  // Attribution
  submittedBy: string;       // User ID or 'admin'
  verifiedBy?: string;       // Admin who verified
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'invalid';
  
  // Relationships
  supportsClaim?: string;    // Which database claim this supports
  contradictsEvidence?: string; // If this contradicts other evidence
  
  // Verification Results (PDF Evidence Verification System)
  verificationResults?: {
    originalAccessible: boolean;
    originalStatusCode?: number;
    originalContentChanged?: boolean;
    
    archiveAccessible: boolean;
    archiveStatusCode?: number;
    
    screenshotExists: boolean;
    
    ipfsAccessible?: boolean;
    
    lastChecked: string;
    overallStatus: 'verified' | 'degraded' | 'invalid';
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Evidence Chain (from PDF Evidence Chain table)
export interface EvidenceChain {
  chainId: string;
  claimId: string;           // What claim are we supporting
  claimText: string;         // The actual claim
  evidenceIds: string[];     // Array of evidence_ids supporting this claim
  evidenceStrength: 'weak' | 'moderate' | 'strong' | 'conclusive';
  createdAt: string;
}

// Evidence Source Tracking (from PDF)
export interface EvidenceSource {
  sourceId: string;
  sourceType: 'official' | 'third_party' | 'community' | 'blockchain' | 'archive';
  sourceName: string;        // e.g., "Twitter", "Etherscan", "Archive.org"
  sourceUrlPattern: string;  // Pattern matching for auto-classification
  reliabilityScore: number;  // 0.00 to 1.00
  lastAvailabilityCheck?: string;
  isAvailable?: boolean;
}

// Credibility Tier System (from PDF Data Donation Guidelines)
export interface PDFContributorTier {
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  
  // Tier details from PDF
  credibilityWeight: number;  // 2.0x, 1.5x, 1.0x
  basePoints: number;         // 200, 150, 100
  verificationPriority: 'priority' | 'high' | 'standard';
  verificationTimeline: string; // "12h", "24h", "48h"
  
  // Tier membership criteria
  verificationMethods: Array<'linkedin' | 'email' | 'portfolio' | 'publications'>;
  
  // Features from PDF
  features: string[];
}

// Monthly Reward Pool (from PDF section 5)
export interface RewardPool {
  id: string;
  month: string;              // e.g., "December 2024"
  
  // Pool amounts
  basePool: number;           // $5,000
  communityBonus: number;     // Up to $2,000
  totalPool: number;          // $5,000-$7,000
  
  // Metrics
  verifiedSubmissions: number; // 100+, 200+, 300+ thresholds
  totalPointsEntered: number;
  participants: number;
  
  // Distribution
  distribution: Array<{
    userId: string;
    pointsEntered: number;
    sharePercentage: number;
    payout: number;
    payoutMethod: 'cash' | 'gift_card' | 'credit' | 'donated';
  }>;
  
  // Status
  status: 'open' | 'closed' | 'distributed';
  openedAt: string;
  closedAt?: string;
  distributedAt?: string;
}

// Penalty System (from PDF Strike System)
export interface PenaltyRecord {
  userId: string;
  strikes: number;  // 1-4
  
  penaltyHistory: Array<{
    id: string;
    date: string;
    reason: 'fake_data' | 'discredited_data' | 'duplicate' | 'spam' | 'malicious';
    submissionId?: string;
    pointsDeducted: number;
    restrictions: string[];  // e.g., "cannot_enter_pool_30_days"
    adminNotes?: string;
  }>;
  
  currentStatus: 'clean' | 'warning' | 'penalized' | 'banned';
  canSubmit: boolean;
  canEnterPool: boolean;
  credibilityMultiplier: number; // Reduced by 0.2x per strike
  
  // Recovery conditions
  recoveryRequirements?: {
    verifiedSubmissionsNeeded: number;
    timePeriod: string; // e.g., "30_days"
  };
}

// Public Dispute History (from PDF Transparency section)
export interface PublicDisputeHistory {
  entityId: string;
  disputeId: string;
  caseId: string;           // e.g., DISP-2024-089
  
  timeline: {
    filed: string;
    resolved: string;
    durationDays: number;
  };
  
  outcome: {
    decision: 'accepted' | 'partial' | 'rejected';
    changesMade: string[];
    riskScoreBefore?: number;
    riskScoreAfter?: number;
  };
  
  summary: string;          // Brief description of resolution
}

// Evidence Quality Scoring (from PDF Submission Guidelines)
export interface EvidenceQualityScore {
  evidenceId: string;
  score: number; // 0-100
  
  criteria: {
    sourceReliability: number;    // 0-25
    timestampAccuracy: number;    // 0-20
    contentRelevance: number;     // 0-25
    backupAvailability: number;   // 0-15
    crossVerification: number;    // 0-15
  };
  
  qualityLevel: 'low' | 'medium' | 'high' | 'exceptional';
  bonusMultiplier: number; // For point calculations
}

// Verification Workflow Stages (enhanced from PDF)
export interface VerificationWorkflowStage {
  stage: number;
  name: string;
  description: string;
  responsible: 'system' | 'admin' | 'peer' | 'community' | 'legal';
  estimatedTime: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: string;
  notes?: string;
}

// Mode-specific verification thresholds
export const MODE_VERIFICATION_THRESHOLDS = {
  'ea-vc': {
    autoApprove: 85,    // PDF: confidence >= 85 = auto-approve
    autoReject: 20,     // PDF: confidence <= 20 = auto-reject
    reviewPriority: 'high',
    sla: '12-24h',
    minEvidence: 4,      // From PDF Mode Configuration
    allowedEvidenceTypes: [
      'legal_document', 'financial_record', 'contract_document',
      'email_correspondence', 'confidential_source', 'portfolio_page'
    ] as EvidenceType[]
  },
  'researcher': {
    autoApprove: 75,
    autoReject: 30,
    reviewPriority: 'medium',
    sla: '24-48h',
    minEvidence: 3,
    allowedEvidenceTypes: [
      'data_analysis', 'pattern_analysis', 'academic_source',
      'blockchain_transaction', 'github_commit', 'audit_report'
    ] as EvidenceType[]
  },
  'individual': {
    autoApprove: 60,
    autoReject: 40,
    reviewPriority: 'standard',
    sla: '48-72h',
    minEvidence: 2,
    allowedEvidenceTypes: [
      'twitter_post', 'reddit_thread', 'news_article',
      'archived_website', 'personal_experience'
    ] as EvidenceType[]
  }
} as const;

// Review workflow stages by mode (from PDF analysis)
export const REVIEW_WORKFLOWS = {
  'ea-vc': {
    stage1: 'auto_screening',
    stage2: 'vc_peer_review',
    stage3: 'compliance_check',
    stage4: 'legal_clearance',
    totalTime: '12-24h',
    requiresLegalReview: true,
    requiresPeerReview: true
  },
  'researcher': {
    stage1: 'auto_validation',
    stage2: 'methodology_review',
    stage3: 'peer_verification',
    stage4: 'impact_assessment',
    totalTime: '24-48h',
    requiresMethodologyReview: true,
    requiresPeerVerification: true
  },
  'individual': {
    stage1: 'auto_verification',
    stage2: 'admin_review',
    stage3: 'quality_check',
    stage4: 'final_decision',
    totalTime: '48-72h',
    requiresQualityCheck: true,
    requiresAdminReview: true
  }
}; export type ReviewWorkflow = typeof REVIEW_WORKFLOWS[keyof typeof REVIEW_WORKFLOWS];

// PDF Contributor Tiers (from Data Donation Guidelines)
export const PDF_CONTRIBUTOR_TIERS: Record<1 | 2 | 3, PDFContributorTier> = {
  1: {
    tier: 1,
    name: 'Institutional Contributors',
    description: 'VC Partners, VC Executive Assistants, Institutional Analysts',
    credibilityWeight: 2.0,
    basePoints: 200,
    verificationPriority: 'priority',
    verificationTimeline: '12h',
    verificationMethods: ['linkedin', 'email', 'portfolio'],
    features: [
      'Premium Platform Access',
      'White-Label Report Generation',
      'Priority Verification (12h)',
      'Early Access to Database Updates'
    ]
  },
  2: {
    tier: 2,
    name: 'Professional Contributors',
    description: 'Crypto Researchers, Angel Investors, Independent VCs, Journalists',
    credibilityWeight: 1.5,
    basePoints: 150,
    verificationPriority: 'high',
    verificationTimeline: '24h',
    verificationMethods: ['portfolio', 'publications', 'linkedin'],
    features: [
      'Verified Contributor Badge',
      'Methodology Review Priority',
      'Peer Verification Network',
      'Custom Research Requests'
    ]
  },
  3: {
    tier: 3,
    name: 'Community Contributors',
    description: 'Individual Investors, Community Members, General Public',
    credibilityWeight: 1.0,
    basePoints: 100,
    verificationPriority: 'standard',
    verificationTimeline: '48h',
    verificationMethods: ['email'],
    features: [
      'Quality over Quantity Focus',
      'Track Record Multiplier (up to 1.8x)',
      'Monthly Reward Pool Access',
      'Premium Feature Unlocks'
    ]
  }
};

// Penalty System Configuration (from PDF Strike System)
export const PENALTY_SYSTEM_CONFIG = {
  firstOffense: {
    action: 'warning',
    pointsDeducted: 0,
    restrictions: ['account_flagged'],
    recovery: 'none_needed'
  },
  secondOffense: {
    action: 'penalty',
    pointsDeducted: 200,
    restrictions: ['cannot_enter_pool_30_days', 'credibility_reduced'],
    recovery: '3_consecutive_verified_submissions'
  },
  thirdOffense: {
    action: 'severe_penalty',
    pointsDeducted: 500,
    restrictions: ['banned_from_submissions_90_days', 'points_frozen', 'removed_from_pool'],
    recovery: 'appeal_required'
  },
  fourthOffense: {
    action: 'permanent_ban',
    pointsDeducted: 'all',
    restrictions: ['permanent_ban', 'all_points_forfeited'],
    recovery: 'none'
  }
} as const;

// Evidence Verification Schedule (from PDF periodic verification)
export const EVIDENCE_VERIFICATION_SCHEDULE = {
  highSeverity: {
    interval: '7 days',      // Check weekly
    priority: 'high',
    requireMultipleBackups: true
  },
  mediumSeverity: {
    interval: '30 days',     // Check monthly
    priority: 'medium',
    requireMultipleBackups: false
  },
  lowSeverity: {
    interval: '90 days',     // Check quarterly
    priority: 'low',
    requireMultipleBackups: false
  },
  disputedEvidence: {
    interval: 'immediate',   // Check immediately when disputed
    priority: 'critical',
    requireMultipleBackups: true
  }
} as const;