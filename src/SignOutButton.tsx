"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium hover:bg-neutral-200 hover:text-primary-900 transition-all duration-200 shadow-soft hover:shadow-medium"
      onClick={() => void signOut()}
    >
      Вийти
    </button>
  );
}
