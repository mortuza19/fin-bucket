// Firestore data model types for Fin-Bucket.
//
// This file defines the top-level shape of user-related documents stored in
// Firestore. It is intended to document the collections used by auth-protected
// app data and make future Firestore helpers strongly typed.
export type FirestoreUser = {
  email: string;
  displayName: string;
  photoURL?: string;
  preferredCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreAccount = {
  name: string;
  type: "checking" | "savings" | "credit" | "cash" | "other";
  currency: string;
  balance: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreIncome = {
  source: string;
  amount: number;
  currency: string;
  frequency: "weekly" | "biweekly" | "monthly" | "annual" | "one-time";
  nextPaymentDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreBucket = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  color?: string;
  category?: string;
  isGoal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreTransaction = {
  amount: number;
  currency: string;
  accountId: string;
  bucketId?: string;
  type: "expense" | "income" | "transfer";
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type FirestoreUserSeed = {
  user: FirestoreUser;
  accounts: FirestoreAccount[];
  incomes: FirestoreIncome[];
  buckets: FirestoreBucket[];
  transactions: FirestoreTransaction[];
};

export const firestoreDataModelExample: FirestoreUserSeed = {
  user: {
    email: "user@example.com",
    displayName: "Fin Bucket User",
    preferredCurrency: "USD",
    createdAt: "2026-04-16T00:00:00.000Z",
    updatedAt: "2026-04-16T00:00:00.000Z",
  },
  accounts: [
    {
      name: "Everyday Checking",
      type: "checking",
      currency: "USD",
      balance: 1284.5,
      color: "#3B82F6",
      createdAt: "2026-04-16T00:00:00.000Z",
      updatedAt: "2026-04-16T00:00:00.000Z",
    },
    {
      name: "Savings",
      type: "savings",
      currency: "USD",
      balance: 5420.0,
      color: "#10B981",
      createdAt: "2026-04-16T00:00:00.000Z",
      updatedAt: "2026-04-16T00:00:00.000Z",
    },
  ],
  incomes: [
    {
      source: "Paycheck",
      amount: 3200,
      currency: "USD",
      frequency: "monthly",
      nextPaymentDate: "2026-05-01",
      active: true,
      createdAt: "2026-04-16T00:00:00.000Z",
      updatedAt: "2026-04-16T00:00:00.000Z",
    },
  ],
  buckets: [
    {
      name: "Rent & Bills",
      targetAmount: 2000,
      currentAmount: 1500,
      currency: "USD",
      color: "#F97316",
      category: "Housing",
      isGoal: true,
      createdAt: "2026-04-16T00:00:00.000Z",
      updatedAt: "2026-04-16T00:00:00.000Z",
    },
    {
      name: "Groceries",
      targetAmount: 500,
      currentAmount: 270,
      currency: "USD",
      color: "#8B5CF6",
      category: "Food",
      isGoal: false,
      createdAt: "2026-04-16T00:00:00.000Z",
      updatedAt: "2026-04-16T00:00:00.000Z",
    },
  ],
  transactions: [
    {
      amount: 1200,
      currency: "USD",
      accountId: "everyday-checking",
      bucketId: "rent-bills",
      type: "expense",
      category: "Housing",
      description: "April rent payment",
      date: "2026-04-01",
      createdAt: "2026-04-01T10:00:00.000Z",
      updatedAt: "2026-04-01T10:00:00.000Z",
    },
    {
      amount: 3200,
      currency: "USD",
      accountId: "everyday-checking",
      type: "income",
      category: "Salary",
      description: "Monthly salary",
      date: "2026-04-15",
      createdAt: "2026-04-15T08:00:00.000Z",
      updatedAt: "2026-04-15T08:00:00.000Z",
    },
  ],
};

export const firestorePathNotes = {
  users: "/users/{userId}",
  accounts: "/users/{userId}/accounts/{accountId}",
  income: "/users/{userId}/income/{incomeId}",
  buckets: "/users/{userId}/buckets/{bucketId}",
  transactions: "/users/{userId}/transactions/{transactionId}",
};
