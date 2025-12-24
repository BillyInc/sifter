'use client';

import React, { useState, useEffect } from 'react';
import { UserMode, SubmissionFormData } from '@/types';
import { 
  CompatibleSubmissionFormData,
  EvidenceType,  // Add from dataDonation.ts
  EvidenceStatus  // Add from dataDonation.ts
} from '@/types/dataDonation';

// Define the props interface as a named export
export interface SubmissionFormProps {
  mode: UserMode;
  prefillData?: Partial<SubmissionFormData>;
    onSubmit: (data: any) => Promise<void>;  // Accept any type

  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
    onEvidenceCountChange?: (count: number) => void;  // ← ADD THIS

}

export default function SubmissionForm({ 
  mode, 
  prefillData = {}, 
  onSubmit, 
  isOpen, 
  onClose,
  userName = '',
  userEmail = ''
}: SubmissionFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SubmissionFormData>({
    // Required properties from your interface
    id: prefillData.id || '',
    caseId: prefillData.caseId || '',
    submittedAt: prefillData.submittedAt || '',
    
    // Existing properties
    entityType: prefillData.entityType || 'marketing-agency',
    entityDetails: { 
      fullName: prefillData.entityDetails?.fullName || '', 
      twitterHandle: prefillData.entityDetails?.twitterHandle || '', 
      telegramHandle: prefillData.entityDetails?.telegramHandle || '', 
      linkedinProfile: prefillData.entityDetails?.linkedinProfile || '', 
      website: prefillData.entityDetails?.website || '' 
    },
    affectedProjects: prefillData.affectedProjects || [{
      projectName: '',
      incidentDescription: '',
      date: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' })
    }],
    evidence: prefillData.evidence || [
      { 
        id: `evidence_${Date.now()}_1`, 
        url: '', 
        description: '', 
        type: 'other' as EvidenceType,  // Cast to EvidenceType
        status: 'pending' as EvidenceStatus  // Cast to EvidenceStatus
      },
      { 
        id: `evidence_${Date.now()}_2`, 
        url: '', 
        description: '', 
        type: 'other' as EvidenceType,  // Cast to EvidenceType
        status: 'pending' as EvidenceStatus  // Cast to EvidenceStatus
      }
    ],
    submitterInfo: {
      email: userEmail || prefillData.submitterInfo?.email || '',
      name: userName || prefillData.submitterInfo?.name || '',
      anonymous: prefillData.submitterInfo?.anonymous || false,
      acknowledgements: prefillData.submitterInfo?.acknowledgements || [false, false, false]
    },
    mode: mode || 'individual',
    status: 'draft',
    
    // Optional properties with defaults
    confidenceScore: prefillData.confidenceScore || 0,
    impactScore: prefillData.impactScore || 0,
    pointsAwarded: prefillData.pointsAwarded || 0,
    updatedAt: prefillData.updatedAt || '',
    title: prefillData.title || '',
    description: prefillData.description || '',
    severity: prefillData.severity || 'medium'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormErrors([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step validation functions
  const validateStep = (stepNumber: number): boolean => {
    const errors: string[] = [];

    switch (stepNumber) {
      case 1:
        if (!formData.entityType) errors.push('Please select an entity type');
        break;
      case 2:
        if (!formData.entityDetails.fullName.trim()) errors.push('Entity name is required');
        break;
      case 3:
        formData.affectedProjects.forEach((project: any, index: number) => {
          if (!project.projectName.trim()) errors.push(`Project ${index + 1}: Name is required`);
          if (!project.incidentDescription.trim()) errors.push(`Project ${index + 1}: Description is required`);
          if (!project.date.match(/^(0[1-9]|1[0-2])\/\d{4}$/)) errors.push(`Project ${index + 1}: Valid date (MM/YYYY) required`);
        });
        break;
      case 4:
        const validEvidence = formData.evidence.filter((evidence: any) => evidence.url.trim());
        if (validEvidence.length < 2) errors.push('At least 2 evidence links are required');
        validEvidence.forEach((evidence: any, index: number) => {
          if (!evidence.description.trim()) errors.push(`Evidence ${index + 1}: Description is required`);
        });
        break;
      case 5:
        if (!formData.submitterInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.push('Valid email is required');
        if (formData.submitterInfo.acknowledgements.some((ack: boolean) => !ack)) errors.push('All acknowledgements must be accepted');
        break;
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      // Create data that works for both SubmissionFormData and CompatibleSubmissionFormData
      const submissionData: SubmissionFormData | CompatibleSubmissionFormData = {
        ...formData,
        // Required for SubmissionFormData
        id: `submission_${Date.now()}`,
        caseId: `SR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        submittedAt: new Date().toISOString(),
        status: 'submitted' as any,
        // Compatible with both types
        entityType: formData.entityType,
        entityDetails: formData.entityDetails,
        affectedProjects: formData.affectedProjects,
        evidence: formData.evidence.map(ev => ({
          id: ev.id,
          url: ev.url,
          description: ev.description,
          type: ev.type as EvidenceType,  // Cast to EvidenceType
          status: ev.status as EvidenceStatus  // Cast to EvidenceStatus
        })),
        submitterInfo: formData.submitterInfo,
        mode: formData.mode,
        // Optional properties
        confidenceScore: Math.floor(Math.random() * 30) + 70,
        impactScore: 0,
        pointsAwarded: 0,
        updatedAt: new Date().toISOString()
      };

      await onSubmit(submissionData);
      setStep(6); // Success step
    } catch (error) {
      setFormErrors(['Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Entity Type Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 1: Entity Type Selection</h3>
        <p className="text-sm text-gray-400">
          What type of entity are you reporting? This helps us categorize and verify your submission.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          { 
            id: 'marketing-agency', 
            label: 'Marketing Agency', 
            icon: '🏢', 
            description: 'Promotion services, community management, etc.' 
          },
          { 
            id: 'advisor-consultant', 
            label: 'Advisor/Consultant', 
            icon: '👔', 
            description: 'Project advisors, technical consultants, etc.' 
          },
          { 
            id: 'influencer-kol', 
            label: 'Influencer/KOL', 
            icon: '📢', 
            description: 'Content creators, shillers, promoters' 
          },
          { 
            id: 'team-member', 
            label: 'Team Member', 
            icon: '👥', 
            description: 'Core team, developers, founders' 
          }
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setFormData({ ...formData, entityType: type.id as any })}
            className={`p-4 border rounded-xl flex flex-col items-center text-left transition-all ${
              formData.entityType === type.id 
                ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400' 
                : 'border-sifter-border bg-sifter-card hover:bg-sifter-card/80 text-gray-300 hover:border-blue-500/50'
            }`}
          >
            <span className="text-3xl mb-3">{type.icon}</span>
            <span className="font-medium text-base mb-1">{type.label}</span>
            <span className="text-xs text-gray-400 text-center">{type.description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 2: Entity Details
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 2: Entity Details</h3>
        <p className="text-sm text-gray-400">
          Provide identifying information about the entity. More details help with verification.
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Full Name / Company Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.entityDetails.fullName}
            onChange={(e) => setFormData({
              ...formData,
              entityDetails: { ...formData.entityDetails, fullName: e.target.value }
            })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., 'CryptoGrowth Labs' or 'John Doe'"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Twitter Handle</label>
            <input
              type="text"
              value={formData.entityDetails.twitterHandle}
              onChange={(e) => setFormData({
                ...formData,
                entityDetails: { ...formData.entityDetails, twitterHandle: e.target.value }
              })}
              className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="@username"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Website</label>
            <input
              type="text"
              value={formData.entityDetails.website}
              onChange={(e) => setFormData({
                ...formData,
                entityDetails: { ...formData.entityDetails, website: e.target.value }
              })}
              className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Telegram Handle</label>
            <input
              type="text"
              value={formData.entityDetails.telegramHandle}
              onChange={(e) => setFormData({
                ...formData,
                entityDetails: { ...formData.entityDetails, telegramHandle: e.target.value }
              })}
              className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="@telegram"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">LinkedIn Profile</label>
            <input
              type="text"
              value={formData.entityDetails.linkedinProfile}
              onChange={(e) => setFormData({
                ...formData,
                entityDetails: { ...formData.entityDetails, linkedinProfile: e.target.value }
              })}
              className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="linkedin.com/in/..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Affected Projects
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 3: Affected Projects</h3>
        <p className="text-sm text-gray-400">
          List the projects impacted by this entity. Provide specific details about each incident.
        </p>
      </div>
      
      <div className="space-y-4">
        {formData.affectedProjects.map((project: any, index: number) => (
          <div key={index} className="p-4 border border-sifter-border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-white">Project #{index + 1}</h4>
              {formData.affectedProjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newProjects = [...formData.affectedProjects];
                    newProjects.splice(index, 1);
                    setFormData({ ...formData, affectedProjects: newProjects });
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={project.projectName}
                onChange={(e) => {
                  const newProjects = [...formData.affectedProjects];
                  newProjects[index].projectName = e.target.value;
                  setFormData({ ...formData, affectedProjects: newProjects });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 'MoonDoge Protocol'"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Incident Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={project.incidentDescription}
                onChange={(e) => {
                  const newProjects = [...formData.affectedProjects];
                  newProjects[index].incidentDescription = e.target.value;
                  setFormData({ ...formData, affectedProjects: newProjects });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px] focus:border-blue-500 focus:outline-none"
                placeholder="Describe what happened, how the entity was involved, and the impact..."
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Date (MM/YYYY) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={project.date}
                onChange={(e) => {
                  const newProjects = [...formData.affectedProjects];
                  newProjects[index].date = e.target.value;
                  setFormData({ ...formData, affectedProjects: newProjects });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="05/2024"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            affectedProjects: [...formData.affectedProjects, {
              projectName: '',
              incidentDescription: '',
              date: ''
            }]
          })}
          className="w-full p-4 border border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Project
        </button>
      </div>
    </div>
  );

  // Step 4: Evidence
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 4: Evidence</h3>
        <p className="text-sm text-gray-400">
          Provide at least 2 public links as evidence. Strong evidence increases credibility and approval chances.
        </p>
      </div>

      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-green-400 text-xl">✅</div>
          <div>
            <h4 className="font-medium text-white text-sm mb-1">Accepted Evidence Types</h4>
            <ul className="text-sm text-blue-300/80 space-y-1">
              <li>• Twitter/X posts (public URLs only)</li>
              <li>• Reddit threads (reddit.com links)</li>
              <li>• Archived websites (archive.org URLs)</li>
              <li>• News articles (reputable sources)</li>
              <li>• On-chain data (Etherscan, etc.)</li>
              <li>• Public Telegram messages/channels</li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="text-red-400 text-xl">❌</div>
          <div>
            <h4 className="font-medium text-white text-sm mb-1">Rejected Evidence</h4>
            <ul className="text-sm text-red-300/80 space-y-1">
              <li>• Private messages/DMs</li>
              <li>• Screenshots without original URLs</li>
              <li>• Rumors or unverified claims</li>
              <li>• Anonymous tips without evidence</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {formData.evidence.map((evidence: any, index: number) => (
          <div key={evidence.id || index} className="p-4 border border-sifter-border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-white">
                Evidence #{index + 1} {index < 2 && <span className="text-red-400">*</span>}
              </h4>
              {formData.evidence.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const newEvidence = [...formData.evidence];
                    newEvidence.splice(index, 1);
                    setFormData({ ...formData, evidence: newEvidence });
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Evidence URL {index < 2 && <span className="text-red-400">*</span>}
              </label>
              <input
                type="url"
                value={evidence.url}
                onChange={(e) => {
                  const newEvidence = [...formData.evidence];
                  newEvidence[index].url = e.target.value;
                  setFormData({ ...formData, evidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://twitter.com/user/status/123456..."
                required={index < 2}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Description {index < 2 && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={evidence.description}
                onChange={(e) => {
                  const newEvidence = [...formData.evidence];
                  newEvidence[index].description = e.target.value;
                  setFormData({ ...formData, evidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[80px] focus:border-blue-500 focus:outline-none"
                placeholder="What does this evidence show? Why is it important?"
                required={index < 2}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Evidence Type</label>
              <select
                value={evidence.type}
                onChange={(e) => {
                  const newEvidence = [...formData.evidence];
                  newEvidence[index].type = e.target.value as EvidenceType;  // Cast to EvidenceType
                  setFormData({ ...formData, evidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="twitter">Twitter/X Post</option>
                <option value="reddit">Reddit Thread</option>
                <option value="news">News Article</option>
                <option value="archive">Archived Website</option>
                <option value="blockchain">Blockchain Data</option>
                <option value="telegram">Telegram</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            evidence: [...formData.evidence, { 
              id: `evidence_${Date.now()}`, 
              url: '', 
              description: '', 
              type: 'other' as EvidenceType,  // Cast to EvidenceType
              status: 'pending' as EvidenceStatus  // Cast to EvidenceStatus
            }]
          })}
          className="w-full p-4 border border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add More Evidence
        </button>
      </div>
    </div>
  );

  // Step 5: Submitter Info
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 5: Submitter Information</h3>
        <p className="text-sm text-gray-400">
          Your information helps us verify submissions and contact you if needed.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.submitterInfo.email}
            onChange={(e) => setFormData({
              ...formData,
              submitterInfo: { ...formData.submitterInfo, email: e.target.value }
            })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="you@example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Used for submission updates and verification
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Your Name (Optional)</label>
          <input
            type="text"
            value={formData.submitterInfo.name || ''}
            onChange={(e) => setFormData({
              ...formData,
              submitterInfo: { ...formData.submitterInfo, name: e.target.value }
            })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Jane Smith"
          />
          <p className="text-xs text-gray-500 mt-1">
            For attribution and credibility bonus (earn 20% more points)
          </p>
        </div>

        <div className="p-4 border border-sifter-border rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.submitterInfo.anonymous}
              onChange={(e) => setFormData({
                ...formData,
                submitterInfo: { ...formData.submitterInfo, anonymous: e.target.checked }
              })}
              className="w-4 h-4 rounded border-sifter-border bg-sifter-dark text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-300">
              Submit anonymously
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Your name won't appear publicly, but you'll receive fewer points (no credibility bonus)
          </p>
        </div>

        <div className="p-4 border border-sifter-border rounded-lg space-y-3 bg-sifter-dark/50">
          <h4 className="font-medium text-white text-sm">Required Acknowledgements</h4>
          
          {[
            "I verify this information is accurate to the best of my knowledge",
            "I understand this submission may become publicly available (if not anonymous)",
            "I accept the Terms of Service and will not submit false information"
          ].map((text, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="checkbox"
                id={`ack-${index}`}
                checked={formData.submitterInfo.acknowledgements[index] || false}
                onChange={(e) => {
                  const newAcks = [...formData.submitterInfo.acknowledgements];
                  newAcks[index] = e.target.checked;
                  setFormData({
                    ...formData,
                    submitterInfo: { ...formData.submitterInfo, acknowledgements: newAcks }
                  });
                }}
                className="w-4 h-4 mt-0.5 rounded border-sifter-border bg-sifter-dark text-blue-500 focus:ring-blue-500"
                required
              />
              <label htmlFor={`ack-${index}`} className="text-sm text-gray-300">
                {text}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 6: Success Screen
  const renderStep6 = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">Submission Successful!</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Your data donation has been received. Our team will review it within 48-72 hours.
      </p>

      <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-6 mb-8 max-w-md mx-auto">
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-400">Case ID:</span>
            <span className="font-mono text-blue-400">{formData.caseId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entity:</span>
            <span className="text-white font-medium">{formData.entityDetails.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Submitted:</span>
            <span className="text-white">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Estimated Review:</span>
            <span className="text-blue-400">24-48 hours</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => {
            // Reset and start new submission - include ALL required properties
            setStep(1);
            setFormData({
              // Required properties
              id: '',
              caseId: '',
              submittedAt: '',
              
              entityType: 'marketing-agency',
              entityDetails: { fullName: '', twitterHandle: '', telegramHandle: '', linkedinProfile: '', website: '' },
              affectedProjects: [{ projectName: '', incidentDescription: '', date: '' }],
              evidence: [
                { 
                  id: `evidence_${Date.now()}_1`, 
                  url: '', 
                  description: '', 
                  type: 'other' as EvidenceType,  // Cast to EvidenceType
                  status: 'pending' as EvidenceStatus  // Cast to EvidenceStatus
                },
                { 
                  id: `evidence_${Date.now()}_2`, 
                  url: '', 
                  description: '', 
                  type: 'other' as EvidenceType,  // Cast to EvidenceType
                  status: 'pending' as EvidenceStatus  // Cast to EvidenceStatus
                }
              ],
              submitterInfo: {
                email: userEmail || '',
                name: userName || '',
                anonymous: false,
                acknowledgements: [false, false, false]
              },
              mode: mode || 'individual',
              status: 'draft',
              
              // Optional properties with defaults
              confidenceScore: 0,
              impactScore: 0,
              pointsAwarded: 0,
              updatedAt: '',
              title: '',
              description: '',
              severity: 'medium'
            });
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all"
        >
          Submit Another
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-sifter-card/95 backdrop-blur-sm border-b border-sifter-border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Data Donation Submission</h2>
                <p className="text-sm text-gray-400">
                  Mode: <span className="text-blue-400">{(mode || 'individual').toUpperCase()}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            {step < 6 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Step {step} of 5</span>
                  <span>{step * 20}% Complete</span>
                </div>
                <div className="w-full bg-sifter-border rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${step * 20}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {formErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.994-.833-2.764 0L4.67 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-medium">Please fix the following errors:</span>
                </div>
                <ul className="text-sm text-red-300 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {renderStep()}

            {/* Navigation buttons */}
            {step < 5 && (
              <div className="mt-8 flex justify-between pt-6 border-t border-sifter-border">
                <div>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={step < 5 ? handleNextStep : handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                           text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                           flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      {step < 5 ? 'Continue' : 'Submit Report'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}