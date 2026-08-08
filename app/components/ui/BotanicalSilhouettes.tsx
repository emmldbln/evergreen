"use client";

export default function BotanicalSilhouettes() {
  return (
    <>
      {/* Top Left */}
      <div className="leaf leaf1" />

      {/* Bottom Right */}
      <div className="leaf leaf2" />

      {/* Right Center */}
      <div className="leaf leaf3" />

      {/* Bottom Left */}
      <div className="leaf leaf4" />

      <style jsx>{`
        .leaf{
          position:fixed;

          background:
            radial-gradient(
              ellipse at center,
              rgba(121,155,126,.18),
              rgba(121,155,126,.08),
              transparent 72%
            );

          filter:blur(70px);

          border-radius:60% 40% 70% 30%;

          pointer-events:none;

          z-index:-35;
        }

        .leaf1{
          width:420px;
          height:650px;

          left:-180px;
          top:-120px;

          transform:rotate(-30deg);
        }

        .leaf2{
          width:520px;
          height:760px;

          right:-240px;
          bottom:-220px;

          transform:rotate(18deg);
        }

        .leaf3{
          width:300px;
          height:520px;

          right:-120px;
          top:25%;

          opacity:.6;

          transform:rotate(38deg);
        }

        .leaf4{
          width:280px;
          height:420px;

          left:-120px;
          bottom:15%;

          opacity:.45;

          transform:rotate(-18deg);
        }
      `}</style>
    </>
  );
}