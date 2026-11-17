import { api } from "@/lib/api";
import { companyProfileStorageKey, mirrorClientSellerToAdmin } from "@/lib/adminSellerMirror";
import { shouldUseStaticClientData } from "@/lib/staticMode";
import type { User } from "@/contexts/AuthContext";
import type { ProfileResponse, ProfileUpdatePayload } from "./types";

const COMPANY_PROFILE_STORAGE_KEY = "shipsy-client-company-profile";
const USER_STORAGE_KEY = "shipsy-client-user";

function readUserName(): { firstName?: string; lastName?: string; email?: string; phone?: string } {
  if (typeof window === "undefined") return {};
  try {
    const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "{}");
    return {
      firstName: user.firstName || "Demo",
      lastName: user.lastName || "Seller",
      email: user.email || "sahilmittal1920@gmail.com",
      phone: user.phone || "9876543210",
    };
  } catch {
    return {};
  }
}

function readCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "{}") as User;
    return user?.id ? user : null;
  } catch {
    return null;
  }
}

function defaultProfile(): ProfileResponse {
  const user = readUserName();
  return {
    success: true,
    profile: {
      id: "static-company-profile",
      firstName: user.firstName ?? "Demo",
      lastName: user.lastName ?? "Seller",
      email: user.email ?? "sahilmittal1920@gmail.com",
      phone: user.phone ?? "9876543210",
      businessName: "",
      website: "",
      supportEmail: user.email ?? "",
      contactNumber: user.phone ?? "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      plan: "basic",
    },
  };
}

function readStaticProfile(): ProfileResponse {
  if (typeof window === "undefined") return defaultProfile();
  const currentUser = readCurrentUser();
  const storageKey = companyProfileStorageKey(currentUser?.id);
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    const profile = defaultProfile();
    // Only migrate a legacy record when it belongs to the signed-in email.
    // Old builds used one global key and caused one seller's profile to leak
    // into every subsequent seller account.
    const legacyRaw = localStorage.getItem(COMPANY_PROFILE_STORAGE_KEY);
    try {
      const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      if (
        legacy?.email === currentUser?.email &&
        legacy?.businessName !== "ACP Courier Speed Demo Store"
      ) {
        localStorage.setItem(storageKey, JSON.stringify(legacy));
        return { success: true, profile: { ...profile.profile, ...legacy } };
      }
    } catch {
      // Ignore malformed legacy browser data.
    }
    localStorage.setItem(storageKey, JSON.stringify(profile.profile));
    return profile;
  }
  try {
    return { success: true, profile: { ...defaultProfile().profile, ...JSON.parse(raw) } };
  } catch {
    const profile = defaultProfile();
    localStorage.setItem(storageKey, JSON.stringify(profile.profile));
    return profile;
  }
}

function writeStaticProfile(payload: ProfileUpdatePayload): ProfileResponse {
  const current = readStaticProfile().profile;
  const profile = { ...current, ...payload };
  if (typeof window !== "undefined") {
    const user = readCurrentUser();
    localStorage.setItem(companyProfileStorageKey(user?.id), JSON.stringify(profile));
    if (user?.id) mirrorClientSellerToAdmin(user, profile);
  }
  return { success: true, profile };
}

export const profileApi = {
  get: async (): Promise<ProfileResponse> => {
    if (shouldUseStaticClientData()) return readStaticProfile();
    try {
      const { data } = await api.get("/profile");
      return data?.profile ? data : readStaticProfile();
    } catch {
      return readStaticProfile();
    }
  },

  update: async (payload: ProfileUpdatePayload): Promise<ProfileResponse> => {
    if (!shouldUseStaticClientData()) {
      try {
        const { data } = await api.put("/profile", payload);
        if (data?.profile) {
          if (typeof window !== "undefined") {
            const user = readCurrentUser();
            localStorage.setItem(companyProfileStorageKey(user?.id), JSON.stringify(data.profile));
            if (user?.id) mirrorClientSellerToAdmin(user, data.profile);
          }
          return data;
        }
      } catch {
        // Persist locally when the static panel has no backend.
      }
    }
    return writeStaticProfile(payload);
  },
};
