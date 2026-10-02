import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Armchair,
  CalendarCheck,
  CreditCard,
  Receipt,
  Building2,
  Crown,
  Sparkles,
  MessageSquare,
  UserCheck,
  X,
} from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Live Attendance",
      path: "/attendance",
      icon: UserCheck,
      badge: "LIVE",
    },
    {
      label: "Students",
      path: "/students",
      icon: Users,
    },
    {
      label: "Seats Matrix",
      path: "/seats",
      icon: Armchair,
    },
    {
      label: "Bookings",
      path: "/bookings",
      icon: CalendarCheck,
    },
    {
      label: "Fee Payments",
      path: "/payments",
      icon: CreditCard,
    },
    {
      label: "Expenses & P&L",
      path: "/expenses",
      icon: Receipt,
    },
    {
      label: "WhatsApp Alerts",
      path: "/settings/whatsapp",
      icon: MessageSquare,
    },
    {
      label: "Library Info",
      path: "/libraries",
      icon: Building2,
    },
    {
      label: "Plan & Quota",
      path: "/subscription",
      icon: Crown,
    },
    {
      label: "Student Portal",
      path: "/portal",
      icon: Users,
      badge: "PWA",
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-slate-900 text-white shadow-2xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="border-b border-slate-800/80 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-600/30">
              L
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                StudySpace <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">SaaS</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                Library Operating System
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management Console
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                      item.badge === "LIVE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Smart Automation Status */}
        <div className="border-t border-slate-800/80 p-4 bg-slate-950/40">
          <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">StudySpace OS</p>
                <p className="text-[10px] text-slate-400">PWA & Multi-tenant</p>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;