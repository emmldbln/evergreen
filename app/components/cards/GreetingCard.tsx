"use client";

import GlassCard from "../ui/GlassCard";

export default function GreetingCard() {
  const hour = new Date().getHours();

  let greeting = "Good Evening 🌙";

  if (hour < 12) greeting = "Good Morning ☀️";
  else if (hour < 18) greeting = "Good Afternoon 🌿";

  return (
    <GlassCard>
      <div
        style={{
          padding: 34,
        }}
      >
        <p
          style={{
            color: "#6D7A70",
            fontSize: 18,
            marginBottom: 10,
          }}
        >
          {greeting}
        </p>

        <h1
          style={{
            fontSize: 60,
            fontWeight: 700,
            color: "#1E2D22",
            lineHeight: 1,
          }}
        >
          Ann Kylie ❤️
        </h1>

        <p
          style={{
            color: "#6D7A70",
            marginTop: 16,
            fontSize: 18,
            lineHeight: 1.6,
          }}
        >
          Every day with you becomes another page in our story.
        </p>
      </div>
    </GlassCard>
  );
}