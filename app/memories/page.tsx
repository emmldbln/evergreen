import AlbumGrid from "../components/memories/AlbumGrid";

import {
  getFirestoreAlbums,
} from "@/lib/firestore/memories";

export default async function MemoriesPage() {
  const firestoreAlbums =
    await getFirestoreAlbums();

  const albums = firestoreAlbums.map(
    (album) => ({
      id: album.id,
      title: album.title,
      date: album.date,
      location: album.location,
      story: album.story,

      /*
       * The public AlbumCard expects a
       * cover URL.
       *
       * Google Drive files are retrieved
       * through our Evergreen API route.
       */
      cover: album.coverFileId
        ? `/api/memories/files/${encodeURIComponent(
            album.coverFileId
          )}`
        : album.coverUrl,

      /*
       * AlbumCard only needs the number
       * of memories for this page.
       *
       * The actual file URLs are built
       * on the album page.
       */
      media:
        album.mediaFileIds?.map(
          (fileId) =>
            `/api/memories/files/${encodeURIComponent(
              fileId
            )}`
        ) ?? album.media ?? [],
    }));

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "70px 32px 130px",
        maxWidth: 1450,
        margin: "0 auto",
      }}
    >
      {/* Header */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 70,
        }}
      >
        <h1
          style={{
            fontFamily:
              "var(--font-serif)",
            fontSize: 60,
            color: "#456C57",
            marginBottom: 14,
          }}
        >
          Our Memories
        </h1>

        <p
          style={{
            color: "#748574",
            fontSize: 20,
            lineHeight: 1.8,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          Every photograph is a page from
          our story. Every video is a moment
          we can relive. Thank you for filling
          my life with memories worth keeping
          forever.
        </p>
      </div>

      <AlbumGrid albums={albums} />
    </main>
  );
}