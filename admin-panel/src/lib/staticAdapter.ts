import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { calculateDefaultB2cRates } from "@/features/pricingDefaults";

const EMPTY_PAGINATION = { page: 1, limit: 20, total: 0, totalPages: 0 };
const EMPTY_ORDER_STATS = {
  total: 0, created: 0, processing: 0, booked: 0, pickup_initiated: 0,
  shipped: 0, in_transit: 0, out_for_delivery: 0, delivered: 0, ndr: 0,
  rto_initiated: 0, rto_in_transit: 0, rto_delivered: 0, cancelled: 0,
  lost: 0, totalRevenue: 0,
};

const EMPTY_DASHBOARD = {
  overview: {
    totalOrders: 0, previousOrders: 0, ordersToday: 0, activeSellers: 1,
    revenue: 0, previousRevenue: 0, deliveryRate: 0, previousDeliveryRate: 0,
    avgDeliveryDays: null,
  },
  courierInsights: [], trends: [],
  revenue: { margins: [], totalRevenue: 0, totalCost: 0, totalMargin: 0 },
  sellers: { topSellers: [], highRtoSellers: [] },
  alerts: { failureSpikes: [], delayedShipments: 0, ndrPending: 0, totalAlerts: 0 },
  pendingActions: { kycPending: 0, bankApprovalsPending: 0, codRemittancesPending: 0 },
  paymentSplit: {
    prepaid: { orders: 0, delivered: 0, revenue: 0, codAmount: 0 },
    cod: { orders: 0, delivered: 0, revenue: 0, codAmount: 0 },
  },
  topStates: [], statusDistribution: [],
};

const REPORT_FIELDS = [
  { key: "orderId", label: "Order ID" },
  { key: "awb", label: "AWB" },
  { key: "status", label: "Status" },
  { key: "orderType", label: "Order Type" },
  { key: "paymentType", label: "Payment Type" },
  { key: "orderAmount", label: "Order Amount" },
  { key: "createdAt", label: "Created At" },
];

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {};
  if (typeof config.data === "object") return config.data as Record<string, unknown>;
  try { return JSON.parse(String(config.data)) as Record<string, unknown>; } catch { return {}; }
}

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): Promise<AxiosResponse> {
  return Promise.resolve({ data, status, statusText: status === 200 ? "OK" : "Created", headers: {}, config });
}

function emptyKyc(userId: string) {
  const document = { status: "not_uploaded" };
  return {
    success: true,
    kyc: {
      id: `kyc-${userId}`, userId, status: "not_submitted",
      selfie: document, panCard: document, aadhaar: document, cancelledCheque: document,
      boardResolution: document, partnershipDeed: document, llpAgreement: document,
      companyAddressProof: document, businessPan: document, gstCertificate: document,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Standalone ACP demo adapter. It deliberately prevents every network call
 * while keeping non-integrated admin screens usable with empty/local data.
 */
export const staticAdminAdapter: AxiosAdapter = async (config) => {
  const path = String(config.url || "").split("?")[0];
  const method = String(config.method || "get").toLowerCase();
  const body = parseBody(config);

  if (path === "/dashboard") return response(config, EMPTY_DASHBOARD);
  if (path === "/rates/available") return response(config, { success: true, data: calculateDefaultB2cRates(body) });

  if (path === "/orders/ndr/list" || path === "/orders/rto/list") {
    return response(config, { orders: [], total: 0 });
  }
  if (path === "/orders/exports") return response(config, { jobs: [], pagination: EMPTY_PAGINATION });
  if (/^\/orders\/[^/]+\/(tracking|ndr-events|rto-events)$/.test(path)) return response(config, []);
  if (path === "/orders") {
    return response(config, { orders: [], pagination: EMPTY_PAGINATION, stats: EMPTY_ORDER_STATS });
  }
  if (path === "/orders/export" && method === "post") {
    return response(config, { job: { id: "demo-export", status: "completed", totalRows: 0, processedRows: 0 }, reused: false });
  }

  if (path === "/blogs" && method === "get") {
    return response(config, { success: true, data: { blogs: [], pagination: EMPTY_PAGINATION } });
  }
  if (path === "/blogs" && method === "post") {
    const now = new Date().toISOString();
    return response(config, { success: true, blog: { ...body, id: `blog-${Date.now()}`, createdAt: now, updatedAt: now } }, 201);
  }

  if (path === "/reports/fields") return response(config, { fields: REPORT_FIELDS });
  if (path === "/reports/preview") return response(config, { count: 0 });
  if (path === "/reports/generate") return response(config, new Blob(["No ACP orders available\n"], { type: "text/csv" }));

  const kycMatch = path.match(/^\/users\/([^/]+)\/kyc$/);
  if (kycMatch) return response(config, emptyKyc(kycMatch[1]));
  if (/^\/users\/[^/]+\/pickup-addresses$/.test(path)) return response(config, { addresses: [] });
  if (/^\/bank-accounts\/user\/[^/]+$/.test(path)) return response(config, { success: true, accounts: [] });

  if (path === "/billing-invoices") return response(config, { invoices: [], pagination: EMPTY_PAGINATION });
  if (path === "/cod-remittance/stats") {
    return response(config, { totalPending: 0, todayCredited: 0, totalCredited: 0, usersWithPending: 0 });
  }
  if (path === "/cod-remittance/remittances" || /^\/cod-remittance\/users\//.test(path)) {
    return response(config, { remittances: [], pagination: EMPTY_PAGINATION });
  }
  if (path === "/cod-remittance/preview-settlement-csv") {
    return response(config, { items: [], summary: { matched: 0, discrepancies: 0, notFound: 0, alreadyCredited: 0 } });
  }

  if (path === "/support-tickets") return response(config, { items: [] });
  if (path === "/notifications/preferences") return response(config, {});

  // Mutations not backed by a local feature store succeed without contacting a
  // courier or third-party API. Screens remain explorable until ACP connects its backend.
  return response(config, { success: true, message: "Saved in ACP standalone mode." });
};
