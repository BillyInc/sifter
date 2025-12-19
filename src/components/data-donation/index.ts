// src/components/data-donation/index.ts
// Create this file in the data-donation directory

// Universal components
export { 
  SubmissionForm, 
  TrackingDashboard, 
  EvidenceUpload, 
  DisputeForm,
  StandardFlagForm,
  PointsDisplay 
} from './universal';

// src/components/data-donation/index.ts
// Add admin exports
export { 
  AdminReviewDashboard, 
  AdminSubmissionDetail, 
  AdminDashboardPage 
} from './admin';

// VC-specific components
export { default as BatchFlagButton } from './ea-vc/BatchFlagButton';
export { default as BulkFlaggingModal } from './ea-vc/BulkFlaggingOption';

// Quick flag components
export { VCQuickFlag, IndividualQuickFlag } from './quick-flag';

// Unified interface
export { default as FlaggingInterface } from './FlaggingInterface';