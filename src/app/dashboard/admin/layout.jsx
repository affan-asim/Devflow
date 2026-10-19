"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DevFlowLogo from "@/components/brand/DevFlowLogo";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  Activity,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Command,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  ShieldCheck,
  Users,
  X,
  Workflow,
  Code2,
} from "lucide-react";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Companies", href: "/dashboard/admin/companies", icon: Building2 },
      { label: "Jobs", href: "/dashboard/admin/jobs", icon: BriefcaseBusiness },
      { label: "Applications", href: "/dashboard/admin/applications", icon: FileText },
      { label: "Skills", href: "/dashboard/admin/skills", icon: Code2 },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { label: "Employment events", href: "/dashboard/admin/employment-events", icon: Workflow },
      { label: "Recruiter events", href: "/dashboard/admin/recruiter-events", icon: Activity },
      { label: "Files", href: "/dashboard/admin/files", icon: FileText },
      { label: "Email logs", href: "/dashboard/admin/email-logs", icon: Mail },
      { label: "System Health", href: "/dashboard/admin/system-health", icon: Command },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href) =>
    href === "/dashboard/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const sidebarWidth = collapsed ? "lg:w-[84px]" : "lg:w-[248px]";

  return (<div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
    {mobileOpen && (
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className="fixed inset-0 z-40 bg-black/35 lg:hidden"
      />
    )}

    ```
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[var(--df-line)] bg-[var(--df-paper)] transition-all duration-300 lg:translate-x-0 ${sidebarWidth} ${mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex h-[76px] items-center justify-between border-b border-[var(--df-line)] px-5">
        <Link
          href="/dashboard/admin"
          onClick={() => setMobileOpen(false)}
          aria-label="DevFlow admin dashboard"
          className="flex min-w-0 items-center gap-3"
        >
          <DevFlowLogo size={collapsed ? "mark" : "sidebar"} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.19em] text-[var(--df-muted)]">
                Admin workspace
              </span>
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="rounded-full p-2 text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div key={group.label} className="mb-7">
            {!collapsed && (
              <p className="df-eyebrow mb-3 px-3">{group.label}</p>
            )}

            <nav className="space-y-1" aria-label={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-10 items-center gap-3 rounded-full px-3 text-[13px] transition-colors duration-200 ${active
                        ? "bg-[var(--df-paper-2)] font-semibold text-[var(--df-text-strong)]"
                        : "text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                      } ${collapsed ? "justify-center" : ""}`}
                  >
                    {active && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[var(--df-accent)]" />
                    )}
                    <Icon
                      size={17}
                      strokeWidth={active ? 2 : 1.7}
                      className="shrink-0"
                    />
                    {!collapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {active && (
                          <span className="df-dot !h-[5px] !w-[5px] !shadow-none" />
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--df-line)] p-4">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--df-line)] bg-[var(--df-paper-2)]">
            <ShieldCheck size={17} strokeWidth={1.7} />
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-[var(--df-text)]">
                Platform administration
              </p>
              <p className="mt-1 text-[10px] text-[var(--df-muted)]">
                Restricted access
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>

    <div className={`min-w-0 transition-[padding] duration-300 ${collapsed ? "lg:pl-[84px]" : "lg:pl-[248px]"}`}>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--df-line)] bg-[var(--df-paper)]/95 px-5 backdrop-blur-sm sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            className="rounded-full border border-[var(--df-line)] p-2 text-[var(--df-text)] hover:bg-[var(--df-paper-2)] lg:hidden"
          >
            <Menu size={18} />
          </button>
          <Link
            href="/dashboard/admin"
            aria-label="DevFlow admin dashboard"
            className="lg:hidden"
          >
            <DevFlowLogo size="header" />
          </Link>
          <div className="min-w-0">
            <p className="df-eyebrow hidden sm:block">DEVFLOW / CONTROL CENTER</p>
            <p className="mt-1 truncate text-[13px] font-medium text-[var(--df-text)]">
              {navigation.flatMap((group) => group.items).find((item) => isActive(item.href))?.label || "Admin workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LogoutButton className="rounded-full border border-[var(--df-line)] px-3 py-2 hover:bg-[var(--df-paper-2)]" />
          <span className="hidden items-center gap-2 text-[11px] text-[var(--df-muted)] sm:flex">
            <span className="df-dot" />
            Administrative access
          </span>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-full border border-[var(--df-line)] p-2 text-[var(--df-muted)] transition-colors hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)] lg:inline-flex"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </header>

      <main className="df-container py-8 sm:py-10">{children}</main>
    </div>
  </div>

  );
}
