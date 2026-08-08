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

const memoriesPath = path.join(
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

function numericSort(a: string, b: string) {
  const aNum = parseInt(a.match(/\d+/)?.[0] ?? "0");
  const bNum = parseInt(b.match(/\d+/)?.[0] ?? "0");

  return aNum - bNum;
}

export function getAlbums(): Album[] {
  const folders = fs
    .readdirSync(memoriesPath)
    .filter((folder) =>
      fs
        .statSync(path.join(memoriesPath, folder))
        .isDirectory()
    );

  return folders.map((folder) => {
    const folderPath = path.join(
      memoriesPath,
      folder
    );

    const metadataPath = path.join(
      folderPath,
      "metadata.json"
    );

    const metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );

    const media = fs
      .readdirSync(folderPath)

      .filter((file) => {
        if (
          file === "cover.jpg" ||
          file === "metadata.json"
        )
          return false;

        const ext = path
          .extname(file)
          .toLowerCase();

        return (
          IMAGE_EXTENSIONS.includes(ext) ||
          VIDEO_EXTENSIONS.includes(ext)
        );
      })

      .sort(numericSort)

      .map(
        (file) =>
          `/memories/${folder}/${file}`
      );

    return {
      id: folder,
      title: metadata.title,
      date: metadata.date,
      location: metadata.location,
      story: metadata.story,
      cover: `/memories/${folder}/cover.jpg`,
      media,
    };
  });
}

export function getAlbum(id: string) {
  return getAlbums().find(
    (album) => album.id === id
  );
}

export function getHomepageMemories(): HomepageMemory[] {
  const albums = getAlbums();

  const photos: HomepageMemory[] = [];

  albums.forEach((album) => {
    album.media.forEach((file) => {
      const lower = file.toLowerCase();

      const isImage =
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp");

      if (!isImage) return;

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