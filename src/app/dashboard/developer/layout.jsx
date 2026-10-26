import DeveloperDashboardShell from "@/components/developer-dashboard/layout/DeveloperDashboardShell";
import DashboardProtection from "@/components/auth/DashboardProtection";

export default function DeveloperDashboardLayout({ children }) {
  return (
    <DashboardProtection allowedRole="DEVELOPER">
      <DeveloperDashboardShell>
        {children}
      </DeveloperDashboardShell>
    </DashboardProtection>
  );
}