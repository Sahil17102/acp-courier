import { api } from "@/lib/api";
import type { PickupAddressesResponse } from "./types";

const useStaticData = import.meta.env.VITE_STATIC_DATA_ENABLED === "true";
const sharedApiUrl = (import.meta.env.VITE_API_URL || "https://acp-courier2-new.onrender.com/api").replace(/\/+$/, "");

export const pickupAddressApi = {
  listByUser: async (userId: string): Promise<PickupAddressesResponse> => {
    if (useStaticData) {
      const response = await fetch(`${sharedApiUrl}/admin/users/${encodeURIComponent(userId)}/pickup-addresses`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error("Pickup addresses are unavailable");
      return await response.json() as PickupAddressesResponse;
    }
    const { data } = await api.get(`/users/${userId}/pickup-addresses`);
    return data;
  },
};
