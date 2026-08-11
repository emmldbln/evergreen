import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import {
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/firestore";

interface PageProps {
  params: Promise<{
    letterId: string;
  }>;
}

interface FirestoreLetter {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  legacyId?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

async function updateLetter(formData: FormData) {
  "use server";

  const letterId =
    typeof formData.get("letterId") === "string"
      ? String(formData.get("letterId"))
      : "";

  if (!letterId) {
    throw new Error("Letter ID is required.");
  }

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

  const letterRef = doc(
    db,
    "letters",
    letterId
  );

  const snapshot = await getDoc(letterRef);

  if (!snapshot.exists()) {
    throw new Error("Letter not found.");
  }

  await updateDoc(letterRef, {
    title,
    subtitle,
    content,
    updatedAt: serverTimestamp(),
  });

  /*
   * Revalidate the CMS editor,
   * CMS list, and public Letters page.
   */
  revalidatePath(
    `/admin/letters/${letterId}`
  );

  revalidatePath(
    "/admin/letters"
  );

  /*
   * We are keeping both common public
   * routes revalidated for now.
   *
   * Later, once we confirm the exact
   * public route, we can remove the
   * unnecessary one.
   */
  revalidatePath(
    "/letter"
  );

  revalidatePath(
    "/letters"
  );

  redirect(
    `/admin/letters/${letterId}`
  );
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

  const letterRef = doc(
    db,
    "letters",
    letterId
  );

  const snapshot = await getDoc(letterRef);

  if (!snapshot.exists()) {
    throw new Error("Letter not found.");
  }

  await deleteDoc(letterRef);

  revalidatePath(
    "/admin/letters"
  );

  revalidatePath(
    "/letter"
  );

  revalidatePath(
    "/letters"
  );

  redirect(
    "/admin/letters"
  );
}

export default async function LetterEditorPage({
  params,
}: PageProps) {
  const { letterId } =
    await params;

  if (!letterId) {
    notFound();
  }

  const letterRef = doc(
    db,
    "letters",
    letterId
  );

  const snapshot =
    await getDoc(letterRef);

  if (!snapshot.exists()) {
    notFound();
  }

  const data =
    snapshot.data() as Omit<
      FirestoreLetter,
      "id"
    >;

  const letter: FirestoreLetter = {
    id: snapshot.id,
    ...data,
  };

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
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                color: "#456C57",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform:
                  "uppercase",
                marginBottom: 6,
              }}
            >
              Admin CMS
            </div>

            <h1
              style={{
                margin: 0,
                color: "#456C57",
                fontFamily:
                  "var(--font-serif)",
                fontSize:
                  "clamp(30px, 5vw, 40px)",
                lineHeight: 1.1,
              }}
            >
              Edit Letter
            </h1>

            <p
              style={{
                margin: "7px 0 0",
                color: "#7A887C",
                fontSize: 14,
              }}
            >
              Update the letter shown
              on the public page.
            </p>
          </div>

          <Link
            href="/admin/letters"
            style={{
              flexShrink: 0,
              textDecoration: "none",
              border:
                "1px solid #D5E3DB",
              borderRadius: 14,
              background: "#FFFFFF",
              color: "#4D735F",
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              boxShadow:
                "0 7px 20px rgba(54,95,76,.05)",
            }}
          >
            ← Back
          </Link>
        </header>

        {/* EDITOR */}

        <section
          style={{
            background: "#FFFFFF",
            border:
              "1px solid #DCE8E1",
            borderRadius: 24,
            padding: 22,
            boxShadow:
              "0 16px 45px rgba(54,95,76,.07)",
          }}
        >
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#365F4C",
                fontFamily:
                  "var(--font-serif)",
                fontSize: 25,
                fontWeight: 600,
              }}
            >
              Letter Details
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              Edit the title, subtitle,
              and message of this letter.
            </p>
          </div>

          <form
            action={updateLetter}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 17,
            }}
          >
            <input
              type="hidden"
              name="letterId"
              value={letter.id}
            />

            {/* TITLE */}

            <div>
              <label
                htmlFor="title"
                style={labelStyle}
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                defaultValue={
                  letter.title
                }
                required
                style={inputStyle}
              />
            </div>

            {/* SUBTITLE */}

            <div>
              <label
                htmlFor="subtitle"
                style={labelStyle}
              >
                Subtitle
              </label>

              <input
                id="subtitle"
                name="subtitle"
                type="text"
                defaultValue={
                  letter.subtitle
                }
                style={inputStyle}
              />
            </div>

            {/* CONTENT */}

            <div>
              <label
                htmlFor="content"
                style={labelStyle}
              >
                Letter
              </label>

              <textarea
                id="content"
                name="content"
                defaultValue={
                  letter.content
                }
                required
                rows={18}
                placeholder="Write your letter..."
                style={{
                  ...inputStyle,
                  minHeight: 360,
                  resize: "vertical",
                  lineHeight: 1.7,
                  fontFamily:
                    "inherit",
                }}
              />
            </div>

            {/* SAVE */}

            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: 14,
                background: "#47745F",
                color: "#FFFFFF",
                padding:
                  "12px 18px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
          </form>

          {/* DELETE */}

          <div
            style={{
              marginTop: 26,
              paddingTop: 20,
              borderTop:
                "1px solid #E6EEE9",
            }}
          >
            <div
              style={{
                marginBottom: 10,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#8C5550",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Danger Zone
              </p>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color: "#9A8B88",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                Permanently remove this
                letter from Evergreen.
              </p>
            </div>

            <form
              action={deleteLetter}
            >
              <input
                type="hidden"
                name="letterId"
                value={letter.id}
              />

              <button
                type="submit"
                style={{
                  border:
                    "1px solid #E8D4D1",
                  borderRadius: 12,
                  background:
                    "#FFF7F6",
                  color: "#A33A3A",
                  padding:
                    "9px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Delete Letter
              </button>
            </form>
          </div>
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
  border:
    "1px solid #DCE8E1",
  borderRadius: 14,
  background: "#FBFDFB",
  color: "#365F4C",
  fontSize: 14,
  outline: "none",
};