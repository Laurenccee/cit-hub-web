'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toggle } from '@/components/ui/toggle';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons';

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <Toggle
            variant="outline"
            size="lg"
            className="group relative"
            pressed={theme === 'dark'}
            onPressedChange={(pressed) => setTheme(pressed ? 'dark' : 'light')}
        >
            <HugeiconsIcon
                icon={Sun01Icon}
                className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <HugeiconsIcon
                icon={Moon01Icon}
                className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span className="sr-only">Toggle theme</span>
        </Toggle>
    );
}
