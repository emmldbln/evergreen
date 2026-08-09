"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ImagePlus,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Film,
} from "lucide-react";

import {
  deleteFirestoreAlbum,
  getFirestoreAlbums,
  type FirestoreAlbum,
} from "@/lib/firestore/memories";


const EMPTY_FORM = {
  title: "",
  date: "",
  location: "",
  story: "",
};

interface MediaFile {
  id: string;
  file: File;
  previewUrl: string;
}

export default function AdminMemoriesPage() {
  const [albums, setAlbums] = useState<
    FirestoreAlbum[]
  >([]);

  const [showEditor, setShowEditor] =
    useState(false);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [coverPreview, setCoverPreview] =
    useState("");

  const [mediaFiles, setMediaFiles] =
    useState<MediaFile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadStatus, setUploadStatus] =
    useState("");

  const [error, setError] =
    useState("");

  const coverInputRef =
    useRef<HTMLInputElement>(null);

  const mediaInputRef =
    useRef<HTMLInputElement>(null);

  async function loadAlbums() {
    try {
      setError("");

      const data =
        await getFirestoreAlbums();

      setAlbums(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load albums from Firebase."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAlbums();
  }, []);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openEditor() {
    setForm(EMPTY_FORM);

    setCoverFile(null);
    setCoverPreview("");

    setMediaFiles([]);

    setUploadStatus("");
    setError("");

    setShowEditor(true);
  }

  function closeEditor() {
    if (saving) return;

    setShowEditor(false);

    setForm(EMPTY_FORM);

    setCoverFile(null);
    setCoverPreview("");

    setMediaFiles([]);

    setUploadStatus("");
    setError("");
  }

  function handleCoverChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "The cover image must be an image file."
      );

      event.target.value = "";
      return;
    }

    setError("");

    setCoverFile(file);

    const preview =
      URL.createObjectURL(file);

    setCoverPreview(preview);
  }

  function handleMediaChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files ?? []
      );

    if (!files.length) return;

    const validFiles =
      files.filter((file) => {
        const validImage =
          file.type.startsWith("image/");

        const validVideo =
          file.type.startsWith("video/");

        return validImage || validVideo;
      });

    if (validFiles.length !== files.length) {
      setError(
        "Only image and video files can be added."
      );
    } else {
      setError("");
    }

    const newMedia =
      validFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl:
          URL.createObjectURL(file),
      }));

    setMediaFiles((current) => [
      ...current,
      ...newMedia,
    ]);

    event.target.value = "";
  }

  function removeMediaFile(
    id: string
  ) {
    setMediaFiles((current) => {
      const target =
        current.find(
          (item) => item.id === id
        );

      if (target) {
        URL.revokeObjectURL(
          target.previewUrl
        );
      }

      return current.filter(
        (item) => item.id !== id
      );
    });
  }

  async function handleCreateAlbum(
  event: React.FormEvent
) {
  event.preventDefault();

  if (!form.title.trim()) {
    setError("Please enter an album title.");
    return;
  }

  if (!coverFile) {
    setError("Please select a cover image.");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setUploadStatus("Creating album...");

    /*
     * Create the album through the server API.
     *
     * The API:
     * 1. Creates/gets the Evergreen/Memories folder
     * 2. Creates the album folder in Google Drive
     * 3. Creates the Firestore album document
     * 4. Stores the Google Drive folder ID
     */
    const createResponse = await fetch(
      "/api/memories/albums",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          date: form.date,
          location: form.location.trim(),
          story: form.story.trim(),
        }),
      }
    );

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      throw new Error(
        createData.error ??
          "Failed to create album."
      );
    }

    const albumId =
      createData.album?.id;

    if (
      typeof albumId !== "string" ||
      !albumId
    ) {
      throw new Error(
        "Album was created but no album ID was returned."
      );
    }

    /*
     * Upload the cover image to Google Drive.
     */
    setUploadStatus(
      "Uploading cover image..."
    );

    const coverFormData = new FormData();

    coverFormData.append(
      "file",
      coverFile
    );

    coverFormData.append(
      "type",
      "cover"
    );

    const coverResponse = await fetch(
      `/api/memories/albums/${albumId}/upload`,
      {
        method: "POST",
        body: coverFormData,
      }
    );

    const coverData =
      await coverResponse.json();

    if (!coverResponse.ok) {
      throw new Error(
        coverData.error ??
          "Failed to upload cover image."
      );
    }

    /*
     * Upload all selected album media.
     */
    for (
      let index = 0;
      index < mediaFiles.length;
      index++
    ) {
      const media =
        mediaFiles[index];

      setUploadStatus(
        `Uploading media ${index + 1} of ${mediaFiles.length}...`
      );

      const mediaFormData =
        new FormData();

      mediaFormData.append(
        "file",
        media.file
      );

      mediaFormData.append(
        "type",
        "media"
      );

      const mediaResponse =
        await fetch(
          `/api/memories/albums/${albumId}/upload`,
          {
            method: "POST",
            body: mediaFormData,
          }
        );

      const mediaData =
        await mediaResponse.json();

      if (!mediaResponse.ok) {
        throw new Error(
          mediaData.error ??
            `Failed to upload media ${index + 1}.`
        );
      }
    }

    /*
     * Everything finished successfully.
     */
    setUploadStatus(
      "Album created successfully."
    );

    await loadAlbums();

    /*
     * Clean up local object URLs.
     */
    if (coverPreview) {
      URL.revokeObjectURL(
        coverPreview
      );
    }

    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(
        media.previewUrl
      );
    });

    /*
     * Reset the editor.
     */
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setCoverPreview("");
    setMediaFiles([]);

    /*
     * Give the user a brief success state
     * before closing the editor.
     */
    setTimeout(() => {
      setShowEditor(false);
      setUploadStatus("");
    }, 700);
  } catch (err) {
    console.error(
      "Create album error:",
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to create the album."
    );

    setUploadStatus("");
  } finally {
    setSaving(false);
  }
}

  async function handleDeleteAlbum(
    album: FirestoreAlbum
  ) {
    const confirmed =
      window.confirm(
        `Delete "${album.title}"?`
      );

    if (!confirmed) return;

    try {
      setError("");

      await deleteFirestoreAlbum(
        album.id
      );

      setAlbums((current) =>
        current.filter(
          (item) =>
            item.id !== album.id
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to delete the album."
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding:
          "40px 28px 140px",
        background:
          "linear-gradient(180deg,#F4F8F4,#EEF4EF)",
      }}
    >
      <div
        style={{
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
            alignItems: "center",
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div>
            <div
              style={{
                color: "#456C57",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform:
                  "uppercase",
                marginBottom: 8,
              }}
            >
              Admin CMS
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 46,
                color: "#456C57",
                fontFamily:
                  "var(--font-serif)",
              }}
            >
              Memories
            </h1>

            <p
              style={{
                marginTop: 8,
                color: "#7A887C",
                fontSize: 16,
              }}
            >
              Manage your albums and
              memories.
            </p>
          </div>

          <button
            type="button"
            onClick={openEditor}
            style={{
              border: "none",
              borderRadius: 18,
              padding:
                "14px 20px",
              background:
                "#456C57",
              color: "white",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              boxShadow:
                "0 12px 28px rgba(69,108,87,.2)",
            }}
          >
            <Plus size={18} />

            New Album
          </button>
        </header>

        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              background:
                "#FFF1F1",
              color: "#A33A3A",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* ALBUM LIST */}

        {loading ? (
          <section
            style={{
              background: "white",
              borderRadius: 28,
              padding: 50,
              textAlign: "center",
              boxShadow:
                "0 18px 45px rgba(0,0,0,.06)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#7A887C",
              }}
            >
              Loading albums...
            </p>
          </section>
        ) : albums.length === 0 ? (
          <section
            style={{
              background: "white",
              borderRadius: 28,
              padding: 70,
              textAlign: "center",
              boxShadow:
                "0 18px 45px rgba(0,0,0,.06)",
            }}
          >
            <ImagePlus
              size={64}
              strokeWidth={1.5}
              color="#456C57"
            />

            <h2
              style={{
                marginTop: 24,
                marginBottom: 8,
                color: "#456C57",
                fontFamily:
                  "var(--font-serif)",
              }}
            >
              No memories yet
            </h2>

            <p
              style={{
                margin: 0,
                color: "#7A887C",
              }}
            >
              Create your first album
              to start building your
              memories library.
            </p>
          </section>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(280px,1fr))",
              gap: 20,
            }}
          >
            {albums.map((album) => (
              <article
                key={album.id}
                style={{
                  background: "white",
                  borderRadius: 26,
                  overflow: "hidden",
                  boxShadow:
                    "0 18px 45px rgba(0,0,0,.06)",
                }}
              >
                {/* COVER */}

                <div
                  style={{
                    height: 210,
                    background:
                      "linear-gradient(135deg,#E7EFE8,#DDE8DE)",
                    position:
                      "relative",
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    overflow: "hidden",
                  }}
                >
                  {album.coverFileId ? (
  <img
    src={`/api/memories/files/${album.coverFileId}`}
    alt={album.title}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
) : album.coverUrl ? (
  <img
    src={album.coverUrl}
    alt={album.title}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
) : (
  <ImagePlus
    size={48}
    strokeWidth={1.5}
    color="#456C57"
  />
)}
                </div>

                {/* INFO */}

                <div
                  style={{
                    padding: 22,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 23,
                      color: "#456C57",
                      fontFamily:
                        "var(--font-serif)",
                    }}
                  >
                    {album.title}
                  </h2>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection:
                        "column",
                      gap: 7,
                      color:
                        "#7A887C",
                      fontSize: 14,
                    }}
                  >
                    {album.date && (
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 7,
                        }}
                      >
                        <CalendarDays
                          size={15}
                        />

                        {album.date}
                      </div>
                    )}

                    {album.location && (
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: 7,
                        }}
                      >
                        <MapPin
                          size={15}
                        />

                        {album.location}
                      </div>
                    )}
                  </div>

                  {album.story && (
                    <p
                      style={{
                        marginTop: 16,
                        marginBottom: 0,
                        color: "#68746B",
                        lineHeight: 1.6,
                        display:
                          "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient:
                          "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {album.story}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "flex-end",
                      marginTop: 20,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAlbum(
                          album
                        )
                      }
                      style={{
                        border:
                          "1px solid rgba(170,50,50,.15)",
                        background:
                          "#FFF7F7",
                        color:
                          "#A33A3A",
                        borderRadius: 14,
                        padding:
                          "10px 14px",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: 7,
                        cursor:
                          "pointer",
                        fontWeight: 600,
                      }}
                    >
                      <Trash2
                        size={16}
                      />

                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* EDITOR */}

        {showEditor && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              background:
                "rgba(18,24,18,.35)",
              backdropFilter:
                "blur(18px)",
              WebkitBackdropFilter:
                "blur(18px)",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              padding: 24,
            }}
          >
            <div
              style={{
                width:
                  "min(720px, 100%)",
                maxHeight:
                  "90vh",
                overflowY:
                  "auto",
                background:
                  "#FFFDFB",
                borderRadius: 30,
                padding: 32,
                boxShadow:
                  "0 40px 100px rgba(0,0,0,.25)",
              }}
            >
              {/* EDITOR HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom: 28,
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        "#456C57",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Memory Library
                  </div>

                  <h2
                    style={{
                      margin:
                        "6px 0 0",
                      fontSize: 34,
                      color:
                        "#456C57",
                      fontFamily:
                        "var(--font-serif)",
                    }}
                  >
                    New Album
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius:
                      "50%",
                    border: "none",
                    background:
                      "#EFF4EF",
                    cursor:
                      saving
                        ? "default"
                        : "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <X size={19} />
                </button>
              </div>

              <form
                onSubmit={
                  handleCreateAlbum
                }
              >
                {/* TITLE */}

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      20,
                  }}
                >
                  <span
                    style={{
                      display:
                        "block",
                      marginBottom:
                        8,
                      fontWeight:
                        700,
                      color:
                        "#456C57",
                    }}
                  >
                    Album Title *
                  </span>

                  <input
                    value={
                      form.title
                    }
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Our First Trip"
                    style={inputStyle}
                  />
                </label>

                {/* DATE */}

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      20,
                  }}
                >
                  <span
                    style={labelStyle}
                  >
                    Date
                  </span>

                  <input
                    type="date"
                    value={
                      form.date
                    }
                    onChange={(event) =>
                      updateField(
                        "date",
                        event.target
                          .value
                      )
                    }
                    style={inputStyle}
                  />
                </label>

                {/* LOCATION */}

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      20,
                  }}
                >
                  <span
                    style={labelStyle}
                  >
                    Location
                  </span>

                  <input
                    value={
                      form.location
                    }
                    onChange={(event) =>
                      updateField(
                        "location",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Tagaytay"
                    style={inputStyle}
                  />
                </label>

                {/* STORY */}

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      28,
                  }}
                >
                  <span
                    style={labelStyle}
                  >
                    Story
                  </span>

                  <textarea
                    value={
                      form.story
                    }
                    onChange={(event) =>
                      updateField(
                        "story",
                        event.target
                          .value
                      )
                    }
                    placeholder="Tell the story behind this memory..."
                    rows={6}
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                      fontFamily:
                        "inherit",
                    }}
                  />
                </label>

                {/* COVER */}

                <section
                  style={{
                    marginBottom: 28,
                  }}
                >
                  <div
                    style={{
                      ...labelStyle,
                      marginBottom: 10,
                    }}
                  >
                    Cover Image *
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
                      display: "none",
                    }}
                  />

                  {coverPreview ? (
                    <div
                      style={{
                        position:
                          "relative",
                        height: 240,
                        borderRadius: 20,
                        overflow:
                          "hidden",
                        background:
                          "#EFF4EF",
                      }}
                    >
                      <img
                        src={
                          coverPreview
                        }
                        alt="Cover preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (
                            coverPreview
                          ) {
                            URL.revokeObjectURL(
                              coverPreview
                            );
                          }

                          setCoverFile(
                            null
                          );
                          setCoverPreview(
                            ""
                          );

                          if (
                            coverInputRef.current
                          ) {
                            coverInputRef.current.value =
                              "";
                          }
                        }}
                        style={{
                          position:
                            "absolute",
                          top: 12,
                          right: 12,
                          width: 40,
                          height: 40,
                          borderRadius:
                            "50%",
                          border: "none",
                          background:
                            "rgba(255,255,255,.9)",
                          cursor:
                            "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        coverInputRef.current?.click()
                      }
                      style={{
                        width: "100%",
                        minHeight: 170,
                        borderRadius: 20,
                        border:
                          "2px dashed rgba(69,108,87,.22)",
                        background:
                          "#F7FAF7",
                        color:
                          "#456C57",
                        cursor:
                          "pointer",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: 10,
                      }}
                    >
                      <ImagePlus
                        size={34}
                        strokeWidth={1.5}
                      />

                      <strong>
                        Choose Cover Image
                      </strong>

                      <span
                        style={{
                          fontSize: 13,
                          color:
                            "#7A887C",
                        }}
                      >
                        JPG, PNG, WEBP
                      </span>
                    </button>
                  )}
                </section>

                {/* MEDIA */}

                <section
                  style={{
                    marginBottom: 30,
                  }}
                >
                  <div
                    style={{
                      ...labelStyle,
                      marginBottom: 10,
                    }}
                  >
                    Album Media
                  </div>

                  <input
                    ref={
                      mediaInputRef
                    }
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={
                      handleMediaChange
                    }
                    style={{
                      display: "none",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      mediaInputRef.current?.click()
                    }
                    style={{
                      width: "100%",
                      minHeight: 120,
                      borderRadius: 20,
                      border:
                        "2px dashed rgba(69,108,87,.22)",
                      background:
                        "#F7FAF7",
                      color:
                        "#456C57",
                      cursor:
                        "pointer",
                      display:
                        "flex",
                      flexDirection:
                        "column",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: 9,
                    }}
                  >
                    <Upload
                      size={30}
                      strokeWidth={1.5}
                    />

                    <strong>
                      Add Photos & Videos
                    </strong>

                    <span
                      style={{
                        fontSize: 13,
                        color:
                          "#7A887C",
                      }}
                    >
                      You can select multiple
                      files
                    </span>
                  </button>

                  {mediaFiles.length >
                    0 && (
                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill,minmax(120px,1fr))",
                        gap: 12,
                        marginTop: 16,
                      }}
                    >
                      {mediaFiles.map(
                        (media) => {
                          const isVideo =
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
                                  "1",
                                borderRadius:
                                  15,
                                overflow:
                                  "hidden",
                                background:
                                  "#EFF4EF",
                              }}
                            >
                              {isVideo ? (
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
                                <img
                                  src={
                                    media.previewUrl
                                  }
                                  alt={
                                    media.file
                                      .name
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    objectFit:
                                      "cover",
                                  }}
                                />
                              )}

                              {isVideo && (
                                <div
                                  style={{
                                    position:
                                      "absolute",
                                    left: 8,
                                    bottom: 8,
                                    width: 28,
                                    height: 28,
                                    borderRadius:
                                      "50%",
                                    background:
                                      "rgba(0,0,0,.55)",
                                    color:
                                      "white",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                  }}
                                >
                                  <Film
                                    size={
                                      14
                                    }
                                  />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  removeMediaFile(
                                    media.id
                                  )
                                }
                                style={{
                                  position:
                                    "absolute",
                                  top: 7,
                                  right: 7,
                                  width: 30,
                                  height: 30,
                                  borderRadius:
                                    "50%",
                                  border:
                                    "none",
                                  background:
                                    "rgba(255,255,255,.9)",
                                  cursor:
                                    "pointer",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                }}
                              >
                                <X
                                  size={
                                    15
                                  }
                                />
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </section>

                {/* STATUS */}

                {uploadStatus && (
                  <div
                    style={{
                      marginBottom: 18,
                      padding: 14,
                      borderRadius: 14,
                      background:
                        "#EFF4EF",
                      color:
                        "#456C57",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {uploadStatus}
                  </div>
                )}

                {/* ACTIONS */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={closeEditor}
                    disabled={saving}
                    style={{
                      border:
                        "1px solid rgba(69,108,87,.15)",
                      background:
                        "white",
                      color:
                        "#456C57",
                      borderRadius:
                        15,
                      padding:
                        "13px 20px",
                      cursor:
                        saving
                          ? "default"
                          : "pointer",
                      fontWeight:
                        700,
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      border:
                        "none",
                      background:
                        "#456C57",
                      color:
                        "white",
                      borderRadius:
                        15,
                      padding:
                        "13px 22px",
                      cursor:
                        saving
                          ? "default"
                          : "pointer",
                      fontWeight:
                        700,
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 8,
                      opacity:
                        saving
                          ? 0.7
                          : 1,
                    }}
                  >
                    <Save
                      size={17}
                    />

                    {saving
                      ? "Uploading..."
                      : "Save Album"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 8,
  fontWeight: 700,
  color: "#456C57",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "14px 16px",
  borderRadius: 15,
  border:
    "1px solid rgba(69,108,87,.16)",
  outline: "none",
  fontSize: 16,
  background: "white",
};