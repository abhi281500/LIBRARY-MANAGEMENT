import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSubscription, upgradeSubscription } from "../../services/library.service.js";
import {
  Zap,
  CheckCircle2,
  Crown,
  Sparkles,
} from "lucide-react";

function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);

  const { data } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription,
  });

  const upgradeMutation = useMutation({
    mutationFn: upgradeSubscription,
    onSuccess: (res) => {
      toast.success(res.message || "Plan updated successfully!");
      setSelectedPlanForUpgrade(null);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update subscription");
    },
  });

  const sub = data?.subscription || {
    plan: "FREE",
    maxSeats: 30,
    currentSeats: 0,
    usagePercent: 0,
  };

  const currentPlan = sub.plan;

  const plans = [
    {
      id: "FREE",
      name: "Starter",
      tagline: "For small reading rooms & newly opened libraries",
      price: "₹0",
      period: "Forever free",
      badge: "Free Tier",
      badgeColor: "bg-gray-100 text-gray-700",
      features: [
        "Up to 30 Desks / Seats",
        "1 Library Location",
        "Standard Multi-Shift Allocations",
        "Basic Student Records",
        "Manual Cash / UPI Logging",
      ],
      limits: "Max 30 Seats",
      cta: "Current Plan",
      isCurrent: currentPlan === "FREE",
    },
    {
      id: "PRO",
      name: "Pro Growth",
      tagline: "For growing commercial study libraries & reading spaces",
      price: "₹999",
      period: "per month",
      badge: "⭐ Most Popular",
      badgeColor: "bg-blue-600 text-white font-bold",
      popular: true,
      features: [
        "Up to 500 Desks / Seats",
        "Visual Color-Coded Seat Map Grid",
        "Automated WhatsApp Expiry Alerts",
        "Printable PDF Fee Receipts with GST",
        "Month-over-Month Revenue Analytics",
        "Bulk 1-Click Seat Generator",
        "Priority Email & WhatsApp Support",
      ],
      limits: "Up to 500 Seats",
      cta: currentPlan === "PRO" ? "Active Plan" : "Upgrade to Pro",
      isCurrent: currentPlan === "PRO",
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise Multi-Branch",
      tagline: "For library chains with multiple branches & biometric gates",
      price: "₹2,499",
      period: "per month",
      badge: "Enterprise",
      badgeColor: "bg-purple-100 text-purple-800 font-bold",
      features: [
        "Unlimited Desks & Seats (5000+)",
        "Multi-Branch Centralized Admin",
        "Biometric / RFID Attendance API Sync",
        "Custom Logo & Library Digital Stamp",
        "Dedicated Account Manager",
        "Automated Hourly Background Cleanup",
        "Custom SMS & WhatsApp Sender ID",
      ],
      limits: "Unlimited Seats & Locations",
      cta: currentPlan === "ENTERPRISE" ? "Active Plan" : "Upgrade to Enterprise",
      isCurrent: currentPlan === "ENTERPRISE",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> StudySpace SaaS Plans
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Flexible Plans for Every Study Library
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Scale your library operations with shift-booking, automated WhatsApp reminders, and real-time seat tracking.
          </p>
        </div>

        {/* USAGE QUOTA CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Your Current Subscription</h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentPlan === "FREE"
                      ? "bg-gray-100 text-gray-700"
                      : currentPlan === "PRO"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {currentPlan} PLAN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Seat utilization and active capacity for your enrolled library.
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-2xl font-black text-slate-900">
                {sub.currentSeats}{" "}
                <span className="text-sm font-semibold text-slate-400">/ {sub.maxSeats} Seats</span>
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Capacity Allocated</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-600">Seat Quota Usage</span>
              <span className={sub.usagePercent > 80 ? "text-amber-600" : "text-blue-600"}>
                {sub.usagePercent}% Used
              </span>
            </div>
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  sub.usagePercent >= 90
                    ? "bg-rose-500"
                    : sub.usagePercent >= 70
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{ width: `${Math.min(100, sub.usagePercent)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* PRICING CARDS */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => {
            const isPro = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all ${
                  isPro
                    ? "bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 scale-100 md:-translate-y-2"
                    : "bg-white border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.tagline}</p>

                  <div className="my-6">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1.5">{plan.period}</span>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Includes:
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isPro ? "text-blue-600" : "text-emerald-600"
                          }`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {plan.isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs tracking-wider uppercase cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedPlanForUpgrade(plan)}
                      className={`w-full py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm ${
                        plan.id === "PRO"
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                          : plan.id === "ENTERPRISE"
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-slate-800 hover:bg-slate-900 text-white"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CONFIRM UPGRADE MODAL */}
        {selectedPlanForUpgrade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Confirm Subscription Change
                </h3>
                <button
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-slate-600">
                <p className="text-sm text-slate-800">
                  You are switching your library subscription to the{" "}
                  <strong className="text-blue-600 font-bold">
                    {selectedPlanForUpgrade.name} ({selectedPlanForUpgrade.price})
                  </strong>
                  .
                </p>

                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 space-y-1">
                  <p className="font-bold text-blue-900">Plan Highlights:</p>
                  <p>• {selectedPlanForUpgrade.limits}</p>
                  <p>• Instant activation with zero downtime</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpgrade(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={upgradeMutation.isPending}
                  onClick={() =>
                    upgradeMutation.mutate({
                      plan: selectedPlanForUpgrade.id,
                    })
                  }
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {upgradeMutation.isPending ? "Activating..." : "Confirm & Activate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionPage;