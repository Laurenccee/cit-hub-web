"use client";

import { useEffect } from "react";

// Replaces the root layout, so it cannot rely on app styles or providers.
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <title>Something went wrong | CIT Hub</title>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 500, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ maxWidth: "28rem", margin: 0, color: "#57534e" }}>
          CIT Hub hit an unexpected error. Please try again.
        </p>
        <button
          onClick={() => retry()}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#8b1a1a",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
