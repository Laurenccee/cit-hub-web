'use client';

import { useContext } from 'react';
import { AuthContext } from '@/features/auth/provider/AuthProvider';
import { ROLES } from '@/lib/constants/roles';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Check your Root Layout.',
    );
  }

  const isAuthenticated = context.user !== null;
  const isAdmin = context.role === ROLES.ADMIN && context.user !== null;
  const isFaculty = context.role === ROLES.FACULTY && context.user !== null;
  const isPioneer = context.role === ROLES.PIONEER && context.user !== null;

  return {
    ...context,
    isAuthenticated,
    isAdmin,
    isFaculty,
    isPioneer,
  };
}
