'use client';

import { NAV_LINKS } from "@/utils/constants/links";
import { ThemeToggle } from "../shared/theme-toggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MobileNav } from "./MobileNavBar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

import { useTransition } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/features/auth/actions";
import { ArrowRight, Logout, Bell } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function NavigationBar() {
    const { isAuthenticated } = useAuth();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const pathname = usePathname();

    const isSetupPage = pathname.startsWith("/personnel/setup");
    const isPublicPage = pathname === "/sign-in" || pathname === "/" || pathname === "/forget-password" || pathname === "/reset-password";

    const handleSignOut = async () => {
        startTransition(async () => {
            try {
                const result = await signOutAction();

                if (result?.success === false) {
                    toast.error(result.message || "Logout failed");
                    return;
                }
                toast.success("Signed out");
                router.refresh();
            } catch {
                toast.error("An unexpected error occurred");
            }
        });
    };

    // Public page navbar design (matches mock)
    if (isPublicPage) {
        return (
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 md:px-8 py-3">
                <div className="mx-auto flex max-w-7xl justify-between items-center">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#8B1A1A] flex items-center justify-center">
                            <span className="text-white font-bold text-xs">CIT</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Student Portal</span>
                            <span className="text-sm font-semibold text-gray-800">Academic Gateway</span>
                        </div>
                    </div>

                    {/* Center: Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "text-sm font-medium transition-colors duration-200",
                                    pathname === href
                                        ? "text-[#8B1A1A]"
                                        : "text-gray-600 hover:text-gray-900",
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Academic Year + Notification + Sign In */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                            <span className="text-xs font-medium text-gray-600">AY 2025-2026</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs font-medium text-gray-600">1st Sem</span>
                        </div>

                        <button className="p-2 text-gray-500 hover:text-gray-700">
                            <HugeiconsIcon icon={Bell} className="w-5 h-5" />
                        </button>

                        <Button
                            onClick={() => router.push("/sign-in")}
                            size="lg"
                            className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white gap-2"
                            disabled={isPending}
                        >
                            <span>Sign In</span>
                            <HugeiconsIcon icon={ArrowRight} className="w-4 h-4" />
                        </Button>
                    </div>

                    <MobileNav
                        onSignOut={handleSignOut}
                        isPending={isPending}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </header>
        );
    }

    // Setup page navbar (hide nav links, show signout only)
    if (isSetupPage) {
        return (
            <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 md:px-8 py-3">
                <div className="mx-auto flex max-w-7xl justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link href="/home" className="hover:opacity-90 transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-[#8B1A1A] flex items-center justify-center">
                                <span className="text-white font-bold text-xs">CIT</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSignOut}
                            size="lg"
                            className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white gap-2"
                            disabled={isPending}
                        >
                            <span>Sign Out</span>
                            <HugeiconsIcon icon={Logout} className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>
        );
    }

    // Default authenticated navbar
    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-4 md:px-8 py-3">
            <div className="mx-auto flex max-w-7xl justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link href="/home" className="hover:opacity-90 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#8B1A1A] flex items-center justify-center">
                            <span className="text-white font-bold text-xs">CIT</span>
                        </div>
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Student Portal</span>
                        <span className="text-sm font-semibold text-gray-800">Academic Gateway</span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    {NAV_LINKS.map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "text-sm font-medium transition-colors duration-200",
                                pathname === href
                                    ? "text-[#8B1A1A]"
                                    : "text-gray-600 hover:text-gray-900",
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                        <span className="text-xs font-medium text-gray-600">AY 2025-2026</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-600">1st Sem</span>
                    </div>

                    <button className="p-2 text-gray-500 hover:text-gray-700">
                        <HugeiconsIcon icon={Bell} className="w-5 h-5" />
                    </button>

                    <Button
                        onClick={handleSignOut}
                        size="lg"
                        className="bg-[#8B1A1A] hover:bg-[#6B1515] text-white gap-2"
                        disabled={isPending}
                    >
                        <span>Sign Out</span>
                        <HugeiconsIcon icon={Logout} className="w-4 h-4" />
                    </Button>
                </div>

                <MobileNav
                    onSignOut={handleSignOut}
                    isPending={isPending}
                    isAuthenticated={isAuthenticated}
                />
            </div>
        </header>
    );
}