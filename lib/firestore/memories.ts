import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

export interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface FirestoreAlbum {
  id: string;

  title: string;
  date: string;
  location: string;
  story: string;

  coverUrl: string;
  coverFileId?: string;

  media: string[];
  mediaFileIds?: string[];

  /*
   * New structured media metadata.
   *
   * This tells Evergreen exactly what
   * each Google Drive file is.
   */
  mediaFiles?: MediaFile[];

  driveFolderId: string;

  createdAt?: unknown;
}

export type CreateAlbumData = Omit<
  FirestoreAlbum,
  "id" | "createdAt"
>;

const albumsCollection = collection(
  db,
  "albums"
);

export async function getFirestoreAlbums(): Promise<
  FirestoreAlbum[]
> {
  const albumsQuery = query(
    albumsCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(albumsQuery);

  return snapshot.docs.map(
    (album) => ({
      id: album.id,
      ...album.data(),
    })
  ) as FirestoreAlbum[];
}

export async function getFirestoreAlbum(
  id: string
): Promise<FirestoreAlbum | null> {
  const albumRef = doc(
    db,
    "albums",
    id
  );

  const snapshot =
    await getDoc(albumRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as FirestoreAlbum;
}

export async function addFirestoreAlbum(
  album: CreateAlbumData
) {
  const docRef = await addDoc(
    albumsCollection,
    {
      ...album,
      createdAt:
        serverTimestamp(),
    }
  );

  return docRef.id;
}

export async function updateFirestoreAlbum(
  id: string,
  album: Partial<CreateAlbumData>
) {
  const albumRef = doc(
    db,
    "albums",
    id
  );

  await updateDoc(
    albumRef,
    album
  );
}

export async function deleteFirestoreAlbum(
  id: string
) {
  const albumRef = doc(
    db,
    "albums",
    id
  );

  await deleteDoc(albumRef);
}

export async function getHomepageFirestoreMemories(): Promise<
  Array<{
    image: string;
    albumId: string;
    albumTitle: string;
    date: string;
    location: string;
    story: string;
  }>
> {
  const albums =
    await getFirestoreAlbums();

  const memories: Array<{
    image: string;
    albumId: string;
    albumTitle: string;
    date: string;
    location: string;
    story: string;
  }> = [];

  albums.forEach((album) => {
    /*
     * =====================================================
     * ALBUM COVER
     * =====================================================
     *
     * The cover is stored separately from mediaFiles.
     * Include it as the first homepage memory.
     */
    if (album.coverFileId) {
      memories.push({
        image: `/api/memories/files/${encodeURIComponent(
          album.coverFileId
        )}`,
        albumId: album.id,
        albumTitle: album.title,
        date: album.date,
        location: album.location,
        story: album.story,
      });
    }

    /*
     * =====================================================
     * ALBUM MEDIA
     * =====================================================
     *
     * Add image media after the album cover.
     * Videos are intentionally excluded because the
     * homepage MemoryCard is an image-based card.
     */
    const mediaFiles =
      album.mediaFiles ?? [];

    mediaFiles.forEach((file) => {
      if (
        !file.mimeType.startsWith(
          "image/"
        )
      ) {
        return;
      }

      /*
       * Avoid accidentally displaying the cover twice
       * if it ever becomes part of mediaFiles in the future.
       */
      if (
        file.id === album.coverFileId
      ) {
        return;
      }

      memories.push({
        image: `/api/memories/files/${encodeURIComponent(
          file.id
        )}`,
        albumId: album.id,
        albumTitle: album.title,
        date: album.date,
        location: album.location,
        story: album.story,
      });
    });
  });

  return memories;
}