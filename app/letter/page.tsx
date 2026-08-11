import {
  getFirestoreLetters,
} from "@/lib/firestore/letters";

import LetterPageClient from "./LetterPageClient";

export default async function LetterPage() {
  const firestoreLetters =
    await getFirestoreLetters();

  const letters =
    firestoreLetters.map(
      (letter) => ({
        id: letter.id,
        title: letter.title,
        subtitle: letter.subtitle,
        content: letter.content,
      })
    );

  return (
    <LetterPageClient
      letters={letters}
    />
  );
}