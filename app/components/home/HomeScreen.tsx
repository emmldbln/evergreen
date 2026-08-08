"use client";

import GreetingCard from "../cards/GreetingCard";
import MemoryCard from "../cards/MemoryCard";
import SongCard from "../cards/SongCard";
import CountdownCard from "../cards/CountdownCard";

import Background from "../ui/Background";

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
      {/* Background */}

      <Background />

      {/* Main Content */}

      <div
        style={{
          maxWidth: 470,
          margin: "0 auto",

          display: "flex",
          flexDirection: "column",
          gap: 30,

          position: "relative",
          zIndex: 1,
        }}
      >
        <GreetingCard />

        <SongCard
          song={currentSong}
          queue={queue}
        />

        <MemoryCard
          albums={albums}
          memories={homepageMemories}
        />

        <CountdownCard />
      </div>
    </main>
  );
}