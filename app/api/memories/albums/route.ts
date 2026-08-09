import { NextResponse } from "next/server";

import {
  addFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  getOrCreateAlbumFolder,
} from "@/lib/google-drive";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

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
          error:
            "Album title is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Create the Google Drive folder
     * for this album first.
     */
    const driveFolder =
      await getOrCreateAlbumFolder(
        title
      );

    /*
     * Create the Firestore album
     * using the Google Drive folder ID.
     *
     * File IDs are intentionally left
     * undefined because the cover and
     * media files are uploaded afterward.
     */
    const albumId =
      await addFirestoreAlbum({
        title,
        date,
        location,
        story,
        coverUrl: "",
        media: [],
        driveFolderId:
          driveFolder.id,
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
          driveFolderId:
            driveFolder.id,
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