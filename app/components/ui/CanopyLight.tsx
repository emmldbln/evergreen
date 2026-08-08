"use client";

export default function CanopyLight() {
  return (
    <>
      {/* Large canopy shadow */}
      <div className="canopy canopy1" />

      {/* Secondary shadow */}
      <div className="canopy canopy2" />

      {/* Soft light opening */}
      <div className="opening opening1" />

      {/* Smaller opening */}
      <div className="opening opening2" />

      <style jsx>{`
        .canopy {
          position: fixed;
          pointer-events: none;
          border-radius: 50%;
          filter: blur(110px);
          z-index: -36;
          animation: sway 30s ease-in-out infinite;
        }

        .canopy1 {
          width: 950px;
          height: 700px;

          left: -180px;
          top: -220px;

          background: radial-gradient(
            ellipse,
            rgba(87, 120, 92, 0.13),
            transparent 72%
          );
        }

        .canopy2 {
          width: 700px;
          height: 600px;

          right: -150px;
          top: -100px;

          background: radial-gradient(
            ellipse,
            rgba(82, 118, 86, 0.09),
            transparent 72%
          );

          animation-duration: 42s;
        }

        .opening {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: -35;
          animation: breathe 18s ease-in-out infinite;
        }

        .opening1 {
          width: 340px;
          height: 220px;

          top: 90px;
          left: 22%;

          background: radial-gradient(
            ellipse,
            rgba(255, 255, 255, 0.22),
            transparent 75%
          );
        }

        .opening2 {
          width: 260px;
          height: 180px;

          top: 140px;
          right: 20%;

          background: radial-gradient(
            ellipse,
            rgba(255, 255, 255, 0.18),
            transparent 75%
          );

          animation-delay: 6s;
        }

        @keyframes sway {
          0% {
            transform: translateX(0px) translateY(0px);
          }

          50% {
            transform: translateX(25px) translateY(12px);
          }

          100% {
            transform: translateX(0px) translateY(0px);
          }
        }

        @keyframes breathe {
          0% {
            opacity: 0.45;
            transform: scale(1);
          }

          50% {
            opacity: 0.65;
            transform: scale(1.08);
          }

          100% {
            opacity: 0.45;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}