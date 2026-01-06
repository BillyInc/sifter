'use client';

import React, { useState } from 'react';
import type { FeedbackFormData } from '@/types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function FeedbackModal({ isOpen, onClose, onSubmitSuccess }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<FeedbackFormData>({
    dashboardOpinion: '',
    improvements: '',
    wouldUse: 'maybe',
    solvesProblem: '',
    referralName: '',
    referralTwitter: '',
    email: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
          source: 'dashboard-modal',
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        onSubmitSuccess?.();
        // Reset form
        setFormData({
          dashboardOpinion: '',
          improvements: '',
          wouldUse: 'maybe',
          solvesProblem: '',
          referralName: '',
          referralTwitter: '',
          email: '',
        });
        // Close modal after showing success
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.dashboardOpinion.trim().length > 0 &&
      formData.improvements.trim().length > 0 &&
      formData.solvesProblem.trim().length > 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-sifter-card border border-sifter-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-sifter-card/95 backdrop-blur-sm border-b border-sifter-border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Share Your Feedback</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Help us improve Sifter by sharing your thoughts
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Success State */}
          {submitStatus === 'success' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
              <p className="text-gray-400">Your feedback has been submitted successfully.</p>
            </div>
          )}

          {/* Form */}
          {submitStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Dashboard Opinion */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you think about the dashboard? <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="dashboardOpinion"
                  value={formData.dashboardOpinion}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Share your overall impression of the dashboard..."
                  required
                />
              </div>

              {/* Improvements */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What would you want improved? <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="improvements"
                  value={formData.improvements}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[100px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="What features or aspects could be better..."
                  required
                />
              </div>

              {/* Would Use */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Is this something you would use when it goes live? <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'yes', label: 'Yes', icon: '👍', color: 'green' },
                    { value: 'maybe', label: 'Maybe', icon: '🤔', color: 'amber' },
                    { value: 'no', label: 'No', icon: '👎', color: 'red' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, wouldUse: option.value as 'yes' | 'no' | 'maybe' }))}
                      className={`p-4 border rounded-xl flex flex-col items-center justify-center transition-all ${
                        formData.wouldUse === option.value
                          ? `bg-${option.color}-500/20 text-${option.color}-400 border-${option.color}-500/50`
                          : 'border-sifter-border hover:border-blue-500/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Solves Problem */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Does it solve an existing problem for you? <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="solvesProblem"
                  value={formData.solvesProblem}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-sifter-dark border border-sifter-border rounded-lg text-white min-h-[80px] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Describe the problem this tool solves for you, or what problem you wish it solved..."
                  required
                />
              </div>

              {/* Referral Section */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl">
                <h4 className="font-medium text-white mb-3">Know someone who would benefit?</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Their name</label>
                    <input
                      type="text"
                      name="referralName"
                      value={formData.referralName}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Their Twitter handle</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                      <input
                        type="text"
                        name="referralTwitter"
                        value={formData.referralTwitter}
                        onChange={handleInputChange}
                        className="w-full p-3 pl-8 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your email <span className="text-gray-500">(optional, for follow-up)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-sifter-dark border border-sifter-border rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4 border-t border-sifter-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700
                           text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
