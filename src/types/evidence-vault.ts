// src/types/evidence-vault.ts

export interface EvidenceVaultItem {
  id: string;
  entityName: string;
  type: 'twitter_post' | 'blockchain_transaction' | 'news_article' | 'archived_website' | 'legal_document' | 'discord_export' | 'telegram_export' | string;
  title: string;
  description?: string;
  verificationStatus: 'verified' | 'pending' | 'disputed' | 'invalid';
  capturedDate: string;
  lastVerified?: string;
  submittedBy: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  originalUrl?: string;
  archivedUrl?: string;
  screenshotUrl?: string;
  ipfsHash?: string;
  verificationResults?: {
    originalAccessible?: boolean;
    archiveAccessible?: boolean;
    screenshotExists?: boolean;
    ipfsAccessible?: boolean;
  };
}

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

export interface EvidenceSubmission {
  entityName: string;
  type: string;
  title: string;
  description?: string;
  originalUrl: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  submittedBy: string;
}