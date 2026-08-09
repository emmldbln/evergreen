import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

export interface FirestoreAlbum {
  id: string;
  title: string;
  date: string;
  location: string;
  story: string;
  coverUrl: string;
  media: string[];
  createdAt?: unknown;
}

export type CreateAlbumData = Omit<
  FirestoreAlbum,
  "id" | "createdAt"
>;

export type UpdateAlbumData = Partial<
  CreateAlbumData
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

  const snapshot = await getDocs(
    albumsQuery
  );

  return snapshot.docs.map((album) => ({
    id: album.id,
    ...album.data(),
  })) as FirestoreAlbum[];
}

export async function addFirestoreAlbum(
  album: CreateAlbumData
): Promise<string> {
  const docRef = await addDoc(
    albumsCollection,
    {
      ...album,
      createdAt: serverTimestamp(),
    }
  );

  return docRef.id;
}

export async function updateFirestoreAlbum(
  id: string,
  album: UpdateAlbumData
): Promise<void> {
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
): Promise<void> {
  const albumRef = doc(
    db,
    "albums",
    id
  );

  await deleteDoc(albumRef);
}