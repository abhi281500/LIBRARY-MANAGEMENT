import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar.jsx";
import Topbar from "../components/common/Topbar.jsx";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      
      <Sidebar />

      <div className="ml-64 min-h-screen">
        
        <Topbar />

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;