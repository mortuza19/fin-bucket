import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";

// This script is meant to be run once to seed the Firestore database with some initial banks.
// It can be run with `ts-node` or compiled and run with `node`.

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.FIREBASE_APP_ID ?? process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const banks = [
  { name: "Axis Bank" },
  { name: "HDFC Bank" },
  { name: "SBI" },
  { name: "ICICI Bank" },
];

async function main() {
  const existingSnap = await getDocs(query(collection(db, "banks"), where("isPublic", "==", true)));
  const existingNames = new Set(existingSnap.docs.map((docSnap) => docSnap.data().name as string));

  for (const bank of banks) {
    if (existingNames.has(bank.name)) {
      console.log(`Skipping existing bank: ${bank.name}`);
      continue;
    }

    const ref = await addDoc(collection(db, "banks"), {
      name: bank.name,
      logoURL: null,
      isPublic: true,
      createdAt: serverTimestamp(),
    });

    console.log(`Created bank ${bank.name} with id ${ref.id}`);
  }

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});