"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/login";
  const isRootRoute = pathname === "/";

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    // TODO: Replace this logic later when we will have user DB.
    if (user && (isPublicRoute || isRootRoute)) {
      router.replace("/onboarding");
    }
  }, [loading, user, isPublicRoute, isRootRoute, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Spinner className="size-10 text-black" />
      </div>
    );
  }

  return <>{children}</>;
}
