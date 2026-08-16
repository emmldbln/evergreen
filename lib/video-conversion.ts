import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import os from "os";
import path from "path";

const execFileAsync = promisify(execFile);

/*
 * =========================================================
 * FFMPEG PATH
 * =========================================================
 */

function getFfmpegPath(): string {
  return path.join(
    process.cwd(),
    "node_modules",
    "ffmpeg-static",
    "ffmpeg.exe"
  );
}

/*
 * =========================================================
 * MOV DETECTION
 * =========================================================
 */

function isMovFile(file: File): boolean {
  return (
    /\.mov$/i.test(file.name) ||
    file.type === "video/quicktime"
  );
}

/*
 * =========================================================
 * MOV -> MP4
 * =========================================================
 *
 * IMPORTANT:
 *
 * We DO NOT transcode the video.
 *
 * Video:
 *
 *   -c:v copy
 *
 * This preserves:
 *
 *   - resolution
 *   - frame rate
 *   - H.264 codec
 *   - video quality
 *   - video data
 *
 * Audio:
 *
 *   -c:a aac
 *   -b:a 192k
 *
 * The original AAC stream is decoded and encoded again.
 *
 * This is intentional.
 *
 * The original file produced:
 *
 *   Input buffer exhausted before END element found
 *
 * for its AAC stream.
 *
 * Re-encoding the audio gives the browser a clean,
 * standard AAC stream instead of copying the potentially
 * problematic source AAC packets.
 *
 * This should still be significantly faster than
 * transcoding the entire video.
 */

export async function remuxMovToMp4(
  file: File
): Promise<File> {
  if (!isMovFile(file)) {
    return file;
  }

  const executablePath = getFfmpegPath();

  /*
   * =====================================================
   * VERIFY FFMPEG
   * =====================================================
   */

  try {
    await fs.access(executablePath);
  } catch {
    throw new Error(
      `FFmpeg executable does not exist: ${executablePath}`
    );
  }

  /*
   * =====================================================
   * TEMP DIRECTORY
   * =====================================================
   */

  const tempDirectory = await fs.mkdtemp(
    path.join(
      os.tmpdir(),
      "evergreen-video-"
    )
  );

  const inputPath = path.join(
    tempDirectory,
    "input.mov"
  );

  const outputPath = path.join(
    tempDirectory,
    "output.mp4"
  );

  const outputName = file.name.replace(
    /\.mov$/i,
    ".mp4"
  );

  try {
    /*
     * =====================================================
     * WRITE INPUT FILE
     * =====================================================
     */

    console.log(
      "[Evergreen] Writing MOV input to temporary file..."
    );

    const inputFile = await fs.open(
      inputPath,
      "w"
    );

    try {
      const reader =
        file.stream().getReader();

      try {
        while (true) {
          const {
            done,
            value,
          } = await reader.read();

          if (done) {
            break;
          }

          await inputFile.write(value);
        }
      } finally {
        reader.releaseLock();
      }
    } finally {
      await inputFile.close();
    }

    console.log(
      "[Evergreen] Temporary input written:",
      {
        path: inputPath,
        size: file.size,
      }
    );

    /*
     * =====================================================
     * FFMPEG AUDIO RE-ENCODE
     * =====================================================
     *
     * VIDEO:
     *
     *   -c:v copy
     *
     * AUDIO:
     *
     *   -c:a aac
     *   -b:a 192k
     *   -ar 44100
     *   -ac 2
     *
     * This means only the audio is decoded/re-encoded.
     */

    console.log(
      "[Evergreen] Starting MOV -> MP4 conversion..."
    );

    console.log(
      "[Evergreen] Video: COPY (no video transcoding)"
    );

    console.log(
      "[Evergreen] Audio: AAC RE-ENCODE (192 kbps)"
    );

    try {
      const { stderr } =
        await execFileAsync(
          executablePath,
          [
            "-y",

            /*
             * =================================================
             * INPUT
             * =================================================
             */

            "-i",
            inputPath,

            /*
             * =================================================
             * STREAM SELECTION
             * =================================================
             *
             * First video stream.
             */

            "-map",
            "0:v:0",

            /*
             * First audio stream if available.
             */

            "-map",
            "0:a:0?",

            /*
             * =================================================
             * VIDEO
             * =================================================
             *
             * DO NOT TRANSCODE VIDEO.
             */

            "-c:v",
            "copy",

            /*
             * =================================================
             * AUDIO
             * =================================================
             *
             * IMPORTANT:
             *
             * We intentionally DO NOT use:
             *
             *   -c:a copy
             *
             * because that preserves the problematic AAC
             * stream.
             *
             * Instead, decode and re-encode it.
             */

            "-c:a",
            "aac",

            "-b:a",
            "192k",

            "-ar",
            "44100",

            "-ac",
            "2",

            /*
             * =================================================
             * METADATA
             * =================================================
             *
             * Do not carry over unnecessary Apple-specific
             * metadata/data streams.
             */

            "-map_metadata",
            "-1",

            /*
             * =================================================
             * MP4
             * =================================================
             *
             * Move moov atom to the beginning.
             */

            "-movflags",
            "+faststart",

            outputPath,
          ],
          {
            maxBuffer:
              50 * 1024 * 1024,
          }
        );

      /*
       * FFmpeg normally writes its progress to stderr.
       * Print it so we can actually see what happened.
       */

      if (stderr) {
        console.log(
          "[Evergreen] FFmpeg output:"
        );

        console.log(stderr);
      }
    } catch (error) {
      console.error(
        "[Evergreen] MOV -> MP4 conversion failed:",
        error
      );

      let message = "";
      let stderr = "";

      if (
        typeof error === "object" &&
        error !== null
      ) {
        const ffmpegError =
          error as {
            message?: unknown;
            stderr?: unknown;
            code?: unknown;
          };

        message = String(
          ffmpegError.message ?? ""
        );

        stderr = String(
          ffmpegError.stderr ?? ""
        );

        console.error(
          "[Evergreen] FFmpeg message:",
          message
        );

        console.error(
          "[Evergreen] FFmpeg code:",
          ffmpegError.code
        );

        console.error(
          "[Evergreen] FFmpeg stderr:",
          stderr
        );
      }

      throw new Error(
        [
          "MOV to MP4 conversion failed.",
          message
            ? `Message: ${message}`
            : "",
          stderr
            ? `FFmpeg: ${stderr.slice(-5000)}`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    }

    /*
     * =====================================================
     * VERIFY OUTPUT
     * =====================================================
     */

    const outputStats =
      await fs.stat(outputPath);

    if (
      !outputStats.isFile() ||
      outputStats.size === 0
    ) {
      throw new Error(
        "FFmpeg completed but did not create a valid MP4 output file."
      );
    }

    /*
     * =====================================================
     * READ OUTPUT
     * =====================================================
     */

    const outputBuffer =
      await fs.readFile(
        outputPath
      );

    console.log(
      "[Evergreen] MOV -> MP4 conversion completed:",
      {
        originalName:
          file.name,

        outputName,

        originalSize:
          file.size,

        convertedSize:
          outputBuffer.length,

        video:
          "copied",

        audio:
          "re-encoded to AAC 192k",
      }
    );

    /*
     * =====================================================
     * RETURN MP4
     * =====================================================
     */

    return new File(
      [
        outputBuffer,
      ],
      outputName,
      {
        type: "video/mp4",
      }
    );
  } finally {
    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    await fs.rm(
      tempDirectory,
      {
        recursive: true,
        force: true,
      }
    );

    console.log(
      "[Evergreen] Temporary video files cleaned up."
    );
  }
}