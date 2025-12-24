// src/components/data-donation/universal/index.ts
// Update the imports and exports:

// Import ALL universal components
import SubmissionFormComponent from './SubmissionForm';
import TrackingDashboardComponent from './TrackingDashboard';
import EvidenceUploadComponent from './EvidenceUpload';
import DisputeFormComponent from './DisputeForm';
import StandardFlagFormComponent from './StandardFlagForm';
import PointsDisplayComponent from './PointsDisplay';

// Export ALL components with clear names
export const SubmissionForm = SubmissionFormComponent;
export const TrackingDashboard = TrackingDashboardComponent;
export const EvidenceUpload = EvidenceUploadComponent;
export const DisputeForm = DisputeFormComponent;
export const StandardFlagForm = StandardFlagFormComponent;
export { default as PointsDisplay } from './PointsDisplay';  // ✅ Make sure this file exists

// Helper function (optional)
export const getUniversalComponents = () => ({
  SubmissionForm,
  TrackingDashboard,
  EvidenceUpload,
  DisputeForm,
  StandardFlagForm,

});

// Type exports - ONLY export types that actually exist as named exports
// Check your component files to see if these types are actually exported

// Option 1: If the types don't exist as named exports, remove them or fix the source files
// Option 2: Import types from their respective modules (if they exist)
// Option 3: Export types from a separate types file

// For now, comment out or remove the problematic type exports:
// export type { SubmissionFormProps } from './SubmissionForm';
// export type { TrackingDashboardProps } from './TrackingDashboard';
// export type { EvidenceUploadProps } from './EvidenceUpload';
// export type { DisputeFormProps } from './DisputeForm'; 
// export type { StandardFlagFormProps } from './StandardFlagForm';
// export type { PointsDisplayProps } from './PointsDisplay';

// Alternative: If you need these types, check if your component files export them.
// For example, in your component files, make sure you have:
// export interface ComponentNameProps { ... }
// OR
// export type ComponentNameProps = { ... }

// Add gamification exports
export { default as GamificationDashboard } from '../gamification/GamificationDashboard';

// Export common types if needed (from a central types file)
// export type { 
//   SubmissionData, 
//   Evidence, 
//   DisputeData 
// } from '../types';