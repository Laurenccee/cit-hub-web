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
      <header className="sticky top-0 z-10">
        <NavigationBar />
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-screen-2xl py-16">{children}</div>
      </main>
      <footer className="">
        <Footer />
      </footer>
    </>
  );
}
