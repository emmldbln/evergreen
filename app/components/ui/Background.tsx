"use client";

import { useEffect, useState } from "react";

interface Leaf {
  id: number;
  left: string;
  size: string;
  duration: string;
  delay: string;
  rotation: string;
  drift: string;
  opacity: number;
}

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
  opacity: number;
}

/*
 * Deterministic pseudo-random generator.
 *
 * IMPORTANT:
 * Do not use Math.random() here.
 *
 * Background is rendered on both the server and client,
 * so generated values must remain identical.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;

  return x - Math.floor(x);
}

/*
 * Generate leaves deterministically.
 *
 * CSS values are converted into fixed strings here so that
 * server and client serialization remains identical.
 */
function generateLeaves(): Leaf[] {
  return Array.from({ length: 20 }, (_, index) => {
    const random = (offset: number) =>
      seededRandom(index * 100 + offset);

    return {
      id: index,

      left: `${(random(1) * 100).toFixed(4)}%`,

      size: `${(18 + random(2) * 32).toFixed(4)}px`,

      duration: `${(15 + random(3) * 16).toFixed(4)}s`,

      delay: `${(random(4) * -30).toFixed(4)}s`,

      rotation: `${(random(5) * 360).toFixed(4)}deg`,

      drift: `${(-120 + random(6) * 240).toFixed(4)}px`,

      opacity: 0.13 + random(7) * 0.16,
    };
  });
}

/*
 * Generate particles deterministically.
 *
 * CSS values are converted into fixed strings here so that
 * server and client serialization remains identical.
 */
function generateParticles(): Particle[] {
  return Array.from({ length: 45 }, (_, index) => {
    const random = (offset: number) =>
      seededRandom(index * 100 + offset + 5000);

    return {
      id: index,

      left: `${(random(1) * 100).toFixed(4)}%`,

      top: `${(random(2) * 100).toFixed(4)}%`,

      size: `${(2 + random(3) * 4).toFixed(4)}px`,

      duration: `${(4 + random(4) * 9).toFixed(4)}s`,

      delay: `${(random(5) * -12).toFixed(4)}s`,

      opacity: 0.18 + random(6) * 0.30,
    };
  });
}

const leaves = generateLeaves();
const particles = generateParticles();

