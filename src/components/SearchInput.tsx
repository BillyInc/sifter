'use client';

import { useState, KeyboardEvent } from 'react';

interface SearchInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export default function SearchInput({ onSubmit, disabled }: SearchInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Enter Twitter handle, Discord invite, Telegram link, GitHub repo, URL, or project name..."
          className="w-full bg-sifter-card border border-sifter-border rounded-xl py-4 pl-12 pr-24 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="absolute inset-y-2 right-2 px-4 bg-sifter-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Analyze
        </button>
      </div>

      {/* Example inputs */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="text-gray-600 text-xs">Try:</span>
        {[
          '@moonrocket_fi',
          'aave',
          'discord.gg/xyz123',
          't.me/safeeloninu',
        ].map((example) => (
          <button
            key={example}
            onClick={() => setValue(example)}
            disabled={disabled}
            className="text-xs text-gray-500 hover:text-gray-400 bg-gray-800/50 hover:bg-gray-800 px-2 py-1 rounded transition-colors disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
