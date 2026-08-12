export const PROFILE_STORAGE_KEY = "evergreen-profile";

export interface EvergreenProfile {
  displayName: string;
}

export const DEFAULT_PROFILE: EvergreenProfile = {
  displayName: "Ann Kylie",
};

export function getProfile(): EvergreenProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }

  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) {
      return DEFAULT_PROFILE;
    }

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.displayName !== "string"
    ) {
      return DEFAULT_PROFILE;
    }

    return {
      displayName:
        parsed.displayName.trim() || DEFAULT_PROFILE.displayName,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(
  profile: EvergreenProfile
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      displayName: profile.displayName.trim(),
    })
  );
}

export function getDisplayName(): string {
  return getProfile().displayName;
}