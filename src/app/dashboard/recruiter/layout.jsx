"use client";

import RecruiterDashboardShell from "@/components/recruiter-dashboard/layout/RecruiterDashboardShell";
import DashboardProtection from "@/components/auth/DashboardProtection";

export default function RecruiterLayout({ children }) {
  return (
    <DashboardProtection allowedRole="RECRUITER" requireCompany={true}>
      <RecruiterDashboardShell>{children}</RecruiterDashboardShell>
    </DashboardProtection>
  );
}