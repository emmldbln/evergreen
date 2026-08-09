import { google } from "googleapis";
import { cookies } from "next/headers";

const EVERGREEN_FOLDER_NAME = "Evergreen";
const FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

export async function getGoogleDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth environment variables are not configured."
    );
  }

  const cookieStore = await cookies();

  const refreshToken = cookieStore.get(
    "google_drive_refresh_token"
  )?.value;

  if (!refreshToken) {
    throw new Error(
      "Google Drive is not connected. Please connect your Google account first."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
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

export async function getOrCreateEvergreenFolder() {
  const drive = await getGoogleDriveClient();

  const response = await drive.files.list({
    q: [
      `name = '${EVERGREEN_FOLDER_NAME}'`,
      `mimeType = '${FOLDER_MIME_TYPE}'`,
      "trashed = false",
    ].join(" and "),
    spaces: "drive",
    fields: "files(id,name,webViewLink)",
    pageSize: 10,
  });

  const existingFolder = response.data.files?.[0];

  if (existingFolder?.id) {
    return {
      id: existingFolder.id,
      name: existingFolder.name ?? EVERGREEN_FOLDER_NAME,
      webViewLink: existingFolder.webViewLink ?? null,
    };
  }

  const createdFolder = await drive.files.create({
    requestBody: {
      name: EVERGREEN_FOLDER_NAME,
      mimeType: FOLDER_MIME_TYPE,
    },
    fields: "id,name,webViewLink",
  });

  if (!createdFolder.data.id) {
    throw new Error(
      "Google Drive folder was created but no folder ID was returned."
    );
  }

  return {
    id: createdFolder.data.id,
    name:
      createdFolder.data.name ?? EVERGREEN_FOLDER_NAME,
    webViewLink: createdFolder.data.webViewLink ?? null,
  };
}