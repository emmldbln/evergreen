import HomeScreen from "./components/home/HomeScreen";

import {
  getFirestoreAlbums,
  getHomepageFirestoreMemories,
} from "@/lib/firestore/memories";

export default async function Page() {
  const firestoreAlbums =
    await getFirestoreAlbums();

  const albums = firestoreAlbums.map(
    (album) => ({
      id: album.id,
      title: album.title,
      date: album.date,
      location: album.location,
      story: album.story,

      cover: album.coverFileId
        ? `/api/memories/files/${encodeURIComponent(
            album.coverFileId
          )}`
        : album.coverUrl,

      media:
        album.mediaFiles?.map(
          (file) =>
            `/api/memories/files/${encodeURIComponent(
              file.id
            )}`
        ) ?? [],
    })
  );

  const homepageMemories =
    await getHomepageFirestoreMemories();

  return (
    <HomeScreen
      albums={albums}
      homepageMemories={
        homepageMemories
      }
    />
  );
}