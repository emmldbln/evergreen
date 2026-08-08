"use client";

import { useState } from "react";
import Image from "next/image";

import LightBox from "./LightBox";

interface Props {
  photos: string[];
}

export default function GalleryGrid({
  photos,
}: Props) {
  const [open, setOpen] =
    useState(false);

  const [current, setCurrent] =
    useState(0);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(280px,320px))",

          justifyContent: "center",

          gap: 24,
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo}
            onClick={() => {
              setCurrent(index);
              setOpen(true);
            }}
            style={{
              position: "relative",

              width: "100%",

              aspectRatio: "1",

              overflow: "hidden",

              cursor: "pointer",

              borderRadius: 24,

              background: "#F5F5F5",

              boxShadow:
                "0 14px 34px rgba(0,0,0,.10)",

              transition:
                ".35s ease",
            }}
          >
            <Image
              src={photo}
              alt="Memory"

              fill

              sizes="320px"

              style={{
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>

      <LightBox
        images={photos}
        current={current}
        open={open}
        onClose={() =>
          setOpen(false)
        }
        onNext={() =>
          setCurrent((prev) =>
            prev === photos.length - 1
              ? 0
              : prev + 1
          )
        }
        onPrev={() =>
          setCurrent((prev) =>
            prev === 0
              ? photos.length - 1
              : prev - 1
          )
        }
      />
    </>
  );
}