// This file handles global errors for the Next.js app
"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 32,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <h2
            style={{
              color: "#a21caf",
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 16,
            }}
          >
            Etwas ist schief gelaufen
          </h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>
            {error?.message || "Ein unerwarteter Fehler ist aufgetreten."}
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#a21caf",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
