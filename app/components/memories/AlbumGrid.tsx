"use client";

import type { Album } from "@/lib/memories";
import AlbumCard from "./AlbumCard";

interface Props {
  albums: Album[];
}

export default function AlbumGrid({ albums }: Props) {
  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns:
          "repeat(auto-fit, minmax(320px, 380px))",

        justifyContent: "center",

        gap: 32,

        width: "100%",

        maxWidth: 1200,

        margin: "0 auto",
      }}
    >
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
        />
      ))}
    </div>
  );
}