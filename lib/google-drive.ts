import { google } from "googleapis";
import { cookies } from "next/headers";
import { Readable } from "stream";

const EVERGREEN_FOLDER_NAME = "Evergreen";
const MEMORIES_FOLDER_NAME = "Memories";

const FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

type DriveFolder = {
  id: string;
  name?: string | null;
  webViewLink?: string | null;
};

async function findFolder(
  folderName: string,
  parentId?: string
): Promise<DriveFolder | undefined> {
  const drive = await getGoogleDriveClient();

  const conditions = [
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    `mimeType = '${FOLDER_MIME_TYPE}'`,
    "trashed = false",
  ];

  if (parentId) {
    conditions.push(
      `'${parentId}' in parents`
    );
  }

  const response = await drive.files.list({
    q: conditions.join(" and "),
    spaces: "drive",
    fields: "files(id,name,webViewLink)",
    pageSize: 10,
  });

  const file = response.data.files?.[0];

  if (!file?.id) {
    return undefined;
  }

  return {
    id: file.id,
    name: file.name,
    webViewLink: file.webViewLink,
  };
}

async function createFolder(
  folderName: string,
  parentId?: string
): Promise<DriveFolder> {
  const drive = await getGoogleDriveClient();

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: FOLDER_MIME_TYPE,
      ...(parentId
        ? {
            parents: [parentId],
          }
        : {}),
    },
    fields: "id,name,webViewLink",
  });

  if (!folder.data.id) {
    throw new Error(
      `Failed to create Google Drive folder: ${folderName}`
    );
  }

  return {
    id: folder.data.id,
    name: folder.data.name,
    webViewLink: folder.data.webViewLink,
  };
}

export async function getGoogleDriveClient() {
  const clientId =
    process.env.GOOGLE_CLIENT_ID;

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET;

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI;

  if (
    !clientId ||
    !clientSecret ||
    !redirectUri
  ) {
    throw new Error(
      "Google OAuth environment variables are not configured."
    );
  }

  const cookieStore = await cookies();

  const refreshToken =
    cookieStore.get(
      "google_drive_refresh_token"
    )?.value;

  if (!refreshToken) {
    throw new Error(
      "Google Drive is not connected. Please connect your Google account first."
    );
  }

  const oauth2Client =
    new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}

/* =========================================================
   EVERGREEN ROOT
========================================================= */

export async function getOrCreateEvergreenFolder() {
  const existingFolder =
    await findFolder(
      EVERGREEN_FOLDER_NAME
    );

  if (existingFolder) {
    return {
      id: existingFolder.id,
      name:
        existingFolder.name ??
        EVERGREEN_FOLDER_NAME,
      webViewLink:
        existingFolder.webViewLink ??
        null,
    };
  }

  const createdFolder =
    await createFolder(
      EVERGREEN_FOLDER_NAME
    );

  return {
    id: createdFolder.id,
    name:
      createdFolder.name ??
      EVERGREEN_FOLDER_NAME,
    webViewLink:
      createdFolder.webViewLink ??
      null,
  };
}

/* =========================================================
   MEMORIES ROOT
========================================================= */

export async function getOrCreateMemoriesFolder() {
  const evergreenFolder =
    await getOrCreateEvergreenFolder();

  const existingFolder =
    await findFolder(
      MEMORIES_FOLDER_NAME,
      evergreenFolder.id
    );

  if (existingFolder) {
    return {
      id: existingFolder.id,
      name:
        existingFolder.name ??
        MEMORIES_FOLDER_NAME,
      webViewLink:
        existingFolder.webViewLink ??
        null,
      parentId: evergreenFolder.id,
    };
  }

  const createdFolder =
    await createFolder(
      MEMORIES_FOLDER_NAME,
      evergreenFolder.id
    );

  return {
    id: createdFolder.id,
    name:
      createdFolder.name ??
      MEMORIES_FOLDER_NAME,
    webViewLink:
      createdFolder.webViewLink ??
      null,
    parentId: evergreenFolder.id,
  };
}

/* =========================================================
   ALBUM FOLDER
========================================================= */

/*
 * IMPORTANT:
 *
 * An album must ALWAYS receive a brand-new
 * Google Drive folder.
 *
 * We intentionally DO NOT search for an existing
 * folder by album name here.
 *
 * This prevents:
 *
 * Album A -> Folder 123
 * Album B -> Folder 123
 *
 * which was the source of the destructive deletion bug.
 */

