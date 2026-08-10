"use client";

import { useState } from "react";

import LightBox from "./LightBox";

export interface GalleryPhoto {
  id: string;
  name: string;
  url: string;
}

interface Props {
  photos: GalleryPhoto[];
}

export default function GalleryGrid({ photos }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  const openPhoto = (index: number) => {
    setCurrent(index);
    setOpen(true);
  };

  const closeLightBox = () => {
    setOpen(false);
  };

  const nextPhoto = () => {
    setCurrent((prev) =>
      prev === photos.length - 1 ? 0 : prev + 1
    );
  };

  const previousPhoto = () => {
    setCurrent((prev) =>
      prev === 0 ? photos.length - 1 : prev - 1
    );
  };

  /*
   * LightBox currently works with string URLs,
   * while GalleryGrid works with the richer
   * GalleryPhoto objects.
   *
   * Convert only for LightBox.
   */
  const lightBoxImages = photos.map((photo) => photo.url);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 320px))",
          justifyContent: "center",
          gap: 24,
          width: "100%",
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            onClick={() => openPhoto(index)}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              cursor: "pointer",
              borderRadius: 24,
              background: "#F5F5F5",
              boxShadow:
                "0 14px 34px rgba(0,0,0,.10)",
              transition:
                "transform .35s ease, box-shadow .35s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform =
                "translateY(-6px)";
              event.currentTarget.style.boxShadow =
                "0 20px 42px rgba(0,0,0,.15)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform =
                "translateY(0)";
              event.currentTarget.style.boxShadow =
                "0 14px 34px rgba(0,0,0,.10)";
            }}
          >
            <img
              src={photo.url}
              alt={photo.name || "Memory"}
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>

      <LightBox
        images={lightBoxImages}
        current={current}
        open={open}
        onClose={closeLightBox}
        onNext={nextPhoto}
        onPrev={previousPhoto}
      />
    </>
  );
}