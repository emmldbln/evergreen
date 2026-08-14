import { notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  ImageIcon,
  Video,
} from "lucide-react";

import {
  getFirestoreAlbum,
} from "@/lib/firestore/memories";

import VideoCard from "@/app/components/memories/VideoCard";
import GalleryGrid from "@/app/components/memories/GalleryGrid";

interface Props {
  params: Promise<{
    album: string;
  }>;
}

interface GalleryPhoto {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

interface GalleryVideo {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

function getDriveFileUrl(
  fileId: string
) {
  return `/api/memories/files/${encodeURIComponent(
    fileId
  )}`;
}

export default async function AlbumPage({
  params,
}: Props) {
  const { album } = await params;

  if (
    typeof album !== "string" ||
    album.trim().length === 0
  ) {
    notFound();
  }

  const data =
    await getFirestoreAlbum(album);

  if (!data) {
    notFound();
  }

  /*
   * =====================================================
   * MEDIA
   * =====================================================
   */

  const mediaFiles =
    data.mediaFiles ?? [];

  /*
   * =====================================================
   * COVER
   * =====================================================
   */

  const coverPhoto: GalleryPhoto[] =
    data.coverFileId
      ? [
          {
            id: data.coverFileId,
            name: `${data.title} — Cover`,
            url: getDriveFileUrl(
              data.coverFileId
            ),
          },
        ]
      : [];

  /*
   * =====================================================
   * PHOTOS
   * =====================================================
   */

  const structuredPhotos: GalleryPhoto[] =
    mediaFiles
      .filter((file) =>
        file.mimeType
          ?.toLowerCase()
          .startsWith("image/")
      )
      .map((file) => ({
        id: file.id,
        name: file.name,
        url: getDriveFileUrl(
          file.id
        ),
        mimeType: file.mimeType,
      }));

  /*
   * =====================================================
   * VIDEOS
   * =====================================================
   */

  const structuredVideos: GalleryVideo[] =
    mediaFiles
      .filter((file) =>
        file.mimeType
          ?.toLowerCase()
          .startsWith("video/")
      )
      .map((file) => ({
        id: file.id,
        name: file.name,
        url: getDriveFileUrl(
          file.id
        ),
        mimeType:
          file.mimeType ||
          "video/mp4",
      }));

  /*
   * =====================================================
   * PREVENT COVER DUPLICATION
   * =====================================================
   */

  const photos: GalleryPhoto[] = [
    ...coverPhoto,

    ...structuredPhotos.filter(
      (photo) =>
        photo.id !==
        data.coverFileId
    ),
  ];

  const videos =
    structuredVideos;

  return (
    <main
      style={{
        minHeight: "100vh",
        maxWidth: 1400,
        margin: "0 auto",
        padding:
          "40px 32px 140px",
      }}
    >
      {/* BACK BUTTON */}

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
            display:
              "inline-flex",
            alignItems: "center",
            gap: 10,
            padding:
              "14px 22px",
            borderRadius: 999,
            textDecoration:
              "none",
            color: "#456C57",
            fontWeight: 600,
            background:
              "rgba(255,255,255,.78)",
            backdropFilter:
              "blur(18px)",
            WebkitBackdropFilter:
              "blur(18px)",
            border:
              "1px solid rgba(69,108,87,.12)",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <ArrowLeft
            size={20}
          />

          Back to Memories
        </Link>
      </div>

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 70,
        }}
      >
        <p
          style={{
            letterSpacing:
              ".22em",
            textTransform:
              "uppercase",
            fontSize: 12,
            color: "#78907F",
            marginBottom: 12,
          }}
        >
          Memory Album
        </p>

        <h1
          style={{
            fontSize: 48,
            color: "#456C57",
            fontFamily:
              "var(--font-serif)",
            margin: 0,
          }}
        >
          {data.title}
        </h1>

        {data.date && (
          <p
            style={{
              color: "#7A887C",
              fontSize: 18,
              margin:
                "14px 0 0",
            }}
          >
            {data.date}
          </p>
        )}

        {data.location && (
          <p
            style={{
              color: "#7A887C",
              fontSize: 18,
              margin:
                "4px 0 0",
            }}
          >
            {data.location}
          </p>
        )}

        {data.story && (
          <p
            style={{
              maxWidth: 850,
              margin:
                "18px auto 0",
              color:
                "#58665C",
              lineHeight: 1.9,
              fontSize: 18,
            }}
          >
            {data.story}
          </p>
        )}
      </div>

      {/* PHOTOS */}

      {photos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <ImageIcon
              size={26}
              color="#456C57"
            />

            <h2
              style={{
                fontSize: 34,
                color:
                  "#456C57",
                fontFamily:
                  "var(--font-serif)",
                margin: 0,
              }}
            >
              Photos
            </h2>

            <span
              style={{
                color:
                  "#7A887C",
                fontSize: 18,
              }}
            >
              ({photos.length})
            </span>
          </div>

          <GalleryGrid
            photos={photos}
          />
        </>
      )}

      {/* VIDEOS */}

      {videos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 12,
              marginTop:
                photos.length > 0
                  ? 70
                  : 0,
              marginBottom: 24,
            }}
          >
            <Video
              size={26}
              color="#456C57"
            />

            <h2
              style={{
                fontSize: 34,
                color:
                  "#456C57",
                fontFamily:
                  "var(--font-serif)",
                margin: 0,
              }}
            >
              Videos
            </h2>

            <span
              style={{
                color:
                  "#7A887C",
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
            {videos.map(
              (video) => (
                <VideoCard
                  key={video.id}
                  src={video.url}
                  />
              )
            )}
          </div>
        </>
      )}

      {/* EMPTY ALBUM */}

      {photos.length === 0 &&
        videos.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding:
                "80px 20px",
              color:
                "#7A887C",
            }}
          >
            <p
              style={{
                fontSize: 20,
                marginBottom: 8,
              }}
            >
              This album is
              still empty.
            </p>

            <p>
              Photos and videos
              will appear here
              once they are added.
            </p>
          </div>
        )}
    </main>
  );
}