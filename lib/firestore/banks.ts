import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bank } from "@/types/models";

export async function getBanks(): Promise<Bank[]> {
  const q = query(
    collection(db, "banks"),
    where("isPublic", "==", true),
    orderBy("name", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bank));
}

export async function createCustomBank(name: string): Promise<string> {
  const ref = await addDoc(collection(db, "banks"), {
    name: name.trim(),
    logoURL: null,
    isPublic: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}