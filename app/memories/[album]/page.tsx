import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Video } from "lucide-react";

import { getAlbum } from "@/lib/memories";
import VideoCard from "@/app/components/memories/VideoCard";
import GalleryGrid from "@/app/components/memories/GalleryGrid";

interface Props {
  params: Promise<{
    album: string;
  }>;
}

export default async function AlbumPage({
  params,
}: Props) {
  const { album } = await params;

  const data = getAlbum(album);

  if (!data) {
    notFound();
  }

  const photos = data.media.filter((file) => {
    const lower = file.toLowerCase();

    return (
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp")
    );
  });

  const videos = data.media.filter((file) => {
    const lower = file.toLowerCase();

    return (
      lower.endsWith(".mp4") ||
      lower.endsWith(".mov") ||
      lower.endsWith(".webm")
    );
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "40px 32px 140px",
      }}
    >
      {/* Back Button */}

      <div
        style={{
          position: "sticky",
          top: 20,
          zIndex: 20,
          marginBottom: 40,
        }}
      >
        <Link
          href="/memories"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 22px",
            borderRadius: 999,
            textDecoration: "none",
            color: "#456C57",
            fontWeight: 600,
            background: "rgba(255,255,255,.78)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(69,108,87,.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <ArrowLeft size={20} />
          Back to Memories
        </Link>
      </div>

      {/* Header */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 70,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 56,
            color: "#456C57",
            marginBottom: 10,
          }}
        >
          {data.title}
        </h1>

        <p
          style={{
            color: "#7E887F",
            fontSize: 18,
          }}
        >
          {data.date}
        </p>

        <p
          style={{
            color: "#7E887F",
            marginTop: 4,
            marginBottom: 22,
            fontSize: 18,
          }}
        >
          {data.location}
        </p>

        <p
          style={{
            maxWidth: 850,
            margin: "0 auto",
            color: "#58665C",
            lineHeight: 1.9,
            fontSize: 18,
          }}
        >
          {data.story}
        </p>
      </div>

      {/* ================= PHOTOS ================= */}

      {photos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <ImageIcon size={26} color="#456C57" />

            <h2
              style={{
                fontSize: 34,
                color: "#456C57",
                fontFamily: "var(--font-serif)",
              }}
            >
              Photos
            </h2>

            <span
              style={{
                color: "#7A887C",
                fontSize: 18,
              }}
            >
              ({photos.length})
            </span>
          </div>

          <GalleryGrid photos={photos} />
        </>
      )}

      {/* ================= VIDEOS ================= */}

      {videos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <Video size={26} color="#456C57" />

            <h2
              style={{
                fontSize: 34,
                color: "#456C57",
                fontFamily: "var(--font-serif)",
              }}
            >
              Videos
            </h2>

            <span
              style={{
                color: "#7A887C",
                fontSize: 18,
              }}
            >
              ({videos.length})
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(420px,1fr))",
              gap: 28,
            }}
          >
            {videos.map((file) => (
              <VideoCard
                key={file}
                src={file}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}