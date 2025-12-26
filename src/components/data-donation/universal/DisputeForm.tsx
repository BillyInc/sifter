'use client';

import React, { useState } from 'react';

interface DisputeFormProps {
  entityData: string[]; // [entityName, submissionId, caseId, entityType, submitterEmail]
  userData: string[]; // [userName, userEmail, userRole, companyName]
  onSubmit: (disputeData: any[]) => void;
  onCancel: () => void;
  userMode: 'ea-vc' | 'researcher' | 'individual';
}

export default function DisputeForm({
  entityData = ['', '', '', '', ''],
  userData = ['', '', '', ''],
  onSubmit,
  onCancel,
  userMode = 'individual'
}: DisputeFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Unpack data
  const [entityName, submissionId, caseId, entityType, submitterEmail] = entityData;
  const [userName, userEmail, userRole, companyName] = userData;
  
  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Relationship
    relationship: 'authorized-representative',
    authorizationProof: '',
    
    // Step 2: Contact Info
    contactName: userName || '',
    contactEmail: userEmail || '',
    contactPhone: '',
    position: userRole || '',
    company: companyName || '',
    
    // Step 3: Dispute Details
    disputeCategories: [] as string[],
    detailedExplanation: '',
    
    // Step 4: Counter Evidence
    counterEvidence: [] as Array<{
      type: string;
      url: string;
      description: string;
    }>,
    
    // Step 5: Resolution Request
    requestedResolution: 'remove-from-database',
    resolutionExplanation: '',
    
    // Step 6: Verification
    verificationMethod: 'email',
    agreeToTerms: false,
    agreeToAccuracy: false
  });

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: string[] = [];
    
    switch (stepNumber) {
      case 1:
        if (!formData.relationship) newErrors.push('Please select your relationship to the entity');
        if (formData.relationship === 'authorized-representative' && !formData.authorizationProof.trim()) {
          newErrors.push('Please provide authorization proof');
        }
        break;
        
      case 2:
        if (!formData.contactName.trim()) newErrors.push('Full name is required');
        if (!formData.contactEmail.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          newErrors.push('Valid email is required');
        }
        if (!formData.position.trim()) newErrors.push('Position/title is required');
        break;
        
      case 3:
        if (formData.disputeCategories.length === 0) newErrors.push('Please select at least one dispute category');
        if (!formData.detailedExplanation.trim() || formData.detailedExplanation.length < 50) {
          newErrors.push('Please provide a detailed explanation (minimum 50 characters)');
        }
        break;
        
      case 4:
        if (formData.counterEvidence.length === 0) newErrors.push('Please provide at least one piece of counter-evidence');
        formData.counterEvidence.forEach((evidence, index) => {
          if (!evidence.url.trim()) newErrors.push(`Evidence ${index + 1}: URL is required`);
          if (!evidence.description.trim()) newErrors.push(`Evidence ${index + 1}: Description is required`);
        });
        break;
        
      case 5:
        if (!formData.resolutionExplanation.trim() || formData.resolutionExplanation.length < 30) {
          newErrors.push('Please explain why this resolution should be granted');
        }
        break;
        
      case 6:
        if (!formData.agreeToTerms) newErrors.push('You must agree to the terms of service');
        if (!formData.agreeToAccuracy) newErrors.push('You must confirm the accuracy of your information');
        break;
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    
    setIsSubmitting(true);
    try {
      // Prepare dispute data in array format
      const disputeData = [
        // Entity info
        entityName,
        submissionId,
        caseId,
        entityType,
        
        // User info
        formData.contactName,
        formData.contactEmail,
        formData.position,
        formData.company,
        
        // Dispute details
        formData.relationship,
        formData.disputeCategories,
        formData.detailedExplanation,
        
        // Counter evidence
        formData.counterEvidence,
        
        // Resolution
        formData.requestedResolution,
        formData.resolutionExplanation,
        
        // Metadata
        new Date().toISOString(),
        userMode
      ];
      
      await onSubmit(disputeData);
      setStep(7); // Success step
    } catch (error) {
      setErrors(['Submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Relationship
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 1: Your Relationship to the Entity</h3>
        <p className="text-sm text-gray-400">
          Please specify how you're connected to "{entityName || 'this entity'}"
        </p>
      </div>
      
      <div className="space-y-4">
        {[
          {
            id: 'authorized-representative',
            title: 'Authorized Representative',
            description: 'I am legally authorized to represent this entity',
            icon: '⚖️'
          },
          {
            id: 'individual-named',
            title: 'Individual Named',
            description: 'I am the individual named in the submission',
            icon: '👤'
          },
          {
            id: 'disputing-with-authorization',
            title: 'Disputing with Authorization',
            description: 'I have authorization from the entity to dispute this',
            icon: '📝'
          },
          {
            id: 'other',
            title: 'Other',
            description: 'Other relationship or interested party',
            icon: '🔍'
          }
        ].map((option) => (
          <div
            key={option.id}
            onClick={() => setFormData({ ...formData, relationship: option.id })}
            className={`p-4 border rounded-xl cursor-pointer transition-all ${
              formData.relationship === option.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-blue-600/10'
                : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-dark/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{option.icon}</div>
              <div>
                <h4 className="font-medium text-white">{option.title}</h4>
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {formData.relationship === 'authorized-representative' && (
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2">
            Authorization Proof (Required)
          </label>
          <textarea
            value={formData.authorizationProof}
            onChange={(e) => setFormData({ ...formData, authorizationProof: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px] focus:border-blue-500 focus:outline-none"
            placeholder="Describe your authorization, include any documentation or legal basis..."
            required
          />
        </div>
      )}
    </div>
  );

  // Step 2: Contact Info
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 2: Contact Information</h3>
        <p className="text-sm text-gray-400">
          We need your contact details for verification and communication
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Position/Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="e.g., CEO, Legal Counsel, Community Manager"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-400 mb-2">Phone Number (Optional)</label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">Company/Organization</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
          placeholder="If applicable"
        />
      </div>
    </div>
  );

  // Step 3: Dispute Details
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 3: Dispute Details</h3>
        <p className="text-sm text-gray-400">
          What specifically are you disputing about the submission?
        </p>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-3">
          Dispute Categories <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Factual Inaccuracies',
            'Misrepresentation',
            'False Evidence',
            'Outdated Information',
            'Identity Mistake',
            'Context Missing',
            'Other Errors'
          ].map((category) => (
            <div
              key={category}
              onClick={() => {
                const newCategories = formData.disputeCategories.includes(category)
                  ? formData.disputeCategories.filter(c => c !== category)
                  : [...formData.disputeCategories, category];
                setFormData({ ...formData, disputeCategories: newCategories });
              }}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                formData.disputeCategories.includes(category)
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-sifter-border hover:border-blue-500/50 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border ${
                  formData.disputeCategories.includes(category)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-sifter-border'
                }`}>
                  {formData.disputeCategories.includes(category) && (
                    <div className="w-full h-full flex items-center justify-center text-xs">✓</div>
                  )}
                </div>
                <span>{category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Detailed Explanation <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.detailedExplanation}
          onChange={(e) => setFormData({ ...formData, detailedExplanation: e.target.value })}
          className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[150px] focus:border-blue-500 focus:outline-none"
          placeholder="Provide a detailed explanation of why you're disputing this submission. Be specific about what is incorrect and why..."
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          Minimum 50 characters. Current: {formData.detailedExplanation.length}
        </div>
      </div>
    </div>
  );

  // Step 4: Counter Evidence
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 4: Counter Evidence</h3>
        <p className="text-sm text-gray-400">
          Provide evidence that contradicts or corrects the original submission
        </p>
      </div>
      
      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <div className="text-green-400 text-xl">✅</div>
          <div>
            <h4 className="font-medium text-white text-sm mb-1">Accepted Evidence Types</h4>
            <ul className="text-sm text-blue-300/80 space-y-1">
              <li>• Official documentation (website, whitepaper)</li>
              <li>• Verifiable public statements</li>
              <li>• Legal documents (with sensitive info redacted)</li>
              <li>• On-chain proof of identity or association</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {formData.counterEvidence.map((evidence, index) => (
          <div key={index} className="p-4 border border-sifter-border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-white">Evidence #{index + 1}</h4>
              <button
                type="button"
                onClick={() => {
                  const newEvidence = [...formData.counterEvidence];
                  newEvidence.splice(index, 1);
                  setFormData({ ...formData, counterEvidence: newEvidence });
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Evidence URL <span className="text-red-400">*</span></label>
              <input
                type="url"
                value={evidence.url}
                onChange={(e) => {
                  const newEvidence = [...formData.counterEvidence];
                  newEvidence[index].url = e.target.value;
                  setFormData({ ...formData, counterEvidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com/proof"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description <span className="text-red-400">*</span></label>
              <textarea
                value={evidence.description}
                onChange={(e) => {
                  const newEvidence = [...formData.counterEvidence];
                  newEvidence[index].description = e.target.value;
                  setFormData({ ...formData, counterEvidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[80px] focus:border-blue-500 focus:outline-none"
                placeholder="What does this evidence prove? How does it contradict the submission?"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Evidence Type</label>
              <select
                value={evidence.type}
                onChange={(e) => {
                  const newEvidence = [...formData.counterEvidence];
                  newEvidence[index].type = e.target.value;
                  setFormData({ ...formData, counterEvidence: newEvidence });
                }}
                className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="website">Official Website</option>
                <option value="document">Documentation</option>
                <option value="statement">Public Statement</option>
                <option value="legal">Legal Document</option>
                <option value="blockchain">Blockchain Proof</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => setFormData({
            ...formData,
            counterEvidence: [...formData.counterEvidence, { type: 'website', url: '', description: '' }]
          })}
          className="w-full p-4 border border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Counter Evidence
        </button>
      </div>
    </div>
  );

  // Step 5: Resolution Request
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 5: Resolution Request</h3>
        <p className="text-sm text-gray-400">
          What resolution are you requesting for this dispute?
        </p>
      </div>
      
      <div className="space-y-4">
        {[
          {
            id: 'remove-from-database',
            title: 'Remove from Database',
            description: 'Remove all information about this entity from Sifter',
            icon: '🗑️'
          },
          {
            id: 'correct-information',
            title: 'Correct Information',
            description: 'Update the submission with corrected information',
            icon: '✏️'
          },
          {
            id: 'add-context',
            title: 'Add Context/Clarification',
            description: 'Add explanatory context to the existing submission',
            icon: '📝'
          },
          {
            id: 'investigate-submitter',
            title: 'Investigate Submitter',
            description: 'Investigate the submitter for false reporting',
            icon: '🔍'
          }
        ].map((option) => (
          <div
            key={option.id}
            onClick={() => setFormData({ ...formData, requestedResolution: option.id })}
            className={`p-4 border rounded-xl cursor-pointer transition-all ${
              formData.requestedResolution === option.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-blue-600/10'
                : 'border-sifter-border hover:border-blue-500/50 hover:bg-sifter-dark/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{option.title}</h4>
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border ${
                formData.requestedResolution === option.id
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-sifter-border'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          Resolution Explanation <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.resolutionExplanation}
          onChange={(e) => setFormData({ ...formData, resolutionExplanation: e.target.value })}
          className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[120px] focus:border-blue-500 focus:outline-none"
          placeholder="Explain why you believe this resolution is appropriate and fair..."
          required
        />
      </div>
    </div>
  );

  // Step 6: Verification
  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Step 6: Verification</h3>
        <p className="text-sm text-gray-400">
          Final verification and agreement before submission
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Verification Method</label>
          <select
            value={formData.verificationMethod}
            onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
            className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="email">Email Verification</option>
            <option value="document">Document Upload</option>
            <option value="video-call">Video Call (Scheduled)</option>
          </select>
        </div>
        
        <div className="p-4 border border-sifter-border rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded border-sifter-border bg-sifter-dark text-blue-500 focus:ring-blue-500"
              required
            />
            <div>
              <label htmlFor="agreeToTerms" className="text-sm text-white font-medium mb-1">
                I agree to the Dispute Process Terms
              </label>
              <p className="text-xs text-gray-400">
                By checking this box, you agree to our dispute resolution process, 
                including verification procedures and potential legal review.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToAccuracy"
              checked={formData.agreeToAccuracy}
              onChange={(e) => setFormData({ ...formData, agreeToAccuracy: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded border-sifter-border bg-sifter-dark text-blue-500 focus:ring-blue-500"
              required
            />
            <div>
              <label htmlFor="agreeToAccuracy" className="text-sm text-white font-medium mb-1">
                I confirm the accuracy of my information
              </label>
              <p className="text-xs text-gray-400">
                I verify that all information provided in this dispute is accurate 
                to the best of my knowledge and that I am authorized to submit this dispute.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 7: Success
  const renderStep7 = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">Dispute Submitted Successfully!</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">
        Your dispute has been received. Our team will review it within 24-48 hours.
      </p>
      
      <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-6 mb-8 max-w-md mx-auto">
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-gray-400">Dispute ID:</span>
            <span className="font-mono text-blue-400">DIS-{new Date().getFullYear()}-{Math.floor(Math.random() * 10000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entity:</span>
            <span className="text-white font-medium">{entityName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Submitted:</span>
            <span className="text-white">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Next Step:</span>
            <span className="text-blue-400">Verification Email Sent</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                   text-white rounded-lg font-medium transition-all"
        >
          Print Receipt
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
      case 7: return renderStep7();
      default: return renderStep1();
    }
  };

return (
  <div className="w-full">
    {/* Header */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Submit Dispute</h2>
          <div className="text-sm text-gray-400">
            Entity: <span className="text-red-400">{entityName}</span>
            {caseId && <> • Case: <span className="text-blue-400">{caseId}</span></>}
          </div>
        </div>
      </div>

      {/* Progress */}
      {step < 7 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Step {step} of 6</span>
            <span>{Math.round((step / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-sifter-border rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>

    {/* Content */}
    <div>
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.994-.833-2.764 0L4.67 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Please fix the following:</span>
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {renderStep()}

      {/* Navigation */}
      {step < 7 && (
        <div className="mt-8 flex justify-between pt-6 border-t border-sifter-border">
          <div>
            {step > 1 && step < 7 && (
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
            onClick={step < 6 ? handleNextStep : handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              step < 6
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                {step < 6 ? 'Continue' : 'Submit Dispute'}
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
);
}