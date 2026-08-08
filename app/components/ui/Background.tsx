"use client";

import BotanicalSilhouettes from "./BotanicalSilhouettes";

export default function Background() {
  return (
    <>
      {/* Main Botanical Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          zIndex: -50,

          background: `
            radial-gradient(circle at 15% 15%, rgba(230,243,228,.95) 0%, transparent 38%),
            radial-gradient(circle at 85% 10%, rgba(216,233,220,.65) 0%, transparent 42%),
            radial-gradient(circle at 82% 84%, rgba(193,218,197,.55) 0%, transparent 40%),
            linear-gradient(
              180deg,
              #FCFDFC 0%,
              #F7FBF6 30%,
              #EFF6ED 65%,
              #E8F2E6 100%
            )
          `,
        }}
      />

      {/* Glow 1 */}
      <div
        style={{
          position: "fixed",
          width: 1200,
          height: 1200,
          left: -350,
          top: -350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(176,209,180,.30), transparent 72%)",
          filter: "blur(240px)",
          animation: "glowOne 120s ease-in-out infinite",
          zIndex: -49,
        }}
      />

      {/* Glow 2 */}
      <div
        style={{
          position: "fixed",
          width: 1000,
          height: 1000,
          right: -250,
          top: -120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(175,214,198,.22), transparent 72%)",
          filter: "blur(230px)",
          animation: "glowTwo 140s ease-in-out infinite",
          zIndex: -49,
        }}
      />

      {/* Glow 3 */}
      <div
        style={{
          position: "fixed",
          width: 1300,
          height: 1300,
          right: -450,
          bottom: -450,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(162,193,168,.26), transparent 72%)",
          filter: "blur(260px)",
          animation: "glowThree 160s ease-in-out infinite",
          zIndex: -49,
        }}
      />

      {/* Soft top light */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(ellipse at top, rgba(255,255,255,.22), transparent 65%)",
          pointerEvents: "none",
          zIndex: -48,
        }}
      />

      {/* Botanical vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "radial-gradient(circle, transparent 60%, rgba(70,90,74,.045) 100%)",
          pointerEvents: "none",
          zIndex: -47,
        }}
      />

      <BotanicalSilhouettes />

      <style jsx global>{`
        @keyframes glowOne {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(18px, 12px) scale(1.02);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes glowTwo {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-16px, 18px) scale(1.015);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes glowThree {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-20px, -10px) scale(1.025);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
      `}</style>
    </>
  );
}