'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '../shared/theme-toggle';

export default function NavigationBar() {
  const pathname = usePathname();
  const NAV_LINKS = [
    { label: 'Home', href: '/home' },
    { label: 'News & Events', href: '/news-events' },
    { label: 'Schedule', href: '/schedule' },
    { label: 'Faculty', href: '/faculty' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 bg-background/5 backdrop-blur supports-backdrop-filter:bg-background/60 px-6 py-3">
      <div className="mx-auto flex max-w-7xl justify-between items-center">
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
          <Button size="lg" className="gap-2 font-medium">
            Login <LogIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
