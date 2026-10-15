import type { Metadata } from 'next';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthWrapper } from '@/components/providers/auth-wrapper';
import { TooltipProvider } from '@/components/ui/tooltip';

const instrumentSerif = Instrument_Serif({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-instrument',
});
const instrumentSans = Instrument_Sans({
    subsets: ['latin'],
    variable: '--font-instrument-sans',
});

export const metadata: Metadata = {
    title: 'CIT Hub',
    description: 'Student information portal for CIT students and faculty.',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            data-scroll-behavior="smooth"
            className={cn('h-full', 'antialiased', instrumentSans.variable, instrumentSerif.variable)}
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
                    <TooltipProvider>
                        <AuthWrapper>{children}</AuthWrapper>
                    </TooltipProvider>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
