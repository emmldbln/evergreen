import { NextResponse } from "next/server";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  deleteDriveFile,
} from "@/lib/google-drive";

interface RouteContext {
  params: Promise<{
    albumId: string;
    fileId: string;
  }>;
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const {
      albumId,
      fileId,
    } = await context.params;

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

    const mediaFileIds =
      album.mediaFileIds ?? [];

    const mediaFiles =
      album.mediaFiles ?? [];

    const media =
      album.media ?? [];

    /**
     * Check that the requested
     * file actually belongs to
     * this album.
     */
    const mediaIndex =
      mediaFileIds.indexOf(
        fileId
      );

    if (mediaIndex === -1) {
      return NextResponse.json(
        {
          error:
            "Media file does not belong to this album.",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * Do not allow the cover to be
     * accidentally deleted through the
     * normal media endpoint.
     *
     * The cover should eventually have
     * its own CMS action.
     */
    if (
      album.coverFileId ===
      fileId
    ) {
      return NextResponse.json(
        {
          error:
            "This file is currently the album cover. Change the cover before deleting this media.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Delete the physical file
     * from Google Drive.
     */
    await deleteDriveFile(
      fileId
    );

    /**
     * Remove the file ID.
     */
    const updatedMediaFileIds =
      mediaFileIds.filter(
        (id) =>
          id !== fileId
      );

    /**
     * Remove structured metadata.
     */
    const updatedMediaFiles =
      mediaFiles.filter(
        (file) =>
          file.id !== fileId
      );

    /**
     * Keep legacy media URLs
     * synchronized by index.
     */
    const updatedMedia =
      media.filter(
        (_url, index) =>
          index !== mediaIndex
      );

    /**
     * Update Firestore.
     *
     * The public Memories page will
     * read these updated values on
     * the next request.
     */
    await updateFirestoreAlbum(
      albumId,
      {
        media:
          updatedMedia,

        mediaFileIds:
          updatedMediaFileIds,

        mediaFiles:
          updatedMediaFiles,
      }
    );

    return NextResponse.json(
      {
        success: true,

        deletedFileId:
          fileId,

        remainingMedia:
          updatedMediaFileIds.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete media.",
      },
      {
        status: 500,
      }
    );
  }
}