"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getProfile,
  saveProfile,
  getExperience,
  saveExperience,
} from "@/lib/profile";

import {
  User,
  Eye,
  Sparkles,
  Accessibility,
  Check,
} from "lucide-react";

export default function ProfilePane() {
  const [displayName, setDisplayName] =
    useState("Ann Kylie");

  const [fallingLeaves, setFallingLeaves] =
    useState(true);

  const [floatingParticles, setFloatingParticles] =
    useState(true);

  const [reducedMotion, setReducedMotion] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const profile = getProfile();
    const experience = getExperience();

    setDisplayName(profile.displayName);

    setFallingLeaves(
      experience.fallingLeaves
    );

    setFloatingParticles(
      experience.floatingParticles
    );

    setReducedMotion(
      experience.reducedMotion
    );
  }, []);

  function handleSave() {
    const cleanedName =
      displayName.trim() || "Ann Kylie";

    saveProfile({
      displayName: cleanedName,
    });

    saveExperience({
      fallingLeaves,
      floatingParticles,
      reducedMotion,
    });

    setDisplayName(cleanedName);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2200);
  }

  return (
    <section
      style={{
        height: "100%",
        minHeight: 680,

        padding: 42,

        display: "flex",
        flexDirection: "column",

        boxSizing: "border-box",
      }}
    >
      {/* ICON */}

      <div
        style={{
          width: 52,
          height: 52,

          borderRadius: 17,

          background:
            "rgba(69,108,87,.10)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          color: "#456C57",

          marginBottom: 26,
        }}
      >
        <User size={25} />
      </div>

      {/* LABEL */}

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          color: "#527560",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Profile
      </div>

      {/* TITLE */}

      <h2
        style={{
          margin: 0,

          fontFamily:
            "var(--font-serif)",

          fontSize:
            "clamp(34px, 3vw, 46px)",

          fontWeight: 500,

          lineHeight: 1.05,

          color: "#304A39",
        }}
      >
        Your Space
      </h2>

      {/* DESCRIPTION */}

      <p
        style={{
          margin:
            "16px 0 34px",

          color: "#718176",

          fontSize: 15,

          lineHeight: 1.7,

          maxWidth: 360,
        }}
      >
        Personalize how Evergreen
        feels and addresses you.
      </p>

      {/* DISPLAY NAME */}

      <div
        style={{
          marginBottom: 30,
        }}
      >
        <label
          htmlFor="evergreen-display-name"
          style={{
            display: "block",

            fontSize: 11,

            fontWeight: 700,

            letterSpacing: 2,

            color: "#527560",

            textTransform: "uppercase",

            marginBottom: 10,
          }}
        >
          Display Name
        </label>

        <input
          id="evergreen-display-name"
          type="text"
          value={displayName}
          onChange={(event) =>
            setDisplayName(
              event.target.value
            )
          }
          placeholder="Ann Kylie"
          maxLength={40}
          style={{
            width: "100%",

            height: 48,

            boxSizing: "border-box",

            borderRadius: 16,

            border:
              "1px solid rgba(69,108,87,.18)",

            background:
              "rgba(255,255,255,.45)",

            padding:
              "0 16px",

            outline: "none",

            color: "#304A39",

            fontSize: 15,

            fontFamily:
              "inherit",

            transition:
              "border .2s, background .2s",
          }}
          onFocus={(event) => {
            event.currentTarget.style.border =
              "1px solid rgba(69,108,87,.45)";

            event.currentTarget.style.background =
              "rgba(255,255,255,.65)";
          }}
          onBlur={(event) => {
            event.currentTarget.style.border =
              "1px solid rgba(69,108,87,.18)";

            event.currentTarget.style.background =
              "rgba(255,255,255,.45)";
          }}
        />
      </div>

      {/* EXPERIENCE */}

      <div>
        <div
          style={{
            fontSize: 11,

            fontWeight: 700,

            letterSpacing: 2,

            color: "#527560",

            textTransform: "uppercase",

            marginBottom: 12,
          }}
        >
          Experience
        </div>

        {/* FALLING LEAVES */}

        <ExperienceToggle
          icon={<Eye size={18} />}
          title="Falling Leaves"
          description="Floating leaves in the background"
          checked={fallingLeaves}
          onChange={setFallingLeaves}
        />

        {/* FLOATING PARTICLES */}

        <ExperienceToggle
          icon={<Sparkles size={18} />}
          title="Floating Particles"
          description="Soft ambient particles"
          checked={floatingParticles}
          onChange={setFloatingParticles}
        />

        {/* REDUCED MOTION */}

        <ExperienceToggle
          icon={
            <Accessibility size={18} />
          }
          title="Reduced Motion"
          description="Reduce background animations"
          checked={reducedMotion}
          onChange={setReducedMotion}
        />
      </div>

      {/* SAVE */}

      <div
        style={{
          marginTop: "auto",
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          style={{
            width: "100%",

            height: 48,

            border: "none",

            borderRadius: 16,

            background:
              saved
                ? "#527A63"
                : "#456C57",

            color: "white",

            fontFamily:
              "inherit",

            fontSize: 14,

            fontWeight: 700,

            cursor: "pointer",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: 8,

            boxShadow:
              "0 12px 28px rgba(69,108,87,.18)",

            transition:
              "background .25s, transform .2s",
          }}
        >
          {saved ? (
            <>
              <Check size={17} />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        <div
          style={{
            textAlign: "center",

            marginTop: 12,

            fontSize: 12,

            color: "#98A69D",
          }}
        >
          Saved on this device
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------
   EXPERIENCE TOGGLE
-------------------------------------------------- */

interface ExperienceToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
}

function ExperienceToggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: ExperienceToggleProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      aria-pressed={checked}
      style={{
        width: "100%",

        minHeight: 62,

        border: "none",

        borderRadius: 16,

        background:
          checked
            ? "rgba(255,255,255,.48)"
            : "rgba(255,255,255,.28)",

        marginBottom: 10,

        padding:
          "10px 12px",

        display: "flex",

        alignItems: "center",

        gap: 12,

        cursor: "pointer",

        textAlign: "left",

        fontFamily:
          "inherit",

        transition:
          "background .25s, transform .2s",
      }}
    >
      {/* ICON */}

      <div
        style={{
          width: 36,
          height: 36,

          flexShrink: 0,

          borderRadius: 12,

          background:
            checked
              ? "rgba(69,108,87,.10)"
              : "rgba(120,130,125,.08)",

          color:
            checked
              ? "#456C57"
              : "#8D9992",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      {/* TEXT */}

      <div
        style={{
          flex: 1,

          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 13,

            fontWeight: 600,

            color: "#425449",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 2,

            fontSize: 11,

            color: "#91A097",

            whiteSpace: "nowrap",

            overflow: "hidden",

            textOverflow: "ellipsis",
          }}
        >
          {description}
        </div>
      </div>

      {/* SWITCH */}

      <div
        style={{
          width: 40,

          height: 24,

          flexShrink: 0,

          borderRadius: 999,

          padding: 3,

          boxSizing: "border-box",

          background:
            checked
              ? "#456C57"
              : "rgba(80,100,90,.16)",

          transition:
            "background .25s",
        }}
      >
        <div
          style={{
            width: 18,

            height: 18,

            borderRadius: "50%",

            background: "white",

            boxShadow:
              "0 2px 5px rgba(0,0,0,.12)",

            transform:
              checked
                ? "translateX(16px)"
                : "translateX(0)",

            transition:
              "transform .25s",
          }}
        />
      </div>
    </button>
  );
}