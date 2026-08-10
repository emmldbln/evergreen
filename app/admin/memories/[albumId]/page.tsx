import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

interface PageProps {
  params: Promise<{
    albumId: string;
  }>;
}

async function updateAlbum(formData: FormData) {
  "use server";

  const albumId =
    typeof formData.get("albumId") === "string"
      ? String(formData.get("albumId"))
      : "";

  if (!albumId) {
    throw new Error("Album ID is required.");
  }

  const title =
    typeof formData.get("title") === "string"
      ? String(formData.get("title")).trim()
      : "";

  const date =
    typeof formData.get("date") === "string"
      ? String(formData.get("date")).trim()
      : "";

  const location =
    typeof formData.get("location") === "string"
      ? String(formData.get("location")).trim()
      : "";

  const story =
    typeof formData.get("story") === "string"
      ? String(formData.get("story")).trim()
      : "";

  if (!title) {
    throw new Error("Album title is required.");
  }

  await updateFirestoreAlbum(
    albumId,
    {
      title,
      date,
      location,
      story,
    }
  );

  revalidatePath(
    `/admin/memories/${albumId}`
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
    await getFirestoreAlbum(albumId);

  if (!album) {
    notFound();
  }

  const mediaFiles =
    album.mediaFiles ?? [];

  return (
    <main className="min-h-screen bg-[#f4f8f4] px-6 py-12 text-[#365f4c]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#6d8b7c]">
              Admin CMS
            </p>

            <h1 className="font-serif text-4xl font-semibold">
              {album.title}
            </h1>

            <p className="mt-2 text-sm text-[#789287]">
              Edit album details and manage its memories.
            </p>
          </div>

          <a
            href="/admin/memories"
            className="inline-flex w-fit items-center rounded-full border border-[#d5e3db] bg-white px-5 py-3 text-sm font-medium text-[#4d735f] shadow-sm transition hover:bg-[#f8fbf9]"
          >
            ← Back to Memories
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">

          {/* Album information */}

          <section className="rounded-3xl border border-[#dce8e1] bg-white p-7 shadow-[0_20px_60px_rgba(54,95,76,0.08)]">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#365f4c]">
                Album Details
              </h2>

              <p className="mt-1 text-sm text-[#82968d]">
                Update the information shown for this album.
              </p>
            </div>

            <form
              action={updateAlbum}
              className="space-y-5"
            >
              <input
                type="hidden"
                name="albumId"
                value={album.id}
              />

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-[#4d735f]"
                >
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  defaultValue={album.title}
                  required
                  className="w-full rounded-2xl border border-[#dce8e1] bg-[#fbfdfb] px-4 py-3 text-sm text-[#365f4c] outline-none transition focus:border-[#6f967f] focus:ring-2 focus:ring-[#6f967f]/20"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-medium text-[#4d735f]"
                  >
                    Date
                  </label>

                  <input
                    id="date"
                    name="date"
                    type="text"
                    defaultValue={album.date}
                    placeholder="e.g. May 18, 2026"
                    className="w-full rounded-2xl border border-[#dce8e1] bg-[#fbfdfb] px-4 py-3 text-sm text-[#365f4c] outline-none transition focus:border-[#6f967f] focus:ring-2 focus:ring-[#6f967f]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-[#4d735f]"
                  >
                    Location
                  </label>

                  <input
                    id="location"
                    name="location"
                    type="text"
                    defaultValue={album.location}
                    placeholder="e.g. Tagaytay"
                    className="w-full rounded-2xl border border-[#dce8e1] bg-[#fbfdfb] px-4 py-3 text-sm text-[#365f4c] outline-none transition focus:border-[#6f967f] focus:ring-2 focus:ring-[#6f967f]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="story"
                  className="mb-2 block text-sm font-medium text-[#4d735f]"
                >
                  Story
                </label>

                <textarea
                  id="story"
                  name="story"
                  defaultValue={album.story}
                  rows={7}
                  placeholder="Write something about this memory..."
                  className="w-full resize-y rounded-2xl border border-[#dce8e1] bg-[#fbfdfb] px-4 py-3 text-sm leading-6 text-[#365f4c] outline-none transition focus:border-[#6f967f] focus:ring-2 focus:ring-[#6f967f]/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#47745f] px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3d6653]"
              >
                Save Changes
              </button>
            </form>
          </section>

          {/* Cover */}

          <section className="rounded-3xl border border-[#dce8e1] bg-white p-7 shadow-[0_20px_60px_rgba(54,95,76,0.08)]">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-semibold text-[#365f4c]">
                Album Cover
              </h2>

              <p className="mt-1 text-sm text-[#82968d]">
                The current cover image for this album.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#eef4ef]">
              {album.coverFileId ? (
                <img
                  src={`/api/memories/files/${encodeURIComponent(
                    album.coverFileId
                  )}`}
                  alt={album.title}
                  className="aspect-video w-full object-cover"
                />
              ) : album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center text-sm text-[#82968d]">
                  No cover image
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl bg-[#f5f9f6] p-4 text-sm text-[#6d8479]">
              <p className="font-medium text-[#4d735f]">
                Cover management
              </p>

              <p className="mt-1">
                Cover upload and replacement will be added to the CMS media workflow.
              </p>
            </div>
          </section>
        </div>

        {/* Media */}

        <section className="mt-8 rounded-3xl border border-[#dce8e1] bg-white p-7 shadow-[0_20px_60px_rgba(54,95,76,0.08)]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#365f4c]">
                Memories
              </h2>

              <p className="mt-1 text-sm text-[#82968d]">
                {mediaFiles.length}{" "}
                {mediaFiles.length === 1
                  ? "file"
                  : "files"}{" "}
                in this album.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full border border-[#dce8e1] bg-[#f5f8f6] px-5 py-2.5 text-sm text-[#9aaca3]"
            >
              + Add Media
            </button>
          </div>

          {mediaFiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d5e3db] bg-[#fafcfb] px-6 py-16 text-center">
              <p className="font-serif text-xl text-[#5f7c6d]">
                No memories yet
              </p>

              <p className="mt-2 text-sm text-[#91a39a]">
                Media upload will be connected next.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {mediaFiles.map((file) => {
                const isVideo =
                  file.mimeType.startsWith(
                    "video/"
                  );

                return (
                  <article
                    key={file.id}
                    className="overflow-hidden rounded-2xl border border-[#dce8e1] bg-[#fbfdfb]"
                  >
                    <div className="aspect-video overflow-hidden bg-[#edf3ef]">
                      {isVideo ? (
                        <video
                          src={`/api/memories/files/${encodeURIComponent(
                            file.id
                          )}`}
                          controls
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <img
                          src={`/api/memories/files/${encodeURIComponent(
                            file.id
                          )}`}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="p-4">
                      <p className="truncate text-sm font-medium text-[#4d735f]">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-[#8a9e94]">
                        {file.mimeType}
                      </p>

                      <form
                        action={`/api/memories/albums/${encodeURIComponent(
                          album.id
                        )}/media/${encodeURIComponent(
                          file.id
                        )}`}
                        method="POST"
                        className="mt-4"
                      >
                        <button
                          type="submit"
                          disabled
                          className="w-full cursor-not-allowed rounded-xl border border-[#ead8d5] px-4 py-2 text-xs font-medium text-[#b18b85]"
                        >
                          Delete Media
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}