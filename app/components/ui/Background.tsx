"use client";

import { useEffect, useState } from "react";

const EXPERIENCE_STORAGE_KEY =
  "evergreen-experience-settings";

interface ExperienceSettings {
  fallingLeaves: boolean;
  floatingParticles: boolean;
  reducedMotion: boolean;
}

const DEFAULT_EXPERIENCE: ExperienceSettings = {
  fallingLeaves: true,
  floatingParticles: true,
  reducedMotion: false,
};

/**
 * Deterministic particle data.
 *
 * IMPORTANT:
 * Do not replace these with Math.random().
 *
 * These values are identical on the server and client,
 * which prevents hydration mismatches.
 */
const PARTICLES = [
  {
    id: 1,
    left: 8.4,
    top: 12.7,
    size: 4.2,
    opacity: 0.24,
    duration: 8.4,
    delay: -3.1,
  },
  {
    id: 2,
    left: 18.7,
    top: 28.3,
    size: 3.1,
    opacity: 0.31,
    duration: 10.2,
    delay: -6.4,
  },
  {
    id: 3,
    left: 29.4,
    top: 7.8,
    size: 5.1,
    opacity: 0.19,
    duration: 7.8,
    delay: -2.7,
  },
  {
    id: 4,
    left: 41.8,
    top: 42.6,
    size: 2.8,
    opacity: 0.36,
    duration: 11.4,
    delay: -8.2,
  },
  {
    id: 5,
    left: 53.2,
    top: 18.4,
    size: 4.7,
    opacity: 0.27,
    duration: 9.7,
    delay: -4.9,
  },
  {
    id: 6,
    left: 64.6,
    top: 61.7,
    size: 3.4,
    opacity: 0.33,
    duration: 12.1,
    delay: -7.3,
  },
  {
    id: 7,
    left: 76.3,
    top: 34.1,
    size: 5.4,
    opacity: 0.22,
    duration: 8.9,
    delay: -5.8,
  },
  {
    id: 8,
    left: 87.9,
    top: 73.5,
    size: 3.0,
    opacity: 0.29,
    duration: 10.8,
    delay: -1.9,
  },
  {
    id: 9,
    left: 94.2,
    top: 16.8,
    size: 4.4,
    opacity: 0.21,
    duration: 13.2,
    delay: -9.4,
  },
  {
    id: 10,
    left: 12.6,
    top: 68.2,
    size: 3.7,
    opacity: 0.34,
    duration: 9.3,
    delay: -4.2,
  },
  {
    id: 11,
    left: 36.5,
    top: 82.4,
    size: 4.9,
    opacity: 0.25,
    duration: 11.7,
    delay: -6.1,
  },
  {
    id: 12,
    left: 58.8,
    top: 89.1,
    size: 2.6,
    opacity: 0.39,
    duration: 8.1,
    delay: -2.4,
  },
  {
    id: 13,
    left: 72.1,
    top: 9.5,
    size: 3.8,
    opacity: 0.28,
    duration: 12.6,
    delay: -10.1,
  },
  {
    id: 14,
    left: 83.7,
    top: 47.9,
    size: 5.0,
    opacity: 0.23,
    duration: 10.5,
    delay: -5.3,
  },
  {
    id: 15,
    left: 97.1,
    top: 91.3,
    size: 3.3,
    opacity: 0.32,
    duration: 9.1,
    delay: -7.8,
  },
];

/**
 * Deterministic leaves.
 *
 * Again, no Math.random() here.
 */
const LEAVES = [
  {
    id: 1,
    left: 8,
    width: 31,
    height: 18,
    opacity: 0.18,
    duration: 21,
    delay: -5,
    rotation: 28,
  },
  {
    id: 2,
    left: 22,
    width: 42,
    height: 24,
    opacity: 0.24,
    duration: 25,
    delay: -11,
    rotation: 117,
  },
  {
    id: 3,
    left: 37,
    width: 28,
    height: 16,
    opacity: 0.20,
    duration: 18,
    delay: -3,
    rotation: 204,
  },
  {
    id: 4,
    left: 51,
    width: 36,
    height: 21,
    opacity: 0.16,
    duration: 27,
    delay: -14,
    rotation: 291,
  },
  {
    id: 5,
    left: 66,
    width: 30,
    height: 17,
    opacity: 0.23,
    duration: 23,
    delay: -8,
    rotation: 156,
  },
  {
    id: 6,
    left: 79,
    width: 44,
    height: 25,
    opacity: 0.19,
    duration: 26,
    delay: -17,
    rotation: 341,
  },
  {
    id: 7,
    left: 91,
    width: 27,
    height: 16,
    opacity: 0.22,
    duration: 20,
    delay: -6,
    rotation: 73,
  },
];

/**
 * Safely read experience settings.
 */
function readExperienceSettings(): ExperienceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_EXPERIENCE;
  }

  try {
    const stored = localStorage.getItem(
      EXPERIENCE_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_EXPERIENCE;
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return DEFAULT_EXPERIENCE;
    }

    const data = parsed as Record<string, unknown>;

    return {
      fallingLeaves:
        typeof data.fallingLeaves === "boolean"
          ? data.fallingLeaves
          : DEFAULT_EXPERIENCE.fallingLeaves,

      floatingParticles:
        typeof data.floatingParticles === "boolean"
          ? data.floatingParticles
          : DEFAULT_EXPERIENCE.floatingParticles,

      reducedMotion:
        typeof data.reducedMotion === "boolean"
          ? data.reducedMotion
          : DEFAULT_EXPERIENCE.reducedMotion,
    };
  } catch {
    return DEFAULT_EXPERIENCE;
  }
}

