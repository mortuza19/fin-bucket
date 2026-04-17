"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { cn } from "@/lib/utils";
import { StepOne, StepOneData } from "./StepOne";
import { StepTwo, StepTwoData } from "./StepTwo";
import { StepThree, StepThreeData } from "./StepThree";
import { updateUserProfile } from "@/lib/firestore/users";
import { createAccount } from "@/lib/firestore/accounts";
import { createIncome } from "@/lib/firestore/incomes";
import { createCustomBank } from "@/lib/firestore/banks";
import { Account } from "@/types/models";

interface Props {
  user: User;
  initialStep: number;
}

const STEP_LABELS = ["Your profile", "Bank account", "Income"];

export function OnboardingShell({ user, initialStep }: Props) {
  const router = useRouter();

  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);

  // In-memory form state — preserved when going Back
  const [stepOneData, setStepOneData] = useState<StepOneData | null>(null);
  const [stepTwoData, setStepTwoData] = useState<StepTwoData | null>(null);

  // Accounts created in Step 2 — needed for Step 3 dropdown
  const [createdAccounts, setCreatedAccounts] = useState<
    Pick<Account, "id" | "nickname" | "last4">[]
  >([]);

  // ─── Step handlers ───────────────────────────────────────────────

  async function handleStepOne(data: StepOneData) {
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        name: data.name,
        gender: data.gender ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
        onboardingStep: 2,
      });
      setStepOneData(data);
      setStep(2);
    } catch {
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong",
      //   description: "Could not save your profile. Please try again.",
      // });
    } finally {
      setLoading(false);
    }
  }

  async function handleStepTwo(data: StepTwoData) {
    setLoading(true);
    try {
      let resolvedBankId = data.bankId;
      if (data.bankId === "__other__" && data.customBankName) {
        resolvedBankId = await createCustomBank(data.customBankName);
      }

      const accountId = await createAccount(user.uid, {
        bankId: resolvedBankId,
        nickname: data.nickname,
        accountType: data.accountType,
        last4: data.last4,
        initialBalance: data.initialBalance,
        currentBalance: data.initialBalance, // always equal at creation
        isPrimary: true,
      });

      await updateUserProfile(user.uid, { onboardingStep: 3 });

      setStepTwoData(data);
      setCreatedAccounts([
        { id: accountId, nickname: data.nickname, last4: data.last4 },
      ]);
      setStep(3);
    } catch {
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong",
      //   description: "Could not save your bank account. Please try again.",
      // });
    } finally {
      setLoading(false);
    }
  }

  async function handleStepThree(data: StepThreeData) {
    setLoading(true);
    try {
      await createIncome(user.uid, {
        label: data.label,
        amount: data.amount,
        creditedDate: data.creditedDate,
        isRecurring: data.isRecurring,
        accountId: data.accountId,
      });
      await updateUserProfile(user.uid, {
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      router.push("/dashboard");
    } catch {
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong",
      //   description: "Could not save your income. Please try again.",
      // });
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip() {
    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        onboardingCompleted: true,
        onboardingStep: 3,
      });
      router.push("/dashboard");
    } catch {
      // toast({
      //   variant: "destructive",
      //   title: "Something went wrong",
      //   description: "Please try again.",
      // });
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start pt-8 px-4 pb-10">
      {/* Logo */}
      <div className="mb-6 self-start sm:self-center">
        <span className="text-xl font-bold tracking-tight">
          fin<span className="text-emerald-600">bucket</span>
        </span>
      </div>

      {/* Step progress indicator */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Step {step} of 3 · {STEP_LABELS[step - 1]}
          </span>
          <span className="text-xs text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
        </div>

        {/* Step dots + lines */}
        <div className="flex items-center gap-0">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border transition-all duration-300",
                  s < step
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : s === step
                    ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                    : "bg-background border-border text-muted-foreground"
                )}
              >
                {s < step ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline
                      points="2,6 5,9 10,3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div className="flex-1 h-px mx-1">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      s < step ? "bg-emerald-600" : "bg-border"
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step card */}
      <div className="w-full max-w-lg bg-card border rounded-2xl shadow-sm overflow-hidden">
        {step === 1 && (
          <StepOne
            user={user}
            defaultValues={stepOneData ?? undefined}
            loading={loading}
            onNext={handleStepOne}
          />
        )}
        {step === 2 && (
          <StepTwo
            defaultValues={stepTwoData ?? undefined}
            loading={loading}
            onNext={handleStepTwo}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <StepThree
            accounts={createdAccounts}
            loading={loading}
            onNext={handleStepThree}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}
      </div>
    </div>
  );
}