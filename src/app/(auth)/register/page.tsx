'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserMode } from '@/types/dataDonation';
import { ACCOUNT_MODES } from '@/data/accountModes';
import { Alert, Button, Card, Input, Logo, cn } from '@/components/ui';

const MIN_PASSWORD = 8;

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

  // Pre-select the account type from ?mode= (links from the landing page).
  useEffect(() => {
    const modeParam = searchParams?.get('mode') as UserMode | null;
    if (modeParam && ACCOUNT_MODES.some((m) => m.value === modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setLocalError(`Password must be at least ${MIN_PASSWORD} characters`);
      return;
    }

    const success = await register({ name, email, password, mode });
    if (success) router.push('/');
  };

  const displayError = localError || error;

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {displayError && <Alert>{displayError}</Alert>}

        <Input id="name" label="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Your name" />

        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com" />

        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder={`Min. ${MIN_PASSWORD} characters`}
          hint={tooShort ? undefined : `At least ${MIN_PASSWORD} characters`}
          error={tooShort ? `Password must be at least ${MIN_PASSWORD} characters` : undefined}
        />

        <Input
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={mismatch ? 'Passwords do not match' : undefined}
        />

        <fieldset>
          <legend className="block text-sm font-medium text-sifter-text-muted mb-2">Account type</legend>
          <div className="grid gap-2">
            {ACCOUNT_MODES.map((option) => {
              const selected = mode === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors duration-base',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sifter-blue/60',
                    selected ? 'border-sifter-blue bg-sifter-blue/10' : 'border-sifter-border hover:border-sifter-border-strong hover:bg-sifter-hover',
                  )}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={selected}
                    onChange={(e) => setMode(e.target.value as UserMode)}
                    className="mt-1 accent-sifter-blue"
                  />
                  <span>
                    <span className="block font-medium text-sifter-text">{option.label}</span>
                    <span className="block text-sm text-sifter-text-muted">{option.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Create account
        </Button>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-sifter-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" aria-label="Sifter home" className="inline-block rounded-lg">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-sifter-text">Create your account</h1>
          <p className="mt-1 text-sm text-sifter-text-muted">Start screening projects in minutes</p>
        </div>

        <Suspense fallback={<Card padding="lg" className="text-center text-sifter-text-muted">Loading…</Card>}>
          <RegisterContent />
        </Suspense>

        <p className="mt-6 text-center text-sm text-sifter-text-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-sifter-blue hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
