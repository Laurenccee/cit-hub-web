'use client';

import { NAV_LINKS } from '@/lib/constants/links';
import { ThemeToggle } from '../shared/theme-toggle';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MobileNav } from './MobileNavBar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import { signOutAction } from '@/features/auth/actions';

export default function NavigationBar() {
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    startTransition(async () => {
      try {
        const result = await signOutAction();

        if (result?.success === false) {
          toast.error(result.message || 'Logout failed');

          return;
        }
        toast.success('Signed out');
        router.refresh();
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-card/95 backdrop-blur px-4 md:px-6 py-3">
      <div className="mx-auto flex max-w-screen-2xl justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/home" className="hover:opacity-90 transition-opacity">
            <h1 className="text-3xl md:text-4xl uppercase text-primary font-serif">
              CIT
            </h1>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative border-b-2 transition-all duration-300 font-serif',
                pathname === href
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-primary hover:border-primary',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle />

          {isAuthenticated && (
            <Button
              onClick={handleSignOut}
              size="xl"
              className="hidden md:flex gap-2 font-medium"
              disabled={isPending}
            >
              <span className="hidden sm:inline">Sign Out</span>
              <LogOut className="h-4 w-4" />
            </Button>
          )}

          <MobileNav
            onSignOut={handleSignOut}
            isPending={isPending}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </header>
  );
}
