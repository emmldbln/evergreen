import AlbumGrid from "../components/memories/AlbumGrid";
import { getAlbums } from "@/lib/memories";


export default function MemoriesPage() {
  const albums = getAlbums();

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
            fontFamily: "var(--font-serif)",
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
          Every photograph is a page from our story.
          Every video is a moment we can relive.
          Thank you for filling my life with memories worth keeping forever.
        </p>
      </div>

      <AlbumGrid albums={albums} />
    </main>
  );
}