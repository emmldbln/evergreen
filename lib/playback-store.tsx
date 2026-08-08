"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

import type { Song } from "./songs";
import { getSongs } from "./songs";

interface PlaybackContextType {
  currentSong: Song | null;

  playing: boolean;

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
}

const PlaybackContext =
  createContext<PlaybackContextType | null>(
    null
  );

export function PlaybackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentSong, setCurrentSong] =
    useState<Song | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const [queue, setQueue] =
    useState<Song[]>(() => getSongs());

  const [shuffle, setShuffle] =
    useState(false);

  const [repeat, setRepeat] =
    useState(false);

  function play() {
    if (!currentSong) {
      const songs = getSongs();

      if (!songs.length) return;

      setCurrentSong(songs[0]);

      setPlaying(true);

      return;
    }

    setPlaying(true);
  }

  function pause() {
    setPlaying(false);
  }

  function togglePlayback() {
    if (!currentSong) {
      const songs = getSongs();

      if (!songs.length) return;

      setCurrentSong(songs[0]);
      setPlaying(true);

      return;
    }

    setPlaying(
      (value) => !value
    );
  }

  function playSong(song: Song) {
    setCurrentSong(song);
    setPlaying(true);

    /*
     * Make sure the selected song exists
     * in the current queue.
     */
    setQueue((currentQueue) => {
      const exists =
        currentQueue.some(
          (item) => item.id === song.id
        );

      if (exists) {
        return currentQueue;
      }

      return [
        ...currentQueue,
        song,
      ];
    });
  }

  function nextSong() {
    if (!queue.length) return;

    if (!currentSong) {
      setCurrentSong(queue[0]);
      setPlaying(true);

      return;
    }

    const index =
      queue.findIndex(
        (song) =>
          song.id === currentSong.id
      );

    if (index === -1) {
      setCurrentSong(queue[0]);
      setPlaying(true);

      return;
    }

    /*
     * Repeat current song.
     */
    if (repeat) {
      setPlaying(true);
      return;
    }

    /*
     * Shuffle.
     */
    if (shuffle && queue.length > 1) {
      const available =
        queue.filter(
          (song) =>
            song.id !==
            currentSong.id
        );

      const randomIndex =
        Math.floor(
          Math.random() *
            available.length
        );

      setCurrentSong(
        available[randomIndex]
      );

      setPlaying(true);

      return;
    }

    const nextIndex =
      (index + 1) %
      queue.length;

    setCurrentSong(
      queue[nextIndex]
    );

    setPlaying(true);
  }

  function previousSong() {
    if (!queue.length) return;

    if (!currentSong) {
      setCurrentSong(queue[0]);
      setPlaying(true);

      return;
    }

    const index =
      queue.findIndex(
        (song) =>
          song.id === currentSong.id
      );

    if (index === -1) {
      setCurrentSong(queue[0]);
      setPlaying(true);

      return;
    }

    const previousIndex =
      (index - 1 + queue.length) %
      queue.length;

    setCurrentSong(
      queue[previousIndex]
    );

    setPlaying(true);
  }

  const value =
    useMemo(
      () => ({
        currentSong,
        playing,

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
      }),
      [
        currentSong,
        playing,
        queue,
        shuffle,
        repeat,
      ]
    );

  return (
    <PlaybackContext.Provider
      value={value}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context =
    useContext(
      PlaybackContext
    );

  if (!context) {
    throw new Error(
      "usePlayback must be used inside PlaybackProvider"
    );
  }

  return context;
}