"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CloudDownload, Images, RefreshCw } from "lucide-react";

interface ImportResult {
  title: string;
  status: "imported" | "linked" | "skipped";
  mediaCount: number;
}

export default function ImportMemoriesPage() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<ImportResult[]>([]);

  async function runImport() {
    if (running) return;

    try {
      setRunning(true);
      setMessage("");
      setError("");
      setResults([]);

      const response = await fetch(
        "/api/memories/import",
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to import memories from Google Drive."
        );
      }

      setResults(data.results ?? []);
      setMessage(
        `Drive scan complete. ${data.folderCount ?? 0} album folder(s) found.`
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to import memories from Google Drive."
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 140px",
        background:
          "linear-gradient(180deg,#F6FAF5,#EEF5EF)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link
          href="/admin/memories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#456C57",
            textDecoration: "none",
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={18} />
          Back to Memories
        </Link>

        <header style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#456C57",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <Images size={17} />
            Google Drive
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 46,
              color: "#456C57",
              fontFamily: "var(--font-serif)",
            }}
          >
            Import Memories
          </h1>

          <p
            style={{
              color: "#748574",
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: 700,
            }}
          >
            Scan the Evergreen / Memories folder in Google Drive and connect
            its album folders to Evergreen. Existing albums are matched by
            their Drive folder ID or title so the import can be run again
            without creating duplicates.
          </p>
        </header>

        {message && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#EAF3EC",
              color: "#456C57",
              marginBottom: 20,
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "#FFF1F1",
              color: "#A33A3A",
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            background: "white",
            borderRadius: 28,
            padding: 30,
            boxShadow: "0 18px 45px rgba(0,0,0,.06)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "#EAF3EC",
                color: "#456C57",
              }}
            >
              <CloudDownload size={25} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: "#456C57" }}>
                Scan Drive Albums
              </h2>
              <p style={{ margin: "5px 0 0", color: "#7A887C" }}>
                Existing Google Drive files stay in Drive; Evergreen stores
                their Drive IDs in Firestore.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runImport}
            disabled={running}
            style={{
              border: "none",
              borderRadius: 16,
              padding: "14px 20px",
              background: "#456C57",
              color: "white",
              fontWeight: 700,
              cursor: running ? "default" : "pointer",
              opacity: running ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            {running ? (
              <RefreshCw size={18} />
            ) : (
              <CloudDownload size={18} />
            )}
            {running ? "Scanning Drive..." : "Import / Sync Albums"}
          </button>
        </section>

        {results.length > 0 && (
          <section
            style={{
              background: "white",
              borderRadius: 28,
              padding: 30,
              boxShadow: "0 18px 45px rgba(0,0,0,.06)",
            }}
          >
            <h2 style={{ margin: "0 0 20px", color: "#456C57" }}>
              Scan Results
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {results.map((result) => (
                <div
                  key={`${result.title}-${result.status}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "14px 16px",
                    borderRadius: 16,
                    background: "#F8FAF8",
                  }}
                >
                  <div>
                    <strong style={{ color: "#3F5345" }}>
                      {result.title}
                    </strong>
                    <div style={{ color: "#7A887C", marginTop: 4 }}>
                      {result.mediaCount} media file(s)
                    </div>
                  </div>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 10px",
                      borderRadius: 999,
                      background: "#EAF3EC",
                      color: "#456C57",
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
