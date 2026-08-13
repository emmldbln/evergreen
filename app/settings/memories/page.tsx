import {
  getFirestoreAlbums,
  type FirestoreAlbum,
} from "@/lib/firestore/memories";

import MemoriesManager from "./MemoriesManager";

type SerializableAlbum = Omit<
  FirestoreAlbum,
  "createdAt"
> & {
  createdAt: string | null;
};

function serializeAlbum(
  album: FirestoreAlbum
): SerializableAlbum {
  let createdAt: string | null = null;

  if (album.createdAt) {
    if (
      typeof album.createdAt === "object" &&
      "toDate" in album.createdAt &&
      typeof album.createdAt.toDate === "function"
    ) {
      createdAt =
        album.createdAt
          .toDate()
          .toISOString();
    } else if (
      typeof album.createdAt === "object" &&
      "seconds" in album.createdAt
    ) {
      createdAt = new Date(
        Number(album.createdAt.seconds) * 1000
      ).toISOString();
    } else if (
      album.createdAt instanceof Date
    ) {
      createdAt =
        album.createdAt.toISOString();
    }
  }

  return {
    ...album,
    createdAt,
  };
}

export default async function MemoriesPage() {
  let albums: SerializableAlbum[] = [];

  try {
    const firestoreAlbums =
      await getFirestoreAlbums();

    albums = firestoreAlbums.map(
      serializeAlbum
    );
  } catch (error) {
    console.error(
      "Failed to load memories:",
      error
    );
  }

  return (
    <MemoriesManager
      initialAlbums={albums}
    />
  );
}