import fs from "fs";
import path from "path";

const memoriesRoot = path.join(process.cwd(), "public", "memories");

const defaults: Record<
  string,
  {
    title: string;
    date: string;
    location: string;
    story: string;
  }
> = {
  "first-ever-date": {
    title: "First Ever Date",
    date: "To be updated",
    location: "To be updated",
    story:
      "One of the most unforgettable days of our story. This chapter will always remind me where everything truly began.",
  },

  "first-ever-concert-date": {
    title: "First Ever Concert Date",
    date: "To be updated",
    location: "To be updated",
    story:
      "Our first concert together. A night filled with excitement, music, and memories I'll never forget.",
  },

  "mall-dates": {
    title: "Mall Dates",
    date: "To be updated",
    location: "To be updated",
    story:
      "The ordinary days became extraordinary simply because I spent them with you.",
  },

  "staycations": {
    title: "Staycations",
    date: "To be updated",
    location: "To be updated",
    story:
      "Quiet moments away from the world. Just us, making memories together.",
  },

  "video-calls": {
    title: "Video Calls",
    date: "To be updated",
    location: "Different Places",
    story:
      "Distance never stopped us from finding time for each other.",
  },
};

const folders = fs
  .readdirSync(memoriesRoot)
  .filter((f) =>
    fs.statSync(path.join(memoriesRoot, f)).isDirectory()
  );

folders.forEach((folder) => {
  const metadataPath = path.join(
    memoriesRoot,
    folder,
    "metadata.json"
  );

  if (fs.existsSync(metadataPath)) {
    console.log(`${folder} ✔ metadata already exists`);
    return;
  }

  const data =
    defaults[folder] || {
      title: folder,
      date: "To be updated",
      location: "To be updated",
      story: "",
    };

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(data, null, 2)
  );

  console.log(`${folder} ✔ metadata created`);
});

console.log("\nDone.");