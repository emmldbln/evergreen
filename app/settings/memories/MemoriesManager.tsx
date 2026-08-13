"use client";

import {
  useMemo,
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
} from "lucide-react";

import GlassCard from "@/app/components/ui/GlassCard";

import {
  addFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

import type {
  FirestoreAlbum,
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

interface AlbumFormData {
  title: string;
  date: string;
  location: string;
  story: string;
  coverUrl: string;
  coverFileId: string;
  driveFolderId: string;
}

/* =========================================================
   HELPERS
========================================================= */

function getMediaItems(
  album: SerializableAlbum
): DisplayMedia[] {
  const items: DisplayMedia[] = [];

  /*
   * -------------------------------------------------------
   * COVER
   * -------------------------------------------------------
   *
   * The cover is considered part of the album's media.
   *
   * This means:
   *
   *   1 cover + 3 media files = 4 items
   *
   * If the cover is already inside mediaFiles, we avoid
   * adding it twice.
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
    /*
     * Legacy albums may only have coverUrl.
     */
    items.push({
      id: `${album.id}-cover`,
      name: "Cover Photo",
      mimeType: "image/jpeg",
      src: album.coverUrl,
    });
  }

  /*
   * -------------------------------------------------------
   * STRUCTURED MEDIA
   * -------------------------------------------------------
   */

  if (
    album.mediaFiles &&
    album.mediaFiles.length > 0
  ) {
    for (const file of album.mediaFiles) {
      /*
       * Prevent duplicate cover.
       */
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
   * -------------------------------------------------------
   * LEGACY MEDIA
   * -------------------------------------------------------
   */

  if (
    album.media &&
    album.media.length > 0
  ) {
    album.media
      .filter(Boolean)
      .forEach((src, index) => {
        /*
         * Don't duplicate the cover when the old media
         * array already contains the same URL.
         */
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

function createEmptyAlbumForm(): AlbumFormData {
  return {
    title: "",
    date: "",
    location: "",
    story: "",
    coverUrl: "",
    coverFileId: "",
    driveFolderId: "",
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
    coverUrl: album.coverUrl ?? "",
    coverFileId: album.coverFileId ?? "",
    driveFolderId:
      album.driveFolderId ?? "",
  };
}

/* =========================================================
   MAIN
========================================================= */

export default function MemoriesManager({
  initialAlbums,
}: Props) {
  const safeAlbums =
    initialAlbums ?? [];

  const [albums, setAlbums] =
    useState<SerializableAlbum[]>(
      safeAlbums
    );

  const [
    selectedAlbumId,
    setSelectedAlbumId,
  ] = useState<string | null>(
    safeAlbums[0]?.id ?? null
  );

  const [
    selectedMedia,
    setSelectedMedia,
  ] = useState<DisplayMedia | null>(
    null
  );

  /*
   * -------------------------------------------------------
   * ALBUM MODAL STATE
   * -------------------------------------------------------
   */

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
    createEmptyAlbumForm()
  );

  const [
    savingAlbum,
    setSavingAlbum,
  ] = useState(false);

  const [
    albumError,
    setAlbumError,
  ] = useState("");

  /* =======================================================
     DERIVED DATA
  ======================================================= */

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

  /*
   * IMPORTANT:
   *
   * getMediaItems() already includes the cover.
   *
   * Therefore:
   *
   * cover + 3 media = 4
   */
  const totalMedia =
    useMemo(
      () =>
        albums.reduce(
          (
            total,
            album
          ) =>
            total +
            getMediaItems(
              album
            ).length,
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
     MODAL ACTIONS
  ======================================================= */

  function openCreateAlbum() {
    setEditingAlbum(null);
    setAlbumForm(
      createEmptyAlbumForm()
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
      createEmptyAlbumForm()
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

  async function handleSaveAlbum() {
    setAlbumError("");

    const title =
      albumForm.title.trim();

    if (!title) {
      setAlbumError(
        "Album title is required."
      );
      return;
    }

    if (
      !albumForm.driveFolderId.trim()
    ) {
      setAlbumError(
        "Google Drive folder ID is required."
      );
      return;
    }

    setSavingAlbum(true);

    try {
      const albumData = {
        title,
        date:
          albumForm.date.trim(),
        location:
          albumForm.location.trim(),
        story:
          albumForm.story.trim(),
        coverUrl:
          albumForm.coverUrl.trim(),
        ...(albumForm.coverFileId.trim()
          ? {
              coverFileId:
                albumForm.coverFileId.trim(),
            }
          : {}),
        media:
          editingAlbum?.media ??
          [],
        ...(editingAlbum?.mediaFileIds
          ? {
              mediaFileIds:
                editingAlbum.mediaFileIds,
            }
          : {}),
        ...(editingAlbum?.mediaFiles
          ? {
              mediaFiles:
                editingAlbum.mediaFiles,
            }
          : {}),
        driveFolderId:
          albumForm.driveFolderId.trim(),
      };

      /*
       * ---------------------------------------------------
       * CREATE
       * ---------------------------------------------------
       */

      if (!editingAlbum) {
        const newAlbumId =
          await addFirestoreAlbum(
            albumData
          );

        const newAlbum: SerializableAlbum =
          {
            id: newAlbumId,
            ...albumData,
            createdAt:
              new Date().toISOString(),
          };

        setAlbums(
          (current) => [
            newAlbum,
            ...current,
          ]
        );

        setSelectedAlbumId(
          newAlbumId
        );

        closeAlbumModal();
        return;
      }

      /*
       * ---------------------------------------------------
       * UPDATE
       * ---------------------------------------------------
       */

      await updateFirestoreAlbum(
        editingAlbum.id,
        albumData
      );

      const updatedAlbum: SerializableAlbum =
        {
          ...editingAlbum,
          ...albumData,
        };

      setAlbums(
        (current) =>
          current.map(
            (album) =>
              album.id ===
              editingAlbum.id
                ? updatedAlbum
                : album
          )
      );

      setSelectedAlbumId(
        editingAlbum.id
      );

      closeAlbumModal();
    } catch (error) {
      console.error(
        "Failed to save album:",
        error
      );

      setAlbumError(
        "Something went wrong while saving the album. Please try again."
      );
    } finally {
      setSavingAlbum(false);
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
                        <button
                          key={
                            album.id
                          }
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
          MEDIA LIGHTBOX
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
          CREATE / EDIT ALBUM MODAL
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
    getMediaItems(
      album
    );

  const coverSrc =
    getCoverSrc(
      album
    );

  return (
    <div>
      {/* =================================================
          COVER
      ================================================= */}

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
            src={
              coverSrc
            }
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

      {/* =================================================
          INFORMATION
      ================================================= */}

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

        {/* =================================================
            MEDIA
        ================================================= */}

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
                alert(
                  "Adding media will be connected next."
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
                      aria-label={
                        isVideo
                          ? `Open video ${index + 1}`
                          : `Open photo ${index + 1}`
                      }
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
                                backdropFilter:
                                  "blur(10px)",
                                WebkitBackdropFilter:
                                  "blur(10px)",
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
  onSave: () => void;
}) {
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
        {/* =================================================
            MODAL HEADER
        ================================================= */}

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
            onClick={
              onClose
            }
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

        {/* =================================================
            FORM
        ================================================= */}

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
              type="text"
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
            Media Configuration
          </div>

          <FormField
            label="Cover File ID"
            value={
              form.coverFileId
            }
            placeholder="Google Drive file ID"
            onChange={(
              value
            ) =>
              onChange(
                "coverFileId",
                value
              )
            }
          />

          <FormField
            label="Cover URL"
            value={
              form.coverUrl
            }
            placeholder="Optional legacy cover URL"
            onChange={(
              value
            ) =>
              onChange(
                "coverUrl",
                value
              )
            }
          />

          <FormField
            label="Google Drive Folder ID"
            required
            value={
              form.driveFolderId
            }
            placeholder="Google Drive folder ID"
            onChange={(
              value
            ) =>
              onChange(
                "driveFolderId",
                value
              )
            }
          />

          <div
            style={{
              padding:
                "11px 13px",
              borderRadius:
                13,
              background:
                "rgba(69,108,87,.055)",
              color:
                "#718077",
              fontSize: 11,
              lineHeight: 1.55,
            }}
          >
            The Drive folder ID is used
            to associate this album with
            its Google Drive media.
            Media uploading can be
            connected separately without
            creating another page.
          </div>

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

        {/* =================================================
            ACTIONS
        ================================================= */}

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
              onSave
            }
            disabled={saving}
            style={{
              ...primaryButtonStyle,
              minWidth: 125,
              opacity:
                saving ? 0.7 : 1,
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
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
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
        type={type}
        value={value}
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
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
    alignItems: "center",
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