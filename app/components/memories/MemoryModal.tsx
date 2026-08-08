"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { Memory } from "./memories";
import { useEffect } from "react";

interface Props {
  memories: Memory[];
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
  const memory = memories[selectedIndex];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrevious();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, onNext, onPrevious]);

  if (!memory) return null;

  const isVideo =
    memory.image.endsWith(".mp4") ||
    memory.image.endsWith(".mov") ||
    memory.image.endsWith(".webm");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .3 }}
        style={{
          position: "fixed",
          inset: 0,

          background: "rgba(18,24,18,.35)",

          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          padding: 32,

          zIndex: 3000,
        }}
      >
        <motion.div
          layout
          initial={{
            opacity: 0,
            scale: .9,
            y: 30,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: .9,
          }}
          transition={{
            duration: .45,
          }}
          style={{
            width: "min(1100px,95vw)",
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
              position: "relative",
              background: "#EFF4EF",
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
                  objectFit: "contain",
                }}
              />
            ) : (
              <Image
                src={memory.image}
                alt={memory.title}
                fill
                sizes="900px"
                style={{
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          {/* INFO */}

          <div
            style={{
              padding: "50px 42px",

              overflowY: "auto",
            }}
          >
            <h1
              style={{
                color: "#456C57",

                fontFamily:
                  "var(--font-serif)",

                fontSize: 42,

                marginBottom: 12,
              }}
            >
              {memory.title}
            </h1>

            <p
              style={{
                color: "#809083",
                marginBottom: 8,
              }}
            >
              {memory.date}
            </p>

            <p
              style={{
                color: "#98A196",
                marginBottom: 40,
              }}
            >
              {memory.location}
            </p>

            <div
              style={{
                color: "#56645A",

                lineHeight: 2,

                fontSize: 18,

                whiteSpace: "pre-line",
              }}
            >
              {memory.story}
            </div>
          </div>

          {/* CLOSE */}

          <button
            onClick={onClose}
            style={{
              position: "absolute",

              top: 24,
              right: 24,

              width: 46,
              height: 46,

              borderRadius: "50%",

              border: "none",

              cursor: "pointer",

              background:
                "rgba(255,255,255,.8)",

              backdropFilter: "blur(10px)",
            }}
          >
            <X size={20} />
          </button>

          {/* LEFT */}

          <button
            onClick={onPrevious}
            style={{
              position: "absolute",

              left: 24,
              top: "50%",

              transform:
                "translateY(-50%)",

              width: 54,
              height: 54,

              borderRadius: "50%",

              border: "none",

              cursor: "pointer",

              background:
                "rgba(255,255,255,.75)",

              backdropFilter: "blur(12px)",
            }}
          >
            <ChevronLeft />
          </button>

          {/* RIGHT */}

          <button
            onClick={onNext}
            style={{
              position: "absolute",

              right: 24,
              top: "50%",

              transform:
                "translateY(-50%)",

              width: 54,
              height: 54,

              borderRadius: "50%",

              border: "none",

              cursor: "pointer",

              background:
                "rgba(255,255,255,.75)",

              backdropFilter: "blur(12px)",
            }}
          >
            <ChevronRight />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}