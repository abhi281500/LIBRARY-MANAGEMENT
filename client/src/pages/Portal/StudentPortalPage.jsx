import React, { useState, useRef } from "react";
import { studentPortalLookup } from "../../services/portal.service";
import {
  GraduationCap,
  CreditCard,
  Clock,
  QrCode,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Armchair,
  X,
} from "lucide-react";

export default function StudentPortalPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'attendance', 'payments'
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Handle Lookup
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your registered phone number or admission ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await studentPortalLookup(identifier.trim());
      setData(res);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Student record not found. Please verify your phone number or admission ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  const student = data?.student;
  const library = data?.library || student?.library;
  const activeBooking = data?.activeBooking;
  const payments = data?.payments || [];
  const attendance = data?.attendance || { totalStudyHours: 0, daysPresent: 0, logs: [] };

  // Calculate validity days
  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = activeBooking ? calculateDaysRemaining(activeBooking.endDate) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-2">
                StudyOS <span className="text-xs bg-indigo-500/20 text-indigo-400 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">Student Portal</span>
              </h1>
              <p className="text-xs text-slate-400">Self-Service Desk, Pass & Attendance Ledger</p>
            </div>
          </div>

          {data && (
            <button
              onClick={() => {
                setData(null);
                setIdentifier("");
              }}
              className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition border border-slate-700"
            >
              Switch Account
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {!data ? (
          /* ============================================================ */
          /* 1. LOOKUP SCREEN (PORTAL LOGIN)                              */
          /* ============================================================ */
          <div className="max-w-md mx-auto my-6 md:my-12">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center mb-8 relative">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4">
                  <GraduationCap className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Student Self-Service</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Access your digital ID card, desk status, daily attendance & fee receipts instantly.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4 relative">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Phone Number, Admission ID, or Desk #
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210, ADM-102, or Seat 14"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Membership...</span>
                    </>
                  ) : (
                    <>
                      <span>Open Student Dashboard</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-500">
                  Secured by StudyOS • Contact your library administrator for admission queries
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* 2. STUDENT DASHBOARD SCREEN                                 */
          /* ============================================================ */
          <div className="space-y-6">
            {/* Student Hero Header Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl shadow-indigo-600/30 flex-shrink-0 border-2 border-indigo-400/30">
                    {student?.user?.name ? student.user.name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-xl md:text-2xl font-black text-white">
                        {student?.user?.name || "Student Member"}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {student?.admissionNumber || "ADM-N/A"}
                      </span>
                      {daysRemaining !== null && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            daysRemaining > 5
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : daysRemaining >= 0
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {daysRemaining > 0
                            ? `${daysRemaining} Days Left`
                            : daysRemaining === 0
                            ? "Expires Today"
                            : "Expired"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 flex items-center gap-3">
                      <span>🏛️ {library?.name || "Library Member"}</span>
                      <span>📞 {student?.user?.phone || student?.phone || "N/A"}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowIdCardModal(true)}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>View Smart ID Card</span>
                  </button>

                  {library?.upiId && (
                    <button
                      onClick={() => setShowUpiModal(true)}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay / Renew</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">Assigned Desk</span>
                <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-indigo-400" />
                  <span>{activeBooking?.seat?.seatNumber ? `Desk #${activeBooking.seat.seatNumber}` : "Flexi Desk"}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {activeBooking?.seat?.floor ? `Floor ${activeBooking.seat.floor}` : "Reserved"}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">Shift Timings</span>
                <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5 truncate">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{activeBooking?.slotName || "Full Day Access"}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {library?.openTime && library?.closeTime
                    ? `${library.openTime} - ${library.closeTime}`
                    : "Standard Shift"}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">30-Day Study Focus</span>
                <div className="text-xl font-bold text-indigo-400 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5" />
                  <span>{attendance.totalStudyHours} hrs</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {attendance.daysPresent} active days logged
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400 font-medium">Plan Validity</span>
                <div className="text-sm font-bold text-emerald-400 mt-1.5 truncate">
                  {activeBooking?.endDate
                    ? new Date(activeBooking.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Active Member"}
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {daysRemaining !== null && daysRemaining >= 0 ? `${daysRemaining} days remaining` : "Renewal due"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-px">
              {[
                { id: "overview", label: "Overview & Pass", icon: GraduationCap },
                { id: "attendance", label: "Study Attendance", icon: Clock },
                { id: "payments", label: "Fee Ledger & Receipts", icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
                      isActive
                        ? "bg-slate-900 text-indigo-400 border-t-2 border-indigo-500 border-x border-slate-800"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Desk & Plan Summary */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span>🪪</span> Active Membership Pass
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-slate-800 text-xs">
                        <span className="text-slate-400">Student Name</span>
                        <span className="font-semibold text-white">{student?.user?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-xs">
                        <span className="text-slate-400">Admission ID</span>
                        <span className="font-mono font-semibold text-indigo-400">
                          {student?.admissionNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-xs">
                        <span className="text-slate-400">Allocated Seat</span>
                        <span className="font-semibold text-white">
                          {activeBooking?.seat?.seatNumber ? `Desk #${activeBooking.seat.seatNumber}` : "Flexible Desk"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-xs">
                        <span className="text-slate-400">Plan Start Date</span>
                        <span className="font-semibold text-white">
                          {activeBooking?.startDate
                            ? new Date(activeBooking.startDate).toLocaleDateString("en-IN")
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 text-xs">
                        <span className="text-slate-400">Valid Till</span>
                        <span className="font-semibold text-emerald-400">
                          {activeBooking?.endDate
                            ? new Date(activeBooking.endDate).toLocaleDateString("en-IN")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Library Facilities Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400" /> Library Contact & Amenities
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {library?.address || "Address not provided by library"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">📶 High-Speed WiFi</span>
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">❄️ Air Conditioned</span>
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">🔋 Personal Power Socket</span>
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300">☕ RO Water & Beverages</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Quick ID Card Preview */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-900/50 rounded-2xl p-5 text-center">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-3">
                      Smart QR Pass
                    </h4>
                    <div className="w-36 h-36 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          student?.admissionNumber || student?.user?.phone || "STUDENT"
                        )}`}
                        alt="QR Pass"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3">
                      Scan at entry scanner gun for automated check-in
                    </p>
                    <button
                      onClick={() => setShowIdCardModal(true)}
                      className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" /> Download / Print ID
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" /> Recent Study Sessions (Last 30 Days)
                  </h3>
                  <span className="text-xs text-slate-400">Total: {attendance.totalStudyHours} Hours</span>
                </div>

                {attendance.logs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No attendance sessions logged in the last 30 days.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Desk #</th>
                          <th className="py-2.5 px-3">Check-In</th>
                          <th className="py-2.5 px-3">Check-Out</th>
                          <th className="py-2.5 px-3 text-right">Study Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {attendance.logs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-3 text-slate-200 font-medium">
                              {new Date(log.date || log.checkIn).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {log.seat?.seatNumber ? `Desk #${log.seat.seatNumber}` : "General"}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {log.checkOut ? (
                                new Date(log.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              ) : (
                                <span className="text-emerald-400 font-medium animate-pulse">In Progress</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-indigo-400">
                              {log.durationMinutes ? `${(log.durationMinutes / 60).toFixed(1)} hrs` : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Fee Receipts & Payment History
                  </h3>
                  {library?.upiId && (
                    <button
                      onClick={() => setShowUpiModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>Pay Next Month Fee</span>
                    </button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No payment receipts found for this account.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Receipt / Invoice</th>
                          <th className="py-2.5 px-3">Payment Mode</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {payments.map((p) => (
                          <tr key={p._id} className="hover:bg-slate-800/30">
                            <td className="py-3 px-3 text-slate-300">
                              {new Date(p.paymentDate || p.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-400">
                              {p.transactionId || `REC-${p._id.slice(-6).toUpperCase()}`}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                                {p.paymentMode || "UPI"}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {p.status || "COMPLETED"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-white text-sm">
                              ₹{p.amount?.toLocaleString("en-IN") || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 3. MODAL: DIGITAL PVC SMART ID CARD PREVIEW & PRINT          */}
      {/* ============================================================ */}
      {showIdCardModal && student && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" /> Digital Student Smart ID Pass
              </h3>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PVC Card Render */}
            <div className="w-full bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-950 p-5 rounded-2xl border border-indigo-500/40 shadow-2xl relative overflow-hidden text-white">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 mb-4">
                <div>
                  <h4 className="font-black text-sm tracking-tight">{library?.name || "Study Library"}</h4>
                  <p className="text-[10px] text-indigo-300">Authorized Student Member Pass</p>
                </div>
                <span className="text-[10px] font-mono bg-indigo-500/30 px-2 py-0.5 rounded border border-indigo-400/40">
                  {student?.admissionNumber || "ADM-N/A"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-black shadow-md flex-shrink-0">
                  {student?.user?.name ? student.user.name.charAt(0).toUpperCase() : "S"}
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-base leading-tight">{student?.user?.name || "Student Member"}</h5>
                  <p className="text-xs text-indigo-200">Desk: {activeBooking?.seat?.seatNumber ? `#${activeBooking.seat.seatNumber}` : "General Pass"}</p>
                  <p className="text-[11px] text-slate-400">Phone: {student?.user?.phone || student?.phone || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-500/30 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Valid Until</p>
                  <p className="text-xs font-bold text-emerald-400">
                    {activeBooking?.endDate
                      ? new Date(activeBooking.endDate).toLocaleDateString("en-IN")
                      : "Permanent"}
                  </p>
                </div>

                <div className="w-12 h-12 bg-white p-1 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      student?.admissionNumber || student?.user?.phone || "STUDENT"
                    )}`}
                    alt="QR"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Print & Close */}
            <div className="flex gap-3">
              <button
                onClick={handlePrintCard}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setShowIdCardModal(false)}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. MODAL: 1-CLICK UPI QUICK RENEWAL                          */}
      {/* ============================================================ */}
      {showUpiModal && library?.upiId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-600/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">Direct UPI Fee Payment</h3>
              <p className="text-xs text-slate-400 mt-1">Scan or tap below to pay directly to library account</p>
            </div>

            <div className="w-44 h-44 bg-white p-2 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `upi://pay?pa=${library.upiId}&pn=${encodeURIComponent(
                    library.name || "Library"
                  )}&cu=INR`
                )}`}
                alt="UPI QR"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
              <span className="text-slate-400 block text-[10px]">Official UPI ID:</span>
              <span className="font-mono font-bold text-emerald-400">{library.upiId}</span>
            </div>

            <a
              href={`upi://pay?pa=${library.upiId}&pn=${encodeURIComponent(
                library.name || "Library"
              )}&cu=INR`}
              className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
            >
              Open in GPay / PhonePe / Paytm
            </a>

            <button
              onClick={() => setShowUpiModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
