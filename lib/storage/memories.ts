import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/firebase/storage";

export async function uploadMemoryFile(
  file: File,
  albumId: string,
  type: "cover" | "media"
): Promise<string> {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "";

  const fileName = `${crypto.randomUUID()}.${extension}`;

  const filePath =
    type === "cover"
      ? `memories/${albumId}/cover/${fileName}`
      : `memories/${albumId}/media/${fileName}`;

  const storageRef = ref(
    storage,
    filePath
  );

  await uploadBytes(
    storageRef,
    file,
    {
      contentType: file.type,
    }
  );

  return getDownloadURL(
    storageRef
  );
}