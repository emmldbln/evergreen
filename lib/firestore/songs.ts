import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

import type { Song } from "@/lib/songs";

const songsCollection = collection(db, "songs");

/**
 * Get all songs from Firestore
 */
export async function getFirestoreSongs(): Promise<Song[]> {
  const snapshot = await getDocs(songsCollection);

  return snapshot.docs.map((document) => {
    return {
      id: document.id,
      ...document.data(),
    } as Song;
  });
}

/**
 * Add a new song to Firestore
 */
export async function addFirestoreSong(
  song: Omit<Song, "id">
): Promise<string> {
  const songRef = doc(songsCollection);

  await setDoc(songRef, {
    ...song,
    id: songRef.id,
  });

  return songRef.id;
}

/**
 * Update an existing song
 */
export async function updateFirestoreSong(
  id: string,
  updates: Partial<Song>
): Promise<void> {
  const songRef = doc(db, "songs", id);

  await updateDoc(songRef, updates);
}

/**
 * Delete a song
 */
export async function deleteFirestoreSong(
  id: string
): Promise<void> {
  const songRef = doc(db, "songs", id);

  await deleteDoc(songRef);
}