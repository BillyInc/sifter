'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, Button, Card, Input, Logo } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password });
    if (success) router.push('/');
  };

  return (
    <div className="min-h-screen bg-sifter-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" aria-label="Sifter home" className="inline-block rounded-lg">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-sifter-text">Welcome back</h1>
          <p className="mt-1 text-sm text-sifter-text-muted">Sign in to continue to Sifter</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
            {error && <Alert>{error}</Alert>}

            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />

            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-sifter-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-sifter-blue hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
