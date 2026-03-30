import NavigationBar from '@/components/layout/navigation-bar';
import React from 'react';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="sticky top-0 z-10">
        <NavigationBar />
      </header>
      <main>
        <div className="m-auto max-w-7xl">{children}</div>
      </main>
    </>
  );
}
