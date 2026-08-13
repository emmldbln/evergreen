"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import GlassCard from "../ui/GlassCard";

import type {
  Album,
  HomepageMemory,
} from "@/lib/memories";

interface Props {
  albums: Album[];
  memories: HomepageMemory[];
}

export default function MemoryCard({
  memories,
}: Props) {
  const [index, setIndex] = useState(0);

  /*
   * Automatically move to the next memory
   * every 6 seconds.
   */
  useEffect(() => {
    if (memories.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current >= memories.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [memories.length]);

  if (memories.length === 0) {
    return null;
  }

  /*
   * Make sure the selected index can never point
   * outside the current memories array.
   */
  const safeIndex = Math.min(
    index,
    memories.length - 1
  );

  const memory = memories[safeIndex];

  if (!memory) {
    return null;
  }

  return (
    <GlassCard>
      {/* =========================
          MEMORY IMAGE
          ========================= */}

      <div
        style={{
          position: "relative",
          height: 400,
          overflow: "hidden",
        }}
      >
        <Image
          src={memory.image}
          alt={memory.albumTitle}
          fill
          sizes="(max-width: 470px) 100vw, 470px"
          style={{
            objectFit: "cover",
          }}
          unoptimized
        />

        {/* =========================
            IMAGE OVERLAY
            ========================= */}

        <div
          style={{
            position: "absolute",
            inset: 0,

            background:
              "linear-gradient(to top, rgba(0,0,0,.70), rgba(0,0,0,.10), transparent)",

            pointerEvents: "none",
          }}
        />

        {/* =========================
            DATE
            ========================= */}

        {memory.date && (
          <div
            style={{
              position: "absolute",

              top: 20,
              right: 20,

              padding: "8px 15px",

              borderRadius: 999,

              /*
               * Soft glass background.
               * This gives the text something
               * readable to sit on without
               * making the pill look heavy.
               */
              background:
                "rgba(255,255,255,.18)",

              border:
                "1px solid rgba(255,255,255,.32)",

              backdropFilter:
                "blur(16px)",

              WebkitBackdropFilter:
                "blur(16px)",

              /*
               * Slightly darker than pure white
               * so it remains visible on bright
               * photographs.
               */
              color:
                "rgba(42,62,50,.82)",

              fontSize: 14,

              fontWeight: 600,

              letterSpacing: 0.2,

              whiteSpace: "nowrap",

              /*
               * Helps preserve readability
               * when the pill overlaps a bright
               * part of the photograph.
               */
              textShadow:
                "0 1px 4px rgba(255,255,255,.55)",

              boxShadow:
                "0 8px 24px rgba(0,0,0,.12)",

              zIndex: 2,
            }}
          >
            {memory.date}
          </div>
        )}

        {/* =========================
            ALBUM TITLE
            ========================= */}

        <div
          style={{
            position: "absolute",

            left: 28,
            right: 28,
            bottom: 28,

            zIndex: 2,
          }}
        >
          <h2
            style={{
              color: "white",

              fontSize: 38,

              margin: 0,

              lineHeight: 1.15,

              fontFamily:
                "var(--font-serif)",

              textShadow:
                "0 3px 15px rgba(0,0,0,.35)",
            }}
          >
            {memory.albumTitle}
          </h2>
        </div>
      </div>

      {/* =========================
          MEMORY INFORMATION
          ========================= */}

      <div
        style={{
          padding: 24,
        }}
      >
        {memory.story && (
          <p
            style={{
              color: "#6D7A70",

              lineHeight: 1.8,

              fontSize: 17,

              marginTop: 0,

              marginBottom: 10,
            }}
          >
            {memory.story}
          </p>
        )}

        {memory.location && (
          <p
            style={{
              color: "#9AA69B",

              fontSize: 15,

              margin: 0,
            }}
          >
            📍 {memory.location}
          </p>
        )}
      </div>
    </GlassCard>
  );
}