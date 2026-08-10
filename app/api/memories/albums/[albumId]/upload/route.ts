import { NextResponse } from "next/server";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  uploadFileToDrive,
  deleteDriveFile,
} from "@/lib/google-drive";

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
            "Album does not have a Google Drive folder.",
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
     * Cover uploads must be images.
     */
    if (
      type === "cover" &&
      !file.type.startsWith("image/")
    ) {
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

    /*
     * Media uploads must be
     * images or videos.
     */
    if (
      type === "media" &&
      !file.type.startsWith("image/") &&
      !file.type.startsWith("video/")
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

    /*
     * Upload physical file to the
     * album's Google Drive folder.
     */
    const uploadedFile =
      await uploadFileToDrive(
        file,
        album.driveFolderId
      );

    if (type === "cover") {
      /*
       * If an old cover exists,
       * remove it from Drive.
       *
       * We intentionally do this AFTER
       * the new file has uploaded so
       * a failed upload doesn't destroy
       * the existing cover.
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
            "Failed to delete previous cover:",
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
       * Add the new media file.
       */
      const mediaFileIds =
        album.mediaFileIds ?? [];

      const mediaFiles =
        album.mediaFiles ?? [];

      const media =
        album.media ?? [];

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
              id: uploadedFile.id,
              name: uploadedFile.name,
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

    const updatedAlbum =
      await getFirestoreAlbum(
        albumId
      );

    return NextResponse.json(
      {
        success: true,
        type,
        file: {
          id: uploadedFile.id,
          name: uploadedFile.name,
          mimeType:
            uploadedFile.mimeType,
        },
        album: updatedAlbum,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Upload memory file error:",
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