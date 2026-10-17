"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Check, Mail, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailOtp, resendVerificationOtp } from "@/lib/redux/slices/authSlice";
import AuthHeader from "@/components/auth/AuthHeader";

export default function VerifyEmailPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendStatus, setResendStatus] = useState(null);
  const inputRefs = useRef([]);
  
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error, unverifiedEmail } = useSelector((state) => state.auth);
  const email = searchParams.get("email") || unverifiedEmail;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) return;

    const result = await dispatch(verifyEmailOtp({ email, otp: fullCode }));
    if (verifyEmailOtp.fulfilled.match(result)) {
      router.push("/login?verified=true");
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResendStatus("Email address is missing.");
      return;
    }
    setResendStatus("Sending...");
    const result = await dispatch(resendVerificationOtp({ email }));
    
    if (resendVerificationOtp.fulfilled.match(result)) {
      setResendStatus("Code resent successfully!");
    } else {
      setResendStatus(result.payload || "Failed to resend code.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <AuthHeader />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1320px] items-center justify-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="w-full max-w-[520px]"
        >
          {/* Icon */}
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper-2)]">
            <Mail size={24} strokeWidth={1.4} className="text-[var(--df-muted)]" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--df-muted)]">
            Account verification
          </p>

          <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] sm:text-6xl">
            Check your
            <br />
            inbox.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-6 text-[var(--df-muted)] sm:text-base">
            We've sent a verification code to{" "}
            <span className="font-semibold text-[var(--df-text)]">{email || "your email address"}</span>.
            Enter it below to activate your DevFlow account.
          </p>

          {error && (
            <div className="mt-6 border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-500">
              {error}
            </div>
          )}

          {resendStatus && (
            <div className="mt-6 border border-[var(--df-line)] bg-[var(--df-paper-2)] p-3 text-xs font-medium text-[var(--df-text)]">
              {resendStatus}
            </div>
          )}

          {/* Code Input Matrix */}
          <form onSubmit={handleVerify}>
            <div className="mt-8">
              <label className="text-xs font-medium">Verification code</label>

              <div className="mt-3 grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
                {code.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    id={`code-${index}`}
                    value={value}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    maxLength={1}
                    inputMode="numeric"
                    className="h-14 w-full border border-[var(--df-line)] bg-[var(--df-paper)] text-center text-lg font-semibold text-[var(--df-text)] outline-none transition focus:border-[var(--df-text)] focus:ring-1 focus:ring-[var(--df-text)]"
                  />
                ))}
              </div>
            </div>

            {/* Verify Action */}
            <button
              type="submit"
              disabled={loading || code.join("").length < 6}
              className="group mt-6 flex h-12 w-full items-center justify-center gap-2 bg-[var(--df-text)] text-sm font-semibold text-[var(--df-paper)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Check size={16} />
              {loading ? "Verifying..." : "Verify email"}
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-7 flex flex-col items-center gap-3 border-t border-[var(--df-line)] pt-6 sm:flex-row sm:justify-between">
            <p className="text-xs text-[var(--df-muted)]">
              Didn't receive the email?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--df-text)] transition hover:opacity-80 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Resend code
            </button>
          </div>

          {/* Status Box */}
          <div className="mt-10 flex items-center gap-3 border border-[var(--df-line)] bg-[var(--df-paper-2)] p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--df-accent)]">
              <Mail size={13} className="text-[var(--df-black)]" />
            </span>

            <div>
              <p className="text-xs font-semibold">Verification required</p>
              <p className="mt-1 text-[11px] leading-4 text-[var(--df-muted)]">
                Your account becomes active after email verification.
              </p>
            </div>
          </div>

          {/* Back Navigation */}
          <Link
            href="/login"
            className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-[var(--df-muted)] transition hover:text-[var(--df-text)]"
          >
            <ArrowLeft size={13} />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </main>
  );
}