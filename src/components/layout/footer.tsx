import React from 'react';

export default function Footer() {
  return (
    <footer className="mx-auto border-t-2 py-16 bg-mauve-950 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIT Hub. All rights reserved.
    </footer>
  );
}
