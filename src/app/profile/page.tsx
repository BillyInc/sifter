'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';

export default function ProfilePage() {
  const { user, isLoading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sifter-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sifter-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sifter-dark flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your profile</p>
          <Link href="/login" className="text-sifter-blue hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateUser({ name });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-sifter-dark">
      {/* Header */}
      <header className="border-b border-sifter-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Sifter
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Profile</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/50 text-green-400'
                : 'bg-red-500/10 border border-red-500/50 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-sifter-card border border-sifter-border rounded-xl p-6">
          {/* Avatar section */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-sifter-border">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sifter-blue flex items-center justify-center text-white text-2xl font-bold">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-sifter-blue/20 text-sifter-blue capitalize">
                {user.mode}
              </span>
            </div>
          </div>

          {/* Profile details */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-sifter-dark border border-sifter-border rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sifter-blue focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-sifter-dark/50 border border-sifter-border rounded-lg py-3 px-4 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-sifter-blue hover:bg-blue-600 disabled:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setName(user.name);
                  }}
                  className="bg-sifter-border hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <p className="text-white">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <p className="text-white">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Account Type</label>
                <p className="text-white capitalize">{user.mode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Member Since</label>
                <p className="text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Verified</label>
                <p className={user.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                  {user.isVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="bg-sifter-blue hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Edit profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
