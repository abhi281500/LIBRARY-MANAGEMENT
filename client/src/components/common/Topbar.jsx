import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSubscription } from "../../services/library.service.js";
import {
  Sparkles,
  Crown,
  UserPlus,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Menu,
} from "lucide-react";
import QuickAdmissionModal from "./QuickAdmissionModal.jsx";

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const [showQuickAdmission, setShowQuickAdmission] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(storedUser);
      setIsImpersonating(localStorage.getItem("isImpersonating") === "true");
    } catch (e) {
      // ignore
    }
  }, []);

  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription,
    staleTime: 5 * 60 * 1000,
  });

  const plan = data?.subscription?.plan || "FREE";
  const isPro = plan === "PRO" || plan === "ENTERPRISE";

  const handleExitImpersonation = () => {
    localStorage.removeItem("isImpersonating");
    window.location.href = "/super-admin";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* Impersonation Warning Header */}
      {isImpersonating && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black flex items-center justify-between shadow-md z-40 relative">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>
              SUPPORT MODE: You are currently viewing this library as owner (<strong>{currentUser?.name}</strong>).
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="inline-flex items-center gap-1 bg-slate-950 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit to Super Admin
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6 shadow-xs">
        
        {/* Left: Mobile Hamburger + Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Drawer Toggle */}
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
              StudySpace <span className="text-xs text-blue-600 font-semibold">• Library OS</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-500 hidden sm:block">
              Desk Management, Attendance & Financial Intelligence
            </p>
          </div>
        </div>

        {/* Right: Quick Actions & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Super Admin Shortcut */}
          {(currentUser?.role === "SUPER_ADMIN" || isImpersonating) && (
            <Link
              to="/super-admin"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black shadow-xs transition-all border border-amber-500/30"
              title="Super Admin SaaS Command Center"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Command Center</span>
            </Link>
          )}

          {/* Quick Admission Button */}
          <button
            type="button"
            onClick={() => setShowQuickAdmission(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Quick Admission</span>
            <span className="sm:hidden">+ Enroll</span>
          </button>

          {/* Subscription Plan Badge */}
          <Link
            to="/subscription"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
              isPro
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
          >
            {isPro ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{plan} PLAN</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>FREE</span>
              </>
            )}
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <QuickAdmissionModal
        open={showQuickAdmission}
        onClose={() => setShowQuickAdmission(false)}
      />
    </>
  );
}

export default Topbar;