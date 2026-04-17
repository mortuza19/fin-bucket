"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, createUserProfileIfNotExists } from "@/lib/firestore/users";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { UserProfile } from "@/types/models";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Not signed in — redirect to sign-in or sign in automatically
    if (!user) {
      setPageLoading(false);
      return;
    }

    async function init() {
      try {
        await createUserProfileIfNotExists(user!);
        const p = await getUserProfile(user!.uid);

        if (p?.onboardingCompleted) {
          // Already done — skip wizard
          router.replace("/dashboard");
          return;
        }

        setProfile(p);
      } catch (err) {
        console.error("Onboarding init error:", err);
      } finally {
        setPageLoading(false);
      }
    }

    init();
  }, [user, authLoading, router]);

  // ── Not yet loaded ────────────────────────────────────────────────
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  // ── Not signed in ─────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-bold">
          fin<span className="text-emerald-600">bucket</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue setting up your account.
        </p>
        <button
          onClick={() =>
            signInWithPopup(auth, new GoogleAuthProvider())
          }
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  // ── Wizard ────────────────────────────────────────────────────────
  return (
    <OnboardingShell
      user={user}
      initialStep={profile?.onboardingStep ?? 1}
    />
  );
}