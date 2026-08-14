"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  src: string;
}

export default function VideoCard({ src }: Props) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] =
    useState(false);

  const [error, setError] =
    useState(false);

  const playVideo = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      setError(false);

      await video.play();

      setPlaying(true);
    } catch (error) {
      console.error(
        "Failed to play memory video:",
        error
      );

      setPlaying(false);
      setError(true);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 26,
        cursor: "pointer",
        boxShadow:
          "0 18px 45px rgba(0,0,0,.16)",
      }}
    >
      <video
        ref={videoRef}
        controls={playing}
        preload="metadata"
        onPause={() =>
          setPlaying(false)
        }
        onEnded={() =>
          setPlaying(false)
        }
        onError={() => {
          const video =
            videoRef.current;

          console.error(
            "Video failed to load:",
            {
              src,
              networkState:
                video?.networkState,
              readyState:
                video?.readyState,
              errorCode:
                video?.error?.code,
              errorMessage:
                video?.error?.message,
            }
          );

          setPlaying(false);
          setError(true);
        }}
        style={{
          width: "100%",
          display: "block",
          background: "#000",
        }}
      >
        <source src={src} />
      </video>

      {!playing && !error && (
        <div
          onClick={playVideo}
          style={{
            position: "absolute",
            inset: 0,

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            background:
              "linear-gradient(rgba(0,0,0,.15), rgba(0,0,0,.25))",

            transition: ".35s",
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,

              borderRadius: "50%",

              background:
                "rgba(255,255,255,.22)",

              backdropFilter:
                "blur(18px)",

              WebkitBackdropFilter:
                "blur(18px)",

              border:
                "1px solid rgba(255,255,255,.35)",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Play
              fill="white"
              color="white"
              size={34}
              style={{
                marginLeft: 5,
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,

            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",

            gap: 12,

            background:
              "rgba(0,0,0,.72)",

            color: "white",
            textAlign: "center",
            padding: 24,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            This video could not be
            loaded.
          </p>

          <button
            type="button"
            onClick={() => {
              setError(false);

              const video =
                videoRef.current;

              if (video) {
                video.load();
              }
            }}
            style={{
              padding:
                "10px 18px",
              borderRadius: 999,
              border:
                "1px solid rgba(255,255,255,.3)",
              background:
                "rgba(255,255,255,.15)",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}