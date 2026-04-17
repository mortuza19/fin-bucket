import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started · finbucket",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Minimal layout — no sidebar, no nav. Children handle their own centering.
  return <>{children}</>;
}