export default function Background() {
  const [scrollY, setScrollY] = useState(0);

  /*
   * Scroll parallax only.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* =====================================================
          GLOBAL BACKGROUND
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -1,

          background:
            "linear-gradient(180deg, #E4F1E7 0%, #F2F8F3 45%, #E2EFE5 100%)",
        }}
      >
        {/* =================================================
            LARGE GREEN AURORA
            ================================================= */}

        <div
          style={{
            position: "absolute",

            width: "85vw",
            height: "85vw",

            maxWidth: 1000,
            maxHeight: 1000,

            left: "-25%",
            top: "-35%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(72,137,98,.34) 0%, rgba(88,153,110,.22) 30%, rgba(111,168,130,.10) 50%, transparent 74%)",

            filter: "blur(40px)",

            transform: `translate3d(0, ${scrollY * 0.08}px, 0)`,

            animation:
              "evergreenAuroraOne 16s ease-in-out infinite alternate",
          }}
        />

        {/* =================================================
            SECOND GREEN AURORA
            ================================================= */}

        <div
          style={{
            position: "absolute",

            width: "75vw",
            height: "75vw",

            maxWidth: 900,
            maxHeight: 900,

            right: "-25%",
            top: "5%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(102,157,119,.30) 0%, rgba(135,178,145,.20) 32%, rgba(166,199,170,.10) 52%, transparent 75%)",

            filter: "blur(50px)",

            transform: `translate3d(0, ${scrollY * -0.06}px, 0)`,

            animation:
              "evergreenAuroraTwo 19s ease-in-out infinite alternate",
          }}
        />

        {/* =================================================
            LOWER GREEN GLOW
            ================================================= */}

        <div
          style={{
            position: "absolute",

            width: "70vw",
            height: "70vw",

            maxWidth: 850,
            maxHeight: 850,

            left: "5%",
            bottom: "-40%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(65,121,88,.23) 0%, rgba(92,146,108,.12) 42%, transparent 74%)",

            filter: "blur(55px)",

            animation:
              "evergreenAuroraThree 22s ease-in-out infinite alternate",
          }}
        />

        {/* =================================================
            WARM SUNLIGHT
            ================================================= */}

        <div
          style={{
            position: "absolute",

            width: 600,
            height: 600,

            right: "-180px",
            top: "-200px",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(255,247,210,.65) 0%, rgba(255,238,185,.35) 30%, rgba(255,232,173,.12) 52%, transparent 75%)",

            filter: "blur(35px)",

            transform: `translate3d(0, ${scrollY * 0.04}px, 0)`,

            animation:
              "evergreenSun 13s ease-in-out infinite alternate",
          }}
        />

        {/* =================================================
            SECOND WARM GLOW
            ================================================= */}

        <div
          style={{
            position: "absolute",

            width: 420,
            height: 420,

            left: "-140px",
            bottom: "10%",

            borderRadius: "50%",

            background:
              "radial-gradient(circle, rgba(224,243,215,.45) 0%, transparent 72%)",

            filter: "blur(45px)",

            animation:
              "evergreenSunTwo 18s ease-in-out infinite alternate",
          }}
        />

        {/* =================================================
            FLOATING LIGHT PARTICLES
            ================================================= */}

        {particles.map((particle) => (
          <div
            key={`particle-${particle.id}`}
            style={{
              position: "absolute",

              left: particle.left,
              top: particle.top,

              width: particle.size,
              height: particle.size,

              borderRadius: "50%",

              background: "rgba(255,255,255,.95)",

              opacity: particle.opacity,

              boxShadow:
                "0 0 12px rgba(255,255,255,.75)",

              animation: `evergreenParticle ${particle.duration} ease-in-out ${particle.delay} infinite alternate`,
            }}
          />
        ))}

        {/* =================================================
            LARGER BOKEH PARTICLES
            ================================================= */}

        <div
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            left: "17%",
            top: "28%",
            borderRadius: "50%",
            background: "rgba(255,255,255,.65)",
            filter: "blur(2px)",
            boxShadow:
              "0 0 22px rgba(255,255,255,.65)",
            animation:
              "evergreenBokeh 7s ease-in-out infinite alternate",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 9,
            height: 9,
            right: "19%",
            top: "55%",
            borderRadius: "50%",
            background: "rgba(255,255,255,.55)",
            filter: "blur(2px)",
            boxShadow:
              "0 0 20px rgba(255,255,255,.60)",
            animation:
              "evergreenBokeh 9s ease-in-out 1s infinite alternate",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 15,
            height: 15,
            left: "72%",
            top: "20%",
            borderRadius: "50%",
            background: "rgba(255,255,255,.50)",
            filter: "blur(3px)",
            boxShadow:
              "0 0 28px rgba(255,255,255,.60)",
            animation:
              "evergreenBokeh 11s ease-in-out 2s infinite alternate",
          }}
        />

        {/* =================================================
            FALLING LEAVES
            ================================================= */}

        {leaves.map((leaf) => (
          <div
            key={`leaf-${leaf.id}`}
            style={{
              position: "absolute",

              left: leaf.left,
              top: "-80px",

              width: leaf.size,
              height: `${(
                parseFloat(leaf.size) * 0.58
              ).toFixed(4)}px`,

              opacity: leaf.opacity,

              animation: `evergreenLeaf ${leaf.duration} linear ${leaf.delay} infinite`,
            }}
          >
            {/* Leaf */}

            <div
              style={{
                position: "absolute",
                inset: 0,

                borderRadius:
                  "100% 0 100% 0",

                background:
                  "linear-gradient(135deg, rgba(48,105,69,.88), rgba(92,145,104,.72) 55%, rgba(139,174,143,.55))",

                transform: `rotate(${leaf.rotation})`,

                boxShadow:
                  "0 3px 10px rgba(54,95,76,.12)",
              }}
            />

            {/* Leaf vein */}

            <div
              style={{
                position: "absolute",

                width: "72%",
                height: "1px",

                left: "14%",
                top: "50%",

                background:
                  "rgba(255,255,255,.30)",

                transform: `rotate(${leaf.rotation})`,

                transformOrigin:
                  "left center",
              }}
            />
          </div>
        ))}

        {/* =================================================
            SOFT VIGNETTE
            ================================================= */}

        <div
          style={{
            position: "absolute",
            inset: 0,

            background:
              "radial-gradient(circle at center, transparent 38%, rgba(38,83,58,.075) 100%)",
          }}
        />

        {/* =================================================
            VERY SUBTLE TOP LIGHT
            ================================================= */}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "30%",

            background:
              "linear-gradient(180deg, rgba(255,255,255,.20), transparent)",

            opacity: 0.7,
          }}
        />
      </div>

      {/* =====================================================
          GLOBAL ANIMATIONS
          ===================================================== */}

      <style jsx global>{`
        @keyframes evergreenAuroraOne {
          0% {
            transform:
              translate3d(-5%, -3%, 0)
              scale(0.95);
          }

          50% {
            transform:
              translate3d(7%, 5%, 0)
              scale(1.10);
          }

          100% {
            transform:
              translate3d(-2%, 9%, 0)
              scale(1.02);
          }
        }

        @keyframes evergreenAuroraTwo {
          0% {
            transform:
              translate3d(5%, 3%, 0)
              scale(0.96);
          }

          50% {
            transform:
              translate3d(-7%, -5%, 0)
              scale(1.10);
          }

          100% {
            transform:
              translate3d(3%, 7%, 0)
              scale(1.02);
          }
        }

        @keyframes evergreenAuroraThree {
          0% {
            transform:
              translate3d(-3%, 2%, 0)
              scale(0.95);
          }

          100% {
            transform:
              translate3d(8%, -7%, 0)
              scale(1.12);
          }
        }

        @keyframes evergreenSun {
          0% {
            opacity: 0.55;
            transform: scale(0.92);
          }

          50% {
            opacity: 0.85;
          }

          100% {
            opacity: 1;
            transform: scale(1.12);
          }
        }

        @keyframes evergreenSunTwo {
          0% {
            opacity: 0.35;
            transform: scale(0.9);
          }

          100% {
            opacity: 0.75;
            transform: scale(1.15);
          }
        }

        @keyframes evergreenParticle {
          0% {
            transform:
              translate3d(0, 0, 0)
              scale(0.65);

            opacity: 0.08;
          }

          35% {
            opacity: 0.40;
          }

          70% {
            opacity: 0.65;
          }

          100% {
            transform:
              translate3d(18px, -30px, 0)
              scale(1.35);

            opacity: 0.12;
          }
        }

        @keyframes evergreenBokeh {
          0% {
            transform:
              translate3d(0, 0, 0)
              scale(0.75);

            opacity: 0.25;
          }

          100% {
            transform:
              translate3d(20px, -25px, 0)
              scale(1.25);

            opacity: 0.75;
          }
        }

        @keyframes evergreenLeaf {
          0% {
            transform:
              translate3d(0, -100px, 0)
              rotate(0deg);
          }

          20% {
            transform:
              translate3d(55px, 20vh, 0)
              rotate(75deg);
          }

          40% {
            transform:
              translate3d(-45px, 40vh, 0)
              rotate(150deg);
          }

          60% {
            transform:
              translate3d(65px, 60vh, 0)
              rotate(225deg);
          }

          80% {
            transform:
              translate3d(-35px, 80vh, 0)
              rotate(300deg);
          }

          100% {
            transform:
              translate3d(45px, 115vh, 0)
              rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }

        @media (max-width: 600px) {
          @keyframes evergreenLeaf {
            0% {
              transform:
                translate3d(0, -100px, 0)
                rotate(0deg);
            }

            50% {
              transform:
                translate3d(25px, 55vh, 0)
                rotate(180deg);
            }

            100% {
              transform:
                translate3d(-20px, 115vh, 0)
                rotate(360deg);
            }
          }
        }
      `}</style>
    </>
  );
}