import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSubscription, upgradeSubscription } from "../../services/library.service.js";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../../services/payment.service.js";
import { loadRazorpayScript } from "../../utils/razorpayLoader.js";
import {
  Zap,
  CheckCircle2,
  Crown,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Building2,
  ArrowRight,
  Armchair,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState("MONTHLY"); // MONTHLY | YEARLY
  const [isProcessingPlan, setIsProcessingPlan] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription,
  });

  // Direct upgrade mutation (fallback / admin bypass)
  const upgradeMutation = useMutation({
    mutationFn: upgradeSubscription,
    onSuccess: (res) => {
      toast.success(res.message || "Plan updated successfully!");
      setIsProcessingPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["myLibrary"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update subscription");
      setIsProcessingPlan(null);
    },
  });

  const sub = data?.subscription || {
    plan: "FREE",
    maxSeats: 30,
    currentSeats: 0,
    usagePercent: 0,
  };

  const currentPlan = sub.plan;

  // Razorpay Checkout Trigger
  const handleUpgradeCheckout = async (planId) => {
    if (planId === currentPlan) return;

    if (planId === "FREE") {
      upgradeMutation.mutate({ plan: "FREE" });
      return;
    }

    setIsProcessingPlan(planId);

    try {
      // 1. Create order on backend
      const orderData = await createSubscriptionOrder({
        plan: planId,
        billingCycle,
      });

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded || !window.Razorpay || orderData.keyId.includes("placeholder")) {
        // Fallback to direct instant test upgrade
        toast("Running in test environment. Activating plan immediately...", { icon: "⚡" });
        await verifySubscriptionPayment({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: "mock_signature",
          plan: planId,
          billingCycle,
        });

        toast.success(`🎉 Congratulations! Upgraded to ${planId} Plan!`);
        setIsProcessingPlan(null);
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        return;
      }

      // 3. Open Official Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "StudySpace SaaS",
        description: `${planId} Plan Subscription (${billingCycle})`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || "",
          email: orderData.user?.email || "",
          contact: orderData.user?.phone || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          try {
            await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
              billingCycle,
            });

            toast.success(`🎉 Upgraded to ${planId} Plan successfully!`);
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
          } catch (verifyErr) {
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPlan(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      setIsProcessingPlan(null);
    }
  };

  const plans = [
    {
      id: "FREE",
      name: "Starter Free",
      tagline: "For small reading rooms & newly opened local libraries",
      priceMonthly: 0,
      priceYearly: 0,
      badge: "Free Tier",
      badgeColor: "bg-slate-100 text-slate-700",
      features: [
        "Up to 30 Desks / Seats Capacity",
        "1 Library Location",
        "Standard Multi-Shift Allocations",
        "Basic Student Directory",
        "Manual Cash & UPI Ledger",
      ],
      limits: "Max 30 Seats",
      cta: "Current Plan",
      isCurrent: currentPlan === "FREE",
    },
    {
      id: "PRO",
      name: "Pro Growth",
      tagline: "For commercial study libraries wanting full automation",
      priceMonthly: 499,
      priceYearly: 4999,
      badge: "⭐ Most Popular",
      badgeColor: "bg-blue-600 text-white font-bold",
      popular: true,
      features: [
        "Up to 500 Desks / Seats",
        "Visual Color-Coded Seat Map Grid",
        "Automated WhatsApp Renewal Reminders",
        "Daily Expenses & Net Operating Profit (P&L)",
        "Live QR Attendance & Check-In/Out",
        "Digital Smart Student ID Card Generator",
        "Priority Support on WhatsApp",
      ],
      limits: "Up to 500 Seats",
      cta: currentPlan === "PRO" ? "Active Plan" : "Upgrade to Pro",
      isCurrent: currentPlan === "PRO",
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise Multi-Branch",
      tagline: "For library chains with multiple branches & high volume",
      priceMonthly: 1499,
      priceYearly: 14999,
      badge: "Enterprise",
      badgeColor: "bg-purple-100 text-purple-800 font-bold",
      features: [
        "Unlimited Desks & Seats (5,000+)",
        "Multi-Branch Centralized Admin Access",
        "Custom Logo & Library Watermark Seal",
        "Dedicated Account & Onboarding Manager",
        "Automated Hourly Background Worker Cleanup",
        "Custom WhatsApp Sender ID Integration",
        "VIP 24/7 Phone Support",
      ],
      limits: "Unlimited Seats",
      cta: currentPlan === "ENTERPRISE" ? "Active Plan" : "Upgrade to Enterprise",
      isCurrent: currentPlan === "ENTERPRISE",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-600">Loading Subscription Plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> SaaS Plan Quotas & Upgrades
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Simple, Transparent Pricing for Library Owners
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Automate seat booking, WhatsApp reminders, daily expenses, and student attendance.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-2xl bg-slate-200/80 mt-2">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                billingCycle === "MONTHLY"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("YEARLY")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                billingCycle === "YEARLY"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual Billing <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 rounded-md">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Current Plan Utilization Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Subscription</span>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                {currentPlan} PLAN
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Seat Capacity Usage</p>
                <p className="text-base font-black text-slate-800 mt-0.5">
                  {sub.currentSeats} of {sub.maxSeats} Desks ({sub.usagePercent}%)
                </p>
              </div>

              <div className="w-36 hidden md:block">
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.usagePercent > 90
                        ? "bg-rose-500"
                        : sub.usagePercent > 70
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(sub.usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((p) => {
            const price = billingCycle === "MONTHLY" ? p.priceMonthly : p.priceYearly;
            const periodText =
              p.id === "FREE"
                ? "Forever Free"
                : billingCycle === "MONTHLY"
                ? "per month"
                : "per year (billed annually)";

            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  p.popular
                    ? "bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white shadow-2xl border-2 border-blue-500 ring-4 ring-blue-500/20"
                    : "bg-white text-slate-900 shadow-sm border border-slate-200 hover:shadow-md"
                }`}
              >
                {/* Popular Pill */}
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    ⭐ MOST POPULAR CHOICE
                  </div>
                )}

                <div>
                  {/* Top Tier Title & Tagline */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight">{p.name}</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${p.badgeColor}`}>
                      {p.limits}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${p.popular ? "text-slate-400" : "text-slate-500"}`}>
                    {p.tagline}
                  </p>

                  {/* Pricing Display */}
                  <div className="mt-6 border-y py-4 border-slate-100/10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <span className={`text-xs ${p.popular ? "text-slate-400" : "text-slate-500"}`}>
                        {periodText}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-6 space-y-3">
                    <p className={`text-[11px] font-bold uppercase tracking-wider ${p.popular ? "text-blue-400" : "text-slate-400"}`}>
                      What's included:
                    </p>
                    {p.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            p.popular ? "text-emerald-400" : "text-blue-600"
                          }`}
                        />
                        <span className={p.popular ? "text-slate-200" : "text-slate-700"}>
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checkout CTA Button */}
                <div className="mt-8 pt-4 border-t border-slate-100/10">
                  <button
                    type="button"
                    disabled={p.isCurrent || isProcessingPlan === p.id}
                    onClick={() => handleUpgradeCheckout(p.id)}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                      p.isCurrent
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : p.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                    }`}
                  >
                    {isProcessingPlan === p.id ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Processing...
                      </span>
                    ) : p.isCurrent ? (
                      "Current Active Plan"
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {p.cta}
                      </>
                    )}
                  </button>

                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Instant activation via Razorpay UPI & Cards</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}