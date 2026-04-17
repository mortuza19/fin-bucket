import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types/models";

export async function createUserProfileIfNotExists(
  user: FirebaseUser
): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? null,
      gender: null,
      dateOfBirth: null,
      onboardingCompleted: false,
      onboardingStep: 1,
      currency: "INR",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as unknown as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}