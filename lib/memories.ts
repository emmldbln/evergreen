import fs from "fs";
import path from "path";

export interface Album {
  id: string;
  title: string;
  date: string;
  location: string;
  story: string;
  cover: string;
  media: string[];
}

export interface HomepageMemory {
  image: string;
  albumId: string;
  albumTitle: string;
  date: string;
  location: string;
  story: string;
}

export const memoriesPath = path.join(
  process.cwd(),
  "public",
  "memories"
);

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".webm",
];

export function isImageFile(file: string): boolean {
  return IMAGE_EXTENSIONS.includes(
    path.extname(file).toLowerCase()
  );
}

export function isVideoFile(file: string): boolean {
  return VIDEO_EXTENSIONS.includes(
    path.extname(file).toLowerCase()
  );
}

export function isMediaFile(file: string): boolean {
  return (
    isImageFile(file) ||
    isVideoFile(file)
  );
}

function numericSort(
  a: string,
  b: string
) {
  const aNum = parseInt(
    a.match(/\d+/)?.[0] ?? "0",
    10
  );

  const bNum = parseInt(
    b.match(/\d+/)?.[0] ?? "0",
    10
  );

  if (aNum !== bNum) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

function ensureMemoriesDirectory() {
  if (!fs.existsSync(memoriesPath)) {
    fs.mkdirSync(memoriesPath, {
      recursive: true,
    });
  }
}

export function getAlbums(): Album[] {
  ensureMemoriesDirectory();

  const folders = fs
    .readdirSync(memoriesPath)
    .filter((folder) => {
      const folderPath = path.join(
        memoriesPath,
        folder
      );

      return (
        fs.existsSync(folderPath) &&
        fs.statSync(folderPath).isDirectory()
      );
    })
    .sort((a, b) =>
      a.localeCompare(b)
    );

  return folders
    .map((folder) => {
      const folderPath = path.join(
        memoriesPath,
        folder
      );

      const metadataPath = path.join(
        folderPath,
        "metadata.json"
      );

      if (!fs.existsSync(metadataPath)) {
        return null;
      }

      try {
        const metadata = JSON.parse(
          fs.readFileSync(
            metadataPath,
            "utf8"
          )
        );

        const media = fs
          .readdirSync(folderPath)
          .filter((file) => {
            if (
              file === "cover.jpg" ||
              file === "metadata.json"
            ) {
              return false;
            }

            return isMediaFile(file);
          })
          .sort(numericSort)
          .map(
            (file) =>
              `/memories/${folder}/${file}`
          );

        const coverExists = fs.existsSync(
          path.join(folderPath, "cover.jpg")
        );

        return {
          id: folder,
          title:
            typeof metadata.title ===
            "string"
              ? metadata.title
              : folder,
          date:
            typeof metadata.date ===
            "string"
              ? metadata.date
              : "",
          location:
            typeof metadata.location ===
            "string"
              ? metadata.location
              : "",
          story:
            typeof metadata.story ===
            "string"
              ? metadata.story
              : "",
          cover: coverExists
            ? `/memories/${folder}/cover.jpg`
            : media.find(isImageFile) ??
              "",
          media,
        };
      } catch {
        return null;
      }
    })
    .filter(
      (
        album
      ): album is Album =>
        album !== null
    );
}

export function getAlbum(
  id: string
): Album | undefined {
  return getAlbums().find(
    (album) => album.id === id
  );
}

export function getHomepageMemories(
  albums: Album[]
): HomepageMemory[] {
  const photos: HomepageMemory[] = [];

  albums.forEach((album) => {
    album.media.forEach((file) => {
      if (!isImageFile(file)) {
        return;
      }

      photos.push({
        image: file,
        albumId: album.id,
        albumTitle: album.title,
        date: album.date,
        location: album.location,
        story: album.story,
      });
    });
  });

  return photos;
}