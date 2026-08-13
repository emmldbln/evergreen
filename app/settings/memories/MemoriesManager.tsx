"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import Image from "next/image";

import {
  ArrowLeft,
  Images,
  Plus,
  ChevronRight,
  MapPin,
  CalendarDays,
  Play,
  X,
  Pencil,
  FolderHeart,
  Loader2,
  Trash2,
  ImagePlus,
  Upload,
} from "lucide-react";

import GlassCard from "@/app/components/ui/GlassCard";

import {
  updateFirestoreAlbum,
  type FirestoreAlbum,
} from "@/lib/firestore/memories";

/* =========================================================
   TYPES
========================================================= */

type SerializableAlbum = Omit<
  FirestoreAlbum,
  "createdAt"
> & {
  createdAt: string | null;
};

interface Props {
  initialAlbums: SerializableAlbum[];
}

interface DisplayMedia {
  id: string;
  name: string;
  mimeType: string;
  src: string;
}

interface PendingMedia {
  id: string;
  file: File;
  previewUrl: string;
}

interface AlbumFormData {
  title: string;
  date: string;
  location: string;
  story: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getMediaItems(
  album: SerializableAlbum
): DisplayMedia[] {
  const items: DisplayMedia[] = [];

  /*
   * Cover is counted as media.
   *
   * Example:
   * 1 cover + 3 media = 4 items
   */

  if (album.coverFileId) {
    items.push({
      id: album.coverFileId,
      name: "Cover Photo",
      mimeType: "image/jpeg",
      src: `/api/memories/files/${encodeURIComponent(
        album.coverFileId
      )}`,
    });
  } else if (album.coverUrl) {
    items.push({
      id: `${album.id}-cover`,
      name: "Cover Photo",
      mimeType: "image/jpeg",
      src: album.coverUrl,
    });
  }

  /*
   * Structured media
   */

  if (
    album.mediaFiles &&
    album.mediaFiles.length > 0
  ) {
    for (const file of album.mediaFiles) {
      if (
        album.coverFileId &&
        file.id === album.coverFileId
      ) {
        continue;
      }

      items.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        src: `/api/memories/files/${encodeURIComponent(
          file.id
        )}`,
      });
    }

    return items;
  }

  /*
   * Legacy media
   */

  if (
    album.media &&
    album.media.length > 0
  ) {
    album.media
      .filter(Boolean)
      .forEach((src, index) => {
        if (
          album.coverUrl &&
          src === album.coverUrl
        ) {
          return;
        }

        const lower =
          src.toLowerCase();

        const mimeType =
          /\.(mp4|webm|mov|m4v)(\?|$)/i.test(
            lower
          )
            ? "video/unknown"
            : "image/unknown";

        items.push({
          id: `${album.id}-${index}`,
          name: `Media ${index + 1}`,
          mimeType,
          src,
        });
      });
  }

  return items;
}

function isVideoMimeType(
  mimeType: string
): boolean {
  return mimeType
    .toLowerCase()
    .startsWith("video/");
}

function getCoverSrc(
  album: SerializableAlbum
): string {
  if (album.coverFileId) {
    return `/api/memories/files/${encodeURIComponent(
      album.coverFileId
    )}`;
  }

  if (album.coverUrl) {
    return album.coverUrl;
  }

  return "";
}

function createEmptyForm(): AlbumFormData {
  return {
    title: "",
    date: "",
    location: "",
    story: "",
  };
}

function albumToForm(
  album: SerializableAlbum
): AlbumFormData {
  return {
    title: album.title ?? "",
    date: album.date ?? "",
    location: album.location ?? "",
    story: album.story ?? "",
  };
}

/* =========================================================
   MAIN
========================================================= */

