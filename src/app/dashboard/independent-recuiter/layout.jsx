"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileClock,
  LayoutDashboard,
  Menu,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import DevFlowLogo from "@/components/brand/DevFlowLogo";
import LogoutButton from "@/components/auth/LogoutButton";

const navigation = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard/independent-recruiter", icon: LayoutDashboard },
    ],
  },
  {
    label: "Opportunities",
    items: [
      { label: "Explore Companies", href: "/dashboard/independent-recruiter/companies", icon: Building2 },
      { label: "Company Requests", href: "/dashboard/independent-recruiter/company-requests", icon: ClipboardList },
      { label: "Invitations", href: "/dashboard/independent-recruiter/invitations", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "My Profile", href: "/dashboard/independent-recruiter/profile", icon: UserRound },
      { label: "Employment History", href: "/dashboard/independent-recruiter/recruiter-history", icon: FileClock },
    ],
  },
  {
    label: "Activity",
    items: [
      { label: "Notifications", href: "/dashboard/independent-recruiter/notifications", icon: Bell },
    ],
  },
];

function IndependentRecruiterSidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--df-line)] bg-[var(--df-paper)] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--df-line)] px-6">
          <Link
            href="/dashboard/independent-recruiter"
            onClick={onClose}
            aria-label="Independent recruiter dashboard"
            className="flex items-center"
          >
            <DevFlowLogo size="sidebar" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-[var(--df-muted)] hover:text-[var(--df-text)] lg:hidden"
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          {navigation.map((section) => (
            <div key={section.label} className="mb-8 last:mb-0">
              <p className="mb-3 px-2 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const active = href === "/dashboard/independent-recruiter"
                    ? pathname === href
                    : pathname.startsWith(href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 border-l px-2.5 py-2.5 text-xs transition-colors ${
                        active
                          ? "border-[var(--df-text)] bg-[var(--df-text)]/[0.04] font-medium text-[var(--df-text)]"
                          : "border-transparent text-[var(--df-muted)] hover:border-[var(--df-line)] hover:text-[var(--df-text)]"
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.7} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--df-line)] p-4">
          <Link
            href="/dashboard/independent-recruiter/settings"
            onClick={onClose}
            className={`mb-2 flex items-center gap-3 px-2.5 py-2.5 text-xs text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)] ${
              pathname.startsWith("/dashboard/independent-recruiter/settings")
                ? "text-[var(--df-text)]"
                : ""
            }`}
          >
            <Settings size={15} strokeWidth={1.7} />
            Settings
          </Link>
          <LogoutButton className="w-full border-l border-transparent px-2.5 py-2.5 text-[var(--df-muted)] hover:bg-[var(--df-text)]/[0.04] hover:text-[var(--df-text)]" />
        </div>
      </aside>
    </>
  );
}

export default function IndependentRecruiterLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "RECRUITER") {
      router.replace("/");
      return;
    }
    if (user?.recruiterProfile?.companyId) {
      router.replace("/dashboard/recruiter");
    }
  }, [isInitialized, isAuthenticated, user?.role, user?.recruiterProfile?.companyId, router]);

  return (
    <div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <IndependentRecruiterSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[var(--df-line)] bg-[var(--df-paper)]/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-5 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-[var(--df-text)] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={17} />
            </button>
            <Link
              href="/dashboard/independent-recruiter"
              aria-label="Independent recruiter dashboard"
              className="ml-3 lg:hidden"
            >
              <DevFlowLogo size="header" />
            </Link>
            <div className="hidden lg:block">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
                Independent recruiter workspace
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <LogoutButton className="rounded-full border border-[var(--df-line)] px-3 py-2 hover:bg-[var(--df-paper-2)]" />
              <div className="text-right">
                <p className="text-xs font-medium">{user?.name || "Recruiter"}</p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--df-muted)]">Independent recruiter</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center border border-[var(--df-line)] text-xs font-medium uppercase">
                {user?.name?.charAt(0)?.toUpperCase() || "R"}
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
