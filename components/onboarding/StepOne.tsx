"use client";

import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "firebase/auth";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const stepOneSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z
    .enum(["male", "female", "non-binary", "prefer-not-to-say"])
    .optional(),
  age: z.number().min(0, "Age must be a positive number").optional(),
});

export type StepOneData = z.infer<typeof stepOneSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  user: User;
  defaultValues?: StepOneData;
  loading: boolean;
  onNext: (data: StepOneData) => void;
}

export function StepOne({ user, defaultValues, loading, onNext }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      name: defaultValues?.name ?? user.displayName ?? "",
      gender: defaultValues?.gender,
      age: defaultValues?.age,
    },
  });

  const initials = (user.displayName ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);

  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="max-w-md mx-auto w-full"
    >
      {/* Header */}
      <div className="p-6 pb-2">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">
          Step 1 of 3
        </p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Let&apos;s set up your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve prefilled your Google details.
        </p>
      </div>

      {/* Google preview */}
      <div className="px-6">
        <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/40">
          <Avatar className="h-11 w-11">
            <AvatarImage src={user.photoURL ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.displayName ?? "Your name"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>

          <Badge variant="secondary" className="text-xs">
            Google
          </Badge>
        </div>
      </div>

      {/* Name */}
      <div className="p-6 space-y-1">
        <label className="text-sm font-medium">Full name</label>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} disabled={loading} placeholder="Your name" />
          )}
        />

        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Gender + DOB */}
      <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Gender (optional)</label>

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* DOB */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Date of birth</label>

          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="Your age"
                disabled={loading}
                {...field}
              />
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6">
        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </form>
  );
}