export default function MemoriesManager({
  initialAlbums,
}: Props) {
  const [albums, setAlbums] =
    useState<SerializableAlbum[]>(
      initialAlbums ?? []
    );

  const [
    selectedAlbumId,
    setSelectedAlbumId,
  ] = useState<string | null>(
    initialAlbums?.[0]?.id ?? null
  );

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<DisplayMedia | null>(
    null
  );

  const [
    albumModalOpen,
    setAlbumModalOpen,
  ] = useState(false);

  const [
    editingAlbum,
    setEditingAlbum,
  ] =
    useState<SerializableAlbum | null>(
      null
    );

  const [
    albumForm,
    setAlbumForm,
  ] = useState<AlbumFormData>(
    createEmptyForm()
  );

  const [
    savingAlbum,
    setSavingAlbum,
  ] = useState(false);

  const [
    albumError,
    setAlbumError,
  ] = useState("");

  const [
    deletingAlbumId,
    setDeletingAlbumId,
  ] = useState<string | null>(null);

  const selectedAlbum =
    useMemo(
      () =>
        albums.find(
          (album) =>
            album.id ===
            selectedAlbumId
        ) ?? null,
      [
        albums,
        selectedAlbumId,
      ]
    );

  const totalMedia =
    useMemo(
      () =>
        albums.reduce(
          (total, album) =>
            total +
            getMediaItems(album).length,
          0
        ),
      [albums]
    );

  const totalStories =
    useMemo(
      () =>
        albums.filter(
          (album) =>
            Boolean(
              album.story?.trim()
            )
        ).length,
      [albums]
    );

  /* =======================================================
     ALBUM ACTIONS
  ======================================================= */

  function openCreateAlbum() {
    setEditingAlbum(null);
    setAlbumForm(
      createEmptyForm()
    );
    setAlbumError("");
    setAlbumModalOpen(true);
  }

  function openEditAlbum(
    album: SerializableAlbum
  ) {
    setEditingAlbum(album);
    setAlbumForm(
      albumToForm(album)
    );
    setAlbumError("");
    setAlbumModalOpen(true);
  }

  function closeAlbumModal() {
    if (savingAlbum) {
      return;
    }

    setAlbumModalOpen(false);
    setEditingAlbum(null);
    setAlbumForm(
      createEmptyForm()
    );
    setAlbumError("");
  }

  function updateAlbumField(
    field: keyof AlbumFormData,
    value: string
  ) {
    setAlbumForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function replaceAlbum(
    updatedAlbum: SerializableAlbum
  ) {
    setAlbums(
      (current) =>
        current.map((album) =>
          album.id ===
          updatedAlbum.id
            ? updatedAlbum
            : album
        )
    );

    setEditingAlbum(
      updatedAlbum
    );

    setSelectedAlbumId(
      updatedAlbum.id
    );
  }

  /* =======================================================
     CREATE / UPDATE ALBUM
  ======================================================= */

  async function handleSaveAlbum(
    coverFile: File | null,
    pendingMedia: PendingMedia[]
  ) {
    setAlbumError("");

    const title =
      albumForm.title.trim();

    if (!title) {
      setAlbumError(
        "Album title is required."
      );
      return;
    }

    setSavingAlbum(true);

    try {
      let album: SerializableAlbum;

      /*
       * ---------------------------------------------------
       * CREATE
       * ---------------------------------------------------
       */

      if (!editingAlbum) {
        const response =
          await fetch(
            "/api/memories/albums",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                title,
                date:
                  albumForm.date.trim(),
                location:
                  albumForm.location.trim(),
                story:
                  albumForm.story.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Failed to create album."
          );
        }

        if (
          !data.album?.id
        ) {
          throw new Error(
            "Album was created but no album ID was returned."
          );
        }

        album = {
          id: data.album.id,
          title,
          date:
            albumForm.date.trim(),
          location:
            albumForm.location.trim(),
          story:
            albumForm.story.trim(),
          coverUrl:
            data.album.coverUrl ??
            "",
          media:
            data.album.media ??
            [],
          driveFolderId:
            data.album
              .driveFolderId ??
            "",
          createdAt:
            new Date().toISOString(),
        };
      } else {
        /*
         * -------------------------------------------------
         * UPDATE
         * -------------------------------------------------
         */

        await updateFirestoreAlbum(
          editingAlbum.id,
          {
            title,
            date:
              albumForm.date.trim(),
            location:
              albumForm.location.trim(),
            story:
              albumForm.story.trim(),
          }
        );

        album = {
          ...editingAlbum,
          title,
          date:
            albumForm.date.trim(),
          location:
            albumForm.location.trim(),
          story:
            albumForm.story.trim(),
        };
      }

      /*
       * Put the album into local state
       * before uploading files.
       */

      if (
        editingAlbum
      ) {
        replaceAlbum(album);
      } else {
        setAlbums(
          (current) => [
            album,
            ...current,
          ]
        );

        setSelectedAlbumId(
          album.id
        );

        setEditingAlbum(
          album
        );
      }

      /*
       * ---------------------------------------------------
       * COVER
       * ---------------------------------------------------
       */

      if (coverFile) {
        const formData =
          new FormData();

        formData.append(
          "file",
          coverFile
        );

        formData.append(
          "type",
          "cover"
        );

        const response =
          await fetch(
            `/api/memories/albums/${encodeURIComponent(
              album.id
            )}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Failed to upload album cover."
          );
        }

        if (data.album) {
          album = {
            ...album,
            ...data.album,
            createdAt:
              album.createdAt,
          };

          replaceAlbum(
            album
          );
        }
      }

      /*
       * ---------------------------------------------------
       * MEDIA
       * ---------------------------------------------------
       */

      for (
        let index = 0;
        index <
        pendingMedia.length;
        index++
      ) {
        const pending =
          pendingMedia[index];

        const formData =
          new FormData();

        formData.append(
          "file",
          pending.file
        );

        formData.append(
          "type",
          "media"
        );

        const response =
          await fetch(
            `/api/memories/albums/${encodeURIComponent(
              album.id
            )}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              `Failed to upload media ${index + 1}.`
          );
        }

        if (data.album) {
          album = {
            ...album,
            ...data.album,
            createdAt:
              album.createdAt,
          };

          replaceAlbum(
            album
          );
        }
      }

      /*
       * Finished.
       */

      pendingMedia.forEach(
        (media) => {
          URL.revokeObjectURL(
            media.previewUrl
          );
        }
      );

      setSavingAlbum(false);
      closeAlbumModal();
    } catch (error) {
      console.error(
        "Failed to save album:",
        error
      );

      setAlbumError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the album."
      );

      setSavingAlbum(false);
    }
  }

  /* =======================================================
     DELETE ALBUM
  ======================================================= */

  async function handleDeleteAlbum(
    album: SerializableAlbum
  ) {
    const confirmed =
      window.confirm(
        `Delete "${album.title}"?\n\nThis will permanently delete the album and its Google Drive folder and files.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingAlbumId(
      album.id
    );

    try {
      const response =
        await fetch(
          `/api/memories/albums/${encodeURIComponent(
            album.id
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to delete album."
        );
      }

      const remaining =
        albums.filter(
          (item) =>
            item.id !== album.id
        );

      setAlbums(
        remaining
      );

      if (
        selectedAlbumId ===
        album.id
      ) {
        setSelectedAlbumId(
          remaining[0]?.id ??
            null
        );
      }

      if (
        editingAlbum?.id ===
        album.id
      ) {
        closeAlbumModal();
      }
    } catch (error) {
      console.error(
        "Delete album error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete album."
      );
    } finally {
      setDeletingAlbumId(
        null
      );
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "32px 24px 160px",
        color: "#3F5345",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          style={{
            marginBottom: 30,
          }}
        >
          <Link
            href="/settings"
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 7,
              color:
                "#456C57",
              textDecoration:
                "none",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            <ArrowLeft
              size={17}
            />

            Back to Settings
          </Link>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "flex-end",
              justifyContent:
                "space-between",
              gap: 20,
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing:
                    1.8,
                  textTransform:
                    "uppercase",
                  fontWeight: 700,
                  color:
                    "#456C57",
                }}
              >
                Memories
              </div>

              <h1
                style={{
                  margin:
                    "8px 0 0",
                  fontSize:
                    "clamp(40px, 5vw, 58px)",
                  fontFamily:
                    "var(--font-serif)",
                  fontWeight: 500,
                  lineHeight: 1.05,
                }}
              >
                Your Memories
              </h1>

              <p
                style={{
                  margin:
                    "10px 0 0",
                  color:
                    "#7A887C",
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                Keep your favorite
                moments together.
              </p>
            </div>

            {/* NEW ALBUM IS OUTSIDE THE EDITOR */}

            <button
              type="button"
              onClick={
                openCreateAlbum
              }
              style={
                primaryButtonStyle
              }
            >
              <Plus
                size={18}
              />

              New Album
            </button>
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <div
          className="memories-stats"
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <StatCard
            icon={
              <FolderHeart
                size={19}
              />
            }
            label="Albums"
            value={
              albums.length
            }
          />

          <StatCard
            icon={
              <Images
                size={19}
              />
            }
            label="Media"
            value={
              totalMedia
            }
          />

          <StatCard
            icon={
              <CalendarDays
                size={19}
              />
            }
            label="Stories"
            value={
              totalStories
            }
          />
        </div>

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div
          className="memories-layout"
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(280px, 360px) minmax(0, 1fr)",
            gap: 22,
            alignItems:
              "start",
          }}
        >
          {/* =================================================
              ALBUM LIST
          ================================================= */}

          <GlassCard>
            <div
              style={{
                padding: 20,
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing:
                      1.5,
                    textTransform:
                      "uppercase",
                    fontWeight: 700,
                    color:
                      "#456C57",
                  }}
                >
                  Albums
                </div>

                <Images
                  size={17}
                  color="#7A887C"
                />
              </div>

              {albums.length ===
              0 ? (
                <EmptyAlbums />
              ) : (
                <div
                  style={{
                    display:
                      "flex",
                    flexDirection:
                      "column",
                    gap: 9,
                  }}
                >
                  {albums.map(
                    (
                      album
                    ) => {
                      const active =
                        album.id ===
                        selectedAlbumId;

                      const coverSrc =
                        getCoverSrc(
                          album
                        );

                      const mediaCount =
                        getMediaItems(
                          album
                        ).length;

                      return (
                        <div
                          key={
                            album.id
                          }
                          style={{
                            position:
                              "relative",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAlbumId(
                                album.id
                              )
                            }
                            style={{
                              width:
                                "100%",
                              border:
                                "1px solid transparent",
                              borderColor:
                                active
                                  ? "rgba(69,108,87,.20)"
                                  : "transparent",
                              borderRadius:
                                17,
                              padding: 9,
                              paddingRight: 48,
                              background:
                                active
                                  ? "rgba(69,108,87,.09)"
                                  : "rgba(69,108,87,.035)",
                              cursor:
                                "pointer",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: 11,
                              textAlign:
                                "left",
                              transition:
                                "all .2s ease",
                            }}
                          >
                            <div
                              style={{
                                position:
                                  "relative",
                                width: 58,
                                height: 58,
                                flexShrink: 0,
                                borderRadius:
                                  13,
                                overflow:
                                  "hidden",
                                background:
                                  "rgba(69,108,87,.10)",
                              }}
                            >
                              {coverSrc ? (
                                <Image
                                  src={
                                    coverSrc
                                  }
                                  alt={
                                    album.title
                                  }
                                  fill
                                  sizes="58px"
                                  style={{
                                    objectFit:
                                      "cover",
                                  }}
                                  unoptimized
                                />
                              ) : (
                                <div
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    color:
                                      "#8A968C",
                                  }}
                                >
                                  <Images
                                    size={
                                      22
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                minWidth:
                                  0,
                                flex: 1,
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    14,
                                  fontWeight:
                                    700,
                                  color:
                                    "#3F5345",
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  album.title
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    4,
                                  fontSize:
                                    11,
                                  color:
                                    "#8A968C",
                                }}
                              >
                                {
                                  mediaCount
                                }{" "}
                                {mediaCount ===
                                1
                                  ? "item"
                                  : "items"}
                              </div>
                            </div>

                            <ChevronRight
                              size={
                                16
                              }
                              color={
                                active
                                  ? "#456C57"
                                  : "#A1AAA3"
                              }
                            />
                          </button>

                          {/* DELETE IS OUTSIDE THE EDIT PANEL */}

                          <button
                            type="button"
                            onClick={(
                              event
                            ) => {
                              event.stopPropagation();

                              void handleDeleteAlbum(
                                album
                              );
                            }}
                            disabled={
                              deletingAlbumId ===
                              album.id
                            }
                            aria-label={`Delete ${album.title}`}
                            style={{
                              position:
                                "absolute",
                              right: 8,
                              top: "50%",
                              transform:
                                "translateY(-50%)",
                              width: 30,
                              height: 30,
                              border:
                                "none",
                              borderRadius:
                                10,
                              background:
                                "rgba(180,70,70,.08)",
                              color:
                                "#A35B5B",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              cursor:
                                deletingAlbumId ===
                                album.id
                                  ? "default"
                                  : "pointer",
                              opacity:
                                deletingAlbumId ===
                                album.id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {deletingAlbumId ===
                            album.id ? (
                              <Loader2
                                size={
                                  14
                                }
                                className="spin"
                              />
                            ) : (
                              <Trash2
                                size={
                                  14
                                }
                              />
                            )}
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* =================================================
              ALBUM DETAIL
          ================================================= */}

          <GlassCard>
            {selectedAlbum ? (
              <AlbumDetail
                album={
                  selectedAlbum
                }
                onSelectMedia={
                  setSelectedMedia
                }
                onEditAlbum={
                  openEditAlbum
                }
              />
            ) : (
              <EmptySelection />
            )}
          </GlassCard>
        </div>
      </div>

      {/* =================================================
          LIGHTBOX
      ================================================= */}

      {selectedMedia && (
        <MediaLightbox
          media={
            selectedMedia
          }
          onClose={() =>
            setSelectedMedia(
              null
            )
          }
        />
      )}

      {/* =================================================
          EDIT / CREATE MODAL
      ================================================= */}

      {albumModalOpen && (
        <AlbumModal
          editingAlbum={
            editingAlbum
          }
          form={
            albumForm
          }
          saving={
            savingAlbum
          }
          error={
            albumError
          }
          onChange={
            updateAlbumField
          }
          onClose={
            closeAlbumModal
          }
          onSave={
            handleSaveAlbum
          }
          onAlbumUpdated={
            replaceAlbum
          }
        />
      )}

      <style jsx>{`
        @media (max-width: 850px) {
          .memories-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          main {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .memories-stats {
            grid-template-columns: 1fr !important;
          }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   ALBUM DETAIL
========================================================= */

function AlbumDetail({
  album,
  onSelectMedia,
  onEditAlbum,
}: {
  album: SerializableAlbum;
  onSelectMedia: (
    media: DisplayMedia
  ) => void;
  onEditAlbum: (
    album: SerializableAlbum
  ) => void;
}) {
  const mediaItems =
    getMediaItems(album);

  const coverSrc =
    getCoverSrc(album);

  return (
    <div>
      {/* COVER */}

      <div
        style={{
          position:
            "relative",
          height: 300,
          overflow:
            "hidden",
          borderRadius: 24,
          background:
            "rgba(69,108,87,.08)",
        }}
      >
        {coverSrc ? (
          <Image
            src={coverSrc}
            alt={
              album.title
            }
            fill
            sizes="(max-width: 850px) 100vw, 800px"
            style={{
              objectFit:
                "cover",
            }}
            unoptimized
          />
        ) : (
          <div
            style={{
              width:
                "100%",
              height:
                "100%",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "#8A968C",
            }}
          >
            <Images
              size={60}
            />
          </div>
        )}

        <div
          style={{
            position:
              "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(18,31,23,.76), rgba(18,31,23,.08), transparent)",
          }}
        />

        <div
          style={{
            position:
              "absolute",
            left: 25,
            right: 25,
            bottom: 23,
            color:
              "white",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily:
                "var(--font-serif)",
              fontSize:
                "clamp(30px, 4vw, 44px)",
              fontWeight: 500,
              lineHeight: 1.1,
              textShadow:
                "0 3px 16px rgba(0,0,0,.30)",
            }}
          >
            {
              album.title
            }
          </h2>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 16,
              marginTop: 10,
              flexWrap:
                "wrap",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            {album.date && (
              <span
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 5,
                }}
              >
                <CalendarDays
                  size={14}
                />

                {
                  album.date
                }
              </span>
            )}

            {album.location && (
              <span
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: 5,
                }}
              >
                <MapPin
                  size={14}
                />

                {
                  album.location
                }
              </span>
            )}
          </div>
        </div>
      </div>

      {/* INFORMATION */}

      <div
        style={{
          padding:
            "25px 25px 28px",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 15,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing:
                  1.5,
                textTransform:
                  "uppercase",
                color:
                  "#456C57",
                fontWeight: 700,
              }}
            >
              Story
            </div>

            <p
              style={{
                margin:
                  "8px 0 0",
                color:
                  "#6D7A70",
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              {album.story ||
                "No story has been added to this album yet."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onEditAlbum(
                album
              )
            }
            style={
              iconButtonStyle
            }
            aria-label="Edit album"
          >
            <Pencil
              size={17}
            />
          </button>
        </div>

        {/* MEDIA */}

        <div
          style={{
            borderTop:
              "1px solid rgba(0,0,0,.07)",
            paddingTop: 20,
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              marginBottom: 13,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing:
                  1.5,
                textTransform:
                  "uppercase",
                color:
                  "#456C57",
                fontWeight: 700,
              }}
            >
              Photos & Videos
            </div>

            <button
              type="button"
              onClick={() =>
                onEditAlbum(
                  album
                )
              }
              style={
                smallButtonStyle
              }
            >
              <Plus
                size={15}
              />

              Add Media
            </button>
          </div>

          {mediaItems.length ===
          0 ? (
            <div
              style={{
                padding: 30,
                textAlign:
                  "center",
                borderRadius:
                  18,
                background:
                  "rgba(69,108,87,.045)",
                color:
                  "#8A968C",
                fontSize: 13,
              }}
            >
              This album doesn't
              have any media yet.
            </div>
          ) : (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 10,
              }}
            >
              {mediaItems.map(
                (
                  media,
                  index
                ) => {
                  const isVideo =
                    isVideoMimeType(
                      media.mimeType
                    );

                  return (
                    <button
                      key={
                        media.id
                      }
                      type="button"
                      onClick={() =>
                        onSelectMedia(
                          media
                        )
                      }
                      style={{
                        position:
                          "relative",
                        aspectRatio:
                          "1 / 1",
                        border:
                          "none",
                        borderRadius:
                          16,
                        overflow:
                          "hidden",
                        padding: 0,
                        background:
                          "rgba(69,108,87,.08)",
                        cursor:
                          "pointer",
                      }}
                    >
                      {isVideo ? (
                        <>
                          <video
                            src={
                              media.src
                            }
                            muted
                            playsInline
                            preload="metadata"
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                          />

                          <div
                            style={{
                              position:
                                "absolute",
                              inset: 0,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "rgba(0,0,0,.16)",
                            }}
                          >
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius:
                                  "50%",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                background:
                                  "rgba(255,255,255,.80)",
                                color:
                                  "#456C57",
                              }}
                            >
                              <Play
                                size={
                                  19
                                }
                                fill="currentColor"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Image
                          src={
                            media.src
                          }
                          alt={`${album.title} ${
                            index + 1
                          }`}
                          fill
                          sizes="200px"
                          style={{
                            objectFit:
                              "cover",
                          }}
                          unoptimized
                        />
                      )}

                      <div
                        style={{
                          position:
                            "absolute",
                          inset: 0,
                          boxShadow:
                            "inset 0 0 0 1px rgba(255,255,255,.18)",
                          pointerEvents:
                            "none",
                        }}
                      />
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CREATE / EDIT MODAL
========================================================= */

function AlbumModal({
  editingAlbum,
  form,
  saving,
  error,
  onChange,
  onClose,
  onSave,
  onAlbumUpdated,
}: {
  editingAlbum:
    | SerializableAlbum
    | null;

  form: AlbumFormData;

  saving: boolean;

  error: string;

  onChange: (
    field: keyof AlbumFormData,
    value: string
  ) => void;

  onClose: () => void;

  onSave: (
    coverFile: File | null,
    pendingMedia: PendingMedia[]
  ) => Promise<void>;

  onAlbumUpdated: (
    album: SerializableAlbum
  ) => void;
}) {
  const coverInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const mediaInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    coverFile,
    setCoverFile,
  ] = useState<File | null>(
    null
  );

  const [
    coverPreview,
    setCoverPreview,
  ] = useState("");

  const [
    pendingMedia,
    setPendingMedia,
  ] = useState<
    PendingMedia[]
  >([]);

  const [
    mediaUploading,
    setMediaUploading,
  ] = useState(false);

  const [
    mediaError,
    setMediaError,
  ] = useState("");

  const [
    deletingMediaId,
    setDeletingMediaId,
  ] = useState<string | null>(
    null
  );

  const currentMedia =
    editingAlbum
      ? getMediaItems(
          editingAlbum
        ).filter(
          (media) =>
            !(
              editingAlbum.coverFileId &&
              media.id ===
                editingAlbum.coverFileId
            )
        )
      : [];

  /*
   * -------------------------------------------------------
   * COVER PREVIEW
   * -------------------------------------------------------
   */

  function handleCoverChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setMediaError(
        "The album cover must be an image file."
      );
      return;
    }

    setMediaError("");

    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview
      );
    }

    const preview =
      URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(preview);
  }

  /*
   * -------------------------------------------------------
   * MEDIA SELECTION
   * -------------------------------------------------------
   */

  function handleMediaSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files ??
          []
      );

    event.target.value = "";

    if (!files.length) {
      return;
    }

    const invalid =
      files.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          ) &&
          !file.type.startsWith(
            "video/"
          )
      );

    if (invalid) {
      setMediaError(
        `"${invalid.name}" is not a supported image or video file.`
      );
      return;
    }

    setMediaError("");

    const newFiles =
      files.map(
        (file) => ({
          id:
            crypto.randomUUID(),
          file,
          previewUrl:
            URL.createObjectURL(
              file
            ),
        })
      );

    setPendingMedia(
      (current) => [
        ...current,
        ...newFiles,
      ]
    );
  }

  function removePendingMedia(
    id: string
  ) {
    setPendingMedia(
      (current) => {
        const target =
          current.find(
            (item) =>
              item.id === id
          );

        if (target) {
          URL.revokeObjectURL(
            target.previewUrl
          );
        }

        return current.filter(
          (item) =>
            item.id !== id
        );
      }
    );
  }

  /*
   * -------------------------------------------------------
   * IMMEDIATE MEDIA UPLOAD FOR EXISTING ALBUM
   * -------------------------------------------------------
   */

  async function uploadMediaNow(
    files: PendingMedia[]
  ) {
    if (!editingAlbum) {
      return;
    }

    setMediaUploading(true);
    setMediaError("");

    try {
      let album =
        editingAlbum;

      for (
        let index = 0;
        index < files.length;
        index++
      ) {
        const pending =
          files[index];

        const formData =
          new FormData();

        formData.append(
          "file",
          pending.file
        );

        formData.append(
          "type",
          "media"
        );

        const response =
          await fetch(
            `/api/memories/albums/${encodeURIComponent(
              album.id
            )}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ??
              `Failed to upload ${pending.file.name}.`
          );
        }

        if (data.album) {
          album = {
            ...album,
            ...data.album,
            createdAt:
              album.createdAt,
          };

          onAlbumUpdated(
            album
          );
        }
      }

      files.forEach(
        (file) => {
          URL.revokeObjectURL(
            file.previewUrl
          );
        }
      );

      setPendingMedia(
        (current) =>
          current.filter(
            (item) =>
              !files.some(
                (file) =>
                  file.id ===
                  item.id
              )
          )
      );
    } catch (error) {
      console.error(
        "Media upload error:",
        error
      );

      setMediaError(
        error instanceof Error
          ? error.message
          : "Failed to upload media."
      );
    } finally {
      setMediaUploading(false);
    }
  }

  /*
   * -------------------------------------------------------
   * DELETE EXISTING MEDIA
   * -------------------------------------------------------
   */

  async function deleteExistingMedia(
    media: DisplayMedia
  ) {
    if (!editingAlbum) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${media.name}"?\n\nThis will permanently remove the file from this album.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingMediaId(
      media.id
    );
    setMediaError("");

    try {
      const response =
        await fetch(
          `/api/memories/albums/${encodeURIComponent(
            editingAlbum.id
          )}/media/${encodeURIComponent(
            media.id
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Failed to delete media."
        );
      }

      const updatedMediaFileIds =
        (
          editingAlbum.mediaFileIds ??
          []
        ).filter(
          (id) =>
            id !== media.id
        );

      const updatedMediaFiles =
        (
          editingAlbum.mediaFiles ??
          []
        ).filter(
          (file) =>
            file.id !==
            media.id
        );

      const mediaIndex =
        (
          editingAlbum.mediaFileIds ??
          []
        ).indexOf(
          media.id
        );

      const updatedLegacyMedia =
        (
          editingAlbum.media ??
          []
        ).filter(
          (_url, index) =>
            index !==
            mediaIndex
        );

      const updatedAlbum: SerializableAlbum =
        {
          ...editingAlbum,
          mediaFileIds:
            updatedMediaFileIds,
          mediaFiles:
            updatedMediaFiles,
          media:
            updatedLegacyMedia,
        };

      onAlbumUpdated(
        updatedAlbum
      );
    } catch (error) {
      console.error(
        "Delete media error:",
        error
      );

      setMediaError(
        error instanceof Error
          ? error.message
          : "Failed to delete media."
      );
    } finally {
      setDeletingMediaId(
        null
      );
    }
  }

  /*
   * -------------------------------------------------------
   * SAVE
   * -------------------------------------------------------
   */

  async function handleSubmit() {
    await onSave(
      coverFile,
      pendingMedia
    );

    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview
      );
    }

    setCoverPreview("");
    setCoverFile(null);
  }

  /*
   * -------------------------------------------------------
   * COVER PREVIEW SOURCE
   * -------------------------------------------------------
   */

  const existingCover =
    editingAlbum
      ? getCoverSrc(
          editingAlbum
        )
      : "";

  const displayedCover =
    coverPreview ||
    existingCover;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-modal-title"
      onClick={onClose}
      style={{
        position:
          "fixed",
        inset: 0,
        zIndex: 10000,
        background:
          "rgba(15,24,19,.48)",
        backdropFilter:
          "blur(16px)",
        WebkitBackdropFilter:
          "blur(16px)",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: 20,
      }}
    >
      <div
        onClick={(event) =>
          event.stopPropagation()
        }
        style={{
          width:
            "min(100%, 620px)",
          maxHeight:
            "calc(100vh - 40px)",
          overflowY:
            "auto",
          borderRadius: 26,
          background:
            "rgba(250,252,249,.96)",
          border:
            "1px solid rgba(255,255,255,.80)",
          boxShadow:
            "0 30px 90px rgba(20,40,28,.25)",
          padding: 26,
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display:
              "flex",
            alignItems:
              "flex-start",
            justifyContent:
              "space-between",
            gap: 15,
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing:
                  1.5,
                textTransform:
                  "uppercase",
                color:
                  "#456C57",
                fontWeight: 700,
              }}
            >
              Memories
            </div>

            <h2
              id="album-modal-title"
              style={{
                margin:
                  "7px 0 0",
                fontFamily:
                  "var(--font-serif)",
                fontSize: 32,
                fontWeight: 500,
                color:
                  "#3F5345",
              }}
            >
              {editingAlbum
                ? "Edit Album"
                : "New Album"}
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",
                color:
                  "#7A887C",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {editingAlbum
                ? "Update the details of this memory album."
                : "Create a new collection for your memories."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close album form"
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              border:
                "1px solid rgba(69,108,87,.12)",
              borderRadius: 12,
              background:
                "rgba(69,108,87,.06)",
              color:
                "#456C57",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              cursor:
                saving
                  ? "default"
                  : "pointer",
            }}
          >
            <X
              size={18}
            />
          </button>
        </div>

        {/* FORM */}

        <div
          style={{
            display:
              "flex",
            flexDirection:
              "column",
            gap: 17,
          }}
        >
          <FormField
            label="Album Title"
            required
            value={
              form.title
            }
            placeholder="e.g. Our First Trip"
            onChange={(
              value
            ) =>
              onChange(
                "title",
                value
              )
            }
          />

          <div
            className="album-form-grid"
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 14,
            }}
          >
            <FormField
              label="Date"
              value={
                form.date
              }
              placeholder="e.g. August 9, 2026"
              onChange={(
                value
              ) =>
                onChange(
                  "date",
                  value
                )
              }
            />

            <FormField
              label="Location"
              value={
                form.location
              }
              placeholder="e.g. Cardona, Rizal"
              onChange={(
                value
              ) =>
                onChange(
                  "location",
                  value
                )
              }
            />
          </div>

          <div>
            <label
              style={
                formLabelStyle
              }
            >
              Story
            </label>

            <textarea
              value={
                form.story
              }
              onChange={(
                event
              ) =>
                onChange(
                  "story",
                  event.target
                    .value
                )
              }
              placeholder="Write something about this memory..."
              rows={5}
              style={{
                ...formInputStyle,
                resize:
                  "vertical",
                minHeight: 120,
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* =================================================
              COVER
          ================================================= */}

          <div
            style={{
              height: 1,
              background:
                "rgba(69,108,87,.10)",
              margin:
                "3px 0",
            }}
          />

          <div
            style={{
              fontSize: 11,
              letterSpacing:
                1.3,
              textTransform:
                "uppercase",
              color:
                "#456C57",
              fontWeight: 700,
            }}
          >
            Album Cover
          </div>

          <input
            ref={
              coverInputRef
            }
            type="file"
            accept="image/*"
            onChange={
              handleCoverChange
            }
            style={{
              display:
                "none",
            }}
          />

          <div
            style={{
              width:
                "100%",
              aspectRatio:
                "16 / 9",
              overflow:
                "hidden",
              borderRadius: 18,
              background:
                "rgba(69,108,87,.07)",
            }}
          >
            {displayedCover ? (
              <Image
                src={
                  displayedCover
                }
                alt={
                  form.title ||
                  "Album cover"
                }
                width={900}
                height={500}
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  objectFit:
                    "cover",
                }}
                unoptimized
              />
            ) : (
              <div
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    "#8A968C",
                  fontSize: 13,
                }}
              >
                No cover image
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              coverInputRef.current?.click()
            }
            disabled={saving}
            style={{
              ...secondaryButtonStyle,
              width:
                "100%",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: 7,
            }}
          >
            <ImagePlus
              size={16}
            />

            {coverFile
              ? "Change Selected Cover"
              : "Change Cover"}
          </button>

          {/* =================================================
              MEDIA
          ================================================= */}

          <div
            style={{
              height: 1,
              background:
                "rgba(69,108,87,.10)",
              margin:
                "3px 0",
            }}
          />

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing:
                    1.3,
                  textTransform:
                    "uppercase",
                  color:
                    "#456C57",
                  fontWeight: 700,
                }}
              >
                Photos & Videos
              </div>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    "#82968D",
                  fontSize: 11,
                }}
              >
                Add or remove media
                from this album.
              </p>
            </div>

            <input
              ref={
                mediaInputRef
              }
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={
                handleMediaSelection
              }
              style={{
                display:
                  "none",
              }}
            />

            <button
              type="button"
              onClick={() =>
                mediaInputRef.current?.click()
              }
              disabled={
                saving ||
                mediaUploading
              }
              style={
                smallButtonStyle
              }
            >
              <Upload
                size={15}
              />

              Add Media
            </button>
          </div>

          {/* EXISTING MEDIA */}

          {currentMedia.length >
            0 && (
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: 9,
              }}
            >
              {currentMedia.map(
                (
                  media
                ) => {
                  const video =
                    isVideoMimeType(
                      media.mimeType
                    );

                  return (
                    <div
                      key={
                        media.id
                      }
                      style={{
                        position:
                          "relative",
                        aspectRatio:
                          "1 / 1",
                        overflow:
                          "hidden",
                        borderRadius:
                          14,
                        background:
                          "rgba(69,108,87,.08)",
                      }}
                    >
                      {video ? (
                        <>
                          <video
                            src={
                              media.src
                            }
                            muted
                            playsInline
                            preload="metadata"
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />

                          <div
                            style={{
                              position:
                                "absolute",
                              inset: 0,
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              pointerEvents:
                                "none",
                            }}
                          >
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius:
                                  "50%",
                                background:
                                  "rgba(255,255,255,.82)",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                color:
                                  "#456C57",
                              }}
                            >
                              <Play
                                size={
                                  15
                                }
                                fill="currentColor"
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Image
                          src={
                            media.src
                          }
                          alt={
                            media.name
                          }
                          fill
                          sizes="180px"
                          style={{
                            objectFit:
                              "cover",
                          }}
                          unoptimized
                        />
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void deleteExistingMedia(
                            media
                          )
                        }
                        disabled={
                          deletingMediaId ===
                          media.id
                        }
                        aria-label={`Delete ${media.name}`}
                        style={{
                          position:
                            "absolute",
                          top: 7,
                          right: 7,
                          width: 28,
                          height: 28,
                          border:
                            "none",
                          borderRadius:
                            9,
                          background:
                            "rgba(255,255,255,.88)",
                          color:
                            "#A35B5B",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          cursor:
                            "pointer",
                        }}
                      >
                        {deletingMediaId ===
                        media.id ? (
                          <Loader2
                            size={
                              13
                            }
                            className="spin"
                          />
                        ) : (
                          <Trash2
                            size={
                              13
                            }
                          />
                        )}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* PENDING MEDIA */}

          {pendingMedia.length >
            0 && (
            <div>
              <div
                style={{
                  marginBottom: 8,
                  color:
                    "#7A887C",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Ready to upload
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: 9,
                }}
              >
                {pendingMedia.map(
                  (
                    media
                  ) => {
                    const video =
                      media.file.type.startsWith(
                        "video/"
                      );

                    return (
                      <div
                        key={
                          media.id
                        }
                        style={{
                          position:
                            "relative",
                          aspectRatio:
                            "1 / 1",
                          overflow:
                            "hidden",
                          borderRadius:
                            14,
                          background:
                            "rgba(69,108,87,.08)",
                        }}
                      >
                        {video ? (
                          <video
                            src={
                              media.previewUrl
                            }
                            muted
                            playsInline
                            style={{
                              width:
                                "100%",
                              height:
                                "100%",
                              objectFit:
                                "cover",
                            }}
                          />
                        ) : (
                          <Image
                            src={
                              media.previewUrl
                            }
                            alt={
                              media.file.name
                            }
                            fill
                            sizes="180px"
                            style={{
                              objectFit:
                                "cover",
                            }}
                            unoptimized
                          />
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removePendingMedia(
                              media.id
                            )
                          }
                          style={{
                            position:
                              "absolute",
                            top: 7,
                            right: 7,
                            width: 28,
                            height: 28,
                            border:
                              "none",
                            borderRadius:
                              9,
                            background:
                              "rgba(255,255,255,.88)",
                            color:
                              "#A35B5B",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            cursor:
                              "pointer",
                          }}
                        >
                          <Trash2
                            size={
                              13
                            }
                          />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>

              {editingAlbum && (
                <button
                  type="button"
                  onClick={() =>
                    void uploadMediaNow(
                      pendingMedia
                    )
                  }
                  disabled={
                    mediaUploading
                  }
                  style={{
                    ...primaryButtonStyle,
                    width:
                      "100%",
                    marginTop: 10,
                    opacity:
                      mediaUploading
                        ? 0.7
                        : 1,
                  }}
                >
                  {mediaUploading ? (
                    <>
                      <Loader2
                        size={16}
                        className="spin"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload
                        size={16}
                      />
                      Upload Selected Media
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {mediaError && (
            <div
              style={{
                padding:
                  "11px 13px",
                borderRadius:
                  13,
                background:
                  "rgba(180,60,60,.08)",
                border:
                  "1px solid rgba(180,60,60,.12)",
                color:
                  "#9B4C4C",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {mediaError}
            </div>
          )}

          {error && (
            <div
              style={{
                padding:
                  "11px 13px",
                borderRadius:
                  13,
                background:
                  "rgba(180,60,60,.08)",
                border:
                  "1px solid rgba(180,60,60,.12)",
                color:
                  "#9B4C4C",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            gap: 10,
            marginTop: 25,
          }}
        >
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={saving}
            style={
              secondaryButtonStyle
            }
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              saving ||
              mediaUploading
            }
            style={{
              ...primaryButtonStyle,
              minWidth: 125,
              opacity:
                saving ||
                mediaUploading
                  ? 0.7
                  : 1,
            }}
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />
                Saving...
              </>
            ) : (
              <>
                <FolderHeart
                  size={16}
                />

                {editingAlbum
                  ? "Save Changes"
                  : "Create Album"}
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .album-form-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({
  label,
  value,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <label
        style={
          formLabelStyle
        }
      >
        {label}

        {required && (
          <span
            style={{
              color:
                "#B35A5A",
              marginLeft: 3,
            }}
          >
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        style={
          formInputStyle
        }
      />
    </div>
  );
}

/* =========================================================
   LIGHTBOX
========================================================= */

function MediaLightbox({
  media,
  onClose,
}: {
  media: DisplayMedia;
  onClose: () => void;
}) {
  const isVideo =
    isVideoMimeType(
      media.mimeType
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={
        onClose
      }
      style={{
        position:
          "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          "rgba(15,24,19,.76)",
        backdropFilter:
          "blur(18px)",
        WebkitBackdropFilter:
          "blur(18px)",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        padding: 24,
      }}
    >
      <button
        type="button"
        onClick={
          onClose
        }
        aria-label="Close"
        style={{
          position:
            "fixed",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          border:
            "1px solid rgba(255,255,255,.22)",
          borderRadius:
            "50%",
          background:
            "rgba(255,255,255,.12)",
          color:
            "white",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          cursor:
            "pointer",
          zIndex: 2,
        }}
      >
        <X
          size={20}
        />
      </button>

      <div
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
        style={{
          position:
            "relative",
          width:
            "min(100%, 1000px)",
          height:
            "min(82vh, 760px)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
        }}
      >
        {isVideo ? (
          <video
            src={
              media.src
            }
            controls
            autoPlay
            playsInline
            style={{
              maxWidth:
                "100%",
              maxHeight:
                "100%",
              borderRadius:
                18,
              boxShadow:
                "0 30px 80px rgba(0,0,0,.35)",
            }}
          />
        ) : (
          <Image
            src={
              media.src
            }
            alt={
              media.name ||
              "Memory"
            }
            fill
            sizes="90vw"
            style={{
              objectFit:
                "contain",
              borderRadius:
                18,
            }}
            unoptimized
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATES
========================================================= */

function EmptyAlbums() {
  return (
    <div
      style={{
        padding:
          "34px 15px",
        textAlign:
          "center",
        color:
          "#8A968C",
      }}
    >
      <Images
        size={30}
        style={{
          marginBottom: 10,
          opacity: 0.45,
        }}
      />

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        No albums yet.
        <br />
        Create your first
        memory album.
      </div>
    </div>
  );
}

function EmptySelection() {
  return (
    <div
      style={{
        minHeight: 500,
        display:
          "flex",
        flexDirection:
          "column",
        alignItems:
          "center",
        justifyContent:
          "center",
        textAlign:
          "center",
        padding: 30,
        color:
          "#8A968C",
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius:
            "50%",
          background:
            "radial-gradient(circle, rgba(69,108,87,.13), transparent)",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          marginBottom: 18,
        }}
      >
        <FolderHeart
          size={42}
          strokeWidth={1.3}
        />
      </div>

      <h2
        style={{
          margin: 0,
          fontFamily:
            "var(--font-serif)",
          fontWeight: 500,
          color:
            "#456C57",
          fontSize: 30,
        }}
      >
        Select an album
      </h2>

      <p
        style={{
          maxWidth: 380,
          margin:
            "10px 0 0",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        Choose an album from
        the left to explore its
        photos, videos, and
        story.
      </p>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <GlassCard>
      <div
        style={{
          padding:
            "17px 19px",
          display:
            "flex",
          alignItems:
            "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius:
              12,
            background:
              "rgba(69,108,87,.09)",
            color:
              "#456C57",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
          }}
        >
          {icon}
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              color:
                "#8A968C",
              textTransform:
                "uppercase",
              letterSpacing:
                1.2,
              fontWeight: 700,
            }}
          >
            {label}
          </div>

          <div
            style={{
              marginTop: 2,
              color:
                "#3F5345",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* =========================================================
   STYLES
========================================================= */

const primaryButtonStyle: React.CSSProperties =
  {
    border: "none",
    borderRadius: 16,
    padding: "13px 17px",
    background: "#456C57",
    color: "white",
    display:
      "inline-flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow:
      "0 12px 30px rgba(69,108,87,.20)",
  };

const secondaryButtonStyle: React.CSSProperties =
  {
    border:
      "1px solid rgba(69,108,87,.13)",
    borderRadius: 14,
    padding:
      "11px 16px",
    background:
      "rgba(69,108,87,.045)",
    color: "#456C57",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };

const smallButtonStyle: React.CSSProperties =
  {
    border: "none",
    borderRadius: 12,
    padding: "8px 11px",
    background:
      "rgba(69,108,87,.09)",
    color: "#456C57",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };

const iconButtonStyle: React.CSSProperties =
  {
    width: 38,
    height: 38,
    flexShrink: 0,
    border:
      "1px solid rgba(69,108,87,.12)",
    borderRadius: 12,
    background:
      "rgba(69,108,87,.07)",
    color: "#456C57",
    display: "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    cursor: "pointer",
  };

const formLabelStyle: React.CSSProperties =
  {
    display: "block",
    marginBottom: 7,
    color: "#456C57",
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform:
      "uppercase",
    fontWeight: 700,
  };

const formInputStyle: React.CSSProperties =
  {
    width: "100%",
    boxSizing:
      "border-box",
    border:
      "1px solid rgba(69,108,87,.14)",
    borderRadius: 13,
    background:
      "rgba(255,255,255,.78)",
    color: "#3F5345",
    padding:
      "11px 13px",
    outline: "none",
    fontSize: 13,
    fontFamily:
      "inherit",
  };