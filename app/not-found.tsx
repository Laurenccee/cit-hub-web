import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/utils/constants/routes";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-title">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved.
      </p>
      <Button asChild>
        <Link href={ROUTES.HOME}>Back to home</Link>
      </Button>
    </section>
  );
}
