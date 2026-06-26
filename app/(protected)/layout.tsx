import Footer from '@/components/layouts/Footer';
import NavigationBar from '@/components/layouts/NavBar';

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavigationBar />
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            <Footer />
        </>
    );
}
