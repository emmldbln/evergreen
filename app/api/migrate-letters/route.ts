import { NextResponse } from "next/server";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

const existingLetters = [
  {
    legacyId: 1,
    title: "Open when you miss me",
    subtitle:
      "For the days that feel a little quieter.",
    content: `My Love,


If you're reading this, then today probably feels quieter than usual.


Maybe you're lying in bed.
Maybe you're studying.
Maybe you're simply wishing I were beside you.


I want you to remember something.


Distance has never measured how much someone loves another.


Even if we aren't together physically, I hope you can still feel me in the smallest moments—the songs we both know, the places we've been, the memories we continue to make.


I'm always cheering for you.


Always loving you.


And I'll always be waiting for the next time I get to hold your hand.


Until then...


Carry a little piece of me with you.


Forever yours,
Emman`,
  },

  {
    legacyId: 2,
    title: "Open when you're happy",
    subtitle:
      "Celebrate every little victory.",
    content: `My Love,


Seeing you happy has always been one of my favorite things.


Whenever something wonderful happens today, I hope you know I would have been smiling just as much beside you.


You deserve every good thing that comes your way.


Please celebrate yourself.


Be proud of how far you've come.


And don't forget...


Save me one of your biggest smiles.


I love you endlessly.


Emman`,
  },

  {
    legacyId: 3,
    title: "Open when we're fighting",
    subtitle:
      "Read this before sleeping angry.",
    content: `My Love,


If we're fighting...


Please remember that I never want to win against you.


I only ever want us to understand each other.


There will be days where words fail us.


There will be misunderstandings.


But there will never be a day where I stop choosing you.


Take a deep breath.


We'll figure it out together.


Always.


Emman`,
  },

  {
    legacyId: 4,
    title: "Open when you feel alone",
    subtitle:
      "You're never carrying everything by yourself.",
    content: `My Love,


You may feel alone today.


But you aren't.


Even if I'm not beside you...


I am always in your corner.


Always believing in you.


Always praying for you.


You're stronger than you know.


And if today feels heavy...


Borrow some of my strength.


Love,
Emman`,
  },

  {
    legacyId: 5,
    title: "Open when you need reassurance",
    subtitle:
      "Whenever doubt becomes louder than your heart.",
    content: `My Love,


Just in case your mind is telling you stories today...


Let me remind you of the truth.


I choose you.


Not because I have to.


Because I want to.


Every single day.


No matter how ordinary life becomes...


You will always be my favorite person.


Nothing changes that.


Emman`,
  },

  {
    legacyId: 6,
    title: "Open on our anniversary",
    subtitle:
      "For another beautiful chapter together.",
    content: `My Love,


Happy Anniversary.


Thank you for every laugh.


Every memory.


Every lesson.


Every ordinary day that became extraordinary simply because it was spent with you.


I can't wait for all the anniversaries we haven't lived yet.


Here's to us.


Always.


Forever.


Love,
Emman`,
  },
];

export async function GET() {
  try {
    const lettersCollection =
      collection(db, "letters");

    const snapshot =
      await getDocs(
        query(lettersCollection)
      );

    const existingLegacyIds =
      new Set(
        snapshot.docs
          .map(
            (document) =>
              document.data()
                .legacyId
          )
          .filter(
            (id) =>
              typeof id === "number"
          )
      );

    const migrated = [];
    const skipped = [];

    for (
      const letter of existingLetters
    ) {
      if (
        existingLegacyIds.has(
          letter.legacyId
        )
      ) {
        skipped.push(
          letter.legacyId
        );

        continue;
      }

      const document =
        await addDoc(
          lettersCollection,
          {
            title:
              letter.title,

            subtitle:
              letter.subtitle,

            content:
              letter.content,

            legacyId:
              letter.legacyId,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),
          }
        );

      migrated.push({
        legacyId:
          letter.legacyId,
        firestoreId:
          document.id,
        title:
          letter.title,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "Letter migration completed.",
      existingBeforeMigration:
        snapshot.size,
      migrated,
      skipped,
    });
  } catch (error) {
    console.error(
      "Letter migration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Letter migration failed.",
      },
      {
        status: 500,
      }
    );
  }
}