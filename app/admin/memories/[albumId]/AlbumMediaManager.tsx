"use client";

import {
  useRef,
  useState,
} from "react";

import {
  Film,
  ImagePlus,
  Trash2,
  Upload
} from "lucide-react";

import { useRouter } from "next/navigation";

interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
}

interface AlbumMediaManagerProps {
  albumId: string;
  coverFileId?: string;
  coverUrl?: string;
  albumTitle: string;
  mediaFiles: MediaFile[];
}

export default function AlbumMediaManager({
  albumId,
  coverFileId,
  coverUrl,
  albumTitle,
  mediaFiles,
}: AlbumMediaManagerProps) {
  const router = useRouter();

  const coverInputRef =
    useRef<HTMLInputElement | null>(null);

  const mediaInputRef =
    useRef<HTMLInputElement | null>(null);

  const [uploadingCover, setUploadingCover] =
    useState(false);

  const [uploadingMedia, setUploadingMedia] =
    useState(false);

  const [deletingFileId, setDeletingFileId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("");

  async function handleCoverUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "The album cover must be an image file."
      );
      return;
    }

    try {
      setUploadingCover(true);
      setError("");
      setStatus("Uploading new cover...");

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      formData.append(
        "type",
        "cover"
      );

      const response =
        await fetch(
          `/api/memories/albums/${encodeURIComponent(
            albumId
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
            "Failed to upload cover."
        );
      }

      setStatus(
        "Cover updated successfully."
      );

      router.refresh();

      window.setTimeout(() => {
        setStatus("");
      }, 1500);
    } catch (err) {
      console.error(
        "Cover upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload cover."
      );

      setStatus("");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleMediaUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files =
      Array.from(
        event.target.files ?? []
      );

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const invalidFile =
      files.find(
        (file) =>
          !file.type.startsWith(
            "image/"
          ) &&
          !file.type.startsWith(
            "video/"
          )
      );

    if (invalidFile) {
      setError(
        `"${invalidFile.name}" is not a supported image or video file.`
      );
      return;
    }

    try {
      setUploadingMedia(true);
      setError("");

      for (
        let index = 0;
        index < files.length;
        index++
      ) {
        const file = files[index];

        setStatus(
          `Uploading ${index + 1} of ${files.length}: ${file.name}`
        );

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "type",
          "media"
        );

        const response =
          await fetch(
            `/api/memories/albums/${encodeURIComponent(
              albumId
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
              `Failed to upload ${file.name}.`
          );
        }
      }

      setStatus(
        files.length === 1
          ? "Media uploaded successfully."
          : `${files.length} media files uploaded successfully.`
      );

      router.refresh();

      window.setTimeout(() => {
        setStatus("");
      }, 1500);
    } catch (err) {
      console.error(
        "Media upload error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload media."
      );

      setStatus("");
    } finally {
      setUploadingMedia(false);
    }
  }

  async function handleDeleteMedia(
    file: MediaFile
  ) {
    const confirmed =
      window.confirm(
        `Delete "${file.name}"?\n\nThis will permanently delete the file from Google Drive and remove it from this album.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingFileId(
        file.id
      );

      setError("");
      setStatus(
        `Deleting "${file.name}"...`
      );

      const response =
        await fetch(
          `/api/memories/albums/${encodeURIComponent(
            albumId
          )}/media/${encodeURIComponent(
            file.id
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

      setStatus(
        "Media deleted successfully."
      );

      router.refresh();

      window.setTimeout(() => {
        setStatus("");
      }, 1500);
    } catch (err) {
      console.error(
        "Delete media error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete media."
      );

      setStatus("");
    } finally {
      setDeletingFileId(null);
    }
  }

  return (
    <>
      {/* ===================================================== */}
      {/* COVER */}
      {/* ===================================================== */}

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
            marginBottom: 18,
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
            Album Cover
          </h2>

          <p
            style={{
              margin:
                "6px 0 0",
              color: "#82968D",
              fontSize: 13,
            }}
          >
            Change the image used as
            this album&apos;s cover.
          </p>
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{
            display: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            aspectRatio:
              "16 / 9",
            overflow: "hidden",
            borderRadius: 18,
            background:
              "#EEF4EF",
          }}
        >
          {coverFileId ? (
            <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/memories/files/${encodeURIComponent(
                coverFileId
              )}`}
              alt={albumTitle}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            </>
          ) : coverUrl ? (
            <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={albumTitle}
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            </>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              No cover image
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={uploadingCover}
          onClick={() =>
            coverInputRef.current?.click()
          }
          style={{
            width: "100%",
            marginTop: 14,
            border: "none",
            borderRadius: 14,
            background:
              uploadingCover
                ? "#A8BBAF"
                : "#47745F",
            color: "#FFFFFF",
            padding:
              "11px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor:
              uploadingCover
                ? "default"
                : "pointer",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            gap: 8,
          }}
        >
          <ImagePlus size={16} />

          {uploadingCover
            ? "Uploading..."
            : "Change Cover"}
        </button>
      </section>

      {/* ===================================================== */}
      {/* MEDIA */}
      {/* ===================================================== */}

      <section
        style={{
          marginTop: 20,
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
            display: "flex",
            alignItems:
              "flex-end",
            justifyContent:
              "space-between",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <div>
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
              Memories
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#82968D",
                fontSize: 13,
              }}
            >
              {mediaFiles.length}{" "}
              {mediaFiles.length === 1
                ? "file"
                : "files"}{" "}
              in this album.
            </p>
          </div>

          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaUpload}
            style={{
              display: "none",
            }}
          />

          <button
            type="button"
            disabled={uploadingMedia}
            onClick={() =>
              mediaInputRef.current?.click()
            }
            style={{
              flexShrink: 0,
              border: "none",
              borderRadius: 14,
              background:
                uploadingMedia
                  ? "#A8BBAF"
                  : "#47745F",
              color: "#FFFFFF",
              padding:
                "10px 15px",
              fontSize: 13,
              fontWeight: 700,
              cursor:
                uploadingMedia
                  ? "default"
                  : "pointer",
              display: "flex",
              alignItems:
                "center",
              gap: 7,
            }}
          >
            <Upload size={15} />

            {uploadingMedia
              ? "Uploading..."
              : "Add Media"}
          </button>
        </div>

        {/* STATUS / ERROR */}

        {(status || error) && (
          <div
            style={{
              marginBottom: 18,
              padding:
                "11px 14px",
              borderRadius: 13,
              background: error
                ? "#FFF3F2"
                : "#EFF6F1",
              color: error
                ? "#A33A3A"
                : "#47745F",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error || status}
          </div>
        )}

        {/* EMPTY */}

        {mediaFiles.length === 0 ? (
          <div
            style={{
              border:
                "2px dashed #D5E3DB",
              borderRadius: 18,
              background:
                "#FAFCFB",
              padding:
                "55px 20px",
              textAlign:
                "center",
            }}
          >
            <ImagePlus
              size={40}
              strokeWidth={1.4}
              color="#6D8B7C"
            />

            <p
              style={{
                margin:
                  "13px 0 0",
                color: "#5F7C6D",
                fontFamily:
                  "var(--font-serif)",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              No memories yet
            </p>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#91A39A",
                fontSize: 13,
              }}
            >
              Add photos and videos
              to this album.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 15,
            }}
          >
            {mediaFiles.map(
              (file) => {
                const isVideo =
                  file.mimeType.startsWith(
                    "video/"
                  );

                const isDeleting =
                  deletingFileId ===
                  file.id;

                return (
                  <article
                    key={file.id}
                    style={{
                      overflow:
                        "hidden",
                      border:
                        "1px solid #DCE8E1",
                      borderRadius: 18,
                      background:
                        "#FBFDFB",
                    }}
                  >
                    <div
                      style={{
                        position:
                          "relative",
                        aspectRatio:
                          "16 / 10",
                        overflow:
                          "hidden",
                        background:
                          "#EDF3EF",
                      }}
                    >
                      {isVideo ? (
                        <video
                          src={`/api/memories/files/${encodeURIComponent(
                            file.id
                          )}`}
                          controls
                          preload="metadata"
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                      ) : (
                        <>
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/memories/files/${encodeURIComponent(
                            file.id
                          )}`}
                          alt={
                            file.name
                          }
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                        </>
                      )}

                      {isVideo && (
                        <div
                          style={{
                            position:
                              "absolute",
                            left: 8,
                            top: 8,
                            width: 28,
                            height: 28,
                            borderRadius:
                              "50%",
                            background:
                              "rgba(0,0,0,.55)",
                            color:
                              "#FFFFFF",
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
                          <Film
                            size={14}
                          />
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: 14,
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                          color:
                            "#4D735F",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {file.name}
                      </p>

                      <p
                        style={{
                          margin:
                            "5px 0 0",
                          color:
                            "#8A9E94",
                          fontSize: 11,
                        }}
                      >
                        {file.mimeType}
                      </p>

                      <button
                        type="button"
                        disabled={
                          isDeleting ||
                          uploadingMedia ||
                          uploadingCover
                        }
                        onClick={() =>
                          handleDeleteMedia(
                            file
                          )
                        }
                        style={{
                          width:
                            "100%",
                          marginTop: 12,
                          border:
                            "1px solid rgba(170,50,50,.14)",
                          borderRadius:
                            12,
                          background:
                            isDeleting
                              ? "#F2EAEA"
                              : "#FFF7F7",
                          color:
                            "#A33A3A",
                          padding:
                            "9px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor:
                            isDeleting
                              ? "default"
                              : "pointer",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          gap: 6,
                        }}
                      >
                        <Trash2
                          size={14}
                        />

                        {isDeleting
                          ? "Deleting..."
                          : "Delete Media"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
}