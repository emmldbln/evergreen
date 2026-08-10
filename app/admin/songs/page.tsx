"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  getFirestoreSongs,
  addFirestoreSong,
  updateFirestoreSong,
  deleteFirestoreSong,
} from "@/lib/firestore/songs";

import type { Song } from "@/lib/songs";

const DEFAULT_COVER =
  "/songs/default-cover.jpg";

const emptyForm = {
  title: "",
  artist: "",
  cover: "",
  spotifyUrl: "",
  note: "",
  favorite: false,
};

type SongForm = typeof emptyForm;

export default function SongsAdminPage() {
  const [songs, setSongs] =
    useState<Song[]>([]);

  const [form, setForm] =
    useState<SongForm>(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  async function loadSongs() {
    try {
      setLoading(true);

      const result =
        await getFirestoreSongs();

      setSongs(result);
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not load songs."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  let cancelled = false;

  async function loadInitialSongs() {
    try {
      setLoading(true);

      const result = await getFirestoreSongs();

      if (!cancelled) {
        setSongs(result);
      }
    } catch (error) {
      console.error(error);

      if (!cancelled) {
        setMessage(
          "Could not load songs."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadInitialSongs();

  return () => {
    cancelled = true;
  };
}, []);

  function updateField(
    field: keyof SongForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEditing(song: Song) {
    setEditingId(song.id);

    setForm({
      title: song.title ?? "",
      artist: song.artist ?? "",
      cover:
        song.cover === DEFAULT_COVER
          ? ""
          : song.cover ?? "",
      spotifyUrl:
        song.spotifyUrl ?? "",
      note: song.note ?? "",
      favorite:
        song.favorite ?? false,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage(
        "Please enter a song title."
      );
      return;
    }

    if (!form.artist.trim()) {
      setMessage(
        "Please enter the artist."
      );
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      /*
       * Notes automatically control
       * the golden glow.
       */
      const hasNote =
        form.note.trim().length > 0;

      const existingSong =
        editingId
          ? songs.find(
              (song) =>
                song.id === editingId
            )
          : undefined;

      const songData = {
        title: form.title.trim(),

        artist: form.artist.trim(),

        cover:
          form.cover.trim() ||
          DEFAULT_COVER,

        spotifyUrl:
          form.spotifyUrl.trim(),

        note: form.note.trim(),

        favorite:
          form.favorite,

        featured:
          existingSong?.featured ??
          false,

        glow: hasNote,

        /*
         * These fields remain part of
         * the data model for future
         * Memories / Collections work,
         * but are no longer exposed
         * in this form.
         */
        albums:
          existingSong?.albums ??
          [],

        memoryIds:
          existingSong?.memoryIds ??
          [],

        /*
         * Playback metadata will
         * eventually come from
         * Spotify / the playback
         * architecture.
         */
        duration:
          existingSong?.duration ??
          0,

        /*
         * Keep the existing audio
         * source if one already exists.
         * We are no longer asking the
         * administrator to enter it.
         */
        audioUrl:
          existingSong?.audioUrl ??
          "",
      };

      if (editingId) {
        await updateFirestoreSong(
          editingId,
          songData
        );

        setMessage(
          "Song updated successfully."
        );
      } else {
        await addFirestoreSong({
          ...songData,
          addedAt:
            new Date().toISOString(),
        });

        setMessage(
          "Song added successfully."
        );
      }

      resetForm();

      await loadSongs();
    } catch (error) {
      console.error(error);

      setMessage(
        editingId
          ? "Something went wrong while updating the song."
          : "Something went wrong while adding the song."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this song?"
      );

    if (!confirmed) return;

    try {
      await deleteFirestoreSong(id);

      if (editingId === id) {
        resetForm();
      }

      setMessage(
        "Song deleted."
      );

      await loadSongs();
    } catch (error) {
      console.error(error);

      setMessage(
        "Could not delete the song."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "40px 24px 160px",
        background: "#F6FAF5",
        color: "#3F5345",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: 2,
              textTransform:
                "uppercase",
              color: "#456C57",
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Admin CMS
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 52,
              fontFamily:
                "var(--font-serif)",
            }}
          >
            Songs
          </h1>

          <p
            style={{
              color: "#7A887C",
              fontSize: 17,
              marginTop: 8,
            }}
          >
            Manage the Evergreen
            soundtrack.
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              padding:
                "14px 18px",
              borderRadius: 16,
              background:
                "#EAF3EC",
              color: "#456C57",
              marginBottom: 24,
            }}
          >
            {message}
          </div>
        )}

        {/* SONG FORM */}

        <section
          style={{
            background: "white",
            borderRadius: 30,
            padding: 30,
            boxShadow:
              "0 18px 45px rgba(0,0,0,.06)",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              {editingId
                ? "Edit Song"
                : "Add Song"}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  border:
                    "1px solid rgba(69,108,87,.18)",
                  background: "white",
                  color: "#456C57",
                  borderRadius: 14,
                  padding:
                    "10px 14px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 18,
            }}
          >
            <Field
              label="Song Title"
              value={form.title}
              onChange={(value) =>
                updateField(
                  "title",
                  value
                )
              }
              placeholder="Enter the song title"
            />

            <Field
              label="Artist"
              value={form.artist}
              onChange={(value) =>
                updateField(
                  "artist",
                  value
                )
              }
              placeholder="Enter the artist name"
            />

            <Field
              label="Cover Image"
              value={form.cover}
              onChange={(value) =>
                updateField(
                  "cover",
                  value
                )
              }
              placeholder="Optional — Spotify cover will be used later"
            />

            <Field
              label="Spotify URL"
              value={form.spotifyUrl}
              onChange={(value) =>
                updateField(
                  "spotifyUrl",
                  value
                )
              }
              placeholder="Paste the Spotify song link"
            />

            <div>
              <label
                style={labelStyle}
              >
                Notes
                <span
                  style={{
                    marginLeft: 6,
                    fontWeight: 400,
                    color: "#9A9A9A",
                  }}
                >
                  (optional)
                </span>
              </label>

              <textarea
                value={form.note}
                onChange={(event) =>
                  updateField(
                    "note",
                    event.target.value
                  )
                }
                placeholder="Add a personal note about this song"
                rows={5}
                style={
                  textareaStyle
                }
              />

              <p
                style={{
                  margin:
                    "8px 0 0",
                  fontSize: 13,
                  color: "#8A8A8A",
                }}
              >
                Adding a note
                automatically gives
                the song its golden
                glow.
              </p>
            </div>

            {/* FAVORITE */}

            <label
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 10,
                padding: 14,
                borderRadius: 16,
                background:
                  "#F8FAF8",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={
                  form.favorite
                }
                onChange={(event) =>
                  updateField(
                    "favorite",
                    event.target
                      .checked
                  )
                }
              />

              Favorite
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: 10,
                border: "none",
                borderRadius: 18,
                padding: 17,
                background:
                  "#456C57",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: saving
                  ? "default"
                  : "pointer",
                opacity: saving
                  ? 0.7
                  : 1,
              }}
            >
              {saving
                ? editingId
                  ? "Saving Changes..."
                  : "Adding Song..."
                : editingId
                  ? "Save Changes"
                  : "Add Song"}
            </button>
          </form>
        </section>

        {/* SONG LIBRARY */}

        <section
          style={{
            background: "white",
            borderRadius: 30,
            padding: 30,
            boxShadow:
              "0 18px 45px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 28,
              }}
            >
              Song Library
            </h2>

            <span
              style={{
                color: "#7A887C",
              }}
            >
              {songs.length}{" "}
              {songs.length === 1
                ? "song"
                : "songs"}
            </span>
          </div>

          {loading ? (
            <div
              style={{
                color: "#8A8A8A",
              }}
            >
              Loading songs...
            </div>
          ) : songs.length === 0 ? (
            <div
              style={{
                padding: 30,
                borderRadius: 20,
                background:
                  "#F8FAF8",
                textAlign:
                  "center",
                color: "#8A8A8A",
              }}
            >
              No songs have been
              added yet.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 14,
              }}
            >
              {songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 16,
                    padding: 14,
                    borderRadius: 20,
                    background:
                      "#F8FAF8",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 16,
                      overflow:
                        "hidden",
                      flexShrink: 0,
                      background:
                        "#DDE8DE",
                    }}
                  >
                    {song.cover && (
                      <img
                        src={song.cover}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 17,
                      }}
                    >
                      {song.title}
                    </div>

                    <div
                      style={{
                        color: "#888",
                        marginTop: 4,
                      }}
                    >
                      {song.artist}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap:
                          "wrap",
                        marginTop: 8,
                      }}
                    >
                      {song.favorite && (
                        <Tag>
                          Favorite
                        </Tag>
                      )}

                      {song.note && (
                        <Tag>
                          ✦ Note
                        </Tag>
                      )}

                      {song.spotifyUrl && (
                        <Tag>
                          Spotify
                        </Tag>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          song
                        )
                      }
                      style={{
                        border:
                          "1px solid rgba(69,108,87,.18)",
                        background:
                          "white",
                        color:
                          "#456C57",
                        borderRadius:
                          14,
                        padding:
                          "10px 14px",
                        cursor:
                          "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          song.id
                        )
                      }
                      style={{
                        border:
                          "1px solid rgba(180,60,60,.18)",
                        background:
                          "#FFF7F7",
                        color:
                          "#A44A4A",
                        borderRadius:
                          14,
                        padding:
                          "10px 14px",
                        cursor:
                          "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function Tag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        padding:
          "4px 8px",
        borderRadius: 999,
        background:
          "#EAF3EC",
        color: "#456C57",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#456C57",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  boxSizing:
    "border-box" as const,
  border:
    "1px solid rgba(69,108,87,.15)",
  borderRadius: 14,
  padding:
    "13px 14px",
  fontSize: 15,
  outline: "none",
  background: "#FCFDFC",
};

const textareaStyle = {
  width: "100%",
  boxSizing:
    "border-box" as const,
  border:
    "1px solid rgba(69,108,87,.15)",
  borderRadius: 14,
  padding:
    "13px 14px",
  fontSize: 15,
  outline: "none",
  background: "#FCFDFC",
  resize: "vertical" as const,
};