export async function createAlbumFolder(
  albumName: string
) {
  const memoriesFolder =
    await getOrCreateMemoriesFolder();

  const createdFolder =
    await createFolder(
      albumName,
      memoriesFolder.id
    );

  return {
    id: createdFolder.id,
    name:
      createdFolder.name ??
      albumName,
    webViewLink:
      createdFolder.webViewLink ??
      null,
    parentId: memoriesFolder.id,
  };
}

/* =========================================================
   UPLOAD
========================================================= */

/**
 * Uploads a file into a specific
 * Google Drive folder.
 */
export async function uploadFileToDrive(
  file: File,
  parentId: string
) {
  const drive =
    await getGoogleDriveClient();

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  const uploadedFile =
    await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [parentId],
      },

      media: {
        mimeType:
          file.type ||
          "application/octet-stream",

        body: Readable.from(buffer),
      },

      fields:
        "id,name,mimeType,webViewLink,webContentLink",
    });

  if (!uploadedFile.data.id) {
    throw new Error(
      `Failed to upload ${file.name} to Google Drive.`
    );
  }

  return {
    id: uploadedFile.data.id,

    name:
      uploadedFile.data.name ??
      file.name,

    mimeType:
      uploadedFile.data.mimeType ??
      file.type,

    webViewLink:
      uploadedFile.data.webViewLink ??
      null,

    webContentLink:
      uploadedFile.data.webContentLink ??
      null,
  };
}

/* =========================================================
   UPDATE DRIVE FILE
========================================================= */

/**
 * Renames a Google Drive file or folder.
 */
export async function updateDriveFileName(
  fileId: string,
  name: string
) {
  const drive =
    await getGoogleDriveClient();

  const response =
    await drive.files.update({
      fileId,

      requestBody: {
        name,
      },

      fields:
        "id,name,mimeType,webViewLink",
    });

  if (!response.data.id) {
    throw new Error(
      "Google Drive file could not be updated."
    );
  }

  return {
    id: response.data.id,

    name:
      response.data.name ??
      name,

    mimeType:
      response.data.mimeType ??
      null,

    webViewLink:
      response.data.webViewLink ??
      null,
  };
}

/* =========================================================
   DELETE SINGLE FILE
========================================================= */

/**
 * Permanently deletes a single
 * Google Drive file or folder.
 */
export async function deleteDriveFile(
  fileId: string
) {
  const drive =
    await getGoogleDriveClient();

  try {
    await drive.files.delete({
      fileId,
    });
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? Number(
            (error as { code?: unknown }).code
          )
        : undefined;

    /*
     * If the file is already gone,
     * consider the operation complete.
     */
    if (status === 404) {
      return;
    }

    throw error;
  }
}

/* =========================================================
   VERIFY DRIVE FOLDER
========================================================= */

/**
 * Checks whether a Drive file/folder still exists.
 *
 * Returns false instead of throwing when
 * Google Drive reports that it is gone.
 */
export async function driveItemExists(
  fileId: string
): Promise<boolean> {
  const drive =
    await getGoogleDriveClient();

  try {
    const response =
      await drive.files.get({
        fileId,
        fields:
          "id,name,mimeType,parents,trashed",
      });

    return Boolean(
      response.data.id &&
      !response.data.trashed
    );
  } catch (error: unknown) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? Number(
            (error as { code?: unknown }).code
          )
        : undefined;

    if (status === 404) {
      return false;
    }

    throw error;
  }
}

/* =========================================================
   RECURSIVE FOLDER DELETE
========================================================= */

/**
 * Recursively deletes a Google Drive
 * folder and everything contained inside.
 *
 * IMPORTANT:
 * The API route must verify that this
 * folder belongs exclusively to the
 * album being deleted before calling this.
 */
export async function deleteDriveFolder(
  folderId: string
) {
  const drive =
    await getGoogleDriveClient();

  /*
   * First verify that the folder still exists.
   *
   * This makes deletion safe when a previous
   * operation already removed the folder.
   */
  const exists =
    await driveItemExists(folderId);

  if (!exists) {
    return;
  }

  /*
   * Find every item directly inside
   * this folder.
   */
  const response =
    await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      spaces: "drive",
      fields:
        "files(id,name,mimeType)",
      pageSize: 1000,
    });

  const children =
    response.data.files ?? [];

  /*
   * Delete children first.
   */
  for (const child of children) {
    if (!child.id) {
      continue;
    }

    if (
      child.mimeType ===
      FOLDER_MIME_TYPE
    ) {
      await deleteDriveFolder(
        child.id
      );
    } else {
      await deleteDriveFile(
        child.id
      );
    }
  }

  /*
   * Finally delete the folder itself.
   */
  await deleteDriveFile(
    folderId
  );
}