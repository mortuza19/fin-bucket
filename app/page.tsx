"use client";

import { signInWithGoogle } from "@/lib/firebase";

export default function Home() {
  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}
