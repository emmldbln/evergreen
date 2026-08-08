"use client";

import Link from "next/link";

import {
  Music2,
  Play,
  Pause,
  SkipForward,
} from "lucide-react";

import { usePlayback } from "@/lib/playback-store";

export default function MiniPlayer() {
  const {
    currentSong: song,
    playing,
    togglePlayback,
    nextSong,
  } = usePlayback();

  /*
   * IMPORTANT:
   *
   * The MiniPlayer exists only when a song
   * has actually been selected.
   *
   * Pausing a song does NOT remove it.
   */

  if (!song) {
    return null;
  }

  return (
    <div
      style={{
        width: 230,

        opacity: 1,

        transform:
          "translateY(0px) scale(1)",

        transition:
          "opacity .32s ease, transform .32s cubic-bezier(.22,1,.36,1)",
      }}
    >
      <Link
        href="/soundtrack"
        style={{
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: "100%",

            minHeight: 74,

            boxSizing: "border-box",

            padding: "10px 12px",

            borderRadius: 9999,

            background:
              "rgba(255,255,255,.82)",

            backdropFilter: "blur(28px)",
            WebkitBackdropFilter:
              "blur(28px)",

            border:
              "1px solid rgba(255,255,255,.55)",

            boxShadow:
              "0 15px 40px rgba(0,0,0,.12)",

            display: "flex",
            alignItems: "center",

            gap: 10,
          }}
        >
          {/* =========================
              SONG ICON
              ========================= */}

          <div
            style={{
              width: 48,
              height: 48,

              flexShrink: 0,

              borderRadius: "50%",

              background:
                "linear-gradient(135deg,#456C57,#6D8B77)",

              color: "white",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              boxShadow:
                song.glow
                  ? "0 0 20px rgba(255,210,120,.65)"
                  : "0 6px 18px rgba(69,108,87,.20)",

              transition:
                "box-shadow .35s ease",
            }}
          >
            <Music2 size={21} />
          </div>

          {/* =========================
              SONG INFORMATION
              ========================= */}

          <div
            style={{
              flex: 1,
              minWidth: 0,

              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",

                color: "#3F5345",
              }}
            >
              {song.title}
            </div>

            <div
              style={{
                marginTop: 3,

                fontSize: 12,

                color: "#7A887C",

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {song.artist}
            </div>

            {/* =========================
                EQUALIZER
                ========================= */}

            {playing && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",

                  gap: 2,

                  height: 10,

                  marginTop: 4,
                }}
              >
                <EqualizerBar delay="0s" />
                <EqualizerBar delay=".12s" />
                <EqualizerBar delay=".24s" />
                <EqualizerBar delay=".36s" />
              </div>
            )}
          </div>

          {/* =========================
              CONTROLS
              ========================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: 4,

              flexShrink: 0,
            }}
          >
            {/* PLAY / PAUSE */}

            <PlayerButton
              label={
                playing
                  ? "Pause"
                  : "Play"
              }
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                togglePlayback();
              }}
            >
              {playing ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
            </PlayerButton>

            {/* NEXT */}

            <PlayerButton
              label="Next"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                nextSong();
              }}
            >
              <SkipForward size={18} />
            </PlayerButton>
          </div>
        </div>
      </Link>

      {/* =========================
          PLAYER ANIMATION
          ========================= */}

      <style jsx>{`
        @keyframes evergreenEqualizer {
          0% {
            transform: scaleY(0.35);
          }

          25% {
            transform: scaleY(1);
          }

          50% {
            transform: scaleY(0.55);
          }

          75% {
            transform: scaleY(0.9);
          }

          100% {
            transform: scaleY(0.35);
          }
        }

        @media (max-width: 700px) {
          div {
            max-width: 210px;
          }
        }

        @media (max-width: 560px) {
          div {
            width: 205px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =====================================
   EQUALIZER BAR
   ===================================== */

function EqualizerBar({
  delay,
}: {
  delay: string;
}) {
  return (
    <span
      style={{
        width: 2.5,

        height: 9,

        borderRadius: 999,

        background: "#456C57",

        transformOrigin: "bottom",

        animation:
          `evergreenEqualizer .75s ease-in-out infinite`,

        animationDelay: delay,
      }}
    />
  );
}

/* =====================================
   PLAYER BUTTON
   ===================================== */

function PlayerButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 38,
        height: 38,

        border: "none",

        borderRadius: "50%",

        background:
          "rgba(69,108,87,.08)",

        color: "#456C57",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        cursor: "pointer",

        transition:
          "all .22s cubic-bezier(.22,1,.36,1)",

        padding: 0,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background =
          "rgba(69,108,87,.16)";

        event.currentTarget.style.transform =
          "scale(1.08)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background =
          "rgba(69,108,87,.08)";

        event.currentTarget.style.transform =
          "scale(1)";
      }}
    >
      {children}
    </button>
  );
}