import { NextResponse } from "next/server";

import {
  addFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  createAlbumFolder,
  deleteDriveFolder,
} from "@/lib/google-drive";

export async function POST(
  request: Request
) {
  let driveFolderId: string | null = null;

  try {
    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const date =
      typeof body.date === "string"
        ? body.date.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const story =
      typeof body.story === "string"
        ? body.story.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
          error: "Album title is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Always create a NEW Google Drive folder
     * for every new album.
     *
     * We intentionally do NOT search for an
     * existing folder with the same name.
     */
    const driveFolder =
      await createAlbumFolder(title);

    driveFolderId = driveFolder.id;

    /*
     * Create the Firestore album using the
     * newly-created, unique Drive folder.
     */
    const albumId =
      await addFirestoreAlbum({
        title,
        date,
        location,
        story,
        coverUrl: "",
        media: [],
        driveFolderId: driveFolder.id,
      });

    return NextResponse.json(
      {
        success: true,

        album: {
          id: albumId,
          title,
          date,
          location,
          story,
          coverUrl: "",
          media: [],
          driveFolderId: driveFolder.id,
        },

        driveFolder,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Create album error:",
      error
    );

    /*
     * If Firestore creation failed AFTER
     * the Drive folder was created, clean up
     * that newly-created folder.
     */
    if (driveFolderId) {
      try {
        await deleteDriveFolder(
          driveFolderId
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up orphaned Drive folder:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create album.",
      },
      {
        status: 500,
      }
    );
  }
}