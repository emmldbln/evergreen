"use client";

import Link from "next/link";
import {
  Music2,
  Images,
  Mail,
  Settings,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const sections = [
  {
    title: "Songs",
    description:
      "Manage the Evergreen soundtrack, Spotify links, favorites, featured songs, and related memories.",
    href: "/admin/songs",
    icon: Music2,
  },
  {
    title: "Memories",
    description:
      "Create albums, upload photos, organize memories, and connect them to songs.",
    href: "/admin/memories",
    icon: Images,
  },
  {
    title: "Letters",
    description:
      "Create and manage personal letters, messages, and special notes.",
    href: "/admin/letters",
    icon: Mail,
  },
  {
    title: "Settings",
    description:
      "Manage Evergreen configuration and content-management options.",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 24px 140px",
        background:
          "linear-gradient(180deg, #F6FAF5 0%, #EEF5EF 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            marginBottom: 45,
          }}
        >
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
              marginBottom: 12,
            }}
          >
            <ShieldCheck size={18} />

            Evergreen Admin
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(42px, 8vw, 64px)",
              fontWeight: 600,
              color: "#304C3B",
              lineHeight: 1,
            }}
          >
            Content Manager
          </h1>

          <p
            style={{
              marginTop: 18,
              marginBottom: 0,
              maxWidth: 620,
              fontSize: 17,
              lineHeight: 1.7,
              color: "#718076",
            }}
          >
            Manage the memories, music, and letters that make
            Evergreen yours.
          </p>
        </div>

        {/* CMS CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,.78)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter:
                      "blur(20px)",

                    border:
                      "1px solid rgba(255,255,255,.8)",

                    borderRadius: 28,

                    padding: 28,

                    minHeight: 210,

                    display: "flex",
                    flexDirection: "column",

                    boxShadow:
                      "0 18px 50px rgba(42,70,52,.07)",

                    transition:
                      "transform .25s ease, box-shadow .25s ease",
                  }}
                >
                  {/* ICON */}

                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 18,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      background: "#E5F0E7",
                      color: "#456C57",

                      marginBottom: 24,
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  {/* TITLE */}

                  <h2
                    style={{
                      margin: 0,
                      fontFamily:
                        "var(--font-serif)",
                      fontSize: 30,
                      fontWeight: 600,
                      color: "#304C3B",
                    }}
                  >
                    {section.title}
                  </h2>

                  {/* DESCRIPTION */}

                  <p
                    style={{
                      marginTop: 10,
                      marginBottom: 24,

                      color: "#748077",
                      lineHeight: 1.6,
                      fontSize: 15,

                      flex: 1,
                    }}
                  >
                    {section.description}
                  </p>

                  {/* LINK */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,

                      color: "#456C57",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Manage

                    <ArrowRight size={17} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* INFORMATION */}

        <div
          style={{
            marginTop: 28,

            padding: 24,

            borderRadius: 24,

            background:
              "rgba(69,108,87,.07)",

            border:
              "1px solid rgba(69,108,87,.10)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "#456C57",
              marginBottom: 8,
            }}
          >
            Firebase Content Management
          </div>

          <p
            style={{
              margin: 0,
              color: "#68756C",
              lineHeight: 1.6,
              fontSize: 14,
            }}
          >
            Content added through the CMS will eventually
            be stored in your Evergreen Firebase database
            and media storage.
          </p>
        </div>
      </div>
    </main>
  );
}