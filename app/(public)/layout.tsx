import Footer from '@/components/layouts/footer';
import NavigationBar from '@/components/layouts/navigation-bar';

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavigationBar />
      <main className="flex-1 px-8 py-16">
        <div className="mx-auto max-w-screen-2xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
