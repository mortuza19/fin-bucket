"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { signInWithGoogle } from "@/lib/firebase";
import { createUser } from "@/routes/users";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      const user =await createUser(result.user);
      router.push(!user?.onboardingCompleted ? "/onboarding" : "/dashboard");
    } catch (err) {
      console.error("Google sign-in failed", err);
      const message = "We couldn\'t sign you in. Please try again or refresh the page.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-end justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {}
      <div className="absolute inset-0" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md px-4 pb-10"
      >
        <Card className="rounded-2xl shadow-xl bg-white/90 backdrop-blur">
          <CardContent className="p-6 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Welcome</h1>
              <p className="text-sm text-muted-foreground">
                Track your expenses effortlessly
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              className="w-full flex items-center gap-2 text-base py-6"
              variant="outline"
            >
              <FcGoogle size={20} />
              Continue with Google
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We only read relevant emails to track your expenses. Your data is
              private and secure.
            </p>
          </CardContent>
        </Card>
      </motion.div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Spinner className="size-10 text-black" />
        </div>
      )}
    </div>
  );
}