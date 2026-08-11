import { redirect } from "next/navigation";
import Link from "next/link";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

interface FirestoreLetter {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  legacyId?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

async function getLetters(): Promise<FirestoreLetter[]> {
  const lettersCollection = collection(db, "letters");

  const lettersQuery = query(
    lettersCollection,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(lettersQuery);

  return snapshot.docs.map((letter) => ({
    id: letter.id,
    ...letter.data(),
  })) as FirestoreLetter[];
}

async function createLetter(formData: FormData) {
  "use server";

  const title =
    typeof formData.get("title") === "string"
      ? String(formData.get("title")).trim()
      : "";

  const subtitle =
    typeof formData.get("subtitle") === "string"
      ? String(formData.get("subtitle")).trim()
      : "";

  const content =
    typeof formData.get("content") === "string"
      ? String(formData.get("content")).trim()
      : "";

  if (!title) {
    throw new Error("Letter title is required.");
  }

  if (!content) {
    throw new Error("Letter content is required.");
  }

  const lettersCollection = collection(db, "letters");

  const letterRef = await addDoc(lettersCollection, {
    title,
    subtitle,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  redirect(`/admin/letters/${letterRef.id}`);
}

async function deleteLetter(formData: FormData) {
  "use server";

  const letterId =
    typeof formData.get("letterId") === "string"
      ? String(formData.get("letterId"))
      : "";

  if (!letterId) {
    throw new Error("Letter ID is required.");
  }

  await deleteDoc(doc(db, "letters", letterId));

  redirect("/admin/letters");
}

export default async function LettersAdminPage() {
  const letters = await getLetters();

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 145px",
        background:
          "linear-gradient(180deg,#F4F8F4 0%,#EEF4EF 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                color: "#456C57",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Admin CMS
            </div>

            <h1
              style={{
                margin: 0,
                color: "#456C57",
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(32px, 5vw, 42px)",
                lineHeight: 1.1,
              }}
            >
              Letters
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#7A887C",
                fontSize: 14,
              }}
            >
              Write, edit, and manage the letters on Evergreen.
            </p>
          </div>

          <Link
            href="/admin"
            style={{
              flexShrink: 0,
              textDecoration: "none",
              border: "1px solid #D5E3DB",
              borderRadius: 14,
              background: "#FFFFFF",
              color: "#4D735F",
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: "0 7px 20px rgba(54,95,76,.05)",
            }}
          >
            ← Content Manager
          </Link>
        </header>

        {/* SUMMARY */}

        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE8E1",
            borderRadius: 20,
            padding: "17px 20px",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#365F4C",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {letters.length}{" "}
              {letters.length === 1 ? "letter" : "letters"}
            </p>

            <p
              style={{
                margin: "4px 0 0",
                color: "#82968D",
                fontSize: 12,
              }}
            >
              Stored in Firestore
            </p>
          </div>
        </section>

        {/* LETTER LIST */}

        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #DCE8E1",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 16px 45px rgba(54,95,76,.07)",
          }}
        >
          <div
            style={{
              marginBottom: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#365F4C",
                fontFamily: "var(--font-serif)",
                fontSize: 25,
                fontWeight: 600,
              }}
            >
              Your Letters
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              These letters are displayed on the public Letters page.
            </p>
          </div>

          {letters.length === 0 ? (
            <div
              style={{
                border: "2px dashed #D5E3DB",
                borderRadius: 18,
                background: "#FAFCFB",
                padding: "55px 20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#5F7C6D",
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                No letters yet
              </p>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#91A39A",
                  fontSize: 13,
                }}
              >
                Create your first letter below.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill,minmax(270px,1fr))",
                gap: 14,
              }}
            >
              {letters.map((letter, index) => (
                <article
                  key={letter.id}
                  style={{
                    border: "1px solid #DCE8E1",
                    borderRadius: 18,
                    background: "#FBFDFB",
                    padding: 17,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 28,
                        height: 28,
                        padding: "0 8px",
                        borderRadius: 999,
                        background: "#EAF2EC",
                        color: "#527561",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: "#365F4C",
                      fontFamily: "var(--font-serif)",
                      fontSize: 20,
                      fontWeight: 600,
                      lineHeight: 1.25,
                    }}
                  >
                    {letter.title}
                  </h3>

                  <p
                    style={{
                      margin: "7px 0 0",
                      color: "#7D9086",
                      fontSize: 12,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {letter.subtitle}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 15,
                    }}
                  >
                    <Link
                      href={`/admin/letters/${encodeURIComponent(
                        letter.id
                      )}`}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        textDecoration: "none",
                        borderRadius: 11,
                        background: "#47745F",
                        color: "#FFFFFF",
                        padding: "9px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Edit
                    </Link>

                    <form
                      action={deleteLetter}
                      style={{
                        flex: 1,
                      }}
                    >
                      <input
                        type="hidden"
                        name="letterId"
                        value={letter.id}
                      />

                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          border: "1px solid #E8D4D1",
                          borderRadius: 11,
                          background: "#FFF7F6",
                          color: "#A33A3A",
                          padding: "9px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ADD LETTER */}

        <section
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            border: "1px solid #DCE8E1",
            borderRadius: 24,
            padding: 22,
            boxShadow: "0 16px 45px rgba(54,95,76,.07)",
          }}
        >
          <div
            style={{
              marginBottom: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#365F4C",
                fontFamily: "var(--font-serif)",
                fontSize: 25,
                fontWeight: 600,
              }}
            >
              Add Letter
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              Create a new letter for the public Letters page.
            </p>
          </div>

          <form
            action={createLetter}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15,
            }}
          >
            <div>
              <label
                htmlFor="new-title"
                style={labelStyle}
              >
                Title
              </label>

              <input
                id="new-title"
                name="title"
                type="text"
                required
                placeholder="e.g. Open when you need a hug"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="new-subtitle"
                style={labelStyle}
              >
                Subtitle
              </label>

              <input
                id="new-subtitle"
                name="subtitle"
                type="text"
                placeholder="A few words for when you need them."
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="new-content"
                style={labelStyle}
              >
                Letter
              </label>

              <textarea
                id="new-content"
                name="content"
                required
                rows={10}
                placeholder="Write your letter here..."
                style={{
                  ...inputStyle,
                  minHeight: 220,
                  resize: "vertical",
                  lineHeight: 1.7,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: 14,
                background: "#47745F",
                color: "#FFFFFF",
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Create Letter
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  color: "#4D735F",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px 14px",
  border: "1px solid #DCE8E1",
  borderRadius: 14,
  background: "#FBFDFB",
  color: "#365F4C",
  fontSize: 14,
  outline: "none",
};