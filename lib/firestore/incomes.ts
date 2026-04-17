import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Income } from "@/types/models";

export async function createIncome(
  uid: string,
  data: Omit<Income, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "users", uid, "incomes"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}