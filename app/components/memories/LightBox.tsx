"use client";

import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  images: string[];
  current: number;
  open: boolean;
  onClose: () => void;
  onNext: () =>void;
  onPrev: () => void;
}

export default function LightBox({
  images,
  current,
  open,
  onClose,
  onNext,
  onPrev,
}: Props) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handler);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [open, onClose, onNext, onPrev]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,

        background:
          "rgba(8,8,8,.90)",

        backdropFilter: "blur(22px)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        animation: "fadeIn .25s ease",
      }}
    >
      {/* Close */}

      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 30,
          right: 30,

          width: 52,
          height: 52,

          borderRadius: "50%",

          border: "none",

          cursor: "pointer",

          color: "white",

          background:
            "rgba(255,255,255,.12)",

          backdropFilter: "blur(15px)",
        }}
      >
        <X size={26} />
      </button>

      {/* Counter */}

      <div
        style={{
          position: "absolute",

          top: 35,
          left: "50%",

          transform: "translateX(-50%)",

          color: "white",

          fontSize: 18,

          padding: "10px 18px",

          borderRadius: 999,

          background:
            "rgba(255,255,255,.10)",

          backdropFilter: "blur(15px)",
        }}
      >
        {current + 1} / {images.length}
      </div>

      {/* Left */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        style={{
          position: "absolute",
          left: 28,

          width: 58,
          height: 58,

          borderRadius: "50%",

          border: "none",

          color: "white",

          cursor: "pointer",

          background:
            "rgba(255,255,255,.10)",

          backdropFilter: "blur(15px)",
        }}
      >
        <ChevronLeft size={34} />
      </button>

      {/* Image */}

      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        style={{
          position: "relative",

          width: "90vw",
          height: "86vh",

          animation:
            "zoomIn .25s ease",
        }}
      >
        <Image
          src={images[current]}
          alt="Memory"
          fill
          priority
          sizes="90vw"
          style={{
            objectFit: "contain",
            userSelect: "none",
          }}
        />
      </div>

      {/* Right */}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        style={{
          position: "absolute",
          right: 28,

          width: 58,
          height: 58,

          borderRadius: "50%",

          border: "none",

          color: "white",

          cursor: "pointer",

          background:
            "rgba(255,255,255,.10)",

          backdropFilter: "blur(15px)",
        }}
      >
        <ChevronRight size={34} />
      </button>

      {/* Bottom Metadata */}

      <div
        style={{
          position: "absolute",

          bottom: 35,

          left: "50%",

          transform: "translateX(-50%)",

          textAlign: "center",

          color: "white",
        }}
      >
        <h3
          style={{
            marginBottom: 8,
            fontSize: 22,
          }}
        >
          Memory
        </h3>

        <p
          style={{
            opacity: .75,
            fontSize: 16,
          }}
        >
          Date Taken • Caption • Location
        </p>
      </div>

      <style>{`
        @keyframes fadeIn{
          from{opacity:0}
          to{opacity:1}
        }

        @keyframes zoomIn{
          from{
            opacity:0;
            transform:scale(.95);
          }

          to{
            opacity:1;
            transform:scale(1);
          }
        }
      `}</style>
    </div>
  );
}