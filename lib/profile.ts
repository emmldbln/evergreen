"use client";

export interface Profile {
  displayName: string;
}

export interface ExperienceSettings {
  fallingLeaves: boolean;
  floatingParticles: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_PROFILE: Profile = {
  displayName: "Ann Kylie Manamtam",
};

export const DEFAULT_EXPERIENCE: ExperienceSettings = {
  fallingLeaves: true,
  floatingParticles: true,
  reducedMotion: false,
};

const PROFILE_STORAGE_KEY = "evergreen-profile";
const EXPERIENCE_STORAGE_KEY =
  "evergreen-experience-settings";

/* =========================================================
   PROFILE
========================================================= */

export function getProfile(): Profile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  try {
    const stored = localStorage.getItem(
      PROFILE_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_PROFILE;
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return DEFAULT_PROFILE;
    }

    const data =
      parsed as Record<string, unknown>;

    return {
      displayName:
        typeof data.displayName === "string" &&
        data.displayName.trim().length > 0
          ? data.displayName
          : DEFAULT_PROFILE.displayName,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(
  updates: Partial<Profile>
): Profile {
  const current = getProfile();

  const next: Profile = {
    ...current,
    ...updates,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(next)
      );

      /*
       * Notify other components after the current
       * event has completed.
       */
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(
            "evergreen-profile-changed",
            {
              detail: next,
            }
          )
        );
      }, 0);
    } catch {
      // Ignore localStorage errors.
    }
  }

  return next;
}

export function getDisplayName(): string {
  return getProfile().displayName;
}

/* =========================================================
   EXPERIENCE
========================================================= */

export function getExperience(): ExperienceSettings {
  if (typeof window === "undefined") {
    return DEFAULT_EXPERIENCE;
  }

  try {
    const stored = localStorage.getItem(
      EXPERIENCE_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_EXPERIENCE;
    }

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return DEFAULT_EXPERIENCE;
    }

    const data =
      parsed as Record<string, unknown>;

    return {
      fallingLeaves:
        typeof data.fallingLeaves === "boolean"
          ? data.fallingLeaves
          : DEFAULT_EXPERIENCE.fallingLeaves,

      floatingParticles:
        typeof data.floatingParticles === "boolean"
          ? data.floatingParticles
          : DEFAULT_EXPERIENCE.floatingParticles,

      reducedMotion:
        typeof data.reducedMotion === "boolean"
          ? data.reducedMotion
          : DEFAULT_EXPERIENCE.reducedMotion,
    };
  } catch {
    return DEFAULT_EXPERIENCE;
  }
}

export function saveExperience(
  updates: Partial<ExperienceSettings>
): ExperienceSettings {
  const current = getExperience();

  const next: ExperienceSettings = {
    ...current,
    ...updates,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        EXPERIENCE_STORAGE_KEY,
        JSON.stringify(next)
      );

      /*
       * IMPORTANT:
       *
       * Do NOT dispatch the event synchronously.
       *
       * SettingsPage may currently be inside a React
       * state update. Scheduling the event allows React
       * to finish rendering first.
       */
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(
            "evergreen-experience-changed",
            {
              detail: next,
            }
          )
        );
      }, 0);
    } catch {
      // Ignore localStorage errors.
    }
  }

  return next;
}