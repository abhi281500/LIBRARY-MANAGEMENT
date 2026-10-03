import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getPlatformOverview,
  getAllTenants,
  updateTenantPlan,
  toggleTenantStatus,
  impersonateTenant,
} from "../../services/superadmin.service.js";
import ConfirmDialog from "../../components/feedback/ConfirmDialog.jsx";
import {
  Crown,
  Building2,
  DollarSign,
  Users,
  Armchair,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  LogIn,
  ShieldCheck,
  Zap,
  Activity,
  Calendar,
  Phone,
  Mail,
  RotateCw,
  Sparkles,
  BarChart3,
  Layers,
  ExternalLink,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [impersonatingTenant, setImpersonatingTenant] = useState(null);
  const [showImpersonateDialog, setShowImpersonateDialog] = useState(false);

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isSuperAdmin = storedUser?.role === "SUPER_ADMIN";

  // 1. Fetch Platform SaaS Overview Metrics
  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ["superadmin-overview"],
    queryFn: getPlatformOverview,
    enabled: isSuperAdmin,
  });

  // 2. Fetch All Tenants
  const { data: tenantsData, isLoading: isTenantsLoading, refetch: refetchTenants } = useQuery({
    queryKey: ["superadmin-tenants", planFilter, statusFilter, searchQuery],
    queryFn: () =>
      getAllTenants({
        plan: planFilter,
        status: statusFilter,
        search: searchQuery,
      }),
  });

  const metrics = overviewData?.metrics || {
    totalLibraries: 0,
    activeLibraries: 0,
    suspendedLibraries: 0,
    totalStudents: 0,
    totalSeats: 0,
    totalBookings: 0,
    platformGMV: 0,
    estimatedMRR: 0,
    planCounts: { FREE: 0, PRO: 0, ENTERPRISE: 0 },
  };

  const tenants = tenantsData?.tenants || [];

  // Mutations
  const planMutation = useMutation({
    mutationFn: updateTenantPlan,
    onSuccess: (res) => {
      toast.success(res.message || "Plan updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["superadmin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenants"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update plan");
    },
  });

  const statusMutation = useMutation({
    mutationFn: toggleTenantStatus,
    onSuccess: (res) => {
      toast.success(res.message || "Status updated!");
      queryClient.invalidateQueries({ queryKey: ["superadmin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenants"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: impersonateTenant,
    onSuccess: (res) => {
      toast.success(`Switched session to ${res.user?.name}'s library!`);
      // Store token and redirect
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("isImpersonating", "true");
        window.location.href = "/dashboard";
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to impersonate tenant");
    },
  });

  const handlePlanChange = (tenantId, newPlan) => {
    planMutation.mutate({ id: tenantId, plan: newPlan });
  };

  const handleToggleStatus = (tenant) => {
    const newStatus = tenant.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    statusMutation.mutate({ id: tenant._id, status: newStatus });
  };

  const handleConfirmImpersonate = () => {
    if (!impersonatingTenant?._id) return;
    impersonateMutation.mutate(impersonatingTenant._id);
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const getPlanBadge = (plan) => {
    switch (plan) {
      case "ENTERPRISE":
        return { label: "ENTERPRISE", bg: "bg-purple-100 text-purple-800 border-purple-300" };
      case "PRO":
        return { label: "PRO PLAN", bg: "bg-blue-100 text-blue-800 border-blue-300" };
      case "FREE":
      default:
        return { label: "FREE TIER", bg: "bg-slate-100 text-slate-700 border-slate-300" };
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Super Admin Node Protected</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              You are currently logged in as <strong>{storedUser?.name || "Library Owner"}</strong> ({storedUser?.role || "LIBRARY_OWNER"}).
              This terminal is restricted to platform super administrators.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              Switch Account
            </button>
            <button
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isOverviewLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-400">Loading SaaS Super Admin Command Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Super Admin Top Command Banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                <Crown className="w-3 h-3" /> Super Admin Command Center
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Master Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              StudySpace SaaS Platform Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Multi-tenant overview, live MRR revenue, customer support impersonation, and plan overrides.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchOverview();
                refetchTenants();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 border border-slate-800 hover:bg-slate-800 transition-all"
            >
              <RotateCw className="w-4 h-4 text-slate-400" />
              Refresh Node
            </button>
          </div>
        </div>

        {/* 1. TOP SAAS EXECUTIVE KPIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Libraries */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Libraries</span>
              <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-400 border border-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {metrics.totalLibraries}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                {metrics.activeLibraries} Active
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">{metrics.suspendedLibraries} suspended/inactive</p>
          </div>

          {/* Monthly Recurring Revenue (MRR) */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Platform MRR</span>
              <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-400 border border-amber-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400">
                {formatCurrency(metrics.estimatedMRR)}
              </span>
              <span className="text-[10px] font-bold text-amber-200">/ month</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">SaaS Subscription Recurring Revenue</p>
          </div>

          {/* Total Students */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Students Managed</span>
              <div className="rounded-xl bg-indigo-500/20 p-2.5 text-indigo-400 border border-indigo-500/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {metrics.totalStudents.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-indigo-400">Across India</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Cumulative enrolled student records</p>
          </div>

          {/* Total Desks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Desks Connected</span>
              <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400 border border-emerald-500/30">
                <Armchair className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {metrics.totalSeats.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400">{metrics.totalBookings} Bookings</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Total physical reading desks registered</p>
          </div>

        </div>

        {/* 2. PLAN DISTRIBUTION & PLATFORM GMV */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Plan Distribution (6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">SaaS Subscription Distribution</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{metrics.totalLibraries} Total Tenants</span>
            </div>

            <div className="space-y-3.5">
              {/* FREE Tier */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-300">Free Tier (Max 30 seats)</span>
                  <span className="font-mono text-slate-400">{metrics.planCounts?.FREE || 0} libraries</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalLibraries > 0
                          ? ((metrics.planCounts?.FREE || 0) / metrics.totalLibraries) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* PRO Tier */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-blue-400">Pro Plan (₹499/mo)</span>
                  <span className="font-mono text-blue-300 font-bold">{metrics.planCounts?.PRO || 0} libraries</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalLibraries > 0
                          ? ((metrics.planCounts?.PRO || 0) / metrics.totalLibraries) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* ENTERPRISE Tier */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-purple-400">Enterprise Plan (₹1,499/mo)</span>
                  <span className="font-mono text-purple-300 font-bold">{metrics.planCounts?.ENTERPRISE || 0} libraries</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${
                        metrics.totalLibraries > 0
                          ? ((metrics.planCounts?.ENTERPRISE || 0) / metrics.totalLibraries) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform GMV & Transaction Health (6 Cols) */}
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Platform Transaction Volume (GMV)</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Total Fees Processed
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Total Student Fees Handled
                </p>
                <p className="text-3xl font-black text-emerald-400">
                  {formatCurrency(metrics.platformGMV)}
                </p>
                <p className="text-xs text-slate-500">
                  Cumulative student subscriptions processed across all onboarded libraries.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Platform Health Check:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> 100% Operational
              </span>
            </div>
          </div>

        </div>

        {/* 3. TENANT LIBRARIES MANAGEMENT TABLE */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-950/40">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[240px] max-w-sm">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by library, address, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-amber-400"
                />
              </div>

              {/* Plan Filter */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs sm:text-sm font-semibold text-slate-200 outline-none focus:border-amber-400"
              >
                <option value="ALL">All SaaS Plans</option>
                <option value="FREE">Free Tier</option>
                <option value="PRO">Pro Plan</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs sm:text-sm font-semibold text-slate-200 outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Suspended / Inactive</option>
              </select>
            </div>

            <span className="text-xs font-bold text-slate-400">
              {tenants.length} Tenant Libraries Registered
            </span>
          </div>

          {/* Table */}
          {isTenantsLoading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">
              Loading tenant database...
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-300">No Libraries Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                No tenant libraries match your active search filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-5">Library & Location</th>
                    <th className="py-3.5 px-4">Owner Contact</th>
                    <th className="py-3.5 px-4">Scale & Occupancy</th>
                    <th className="py-3.5 px-4">SaaS Tier Override</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-5 text-right">Support Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {tenants.map((t) => {
                    const owner = t.owner || {};
                    const planInfo = getPlanBadge(t.subscription);

                    return (
                      <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Library & Location */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 font-black text-white flex items-center justify-center text-sm shadow-md">
                              {t.name?.charAt(0) || "L"}
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{t.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-[200px]">
                                {t.address || "No address provided"}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Onboarded: {formatDate(t.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner Contact */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-200">{owner.name || "Unknown Owner"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {owner.email || "N/A"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {t.phone || owner.phone || "N/A"}
                          </p>
                        </td>

                        {/* Scale & Metrics */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <p className="font-bold text-white flex items-center gap-1">
                              <Armchair className="w-3.5 h-3.5 text-blue-400" />
                              {t.seatsCount || t.totalSeats || 0} Desks Capacity
                            </p>
                            <p className="text-[11px] text-slate-400">
                              👥 {t.studentsCount || 0} Students • {t.activeBookingsCount || 0} Active
                            </p>
                          </div>
                        </td>

                        {/* Plan Dropdown Override */}
                        <td className="py-3.5 px-4">
                          <select
                            value={t.subscription || "FREE"}
                            onChange={(e) => handlePlanChange(t._id, e.target.value)}
                            disabled={planMutation.isPending}
                            className={`rounded-lg py-1 px-2.5 text-xs font-bold border outline-none cursor-pointer ${
                              t.subscription === "ENTERPRISE"
                                ? "bg-purple-950 text-purple-300 border-purple-500/50"
                                : t.subscription === "PRO"
                                ? "bg-blue-950 text-blue-300 border-blue-500/50"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            <option value="FREE">FREE TIER (30 Seats)</option>
                            <option value="PRO">PRO (500 Seats)</option>
                            <option value="ENTERPRISE">ENTERPRISE (Unlimited)</option>
                          </select>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(t)}
                            disabled={statusMutation.isPending}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-all ${
                              t.status === "ACTIVE"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900"
                                : "bg-rose-950 text-rose-400 border-rose-500/40 hover:bg-rose-900"
                            }`}
                            title="Click to Toggle Active / Suspended"
                          >
                            {t.status === "ACTIVE" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {t.status === "ACTIVE" ? "Active" : "Suspended"}
                          </button>
                        </td>

                        {/* Super Admin Support Impersonation Action */}
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setImpersonatingTenant(t);
                              setShowImpersonateDialog(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-xs"
                            title="Log In As Library Owner to Help"
                          >
                            <LogIn className="w-3.5 h-3.5" /> Impersonate
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* Impersonation Confirmation Modal */}
      <ConfirmDialog
        open={showImpersonateDialog}
        title={`Log In As Owner (${impersonatingTenant?.name})?`}
        message={`You will enter the live library dashboard for "${impersonatingTenant?.name}" as owner ${
          impersonatingTenant?.owner?.name || ""
        }. You can troubleshoot issues directly.`}
        confirmText="Launch Workspace"
        cancelText="Cancel"
        onConfirm={handleConfirmImpersonate}
        onCancel={() => {
          setShowImpersonateDialog(false);
          setImpersonatingTenant(null);
        }}
        isLoading={impersonateMutation.isPending}
      />
    </div>
  );
}
