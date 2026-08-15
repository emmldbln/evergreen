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
    const { fileId } = await context.params;

    if (!fileId) {
      return NextResponse.json(
        {
          error: "File ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const drive =
      await getGoogleDriveClient();

    /*
     * =====================================================
     * GET FILE METADATA
     * =====================================================
     */

    const file =
      await drive.files.get({
        fileId,
        fields: "id,name,mimeType,size",
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
     * Google Drive returns the file size as a string.
     */

    const fileSize = Number(
      file.data.size
    );

    if (!Number.isFinite(fileSize)) {
      return NextResponse.json(
        {
          error:
            "Google Drive file size is unavailable.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * =====================================================
     * RANGE
     * =====================================================
     */

    const rangeHeader =
      request.headers.get("range");

    let start = 0;
    let end = fileSize - 1;
    let isPartial = false;

    if (rangeHeader) {
      const match =
        rangeHeader.match(
          /^bytes=(\d*)-(\d*)$/
        );

      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            "Content-Range":
              `bytes */${fileSize}`,
          },
        });
      }

      const requestedStart =
        match[1];

      const requestedEnd =
        match[2];

      /*
       * bytes=-500
       *
       * Return the final 500 bytes.
       */
      if (
        !requestedStart &&
        requestedEnd
      ) {
        const suffixLength =
          Number(requestedEnd);

        if (
          !Number.isFinite(
            suffixLength
          ) ||
          suffixLength <= 0
        ) {
          return new NextResponse(
            null,
            {
              status: 416,
              headers: {
                "Content-Range":
                  `bytes */${fileSize}`,
              },
            }
          );
        }

        start = Math.max(
          0,
          fileSize - suffixLength
        );

        end = fileSize - 1;
      } else {
        /*
         * bytes=START-END
         */
        start = Number(
          requestedStart
        );

        if (
          !Number.isFinite(start) ||
          start < 0 ||
          start >= fileSize
        ) {
          return new NextResponse(
            null,
            {
              status: 416,
              headers: {
                "Content-Range":
                  `bytes */${fileSize}`,
              },
            }
          );
        }

        if (requestedEnd) {
          end = Number(
            requestedEnd
          );
        } else {
          end = fileSize - 1;
        }

        if (
          !Number.isFinite(end) ||
          end < start
        ) {
          return new NextResponse(
            null,
            {
              status: 416,
              headers: {
                "Content-Range":
                  `bytes */${fileSize}`,
              },
            }
          );
        }

        /*
         * Never allow the requested range
         * to go beyond the actual file.
         */
        end = Math.min(
          end,
          fileSize - 1
        );
      }

      isPartial = true;
    }

    const contentLength =
      end - start + 1;

    /*
     * =====================================================
     * REQUEST FILE FROM GOOGLE DRIVE
     * =====================================================
     */

    const driveResponse =
      await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        {
          responseType: "stream",
          headers: {
            Range:
              `bytes=${start}-${end}`,
          },
        }
      );

    const nodeStream =
      driveResponse.data;

    /*
     * =====================================================
     * CONVERT NODE STREAM -> WEB STREAM
     * =====================================================
     */

    const webStream =
      new ReadableStream({
        start(controller) {
          nodeStream.on(
            "data",
            (chunk) => {
              controller.enqueue(
                new Uint8Array(chunk)
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
      "Content-Length",
      String(contentLength)
    );

    responseHeaders.set(
      "Cache-Control",
      "private, max-age=3600"
    );

    if (isPartial) {
      responseHeaders.set(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
      );
    }

    /*
     * =====================================================
     * RESPONSE
     * =====================================================
     */

    return new NextResponse(
      webStream,
      {
        status: isPartial
          ? 206
          : 200,
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