"use client";

import { useState } from "react";

import DeveloperSidebar from "./DeveloperSidebar";
import DeveloperHeader from "./DeveloperHeader";

export default function DeveloperDashboardShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  

  return (
    <div className="min-h-screen bg-[var(--df-paper)] text-[var(--df-text)]">
      <DeveloperSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[250px]">
        <DeveloperHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}