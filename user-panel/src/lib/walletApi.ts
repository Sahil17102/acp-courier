import { api } from "./api";

const STATIC_WALLET_TRANSACTIONS_KEY = "shipsy-static-wallet-transactions";
const STATIC_WALLET_ID = "wallet-demo-client-user";
export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  amount: number;
  currency: string;
  type: "credit" | "debit";
  reason: string;
  ref?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface WalletTransactionStats {
  totalCredits: number;
  totalDebits: number;
}

export interface WalletTransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: WalletTransactionStats;
  courierOptions: string[];
}

export interface CreateRechargeOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyRechargeResponse {
  message: string;
  balance: number;
  creditedAmount: number;
}

function readStaticTransactions(): WalletTransaction[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STATIC_WALLET_TRANSACTIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WalletTransaction[]) : [];
  } catch {
    return [];
  }
}

function writeStaticTransactions(transactions: WalletTransaction[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STATIC_WALLET_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
}

function getStaticBalance(transactions = readStaticTransactions()): number {
  return transactions.filter((transaction) => transaction.walletId === STATIC_WALLET_ID).reduce((sum, transaction) => {
    return transaction.type === "credit"
      ? sum + transaction.amount
      : sum - transaction.amount;
  }, 0);
}

function filterStaticTransactions(
  transactions: WalletTransaction[],
  params?: {
    type?: "credit" | "debit";
    serviceProvider?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: string;
  },
): WalletTransactionsResponse {
  let filtered = [...transactions];

  if (params?.type) {
    filtered = filtered.filter((transaction) => transaction.type === params.type);
  }
  if (params?.serviceProvider) {
    filtered = filtered.filter((transaction) => transaction.meta?.serviceProvider === params.serviceProvider);
  }
  if (params?.dateFrom) {
    const from = new Date(`${params.dateFrom}T00:00:00`).getTime();
    filtered = filtered.filter((transaction) => new Date(transaction.createdAt).getTime() >= from);
  }
  if (params?.dateTo) {
    const to = new Date(`${params.dateTo}T23:59:59`).getTime();
    filtered = filtered.filter((transaction) => new Date(transaction.createdAt).getTime() <= to);
  }

  filtered.sort((a, b) => {
    const direction = params?.sortOrder === "asc" ? 1 : -1;
    if (params?.sortField === "amount") return (a.amount - b.amount) * direction;
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
  });

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalCredits = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalDebits = transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    transactions: paginated,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    stats: { totalCredits, totalDebits },
    courierOptions: [
      ...new Set(
        transactions
          .map((transaction) => transaction.meta?.serviceProvider)
          .filter((value): value is string => typeof value === "string" && value.length > 0),
      ),
    ],
  };
}

export const walletApi = {
  getBalance: async (): Promise<WalletBalance> => {
    const { data } = await api.get<WalletBalance>("/wallet/balance");
    return data;
  },

  getTransactions: async (params?: {
    type?: "credit" | "debit";
    serviceProvider?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: string;
  }): Promise<WalletTransactionsResponse> => {
    const { data } = await api.get<WalletTransactionsResponse>("/wallet/transactions", { params });
    // The API normally returns pagination, totals and courier filters together.
    // Keep this local normaliser for a partially populated response during a
    // deployment transition; it does not read browser wallet data or replace
    // a valid live ledger response.
    if (data?.pagination && data?.stats && Array.isArray(data?.courierOptions)) {
      return data;
    }
    return filterStaticTransactions(Array.isArray(data?.transactions) ? data.transactions : [], params);
  },

  createRechargeOrder: async (amount: number): Promise<CreateRechargeOrderResponse> => {
    const { data } = await api.post<CreateRechargeOrderResponse>(
      "/wallet/recharge/create-order",
      { amount },
    );
    return data;
  },

  verifyRecharge: async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<VerifyRechargeResponse> => {
    const { data } = await api.post<VerifyRechargeResponse>(
      "/wallet/recharge/verify",
      payload,
    );
    return data;
  },

  rechargeStatic: async (amount: number): Promise<VerifyRechargeResponse> => {
    const roundedAmount = Math.round(amount * 100) / 100;
    const transactions = readStaticTransactions();
    const transaction: WalletTransaction = {
      id: `txn-${Date.now()}`,
      walletId: STATIC_WALLET_ID,
      amount: roundedAmount,
      currency: "INR",
      type: "credit",
      reason: "wallet_recharge",
      ref: `LGC-RCH-${Date.now().toString().slice(-8)}`,
      meta: { source: "static_recharge" },
      createdAt: new Date().toISOString(),
    };
    const next = [transaction, ...transactions];
    writeStaticTransactions(next);
    return {
      message: "Wallet recharged",
      balance: getStaticBalance(next),
      creditedAmount: roundedAmount,
    };
  },

  debitOrder: async (amount: number, orderId: string, serviceProvider?: string): Promise<WalletBalance> => {
    const roundedAmount = Math.round(amount * 100) / 100;
    if (!Number.isFinite(roundedAmount) || roundedAmount <= 0) {
      throw new Error("A valid shipping charge is required before creating the order");
    }
    // Stop before any courier API call when the seller cannot cover the live
    // shipment charge. This gives the booking screen an actionable message
    // instead of an ambiguous wallet/debit failure.
    const currentWallet = await walletApi.getBalance();
    if (Number(currentWallet.balance) < roundedAmount) {
      const shortfall = Math.max(0, roundedAmount - Number(currentWallet.balance));
      throw new Error(`Insufficient wallet balance. Add at least ₹${shortfall.toFixed(2)} to book this shipment.`);
    }
    const { data } = await api.post<{ wallet: WalletBalance }>("/wallet/debit", {
      amount: roundedAmount, reason: `Shipping charge - ${orderId}`, orderId, serviceProvider,
    });
    return data.wallet;
  },

  refundOrder: async (amount: number, orderId: string, serviceProvider?: string): Promise<void> => {
    await api.post("/wallet/refund", {
      amount: Math.round(amount * 100) / 100,
      reason: `Shipping charge refund - ${orderId}`,
      orderId,
      serviceProvider,
    });
  },
};
