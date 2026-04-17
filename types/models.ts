import { Timestamp } from "firebase/firestore";

export type Gender = "male" | "female" | "non-binary" | "prefer-not-to-say";
export type AccountType = "savings" | "current";

export interface Bank {
  id: string;
  name: string;
  logoURL: string | null;
  isPublic: boolean;
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  gender: Gender | null;
  age: number;
  onboardingCompleted: boolean;
  onboardingStep: number;
  currency: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Account {
  id: string;
  bankId: string;
  nickname: string;
  accountType: AccountType;
  last4: string;
  initialBalance: number;
  currentBalance: number;
  isPrimary: boolean;
  createdAt: Timestamp;
}

export interface Income {
  id: string;
  label: string;
  amount: number;
  creditedDate: number; // 1–31
  isRecurring: boolean;
  accountId: string;
  createdAt: Timestamp;
}

export interface Bucket {
  id: string;
  name: string;
  allocatedAmount: number;
  emoji: string | null;
  color: string | null;
  priority: number;
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  accountId: string;
  bucketId: string | null;
  description: string;
  isManual: boolean;
  date: Timestamp;
  createdAt: Timestamp;
}