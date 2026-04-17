"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { createUserProfileIfNotExists } from "@/lib/firestore/users";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/login";
  const rootRoute = "/";
  const onboardingRoute = "/onboarding";
  const loginRoute = "/login";

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isPublicRoute) {
      router.replace(loginRoute);
      return;
    }

    // TODO: Replace this logic later when we will have user DB.
    if (user) {
      const checkUser = async () => {
        try {
          const profile = await createUserProfileIfNotExists(user);

          if (!profile?.onboardingCompleted) {
            router.replace(onboardingRoute);
          } else {
            router.replace(rootRoute);
          }
        } catch (err) {
          console.error(err);
          router.replace(loginRoute);
        } finally {
          setChecking(false);
        }
      };
      checkUser();
    }
  }, [loading, user, isPublicRoute, router]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Spinner className="size-10 text-black" />
      </div>
    );
  }

  return <>{children}</>;
}
