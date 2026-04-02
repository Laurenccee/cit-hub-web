import Footer from '@/components/layout/footer';
import NavigationBar from '@/components/layout/navigation-bar';
import React from 'react';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl py-16">{children}</div>
      </main>
      <Footer />
    </>
  );
}