export default function Background() {
  /**
   * IMPORTANT:
   *
   * Start with deterministic defaults.
   *
   * This means the first server render and first client
   * render are identical.
   */
  const [experience, setExperience] =
    useState<ExperienceSettings>(
      DEFAULT_EXPERIENCE
    );

  useEffect(() => {
  /**
   * Read the user's saved settings after hydration.
   *
   * Defer the state update so React can finish the
   * initial render before synchronizing localStorage.
   */
  const initialSettingsTimer =
    window.setTimeout(() => {
      setExperience(
        readExperienceSettings()
      );
    }, 0);

  /**
   * Listen for changes made by SettingsPage in the
   * same browser tab.
   */
  function handleExperienceChange() {
    setExperience(
      readExperienceSettings()
    );
  }

    window.addEventListener(
      "evergreen-experience-changed",
      handleExperienceChange
    );

    /**
     * Also listen to normal storage changes.
     *
     * This covers changes coming from another tab.
     */
    window.addEventListener(
      "storage",
      handleExperienceChange
    );

    return () => {
      window.clearTimeout(
      initialSettingsTimer
      );
      window.removeEventListener(
        "evergreen-experience-changed",
        handleExperienceChange
      );

      window.removeEventListener(
        "storage",
        handleExperienceChange
      );
    };
  }, []);

  const {
    fallingLeaves,
    floatingParticles,
    reducedMotion,
  } = experience;

  /**
   * Reduced motion disables the decorative animation
   * while keeping the background itself visible.
   */
  const animationPlayState = reducedMotion
    ? "paused"
    : "running";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background:
          "linear-gradient(135deg, #dceee4 0%, #eef7f1 45%, #f5f4e8 100%)",
      }}
    >
      {/* =========================================
          SOFT BACKGROUND GLOW
      ========================================= */}

      <div
        style={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          maxWidth: 850,
          maxHeight: 850,
          left: "-15vw",
          top: "-20vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(87,145,108,.18), rgba(87,145,108,0) 70%)",
          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "50vw",
          height: "50vw",
          maxWidth: 800,
          maxHeight: 800,
          right: "-15vw",
          top: "5vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(194,204,130,.14), rgba(194,204,130,0) 70%)",
          filter: "blur(25px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "65vw",
          height: "45vw",
          maxWidth: 1000,
          maxHeight: 700,
          left: "20vw",
          bottom: "-25vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(92,145,104,.10), rgba(92,145,104,0) 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* =========================================
          PARTICLES
      ========================================= */}

      {floatingParticles &&
        PARTICLES.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            style={{
              position: "absolute",
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: "50%",
              background:
                "rgba(255,255,255,.95)",
              opacity: particle.opacity,
              boxShadow:
                "0 0 12px rgba(255,255,255,.75)",
              animation:
                `evergreenParticle ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
              animationPlayState,
            }}
          />
        ))}

      {/* =========================================
          FALLING LEAVES
      ========================================= */}

      {fallingLeaves &&
        LEAVES.map((leaf) => (
          <div
            key={`leaf-${leaf.id}`}
            style={{
              position: "absolute",
              left: `${leaf.left}%`,
              top: "-80px",
              width: `${leaf.width}px`,
              height: `${leaf.height}px`,
              opacity: leaf.opacity,
              animation:
                `evergreenLeaf ${leaf.duration}s linear ${leaf.delay}s infinite`,
              animationPlayState,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius:
                  "100% 0 100% 0",
                background:
                  "linear-gradient(135deg, rgba(48,105,69,.88), rgba(92,145,104,.72) 55%, rgba(140,173,135,.48))",
                transform: `rotate(${leaf.rotation}deg)`,
                boxShadow:
                  "0 3px 10px rgba(54,95,76,.12)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "72%",
                  height: 1,
                  left: "14%",
                  top: "50%",
                  background:
                    "rgba(255,255,255,.30)",
                  transform:
                    `rotate(${leaf.rotation}deg)`,
                  transformOrigin:
                    "left center",
                }}
              />
            </div>
          </div>
        ))}

      {/* =========================================
          ANIMATION STYLES
      ========================================= */}

      <style jsx>{`
        @keyframes evergreenParticle {
          0% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(8px, -12px, 0);
          }

          100% {
            transform: translate3d(-6px, 10px, 0);
          }
        }

        @keyframes evergreenLeaf {
          0% {
            transform:
              translate3d(0, -10vh, 0)
              rotate(0deg);
          }

          25% {
            transform:
              translate3d(5vw, 25vh, 0)
              rotate(90deg);
          }

          50% {
            transform:
              translate3d(-4vw, 50vh, 0)
              rotate(180deg);
          }

          75% {
            transform:
              translate3d(6vw, 75vh, 0)
              rotate(270deg);
          }

          100% {
            transform:
              translate3d(-3vw, 115vh, 0)
              rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}