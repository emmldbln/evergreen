import { NextResponse } from "next/server";

import {
  getFirestoreAlbum,
  getFirestoreAlbums,
  updateFirestoreAlbum,
  deleteFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  deleteDriveFolder,
  driveItemExists,
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
     * =================================================
     * GOOGLE DRIVE RENAME
     * =================================================
     *
     * The Drive folder is identified by its
     * stored ID, NOT by its album name.
     *
     * This means:
     *
     * Album A: Test
     * Album B: Test
     *
     * can safely exist as separate folders.
     */
    if (
      title !== album.title &&
      album.driveFolderId
    ) {
      const driveExists =
        await driveItemExists(
          album.driveFolderId
        );

      /*
       * If the folder still exists,
       * synchronize its name.
       *
       * If the folder was already deleted,
       * don't fail the entire Firestore update.
       */
      if (driveExists) {
        await updateDriveFileName(
          album.driveFolderId,
          title
        );
      } else {
        console.warn(
          `Drive folder ${album.driveFolderId} no longer exists. Updating Firestore album anyway.`
        );
      }
    }

    /*
     * =================================================
     * FIRESTORE UPDATE
     * =================================================
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

    /*
     * =================================================
     * FIND ALBUM
     * =================================================
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

    const driveFolderId =
      album.driveFolderId;

    let driveFolderIsShared = false;

    /*
     * =================================================
     * PROTECT SHARED DRIVE FOLDERS
     * =================================================
     *
     * This is especially important for albums
     * created before the folder-reuse bug was fixed.
     *
     * Example:
     *
     * Album A ──┐
     *           ├── Drive Folder 123
     * Album B ──┘
     *
     * Deleting Album A must NOT delete Folder 123,
     * because Album B still uses it.
     */

    if (driveFolderId) {
      const allAlbums =
        await getFirestoreAlbums();

      driveFolderIsShared =
        allAlbums.some(
          (otherAlbum) =>
            otherAlbum.id !== albumId &&
            otherAlbum.driveFolderId ===
              driveFolderId
        );
    }

    /*
     * =================================================
     * DELETE GOOGLE DRIVE FOLDER
     * =================================================
     */

    if (driveFolderId) {
      if (driveFolderIsShared) {
        /*
         * Another album still references
         * this Drive folder.
         *
         * NEVER delete the folder.
         */
        console.warn(
          `Skipping Drive deletion for album ${albumId}. Drive folder ${driveFolderId} is shared by another album.`
        );
      } else {
        /*
         * The Drive folder may already have been
         * deleted by the old buggy behavior.
         *
         * In that case, simply continue with
         * Firestore cleanup.
         */
        const driveExists =
          await driveItemExists(
            driveFolderId
          );

        if (driveExists) {
          await deleteDriveFolder(
            driveFolderId
          );
        } else {
          console.warn(
            `Drive folder ${driveFolderId} does not exist. Continuing with Firestore deletion.`
          );
        }
      }
    }

    /*
     * =================================================
     * DELETE FIRESTORE ALBUM
     * =================================================
     */

    await deleteFirestoreAlbum(
      albumId
    );

    return NextResponse.json(
      {
        success: true,

        deletedAlbumId:
          albumId,

        driveFolderDeleted:
          Boolean(
            driveFolderId &&
              !driveFolderIsShared
          ),

        driveFolderWasShared:
          driveFolderIsShared,
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