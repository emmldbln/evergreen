"use client";

import {
  motion,
} from "framer-motion";

import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Image from "next/image";

import type {
  HomepageMemory,
} from "@/lib/memories";

import { useEffect } from "react";

interface Props {
  memories: HomepageMemory[];
  selectedIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function MemoryModal({
  memories,
  selectedIndex,
  onClose,
  onNext,
  onPrevious,
}: Props) {
  const memory =
    memories[selectedIndex];

  useEffect(() => {
    const handleKey = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowRight") {
        onNext();
      }

      if (e.key === "ArrowLeft") {
        onPrevious();
      }
    };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [
    onClose,
    onNext,
    onPrevious,
  ]);

  if (!memory) return null;

  const isVideo =
    memory.image.toLowerCase().endsWith(
      ".mp4"
    ) ||
    memory.image.toLowerCase().endsWith(
      ".mov"
    ) ||
    memory.image.toLowerCase().endsWith(
      ".webm"
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      style={{
        position: "fixed",
        inset: 0,

        background:
          "rgba(18,24,18,.35)",

        backdropFilter:
          "blur(20px)",

        WebkitBackdropFilter:
          "blur(20px)",

        display: "flex",

        justifyContent:
          "center",

        alignItems: "center",

        padding: 32,

        zIndex: 3000,
      }}
    >
      <motion.div
        layout
        initial={{
          opacity: 0,
          scale: 0.9,
          y: 30,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.9,
        }}
        transition={{
          duration: 0.45,
        }}
        style={{
          position: "relative",

          width:
            "min(1100px,95vw)",

          maxHeight: "90vh",

          overflow: "hidden",

          borderRadius: 30,

          background:
            "linear-gradient(180deg,#FFFDFB,#F8F3EC)",

          boxShadow:
            "0 40px 120px rgba(0,0,0,.25)",

          display: "grid",

          gridTemplateColumns:
            "1.3fr .7fr",
        }}
      >
        {/* MEDIA */}

        <div
          style={{
            position:
              "relative",

            background:
              "#EFF4EF",

            minHeight: 650,
          }}
        >
          {isVideo ? (
            <video
              src={memory.image}
              controls
              autoPlay
              style={{
                width: "100%",
                height: "100%",
                objectFit:
                  "contain",
              }}
            />
          ) : (
            <Image
              src={memory.image}
              alt={
                memory.albumTitle
              }
              fill
              sizes="900px"
              style={{
                objectFit:
                  "contain",
              }}
            />
          )}
        </div>

        {/* INFO */}

        <div
          style={{
            padding:
              "50px 42px",

            overflowY:
              "auto",
          }}
        >
          <h1
            style={{
              color:
                "#456C57",

              fontFamily:
                "var(--font-serif)",

              fontSize: 42,

              marginTop: 0,

              marginBottom: 12,
            }}
          >
            {memory.albumTitle}
          </h1>

          <p
            style={{
              color:
                "#809083",

              marginBottom: 8,
            }}
          >
            {memory.date}
          </p>

          <p
            style={{
              color:
                "#98A196",

              marginBottom: 40,
            }}
          >
            {memory.location}
          </p>

          <div
            style={{
              color:
                "#56645A",

              lineHeight: 2,

              fontSize: 18,

              whiteSpace:
                "pre-line",
            }}
          >
            {memory.story}
          </div>
        </div>

        {/* CLOSE */}

        <button
          onClick={onClose}
          aria-label="Close memory"
          style={{
            position:
              "absolute",

            top: 24,

            right: 24,

            width: 46,

            height: 46,

            borderRadius:
              "50%",

            border: "none",

            cursor:
              "pointer",

            background:
              "rgba(255,255,255,.8)",

            backdropFilter:
              "blur(10px)",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            zIndex: 2,
          }}
        >
          <X size={20} />
        </button>

        {/* LEFT */}

        <button
          onClick={onPrevious}
          aria-label="Previous memory"
          style={{
            position:
              "absolute",

            left: 24,

            top: "50%",

            transform:
              "translateY(-50%)",

            width: 54,

            height: 54,

            borderRadius:
              "50%",

            border: "none",

            cursor:
              "pointer",

            background:
              "rgba(255,255,255,.75)",

            backdropFilter:
              "blur(12px)",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            zIndex: 2,
          }}
        >
          <ChevronLeft />
        </button>

        {/* RIGHT */}

        <button
          onClick={onNext}
          aria-label="Next memory"
          style={{
            position:
              "absolute",

            right: 24,

            top: "50%",

            transform:
              "translateY(-50%)",

            width: 54,

            height: 54,

            borderRadius:
              "50%",

            border: "none",

            cursor:
              "pointer",

            background:
              "rgba(255,255,255,.75)",

            backdropFilter:
              "blur(12px)",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            zIndex: 2,
          }}
        >
          <ChevronRight />
        </button>
      </motion.div>
    </motion.div>
  );
}