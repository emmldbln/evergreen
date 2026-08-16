import { NextResponse } from "next/server";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  uploadFileToDrive,
  deleteDriveFile,
} from "@/lib/google-drive";

import {
  remuxMovToMp4,
} from "@/lib/video-conversion";

interface RouteContext {
  params: Promise<{
    albumId: string;
  }>;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { albumId } =
      await context.params;

    /*
     * =====================================================
     * ALBUM
     * =====================================================
     */

    const album =
      await getFirestoreAlbum(
        albumId
      );

    if (!album) {
      return NextResponse.json(
        {
          error:
            "Album not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!album.driveFolderId) {
      return NextResponse.json(
        {
          error:
            "Album does not have a Google Drive folder.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * FORM DATA
     * =====================================================
     */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const type =
      formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No valid file was provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      type !== "cover" &&
      type !== "media"
    ) {
      return NextResponse.json(
        {
          error:
            'Upload type must be either "cover" or "media".',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * UPLOAD DEBUG INFORMATION
     * =====================================================
     *
     * This intentionally runs BEFORE MOV detection.
     *
     * We need to confirm exactly what the browser /
     * FormData is sending to the server.
     */

    const isMovByName =
      /\.mov$/i.test(
        file.name
      );

    const isQuickTimeMime =
      file.type ===
      "video/quicktime";

    const isVideo =
      file.type.startsWith(
        "video/"
      );

    const isImage =
      file.type.startsWith(
        "image/"
      );

    console.log(
      "[Evergreen] Upload received:",
      {
        name:
          file.name,

        type:
          file.type,

        size:
          file.size,

        uploadType:
          type,

        isImage,

        isVideo,

        isMovByName,

        isQuickTimeMime,

        isMov:
          isMovByName ||
          isQuickTimeMime,
      }
    );

    /*
     * =====================================================
     * FILE VALIDATION
     * =====================================================
     */

    if (type === "cover") {
      if (!isImage) {
        return NextResponse.json(
          {
            error:
              "Album covers must be image files.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (type === "media") {
      if (
        !isImage &&
        !isVideo
      ) {
        return NextResponse.json(
          {
            error:
              "Album media must be an image or video.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /*
     * =====================================================
     * PREPARE FILE
     * =====================================================
     *
     * Images:
     *   Uploaded untouched.
     *
     * MP4:
     *   Uploaded untouched.
     *
     * MOV:
     *   Sent through remuxMovToMp4().
     *
     * The conversion helper is responsible for:
     *
     *   Video -> copied
     *   Audio -> re-encoded
     *
     * so we can preserve the original video while
     * attempting to eliminate the browser audio issue.
     */

    let fileToUpload =
      file;

    const isMov =
      isMovByName ||
      isQuickTimeMime;

    /*
     * =====================================================
     * MOV CONVERSION
     * =====================================================
     */

    if (
      type === "media" &&
      isMov
    ) {
      console.log(
        "[Evergreen] ========================================"
      );

      console.log(
        "[Evergreen] MOV DETECTED"
      );

      console.log(
        "[Evergreen] Starting video conversion..."
      );

      console.log(
        "[Evergreen] Source file:",
        {
          name:
            file.name,

          type:
            file.type,

          size:
            file.size,
        }
      );

      console.log(
        "[Evergreen] Calling remuxMovToMp4()..."
      );

      try {
        fileToUpload =
          await remuxMovToMp4(
            file
          );
      } catch (error) {
        console.error(
          "[Evergreen] MOV conversion FAILED:",
          error
        );

        throw error;
      }

      console.log(
        "[Evergreen] remuxMovToMp4() returned successfully."
      );

      console.log(
        "[Evergreen] Converted file:",
        {
          name:
            fileToUpload.name,

          type:
            fileToUpload.type,

          originalSize:
            file.size,

          convertedSize:
            fileToUpload.size,
        }
      );

      console.log(
        "[Evergreen] MOV conversion complete."
      );

      console.log(
        "[Evergreen] ========================================"
      );
    } else {
      console.log(
        "[Evergreen] No MOV conversion required:",
        {
          uploadType:
            type,

          name:
            file.name,

          type:
            file.type,

          isMov,
        }
      );
    }

    /*
     * =====================================================
     * GOOGLE DRIVE UPLOAD
     * =====================================================
     */

    console.log(
      "[Evergreen] Uploading file to Google Drive:",
      {
        name:
          fileToUpload.name,

        type:
          fileToUpload.type,

        size:
          fileToUpload.size,
      }
    );

    const uploadedFile =
      await uploadFileToDrive(
        fileToUpload,
        album.driveFolderId
      );

    console.log(
      "[Evergreen] Google Drive upload complete:",
      {
        id:
          uploadedFile.id,

        name:
          uploadedFile.name,

        mimeType:
          uploadedFile.mimeType,
      }
    );

    /*
     * =====================================================
     * COVER
     * =====================================================
     */

    if (
      type === "cover"
    ) {
      /*
       * Delete the previous cover only after
       * the replacement has successfully uploaded.
       */

      if (
        album.coverFileId &&
        album.coverFileId !==
          uploadedFile.id
      ) {
        try {
          await deleteDriveFile(
            album.coverFileId
          );
        } catch (error) {
          console.error(
            "[Evergreen] Failed to delete previous cover:",
            error
          );
        }
      }

      await updateFirestoreAlbum(
        albumId,
        {
          coverFileId:
            uploadedFile.id,

          coverUrl:
            uploadedFile.webViewLink ??
            "",
        }
      );
    } else {
      /*
       * ===================================================
       * MEDIA
       * ===================================================
       */

      const mediaFileIds =
        album.mediaFileIds ??
        [];

      const mediaFiles =
        album.mediaFiles ??
        [];

      const media =
        album.media ??
        [];

      await updateFirestoreAlbum(
        albumId,
        {
          mediaFileIds: [
            ...mediaFileIds,
            uploadedFile.id,
          ],

          mediaFiles: [
            ...mediaFiles,
            {
              id:
                uploadedFile.id,

              name:
                uploadedFile.name,

              mimeType:
                uploadedFile.mimeType,
            },
          ],

          media: [
            ...media,

            uploadedFile.webViewLink ??
              "",
          ],
        }
      );
    }

    /*
     * =====================================================
     * RETURN UPDATED ALBUM
     * =====================================================
     */

    const updatedAlbum =
      await getFirestoreAlbum(
        albumId
      );

    return NextResponse.json(
      {
        success:
          true,

        type,

        file: {
          id:
            uploadedFile.id,

          name:
            uploadedFile.name,

          mimeType:
            uploadedFile.mimeType,
        },

        album:
          updatedAlbum,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "[Evergreen] Upload memory file error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload memory file.",
      },
      {
        status: 500,
      }
    );
  }
}