import { NextResponse } from "next/server";

import {
  getGoogleDriveClient,
} from "@/lib/google-drive";

interface RouteContext {
  params: Promise<{
    fileId: string;
  }>;
}

/*
 * =========================================================
 * GOOGLE DRIVE MEDIA STREAM ROUTE
 * =========================================================
 *
 * This route is intentionally designed for browser media
 * playback.
 *
 * Important:
 *
 * - Supports HTTP Range requests.
 * - Returns 206 Partial Content when a Range is requested.
 * - Returns 200 when no Range is requested.
 * - Passes the requested byte range directly to Google Drive.
 * - Does not modify the video bytes.
 * - Does not transcode or remux anything.
 * - Provides the headers browsers expect for video seeking.
 *
 * This is especially important for MP4/MOV playback because
 * browsers frequently request small byte ranges while
 * buffering, seeking, and starting playback.
 */

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { fileId } = await context.params;

    /*
     * =====================================================
     * VALIDATE FILE ID
     * =====================================================
     */

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

    /*
     * =====================================================
     * GOOGLE DRIVE CLIENT
     * =====================================================
     */

    const drive =
      await getGoogleDriveClient();

    /*
     * =====================================================
     * GET FILE METADATA
     * =====================================================
     */

    const metadata =
      await drive.files.get({
        fileId,
        fields:
          "id,name,mimeType,size",
      });

    const mimeType =
      metadata.data.mimeType;

    const fileName =
      metadata.data.name ??
      "media";

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
     * Google Drive returns size as a string.
     */

    const fileSize = Number(
      metadata.data.size
    );

    if (
      !Number.isFinite(fileSize) ||
      fileSize < 0
    ) {
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
     * RANGE REQUEST
     * =====================================================
     *
     * Browsers commonly send:
     *
     *   Range: bytes=0-
     *   Range: bytes=1000000-2000000
     *   Range: bytes=-500000
     *
     * We preserve the requested range instead of inventing
     * a range when the browser did not request one.
     */

    const rangeHeader =
      request.headers.get("range");

    let start = 0;
    let end = Math.max(
      0,
      fileSize - 1
    );

    let partial = false;

    if (rangeHeader) {
      /*
       * Only support a single byte range.
       *
       * This is what browser video playback normally uses.
       */

      const match =
        rangeHeader.match(
          /^bytes=(\d*)-(\d*)$/
        );

      if (!match) {
        return new NextResponse(
          null,
          {
            status: 416,
            headers: {
              "Content-Range":
                `bytes */${fileSize}`,
              "Accept-Ranges":
                "bytes",
            },
          }
        );
      }

      const requestedStart =
        match[1];

      const requestedEnd =
        match[2];

      /*
       * ===================================================
       * SUFFIX RANGE
       * ===================================================
       *
       * Example:
       *
       *   bytes=-500000
       *
       * Means the final 500000 bytes.
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
                "Accept-Ranges":
                  "bytes",
              },
            }
          );
        }

        start = Math.max(
          0,
          fileSize -
            suffixLength
        );

        end = fileSize - 1;
      } else {
        /*
         * =================================================
         * NORMAL RANGE
         * =================================================
         *
         * Examples:
         *
         *   bytes=0-999999
         *   bytes=1000000-
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
                "Accept-Ranges":
                  "bytes",
              },
            }
          );
        }

        if (requestedEnd) {
          end = Number(
            requestedEnd
          );

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
                  "Accept-Ranges":
                    "bytes",
                },
              }
            );
          }

          /*
           * Never allow the range to exceed
           * the actual file.
           */

          end = Math.min(
            end,
            fileSize - 1
          );
        } else {
          /*
           * bytes=START-
           */

          end =
            fileSize - 1;
        }
      }

      partial = true;
    }

    /*
     * =====================================================
     * CONTENT LENGTH
     * =====================================================
     */

    const contentLength =
      end - start + 1;

    /*
     * =====================================================
     * DEBUG LOGGING
     * =====================================================
     *
     * This is intentionally visible in the terminal while
     * we diagnose the public playback issue.
     */

    console.log(
      "[Evergreen] Media request:",
      {
        fileId,
        fileName,
        mimeType,
        fileSize,
        range:
          rangeHeader ?? "none",
        start,
        end,
        contentLength,
        responseStatus:
          partial ? 206 : 200,
      }
    );

    /*
     * =====================================================
     * GOOGLE DRIVE REQUEST
     * =====================================================
     *
     * IMPORTANT:
     *
     * If the browser requested a Range, pass exactly that
     * calculated range to Google Drive.
     *
     * If the browser did NOT request a Range, request the
     * complete file instead of artificially creating a
     * partial response.
     */

    const driveRequestOptions = {
      fileId,
      alt: "media" as const,
    };

    const driveRequestConfig =
      partial
        ? {
            responseType:
              "stream" as const,
            headers: {
              Range:
                `bytes=${start}-${end}`,
            },
          }
        : {
            responseType:
              "stream" as const,
          };

    const driveResponse =
      await drive.files.get(
        driveRequestOptions,
        driveRequestConfig
      );

    /*
     * =====================================================
     * GOOGLE DRIVE STREAM
     * =====================================================
     */

    const nodeStream =
      driveResponse.data;

    /*
     * =====================================================
     * NODE STREAM -> WEB STREAM
     * =====================================================
     */

    const webStream =
      new ReadableStream<Uint8Array>({
        start(controller) {
          nodeStream.on(
            "data",
            (chunk: Buffer) => {
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
              console.error(
                "[Evergreen] Google Drive media stream error:",
                error
              );

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

    /*
     * Tell the browser exactly what kind of media
     * it is receiving.
     */

    responseHeaders.set(
      "Content-Type",
      mimeType
    );

    /*
     * Essential for HTML5 video seeking.
     */

    responseHeaders.set(
      "Accept-Ranges",
      "bytes"
    );

    /*
     * Exact number of bytes in this response.
     */

    responseHeaders.set(
      "Content-Length",
      String(contentLength)
    );

    /*
     * Tell browsers that this is media intended to be
     * displayed rather than downloaded as an attachment.
     */

    responseHeaders.set(
      "Content-Disposition",
      `inline; filename="${fileName.replace(
        /["\\]/g,
        ""
      )}"`
    );

    /*
     * Cache media for a reasonable period.
     *
     * The actual file is immutable after upload, and the
     * file ID changes when a new media file is uploaded.
     */

    responseHeaders.set(
      "Cache-Control",
      "private, max-age=3600"
    );

    /*
     * Required for a proper 206 response.
     */

    if (partial) {
      responseHeaders.set(
        "Content-Range",
        `bytes ${start}-${end}/${fileSize}`
      );
    }

    /*
     * =====================================================
     * RETURN MEDIA
     * =====================================================
     */

    return new NextResponse(
      webStream,
      {
        status: partial
          ? 206
          : 200,

        headers:
          responseHeaders,
      }
    );
  } catch (error) {
    console.error(
      "[Evergreen] Google Drive media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve media file.",
      },
      {
        status: 500,
      }
    );
  }
}