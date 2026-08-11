"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import Envelope from "../components/letter/Envelope";
import LetterModal from "../components/letter/LetterModal";

interface Letter {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

interface LetterPageClientProps {
  letters: Letter[];
}

export default function LetterPageClient({
  letters,
}: LetterPageClientProps) {
  const [
    selectedLetter,
    setSelectedLetter,
  ] = useState<Letter | null>(null);

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          padding:
            "70px 28px 120px",

          display: "flex",
          flexDirection:
            "column",
          alignItems: "center",
        }}
      >
        {/* Title */}

        <h1
          style={{
            fontFamily:
              "var(--font-serif)",
            fontSize: 56,
            fontWeight: 600,

            color: "#456C57",

            marginBottom: 8,
          }}
        >
          My Letters
        </h1>

        <p
          style={{
            fontFamily:
              "var(--font-serif)",
            fontSize: 20,

            color: "#708173",

            marginBottom: 55,

            textAlign: "center",

            maxWidth: 650,

            lineHeight: 1.7,
          }}
        >
          Some words are meant to
          be opened only when you
          need them most.
        </p>

        {/* Grid */}

        <div
          style={{
            width: "100%",
            maxWidth: 900,

            display: "grid",

            gridTemplateColumns:
              "repeat(3, minmax(0,1fr))",

            columnGap: 42,
            rowGap: 70,
          }}
        >
          {letters.map(
            (letter) => (
              <Envelope
                key={letter.id}
                letter={letter}
                onOpen={
                  setSelectedLetter
                }
              />
            )
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedLetter && (
          <LetterModal
            letter={
              selectedLetter
            }
            onClose={() =>
              setSelectedLetter(
                null
              )
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}