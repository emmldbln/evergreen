"use client";

import { useEffect, useState } from "react";
import { getDisplayName } from "@/lib/profile";
import GlassCard from "@/app/components/ui/GlassCard";

export default function GreetingCard() {
  const [displayName, setDisplayName] = useState("Ann Kylie");

  useEffect(() => {
    setDisplayName(getDisplayName());
  }, []);

  const hour = new Date().getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) {
    greeting = "Good Morning 🌞";
  } else if (hour < 18) {
    greeting = "Good Afternoon 🌤️";
  }

  return (
    <GlassCard>
      {/* Greeting */}
      <p
        style={{
          margin: 0,
          fontSize: 19,
          lineHeight: 1.4,
          color: "#718176",
          textAlign: "left",
        }}
      >
        {greeting}
      </p>

      {/* Name + Heart */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "12px 0 18px",
          padding: "0 45px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(38px, 5vw, 56px)",
            lineHeight: 1.05,
            fontWeight: 500,
            color: "#263A2D",
            textAlign: "center",
          }}
        >
          {displayName}
        </h1>

        {/* Heart */}
        <span
          style={{
            position: "absolute",
            right: 0,
            bottom: 4,
            fontSize: "clamp(30px, 4vw, 44px)",
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
      
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 16,
          lineHeight: 1.7,
          color: "#718176",
          textAlign: "center",
        }}
      >
        Every day with you becomes another page in our story.
      </p>
    </GlassCard>
  );
}