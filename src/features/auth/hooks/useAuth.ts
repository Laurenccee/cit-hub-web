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
  const isAdmin = context.role === ROLES.ADMIN && isAuthenticated;
  const isClerk = context.role === ROLES.CLERK && isAuthenticated;
  const isFaculty = context.role === ROLES.FACULTY && isAuthenticated;
  const isPioneer = context.role === ROLES.PIONEER && isAuthenticated;

  return {
    ...context,
    isAuthenticated,
    isAdmin,
    isClerk,
    isFaculty,
    isPioneer,
  };
}
