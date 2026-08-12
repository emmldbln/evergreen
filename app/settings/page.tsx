"use client";

import Link from "next/link";
import {
  UserRound,
  Images,
  Music2,
  ChevronRight,
  Wrench,
} from "lucide-react";

import GlassCard from "@/app/components/ui/GlassCard";

export default function SettingsPage() {
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
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: 36,
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
              fontSize: 52,
              fontFamily: "var(--font-serif)",
            }}
          >
            Settings
          </h1>

          <p
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 17,
              color: "#7A887C",
            }}
          >
            Customize your Evergreen space.
          </p>
        </header>

        {/* THREE SETTINGS PANES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 22,
          }}
        >
          {/* PROFILE */}
          <GlassCard>
            <SettingIcon>
              <UserRound size={24} strokeWidth={1.8} />
            </SettingIcon>

            <SettingContent
              title="Profile"
              description="Your displayed name and personal settings."
            />

            <Link
              href="/settings/profile"
              style={linkStyle}
            >
              <span>Your Profile</span>
              <ChevronRight size={18} />
            </Link>
          </GlassCard>

          {/* MEMORIES */}
          <GlassCard>
            <SettingIcon>
              <Images size={24} strokeWidth={1.8} />
            </SettingIcon>

            <SettingContent
              title="Memories"
              description="Your albums, photos, videos, captions, and dates."
            />

            <Link
              href="/settings/memories"
              style={linkStyle}
            >
              <span>Your Memories</span>
              <ChevronRight size={18} />
            </Link>
          </GlassCard>

          {/* SOUNDTRACK */}
          <GlassCard>
            <SettingIcon>
              <Music2 size={24} strokeWidth={1.8} />
            </SettingIcon>

            <SettingContent
              title="Soundtrack"
              description="Music controls are still being developed."
            />

            <div style={statusStyle}>
              <Wrench size={16} />
              <span>Still in development</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}

function SettingIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 17,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(69,108,87,.10)",
        color: "#456C57",
        marginBottom: 22,
      }}
    >
      {children}
    </div>
  );
}

function SettingContent({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2
        style={{
          margin: 0,
          fontSize: 30,
          fontFamily: "var(--font-serif)",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          marginTop: 8,
          marginBottom: 24,
          color: "#7A887C",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 15px",
  borderRadius: 15,
  background: "rgba(69,108,87,.08)",
  color: "#456C57",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
};

const statusStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "13px 15px",
  borderRadius: 15,
  background: "rgba(120,130,120,.10)",
  color: "#7A887C",
  fontWeight: 600,
  fontSize: 14,
};