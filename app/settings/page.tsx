"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Images,
  Music2,
  ChevronRight,
  Check,
  Eye,
  Sparkles,
  Accessibility,
  Shield,
} from "lucide-react";

import GlassCard from "@/app/components/ui/GlassCard";

import {
  DEFAULT_PROFILE,
  getProfile,
  saveProfile,
  getExperience,
  saveExperience,
  type ExperienceSettings,
} from "@/lib/profile";

export default function SettingsPage() {
  /* =======================================================
     PROFILE
  ======================================================= */

  const [displayName, setDisplayName] = useState(
    DEFAULT_PROFILE.displayName
  );

  const [saved, setSaved] = useState(false);

  /* =======================================================
     EXPERIENCE
  ======================================================= */

  const [experience, setExperience] =
    useState<ExperienceSettings>(() =>
      getExperience()
    );

  /* =======================================================
     SECRET ADMIN
  ======================================================= */

  /*
   * The shield icon is the ONLY secret admin trigger.
   *
   * Three clicks within 1.5 seconds opens /admin.
   *
   * Refs are intentionally used here so the sequence
   * does not depend on React state update timing.
   */

  const secretTapCount = useRef(0);

  const secretTapTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  /* =======================================================
     LOAD SAVED SETTINGS
  ======================================================= */

  useEffect(() => {
    const profile = getProfile();
    const experienceSettings = getExperience();

    setDisplayName(profile.displayName);
    setExperience(experienceSettings);
  }, []);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (secretTapTimer.current !== null) {
        clearTimeout(secretTapTimer.current);
      }
    };
  }, []);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  function handleSaveProfile() {
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

  /* =======================================================
     EXPERIENCE TOGGLE
  ======================================================= */

  function toggleExperience(
    key: keyof ExperienceSettings
  ) {
    setExperience((current) => {
      const updated: ExperienceSettings = {
        ...current,
        [key]: !current[key],
      };

      saveExperience(updated);

      return updated;
    });
  }

  /* =======================================================
     SECRET ADMIN
  ======================================================= */

  function handleSecretAdminTap() {
    if (secretTapTimer.current !== null) {
      clearTimeout(secretTapTimer.current);
      secretTapTimer.current = null;
    }

    secretTapCount.current += 1;

    /*
     * Third click opens Admin CMS.
     */

    if (secretTapCount.current >= 3) {
      secretTapCount.current = 0;

      window.location.assign("/admin");

      return;
    }

    /*
     * Reset if the user stops clicking.
     */

    secretTapTimer.current = setTimeout(() => {
      secretTapCount.current = 0;
      secretTapTimer.current = null;
    }, 1500);
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
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          style={{
            marginBottom: 34,
          }}
        >
          {/* NOT CLICKABLE */}

          <div
            style={{
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#456C57",
              fontWeight: 700,
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            Evergreen
          </div>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: "clamp(42px, 5vw, 56px)",
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
              lineHeight: 1.05,
            }}
          >
            Settings
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              fontSize: 17,
              lineHeight: 1.6,
              color: "#7A887C",
            }}
          >
            Customize your Evergreen space.
          </p>
        </header>

        {/* =================================================
            THREE PANES
        ================================================= */}

        <div
          className="evergreen-settings-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 22,
            alignItems: "stretch",
          }}
        >
          {/* =================================================
              MEMORIES
          ================================================= */}

          <GlassCard>
            <div
              style={{
                minHeight: 640,
                display: "flex",
                flexDirection: "column",
                padding: 28,
                boxSizing: "border-box",
              }}
            >
              <PaneIcon>
                <Images
                  size={25}
                  strokeWidth={1.7}
                />
              </PaneIcon>

              <div>
                <PaneEyebrow>
                  Memories
                </PaneEyebrow>

                <h2 style={paneTitleStyle}>
                  Your Memories
                </h2>

                <p style={descriptionStyle}>
                  Keep the moments that matter most
                  in one beautiful place.
                </p>
              </div>

              <div
                style={{
                  marginTop: 34,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <InfoRow
                  label="Albums"
                  description="Organize your memories"
                />

                <InfoRow
                  label="Photos & Videos"
                  description="Keep your favorite moments"
                />

                <InfoRow
                  label="Stories"
                  description="Add captions and dates"
                />
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px 0",
                }}
              >
                <div
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(69,108,87,.13), rgba(69,108,87,0))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      "rgba(69,108,87,.35)",
                  }}
                >
                  <Images size={54} />
                </div>
              </div>

              <Link
                href="/settings/memories"
                style={largeLinkStyle}
              >
                <span>Open Memories</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </GlassCard>

          {/* =================================================
              SOUNDTRACK
          ================================================= */}

          <GlassCard>
            <div
              style={{
                minHeight: 640,
                display: "flex",
                flexDirection: "column",
                padding: 28,
                boxSizing: "border-box",
              }}
            >
              <PaneIcon>
                <Music2
                  size={25}
                  strokeWidth={1.7}
                />
              </PaneIcon>

              <div>
                <PaneEyebrow>
                  Soundtrack
                </PaneEyebrow>

                <h2 style={paneTitleStyle}>
                  Our Soundtrack
                </h2>

                <p style={descriptionStyle}>
                  Give your memories a soundtrack
                  of their own.
                </p>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "28px 0",
                }}
              >
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 32,
                    background:
                      "linear-gradient(135deg, #456C57, #6D8B77)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    boxShadow:
                      "0 24px 60px rgba(69,108,87,.25)",
                    animation:
                      "evergreenFloat 5s ease-in-out infinite",
                  }}
                >
                  <Music2 size={76} />
                </div>
              </div>

              <div
                style={{
                  padding: "18px 0",
                  borderTop:
                    "1px solid rgba(0,0,0,.07)",
                  borderBottom:
                    "1px solid rgba(0,0,0,.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#456C57",
                  }}
                >
                  Personalized Music
                </div>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#7A887C",
                  }}
                >
                  Connect Spotify songs to your
                  memories.
                </p>
              </div>

              <Link
                href="/soundtrack"
                style={{
                  ...largeLinkStyle,
                  marginTop: 18,
                }}
              >
                <span>Open Soundtrack</span>
                <ChevronRight size={20} />
              </Link>
            </div>
          </GlassCard>

          {/* =================================================
              PROFILE
          ================================================= */}

          <GlassCard>
            <div
              style={{
                minHeight: 640,
                display: "flex",
                flexDirection: "column",
                padding: 28,
                boxSizing: "border-box",
              }}
            >
              <PaneIcon>
                <UserRound
                  size={25}
                  strokeWidth={1.7}
                />
              </PaneIcon>

              <div>
                <PaneEyebrow>
                  Profile
                </PaneEyebrow>

                <h2 style={paneTitleStyle}>
                  Your Space
                </h2>

                <p style={descriptionStyle}>
                  Personalize how Evergreen feels
                  and addresses you.
                </p>
              </div>

              {/* =================================================
                  DISPLAY NAME
              ================================================= */}

              <section
                style={{
                  marginTop: 32,
                }}
              >
                <SectionLabel>
                  Display Name
                </SectionLabel>

                <input
                  value={displayName}
                  onChange={(event) => {
                    setDisplayName(
                      event.target.value
                    );
                    setSaved(false);
                  }}
                  placeholder="Enter a name"
                  autoComplete="off"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: 10,
                    border:
                      "1px solid rgba(69,108,87,.18)",
                    borderRadius: 16,
                    padding: "14px 15px",
                    background:
                      "rgba(255,255,255,.48)",
                    color: "#3F5345",
                    fontSize: 15,
                    outline: "none",
                  }}
                />
              </section>

              {/* =================================================
                  EXPERIENCE
              ================================================= */}

              <section
                style={{
                  marginTop: 30,
                }}
              >
                <SectionLabel>
                  Experience
                </SectionLabel>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <ToggleRow
                    icon={<Eye size={17} />}
                    title="Falling Leaves"
                    description="Floating leaves in the background"
                    enabled={
                      experience.fallingLeaves
                    }
                    onToggle={() =>
                      toggleExperience(
                        "fallingLeaves"
                      )
                    }
                  />

                  <ToggleRow
                    icon={
                      <Sparkles size={17} />
                    }
                    title="Floating Particles"
                    description="Soft ambient particles"
                    enabled={
                      experience.floatingParticles
                    }
                    onToggle={() =>
                      toggleExperience(
                        "floatingParticles"
                      )
                    }
                  />

                  <ToggleRow
                    icon={
                      <Accessibility size={17} />
                    }
                    title="Reduced Motion"
                    description="Reduce background animations"
                    enabled={
                      experience.reducedMotion
                    }
                    onToggle={() =>
                      toggleExperience(
                        "reducedMotion"
                      )
                    }
                  />
                </div>
              </section>

              {/* =================================================
                  SAVE
              ================================================= */}

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 28,
                }}
              >
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={!displayName.trim()}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 16,
                    padding: "14px 18px",
                    background: displayName.trim()
                      ? "#456C57"
                      : "rgba(69,108,87,.25)",
                    color: "white",
                    fontSize: 14,
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
                    margin: "10px 0 0",
                    textAlign: "center",
                    color: "#8A968C",
                    fontSize: 12,
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                >
                  Saved on this device
                </p>
              </div>

              {/* =================================================
                  SECRET ADMIN
              ================================================= */}

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop:
                    "1px solid rgba(0,0,0,.06)",
                  textAlign: "center",
                  color:
                    "rgba(69,108,87,.42)",
                  fontSize: 11,

                  /*
                   * IMPORTANT:
                   * The surrounding footer cannot be selected.
                   */
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                }}
              >
                {/* =================================================
                    ISOLATED SECRET BUTTON
                ================================================= */}

                <button
                  type="button"
                  aria-label="Admin access"
                  onPointerDown={(event) => {
                    /*
                     * Prevent text selection and prevent the
                     * pointer event from reaching anything else.
                     */
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onPointerUp={(event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    handleSecretAdminTap();
                  }}
                  onClick={(event) => {
                    /*
                     * Explicitly consume the click as well.
                     */
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  style={{
                    appearance: "none",
                    WebkitAppearance: "none",

                    /*
                     * The visible icon remains 13px,
                     * but the actual hit target is 32x32.
                     */
                    width: 32,
                    height: 32,

                    padding: 0,
                    margin: "0 4px 0 0",

                    border: "none",
                    outline: "none",

                    borderRadius: "50%",

                    background:
                      "transparent",

                    color: "inherit",

                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",

                    verticalAlign: "middle",

                    cursor: "default",

                    /*
                     * Prevent selection on desktop.
                     */
                    userSelect: "none",
                    WebkitUserSelect: "none",

                    /*
                     * Prevent long-press callouts on mobile.
                     */
                    WebkitTouchCallout: "none",

                    /*
                     * Keep pointer interaction isolated.
                     */
                    touchAction: "manipulation",

                    position: "relative",
                    zIndex: 100,

                    /*
                     * Prevent browser focus styling from
                     * changing the visual appearance.
                     */
                    WebkitTapHighlightColor:
                      "transparent",
                  }}
                >
                  <Shield
                    size={13}
                    strokeWidth={1.8}
                    style={{
                      pointerEvents: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                    }}
                  />
                </button>

                {/* =================================================
                    NON-INTERACTIVE TEXT
                ================================================= */}

                <span
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  }}
                >
                  Personal settings
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .evergreen-settings-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          main {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function PaneIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "rgba(69,108,87,.10)",
        color: "#456C57",
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

function PaneEyebrow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: 1.7,
        textTransform: "uppercase",
        fontWeight: 700,
        color: "#456C57",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        fontWeight: 700,
        color: "#456C57",
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "14px 15px",
        borderRadius: 16,
        background:
          "rgba(255,255,255,.36)",
        border:
          "1px solid rgba(69,108,87,.08)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#3F5345",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: "#879289",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: "100%",
        border:
          "1px solid rgba(69,108,87,.08)",
        borderRadius: 16,
        padding: "12px 13px",
        background: enabled
          ? "rgba(69,108,87,.07)"
          : "rgba(255,255,255,.36)",
        display: "flex",
        alignItems: "center",
        gap: 11,
        textAlign: "left",
        cursor: "pointer",
        color: "#3F5345",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 11,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "rgba(69,108,87,.10)",
          color: "#456C57",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 2,
            fontSize: 11,
            color: "#879289",
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          padding: 2,
          background: enabled
            ? "#456C57"
            : "rgba(69,108,87,.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: enabled
            ? "flex-end"
            : "flex-start",
          transition: ".2s ease",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "white",
            boxShadow:
              "0 2px 5px rgba(0,0,0,.12)",
          }}
        />
      </div>
    </button>
  );
}

/* =========================================================
   STYLES
========================================================= */

const paneTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-serif)",
  fontSize: 30,
  lineHeight: 1.15,
  fontWeight: 500,
  color: "#3F5345",
};

const descriptionStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: 14,
  lineHeight: 1.65,
  color: "#7A887C",
};

const largeLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  boxSizing: "border-box",
  padding: "15px 16px",
  borderRadius: 16,
  background: "rgba(69,108,87,.08)",
  color: "#456C57",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
  transition: ".25s ease",
};