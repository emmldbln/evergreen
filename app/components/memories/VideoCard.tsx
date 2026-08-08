"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  src: string;
}

export default function VideoCard({ src }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);

  const playVideo = () => {
    if (!videoRef.current) return;

    videoRef.current.play();
    setPlaying(true);
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 26,
        cursor: "pointer",
        boxShadow: "0 18px 45px rgba(0,0,0,.16)",
      }}
    >
      <video
        ref={videoRef}
        controls={playing}
        preload="metadata"
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{
          width: "100%",
          display: "block",
          background: "#000",
        }}
      >
        <source src={src} />
      </video>

      {!playing && (
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

              background: "rgba(255,255,255,.22)",

              backdropFilter: "blur(18px)",

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
    </div>
  );
}