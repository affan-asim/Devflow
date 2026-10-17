"use client";

import { useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterHeader from "./RecruiterHeader";

export default function RecruiterDashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <RecruiterSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <RecruiterHeader onMenu={() => setSidebarOpen(true)} />

        <div>{children}</div>
      </div>
    </div>
  );
}