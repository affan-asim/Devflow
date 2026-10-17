"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import {
  clearAuthError,
  updateAccount,
  changePassword,
  fetchCurrentUser,
} from "@/lib/redux/slices/authSlice";

const formatDate = (date) => {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const formatRole = (role) => {
  if (!role) return "—";

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function StatusItem({ label, value, positive }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--df-line)] py-4 last:border-b-0">
      <span className="text-xs text-[var(--df-muted)]">
        {label}
      </span>

      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
          positive === true
            ? "text-emerald-600"
            : positive === false
              ? "text-red-600"
              : "text-[var(--df-text)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const dispatch = useDispatch();

  const {
    user,
    loading,
    error,
    isInitialized,
  } = useSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [accountMessage, setAccountMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchCurrentUser());

    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleAccountSubmit = async (event) => {
    event.preventDefault();

    setAccountMessage("");

    if (!name.trim()) {
      return;
    }

    const result = await dispatch(
      updateAccount({
        name: name.trim(),
      })
    );

    if (updateAccount.fulfilled.match(result)) {
      setAccountMessage("Name updated successfully.");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password cannot be the same as your current password."
      );
      return;
    }

    console.log(confirmPassword, '-0_)-')

    const result = await dispatch(
      changePassword({
        currentPassword,
        confirmPassword,
        newPassword,
      })
    );

    if (changePassword.fulfilled.match(result)) {
      window.location.href = "/login";
    } else {
      setPasswordError(
        result.payload || "Failed to change password."
      );
    }
  };

  if (!isInitialized || !user) {
    return (
      <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <div className="animate-pulse">
            <div className="h-3 w-24 bg-[var(--df-line)]" />
            <div className="mt-4 h-10 w-40 bg-[var(--df-line)]" />

            <div className="mt-12 h-32 border-y border-[var(--df-line)] bg-[var(--df-paper)]" />
            <div className="mt-8 h-64 border-y border-[var(--df-line)] bg-[var(--df-paper)]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">

        {/* Header */}
        <header className="border-b border-[var(--df-line)] pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--df-muted)]">
            Recruiter Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--df-muted)]">
            Manage your account information, security, and account status.
          </p>
        </header>

        {/* Account */}
        <section className="border-b border-[var(--df-line)] py-10">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em]">
                Account
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                Basic information associated with your DevFlow account.
              </p>
            </div>

            <form onSubmit={handleAccountSubmit}>
              <div className="border-y border-[var(--df-line)]">

                {/* Name */}
                <div className="grid gap-3 border-b border-[var(--df-line)] py-5 sm:grid-cols-[150px_1fr] sm:items-center">
                  <label
                    htmlFor="name"
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    maxLength={80}
                    className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 text-sm outline-none transition-colors focus:border-[var(--df-text)]"
                  />
                </div>

                {/* Email */}
                <div className="grid gap-3 border-b border-[var(--df-line)] py-5 sm:grid-cols-[150px_1fr] sm:items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                    Email
                  </span>

                  <div>
                    <p className="text-sm">
                      {user.email}
                    </p>

                    <p className="mt-1 text-xs text-[var(--df-muted)]">
                      Email address cannot be changed here.
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="grid gap-3 py-5 sm:grid-cols-[150px_1fr] sm:items-center">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]">
                    Role
                  </span>

                  <p className="text-sm">
                    {formatRole(user.role)}
                  </p>
                </div>
              </div>

              {accountMessage && (
                <p className="mt-4 text-xs text-emerald-600">
                  {accountMessage}
                </p>
              )}

              {error && (
                <p className="mt-4 text-xs text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || name.trim() === user.name}
                  className="h-10 border border-[var(--df-text)] bg-[var(--df-text)] px-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Account status */}
        <section className="border-b border-[var(--df-line)] py-10">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em]">
                Account status
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                Current status of your DevFlow account.
              </p>
            </div>

            <div className="border-y border-[var(--df-line)]">
              <StatusItem
                label="Account"
                value={user.isActive ? "Active" : "Inactive"}
                positive={user.isActive}
              />

              <StatusItem
                label="Email verification"
                value={
                  user.isVerified
                    ? "Verified"
                    : "Not verified"
                }
                positive={user.isVerified}
              />

              <StatusItem
                label="Account role"
                value={formatRole(user.role)}
              />

              <StatusItem
                label="Member since"
                value={formatDate(user.createdAt)}
              />
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="border-b border-[var(--df-line)] py-10">
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em]">
                Security
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--df-muted)]">
                Change your account password.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-5">

                {/* Current */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
                  >
                    Current password
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      autoComplete="current-password"
                      className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 pr-20 text-sm outline-none transition-colors focus:border-[var(--df-text)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 pr-20 text-sm outline-none transition-colors focus:border-[var(--df-text)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--df-muted)]"
                  >
                    Confirm new password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      className="h-11 w-full border border-[var(--df-line)] bg-transparent px-3 pr-20 text-sm outline-none transition-colors focus:border-[var(--df-text)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--df-muted)] hover:text-[var(--df-text)]"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p className="mt-4 text-xs text-red-600">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="mt-4 text-xs text-emerald-600">
                  {passwordMessage}
                </p>
              )}

              <div className="mt-6 border-t border-[var(--df-line)] pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 border cursor-pointer border-[var(--df-text)] bg-[var(--df-text)] px-5 text-[10px] font-semibold uppercase tracking-[0.13em] text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? "Changing password..."
                    : "Change password"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Security warning */}
        <section className="py-10">
          <div className="border border-[var(--df-line)] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">
              Session security
            </p>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--df-muted)]">
              Changing your password signs you out of your current
              session and revokes your active refresh tokens. You
              will need to sign in again with your new password.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}