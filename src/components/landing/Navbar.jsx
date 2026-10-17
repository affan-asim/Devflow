"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DevFlowLogo from "@/components/brand/DevFlowLogo";
import { logoutUser } from "@/lib/redux/slices/authSlice";

function getDashboardPath(user) {
  if (user?.role === "DEVELOPER") {
    return user.developerProfile
      ? "/dashboard/developer"
      : "/create-profile/developer";
  }

  if (user?.role === "RECRUITER") {
    if (!user.recruiterProfile) return "/create-profile/recruiter";
    return user.recruiterProfile.companyId
      ? "/dashboard/recruiter"
      : "/dashboard/independent-recruiter";
  }

  if (user?.role === "ADMIN") return "/dashboard/admin";
  return "/dashboard/admin";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, loading } = useSelector(
    (state) => state.auth
  );
  const dashboardPath = getDashboardPath(user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      // The auth slice clears the local session if the logout request fails too.
    }
    setOpen(false);
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="relative z-50">
      <div className="df-container">
        <div className="flex h-[82px] items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="DevFlow home" className="group flex items-center">
            <DevFlowLogo size="home" />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["Home", "/"],
              ["Find work", "/jobs"],
              ["Developers", "/developers"],
              ["Companies", "/companies"],
              ["For teams", "/recruiters"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-[13px] font-medium text-[var(--df-muted)] transition-colors duration-300 hover:text-[var(--df-text)]"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isInitialized && isAuthenticated ? (
              <>
                <Link
                  href={dashboardPath}
                  className="df-btn df-btn-primary hidden sm:inline-flex"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="hidden items-center cursor-pointer hover:text-red-600 gap-2 px-3 py-2.5 text-[13px] font-medium sm:inline-flex disabled:opacity-60" 
                >
                  <LogOut size={14} />
                  {loading ? "Signing out..." : "Log out"}
                </button>
              </>
            ) : isInitialized ? (
              <>
                <Link
                  href="/login"
                  className="hidden px-4 py-2.5 text-[13px] font-medium sm:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="df-btn df-btn-primary hidden sm:inline-flex"
                >
                  Join DevFlow
                  <ArrowUpRight size={14} />
                </Link>
              </>
            ) : null}

            <button
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--df-line)] md:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {open && (
          <div className="border-t border-[var(--df-line-soft)] py-6 md:hidden">
            <nav className="flex flex-col">
              {[
                ["Find work", "/jobs"],
                ["Developers", "/developers"],
                ["Companies", "/companies"],
                ["For teams", "/recruiters"],
                ...(isInitialized && !isAuthenticated ? [["Sign in", "/login"]] : []),
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="border-b border-[var(--df-line-soft)] py-4 text-sm font-medium"
                >
                  {label}
                </Link>
              ))}

              {isInitialized && isAuthenticated ? (
                <>
                  <Link
                    href={dashboardPath}
                    onClick={() => setOpen(false)}
                    className="df-btn df-btn-primary mt-5 w-full"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--df-line)] py-3 text-sm font-medium disabled:opacity-60"
                  >
                    <LogOut size={14} />
                    {loading ? "Signing out..." : "Log out"}
                  </button>
                </>
              ) : isInitialized ? (
                <Link
                  href="/register"
                  className="df-btn df-btn-primary mt-5 w-full"
                  onClick={() => setOpen(false)}
                >
                  Join DevFlow
                  <ArrowUpRight size={14} />
                </Link>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
