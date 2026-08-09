import { NextResponse } from "next/server";

import {
  getGoogleDriveClient,
} from "@/lib/google-drive";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      fileId: string;
    }>;
  }
) {
  try {
    const { fileId } =
      await context.params;

    if (!fileId) {
      return NextResponse.json(
        {
          error:
            "File ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const drive =
      await getGoogleDriveClient();

    const file =
      await drive.files.get({
        fileId,
        fields:
          "id,name,mimeType,size",
      });

    const mimeType =
      file.data.mimeType;

    if (!mimeType) {
      return NextResponse.json(
        {
          error:
            "Google Drive file has no MIME type.",
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        }
      );

    const data =
      response.data as ArrayBuffer;

    return new NextResponse(
      data,
      {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control":
            "private, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error(
      "Google Drive file error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve file.",
      },
      {
        status: 500,
      }
    );
  }
}