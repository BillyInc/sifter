// src/components/disputes/DisputeFilingForm.tsx - COMPLETE VERSION
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EntityEntry } from '@/types/datadonation';
import { Dispute, DisputeCategory, DisputeResolution } from '@/types/disputes';

interface DisputeFilingFormProps {
  entity: EntityEntry;
  onClose?: () => void;
}

export default function DisputeFilingForm({ entity, onClose }: DisputeFilingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  
  const [formData, setFormData] = useState({
    // Step 1: Your Relationship
    disputerName: '',
    disputerEmail: '',
    disputerTitle: '',
    disputerRelationship: '' as 'representative' | 'individual' | 'other',
    companyDomain: '',
    phoneNumber: '',
    
    // Step 2: What are you disputing?
    categories: [] as DisputeCategory[],
    
    // Step 3: Detailed Explanation
    explanation: '',
    
    // Step 4: Counter Evidence
    counterEvidence: [] as Array<{
      type: string;
      title: string;
      url?: string;
      file?: File;
      description: string;
      isUploading?: boolean;
    }>,
    
    // Step 5: Address Specific Allegations
    allegationResponses: entity.allegations?.map(allegation => ({
      allegationId: allegation.id,
      allegationText: allegation.description,
      response: '',
      evidenceIds: [] as string[]
    })) || [],
    
    // Step 6: Requested Resolution
    requestedResolution: '' as DisputeResolution,
    resolutionExplanation: '',
    
    // Step 7: Verification
    verificationMethod: '' as 'email' | 'document' | 'call',
    verificationNotes: '',
    
    // Acknowledgements
    acknowledgements: {
      authorized: false,
      noFalseInfo: false,
      goodFaith: false,
      readPolicy: false
    }
  });

  // Step 5: Allegation Responses Component
  const Step5Allegations = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Address Specific Allegations</h2>
      
      <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 mb-4">
        <h3 className="font-medium text-white mb-2">📋 How This Works:</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• We've listed each allegation from the database entry</li>
          <li>• For each one, provide your response</li>
          <li>• Link to counter-evidence where relevant</li>
        </ul>
      </div>
      
      <div className="space-y-6">
        {formData.allegationResponses.map((response, index) => (
          <div key={response.allegationId} className="border border-sifter-border rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-sm">
                  {index + 1}
                </div>
                <h3 className="font-medium text-white">Allegation #{index + 1}</h3>
              </div>
              <div className="bg-sifter-dark p-4 rounded-lg border border-sifter-border">
                <p className="text-gray-300">{response.allegationText}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-white font-medium mb-3">
                Your Response: *
              </label>
              <textarea
                value={response.response}
                onChange={(e) => {
                  const updated = [...formData.allegationResponses];
                  updated[index].response = e.target.value;
                  setFormData({...formData, allegationResponses: updated});
                }}
                className="w-full h-32 px-4 py-3 bg-sifter-dark border border-sifter-border rounded-lg text-white resize-none"
                placeholder="Explain why this allegation is incorrect..."
              />
              
              <div className="mt-3">
                <label className="block text-sm text-gray-400 mb-2">
                  Link to supporting evidence (optional):
                </label>
                <select
                  value={response.evidenceIds[0] || ''}
                  onChange={(e) => {
                    const updated = [...formData.allegationResponses];
                    updated[index].evidenceIds = e.target.value ? [e.target.value] : [];
                    setFormData({...formData, allegationResponses: updated});
                  }}
                  className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                >
                  <option value="">Select counter-evidence...</option>
                  {formData.counterEvidence.map((ev, evIndex) => (
                    <option key={evIndex} value={`ev-${evIndex}`}>
                      {ev.title} ({ev.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        
        {formData.allegationResponses.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-sifter-border rounded-lg">
            <div className="text-gray-400 mb-2">No specific allegations found in this entry</div>
            <p className="text-sm text-gray-500">
              Continue to the next step to provide general dispute information
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Step 6: Requested Resolution
  const Step6Resolution = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Requested Resolution</h2>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-400 mb-2">🏛️ Our Commitment:</h3>
        <p className="text-sm text-gray-300">
          We commit to reviewing all disputes within <strong>10 business days</strong> and providing a clear resolution.
          All decisions are based on verifiable evidence and transparent criteria.
        </p>
      </div>
      
      <div className="space-y-4">
        <label className="block text-white font-medium mb-2">
          What resolution are you requesting? *
        </label>
        
        {[
          {
            id: 'remove_entry',
            title: 'Remove this entry entirely',
            description: 'The entry should be removed because it is completely incorrect',
            icon: '🗑️'
          },
          {
            id: 'update_entry',
            title: 'Update/correct specific information',
            description: 'Some information is wrong but the entry should remain',
            icon: '📝'
          },
          {
            id: 'add_context',
            title: 'Add clarifying context',
            description: 'The entry needs additional context to be fair',
            icon: '📄'
          },
          {
            id: 'reduce_risk_score',
            title: 'Adjust the risk score/assessment',
            description: 'The severity or risk level is inaccurate',
            icon: '📊'
          }
        ].map((option) => (
          <label key={option.id} className="flex items-start space-x-3 p-4 border border-sifter-border rounded-lg hover:bg-sifter-dark/30 cursor-pointer">
            <input
              type="radio"
              value={option.id}
              checked={formData.requestedResolution === option.id}
              onChange={(e) => setFormData({
                ...formData, 
                requestedResolution: e.target.value as DisputeResolution
              })}
              className="mt-1 text-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span>{option.icon}</span>
                <span className="font-medium text-white">{option.title}</span>
              </div>
              <div className="text-sm text-gray-400">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      {formData.requestedResolution && (
        <div className="mt-6">
          <label className="block text-white font-medium mb-3">
            Additional details about your requested resolution: *
          </label>
          <textarea
            value={formData.resolutionExplanation}
            onChange={(e) => setFormData({
              ...formData, 
              resolutionExplanation: e.target.value
            })}
            className="w-full h-40 px-4 py-3 bg-sifter-dark border border-sifter-border rounded-lg text-white resize-none"
            placeholder="Provide specific details about what changes you want to see..."
          />
          <div className="text-right text-sm text-gray-400 mt-2">
            {formData.resolutionExplanation.length} / 2000 characters
          </div>
        </div>
      )}
    </div>
  );

  // Step 7: Verification & Acknowledgements
  const Step7Verification = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Verification & Acknowledgements</h2>
      
      {/* Verification Method */}
      <div className="space-y-4">
        <label className="block text-white font-medium mb-2">
          How would you like us to verify your identity? *
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'email',
              title: 'Email Verification',
              description: 'Reply to verification email from company domain',
              icon: '✉️'
            },
            {
              id: 'document',
              title: 'Document Upload',
              description: 'Upload official documents',
              icon: '📄'
            },
            {
              id: 'call',
              title: 'Phone Call',
              description: 'Schedule a verification call',
              icon: '📞'
            }
          ].map((method) => (
            <label key={method.id} className="flex flex-col p-4 border border-sifter-border rounded-lg hover:bg-sifter-dark/30 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  value={method.id}
                  checked={formData.verificationMethod === method.id}
                  onChange={(e) => setFormData({
                    ...formData, 
                    verificationMethod: e.target.value as 'email' | 'document' | 'call'
                  })}
                  className="text-blue-500"
                />
                <span className="text-xl">{method.icon}</span>
                <span className="font-medium text-white">{method.title}</span>
              </div>
              <div className="text-sm text-gray-400">{method.description}</div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Verification Notes */}
      {formData.verificationMethod && (
        <div className="mt-6">
          <label className="block text-white font-medium mb-3">
            Additional verification notes:
          </label>
          <textarea
            value={formData.verificationNotes}
            onChange={(e) => setFormData({
              ...formData, 
              verificationNotes: e.target.value
            })}
            className="w-full h-32 px-4 py-3 bg-sifter-dark border border-sifter-border rounded-lg text-white resize-none"
            placeholder="Any special instructions for verification..."
          />
        </div>
      )}
      
      {/* Acknowledgements */}
      <div className="mt-8 pt-6 border-t border-sifter-border">
        <h3 className="font-medium text-white mb-4">Required Acknowledgements</h3>
        
        <div className="space-y-4">
          {[
            {
              id: 'authorized',
              label: 'I am authorized to file this dispute on behalf of the entity',
              required: true
            },
            {
              id: 'noFalseInfo',
              label: 'I certify that all information provided is truthful to the best of my knowledge',
              required: true
            },
            {
              id: 'goodFaith',
              label: 'I am filing this dispute in good faith',
              required: true
            },
            {
              id: 'readPolicy',
              label: 'I have read and agree to the Dispute Resolution Policy',
              required: true
            }
          ].map((ack) => (
            <label key={ack.id} className="flex items-start space-x-3 p-3 border border-sifter-border rounded-lg hover:bg-sifter-dark/30 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acknowledgements[ack.id as keyof typeof formData.acknowledgements]}
                onChange={(e) => setFormData({
                  ...formData,
                  acknowledgements: {
                    ...formData.acknowledgements,
                    [ack.id]: e.target.checked
                  }
                })}
                className="mt-1 text-blue-500"
              />
              <div>
                <span className="text-white">{ack.label}</span>
                {ack.required && <span className="ml-2 text-red-400">*</span>}
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Summary */}
      <div className="mt-6 bg-sifter-dark/50 border border-sifter-border rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">📋 Dispute Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Case:</span>
            <span className="text-white">{entity.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Categories:</span>
            <span className="text-white">{formData.categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Evidence Items:</span>
            <span className="text-white">{formData.counterEvidence.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Requested:</span>
            <span className="text-white">{formData.requestedResolution?.replace('_', ' ') || 'Not specified'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Validation function
  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.disputerName && formData.disputerEmail && formData.disputerTitle && formData.disputerRelationship;
      case 2:
        return formData.categories.length > 0;
      case 3:
        return formData.explanation.length >= 100;
      case 4:
        return formData.counterEvidence.length > 0;
      case 5:
        return true; // Allegations are optional
      case 6:
        return formData.requestedResolution && formData.resolutionExplanation.length >= 50;
      case 7:
        return formData.verificationMethod && 
               Object.values(formData.acknowledgements).every(v => v);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      alert('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      const dispute: Dispute = {
        id: `dispute-${Date.now()}`,
        caseId: `DISP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        entityId: entity.id,
        entityName: entity.name,
        entityType: entity.type,
        
        disputerName: formData.disputerName,
        disputerEmail: formData.disputerEmail,
        disputerTitle: formData.disputerTitle,
        disputerRelationship: formData.disputerRelationship,
        companyDomain: formData.companyDomain,
        
        categories: formData.categories,
        explanation: formData.explanation,
        requestedResolution: formData.requestedResolution as DisputeResolution,
        resolutionExplanation: formData.resolutionExplanation,
        
        counterEvidence: formData.counterEvidence.map((ev, index) => ({
          id: `ev-${Date.now()}-${index}`,
          type: ev.type,
          title: ev.title,
          url: ev.url,
          description: ev.description,
          uploadedAt: new Date().toISOString()
        })),
        
        allegationResponses: formData.allegationResponses,
        
        status: 'pending',
        filedAt: new Date().toISOString(),
        resolutionDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        
        verificationMethod: formData.verificationMethod,
        isVerified: false,
        adminNotes: formData.verificationNotes,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Submit to backend
      console.log('Submitting dispute:', dispute);
      // await submitDispute(dispute);
      
      // Redirect to confirmation
      router.push(`/disputes/confirmation/${dispute.caseId}`);
      
    } catch (error) {
      console.error('Failed to submit dispute:', error);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File, index: number) => {
    const updatedEvidence = [...formData.counterEvidence];
    updatedEvidence[index] = {
      ...updatedEvidence[index],
      file,
      isUploading: true
    };
    setFormData({...formData, counterEvidence: updatedEvidence});
    
    // Simulate upload
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({...prev, [index]: progress}));
      if (progress >= 100) {
        clearInterval(interval);
        updatedEvidence[index].isUploading = false;
        setFormData({...formData, counterEvidence: updatedEvidence});
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[90] overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-sifter-card border border-sifter-border rounded-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-sifter-card border-b border-sifter-border p-6 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">File a Dispute</h1>
                <p className="text-gray-400">
                  Case: {entity.name} • ID: {entity.id}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5, 6, 7].map((stepNum) => (
                  <React.Fragment key={stepNum}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        step === stepNum 
                          ? 'border-blue-500 bg-blue-500/20 text-blue-500' 
                          : step > stepNum 
                            ? 'border-green-500 bg-green-500/20 text-green-500' 
                            : 'border-gray-600 text-gray-500'
                      }`}>
                        {step > stepNum ? '✓' : stepNum}
                      </div>
                      <div className="text-xs mt-2 text-gray-400 text-center">
                        {['Relationship', 'What', 'Explain', 'Evidence', 'Allegations', 'Resolution', 'Verify'][stepNum-1]}
                      </div>
                    </div>
                    {stepNum < 7 && (
                      <div className={`flex-1 h-1 mx-2 ${
                        step > stepNum ? 'bg-green-500' : 'bg-gray-700'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            {/* Step 1: Your Relationship (Your existing code - keep as is) */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Your Relationship to This Entity</h2>
                {/* ... Your existing Step 1 code ... */}
              </div>
            )}
            
            {/* Step 2: What are you disputing? (Your existing code - keep as is) */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">What Are You Disputing?</h2>
                {/* ... Your existing Step 2 code ... */}
              </div>
            )}
            
            {/* Step 3: Detailed Explanation (Your existing code - keep as is) */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Detailed Explanation</h2>
                {/* ... Your existing Step 3 code ... */}
              </div>
            )}
            
            {/* Step 4: Counter Evidence (Enhanced version) */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Counter Evidence</h2>
                
                <div className="bg-sifter-dark/50 border border-sifter-border rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-white mb-2">✅ What we accept:</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Official company statements/press releases</li>
                    <li>• Legal documents (contracts, agreements)</li>
                    <li>• Third-party audits or reports</li>
                    <li>• Correspondence with project teams</li>
                    <li>• Portfolio pages showing successful projects</li>
                    <li>• News articles from reputable sources</li>
                    <li>• Client testimonials (verifiable)</li>
                  </ul>
                </div>
                
                {/* Evidence Items */}
                <div className="space-y-4">
                  {formData.counterEvidence.map((evidence, index) => (
                    <div key={index} className="border border-sifter-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-white">Evidence Document #{index + 1}</h4>
                        <button
                          onClick={() => {
                            const newEvidence = [...formData.counterEvidence];
                            newEvidence.splice(index, 1);
                            setFormData({...formData, counterEvidence: newEvidence});
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Type of Evidence</label>
                          <select
                            value={evidence.type}
                            onChange={(e) => {
                              const newEvidence = [...formData.counterEvidence];
                              newEvidence[index].type = e.target.value;
                              setFormData({...formData, counterEvidence: newEvidence});
                            }}
                            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                          >
                            <option value="">Select type...</option>
                            <option value="official_statement">Official Statement</option>
                            <option value="legal_document">Legal Document</option>
                            <option value="audit_report">Audit Report</option>
                            <option value="correspondence">Correspondence</option>
                            <option value="portfolio">Portfolio/Website</option>
                            <option value="news_article">News Article</option>
                            <option value="testimonial">Testimonial</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Title *</label>
                          <input
                            type="text"
                            value={evidence.title}
                            onChange={(e) => {
                              const newEvidence = [...formData.counterEvidence];
                              newEvidence[index].title = e.target.value;
                              setFormData({...formData, counterEvidence: newEvidence});
                            }}
                            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                            placeholder="e.g., 'Official Press Release - Jan 2024'"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">URL (if online)</label>
                          <input
                            type="url"
                            value={evidence.url || ''}
                            onChange={(e) => {
                              const newEvidence = [...formData.counterEvidence];
                              newEvidence[index].url = e.target.value;
                              setFormData({...formData, counterEvidence: newEvidence});
                            }}
                            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Or Upload File</label>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, index);
                            }}
                            className="w-full px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30"
                          />
                          {evidence.isUploading && (
                            <div className="mt-2">
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${uploadProgress[index] || 0}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-400 mt-1 text-right">
                                {uploadProgress[index] || 0}%
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Description *</label>
                          <textarea
                            value={evidence.description}
                            onChange={(e) => {
                              const newEvidence = [...formData.counterEvidence];
                              newEvidence[index].description = e.target.value;
                              setFormData({...formData, counterEvidence: newEvidence});
                            }}
                            className="w-full h-24 px-4 py-2 bg-sifter-dark border border-sifter-border rounded-lg text-white resize-none"
                            placeholder="Explain what this evidence shows and why it's relevant..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        counterEvidence: [...formData.counterEvidence, {
                          type: '',
                          title: '',
                          description: '',
                          url: ''
                        }]
                      });
                    }}
                    className="w-full py-4 border-2 border-dashed border-sifter-border rounded-lg text-gray-400 hover:text-white hover:border-blue-500/50 transition-colors flex flex-col items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Add More Evidence</span>
                    <span className="text-xs text-gray-500">Maximum 10 evidence items</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 5: Allegation Responses */}
            {step === 5 && <Step5Allegations />}
            
            {/* Step 6: Requested Resolution */}
            {step === 6 && <Step6Resolution />}
            
            {/* Step 7: Verification */}
            {step === 7 && <Step7Verification />}
            
            {/* Validation Error */}
            {!validateStep() && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-400">
                  <span>⚠️</span>
                  <span>Please complete all required fields before proceeding</span>
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-sifter-border flex justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg font-medium transition-colors"
                >
                  ← Previous Step
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg font-medium transition-colors"
                >
                  ← Cancel
                </button>
              )}
              
              <button
                onClick={() => {
                  if (step < 7) {
                    if (validateStep()) {
                      setStep(step + 1);
                    } else {
                      alert('Please complete all required fields');
                    }
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={isSubmitting || !validateStep()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step < 7 ? 'Continue →' : isSubmitting ? 'Submitting...' : 'Submit Dispute'}
              </button>
            </div>
            
            {/* Step Indicator */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Step {step} of 7 • {Math.round((step / 7) * 100)}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}