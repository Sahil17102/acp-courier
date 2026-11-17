import { api } from "@/lib/api";
import type { AdminKycResponse } from "./types";

const useStaticData = import.meta.env.VITE_STATIC_DATA_ENABLED === "true";
const sharedApiUrl = (import.meta.env.VITE_API_URL || "https://acp-courier2-new.onrender.com/api").replace(/\/+$/, "");

async function liveKycRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${sharedApiUrl}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const payload = await response.json() as T & { message?: string };
  if (!response.ok) throw new Error(payload.message || "KYC request failed");
  return payload;
}

/** Fetch a KYC document as a blob URL (goes through axios with auth token) */
export async function fetchDocumentBlob(
  userId: string,
  key: string,
  filename: string,
): Promise<string> {
  const { data } = await api.get(`/document/${userId}/${key}/${filename}`, {
    responseType: "blob",
  });
  return URL.createObjectURL(data);
}

export const adminKycApi = {
  getByUserId: async (userId: string): Promise<AdminKycResponse> => {
    if (useStaticData) return liveKycRequest<AdminKycResponse>(`/admin/users/${encodeURIComponent(userId)}/kyc`);
    const { data } = await api.get(`/users/${userId}/kyc`);
    return data as AdminKycResponse;
  },

  approve: async (id: string): Promise<AdminKycResponse> => {
    if (useStaticData) return liveKycRequest<AdminKycResponse>(`/admin/kyc/${encodeURIComponent(id)}/approve`, { method: "POST" });
    const { data } = await api.post(`/kyc/${id}/approve`);
    return data as AdminKycResponse;
  },

  reject: async (id: string, rejectionReason: string): Promise<AdminKycResponse> => {
    if (useStaticData) return liveKycRequest<AdminKycResponse>(`/admin/kyc/${encodeURIComponent(id)}/reject`, { method: "POST", body: JSON.stringify({ rejectionReason }) });
    const { data } = await api.post(`/kyc/${id}/reject`, { rejectionReason });
    return data as AdminKycResponse;
  },

  approveDocument: async (id: string, key: string): Promise<AdminKycResponse> => {
    if (useStaticData) return liveKycRequest<AdminKycResponse>(`/admin/kyc/${encodeURIComponent(id)}/document/${encodeURIComponent(key)}/approve`, { method: "POST" });
    const { data } = await api.post(`/kyc/${id}/document/${key}/approve`);
    return data as AdminKycResponse;
  },

  rejectDocument: async (
    id: string,
    key: string,
    rejectionReason: string,
  ): Promise<AdminKycResponse> => {
    if (useStaticData) return liveKycRequest<AdminKycResponse>(`/admin/kyc/${encodeURIComponent(id)}/document/${encodeURIComponent(key)}/reject`, { method: "POST", body: JSON.stringify({ rejectionReason }) });
    const { data } = await api.post(`/kyc/${id}/document/${key}/reject`, {
      rejectionReason,
    });
    return data as AdminKycResponse;
  },

  /** Build a URL to serve a KYC document via the admin proxy */
  getDocumentUrl: (userId: string, key: string, filename: string): string =>
    `/api/admin/document/${userId}/${key}/${filename}`,
};
