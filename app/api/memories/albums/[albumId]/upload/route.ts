import { NextResponse } from "next/server";

import {
  uploadFileToDrive,
} from "@/lib/google-drive";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      albumId: string;
    }>;
  }
) {
  try {
    const { albumId } =
      await context.params;

    const album =
      await getFirestoreAlbum(albumId);

    if (!album) {
      return NextResponse.json(
        {
          error: "Album not found.",
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
            "This album does not have a Google Drive folder.",
        },
        {
          status: 400,
        }
      );
    }

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
            "No file was provided.",
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
            "Upload type must be cover or media.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Upload the physical file to
     * Google Drive.
     */
    const uploaded =
      await uploadFileToDrive(
        file,
        album.driveFolderId
      );

    if (!uploaded.id) {
      throw new Error(
        "Google Drive upload completed but no file ID was returned."
      );
    }

    /*
     * ============================
     * COVER
     * ============================
     */

    if (type === "cover") {
      await updateFirestoreAlbum(
        albumId,
        {
          coverUrl:
            uploaded.webViewLink ??
            "",

          coverFileId:
            uploaded.id,
        }
      );
    }

    /*
     * ============================
     * MEDIA
     * ============================
     */

    else {
      const existingMedia =
        album.media ?? [];

      const existingFileIds =
        album.mediaFileIds ?? [];

      const existingMediaFiles =
        album.mediaFiles ?? [];

      await updateFirestoreAlbum(
        albumId,
        {
          /*
           * Keep the existing field for
           * backwards compatibility.
           */
          media: [
            ...existingMedia,
            uploaded.webViewLink ??
              uploaded.id,
          ],

          /*
           * Keep the simple ID list.
           */
          mediaFileIds: [
            ...existingFileIds,
            uploaded.id,
          ],

          /*
           * New structured metadata.
           *
           * This is what the public album
           * page will use to determine
           * photo vs video.
           */
          mediaFiles: [
            ...existingMediaFiles,
            {
              id: uploaded.id,
              name:
                uploaded.name ??
                file.name,
              mimeType:
                uploaded.mimeType ??
                file.type ??
                "application/octet-stream",
            },
          ],
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        file: {
          id: uploaded.id,

          name:
            uploaded.name ??
            file.name,

          mimeType:
            uploaded.mimeType ??
            file.type ??
            "application/octet-stream",

          webViewLink:
            uploaded.webViewLink ??
            null,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Google Drive upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload file.",
      },
      {
        status: 500,
      }
    );
  }
}