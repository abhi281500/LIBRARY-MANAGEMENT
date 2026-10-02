import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import Topbar from "../components/common/Topbar.jsx";
import PWAInstallPrompt from "../components/common/PWAInstallPrompt.jsx";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Responsive Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area (pl-0 on mobile, pl-64 on desktop) */}
      <div className="lg:pl-64 min-h-screen flex flex-col transition-all duration-300">
        
        {/* Topbar with Mobile Hamburger Trigger */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* PWA Home Screen Install Banner */}
        <PWAInstallPrompt />

      </div>

    </div>
  );
}

export default DashboardLayout;