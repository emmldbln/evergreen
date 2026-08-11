"use client";

import {
  X,
  ChevronLeft,
  ChevronRight,
  FileVideo,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

export interface LightBoxMedia {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

interface Props {
  images: LightBoxMedia[];
  current: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

function isVideoFile(media: LightBoxMedia) {
  if (media.mimeType?.startsWith("video/")) {
    return true;
  }

  const extension = media.name
    ?.split(".")
    .pop()
    ?.toLowerCase();

  return [
    "mp4",
    "webm",
    "mov",
    "m4v",
    "ogg",
    "ogv",
    "avi",
    "mkv",
  ].includes(extension ?? "");
}

export default function LightBox({
  images,
  current,
  open,
  onClose,
  onNext,
  onPrev,
}: Props) {
  /*
   * Store the URL of the media that failed.
   *
   * This avoids resetting state inside an effect
   * whenever the selected media changes.
   */
  const [mediaErrorUrl, setMediaErrorUrl] =
    useState<string | null>(null);

  const media = images[current];

  const isVideo = useMemo(() => {
    if (!media) {
      return false;
    }

    return isVideoFile(media);
  }, [media]);

  /*
   * An error only applies to the media whose
   * URL actually failed.
   */
  const mediaError =
    !!media &&
    mediaErrorUrl === media.url;

  /*
   * Keyboard controls + body scroll lock.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    open,
    onClose,
    onNext,
    onPrev,
  ]);

  if (!open || !media) {
    return null;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,

        background:
          "rgba(8, 8, 8, 0.94)",

        backdropFilter:
          "blur(22px)",

        WebkitBackdropFilter:
          "blur(22px)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        animation:
          "lightboxFadeIn .25s ease",
      }}
    >
      {/* CLOSE BUTTON */}

      <button
        type="button"
        aria-label="Close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 28,
          right: 28,

          zIndex: 10,

          width: 52,
          height: 52,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          border: "none",
          borderRadius: "50%",

          cursor: "pointer",

          color: "white",

          background:
            "rgba(255,255,255,.10)",

          backdropFilter:
            "blur(15px)",

          WebkitBackdropFilter:
            "blur(15px)",

          boxShadow:
            "0 8px 30px rgba(0,0,0,.25)",
        }}
      >
        <X size={26} />
      </button>

      {/* COUNTER */}

      <div
        style={{
          position: "absolute",
          top: 30,
          left: "50%",

          transform:
            "translateX(-50%)",

          zIndex: 10,

          color: "white",

          fontSize: 15,
          fontWeight: 500,

          padding: "10px 17px",

          borderRadius: 999,

          background:
            "rgba(255,255,255,.08)",

          backdropFilter:
            "blur(15px)",

          WebkitBackdropFilter:
            "blur(15px)",

          whiteSpace: "nowrap",
        }}
      >
        {current + 1} / {images.length}
      </div>

      {/* LEFT BUTTON */}

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous memory"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          style={{
            position: "absolute",
            left: 24,

            zIndex: 10,

            width: 58,
            height: 58,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            border: "none",
            borderRadius: "50%",

            cursor: "pointer",

            color: "white",

            background:
              "rgba(255,255,255,.09)",

            backdropFilter:
              "blur(15px)",

            WebkitBackdropFilter:
              "blur(15px)",

            transition:
              "background .2s ease, transform .2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              "rgba(255,255,255,.16)";

            event.currentTarget.style.transform =
              "scale(1.05)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "rgba(255,255,255,.09)";

            event.currentTarget.style.transform =
              "scale(1)";
          }}
        >
          <ChevronLeft size={34} />
        </button>
      )}

      {/* MEDIA AREA */}

      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          position: "relative",

          width:
            "min(92vw, 1400px)",

          height:
            "min(82vh, 850px)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          animation:
            "lightboxZoomIn .25s ease",

          padding:
            "20px 80px",

          boxSizing: "border-box",
        }}
      >
        {mediaError ? (
          <div
            style={{
              width: "min(500px, 80vw)",

              padding: 40,

              textAlign: "center",

              borderRadius: 24,

              background:
                "rgba(255,255,255,.08)",

              border:
                "1px solid rgba(255,255,255,.12)",

              color: "white",

              backdropFilter:
                "blur(20px)",

              WebkitBackdropFilter:
                "blur(20px)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,

                margin:
                  "0 auto 20px",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: "50%",

                background:
                  "rgba(255,255,255,.08)",
              }}
            >
              {isVideo ? (
                <FileVideo size={30} />
              ) : (
                <X size={30} />
              )}
            </div>

            <h3
              style={{
                margin:
                  "0 0 10px",

                fontSize: 20,

                fontFamily:
                  "var(--font-serif)",
              }}
            >
              Unable to display
              this memory
            </h3>

            <p
              style={{
                margin: 0,

                opacity: 0.7,

                fontSize: 14,

                wordBreak:
                  "break-word",
              }}
            >
              {media.name}
            </p>
          </div>
        ) : isVideo ? (
          <video
            key={media.id}
            src={media.url}
            controls
            playsInline
            preload="metadata"
            onError={() =>
              setMediaErrorUrl(
                media.url
              )
            }
            style={{
              display: "block",

              maxWidth: "100%",
              maxHeight: "100%",

              width: "auto",
              height: "auto",

              objectFit: "contain",

              borderRadius: 14,

              background:
                "rgba(0,0,0,.25)",

              boxShadow:
                "0 25px 80px rgba(0,0,0,.45)",
            }}
          >
            Your browser does not
            support video playback.
          </video>
        ) : (
          <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={media.id}
            src={media.url}
            alt={
              media.name || "Memory"
            }
            draggable={false}
            onError={() =>
              setMediaErrorUrl(
                media.url
              )
            }
            style={{
              display: "block",

              maxWidth: "100%",
              maxHeight: "100%",

              width: "auto",
              height: "auto",

              objectFit: "contain",

              userSelect: "none",

              borderRadius: 14,

              boxShadow:
                "0 25px 80px rgba(0,0,0,.45)",
            }}
          />
          </>
        )}
      </div>

      {/* RIGHT BUTTON */}

      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next memory"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          style={{
            position: "absolute",
            right: 24,

            zIndex: 10,

            width: 58,
            height: 58,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            border: "none",
            borderRadius: "50%",

            cursor: "pointer",

            color: "white",

            background:
              "rgba(255,255,255,.09)",

            backdropFilter:
              "blur(15px)",

            WebkitBackdropFilter:
              "blur(15px)",

            transition:
              "background .2s ease, transform .2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background =
              "rgba(255,255,255,.16)";

            event.currentTarget.style.transform =
              "scale(1.05)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background =
              "rgba(255,255,255,.09)";

            event.currentTarget.style.transform =
              "scale(1)";
          }}
        >
          <ChevronRight size={34} />
        </button>
      )}

      {/* BOTTOM INFORMATION */}

      <div
        style={{
          position: "absolute",

          left: "50%",
          bottom: 28,

          transform:
            "translateX(-50%)",

          width:
            "min(90vw, 700px)",

          textAlign: "center",

          color: "white",

          pointerEvents: "none",
        }}
      >
        <h3
          style={{
            margin:
              "0 0 7px",

            fontSize: 20,

            fontFamily:
              "var(--font-serif)",

            fontWeight: 600,

            textShadow:
              "0 2px 10px rgba(0,0,0,.5)",

            overflow: "hidden",
            textOverflow:
              "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {media.name}
        </h3>

        <p
          style={{
            margin: 0,

            opacity: 0.65,

            fontSize: 13,

            overflow: "hidden",
            textOverflow:
              "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {isVideo
            ? "Video"
            : "Photo"}
        </p>
      </div>

      <style>{`
        @keyframes lightboxFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes lightboxZoomIn {
          from {
            opacity: 0;
            transform: scale(.96);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}