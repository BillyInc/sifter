'use client';

import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
  variant?: 'floating' | 'inline' | 'minimal';
  className?: string;
}

export default function FeedbackButton({ variant = 'floating', className = '' }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Floating button (fixed position)
  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={openModal}
          className={`fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                     hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg
                     hover:shadow-xl transition-all flex items-center gap-2 group ${className}`}
          aria-label="Share Feedback"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="font-medium">Feedback</span>
        </button>
        <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
      </>
    );
  }

  // Inline button (for menus/navigation)
  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={openModal}
          className={`px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20
                     hover:from-blue-500/30 hover:to-purple-600/30 border border-blue-500/30
                     text-blue-400 hover:text-white rounded-lg transition-all flex items-center gap-2 ${className}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Share Feedback
        </button>
        <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
      </>
    );
  }

  // Minimal button (just text/icon)
  return (
    <>
      <button
        onClick={openModal}
        className={`text-gray-400 hover:text-white transition-colors flex items-center gap-2 ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Feedback</span>
      </button>
      <FeedbackModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
