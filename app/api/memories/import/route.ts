import { NextResponse } from "next/server";

import {
  getFirestoreAlbums,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";

import {
  getGoogleDriveClient,
} from "@/lib/google-drive";

const FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

/*
 * ONE-TIME MIGRATION
 *
 * These are the exact existing Google Drive
 * folders that need to be connected to Evergreen.
 *
 * "Test" is intentionally excluded.
 */
const MIGRATION_ALBUMS = [
  "first-ever-concert-date",
  "first-ever-date",
  "mall-dates",
  "staycations",
  "video-calls",
] as const;

function isSupportedMedia(file: {
  mimeType?: string | null;
}) {
  return Boolean(
    file.mimeType?.startsWith("image/") ||
      file.mimeType?.startsWith("video/")
  );
}

function isCoverFile(file: {
  name?: string | null;
}) {
  const name =
    file.name?.trim().toLowerCase();

  return (
    name === "cover.jpg" ||
    name === "cover.jpeg" ||
    name === "cover.png" ||
    name === "cover.webp"
  );
}

export async function POST() {
  try {
    const drive =
      await getGoogleDriveClient();

    const firestoreAlbums =
      await getFirestoreAlbums();

    const results: Array<{
      title: string;
      status:
        | "linked"
        | "already-linked"
        | "missing-drive-folder"
        | "missing-firestore-album"
        | "no-media"
        | "error";
      mediaCount: number;
      driveFolderId?: string;
      firestoreAlbumId?: string;
      message?: string;
    }> = [];

    /*
     * ------------------------------------------------------
     * PROCESS ONLY THE FIVE KNOWN ALBUMS
     * ------------------------------------------------------
     */

    for (const albumTitle of MIGRATION_ALBUMS) {
      try {
        /*
         * --------------------------------------------------
         * 1. FIND THE EXACT DRIVE FOLDER
         *
         * IMPORTANT:
         *
         * We intentionally DO NOT restrict this query
         * to Evergreen/Memories.
         *
         * This avoids the parent-folder ID problem that
         * caused all five albums to appear missing.
         * --------------------------------------------------
         */

        const folderResponse =
          await drive.files.list({
            q: [
              `name = '${albumTitle.replace(
                /'/g,
                "\\'"
              )}'`,
              `mimeType = '${FOLDER_MIME_TYPE}'`,
              "trashed = false",
            ].join(" and "),

            spaces: "drive",

            fields:
              "files(id,name,mimeType,parents,webViewLink)",

            pageSize: 20,
          });

        const matchingFolders =
          (
            folderResponse.data.files ??
            []
          ).filter(
            (folder) =>
              folder.id &&
              folder.name?.trim() ===
                albumTitle
          );

        /*
         * If Google Drive cannot find the exact folder,
         * report that clearly.
         */
        if (
          matchingFolders.length ===
          0
        ) {
          results.push({
            title: albumTitle,
            status:
              "missing-drive-folder",
            mediaCount: 0,
            message:
              "No Google Drive folder with this exact name was found.",
          });

          continue;
        }

        /*
         * We expect exactly one matching folder.
         *
         * If there are duplicates, use the first one
         * for this one-time migration, but report it.
         */
        const driveFolder =
          matchingFolders[0];

        const driveFolderId =
          driveFolder.id!;

        /*
         * --------------------------------------------------
         * 2. FIND EXISTING FIRESTORE ALBUM
         * --------------------------------------------------
         *
         * Match ONLY by exact album title.
         *
         * Date, location, and story are deliberately ignored.
         */

        const firestoreAlbum =
          firestoreAlbums.find(
            (album) =>
              album.title
                .trim()
                .toLowerCase() ===
              albumTitle
                .trim()
                .toLowerCase()
          );

        if (!firestoreAlbum) {
          results.push({
            title: albumTitle,
            status:
              "missing-firestore-album",
            mediaCount: 0,
            driveFolderId,
            message:
              "The Drive folder was found, but no existing Firestore album has this title.",
          });

          continue;
        }

        /*
         * --------------------------------------------------
         * 3. GET MEDIA FROM THE EXACT DRIVE FOLDER
         * --------------------------------------------------
         */

        const filesResponse =
          await drive.files.list({
            q: [
              `'${driveFolderId}' in parents`,
              "trashed = false",
            ].join(" and "),

            spaces: "drive",

            orderBy:
              "name_natural",

            fields:
              "files(id,name,mimeType,createdTime)",

            pageSize: 1000,
          });

        const files =
          (
            filesResponse.data.files ??
            []
          ).filter(
            (file) =>
              Boolean(file.id) &&
              isSupportedMedia(file)
          );

        /*
         * --------------------------------------------------
         * 4. FIND COVER
         * --------------------------------------------------
         *
         * Priority:
         *
         * cover.jpg
         * cover.jpeg
         * cover.png
         * cover.webp
         *
         * Otherwise the first image becomes
         * the cover.
         */

        const explicitCover =
          files.find(isCoverFile);

        const automaticCover =
          files.find((file) =>
            file.mimeType?.startsWith(
              "image/"
            )
          );

        const cover =
          explicitCover ??
          automaticCover;

        /*
         * If an explicit cover file exists,
         * don't include it in the normal media list.
         *
         * If the first image is being used as
         * the automatic cover, keep it in media.
         */

        const media =
          explicitCover
            ? files.filter(
                (file) =>
                  file.id !==
                  explicitCover.id
              )
            : files;

        const mediaFileIds =
          media
            .map((file) => file.id)
            .filter(
              (
                id
              ): id is string =>
                typeof id ===
                "string"
            );

        const mediaFiles =
          media
            .filter(
              (
                file
              ): file is typeof file & {
                id: string;
              } =>
                typeof file.id ===
                "string"
            )
            .map((file) => ({
              id: file.id,
              name:
                file.name ??
                file.id,
              mimeType:
                file.mimeType ??
                "application/octet-stream",
            }));

        /*
         * --------------------------------------------------
         * 5. CHECK FOR MEDIA
         * --------------------------------------------------
         */

        if (
          mediaFileIds.length ===
          0
        ) {
          results.push({
            title: albumTitle,
            status: "no-media",
            mediaCount: 0,
            driveFolderId,
            firestoreAlbumId:
              firestoreAlbum.id,
            message:
              "The exact Drive folder exists, but it contains no supported image/video files.",
          });

          continue;
        }

        /*
         * --------------------------------------------------
         * 6. PREPARE EVERGREEN MEDIA URLS
         * --------------------------------------------------
         */

        const mediaUrls =
          mediaFileIds.map(
            (id) =>
              `/api/memories/files/${encodeURIComponent(
                id
              )}`
          );

        /*
         * --------------------------------------------------
         * 7. CHECK IF ALREADY CONNECTED
         * --------------------------------------------------
         */

        if (
          firestoreAlbum.driveFolderId ===
            driveFolderId &&
          firestoreAlbum.mediaFileIds
            ?.length ===
            mediaFileIds.length
        ) {
          results.push({
            title: albumTitle,
            status:
              "already-linked",
            mediaCount:
              mediaFileIds.length,
            driveFolderId,
            firestoreAlbumId:
              firestoreAlbum.id,
            message:
              "This album is already linked to this Drive folder.",
          });

          continue;
        }

        /*
         * --------------------------------------------------
         * 8. UPDATE FIRESTORE
         * --------------------------------------------------
         *
         * We intentionally DO NOT modify:
         *
         * date
         * location
         * story
         *
         * Those remain untouched.
         */

        const update: Parameters<
          typeof updateFirestoreAlbum
        >[1] = {
          driveFolderId,

          coverUrl: "",

          media: mediaUrls,

          mediaFileIds,

          mediaFiles,
        };

        if (cover?.id) {
          update.coverFileId =
            cover.id;
        }

        await updateFirestoreAlbum(
          firestoreAlbum.id,
          update
        );

        results.push({
          title: albumTitle,
          status: "linked",
          mediaCount:
            mediaFileIds.length,
          driveFolderId,
          firestoreAlbumId:
            firestoreAlbum.id,
          message:
            "Successfully linked the existing Firestore album to the exact Google Drive folder.",
        });
      } catch (albumError) {
        console.error(
          `Migration failed for "${albumTitle}":`,
          albumError
        );

        results.push({
          title: albumTitle,
          status: "error",
          mediaCount: 0,
          message:
            albumError instanceof Error
              ? albumError.message
              : "Unknown migration error.",
        });
      }
    }

    /*
     * ------------------------------------------------------
     * SUMMARY
     * ------------------------------------------------------
     */

    const linkedCount =
      results.filter(
        (result) =>
          result.status ===
            "linked" ||
          result.status ===
            "already-linked"
      ).length;

    const failedCount =
      results.length -
      linkedCount;

    return NextResponse.json({
      success:
        failedCount === 0,

      migrationType:
        "explicit-title-migration",

      requestedAlbums:
        MIGRATION_ALBUMS,

      linkedCount,

      failedCount,

      results,
    });
  } catch (error) {
    console.error(
      "Memory migration error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to migrate memory albums.",
      },
      {
        status: 500,
      }
    );
  }
}