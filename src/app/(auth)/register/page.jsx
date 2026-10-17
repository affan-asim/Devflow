"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/redux/slices/authSlice";
import AuthShell from "@/components/auth/AuthShell";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function RegisterPage() {
  const [role, setRole] = useState("DEVELOPER");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, role };
    try {
      const data = await dispatch(registerUser(payload)).unwrap();
      
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Start your DevFlow journey."
      description="Create an account to discover opportunities, build your professional identity or hire developers."
      sideTitle="One account. A connected hiring network."
      sideDescription="DevFlow brings developers, recruiters, companies and opportunities into one system."
      sideItems={[
        "Build your developer identity",
        "Discover meaningful opportunities",
        "Hire developers with context",
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500">
            {error}
          </div>
        )}

        {/* Role */}
        <div>
          <span className="mb-2 block text-xs font-medium text-[var(--df-text)]">
            I am joining as
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("DEVELOPER")}
              className={`h-12 border px-4 text-sm font-medium transition cursor-pointer ${
                role === "DEVELOPER"
                  ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                  : "border-[var(--df-line)] text-[var(--df-muted)] hover:border-[var(--df-text)]"
              }`}
            >
              Developer
            </button>

            <button
              type="button"
              onClick={() => setRole("RECRUITER")}
              className={`h-12 border px-4 text-sm font-medium transition cursor-pointer ${
                role === "RECRUITER"
                  ? "border-[var(--df-text)] bg-[var(--df-text)] text-[var(--df-paper)]"
                  : "border-[var(--df-line)] text-[var(--df-muted)] hover:border-[var(--df-text)]"
              }`}
            >
              Recruiter
            </button>
          </div>
        </div>

        <AuthInput
          label="Full name"
          placeholder="Your name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <AuthInput
          label="Password"
          type="password"
          placeholder="Create a secure password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <div className="pt-2">
          <AuthButton type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </AuthButton>
        </div>

        <p className="text-center text-xs leading-5 text-[var(--df-muted)]">
          By creating an account, you agree to DevFlow's{" "}
          <span className="font-medium text-[var(--df-text)]">
            Terms
          </span>{" "}
          and{" "}
          <span className="font-medium text-[var(--df-text)]">
            Privacy Policy
          </span>
          .
        </p>

        <div className="border-t border-[var(--df-line)] pt-6 text-center">
          <p className="text-sm text-[var(--df-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--df-text)] underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
}