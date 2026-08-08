"use client";

import { motion } from "framer-motion";

import AlbumCard from "./AlbumCard";
import type { Album } from "@/lib/memories";

interface Props {
  albums: Album[];
}

export default function AlbumGrid({ albums }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        width: "100%",
        maxWidth: 1400,

        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(340px, 1fr))",

        gap: 34,

        margin: "0 auto",
      }}
    >
      {albums.map((album, index) => (
        <motion.div
          key={album.id}
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: index * 0.08,
            duration: 0.55,
          }}
        >
          <AlbumCard album={album} />
        </motion.div>
      ))}
    </motion.div>
  );
}