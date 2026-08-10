import { NextResponse } from "next/server";

import {
  addFirestoreAlbum,
  getFirestoreAlbums,
  updateFirestoreAlbum,
} from "@/lib/firestore/memories";
import {
  getGoogleDriveClient,
  getOrCreateMemoriesFolder,
} from "@/lib/google-drive";

const FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

function isSupportedMedia(file: {
  mimeType?: string | null;
}) {
  return Boolean(
    file.mimeType?.startsWith("image/") ||
      file.mimeType?.startsWith("video/")
  );
}

export async function POST() {
  try {
    const drive =
      await getGoogleDriveClient();

    const memoriesFolder =
      await getOrCreateMemoriesFolder();

    const folderResponse =
      await drive.files.list({
        q: [
          `'${memoriesFolder.id}' in parents`,
          `mimeType = '${FOLDER_MIME_TYPE}'`,
          "trashed = false",
        ].join(" and "),
        spaces: "drive",
        orderBy: "name_natural",
        fields: "files(id,name,mimeType,createdTime)",
        pageSize: 100,
      });

    const driveFolders =
      (folderResponse.data.files ?? []).filter(
        (folder) => Boolean(folder.id && folder.name)
      );

    const firestoreAlbums =
      await getFirestoreAlbums();

    const results: Array<{
      title: string;
      status: "imported" | "linked" | "skipped";
      mediaCount: number;
    }> = [];

    for (const folder of driveFolders) {
      const folderId = folder.id;
      const title = folder.name ?? "Untitled Album";

      if (!folderId) continue;

      const filesResponse =
        await drive.files.list({
          q: [
            `'${folderId}' in parents`,
            "trashed = false",
          ].join(" and "),
          spaces: "drive",
          orderBy: "name_natural",
          fields: "files(id,name,mimeType,createdTime)",
          pageSize: 1000,
        });

      const files =
        (filesResponse.data.files ?? []).filter(
          (file) =>
            Boolean(file.id) &&
            isSupportedMedia(file)
        );

      const cover = files.find(
        (file) =>
          file.name?.trim().toLowerCase() ===
          "cover.jpg"
      );

      const media = files.filter(
        (file) => file.id !== cover?.id
      );

      const mediaFileIds = media
        .map((file) => file.id)
        .filter(
          (id): id is string =>
            typeof id === "string"
        );

      const mediaFiles = media
        .filter(
          (file): file is typeof file & {
            id: string;
          } => typeof file.id === "string"
        )
        .map((file) => ({
          id: file.id,
          name: file.name ?? file.id,
          mimeType:
            file.mimeType ??
            "application/octet-stream",
        }));

      const existingByFolder =
        firestoreAlbums.find(
          (album) =>
            album.driveFolderId === folderId
        );

      if (existingByFolder) {
        results.push({
          title,
          status: "skipped",
          mediaCount: mediaFileIds.length,
        });
        continue;
      }

      const existingByTitle =
        firestoreAlbums.find(
          (album) =>
            album.title.trim().toLowerCase() ===
            title.trim().toLowerCase()
        );

      if (existingByTitle) {
        const update: Parameters<
          typeof updateFirestoreAlbum
        >[1] = {
          driveFolderId: folderId,
          coverUrl: "",
          media: mediaFileIds.map(
            (id) =>
              `/api/memories/files/${encodeURIComponent(id)}`
          ),
          mediaFileIds,
          mediaFiles,
        };

        if (cover?.id) {
          update.coverFileId = cover.id;
        }

        await updateFirestoreAlbum(
          existingByTitle.id,
          update
        );

        results.push({
          title,
          status: "linked",
          mediaCount: mediaFileIds.length,
        });
        continue;
      }

      const albumData = {
        title,
        date: "",
        location: "",
        story: "",
        coverUrl: "",
        media: mediaFileIds.map(
          (id) =>
            `/api/memories/files/${encodeURIComponent(id)}`
        ),
        mediaFileIds,
        mediaFiles,
        driveFolderId: folderId,
      };

      if (cover?.id) {
        await addFirestoreAlbum({
          ...albumData,
          coverFileId: cover.id,
        });
      } else {
        await addFirestoreAlbum(albumData);
      }

      results.push({
        title,
        status: "imported",
        mediaCount: mediaFileIds.length,
      });
    }

    return NextResponse.json({
      success: true,
      folderCount: driveFolders.length,
      results,
    });
  } catch (error) {
    console.error(
      "Memory Drive import error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import albums from Google Drive.",
      },
      { status: 500 }
    );
  }
}
