export interface EvidenceVerification {
  originalUrl: string;
  archivedUrl: string;
  screenshotUrl: string;
  ipfsHash?: string;
  verificationStatus: 'verified' | 'degraded' | 'invalid';
  lastVerified: string;
  verificationResults: {
    originalAccessible: boolean;
    archiveAccessible: boolean;
    screenshotExists: boolean;
    ipfsAccessible?: boolean;
  };
}

export interface EvidenceChain {
  claimId: string;
  evidenceIds: string[];
  strength: 'weak' | 'moderate' | 'strong' | 'conclusive';
}