"use client";

import { useEffect, useState } from "react";
import GlassCard from "../ui/GlassCard";

const ANNIVERSARY = new Date("2022-05-18T00:00:00+08:00");

function calculateTime() {
  const now = new Date();

  const diff = now.getTime() - ANNIVERSARY.getTime();
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));

  const hours = Math.floor(
    (totalSeconds % (60 * 60 * 24)) / (60 * 60)
  );

  const minutes = Math.floor(
    (totalSeconds % (60 * 60)) / 60
  );

  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function CountdownCard() {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 20,
          color: "#35543A",
        }}
      >
        Since We Met ❤️
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        <TimeBox value={time.days} label="Days" />
        <TimeBox value={time.hours} label="Hours" />
        <TimeBox value={time.minutes} label="Minutes" />
        <TimeBox value={time.seconds} label="Seconds" />
      </div>

      <p
        style={{
          marginTop: 22,
          textAlign: "center",
          color: "#5C6F61",
          fontSize: 15,
        }}
      >
        Every second with you is my favorite memory.
      </p>
    </GlassCard>
  );
}

function TimeBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.38)",
        border: "1px solid rgba(255,255,255,.55)",
        borderRadius: 20,
        padding: "18px 10px",
        textAlign: "center",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: "#35543A",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#5B6C60",
          fontSize: 14,
        }}
      >
        {label}
      </div>
    </div>
  );
}