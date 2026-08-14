"use client";

import GreetingCard from "../cards/GreetingCard";
import MemoryCard from "../cards/MemoryCard";
import SongCard from "../cards/SongCard";
import CountdownCard from "../cards/CountdownCard";
import GlassCard from "../ui/GlassCard";

import { Sparkles } from "lucide-react";

import { usePlayback } from "@/lib/playback-store";

import type {
  Album,
  HomepageMemory,
} from "@/lib/memories";

interface Props {
  albums: Album[];
  homepageMemories: HomepageMemory[];
}

export default function HomeScreen({
  albums,
  homepageMemories,
}: Props) {
  const {
    currentSong,
    queue,
  } = usePlayback();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 28px 140px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          DESKTOP HOME LAYOUT
          ===================================================== */}

      <div
        className="home-layout"
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",

          display: "grid",

          gridTemplateColumns:
            "minmax(0, 1fr) minmax(0, 1fr)",

          gap: 18,

          position: "relative",
          zIndex: 1,

          alignItems: "start",
        }}
      >
        {/* ===================================================
            LEFT COLUMN
            =================================================== */}

        <div
          className="home-left-column"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 0,
          }}
        >
          {/* Greeting */}

          <GreetingCard />

          {/* Memories */}

          <MemoryCard
            albums={albums}
            memories={homepageMemories}
          />

          {/* Countdown */}

          <CountdownCard />
        </div>

        {/* ===================================================
            RIGHT COLUMN
            =================================================== */}

        <div
          className="home-right-column"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
          }}
        >
          {/* =================================================
              SOUNDTRACK
              ================================================= */}

          <SongCard
            song={currentSong}
            queue={queue}
          />

          {/* =================================================
              LITTLE REMINDER
              ================================================= */}

          <GlassCard>
            <div
              style={{
                height: 118,

                padding:
                  "18px 24px",

                display: "flex",
                flexDirection: "column",

                justifyContent:
                  "center",

                alignItems:
                  "center",

                textAlign: "center",

                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative glow */}

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",

                  width: 150,
                  height: 150,

                  right: -55,
                  bottom: -75,

                  borderRadius: "50%",

                  background:
                    "radial-gradient(circle, rgba(112,158,127,.18), transparent 70%)",

                  pointerEvents:
                    "none",
                }}
              />

              {/* Small label */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,

                  color: "#456C57",

                  fontSize: 10,
                  fontWeight: 700,

                  letterSpacing: 1.1,

                  textTransform:
                    "uppercase",

                  position:
                    "relative",

                  zIndex: 1,
                }}
              >
                <Sparkles size={13} />

                A Little Reminder
              </div>

              {/* Reminder */}

              <p
                style={{
                  margin:
                    "10px 0 0",

                  maxWidth: 360,

                  fontFamily:
                    "var(--font-serif)",

                  fontSize: 20,

                  lineHeight: 1.35,

                  color: "#304638",

                  position:
                    "relative",

                  zIndex: 1,
                }}
              >
                Even on bad times,
                you&apos;ll always have me.
              </p>

            </div>
          </GlassCard>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE LAYOUT
          ===================================================== */}

      <style jsx>{`
        @media (max-width: 760px) {
          .home-layout {
            grid-template-columns: 1fr !important;
            max-width: 470px !important;
          }

          .home-left-column,
          .home-right-column {
            width: 100%;
          }

          .home-left-column {
            order: 1;
          }

          .home-right-column {
            order: 2;
          }
        }

        @media (max-width: 480px) {
          main {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }
        }
      `}</style>
    </main>
  );
}