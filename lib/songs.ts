export interface Song {
  id: string;

  title: string;

  artist: string;

  cover: string;

  spotifyUrl: string;

  // Optional special message shown in the player
  note?: string;

  // Albums/Collections this song belongs to
  albums: string[];

  // Favorite song
  favorite: boolean;

  // Featured song shown on the soundtrack page
  featured: boolean;

  // Gives the album cover a golden glow
  glow: boolean;

  // Song duration in seconds
  duration: number;

  // Related memories
  memoryIds: string[];

  // Date added
  addedAt: string;
}

export const songs: Song[] = [];

export function getSongs() {
  return songs;
}

export function getSong(id: string) {
  return songs.find((song) => song.id === id);
}

export function getFeaturedSong() {
  return (
    songs.find((song) => song.featured) ??
    songs[0] ??
    null
  );
}

export function getFavoriteSongs() {
  return songs.filter(
    (song) => song.favorite
  );
}