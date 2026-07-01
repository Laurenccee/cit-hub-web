import Footer from '@/components/layouts/Footer';
import NavigationBar from '@/components/layouts/NavBar';

export default function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <NavigationBar />
            <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
            <Footer />
        </div>
    );
}
