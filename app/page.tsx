import HomeScreen from "./components/home/HomeScreen";
import {
  getAlbums,
  getHomepageMemories,
} from "@/lib/memories";

export default function Page() {
  const albums = getAlbums();
  const homepageMemories = getHomepageMemories();

  return (
    <HomeScreen
      albums={albums}
      homepageMemories={homepageMemories}
    />
  );
}