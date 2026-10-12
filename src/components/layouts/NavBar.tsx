"use client";

import { getVisibleNavLinks } from "@/utils/constants/links";
import { ThemeToggle } from "../shared/theme-toggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MobileNav } from "./MobileNavBar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/features/auth/action";
import { ROUTES } from "@/utils/constants/routes";
import { ArrowRight, Bell, LogOut } from "lucide-react";

function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">{children}</div>
    </header>
  );
}

function BrandMark({ withText = true }: { withText?: boolean }) {
  return (
    <Link href={ROUTES.HOME} className="flex items-center gap-3 transition-opacity hover:opacity-90">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <span className="text-xs font-bold text-primary-foreground">CIT</span>
      </div>
      {withText && (
        <div className="flex flex-col">
          <span className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">
            Student Portal
          </span>
          <span className="text-sm font-semibold text-foreground">Academic Gateway</span>
        </div>
      )}
    </Link>
  );
}

function AcademicYearBadge() {
  return (
    <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 md:flex">
      <span className="text-xs font-medium text-muted-foreground">AY 2025-2026</span>
      <span className="text-muted-foreground/60">•</span>
      <span className="text-xs font-medium text-muted-foreground">1st Sem</span>
    </div>
  );
}

function NotificationButton() {
  return (
    <button
      type="button"
      className="p-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
    </button>
  );
}

export default function NavigationBar() {
  const { isAuthenticated, role } = useAuth();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const visibleNavLinks = getVisibleNavLinks(role);

  const isSetupPage =
    pathname.startsWith("/personnel/setup") || pathname.startsWith("/student/setup");
  const isPublicPage =
    pathname === ROUTES.ROOT ||
    pathname === ROUTES.SIGN_IN ||
    pathname === ROUTES.FORGET_PASSWORD ||
    pathname === ROUTES.RESET_PASSWORD;

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

  const navLinks = (
    <nav className="hidden items-center gap-6 md:flex">
      {visibleNavLinks.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            pathname === href ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );

  const signOutButton = (
    <Button onClick={handleSignOut} size="lg" className="gap-2" disabled={isPending}>
      <span>Sign Out</span>
      <LogOut className="h-4 w-4" />
    </Button>
  );

  // Public pages: marketing-style navbar with a Sign In call to action.
  if (isPublicPage) {
    return (
      <HeaderShell>
        <BrandMark />
        {navLinks}
        <div className="flex items-center gap-4">
          <AcademicYearBadge />
          <ThemeToggle />
          <NotificationButton />
          <Button
            onClick={() => router.push(ROUTES.SIGN_IN)}
            size="lg"
            className="gap-2"
            disabled={isPending}
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <MobileNav
          onSignOut={handleSignOut}
          isPending={isPending}
          isAuthenticated={isAuthenticated}
          role={role}
        />
      </HeaderShell>
    );
  }

  // Setup wizard: strip navigation, keep only brand and sign-out.
  if (isSetupPage) {
    return (
      <HeaderShell>
        <BrandMark withText={false} />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {signOutButton}
        </div>
      </HeaderShell>
    );
  }

  // Default authenticated navbar.
  return (
    <HeaderShell>
      <BrandMark />
      {navLinks}
      <div className="flex items-center gap-4">
        <AcademicYearBadge />
        <ThemeToggle />
        <NotificationButton />
        {signOutButton}
      </div>
      <MobileNav
        onSignOut={handleSignOut}
        isPending={isPending}
        isAuthenticated={isAuthenticated}
        role={role}
      />
    </HeaderShell>
  );
}
