"use client";

import { z } from "zod";
import { Resolver, useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronLeft, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account } from "@/types/models";

/* ───────────────────────────────────────────────
   Schema
─────────────────────────────────────────────── */

const stepThreeSchema = z.object({
  label: z
    .string()
    .min(2, "Label must be at least 2 characters")
    .max(40, "Keep it under 40 characters"),

  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .positive("Amount must be greater than 0"),

  creditedDate: z
    .number()
    .int()
    .min(1, "Must be between 1 and 31")
    .max(31, "Must be between 1 and 31"),

  isRecurring: z.boolean().default(true),

  accountId: z.string().min(1, "Please select an account"),
});

export type StepThreeData = z.infer<typeof stepThreeSchema>;

/* ───────────────────────────────────────────────
   Props
─────────────────────────────────────────────── */

interface Props {
  accounts: Pick<Account, "id" | "nickname" | "last4">[];
  loading: boolean;
  onNext: (data: StepThreeData) => void;
  onBack: () => void;
  onSkip: () => void;
}

/* ───────────────────────────────────────────────
   Day Grid
─────────────────────────────────────────────── */

function DayGrid({
  selected,
  onSelect,
  disabled,
}: {
  selected: number;
  onSelect: (d: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
        <button
          key={d}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(d)}
          className={cn(
            "h-8 w-full rounded-md text-xs font-medium border transition-colors",
            d === selected
              ? "bg-emerald-600 border-emerald-600 text-white"
              : "border-border text-muted-foreground hover:bg-muted/60"
          )}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────────
   Component
─────────────────────────────────────────────── */

export function StepThree({
  accounts,
  loading,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const form = useForm<StepThreeData>({
    resolver: zodResolver(stepThreeSchema) as Resolver<StepThreeData>,
    defaultValues: {
      label: "Salary",
      amount: undefined as unknown as number,
      creditedDate: 1,
      isRecurring: true,
      accountId: accounts?.[0]?.id ?? "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const watchAmount = watch("amount");
  const watchDay = watch("creditedDate");

  const formattedAmount =
    watchAmount > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(watchAmount)
      : null;

  const dayLabel =
    watchDay === 31
      ? "31 (or last day of month)"
      : watchDay
      ? `${watchDay}${ordinal(watchDay)} of every month`
      : "";

  return (
    <form onSubmit={handleSubmit(onNext)}>
      {/* HEADER */}
      <div className="p-6 pb-0">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
          Step 3 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Your income
        </h1>
        <p className="text-sm text-muted-foreground">
          Helps us plan your monthly budget automatically.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {/* LABEL */}
        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <div className="space-y-1">
              <Label>Income label</Label>
              <Input {...field} disabled={loading} />
              {errors.label && (
                <p className="text-sm text-red-500">
                  {errors.label.message}
                </p>
              )}
            </div>
          )}
        />

        {/* AMOUNT */}
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <div className="space-y-1">
              <Label>Monthly amount</Label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>

                <Input
                  type="number"
                  className="pl-7"
                  disabled={loading}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>

              {formattedAmount && (
                <p className="text-xs text-emerald-600">
                  {formattedAmount} / month
                </p>
              )}

              {errors.amount && (
                <p className="text-sm text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>
          )}
        />

        {/* ACCOUNT */}
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <div className="space-y-1">
              <Label>Account</Label>

              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>

                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nickname} · {a.last4}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.accountId && (
                <p className="text-sm text-red-500">
                  {errors.accountId.message}
                </p>
              )}
            </div>
          )}
        />

        {/* DAY PICKER */}
        <Controller
          control={control}
          name="creditedDate"
          render={({ field }) => (
            <div className="space-y-1">
              <Label>Income day</Label>

              <DayGrid
                selected={field.value}
                onSelect={field.onChange}
                disabled={loading}
              />

              {dayLabel && (
                <p className="text-xs text-muted-foreground">
                  {dayLabel}
                </p>
              )}

              {errors.creditedDate && (
                <p className="text-sm text-red-500">
                  {errors.creditedDate.message}
                </p>
              )}
            </div>
          )}
        />

        {/* RECURRING */}
        <Controller
          control={control}
          name="isRecurring"
          render={({ field }) => (
            <div
              className={cn(
                "flex items-start gap-3 border p-4 rounded-xl cursor-pointer",
                field.value
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-border"
              )}
              onClick={() => field.onChange(!field.value)}
            >
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <Label className="cursor-pointer">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Add monthly automatically
                </span>

                <span className="text-xs text-muted-foreground block mt-0.5">
                  We’ll credit this automatically each month.
                </span>
              </Label>
            </div>
          )}
        />
      </div>

      {/* FOOTER */}
      <div className="px-6 pb-4 flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          type="submit"
          className="flex-1 bg-emerald-600 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finishing…
            </>
          ) : (
            "Finish setup"
          )}
        </Button>
      </div>

      <div className="pb-6 text-center">
        <button
          type="button"
          onClick={onSkip}
          disabled={loading}
          className="text-xs underline text-muted-foreground"
        >
          Skip for now — I’ll add income later
        </button>
      </div>
    </form>
  );
}

/* ───────────────────────────────────────────────
   Helpers
─────────────────────────────────────────────── */

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}