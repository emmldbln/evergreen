import { NextResponse } from "next/server";

import {
  getGoogleDriveClient,
} from "@/lib/google-drive";

export async function GET(
  request: Request,
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

    /*
     * Get metadata first.
     */

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

    /*
     * =====================================================
     * RANGE SUPPORT
     * =====================================================
     *
     * This is especially important for video.
     *
     * Browsers don't necessarily download an entire
     * video before playing it. They request portions
     * of the file using:
     *
     * Range: bytes=...
     */

    const range =
      request.headers.get("range");

    const driveResponse =
      await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        {
          responseType: "stream",

          ...(range
            ? {
                headers: {
                  Range: range,
                },
              }
            : {}),
        }
      );

    const nodeStream =
      driveResponse.data;

    /*
     * Convert Node.js stream into
     * a Web ReadableStream that
     * NextResponse can return.
     */

    const webStream =
      new ReadableStream({
        start(controller) {
          nodeStream.on(
            "data",
            (chunk) => {
              controller.enqueue(
                new Uint8Array(
                  chunk
                )
              );
            }
          );

          nodeStream.on(
            "end",
            () => {
              controller.close();
            }
          );

          nodeStream.on(
            "error",
            (error) => {
              controller.error(
                error
              );
            }
          );
        },

        cancel() {
          nodeStream.destroy();
        },
      });

    /*
     * =====================================================
     * RESPONSE HEADERS
     * =====================================================
     */

    const responseHeaders =
      new Headers();

    responseHeaders.set(
      "Content-Type",
      mimeType
    );

    responseHeaders.set(
      "Accept-Ranges",
      "bytes"
    );

    responseHeaders.set(
      "Cache-Control",
      "private, max-age=3600"
    );

    /*
     * Preserve Google Drive's
     * range response information.
     */

    const contentLength =
      driveResponse.headers[
        "content-length"
      ];

    const contentRange =
      driveResponse.headers[
        "content-range"
      ];

    if (contentLength) {
      responseHeaders.set(
        "Content-Length",
        String(contentLength)
      );
    }

    if (contentRange) {
      responseHeaders.set(
        "Content-Range",
        String(contentRange)
      );
    }

    /*
     * Google Drive normally returns
     * 206 when a valid Range request
     * is supplied.
     */

    const status =
      range && contentRange
        ? 206
        : 200;

    return new NextResponse(
      webStream,
      {
        status,
        headers:
          responseHeaders,
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