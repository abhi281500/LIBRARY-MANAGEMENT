import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSubscription } from "../../services/library.service.js";
import { Sparkles, Crown } from "lucide-react";

function Topbar() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription,
    staleTime: 5 * 60 * 1000,
  });

  const plan = data?.subscription?.plan || "FREE";
  const isPro = plan === "PRO" || plan === "ENTERPRISE";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Library Management</h2>
        <p className="text-xs text-gray-500">Manage your study library efficiently</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Subscription Plan Badge */}
        <Link
          to="/subscription"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
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
              <span>FREE • Upgrade</span>
            </>
          )}
        </Link>

        {/* Profile & Logout */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;