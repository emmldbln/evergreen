"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Letter } from "./letters";

interface Props {
  letter: Letter;
  onOpen: (letter: Letter) => void;
}

export default function Envelope({ letter, onOpen }: Props) {
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    if (opening) return;

    setOpening(true);

    setTimeout(() => {
      onOpen(letter);
      setOpening(false);
    }, 650);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.25 }}
      onClick={handleOpen}
      style={{
        width: 280,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Envelope */}

      <div
        style={{
          position: "relative",
          width: 280,
          height: 170,
          overflow: "hidden",
          borderRadius: 18,
          background: "linear-gradient(180deg,#F9F2E8,#EFE4D3)",
          boxShadow: "0 18px 45px rgba(77,91,77,.12)",
        }}
      >
        {/* Paper */}

        <motion.div
          animate={
            opening
              ? {
                  y: -70,
                  scale: 1.04,
                }
              : {
                  y: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: -6,
            height: 92,
            borderRadius: 10,
            background:
              "linear-gradient(180deg,#FFFDFB,#FAF6F0)",
            boxShadow:
              "0 8px 18px rgba(0,0,0,.05)",
            zIndex: 1,
          }}
        />

        {/* Top Flap */}

        <motion.div
          animate={
            opening
              ? {
                  rotateX: 180,
                }
              : {
                  rotateX: 0,
                }
          }
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            height: 95,
            background: "#F4EBDE",
            clipPath: "polygon(0 100%,50% 0,100% 100%)",
            transformOrigin: "top",
            zIndex: 5,
          }}
        />

        {/* Left Fold */}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            borderLeft: "140px solid #F0E5D5",
            borderTop: "85px solid transparent",
            zIndex: 4,
          }}
        />

        {/* Right Fold */}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
            borderRight: "140px solid #F0E5D5",
            borderTop: "85px solid transparent",
            zIndex: 4,
          }}
        />

        {/* Bottom Fold */}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: 92,
            background: "#ECE0CF",
            clipPath: "polygon(0 0,50% 100%,100% 0)",
            zIndex: 3,
          }}
        />

        {/* ========================= */}
        {/* Wax Seal - FIXED CENTER */}
        {/* ========================= */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 6,
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={
              opening
                ? {
                    scale: 0.85,
                    opacity: 0,
                  }
                : {
                    scale: 1,
                    opacity: 1,
                  }
            }
            transition={{
              duration: 0.3,
            }}
            style={{
              width: 52,
              height: 52,

              borderRadius: "50%",

              background:
                "linear-gradient(135deg,#D97569,#B24D49)",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              color: "white",
              fontWeight: 700,
              fontSize: 24,

              boxShadow:
                "0 10px 22px rgba(178,77,73,.35)",

              transform: "translateY(12px)",
            }}
          >
            E
          </motion.div>
        </div>
      </div>

      {/* Text */}

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
        }}
      >
        <h3
          style={{
            color: "#4F6F5A",
            fontSize: 18,
            fontFamily: "var(--font-serif)",
            marginBottom: 8,
          }}
        >
          {letter.title}
        </h3>

        <p
          style={{
            color: "#8D958A",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {letter.subtitle}
        </p>
      </div>
    </motion.div>
  );
}