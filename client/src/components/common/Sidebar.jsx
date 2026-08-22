import { NavLink } from "react-router-dom";

function Sidebar() {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Students",
      path: "/students",
    },
    {
      label: "Seats",
      path: "/seats",
    },
    {
      label: "Bookings",
      path: "/bookings",
    },
    {
      label: "Payments",
      path: "/payments",
    },
    {
      label: "Library",
      path: "/libraries",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-slate-900 text-white">
      
      {/* Logo */}
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-xl font-bold">
          LibraryManager
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Library Management System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-xs text-slate-500">
          Library Management
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;