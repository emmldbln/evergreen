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

import type { Song } from "./songs";

const songsCollection = collection(db, "songs");

export interface FirebaseSong
  extends Omit<Song, "addedAt"> {
  addedAt: string;
}

/*
 * Get every song from Firestore
 */
export async function getFirebaseSongs(): Promise<
  FirebaseSong[]
> {
  const songsQuery = query(
    songsCollection,
    orderBy("addedAt", "desc")
  );

  const snapshot = await getDocs(songsQuery);

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,

      title: data.title ?? "",
      artist: data.artist ?? "",
      cover: data.cover ?? "",
      spotifyUrl: data.spotifyUrl ?? "",

      note: data.note ?? "",

      albums: Array.isArray(data.albums)
        ? data.albums
        : [],

      favorite: data.favorite ?? false,
      featured: data.featured ?? false,
      glow: data.glow ?? false,

      duration: data.duration ?? 0,

      memoryIds: Array.isArray(data.memoryIds)
        ? data.memoryIds
        : [],

      addedAt:
        data.addedAt?.toDate?.()?.toISOString() ??
        "",
    };
  });
}

/*
 * Add a new song
 */
export async function addFirebaseSong(
  song: Omit<FirebaseSong, "id" | "addedAt">
) {
  const document = await addDoc(
    songsCollection,
    {
      ...song,
      addedAt: serverTimestamp(),
    }
  );

  return document.id;
}

/*
 * Update an existing song
 */
export async function updateFirebaseSong(
  id: string,
  updates: Partial<
    Omit<FirebaseSong, "id" | "addedAt">
  >
) {
  const songRef = doc(
    db,
    "songs",
    id
  );

  await updateDoc(songRef, updates);
}

/*
 * Delete a song
 */
export async function deleteFirebaseSong(
  id: string
) {
  const songRef = doc(
    db,
    "songs",
    id
  );

  await deleteDoc(songRef);
}