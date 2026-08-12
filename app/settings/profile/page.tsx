"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  UserRound,
} from "lucide-react";

import GlassCard from "@/app/components/ui/GlassCard";
import {
  DEFAULT_PROFILE,
  getProfile,
  saveProfile,
} from "@/lib/profile";

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState(
    DEFAULT_PROFILE.displayName
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = getProfile();

    setDisplayName(profile.displayName);
  }, []);

  function handleSave() {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      return;
    }

    saveProfile({
      displayName: trimmedName,
    });

    setDisplayName(trimmedName);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 160px",
        color: "#3F5345",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* BACK */}
        <Link
          href="/settings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#456C57",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 30,
          }}
        >
          <ArrowLeft size={17} />

          Back to Settings
        </Link>

        {/* HEADER */}
        <header
          style={{
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#456C57",
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Evergreen
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 48,
              fontFamily: "var(--font-serif)",
            }}
          >
            Profile
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 17,
              color: "#7A887C",
            }}
          >
            Personalize how Evergreen addresses you.
          </p>
        </header>

        {/* PROFILE CARD */}
        <GlassCard>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(69,108,87,.10)",
              color: "#456C57",
              marginBottom: 24,
            }}
          >
            <UserRound
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 30,
              fontFamily: "var(--font-serif)",
            }}
          >
            Display Name
          </h2>

          <p
            style={{
              marginTop: 8,
              color: "#7A887C",
              fontSize: 15,
              lineHeight: 1.6,
            }}
          >
            This name will appear throughout your
            Evergreen experience.
          </p>

          <label
            htmlFor="display-name"
            style={{
              display: "block",
              marginTop: 26,
              marginBottom: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "#456C57",
            }}
          >
            Name
          </label>

          <input
            id="display-name"
            value={displayName}
            onChange={(event) => {
              setDisplayName(event.target.value);
              setSaved(false);
            }}
            placeholder="Enter a name"
            autoComplete="off"
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: "1px solid rgba(69,108,87,.18)",
              borderRadius: 16,
              padding: "15px 16px",
              background: "rgba(255,255,255,.48)",
              color: "#3F5345",
              fontSize: 16,
              outline: "none",
            }}
          />

          <button
            type="button"
            onClick={handleSave}
            disabled={!displayName.trim()}
            style={{
              marginTop: 18,
              width: "100%",
              border: "none",
              borderRadius: 16,
              padding: "15px 18px",
              background: displayName.trim()
                ? "#456C57"
                : "rgba(69,108,87,.25)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: displayName.trim()
                ? "pointer"
                : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: ".25s ease",
            }}
          >
            {saved ? (
              <>
                <Check size={18} />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              textAlign: "center",
              color: "#7A887C",
              fontSize: 13,
            }}
          >
            Your profile is saved on this device.
          </p>
        </GlassCard>
      </div>
    </main>
  );
}