import React from 'react';

export default function Footer() {
  return (
    <div className="mx-auto border-t-2 py-16 bg-mauve-950 text-center text-sm text-muted-foreground">
      &copy; {new Date().getFullYear()} CIT Hub. All rights reserved.
    </div>
  );
}
