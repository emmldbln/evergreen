"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import type { Album } from "@/lib/memories";

interface Props {
  album: Album;
}

export default function AlbumCard({
  album,
}: Props) {
  const memoryCount = album.media.length;

  return (
    <Link
      href={`/memories/${album.id}`}
      style={{
        textDecoration: "none",
        display: "block",
        width: "100%",
      }}
    >
      <motion.div
        whileHover={{
          y: -8,
        }}
        transition={{
          duration: 0.35,
        }}
        style={{
          position: "relative",

          /*
           * Fixed visual ratio.
           *
           * This prevents portrait/landscape covers
           * from changing the card dimensions.
           */
          width: "100%",
          aspectRatio: "4 / 5",

          minHeight: 420,

          borderRadius: 28,

          overflow: "hidden",

          cursor: "pointer",

          boxShadow:
            "0 25px 60px rgba(0,0,0,.18)",

          background:
            "linear-gradient(180deg,#E8F0EA,#8B948D)",
        }}
      >
        {/* Cover */}
        <motion.div
          whileHover={{
            scale: 1.05,
          }}
          transition={{
            duration: 0.6,
          }}
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          {album.cover ? (
            <img
              src={album.cover}
              alt={album.title}
              style={{
                width: "100%",
                height: "100%",
                display: "block",

                /*
                 * Critical:
                 * Never stretch the original image.
                 */
                objectFit: "cover",

                objectPosition: "center",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#456C57",
                fontSize: 48,
              }}
            >
              ◇
            </div>
          )}
        </motion.div>

        {/* Dark Gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,

            background:
              "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.18), transparent 55%)",

            pointerEvents: "none",
          }}
        />

        {/* Glass Information Card */}
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

            backdropFilter:
              "blur(18px)",

            WebkitBackdropFilter:
              "blur(18px)",

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

              fontSize:
                "clamp(22px, 2.2vw, 28px)",

              lineHeight: 1.2,

              margin: 0,

              marginBottom: 10,
            }}
          >
            {album.title}
          </motion.h2>

          {album.date && (
            <p
              style={{
                color:
                  "rgba(255,255,255,.88)",

                margin: 0,

                marginBottom: 6,

                fontSize: 14,
              }}
            >
              {album.date}
            </p>
          )}

          <p
            style={{
              color:
                "rgba(255,255,255,.72)",

              margin: 0,

              fontSize: 14,
            }}
          >
            {memoryCount}{" "}
            {memoryCount === 1
              ? "Memory"
              : "Memories"}
          </p>
        </motion.div>
      </motion.div>
    </Link>
  );
}