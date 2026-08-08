"use client";

import { useEffect, useMemo, useState } from "react";
import GlassCard from "../ui/GlassCard";

import type {
  Album,
  HomepageMemory,
} from "@/lib/memories";

interface Props {
  albums: Album[];
  memories: HomepageMemory[];
}

function shuffle<T>(array: T[]) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [copy[i], copy[j]] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

export default function MemoryCard({
  memories,
}: Props) {
  const [shuffled, setShuffled] =
  useState(memories);
  

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shuffled.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((current) => {
        if (current >= shuffled.length - 1)
          return 0;

        return current + 1;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [shuffled]);

  if (!shuffled.length) return null;

  const memory = shuffled[index];

  return (
    <GlassCard>
      <div
        style={{
          position: "relative",
          height: 400,
          overflow: "hidden",
        }}
      >
        <img
          src={memory.image}
          alt={memory.albumTitle}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,.70), rgba(0,0,0,.10), transparent)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,

            padding: "8px 16px",

            borderRadius: 999,

            background:
              "rgba(255,255,255,.20)",

            backdropFilter:
              "blur(16px)",

            color: "white",

            fontSize: 14,
          }}
        >
          {memory.date}
        </div>

        <div
          style={{
            position: "absolute",

            left: 28,
            right: 28,
            bottom: 28,
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: 38,
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {memory.albumTitle}
          </h2>
        </div>
      </div>

      <div
        style={{
          padding: 24,
        }}
      >
        <p
          style={{
            color: "#6D7A70",
            lineHeight: 1.8,
            fontSize: 17,
            marginBottom: 10,
          }}
        >
          {memory.story}
        </p>

        <p
          style={{
            color: "#9AA69B",
            fontSize: 15,
            margin: 0,
          }}
        >
          📍 {memory.location}
        </p>
      </div>
    </GlassCard>
  );
}