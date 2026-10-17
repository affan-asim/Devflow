"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  clearAuthError,
  loginUser,
  logoutUser,
} from "@/lib/redux/slices/authSlice";
import AuthShell from "@/components/auth/AuthShell";

export default function AdminLoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated, role, user } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const currentRole = String(user?.role || role || "").toLowerCase();
    if (currentRole === "admin") router.replace("/dashboard/admin");
  }, [isAuthenticated, role, user, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    dispatch(clearAuthError());

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setFormError("Enter your email address and password.");
      return;
    }

    try {
      const result = await dispatch(
        loginUser({ email: normalizedEmail, password })
      ).unwrap();

      const authenticatedRole = String(
        result?.data?.user?.role ??
          result?.data?.role ??
          result?.user?.role ??
          result?.role ??
          ""
      ).toLowerCase();

      if (authenticatedRole !== "admin") {
        await dispatch(logoutUser());
        setFormError(
          "Access denied. These credentials are not authorized for the admin portal."
        );
        return;
      }

      router.replace("/dashboard/admin");
    } catch {
      setFormError("Unable to sign in. Check your credentials and try again.");
    }
  };

  const fieldClassName =
    "h-12 w-full border border-[var(--df-line)] bg-[var(--df-paper)] pl-11 pr-4 text-sm text-[var(--df-text)] outline-none transition placeholder:text-[var(--df-soft)] focus:border-[var(--df-text)] focus:ring-1 focus:ring-[var(--df-text)]";

  return (
    <AuthShell
      eyebrow="DevFlow / Administration"
      title="Good to have you back."
      description="Sign in with your administrator credentials to manage the DevFlow network."
      sideTitle="A clearer view of the whole network."
      sideDescription="The administration workspace brings platform activity, people and system health into one place."
      sideItems={[
        "Review platform activity",
        "Keep the network running smoothly",
        "Manage access with confidence",
      ]}
    >
      <div className="mb-7 flex items-center gap-3 border-y border-[var(--df-line)] py-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--df-text)] text-[var(--df-paper)]">
          <ShieldCheck size={19} strokeWidth={1.8} />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em]">
            Administrator access
          </p>
          <p className="mt-1 text-xs text-[var(--df-muted)]">
            Protected workspace · Authorized team only
          </p>
        </div>
        <LockKeyhole
          className="ml-auto text-[var(--df-muted)]"
          size={17}
          aria-hidden="true"
        />
      </div>

      {formError || error ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-600 dark:text-red-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{formError || error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="admin-email"
            className="mb-2 block text-xs font-medium text-[var(--df-text)]"
          >
            Work email
          </label>
          <div className="relative">
            <Mail
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--df-soft)]"
            />
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              maxLength={254}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFormError("");
              }}
              placeholder="you@devflow.com"
              className={fieldClassName}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="mb-2 block text-xs font-medium text-[var(--df-text)]"
          >
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--df-soft)]"
            />
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFormError("");
              }}
              placeholder="Enter your password"
              className={`${fieldClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--df-muted)] transition hover:text-[var(--df-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--df-text)]"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group df-btn df-btn-accent mt-2 w-full cursor-pointer justify-center rounded-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={17} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Continue to admin
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </>
          )}
        </button>
      </form>

      <div className="mt-7 flex items-start gap-3 border-t border-[var(--df-line)] pt-5">
        <Check size={15} className="mt-0.5 shrink-0 text-[var(--df-muted)]" />
        <p className="text-xs leading-5 text-[var(--df-muted)]">
          Your administrator role is verified securely when you sign in. Access
          is limited to authorized accounts.
        </p>
      </div>
    </AuthShell>
  );
}
