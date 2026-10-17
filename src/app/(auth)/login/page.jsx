"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginUser } from "@/lib/redux/slices/authSlice";
import AuthShell from "@/components/auth/AuthShell";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isJustVerified = searchParams.get("verified") === "true";
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(formData)).unwrap();

      if (result.role === "DEVELOPER") {
        router.push("/create-profile/developer");
      }
      else if (result.role === "RECRUITER") {
        router.push("/create-profile/recruiter");
      } 
      else {
        router.push("/dashboard/admin");
      }
    } catch (error) {
      console.error("Error in login:", error)
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Back to building."
      description="Sign in to continue exploring opportunities, managing applications or hiring developers."
      sideTitle="Your next opportunity starts with context."
      sideDescription="DevFlow keeps your professional identity, applications and hiring relationships connected."
      sideItems={[
        "Track every application",
        "Keep your profile current",
        "Stay connected to opportunities",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {isJustVerified && (
          <div className="border border-[var(--df-accent)] bg-[rgba(185,244,91,0.08)] p-3 text-xs font-medium text-[var(--df-text)]">
            Email verified successfully. Please sign in to your account.
          </div>
        )}

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500">
            {error}
          </div>
        )}

        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--df-text)]">
              Password
            </span>

            <Link
              href="/forgot-password"
              className="text-xs text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
            >
              Forgot password?
            </Link>
          </div>

          <input
            type="password"
            placeholder="Enter your password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="h-12 w-full border border-[var(--df-line)] bg-[var(--df-paper)] px-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)] focus:ring-1 focus:ring-[var(--df-text)]"
          />
        </div>

        <div className="pt-2">
          <AuthButton type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </AuthButton>
        </div>

        <div className="relative py-3">
          <div className="absolute inset-x-0 top-1/2 border-t border-[var(--df-line)]" />

          <span className="relative mx-auto block w-fit bg-[var(--df-paper)] px-4 text-[10px] uppercase tracking-[0.16em] text-[var(--df-soft)]">
            or
          </span>
        </div>

        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-3 border border-[var(--df-line)] text-sm font-medium text-[var(--df-text)] transition hover:border-[var(--df-text)] cursor-pointer"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--df-text)] text-[9px] font-bold text-[var(--df-paper)]">
            G
          </span>
          Continue with Google
        </button>

        <div className="border-t border-[var(--df-line)] pt-6 text-center">
          <p className="text-sm text-[var(--df-muted)]">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--df-text)] underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}