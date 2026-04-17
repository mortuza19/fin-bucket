"use client";

import { z } from "zod";
import { useEffect, useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft } from "lucide-react";
import { getBanks } from "@/lib/firestore/banks";
import { Bank, AccountType } from "@/types/models";

// ─── Schema ──────────────────────────────────────────────────────────────────

const stepTwoSchema = z
  .object({
    bankId: z.string().min(1, "Please select a bank"),
    customBankName: z.string().optional(),
    nickname: z
      .string()
      .min(2, "Nickname must be at least 2 characters")
      .max(30, "Keep it under 30 characters"),
    accountType: z.enum(["savings", "current"]),
    last4: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
    initialBalance: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return 0;
        const num = Number(val);
        return isNaN(num) ? val : num;
      },
      z.number({ invalid_type_error: "Enter a valid amount" }).min(0, "Balance cannot be negative")
    ),
  })
  .refine(
    (data) => {
      if (data.bankId === "__other__") {
        return !!data.customBankName?.trim().length;
      }
      return true;
    },
    { message: "Please enter your bank name", path: ["customBankName"] }
  );

export type StepTwoData = z.infer<typeof stepTwoSchema>;

interface Props {
  defaultValues?: StepTwoData;
  loading: boolean;
  onNext: (data: StepTwoData) => void;
  onBack: () => void;
}

export function StepTwo({ defaultValues, loading, onNext, onBack }: Props) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);

  const form = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema) as Resolver<StepTwoData>,
    defaultValues: {
      bankId: defaultValues?.bankId ?? "",
      customBankName: defaultValues?.customBankName ?? "",
      nickname: defaultValues?.nickname ?? "",
      accountType: (defaultValues?.accountType as AccountType) ?? "savings",
      last4: defaultValues?.last4 ?? "",
      initialBalance: defaultValues?.initialBalance ?? (undefined as unknown as number),
    },
  });

  const watchBankId = form.watch("bankId");
  const watchBalance = form.watch("initialBalance");
  const isOther = watchBankId === "__other__";

  useEffect(() => {
    getBanks().then(setBanks).finally(() => setBanksLoading(false));
  }, []);

  const formattedBalance =
    watchBalance > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(watchBalance)
      : null;

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      <div className="p-6 pb-0">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
          Step 2 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Add your bank account
        </h1>
        <p className="text-sm text-muted-foreground">
          This sets your starting balance for Free to Spend.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <Controller
          control={form.control}
          name="bankId"
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={loading || banksLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      banksLoading ? "Loading banks…" : "Select your bank"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__other__">Other (not listed)</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error?.message ? (
                <p className="text-sm text-destructive">{fieldState.error.message}</p>
              ) : null}
            </div>
          )}
        />

        {isOther && (
          <Controller
            control={form.control}
            name="customBankName"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label>Bank name</Label>
                <Input
                  placeholder="Type your bank name"
                  disabled={loading}
                  {...field}
                />
                {fieldState.error?.message ? (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                ) : null}
              </div>
            )}
          />
        )}

        <Controller
          control={form.control}
          name="nickname"
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label>Account nickname</Label>
              <Input
                placeholder="e.g. HDFC Salary, SBI Joint"
                disabled={loading}
                {...field}
              />
              {fieldState.error?.message ? (
                <p className="text-sm text-destructive">{fieldState.error.message}</p>
              ) : null}
            </div>
          )}
        />

        <Controller
          control={form.control}
          name="accountType"
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label>Account type</Label>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex gap-3"
                disabled={loading}
              >
                {(["savings", "current"] as const).map((type) => (
                  <Label
                    key={type}
                    htmlFor={type}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm cursor-pointer transition-colors ${
                      field.value === type
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-medium"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <RadioGroupItem
                      value={type}
                      id={type}
                      className="sr-only"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Label>
                ))}
              </RadioGroup>
              {fieldState.error?.message ? (
                <p className="text-sm text-destructive">{fieldState.error.message}</p>
              ) : null}
            </div>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            control={form.control}
            name="last4"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label>Last 4 digits</Label>
                <Input
                  placeholder="4523"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="\\d{4}"
                  className="tracking-widest text-center font-mono"
                  disabled={loading}
                  {...field}
                />
                {fieldState.error?.message ? (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            control={form.control}
            name="initialBalance"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <Label>Initial balance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    ₹
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    disabled={loading}
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
                {formattedBalance && (
                  <p className="text-xs text-emerald-600 font-medium text-right">
                    {formattedBalance}
                  </p>
                )}
                {fieldState.error?.message ? (
                  <p className="text-sm text-destructive">{fieldState.error.message}</p>
                ) : null}
              </div>
            )}
          />
        </div>
      </div>

      <div className="px-6 pb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onBack}
          disabled={loading}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </form>
  );
}
