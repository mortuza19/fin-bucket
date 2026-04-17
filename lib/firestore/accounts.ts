import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Account } from "@/types/models";

export async function createAccount(
  uid: string,
  data: Omit<Account, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", uid, "accounts"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAccounts(uid: string): Promise<Account[]> {
  const snap = await getDocs(collection(db, "users", uid, "accounts"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Account));
}