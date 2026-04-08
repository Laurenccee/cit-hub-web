'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { NAV_LINKS } from '@/lib/constants/links';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onSignOut: () => Promise<void>;
  isPending: boolean;
  isAuthenticated: boolean;
}

export function MobileNav({
  onSignOut,
  isPending,
  isAuthenticated,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-primary">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-75 sm:w-100 p-8">
          <SheetTitle className="text-left font-serif text-2xl text-primary mb-8">
            CIT MENU
          </SheetTitle>
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-xl font-serif transition-colors py-2 border-b border-transparent',
                  pathname === href
                    ? 'text-primary border-primary/20'
                    : 'text-muted-foreground hover:text-primary',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          {isAuthenticated && (
            <div className="mt-auto pt-6 border-t">
              <Button
                variant="link"
                className="w-full justify-start gap-4 text-lg font-serif h-12"
                onClick={onSignOut}
                disabled={isPending}
              >
                <LogOut className="h-5 w-5" />
                {isPending ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
