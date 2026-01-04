'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-sifter-border animate-pulse" />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="bg-sifter-blue hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-sifter-blue flex items-center justify-center text-white text-sm font-medium">
            {initials}
          </div>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-sifter-card border border-sifter-border rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-sifter-border">
            <div className="text-white font-medium truncate">{user.name}</div>
            <div className="text-gray-400 text-sm truncate">{user.email}</div>
            <div className="mt-1">
              <span className="inline-block text-xs px-2 py-0.5 rounded bg-sifter-blue/20 text-sifter-blue capitalize">
                {user.mode}
              </span>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:bg-sifter-border/50 hover:text-white transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:bg-sifter-border/50 hover:text-white transition-colors"
            >
              Settings
            </Link>
            <Link
              href="/history"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-gray-300 hover:bg-sifter-border/50 hover:text-white transition-colors"
            >
              History
            </Link>
          </div>

          <div className="border-t border-sifter-border py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-sifter-border/50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
