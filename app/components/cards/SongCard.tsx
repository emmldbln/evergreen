import Link from "next/link";
import Image from "next/image";
import GlassCard from "../ui/GlassCard";
import {
  ArrowRight,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from "lucide-react";

import type { Song } from "@/lib/songs";

interface Props {
  song: Song | null;
  queue?: Song[];
}

export default function SongCard({
  song,
  queue = [],
}: Props) {
  const hasSong = !!song;
  const hasNote = !!song?.note?.trim();

  return (
    <Link
      href="/soundtrack"
      style={{
        textDecoration: "none",
      }}
    >
      <GlassCard>
        <div
          style={{
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            minHeight: hasSong
              ? hasNote
                ? 640
                : 560
              : 560,
            transition: ".45s",
          }}
        >
          {!hasSong ? (
            <>
              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "#456C57",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontSize: 12,
                  }}
                >
                  SOUNDTRACK
                </div>
              </div>

              {/* ALBUM PLACEHOLDER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 30,
                    background:
                      "linear-gradient(135deg,#456C57,#6D8B77)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "white",

                    animation:
                      "evergreenFloat 5s ease-in-out infinite",

                    boxShadow:
                      "0 22px 60px rgba(69,108,87,.30)",
                  }}
                >
                  <Music2 size={82} />
                </div>
              </div>

              {/* TITLE */}

              <div
                style={{
                  textAlign: "center",
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
                  Our Soundtrack
                </h2>

                <p
                  style={{
                    marginTop: 14,
                    color: "#707070",
                    lineHeight: 1.8,
                  }}
                >
                  Connect Spotify songs
                  <br />
                  to your memories.
                </p>
              </div>

              {/* PLAYER */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background:
                      "rgba(0,0,0,.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: "100%",
                      background: "#456C57",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  <span>0:00</span>

                  <span>0:00</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    gap: 28,
                  }}
                >
                  <SkipBack
                    size={24}
                    color="#B9B9B9"
                  />

                  <div
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: "50%",
                      background: "#D7D7D7",

                      display: "flex",
                      justifyContent:
                        "center",

                      alignItems:
                        "center",
                    }}
                  >
                    <Play
                      size={26}
                      color="white"
                    />
                  </div>

                  <SkipForward
                    size={24}
                    color="#B9B9B9"
                  />
                </div>
              </div>

              {/* PLAYER STATUS */}

              <div
                style={{
                  borderTop:
                    "1px solid rgba(0,0,0,.08)",

                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#456C57",
                    letterSpacing: 1,
                    textTransform:
                      "uppercase",
                  }}
                >
                  Current Player
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  Nothing Playing
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#8A8A8A",
                  }}
                >
                  Add your first Spotify
                  song in the Admin CMS.
                </div>
              </div>
                            {/* QUEUE */}

              <div
                style={{
                  borderTop:
                    "1px solid rgba(0,0,0,.08)",
                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#456C57",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Coming Up
                </div>

                <div
                  style={{
                    marginTop: 12,
                    color: "#8A8A8A",
                  }}
                >
                  Queue is empty.
                </div>
              </div>

              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  color: "#456C57",
                  fontWeight: 700,
                }}
              >
                Open Soundtrack

                <ArrowRight size={22} />
              </div>
            </>
          ) : (
            <>
              {/* HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    background: "#456C57",
                    color: "white",
                    fontWeight: 700,
                    letterSpacing: 1,
                    fontSize: 12,
                  }}
                >
                  NOW PLAYING
                </div>
              </div>

              {/* ALBUM COVER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 210,
                    height: 210,
                    position: "relative",
                    borderRadius: 30,
                    overflow: "hidden",

                    animation:
                      "evergreenFloat 5s ease-in-out infinite",

                    boxShadow: hasNote
                      ? "0 0 70px rgba(255,215,120,.85)"
                      : "0 20px 45px rgba(0,0,0,.16)",
                  }}
                >
                  <Image
                    src={song.cover}
                    alt={song.title}
                    fill
                    sizes="210px"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              {/* SONG INFO */}

              <div
                style={{
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 40,
                    fontFamily:
                      "var(--font-serif)",
                  }}
                >
                  {song.title}
                </h2>

                <p
                  style={{
                    marginTop: 10,
                    fontSize: 18,
                    color: "#6D6D6D",
                  }}
                >
                  {song.artist}
                </p>
              </div>

              {/* PLAYER */}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background:
                      "rgba(0,0,0,.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "35%",
                      height: "100%",
                      background: "#456C57",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  <span>1:12</span>

                  <span>3:42</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "center",
                    alignItems: "center",
                    gap: 28,
                  }}
                >
                  <SkipBack
                    size={24}
                  />

                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: "#456C57",

                      display: "flex",
                      justifyContent:
                        "center",

                      alignItems:
                        "center",

                      color: "white",
                    }}
                  >
                    <Pause size={26} />
                  </div>

                  <SkipForward
                    size={24}
                  />
                </div>
              </div>

              {/* SPECIAL NOTE */}

              {hasNote && (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 20,

                    background:
                      "rgba(255,248,225,.75)",

                    border:
                      "1px solid rgba(255,220,120,.45)",

                    animation:
                      "evergreenGlow 3s ease-in-out infinite",

                    fontStyle: "italic",

                    lineHeight: 1.8,
                  }}
                >
                  "{song.note}"
                </div>
              )}
                            {/* QUEUE */}

              <div
                style={{
                  borderTop:
                    "1px solid rgba(0,0,0,.08)",
                  paddingTop: 18,
                }}
              >
                <div
                  style={{
                    color: "#456C57",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  Coming Up
                </div>

                {queue.length === 0 ? (
                  <div
                    style={{
                      color: "#8A8A8A",
                    }}
                  >
                    No songs in queue.
                  </div>
                ) : (
                  <>
                    {queue
                      .slice(0, 3)
                      .map((queuedSong, index) => (
                        <div
                          key={queuedSong.id}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 600,
                              }}
                            >
                              {index + 1}.{" "}
                              {queuedSong.title}
                            </div>

                            <div
                              style={{
                                fontSize: 14,
                                color: "#8A8A8A",
                                marginTop: 2,
                              }}
                            >
                              {queuedSong.artist}
                            </div>
                          </div>

                          <Music2
                            size={18}
                            color="#456C57"
                          />
                        </div>
                      ))}

                    {queue.length > 3 && (
                      <div
                        style={{
                          marginTop: 6,
                          color: "#8A8A8A",
                          fontSize: 14,
                        }}
                      >
                        +{queue.length - 3} more songs
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* FOOTER */}

              <div
                style={{
                  marginTop: "auto",

                  paddingTop: 20,

                  borderTop:
                    "1px solid rgba(0,0,0,.08)",

                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#456C57",
                    }}
                  >
                    Continue Listening
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 14,
                      color: "#8A8A8A",
                    }}
                  >
                    Open your personalized soundtrack
                  </div>
                </div>

                <div
                  style={{
                    width: 48,
                    height: 48,

                    borderRadius: "50%",

                    background: "#456C57",

                    display: "flex",

                    justifyContent:
                      "center",

                    alignItems: "center",

                    color: "white",

                    boxShadow:
                      "0 12px 25px rgba(69,108,87,.25)",
                  }}
                >
                  <ArrowRight size={22} />
                </div>
              </div>
            </>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}