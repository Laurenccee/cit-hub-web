import type { Metadata } from 'next';
import { Instrument_Serif, Oswald } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import AuthWrapper from '@/features/auth/components/AuthWrapper';
import { TooltipProvider } from '@/components/ui/tooltip';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument',
});
const oswald = Oswald({ subsets: ['latin'], variable: '--font-noto' });

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
      className={cn(
        'h-full',
        'antialiased',
        oswald.variable,
        instrumentSerif.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthWrapper>{children}</AuthWrapper>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
