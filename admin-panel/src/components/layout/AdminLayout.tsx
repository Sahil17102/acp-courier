import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeVarsStyle } from "@/theme";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
  const { mode } = useTheme();
  const compactSidebar = sidebarCollapsed && !sidebarHoverExpanded;

  return (
    <div
      className="min-h-screen bg-background flex"
      style={getThemeVarsStyle(mode)}
      data-theme={mode}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={compactSidebar}
        onCollapsedHoverChange={setSidebarHoverExpanded}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onMobileMenuOpen={() => setMobileOpen(true)}
          sidebarCollapsed={compactSidebar}
          onToggleSidebar={() => {
            setSidebarHoverExpanded(false);
            setSidebarCollapsed((c) => !c);
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
