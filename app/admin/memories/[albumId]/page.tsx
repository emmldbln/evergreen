import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import {
  getFirestoreAlbum,
} from "@/lib/firestore/memories";

import AlbumMediaManager from "./AlbumMediaManager";

interface PageProps {
  params: Promise<{
    albumId: string;
  }>;
}

async function updateAlbum(
  formData: FormData
) {
  "use server";

  const albumId =
    typeof formData.get("albumId") === "string"
      ? String(formData.get("albumId"))
      : "";

  if (!albumId) {
    throw new Error(
      "Album ID is required."
    );
  }

  const title =
    typeof formData.get("title") === "string"
      ? String(
          formData.get("title")
        ).trim()
      : "";

  const date =
    typeof formData.get("date") === "string"
      ? String(
          formData.get("date")
        ).trim()
      : "";

  const location =
    typeof formData.get("location") === "string"
      ? String(
          formData.get("location")
        ).trim()
      : "";

  const story =
    typeof formData.get("story") === "string"
      ? String(
          formData.get("story")
        ).trim()
      : "";

  if (!title) {
    throw new Error(
      "Album title is required."
    );
  }

  /*
   * Use the same album API used by
   * Settings/Memories.
   *
   * This keeps Firestore and Google Drive
   * synchronized when an album is renamed.
   */
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";

  const response = await fetch(
    `${baseUrl}/api/memories/albums/${albumId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        title,
        date,
        location,
        story,
      }),
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ??
        "Failed to update album."
    );
  }

  revalidatePath(
    `/admin/memories/${albumId}`
  );

  revalidatePath(
    "/admin/memories"
  );

  revalidatePath(
    "/settings/memories"
  );

  redirect(
    `/admin/memories/${albumId}`
  );
}

export default async function AlbumPage({
  params,
}: PageProps) {
  const { albumId } =
    await params;

  if (!albumId) {
    notFound();
  }

  const album =
    await getFirestoreAlbum(
      albumId
    );

  if (!album) {
    notFound();
  }

  const mediaFiles =
    album.mediaFiles ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "32px 24px 145px",
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
            justifyContent:
              "space-between",
            alignItems:
              "center",
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
                  "clamp(32px, 5vw, 42px)",
                lineHeight: 1.1,
              }}
            >
              {album.title}
            </h1>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#7A887C",
                fontSize: 14,
              }}
            >
              Edit album details and
              manage its memories.
            </p>
          </div>

          <Link
            href="/admin/memories"
            style={{
              flexShrink: 0,
              textDecoration:
                "none",
              border:
                "1px solid #D5E3DB",
              borderRadius: 15,
              background:
                "#FFFFFF",
              color: "#4D735F",
              padding:
                "11px 15px",
              fontSize: 13,
              fontWeight: 700,
              boxShadow:
                "0 7px 20px rgba(54,95,76,.05)",
            }}
          >
            ← Back
          </Link>
        </header>

        {/* ALBUM DETAILS */}

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
              Album Details
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              Update the information
              shown for this album.
            </p>
          </div>

          <form
            action={updateAlbum}
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 17,
            }}
          >
            <input
              type="hidden"
              name="albumId"
              value={album.id}
            />

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
                  album.title
                }
                required
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 15,
              }}
            >
              <div>
                <label
                  htmlFor="date"
                  style={labelStyle}
                >
                  Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="text"
                  defaultValue={
                    album.date
                  }
                  placeholder="e.g. May 18, 2026"
                  style={inputStyle}
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  style={labelStyle}
                >
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={
                    album.location
                  }
                  placeholder="e.g. Tagaytay"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="story"
                style={labelStyle}
              >
                Story
              </label>

              <textarea
                id="story"
                name="story"
                defaultValue={
                  album.story
                }
                rows={6}
                placeholder="Write something about this memory..."
                style={{
                  ...inputStyle,
                  minHeight: 140,
                  resize: "vertical",
                  lineHeight: 1.6,
                  fontFamily:
                    "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: 14,
                background:
                  "#47745F",
                color: "#FFFFFF",
                padding:
                  "12px 18px",
                fontSize: 14,
                fontWeight: 700,
                cursor:
                  "pointer",
              }}
            >
              Save Changes
            </button>
          </form>
        </section>

        {/* INTERACTIVE MEDIA */}

        <AlbumMediaManager
          albumId={album.id}
          coverFileId={
            album.coverFileId
          }
          coverUrl={
            album.coverUrl
          }
          albumTitle={
            album.title
          }
          mediaFiles={
            mediaFiles
          }
        />
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
  boxSizing:
    "border-box" as const,
  padding:
    "12px 14px",
  border:
    "1px solid #DCE8E1",
  borderRadius: 14,
  background:
    "#FBFDFB",
  color: "#365F4C",
  fontSize: 14,
  outline: "none",
};