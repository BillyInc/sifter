// src/components/data-donation/universal/index.ts

// Option A: Import and re-export
import SubmissionFormComponent from './SubmissionForm';
import TrackingDashboardComponent from './TrackingDashboard';
import EvidenceUploadComponent from './EvidenceUpload';

// Export with the names you want
export const SubmissionForm = SubmissionFormComponent;
export const TrackingDashboard = TrackingDashboardComponent;
export const EvidenceUpload = EvidenceUploadComponent;

// Helper function
export const getUniversalComponents = () => ({
  SubmissionForm,
  TrackingDashboard,
  EvidenceUpload
});

// Type exports
export type { SubmissionFormProps } from './SubmissionForm';
export type { TrackingDashboardProps } from './TrackingDashboard';
export type { EvidenceUploadProps } from './EvidenceUpload';
