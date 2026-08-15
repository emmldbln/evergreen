import AlbumGrid from "../components/memories/AlbumGrid";

import {
  getFirestoreAlbums,
} from "@/lib/firestore/memories";

export default async function MemoriesPage() {
  const firestoreAlbums =
    await getFirestoreAlbums();

  const albums =
    firestoreAlbums.map((album) => {
      /*
       * Google Drive media files.
       *
       * The cover is stored separately from
       * mediaFileIds, so include it in the
       * public album media list.
       *
       * Use a Set so the cover is not counted
       * twice if it already exists in mediaFileIds.
       */

      const mediaFileIds =
        album.mediaFileIds ?? [];

      const allMediaFileIds =
        album.coverFileId
          ? Array.from(
              new Set([
                album.coverFileId,
                ...mediaFileIds,
              ])
            )
          : mediaFileIds;

      const media =
        allMediaFileIds.length > 0
          ? allMediaFileIds.map(
              (fileId) =>
                `/api/memories/files/${encodeURIComponent(
                  fileId
                )}`
            )
          : album.media ?? [];

      /*
       * Google Drive cover.
       */

      const cover = album.coverFileId
        ? `/api/memories/files/${encodeURIComponent(
            album.coverFileId
          )}`
        : album.coverUrl ?? "";

      return {
        id: album.id,

        title: album.title,

        date: album.date ?? "",

        location:
          album.location ?? "",

        story:
          album.story ?? "",

        cover,

        /*
         * Includes the cover in the
         * total memory count.
         */
        media,
      };
    });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "70px 32px 130px",
        maxWidth: 1450,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: 70,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 14,
            fontFamily:
              "var(--font-serif)",
            fontSize:
              "clamp(42px,5vw,60px)",
            color: "#456C57",
          }}
        >
          Our Memories
        </h1>

        <p
          style={{
            margin: "0 auto",
            color: "#748574",
            fontSize:
              "clamp(16px,2vw,20px)",
            lineHeight: 1.8,
            maxWidth: 720,
          }}
        >
          Every photograph is a page from
          our story. Every video is a moment
          we can relive. Thank you for filling
          my life with memories worth keeping
          forever.
        </p>
      </div>

      <AlbumGrid
        albums={albums}
      />
    </main>
  );
}