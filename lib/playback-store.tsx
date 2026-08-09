"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";

import type { Song } from "./songs";
import { getSongs } from "./songs";

interface PlaybackContextType {
  currentSong: Song | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  queue: Song[];
  shuffle: boolean;
  repeat: boolean;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  playSong: (song: Song) => void;
  nextSong: () => void;
  previousSong: () => void;
  setQueue: (songs: Song[]) => void;
  setShuffle: (value: boolean) => void;
  setRepeat: (value: boolean) => void;
  seek: (time: number) => void;
}

const PlaybackContext =
  createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoplayRef = useRef(false);

  const [currentSong, setCurrentSong] =
    useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>(() => getSongs());
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const play = useCallback(() => {
    if (!currentSong) {
      const songs = getSongs();
      if (!songs.length) return;

      shouldAutoplayRef.current = true;
      setCurrentSong(songs[0]);
      return;
    }

    const audio = audioRef.current;
    if (!audio || !currentSong.audioUrl) return;

    void audio.play().catch(() => setPlaying(false));
  }, [currentSong]);

  const pause = useCallback(() => {
    shouldAutoplayRef.current = false;
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!currentSong) {
      const songs = getSongs();
      if (!songs.length) return;

      shouldAutoplayRef.current = true;
      setCurrentSong(songs[0]);
      return;
    }

    const audio = audioRef.current;
    if (!audio || !currentSong.audioUrl) return;

    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [currentSong]);

  const playSong = useCallback((song: Song) => {
    shouldAutoplayRef.current = true;
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(song.duration || 0);

    setQueue((currentQueue) => {
      if (currentQueue.some((item) => item.id === song.id)) {
        return currentQueue;
      }

      return [...currentQueue, song];
    });
  }, []);

  const nextSong = useCallback(() => {
    if (!queue.length) return;

    if (!currentSong) {
      playSong(queue[0]);
      return;
    }

    const index = queue.findIndex(
      (song) => song.id === currentSong.id
    );

    if (index === -1) {
      playSong(queue[0]);
      return;
    }

    if (repeat) {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = 0;
      void audio.play().catch(() => setPlaying(false));
      return;
    }

    if (shuffle && queue.length > 1) {
      const available = queue.filter(
        (song) => song.id !== currentSong.id
      );
      const randomIndex = Math.floor(
        Math.random() * available.length
      );

      playSong(available[randomIndex]);
      return;
    }

    playSong(queue[(index + 1) % queue.length]);
  }, [currentSong, playSong, queue, repeat, shuffle]);

  const previousSong = useCallback(() => {
    if (!queue.length) return;

    if (!currentSong) {
      playSong(queue[0]);
      return;
    }

    const index = queue.findIndex(
      (song) => song.id === currentSong.id
    );

    if (index === -1) {
      playSong(queue[0]);
      return;
    }

    playSong(
      queue[(index - 1 + queue.length) % queue.length]
    );
  }, [currentSong, playSong, queue]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(
      0,
      Math.min(time, audio.duration || 0)
    );

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(currentSong.duration || 0);
    setPlaying(false);

    if (!currentSong.audioUrl) {
      shouldAutoplayRef.current = false;
      return;
    }

    audio.src = currentSong.audioUrl;
    audio.load();

    if (shouldAutoplayRef.current) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
      shouldAutoplayRef.current = false;
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        void audio.play().catch(() => setPlaying(false));
        return;
      }

      nextSong();
    };

    const handleError = () => setPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [nextSong, repeat]);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  const value = useMemo(
    () => ({
      currentSong,
      playing,
      currentTime,
      duration,
      queue,
      shuffle,
      repeat,
      play,
      pause,
      togglePlayback,
      playSong,
      nextSong,
      previousSong,
      setQueue,
      setShuffle,
      setRepeat,
      seek,
    }),
    [
      currentSong,
      playing,
      currentTime,
      duration,
      queue,
      shuffle,
      repeat,
      play,
      pause,
      togglePlayback,
      playSong,
      nextSong,
      previousSong,
      seek,
    ]
  );

  return (
    <PlaybackContext.Provider value={value}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);

  if (!context) {
    throw new Error(
      "usePlayback must be used inside PlaybackProvider"
    );
  }

  return context;
}
