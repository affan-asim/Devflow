"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "@/lib/redux/slices/authSlice";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import api from "@/lib/api/axios";

/**
 * Determines the proper dashboard URL for a user given their role and profile state.
 */
export function getCorrectDashboardForUser(user) {
  if (!user) return "/login";

  switch (user.role) {
    case "DEVELOPER":
      return user.developerProfile
        ? "/dashboard/developer"
        : "/create-profile/developer";

    case "RECRUITER":
      if (!user.recruiterProfile) return "/create-profile/recruiter";
      return user.recruiterProfile.companyId
        ? "/dashboard/recruiter"
        : "/dashboard/independent-recruiter";

    case "ADMIN":
      return "/dashboard/admin";

    default:
      return "/login";
  }
}

/**
 * DashboardProtection
 * 
 * Protects a dashboard layout on the frontend by verifying the authenticated
 * user against the required role and sub-role constraints using the /api/auth/me response.
 *
 * @param {string} allowedRole - "DEVELOPER" | "RECRUITER" | "ADMIN"
 * @param {boolean} requireCompany - only for RECRUITER (true = company recruiter, false = independent)
 */
export default function DashboardProtection({
  allowedRole,
  requireCompany = false,
  children,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, isAuthenticated, isInitialized } = useSelector(
    (state) => state.auth
  );

  const [checking, setChecking] = useState(!isInitialized || !user);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        let currentUser = user;

        // If user isn't populated or initialized in Redux, fetch fresh from /api/auth/me
        if (!currentUser || !isInitialized) {
          const res = await api.get("/api/auth/me");
          currentUser = res.data?.data;
          dispatch(fetchCurrentUser());
        }

        if (!isMounted) return;

        if (!currentUser) {
          router.replace("/login");
          return;
        }

        if (!currentUser.isActive) {
          router.replace("/");
          return;
        }

        // 1. Role mismatch check (e.g. Developer trying to access Admin or Recruiter)
        if (currentUser.role !== allowedRole) {
          setAccessDenied(true);
          const destination = getCorrectDashboardForUser(currentUser);
          router.replace(destination);
          return;
        }

        // 2. Specific recruiter sub-type routing (Company Recruiter vs Independent Recruiter)
        if (allowedRole === "RECRUITER") {
          const hasCompany = Boolean(currentUser.recruiterProfile?.companyId);

          if (requireCompany && !hasCompany) {
            // Independent recruiter trying to access /dashboard/recruiter (company dashboard)
            setAccessDenied(true);
            router.replace("/dashboard/independent-recruiter");
            return;
          }

          if (!requireCompany && hasCompany) {
            // Company recruiter trying to access /dashboard/independent-recruiter
            setAccessDenied(true);
            router.replace("/dashboard/recruiter");
            return;
          }
        }

        setChecking(false);
      } catch (error) {
        console.error("Dashboard route protection verification failed:", error);
        if (isMounted) {
          router.replace("/login");
        }
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isInitialized, allowedRole, requireCompany, dispatch, router]);

  if (checking || accessDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--df-paper)] px-4 text-[var(--df-text)]">
        <div className="flex flex-col items-center text-center">
          {accessDenied ? (
            <>
              <ShieldAlert className="mb-3 text-amber-600" size={32} />
              <p className="text-sm font-semibold">Redirecting to your authorized dashboard...</p>
              <p className="mt-1 text-xs text-[var(--df-muted)]">
                You do not have permission to view this workspace.
              </p>
            </>
          ) : (
            <>
              <LoaderCircle
                className="mb-3 animate-spin text-[var(--df-text)]"
                size={28}
              />
              <p className="text-xs uppercase tracking-widest text-[var(--df-muted)]">
                Verifying permissions...
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return children;
}
