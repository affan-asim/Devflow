"use client";

// RESUMES AVATARS ARE NOT SHOW IN RECRUITER DASHBOARD SO ADD THEM

// IMPOTANT=================================================================================================

// DEVELOPER ALSO CAN CREATE EMPPLOYMENT EVENTS LIKE RESIGN SO IMPLEMENT THEM 

// COMPANY SIDE:
// recuiter/owner can hire recuiter and this option is only availble to owner and one more option is explore recuiter which means company owner can explore recuiters for hiring purposes and this option lead to another page called recuiter profiles page in which the recuiter profiles are listed the owner can copy the email and can click on the profile and hire right here or they can hire recuiter from dashboard hiring option where they can invite recuiter that is outside of platform the invited recuiter login and attach to the company

// ALSO IN SIDEBAR company employees page exist and manage the employement events like resign job profile update employment history created etc.... and company owner have own personal recuiter mangement optional additioanl with employees and do all the things

// Company recruiter
// Dashboard

// Jobs
// Applications


// Recruiter Team
// Company

// My Profile
// Employment History
// Employee Management 

// Notifications
// Settings

// And importantly:

// Owner

// Gets additional:

// Recruiter Management
// Explore Recruiters
// Invite Recruiter 

// because owner is special.

// Independent recruiter:

// Dashboard

// Explore Companies ---
// Company Requests ---
// Invitations ---

// My Profile ---
// Employment History ---

// Notifications ---
// Settings ---


import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import api from "@/lib/api/axios";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Clock3,
  FileText,
  LayoutDashboard,
  Mail,
  Network,
  UserRound,
  Settings,
  Search,
  Users,
  X,
  History,
  CirclePlus,
  HistoryIcon
} from "lucide-react";
import DevFlowLogo from "@/components/brand/DevFlowLogo";

const navigation = (isOwner) => [
  {
    label: "Workspace",
    items: [
      {
        label: "Overview",
        href: "/dashboard/recruiter",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Hiring",
    items: [
      {
        label: "Jobs",
        href: "/dashboard/recruiter/jobs",
        icon: BriefcaseBusiness,
      },
      {
        label: "Applications",
        href: "/dashboard/recruiter/applications",
        icon: Users,
      },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Employees", href: "/dashboard/recruiter/employees", icon: Users },
      { label: "Employment History", href: "/dashboard/recruiter/employementHistory", icon: Clock3 },
      ...(isOwner
        ? [
            { label: "Recruiter Management", href: "/dashboard/recruiter/management", icon: Network },
            { label: "Recruiter Employment History", href: "/dashboard/recruiter/history", icon: HistoryIcon },
            { label: "Explore Recruiters", href: "/dashboard/recruiter/explore-recruiters", icon: Search },
            { label: "Invitations", href: "/dashboard/recruiter/invitations", icon: Mail },
            { label: "Company Join Requests", href: "/dashboard/recruiter/company-requests", icon: CirclePlus },
          ]
        : []),
    ],
  },
  {
    label: "Company",
    items: [
      {
        label: "Company",
        href: "/dashboard/recruiter/company",
        icon: Building2,
      },
      { label: "My Profile", href: "/dashboard/recruiter/profile", icon: UserRound },
    ],
  },
  {
    label: "Activity",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/recruiter/notifications",
        icon: Bell,
      },
    ],
  },
];

export default function RecruiterSidebar({ open, onClose }) {
  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);
  const [isOwner, setIsOwner] = useState(false);
  const itemsBySection = navigation(isOwner);

  useEffect(() => {
    let active = true;
    const companyId = user?.recruiterProfile?.companyId;
    if (!companyId || !user?.id) {
      setIsOwner(false);
      return () => { active = false; };
    }

    api.get(`/api/company/${companyId}`).then(({ data }) => {
      const company = data?.data?.company || data?.data;
      const ownerUserId = company?.owner?.userId || company?.owner?.user?.id || company?.ownerId;
      if (active) setIsOwner(Boolean(ownerUserId && String(ownerUserId) === String(user.id)));
    }).catch(() => { if (active) setIsOwner(false); });

    return () => { active = false; };
  }, [user?.id, user?.recruiterProfile?.companyId]);

  return (
    <>
      {open && (
        <button
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
        <div className="flex h-16 items-center justify-between border-b border-[var(--df-line)] px-6">
          <Link
            href="/dashboard/recruiter"
            onClick={onClose}
            aria-label="DevFlow dashboard"
            className="flex items-center"
          >
            <DevFlowLogo size="sidebar" />
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden"
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          {itemsBySection.map((section) => (
            <div key={section.label} className="mb-8 last:mb-0">
              <p className="mb-3 px-2 text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--df-muted)]">
                {section.label}
              </p>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    item.href === "/dashboard/recruiter"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 border-l px-2.5 py-2.5 text-xs transition-colors ${
                        isActive
                          ? "border-[var(--df-text)] bg-[var(--df-text)]/[0.04] font-medium text-[var(--df-text)]"
                          : "border-transparent text-[var(--df-muted)] hover:border-[var(--df-line)] hover:text-[var(--df-text)]"
                      }`}
                    >
                      <Icon size={15} strokeWidth={1.7} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[var(--df-line)] p-4">
          <Link
            href="/dashboard/recruiter/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-2.5 py-2.5 text-xs text-[var(--df-muted)] transition-colors hover:text-[var(--df-text)] ${
              pathname.startsWith("/dashboard/recruiter/settings")
                ? "text-[var(--df-text)]"
                : ""
            }`}
          >
            <Settings size={15} strokeWidth={1.7} />
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
