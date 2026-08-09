"use client";

import Image from "next/image";
import {
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
} from "lucide-react";

import {
  getFeaturedSong,
  getFavoriteSongs,
} from "@/lib/songs";

import { usePlayback } from "@/lib/playback-store";

export default function SoundtrackScreen() {
  const featuredSong = getFeaturedSong();
  const favorites = getFavoriteSongs();

  const {
    currentSong,
    playing,
    queue,
    play,
    pause,
    togglePlayback,
    playSong,
    nextSong,
    previousSong,
  } = usePlayback();

  /*
   * The featured song is what we display when
   * nothing has been selected yet.
   *
   * Once playback starts, the actual current song
   * becomes the main player song.
   */
  const song = currentSong ?? featuredSong;

  const duration = song?.duration ?? 0;

  const minutes = Math.floor(duration / 60);
  const seconds = String(duration % 60).padStart(2, "0");

  /*
   * Remove the currently playing song from
   * the "Coming Up" section.
   */
  const upcomingSongs = queue.filter(
    (queuedSong) =>
      queuedSong.id !== currentSong?.id
  );

  function handlePlayPause() {
    if (!song) return;

    if (!currentSong) {
      playSong(song);
      return;
    }

    togglePlayback();
  }

  function handlePrevious() {
    previousSong();
  }

  function handleNext() {
    nextSong();
  }

  function handleSpotify() {
    if (!song?.spotifyUrl) return;

    window.open(
      song.spotifyUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (!song) {
    return (
      <main
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "40px 24px 160px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 54,
              color: "#456C57",
              fontFamily: "var(--font-serif)",
            }}
          >
            Our Soundtrack
          </h1>

          <p
            style={{
              marginTop: 10,
              color: "#7A887C",
            }}
          >
            Every memory deserves a song.
          </p>
        </div>

        <div
          style={{
            background: "#F8FAF8",
            borderRadius: 30,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Music2
            size={80}
            color="#456C57"
          />

          <h2
            style={{
              marginTop: 30,
            }}
          >
            No songs yet
          </h2>

          <p
            style={{
              color: "#7A887C",
            }}
          >
            Add your first Spotify song
            from the Admin CMS.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "40px 24px 160px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 54,
            color: "#456C57",
            fontFamily: "var(--font-serif)",
          }}
        >
          Our Soundtrack
        </h1>

        <p
          style={{
            marginTop: 10,
            color: "#7A887C",
          }}
        >
          Every memory deserves a song.
        </p>
      </div>

      {/* PLAYER */}

      <section
        style={{
          background: "white",
          borderRadius: 34,
          padding: 36,

          boxShadow:
            "0 20px 55px rgba(0,0,0,.08)",
        }}
      >
        {/* ALBUM COVER */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 280,
              height: 280,
              position: "relative",

              borderRadius: 34,

              overflow: "hidden",

              boxShadow: song.glow
                ? "0 0 90px rgba(255,215,120,.85)"
                : "0 25px 55px rgba(0,0,0,.15)",
            }}
          >
            <Image
              src={song.cover}
              alt={song.title}
              fill
              sizes="280px"
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* SONG INFORMATION */}

        <div
          style={{
            textAlign: "center",
            marginTop: 30,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 42,
              fontFamily:
                "var(--font-serif)",
            }}
          >
            {song.title}
          </h2>

          <p
            style={{
              marginTop: 10,
              fontSize: 20,
              color: "#6F6F6F",
            }}
          >
            {song.artist}
          </p>
        </div>

        {/* PROGRESS */}

        <div
          style={{
            marginTop: 40,
          }}
        >
          <div
            style={{
              height: 7,
              borderRadius: 999,
              background:
                "rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                width: playing
                  ? "35%"
                  : "0%",
                height: "100%",
                background: "#456C57",
                borderRadius: 999,

                transition:
                  "width .35s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",

              marginTop: 10,

              color: "#8C8C8C",
            }}
          >
            <span>
              {playing ? "1:12" : "0:00"}
            </span>

            <span>
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* CONTROLS */}

        <div
          style={{
            display: "flex",

            justifyContent:
              "center",

            alignItems: "center",

            gap: 36,

            marginTop: 36,
          }}
        >
          <button
            onClick={handlePrevious}
            aria-label="Previous song"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#456C57",
            }}
          >
            <SkipBack size={28} />
          </button>

          <button
            onClick={handlePlayPause}
            aria-label={
              playing
                ? "Pause song"
                : "Play song"
            }
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",

              border: "none",

              background: "#456C57",

              color: "white",

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",

              cursor: "pointer",

              boxShadow:
                "0 10px 25px rgba(69,108,87,.30)",

              transition:
                "transform .2s ease",
            }}
          >
            {playing ? (
              <Pause size={28} />
            ) : (
              <Play size={28} />
            )}
          </button>

          <button
            onClick={handleNext}
            aria-label="Next song"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#456C57",
            }}
          >
            <SkipForward size={28} />
          </button>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 16,

            marginTop: 36,
          }}
        >
          <button
            onClick={handleSpotify}
            style={{
              border: "none",

              padding: 18,

              borderRadius: 20,

              background:
                "#456C57",

              color: "white",

              fontWeight: 700,

              cursor: "pointer",
            }}
          >
            Open Spotify
          </button>

          <button
            style={{
              border:
                "1px solid rgba(69,108,87,.18)",

              background: "white",

              borderRadius: 20,

              fontWeight: 700,

              cursor: "pointer",

              display: "flex",

              justifyContent:
                "center",

              alignItems: "center",

              gap: 10,
            }}
          >
            <Heart
              size={18}
              fill={
                song.favorite
                  ? "#456C57"
                  : "none"
              }
              color="#456C57"
            />

            {song.favorite
              ? "Favorite"
              : "Favorite"}
          </button>
        </div>
      </section>

      {/* WHY THIS SONG */}

      {song.note && (
        <section
          style={{
            marginTop: 30,
            background: "white",
            borderRadius: 30,
            padding: 30,
            boxShadow:
              "0 18px 45px rgba(0,0,0,.06)",
          }}
        >
          <div
            style={{
              color: "#456C57",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            💛 Why This Song
          </div>

          <div
            style={{
              lineHeight: 1.9,
              fontSize: 18,
              fontStyle: "italic",
              color: "#555",
            }}
          >
            &ldquo;{song.note}&rdquo;
          </div>
        </section>
      )}

      {/* RELATED MEMORIES */}

      <section
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 30,
          padding: 30,
          boxShadow:
            "0 18px 45px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            color: "#456C57",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          📸 Related Memories
        </div>

        {song.memoryIds?.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(120px,1fr))",
              gap: 18,
            }}
          >
            {song.memoryIds.map(
              (memory: string) => (
                <div
                  key={memory}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 22,
                    background:
                      "linear-gradient(135deg,#E7EFE8,#DDE8DE)",
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    color: "#456C57",
                    fontWeight: 600,
                    textAlign: "center",
                    padding: 10,
                  }}
                >
                  {memory}
                </div>
              )
            )}
          </div>
        ) : (
          <div
            style={{
              color: "#8A8A8A",
            }}
          >
            No linked memories yet.
          </div>
        )}
      </section>

      {/* QUEUE */}

      <section
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 30,
          padding: 30,
          boxShadow:
            "0 18px 45px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            color: "#456C57",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          🎵 Coming Up
        </div>

        {upcomingSongs.length === 0 ? (
          <div
            style={{
              color: "#8A8A8A",
            }}
          >
            Queue is empty.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {upcomingSongs.map(
              (queuedSong) => (
                <button
                  key={queuedSong.id}
                  onClick={() =>
                    playSong(queuedSong)
                  }
                  style={{
                    display: "flex",
                    gap: 18,
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 20,
                    background: "#F8FAF8",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      position: "relative",
                      borderRadius: 16,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={queuedSong.cover}
                      alt={queuedSong.title}
                      fill
                      sizes="64px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {queuedSong.title}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color: "#8A8A8A",
                      }}
                    >
                      {queuedSong.artist}
                    </div>
                  </div>

                  <Play
                    size={20}
                    color="#456C57"
                  />
                </button>
              )
            )}
          </div>
        )}
      </section>

      {/* FAVORITES */}

      <section
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 30,
          padding: 30,
          boxShadow:
            "0 18px 45px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            color: "#456C57",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          ⭐ Favorite Songs
        </div>

        {favorites.length === 0 ? (
          <div
            style={{
              color: "#8A8A8A",
            }}
          >
            No favorite songs yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {favorites.map(
              (favoriteSong) => (
                <button
                  key={favoriteSong.id}
                  onClick={() =>
                    playSong(favoriteSong)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: 14,
                    borderRadius: 18,
                    background: "#F8FAF8",
                    border: "none",
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      position: "relative",
                      overflow: "hidden",
                      borderRadius: 14,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={favoriteSong.cover}
                      alt={favoriteSong.title}
                      fill
                      sizes="54px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div
                    style={{ flex: 1 }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {favoriteSong.title}
                    </div>

                    <div
                      style={{
                        color: "#888",
                        marginTop: 4,
                        fontSize: 14,
                      }}
                    >
                      {favoriteSong.artist}
                    </div>
                  </div>

                  <Heart
                    fill="#456C57"
                    color="#456C57"
                    size={18}
                  />
                </button>
              )
            )}
          </div>
        )}
      </section>

      {/* COLLECTIONS */}

      <section
        style={{
          marginTop: 30,
          background: "white",
          borderRadius: 30,
          padding: 30,
          boxShadow:
            "0 18px 45px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            color: "#456C57",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          📚 Collections
        </div>

        {song.albums.length === 0 ? (
          <div
            style={{
              color: "#8A8A8A",
            }}
          >
            No collections assigned.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
            }}
          >
            {song.albums.map(
              (album: string) => (
                <div
                  key={album}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 999,
                    background: "#EAF3EC",
                    color: "#456C57",
                    fontWeight: 600,
                  }}
                >
                  {album}
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* FOOTER */}

      <div
        style={{
          textAlign: "center",
          marginTop: 50,
          color: "#9A9A9A",
          fontSize: 14,
        }}
      >
        Evergreen Music Library
      </div>
    </main>
  );
}