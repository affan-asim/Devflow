import DeveloperDashboardShell from "@/components/developer-dashboard/layout/DeveloperDashboardShell";

export default function DeveloperDashboardLayout({ children }) {
  return (
    <DeveloperDashboardShell>
      {children}
    </DeveloperDashboardShell>
  );
}