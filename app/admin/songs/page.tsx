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

const emptyForm = {
  title: "",
  artist: "",
  cover: "",
  spotifyUrl: "",
  note: "",
  albums: "",
  favorite: false,
  featured: false,
  glow: false,
  duration: "",
  memoryIds: "",
};

export default function SongsAdminPage() {
  const [songs, setSongs] = useState<Song[]>([]);

  const [form, setForm] =
    useState(emptyForm);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

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
    loadSongs();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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

      await addFirestoreSong({
        title: form.title.trim(),

        artist: form.artist.trim(),

        cover: form.cover.trim(),

        spotifyUrl:
          form.spotifyUrl.trim(),

        note: form.note.trim(),

        albums: form.albums
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        favorite: form.favorite,

        featured: form.featured,

        glow: form.glow,

        duration:
          Number(form.duration) || 0,

        memoryIds: form.memoryIds
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        addedAt: new Date().toISOString(),
      });

      setForm(emptyForm);

      setMessage(
        "Song added successfully."
      );

      await loadSongs();
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while adding the song."
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

        background:
          "#F6FAF5",

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
              padding: "14px 18px",
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

        {/* ADD SONG */}

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
          <h2
            style={{
              marginTop: 0,
              marginBottom: 24,
              fontSize: 28,
            }}
          >
            Add Song
          </h2>

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
              placeholder="Then I Got Us"
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
              placeholder="FLEJAN"
            />

            <Field
              label="Cover Image URL"
              value={form.cover}
              onChange={(value) =>
                updateField(
                  "cover",
                  value
                )
              }
              placeholder="/songs/then-i-got-us.jpg"
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
              placeholder="https://open.spotify.com/track/..."
            />

            <Field
              label="Duration (seconds)"
              value={form.duration}
              onChange={(value) =>
                updateField(
                  "duration",
                  value
                )
              }
              placeholder="218"
              type="number"
            />

            <div>
              <label
                style={labelStyle}
              >
                Why This Song?
              </label>

              <textarea
                value={form.note}
                onChange={(event) =>
                  updateField(
                    "note",
                    event.target.value
                  )
                }
                placeholder="Why does this song matter to us?"
                rows={4}
                style={
                  textareaStyle
                }
              />
            </div>

            <Field
              label="Collections"
              value={form.albums}
              onChange={(value) =>
                updateField(
                  "albums",
                  value
                )
              }
              placeholder="Our Songs, Favorites"
            />

            <Field
              label="Memory IDs"
              value={form.memoryIds}
              onChange={(value) =>
                updateField(
                  "memoryIds",
                  value
                )
              }
              placeholder="first-ever-date, mall-date"
            />

            {/* OPTIONS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              <Checkbox
                label="Favorite"
                checked={
                  form.favorite
                }
                onChange={(value) =>
                  updateField(
                    "favorite",
                    value
                  )
                }
              />

              <Checkbox
                label="Featured"
                checked={
                  form.featured
                }
                onChange={(value) =>
                  updateField(
                    "featured",
                    value
                  )
                }
              />

              <Checkbox
                label="Golden Glow"
                checked={
                  form.glow
                }
                onChange={(value) =>
                  updateField(
                    "glow",
                    value
                  )
                }
              />
            </div>

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
                ? "Adding Song..."
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
                textAlign: "center",
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
                      {song.featured && (
                        <Tag>
                          Featured
                        </Tag>
                      )}

                      {song.favorite && (
                        <Tag>
                          Favorite
                        </Tag>
                      )}

                      {song.glow && (
                        <Tag>
                          Glow
                        </Tag>
                      )}
                    </div>
                  </div>

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

                      borderRadius: 14,

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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type={type}
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

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
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
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />

      {label}
    </label>
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
        color:
          "#456C57",
        fontSize: 11,
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
  boxSizing: "border-box" as const,
  padding: "14px 16px",
  borderRadius: 14,
  border:
    "1px solid rgba(69,108,87,.16)",
  background: "#FAFCFA",
  outline: "none",
  fontFamily:
    "var(--font-serif)",
  fontSize: 16,
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
};