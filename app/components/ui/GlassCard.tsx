"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
}

export default function GlassCard({
  children,
}: GlassCardProps) {
  return (
    <section
      className="glass-card"
      style={{
        position: "relative",
        overflow: "hidden",

        borderRadius: 34,

        padding: 28,

        background: `
          linear-gradient(
            145deg,
            rgba(255,255,255,.82),
            rgba(255,255,255,.55)
          )
        `,

        backdropFilter: "blur(42px) saturate(190%)",
        WebkitBackdropFilter: "blur(42px) saturate(190%)",

        border: "1px solid rgba(255,255,255,.42)",

        boxShadow: `
          0 28px 70px rgba(70,92,74,.15),
          0 12px 35px rgba(255,255,255,.18),
          inset 0 1px rgba(255,255,255,.95),
          inset 0 -1px rgba(255,255,255,.20)
        `,

        transition: ".45s ease",
      }}
    >
      {/* Top Highlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 25,
          right: 25,
          height: 2,

          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,.95), transparent)",

          opacity: .9,

          pointerEvents: "none",
        }}
      />

      {/* Large Refraction */}
      <div
        className="glass-refraction"
        style={{
          position: "absolute",

          width: 450,
          height: 320,

          top: -150,
          left: -180,

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(255,255,255,.55), transparent 72%)",

          filter: "blur(20px)",

          pointerEvents: "none",
        }}
      />

      {/* Bottom Glow */}
      <div
        style={{
          position: "absolute",

          bottom: -140,
          right: -120,

          width: 280,
          height: 240,

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(255,255,255,.20), transparent 75%)",

          filter: "blur(24px)",

          pointerEvents: "none",
        }}
      />

      {/* Moving Light */}
      <div
        className="glass-light"
        style={{
          position: "absolute",

          inset: "-20%",

          background: `
            linear-gradient(
              120deg,
              transparent 20%,
              rgba(255,255,255,.18) 40%,
              rgba(255,255,255,.30) 50%,
              rgba(255,255,255,.12) 60%,
              transparent 80%
            )
          `,

          transform: "translateX(-140%)",

          pointerEvents: "none",
        }}
      />

      {/* Fake Caustics */}
      <div
        className="glass-caustics"
        style={{
          position: "absolute",

          inset: 0,

          background: `
            radial-gradient(circle at 20% 30%, rgba(255,255,255,.12), transparent 30%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,.10), transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,.08), transparent 45%)
          `,

          mixBlendMode: "screen",

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 5,
        }}
      >
        {children}
      </div>

      <style jsx>{`
        .glass-card {
          animation: breathe 8s ease-in-out infinite;
        }

        .glass-refraction {
          animation: refraction 16s ease-in-out infinite;
        }

        .glass-light {
          animation: sweep 9s linear infinite;
        }

        .glass-caustics {
          animation: caustics 10s ease-in-out infinite alternate;
        }

        .glass-card:hover {
          transform: translateY(-6px) scale(1.01);

          box-shadow:
            0 40px 90px rgba(65,92,70,.22),
            0 16px 45px rgba(255,255,255,.22),
            inset 0 1px rgba(255,255,255,1),
            inset 0 -1px rgba(255,255,255,.22);
        }

        @keyframes sweep {
          from {
            transform: translateX(-160%);
          }

          to {
            transform: translateX(180%);
          }
        }

        @keyframes refraction {
          0% {
            transform: translate(0px,0px) rotate(0deg);
          }

          50% {
            transform: translate(45px,25px) rotate(6deg);
          }

          100% {
            transform: translate(0px,0px) rotate(0deg);
          }
        }

        @keyframes breathe {
          0% {
            backdrop-filter: blur(42px) saturate(190%);
          }

          50% {
            backdrop-filter: blur(46px) saturate(205%);
          }

          100% {
            backdrop-filter: blur(42px) saturate(190%);
          }
        }

        @keyframes caustics {
          from {
            opacity: .55;
            transform: scale(1);
          }

          to {
            opacity: .9;
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  );
}