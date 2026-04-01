'use client';

import { useContext } from 'react';
import { AuthContext } from '@/features/auth/provider/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Check your Root Layout.',
    );
  }

  const isAuthenticated = context.user !== null;
  const isAdmin = context.role === 0 && context.user !== null;
  const isFaculty = context.role === 1 && context.user !== null;
  const isPioneer = context.role === 2 && context.user !== null;

  return {
    ...context,
    isAuthenticated,
    isAdmin,
    isFaculty,
    isPioneer,
  };
}
