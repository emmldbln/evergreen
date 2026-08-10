import { NextResponse } from "next/server";

import {
  getFirestoreAlbum,
  updateFirestoreAlbum,
  deleteFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  deleteDriveFolder,
  updateDriveFileName,
} from "@/lib/google-drive";

interface RouteContext {
  params: Promise<{
    albumId: string;
  }>;
}

/*
 * =====================================================
 * UPDATE ALBUM DETAILS
 * =====================================================
 */

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { albumId } =
      await context.params;

    if (!albumId) {
      return NextResponse.json(
        {
          error:
            "Album ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    const body =
      await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : album.title;

    const date =
      typeof body.date === "string"
        ? body.date.trim()
        : album.date;

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : album.location;

    const story =
      typeof body.story === "string"
        ? body.story.trim()
        : album.story;

    if (!title) {
      return NextResponse.json(
        {
          error:
            "Album title is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * If the album title changes,
     * keep the Google Drive folder
     * name synchronized with it.
     *
     * The Drive folder ID is already
     * stored in Firestore, so we do
     * not need to search for it.
     */
    if (
      title !== album.title &&
      album.driveFolderId
    ) {
      await updateDriveFileName(
        album.driveFolderId,
        title
      );
    }

    /*
     * Update the Firestore album.
     *
     * The public Memories pages read
     * this same Firestore document, so
     * the updated details will be used
     * by the public site automatically.
     */
    await updateFirestoreAlbum(
      albumId,
      {
        title,
        date,
        location,
        story,
      }
    );

    const updatedAlbum =
      await getFirestoreAlbum(
        albumId
      );

    return NextResponse.json(
      {
        success: true,
        album: updatedAlbum,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update album error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update album.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * =====================================================
 * DELETE ALBUM
 * =====================================================
 */

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { albumId } =
      await context.params;

    if (!albumId) {
      return NextResponse.json(
        {
          error:
            "Album ID is required.",
        },
        {
          status: 400,
        }
      );
    }

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

    /*
     * Delete the physical Google Drive
     * album folder and everything inside it.
     *
     * We do this before deleting the
     * Firestore document so that the
     * Firestore record is not removed
     * while its physical files remain.
     */
    if (album.driveFolderId) {
      await deleteDriveFolder(
        album.driveFolderId
      );
    }

    /*
     * Remove the album document from
     * Firestore after its Drive contents
     * have been successfully deleted.
     */
    await deleteFirestoreAlbum(
      albumId
    );

    return NextResponse.json(
      {
        success: true,
        deletedAlbumId:
          albumId,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete album error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete album.",
      },
      {
        status: 500,
      }
    );
  }
}