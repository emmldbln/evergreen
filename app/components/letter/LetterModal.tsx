"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Letter } from "./letters";

interface Props {
  letter: Letter | null;
  onClose: () => void;
}

export default function LetterModal({ letter, onClose }: Props) {
  return (
    <AnimatePresence>
      {letter && (
        <>
          {/* Background Blur */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,20,15,.18)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              zIndex: 999,
            }}
          />

          {/* Center Wrapper */}

          <div
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              pointerEvents: "none",
              padding: 30,
            }}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.82,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.82,
                y: 30,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: "auto",

                width: "min(850px,92vw)",
                height: "min(88vh,850px)",

                borderRadius: 30,
                overflow: "hidden",

                background:
                  "linear-gradient(180deg,#FFFDFB 0%,#FAF6F0 100%)",

                boxShadow:
                  "0 40px 120px rgba(0,0,0,.18)",

                position: "relative",
              }}
            >
              {/* Paper Glow */}

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 20% 15%, rgba(255,255,255,.55), transparent 30%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.30), transparent 35%)",
                  pointerEvents: "none",
                }}
              />

              {/* Shine */}

              <motion.div
                initial={{
                  x: "-120%",
                }}
                animate={{
                  x: "180%",
                }}
                transition={{
                  duration: 1.6,
                  delay: 0.4,
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />

              {/* Close */}

              <button
                onClick={onClose}
                style={{
                  position: "absolute",
                  top: 22,
                  right: 22,

                  width: 44,
                  height: 44,

                  borderRadius: "50%",
                  border: "none",

                  background: "rgba(69,108,87,.08)",

                  color: "#456C57",

                  cursor: "pointer",

                  zIndex: 20,
                }}
              >
                <X size={20} />
              </button>

              {/* Scroll */}

              <div
                style={{
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.25,
                    duration: 0.7,
                  }}
                  style={{
                    maxWidth: 680,

                    margin: "0 auto",

                    padding: "90px 70px 100px",

                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 46,
                      color: "#456C57",
                      marginBottom: 14,
                    }}
                  >
                    {letter.title}
                  </h1>

                  <p
                    style={{
                      color: "#889087",
                      fontStyle: "italic",
                      marginBottom: 55,
                    }}
                  >
                    {letter.subtitle}
                  </p>

                  <div
                    style={{
                      fontFamily: "var(--font-handwriting)",
                      fontSize: 31,
                      lineHeight: 2.05,
                      color: "#536552",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {letter.content}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}