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

export interface FirestoreLetter {
  id: string;
  title: string;
  subtitle: string;
  content: string;

  /**
   * Used only to preserve the relationship
   * with the original six hard-coded letters.
   */
  legacyId?: number;

  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CreateLetterData {
  title: string;
  subtitle: string;
  content: string;
  legacyId?: number;
}

const lettersCollection = collection(
  db,
  "letters"
);

export async function getFirestoreLetters(): Promise<
  FirestoreLetter[]
> {
  const lettersQuery = query(
    lettersCollection,
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(
    lettersQuery
  );

  return snapshot.docs.map(
    (letter) => ({
      id: letter.id,
      ...letter.data(),
    })
  ) as FirestoreLetter[];
}

export async function getFirestoreLetter(
  id: string
): Promise<FirestoreLetter | null> {
  const letterRef = doc(
    db,
    "letters",
    id
  );

  const snapshot =
    await getDoc(letterRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as FirestoreLetter;
}

export async function addFirestoreLetter(
  letter: CreateLetterData
) {
  const docRef = await addDoc(
    lettersCollection,
    {
      ...letter,
      createdAt:
        serverTimestamp(),
    }
  );

  return docRef.id;
}

export async function updateFirestoreLetter(
  id: string,
  letter: Partial<
    Omit<
      FirestoreLetter,
      "id"
    >
  >
) {
  const letterRef = doc(
    db,
    "letters",
    id
  );

  await updateDoc(
    letterRef,
    {
      ...letter,
      updatedAt:
        serverTimestamp(),
    }
  );
}

export async function deleteFirestoreLetter(
  id: string
) {
  const letterRef = doc(
    db,
    "letters",
    id
  );

  await deleteDoc(letterRef);
}