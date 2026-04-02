'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../shared/theme-toggle';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { signOutAction } from '@/features/auth/action';
import { toast } from 'sonner';

const NAV_LINKS = [
  { label: 'Home', href: '/home' },
  { label: 'News & Events', href: '/news-events' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Faculty', href: '/faculty' },
];

export default function NavigationBar() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const result = await signOutAction();

      if (result?.success === false) {
        toast.error(result.message || 'Logout failed');
        return;
      }
      toast.success('Signed out');
      router.push('/home');
      router.refresh();
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-card backdrop-blur supports-backdrop-filter:bg-card/60 px-6 py-3">
      <div className="mx-auto flex max-w-screen-2xl justify-between items-center">
        <Link
          href="/home"
          className="flex flex-col items-start hover:opacity-90 transition-opacity"
        >
          <h1 className="text-4xl uppercase text-primary leading-tight font-serif">
            CIT
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative border-b-2 transition-all duration-300 ease-in-out font-serif',
                pathname === href
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-primary hover:border-primary',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              size="xl"
              className="gap-2 font-medium"
              disabled={isLoading}
            >
              Sign Out <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
