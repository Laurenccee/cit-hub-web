export default function Footer() {
  return (
    <footer className="mx-auto w-full border-t-2 py-16 bg-mauve-950 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIT Hub. All rights reserved.
    </footer>
  );
}
