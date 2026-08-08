"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import type { Album } from "@/lib/memories";

interface Props {
  album: Album;
}

export default function AlbumCard({
  album,
}: Props) {
  return (
    <Link
      href={`/memories/${album.id}`}
      style={{
        textDecoration: "none",
      }}
    >
      <motion.div
        whileHover={{
          y: -10,
        }}
        transition={{
          duration: 0.35,
        }}
        style={{
          position: "relative",

          height: 430,

          borderRadius: 28,

          overflow: "hidden",

          cursor: "pointer",

          boxShadow:
            "0 25px 60px rgba(0,0,0,.18)",
        }}
      >
        {/* Cover */}

        <motion.div
          whileHover={{
            scale: 1.06,
          }}
          transition={{
            duration: 0.6,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src={album.cover}
            alt={album.title}
            fill
            sizes="500px"
            style={{
              objectFit: "cover",
            }}
          />
        </motion.div>

        {/* Dark Gradient */}

        <div
          style={{
            position: "absolute",
            inset: 0,

            background:
              "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.18), transparent 55%)",
          }}
        />

        {/* Glass Card */}

        <motion.div
          whileHover={{
            background:
              "rgba(255,255,255,.18)",
          }}
          style={{
            position: "absolute",

            left: 18,
            right: 18,
            bottom: 18,

            padding: 22,

            borderRadius: 20,

            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",

            background:
              "rgba(255,255,255,.10)",

            border:
              "1px solid rgba(255,255,255,.20)",
          }}
        >
          <motion.h2
            whileHover={{
              y: -2,
            }}
            style={{
              color: "white",

              fontFamily:
                "var(--font-serif)",

              fontSize: 28,

              marginBottom: 10,
            }}
          >
            {album.title}
          </motion.h2>

          <p
            style={{
              color:
                "rgba(255,255,255,.88)",

              marginBottom: 6,
            }}
          >
            {album.date}
          </p>

          <p
            style={{
              color:
                "rgba(255,255,255,.72)",
            }}
          >
            {album.media.length} Memories
          </p>
        </motion.div>
      </motion.div>
    </Link>
  );
}