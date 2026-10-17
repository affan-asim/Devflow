"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Bookmark,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard/developer",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/dashboard/developer/jobs",
    icon: BriefcaseBusiness,
  },
  {
    label: "Saved Jobs",
    href: "/dashboard/developer/savedJobs",
    icon: Bookmark,
  },
  {
    label: "Applications",
    href: "/dashboard/developer/applications",
    icon: FileText,
  },
  {
    label: "Profile",
    href: "/dashboard/developer/profile",
    icon: UserRound,
  },
  {
    label: "Employment",
    href: "/dashboard/developer/employment-history",
    icon: UsersRound,
  },
  {
    label: "Notifications",
    href: "/dashboard/developer/notifications",
    icon: Bell,
  },
];

const secondaryNavigation = [
  {
    label: "Settings",
    href: "/dashboard/developer/settings",
    icon: Settings,
  },
];

export default function DeveloperSidebar({ open, onClose }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/dashboard/developer") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/20
            lg:hidden
          "
        />
      )}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[250px]
          flex-col
          border-r
          border-[var(--df-line)]
          bg-[var(--df-paper)]
          transition-transform
          duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--df-line)] px-6">
          <Link
            href="/dashboard/developer"
            onClick={onClose}
            aria-label="DevFlow dashboard"
            className="flex items-center"
          >
            <DevFlowLogo size="sidebar" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              text-[var(--df-muted)]
              hover:text-[var(--df-text)]
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Profile shortcut */}
        <div className="border-b border-[var(--df-line)] p-4">
          <Link
            href="/dashboard/developer/profile"
            onClick={onClose}
            className="
              group
              flex
              items-center
              gap-3
              p-2
              transition-colors
              hover:bg-[var(--df-paper-2)]
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                bg-[var(--df-paper-3)]
                text-xs
                font-semibold
              "
            >
              D
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                Developer
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[var(--df-muted)]">
                View profile
              </p>
            </div>

            <ChevronRight
              size={14}
              strokeWidth={1.5}
              className="
                text-[var(--df-soft)]
                transition-transform
                group-hover:translate-x-0.5
              "
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-soft)]">
            Workspace
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    text-xs
                    font-medium
                    transition-colors
                    ${
                      active
                        ? "bg-[var(--df-paper-3)] text-[var(--df-text)]"
                        : "text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className={
                      active
                        ? "text-[var(--df-text)]"
                        : "text-[var(--df-muted)]"
                    }
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="my-6 border-t border-[var(--df-line)]" />

          <p className="px-3 pb-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--df-soft)]">
            Account
          </p>

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    text-xs
                    font-medium
                    transition-colors
                    ${
                      active
                        ? "bg-[var(--df-paper-3)] text-[var(--df-text)]"
                        : "text-[var(--df-muted)] hover:bg-[var(--df-paper-2)] hover:text-[var(--df-text)]"
                    }
                  `}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-[var(--df-line)] p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              px-3
              py-2.5
              text-xs
              font-medium
              text-[var(--df-muted)]
              cursor-pointer
              transition-colors
              hover:bg-[var(--df-paper-2)]
              hover:text-[var(--df-text)]
            "
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
