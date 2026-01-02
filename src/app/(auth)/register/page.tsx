'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserMode } from '@/types/dataDonation';

const modeOptions: { value: UserMode; label: string; description: string }[] = [
  {
    value: 'individual',
    label: 'Individual',
    description: 'Personal use for checking projects'
  },
  {
    value: 'researcher',
    label: 'Researcher',
    description: 'Academic or security research'
  },
  {
    value: 'ea-vc',
    label: 'EA / VC',
    description: 'Enterprise or venture capital use'
  }
];

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isLoading, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<UserMode>('individual');
  const [localError, setLocalError] = useState<string | null>(null);

  // Set mode from URL query param if provided
  useEffect(() => {
    const modeParam = searchParams?.get('mode') as UserMode;
    if (modeParam && ['individual', 'researcher', 'ea-vc'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    const success = await register({ name, email, password, mode });
    if (success) {
      router.push('/');
    }
  };

  const displayError = localError || error;

  return (
    <div className="bg-sifter-card border border-sifter-border rounded-xl p-8">
    <form onSubmit={handleSubmit} className="space-y-5">
        {displayError && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {displayError}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all"
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all"
            placeholder="Min. 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all"
            placeholder="Confirm your password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-3">
            Account Type
          </label>
          <div className="space-y-2">
            {modeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${mode === option.value
                    ? 'border-sifter-blue bg-sifter-blue/10'
                    : 'border-sifter-border hover:border-gray-600'
                  }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value={option.value}
                  checked={mode === option.value}
                  onChange={(e) => setMode(e.target.value as UserMode)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="text-white font-medium">{option.label}</div>
                  <div className="text-gray-600 text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sifter-blue hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white-600 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-sifter-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-sifter-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">Sifter</h1>
          </Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <Suspense fallback={<div className="text-center text-white">Loading registration...</div>}>
          <RegisterContent />
        </Suspense>
      </div>
    </div>
  );
}